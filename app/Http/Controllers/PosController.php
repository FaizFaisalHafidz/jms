<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use App\Models\Barang;
use App\Models\StokCabang;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class PosController extends Controller
{
    /**
     * Display POS interface
     */
    public function index()
    {
        $user = Auth::user();
        $cabang = Cabang::find($user->cabang_id);
        
        // Debug
        Log::info('POS Index - Cabang Data:', [
            'cabang_id' => $user->cabang_id,
            'cabang' => $cabang ? $cabang->toArray() : null,
        ]);
        
        return Inertia::render('pos/index', [
            'cabang_id' => $user->cabang_id,
            'cabang_nama' => $cabang ? $cabang->nama_cabang : 'Toko',
            'cabang_alamat' => $cabang ? $cabang->alamat : '',
            'cabang_telepon' => $cabang ? $cabang->telepon : '',
        ]);
    }

    /**
     * Search barang by keyword (kode or nama)
     */
    public function searchBarang(Request $request)
    {
        $keyword = $request->keyword;
        $cabangId = Auth::user()->cabang_id;

        $barang = Barang::with(['stokCabang' => function ($query) use ($cabangId) {
                $query->where('cabang_id', $cabangId);
            }])
            ->where('status_aktif', true)
            ->where(function ($query) use ($keyword) {
                $query->where('kode_barang', 'LIKE', "%{$keyword}%")
                    ->orWhere('nama_barang', 'LIKE', "%{$keyword}%")
                    ->orWhere('barcode', $keyword);
            })
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $stok = $item->stokCabang->first();
                return [
                    'id' => $item->id,
                    'kode_barang' => $item->kode_barang,
                    'nama_barang' => $item->nama_barang,
                    'barcode' => $item->barcode,
                    'harga_asal' => $item->harga_asal,
                    'harga_konsumen' => $item->harga_konsumen,
                    'harga_konter' => $item->harga_konter,
                    'satuan' => $item->satuan,
                    'stok' => $stok ? $stok->jumlah_stok : 0,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $barang,
        ]);
    }

    /**
     * Generate nomor transaksi otomatis
     */
    private function generateNomorTransaksi(): string
    {
        $date = Carbon::now();
        $prefix = 'TRX-' . $date->format('Ymd') . '-';
        
        $lastTransaksi = Transaksi::where('nomor_transaksi', 'LIKE', $prefix . '%')
            ->orderBy('nomor_transaksi', 'desc')
            ->first();
        
        if ($lastTransaksi) {
            preg_match('/-(\d+)$/', $lastTransaksi->nomor_transaksi, $matches);
            $lastNumber = isset($matches[1]) ? (int)$matches[1] : 0;
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Store new transaction
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jenis_transaksi' => 'required|in:retail,konter,service,faktur',
            'nama_pelanggan' => 'nullable|string|max:100',
            'telepon_pelanggan' => 'nullable|string|max:20',
            'metode_pembayaran' => 'required|in:tunai,transfer,qris,edc',
            'jumlah_bayar' => 'required|integer|min:0',
            'detail' => 'required|array|min:1',
            'detail.*.barang_id' => 'required|exists:barang,id',
            'detail.*.jumlah' => 'required|integer|min:1',
            'detail.*.harga_jual' => 'required|integer|min:0',
            'detail.*.jenis_harga' => 'required|in:konsumen,konter',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $cabangId = Auth::user()->cabang_id;
            
            // Calculate totals
            $subtotal = 0;
            $totalLaba = 0;

            foreach ($request->detail as $item) {
                $barang = Barang::find($item['barang_id']);
                $itemSubtotal = $item['jumlah'] * $item['harga_jual'];
                $itemLaba = ($item['harga_jual'] - $barang->harga_asal) * $item['jumlah'];
                
                $subtotal += $itemSubtotal;
                $totalLaba += $itemLaba;
            }

            $diskon = $request->diskon ?? 0;
            $biayaService = $request->biaya_service ?? 0;
            $totalBayar = $subtotal - $diskon + $biayaService;
            $kembalian = $request->jumlah_bayar - $totalBayar;

            // Create transaksi
            $transaksi = Transaksi::create([
                'nomor_transaksi' => $this->generateNomorTransaksi(),
                'tanggal_transaksi' => now(),
                'cabang_id' => $cabangId,
                'jenis_transaksi' => $request->jenis_transaksi,
                'nama_pelanggan' => $request->nama_pelanggan,
                'telepon_pelanggan' => $request->telepon_pelanggan,
                'subtotal' => $subtotal,
                'diskon' => $diskon,
                'biaya_service' => $biayaService,
                'total_bayar' => $totalBayar,
                'metode_pembayaran' => $request->metode_pembayaran,
                'jumlah_bayar' => $request->jumlah_bayar,
                'kembalian' => $kembalian,
                'total_laba' => $totalLaba,
                'keterangan' => $request->keterangan,
                'status_transaksi' => 'selesai',
                'kasir_id' => Auth::id(),
            ]);

            // Create detail and update stok
            foreach ($request->detail as $item) {
                $barang = Barang::find($item['barang_id']);
                
                // Create detail
                DetailTransaksi::create([
                    'transaksi_id' => $transaksi->id,
                    'barang_id' => $item['barang_id'],
                    'nama_barang' => $barang->nama_barang,
                    'jumlah' => $item['jumlah'],
                    'harga_asal' => $barang->harga_asal,
                    'harga_jual' => $item['harga_jual'],
                    'jenis_harga' => $item['jenis_harga'],
                    'diskon_item' => $item['diskon_item'] ?? 0,
                    'subtotal' => $item['jumlah'] * $item['harga_jual'],
                    'laba' => ($item['harga_jual'] - $barang->harga_asal) * $item['jumlah'],
                ]);

                // Update stok
                $stokCabang = StokCabang::where('cabang_id', $cabangId)
                    ->where('barang_id', $item['barang_id'])
                    ->first();

                if ($stokCabang) {
                    $stokCabang->decrement('jumlah_stok', $item['jumlah']);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil disimpan',
                'data' => [
                    'nomor_transaksi' => $transaksi->nomor_transaksi,
                    'tanggal_transaksi' => $transaksi->tanggal_transaksi,
                    'kasir' => Auth::user()->name,
                    'total_bayar' => $totalBayar,
                    'jumlah_bayar' => $request->jumlah_bayar,
                    'kembalian' => $kembalian,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
