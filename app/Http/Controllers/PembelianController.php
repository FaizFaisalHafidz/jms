<?php

namespace App\Http\Controllers;

use App\Models\Pembelian;
use App\Models\DetailPembelian;
use App\Models\Barang;
use App\Models\Cabang;
use App\Models\Suplier;
use App\Models\StokCabang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Carbon\Carbon;

class PembelianController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pembelian = Pembelian::with(['suplier', 'cabang', 'user', 'detailPembelian'])
            ->orderBy('tanggal_pembelian', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Stats
        $total = Pembelian::count();
        $totalNilai = Pembelian::sum('total_bayar');
        $lunas = Pembelian::where('status_pembayaran', 'lunas')->count();
        $belumLunas = Pembelian::where('status_pembayaran', 'belum_lunas')->count();

        return Inertia::render('pembelian/index', [
            'pembelian' => $pembelian,
            'stats' => [
                'total' => $total,
                'total_nilai' => $totalNilai,
                'lunas' => $lunas,
                'belum_lunas' => $belumLunas,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $barang = Barang::where('status_aktif', true)
            ->with(['kategori', 'suplier'])
            ->orderBy('nama_barang')
            ->get();

        $cabang = Cabang::where('status_aktif', true)
            ->orderBy('nama_cabang')
            ->get();

        $suplier = Suplier::where('status_aktif', true)
            ->orderBy('nama_suplier')
            ->get();

        return Inertia::render('pembelian/create', compact('barang', 'cabang', 'suplier'));
    }

    /**
     * Generate nomor pembelian otomatis
     */
    private function generateNomorPembelian(): string
    {
        $date = Carbon::now();
        $prefix = 'PO-' . $date->format('Ymd') . '-';
        
        $lastPembelian = Pembelian::where('nomor_pembelian', 'LIKE', $prefix . '%')
            ->orderBy('nomor_pembelian', 'desc')
            ->first();
        
        if ($lastPembelian) {
            preg_match('/-(\d+)$/', $lastPembelian->nomor_pembelian, $matches);
            $lastNumber = isset($matches[1]) ? (int)$matches[1] : 0;
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal_pembelian' => 'required|date',
            'suplier_id' => 'required|exists:suplier,id',
            'cabang_id' => 'required|exists:cabang,id',
            'subtotal' => 'required|integer|min:0',
            'diskon' => 'nullable|integer|min:0',
            'ongkos_kirim' => 'nullable|integer|min:0',
            'total_bayar' => 'required|integer|min:0',
            'status_pembayaran' => 'required|in:lunas,belum_lunas,cicilan',
            'tanggal_jatuh_tempo' => 'nullable|date',
            'keterangan' => 'nullable|string',
            'detail' => 'required|array|min:1',
            'detail.*.barang_id' => 'required|exists:barang,id',
            'detail.*.jumlah' => 'required|integer|min:1',
            'detail.*.harga_beli' => 'required|integer|min:0',
            'detail.*.subtotal' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        DB::beginTransaction();
        try {
            // Create pembelian master
            $pembelian = Pembelian::create([
                'nomor_pembelian' => $this->generateNomorPembelian(),
                'tanggal_pembelian' => $request->tanggal_pembelian,
                'suplier_id' => $request->suplier_id,
                'cabang_id' => $request->cabang_id,
                'total_item' => count($request->detail),
                'subtotal' => $request->subtotal,
                'diskon' => $request->diskon ?? 0,
                'ongkos_kirim' => $request->ongkos_kirim ?? 0,
                'total_bayar' => $request->total_bayar,
                'status_pembayaran' => $request->status_pembayaran,
                'tanggal_jatuh_tempo' => $request->tanggal_jatuh_tempo,
                'keterangan' => $request->keterangan,
                'user_id' => auth()->id(),
            ]);

            // Create detail pembelian and update stok
            foreach ($request->detail as $item) {
                // Create detail
                DetailPembelian::create([
                    'pembelian_id' => $pembelian->id,
                    'barang_id' => $item['barang_id'],
                    'jumlah' => $item['jumlah'],
                    'harga_beli' => $item['harga_beli'],
                    'subtotal' => $item['subtotal'],
                ]);

                // Update or create stok cabang
                $stokCabang = StokCabang::where('cabang_id', $request->cabang_id)
                    ->where('barang_id', $item['barang_id'])
                    ->first();

                if ($stokCabang) {
                    $stokCabang->increment('jumlah_stok', $item['jumlah']);
                } else {
                    StokCabang::create([
                        'cabang_id' => $request->cabang_id,
                        'barang_id' => $item['barang_id'],
                        'jumlah_stok' => $item['jumlah'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('pembelian.index')
                ->with('success', 'Pembelian berhasil ditambahkan dengan nomor: ' . $pembelian->nomor_pembelian);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pembelian $pembelian)
    {
        DB::beginTransaction();
        try {
            // Rollback stok
            foreach ($pembelian->detailPembelian as $detail) {
                $stokCabang = StokCabang::where('cabang_id', $pembelian->cabang_id)
                    ->where('barang_id', $detail->barang_id)
                    ->first();

                if ($stokCabang) {
                    $stokCabang->decrement('jumlah_stok', $detail->jumlah);
                    
                    // Delete if stok becomes 0
                    if ($stokCabang->jumlah_stok <= 0) {
                        $stokCabang->delete();
                    }
                }
            }

            // Delete pembelian (detail will be cascade deleted)
            $pembelian->delete();

            DB::commit();

            return redirect()->route('pembelian.index')
                ->with('success', 'Pembelian berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
