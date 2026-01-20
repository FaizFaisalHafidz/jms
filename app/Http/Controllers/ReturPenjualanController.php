<?php

namespace App\Http\Controllers;

use App\Models\ReturPenjualan;
use App\Models\DetailReturPenjualan;
use App\Models\Transaksi;
use App\Models\StokCabang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use App\Models\Barang;
use App\Models\DetailTransaksi;
use Carbon\Carbon;

class ReturPenjualanController extends Controller
{
    /**
     * Search barang for replacement
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
                    'harga_jual' => $item->harga_konsumen, // Default to consumer price
                    'stok' => $stok ? $stok->jumlah_stok : 0,
                    'satuan' => $item->satuan,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $barang,
        ]);
    }

    /**
     * Generate transaction number for exchange
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
     * Display listing of retur
     */
    public function index()
    {
        $cabangId = Auth::user()->cabang_id;

        $returs = ReturPenjualan::with(['transaksi', 'kasir'])
            ->where('cabang_id', $cabangId)
            ->orderBy('tanggal_retur', 'desc')
            ->get()
            ->map(function ($retur) {
                return [
                    'id' => $retur->id,
                    'nomor_retur' => $retur->nomor_retur,
                    'tanggal_retur' => $retur->tanggal_retur->format('Y-m-d'),
                    'nomor_transaksi' => $retur->transaksi->nomor_transaksi,
                    'total_item' => $retur->total_item,
                    'total_nilai_retur' => $retur->total_nilai_retur,
                    'jenis_retur' => $retur->jenis_retur,
                    'status_retur' => $retur->status_retur,
                    'kasir' => $retur->kasir->name,
                ];
            });

        // Stats
        $stats = [
            'total' => ReturPenjualan::where('cabang_id', $cabangId)->count(),
            'pending' => ReturPenjualan::where('cabang_id', $cabangId)->where('status_retur', 'pending')->count(),
            'disetujui' => ReturPenjualan::where('cabang_id', $cabangId)->where('status_retur', 'disetujui')->count(),
            'ditolak' => ReturPenjualan::where('cabang_id', $cabangId)->where('status_retur', 'ditolak')->count(),
        ];

        return Inertia::render('retur-penjualan/index', [
            'returs' => $returs,
            'stats' => $stats,
        ]);
    }

    /**
     * Show create form
     */
    public function create()
    {
        $cabangId = Auth::user()->cabang_id;

        // Get recent transactions that haven't been fully returned
        $transaksis = Transaksi::with(['detailTransaksi.barang'])
            ->where('cabang_id', $cabangId)
            ->whereIn('jenis_transaksi', ['retail', 'konter'])
            ->orderBy('tanggal_transaksi', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($transaksi) {
                return [
                    'id' => $transaksi->id,
                    'nomor_transaksi' => $transaksi->nomor_transaksi,
                    'tanggal_transaksi' => $transaksi->tanggal_transaksi->format('Y-m-d'),
                    'total_bayar' => $transaksi->total_bayar,
                ];
            });

        return Inertia::render('retur-penjualan/create', [
            'transaksis' => $transaksis,
        ]);
    }

    /**
     * Get transaction details for retur
     */
    public function getTransaksiDetail($id)
    {
        $transaksi = Transaksi::with(['detailTransaksi.barang'])->findOrFail($id);

        $items = $transaksi->detailTransaksi->map(function ($detail) {
            return [
                'detail_transaksi_id' => $detail->id,
                'barang_id' => $detail->barang_id,
                'kode_barang' => $detail->barang->kode_barang,
                'nama_barang' => $detail->nama_barang ?? $detail->barang->nama_barang,
                'jumlah_beli' => $detail->jumlah,
                'harga_jual' => $detail->harga_jual,
                'subtotal' => $detail->jumlah * $detail->harga_jual,
            ];
        });

        return response()->json([
            'transaksi' => [
                'id' => $transaksi->id,
                'nomor_transaksi' => $transaksi->nomor_transaksi,
                'tanggal_transaksi' => $transaksi->tanggal_transaksi->format('Y-m-d'),
                'total_bayar' => $transaksi->total_bayar,
            ],
            'items' => $items,
        ]);
    }

    /**
     * Store new retur
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal_retur' => 'required|date',
            'transaksi_id' => 'required|exists:transaksi,id',
            'alasan_retur' => 'required|string',
            'jenis_retur' => 'required|in:uang_kembali,ganti_barang',
            'items' => 'required|array|min:1',
            'items.*.detail_transaksi_id' => 'required|exists:detail_transaksi,id',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah_retur' => 'required|integer|min:1',
            'items.*.kondisi_barang' => 'required|in:baik,rusak',
        ]);

        DB::beginTransaction();
        try {
            // Generate nomor retur
            $nomorRetur = $this->generateNomorRetur();

            // Calculate total
            $totalNilaiRetur = 0;
            foreach ($request->items as $item) {
                $totalNilaiRetur += $item['jumlah_retur'] * $item['harga_jual'];
            }

            // Create retur
            $retur = ReturPenjualan::create([
                'nomor_retur' => $nomorRetur,
                'tanggal_retur' => $request->tanggal_retur,
                'transaksi_id' => $request->transaksi_id,
                'cabang_id' => Auth::user()->cabang_id,
                'total_item' => count($request->items),
                'total_nilai_retur' => $totalNilaiRetur,
                'alasan_retur' => $request->alasan_retur,
                'jenis_retur' => $request->jenis_retur,
                'status_retur' => 'pending',
                'kasir_id' => Auth::id(),
            ]);

            // Create details
            foreach ($request->items as $item) {
                $subtotal = $item['jumlah_retur'] * $item['harga_jual'];
                
                DetailReturPenjualan::create([
                    'retur_penjualan_id' => $retur->id,
                    'detail_transaksi_id' => $item['detail_transaksi_id'],
                    'barang_id' => $item['barang_id'],
                    'jumlah_retur' => $item['jumlah_retur'],
                    'harga_jual' => $item['harga_jual'],
                    'subtotal' => $subtotal,
                    'kondisi_barang' => $item['kondisi_barang'],
                    'keterangan' => $item['keterangan'] ?? null,
                ]);
            }

            DB::commit();

            return redirect()->route('retur-penjualan.index')
                ->with('success', 'Retur penjualan berhasil dibuat');
            // If there are replacement items (Ganti Barang)
            if ($request->jenis_retur === 'ganti_barang' && !empty($request->items_pengganti)) {
                $subtotalBaru = 0;
                $totalLaba = 0;
                $cabangId = Auth::user()->cabang_id;

                foreach ($request->items_pengganti as $item) {
                    $barang = Barang::findOrFail($item['id']);
                    $itemSubtotal = $item['qty'] * $item['harga_jual'];
                    $itemLaba = ($item['harga_jual'] - $barang->harga_asal) * $item['qty'];
                    $subtotalBaru += $itemSubtotal;
                    $totalLaba += $itemLaba;
                }

                // Create new transaction for replacement items
                $transaksiBaru = Transaksi::create([
                    'nomor_transaksi' => $this->generateNomorTransaksi(),
                    'tanggal_transaksi' => now(),
                    'cabang_id' => $cabangId,
                    'jenis_transaksi' => 'retail', // Default to retail for exchange
                    'nama_pelanggan' => 'Tukar Barang - Retur #' . $nomorRetur,
                    'subtotal' => $subtotalBaru,
                    'diskon' => 0,
                    'biaya_service' => 0,
                    'total_bayar' => $subtotalBaru,
                    'metode_pembayaran' => $request->metode_pembayaran ?? 'tunai',
                    'metode_pembayaran' => $request->metode_pembayaran ?? 'tunai',
                    // If replacement is cheaper (or equal), paid amount is the return value (customer gets change).
                    // If replacement is more expensive, paid amount is return value + extra payment (which equals subtotal).
                    'jumlah_bayar' => ($totalNilaiRetur >= $subtotalBaru) ? $totalNilaiRetur : $subtotalBaru, 
                    'kembalian' => ($totalNilaiRetur >= $subtotalBaru) ? ($totalNilaiRetur - $subtotalBaru) : 0,
                    'total_laba' => $totalLaba,
                    'keterangan' => 'Transaksi tukar barang dari Retur ' . $nomorRetur,
                    'status_transaksi' => 'selesai',
                    'kasir_id' => Auth::id(),
                ]);

                // Create transaction details and update stock
                foreach ($request->items_pengganti as $item) {
                    $barang = Barang::findOrFail($item['id']);
                    
                    DetailTransaksi::create([
                        'transaksi_id' => $transaksiBaru->id,
                        'barang_id' => $item['id'],
                        'nama_barang' => $barang->nama_barang,
                        'jumlah' => $item['qty'],
                        'harga_asal' => $barang->harga_asal,
                        'harga_jual' => $item['harga_jual'],
                        'jenis_harga' => 'konsumen',
                        'diskon_item' => 0,
                        'subtotal' => $item['qty'] * $item['harga_jual'],
                        'laba' => ($item['harga_jual'] - $barang->harga_asal) * $item['qty'],
                    ]);

                    // Update stock for new items
                    $stokCabang = StokCabang::where('cabang_id', $cabangId)
                        ->where('barang_id', $item['id'])
                        ->first();

                    if ($stokCabang) {
                        $stokCabang->decrement('jumlah_stok', $item['qty']);
                    }
                }
            }

            DB::commit();

            if (isset($transaksiBaru)) {
                $transaksiBaru->load(['detailTransaksi', 'kasir', 'cabang']);
                return redirect()->route('retur-penjualan.index')
                    ->with('success', 'Retur penjualan berhasil dibuat dan transaksi pengganti tercatat.')
                    ->with('transaksi_baru', $transaksiBaru);
            }

            return redirect()->route('retur-penjualan.index')
                ->with('success', 'Retur penjualan berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal membuat retur: ' . $e->getMessage()]);
        }
    }

    /**
     * Show detail retur
     */
    public function show($id)
    {
        $retur = ReturPenjualan::with([
            'transaksi',
            'cabang',
            'kasir',
            'disetujuiOleh',
            'detailReturPenjualan.barang'
        ])->findOrFail($id);

        return Inertia::render('retur-penjualan/show', [
            'retur' => [
                'id' => $retur->id,
                'nomor_retur' => $retur->nomor_retur,
                'tanggal_retur' => $retur->tanggal_retur->format('Y-m-d'),
                'nomor_transaksi' => $retur->transaksi->nomor_transaksi,
                'tanggal_transaksi' => $retur->transaksi->tanggal_transaksi->format('Y-m-d'),
                'total_item' => $retur->total_item,
                'total_nilai_retur' => $retur->total_nilai_retur,
                'alasan_retur' => $retur->alasan_retur,
                'status_retur' => $retur->status_retur,
                'kasir' => $retur->kasir->name,
                'disetujui_oleh' => $retur->disetujuiOleh?->name,
                'items' => $retur->detailReturPenjualan->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'kode_barang' => $detail->barang->kode_barang,
                        'nama_barang' => $detail->barang->nama_barang,
                        'jumlah_retur' => $detail->jumlah_retur,
                        'harga_jual' => $detail->harga_jual,
                        'subtotal' => $detail->subtotal,
                        'kondisi_barang' => $detail->kondisi_barang,
                        'keterangan' => $detail->keterangan,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Approve retur
     */
    public function approve($id)
    {
        $retur = ReturPenjualan::with('detailReturPenjualan')->findOrFail($id);

        if ($retur->status_retur !== 'pending') {
            return back()->withErrors(['error' => 'Retur sudah diproses']);
        }

        DB::beginTransaction();
        try {
            // Return stock to cabang (only for items in good condition)
            foreach ($retur->detailReturPenjualan as $detail) {
                if ($detail->kondisi_barang === 'baik') {
                    $stok = StokCabang::where('cabang_id', $retur->cabang_id)
                        ->where('barang_id', $detail->barang_id)
                        ->first();

                    if ($stok) {
                        $stok->increment('jumlah_stok', $detail->jumlah_retur);
                    } else {
                        StokCabang::create([
                            'cabang_id' => $retur->cabang_id,
                            'barang_id' => $detail->barang_id,
                            'jumlah_stok' => $detail->jumlah_retur,
                        ]);
                    }
                }
            }

            $retur->update([
                'status_retur' => 'disetujui',
                'disetujui_oleh_id' => Auth::id(),
            ]);

            DB::commit();

            return redirect()->route('retur-penjualan.index')
                ->with('success', 'Retur disetujui dan stok dikembalikan');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Reject retur
     */
    public function reject($id)
    {
        $retur = ReturPenjualan::findOrFail($id);

        if ($retur->status_retur !== 'pending') {
            return back()->withErrors(['error' => 'Retur sudah diproses']);
        }

        $retur->update([
            'status_retur' => 'ditolak',
            'disetujui_oleh_id' => Auth::id(),
        ]);

        return redirect()->route('retur-penjualan.index')
            ->with('success', 'Retur ditolak');
    }

    /**
     * Delete retur (only if pending)
     */
    public function destroy($id)
    {
        $retur = ReturPenjualan::findOrFail($id);

        if ($retur->status_retur !== 'pending') {
            return back()->withErrors(['error' => 'Retur yang sudah diproses tidak dapat dihapus']);
        }

        $retur->delete();

        return redirect()->route('retur-penjualan.index')
            ->with('success', 'Retur berhasil dihapus');
    }

    /**
     * Generate nomor retur
     */
    private function generateNomorRetur(): string
    {
        $today = date('Ymd');
        $prefix = "RTR-{$today}-";

        $lastRetur = ReturPenjualan::where('nomor_retur', 'like', $prefix . '%')
            ->orderBy('nomor_retur', 'desc')
            ->first();

        if ($lastRetur) {
            $lastNumber = (int) substr($lastRetur->nomor_retur, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
    /**
     * Get exchange transaction data for printing
     */
    public function printExchange($id)
    {
        $retur = ReturPenjualan::findOrFail($id);
        
        if ($retur->jenis_retur !== 'ganti_barang') {
            return response()->json(null);
        }

        // Debugging LOG
        \Illuminate\Support\Facades\Log::info("Mencari transaksi untuk retur id: $id, No Retur: " . $retur->nomor_retur);

        // Find the transaction linked to this retur
        $query = Transaksi::with(['detailTransaksi', 'kasir', 'cabang'])
            ->where('nama_pelanggan', 'LIKE', '%Retur #' . $retur->nomor_retur . '%')
            ->orWhere('keterangan', 'LIKE', '%dari Retur ' . $retur->nomor_retur . '%')
            ->orderBy('id', 'desc');
            
        // Log query SQL
        \Illuminate\Support\Facades\Log::info("SQL Query: " . $query->toSql());
        \Illuminate\Support\Facades\Log::info("Bindings: ", $query->getBindings());

        $transaksi = $query->first();

        if (!$transaksi) {
             \Illuminate\Support\Facades\Log::warning("Transaksi tidak ditemukan untuk retur: " . $retur->nomor_retur);
             return response()->json(['message' => 'Transaksi pengganti tidak ditemukan.'], 404);
        }

        return response()->json($transaksi);
    }
}
