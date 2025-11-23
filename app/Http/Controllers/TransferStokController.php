<?php

namespace App\Http\Controllers;

use App\Models\TransferStok;
use App\Models\DetailTransferStok;
use App\Models\Cabang;
use App\Models\Barang;
use App\Models\StokCabang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransferStokController extends Controller
{
    /**
     * Display listing of transfer stok
     */
    public function index()
    {
        $cabangId = Auth::user()->cabang_id;

        $transfers = TransferStok::with(['cabangAsal', 'cabangTujuan', 'dibuatOleh'])
            ->where(function ($query) use ($cabangId) {
                $query->where('cabang_asal_id', $cabangId)
                      ->orWhere('cabang_tujuan_id', $cabangId);
            })
            ->orderBy('tanggal_transfer', 'desc')
            ->get()
            ->map(function ($transfer) {
                return [
                    'id' => $transfer->id,
                    'nomor_transfer' => $transfer->nomor_transfer,
                    'tanggal_transfer' => $transfer->tanggal_transfer->format('Y-m-d'),
                    'cabang_asal' => $transfer->cabangAsal->nama_cabang,
                    'cabang_tujuan' => $transfer->cabangTujuan->nama_cabang,
                    'status_transfer' => $transfer->status_transfer,
                    'total_item' => $transfer->total_item,
                    'dibuat_oleh' => $transfer->dibuatOleh->name,
                ];
            });

        // Stats
        $stats = [
            'total' => TransferStok::where(function ($query) use ($cabangId) {
                $query->where('cabang_asal_id', $cabangId)
                      ->orWhere('cabang_tujuan_id', $cabangId);
            })->count(),
            'pending' => TransferStok::where(function ($query) use ($cabangId) {
                $query->where('cabang_asal_id', $cabangId)
                      ->orWhere('cabang_tujuan_id', $cabangId);
            })->where('status_transfer', 'pending')->count(),
            'dikirim' => TransferStok::where(function ($query) use ($cabangId) {
                $query->where('cabang_asal_id', $cabangId)
                      ->orWhere('cabang_tujuan_id', $cabangId);
            })->where('status_transfer', 'dikirim')->count(),
            'diterima' => TransferStok::where(function ($query) use ($cabangId) {
                $query->where('cabang_asal_id', $cabangId)
                      ->orWhere('cabang_tujuan_id', $cabangId);
            })->where('status_transfer', 'diterima')->count(),
        ];

        return Inertia::render('transfer-stok/index', [
            'transfers' => $transfers,
            'stats' => $stats,
        ]);
    }

    /**
     * Show create form
     */
    public function create()
    {
        $cabangId = Auth::user()->cabang_id;

        // Get other branches
        $cabangs = Cabang::where('id', '!=', $cabangId)
            ->get()
            ->map(function ($cabang) {
                return [
                    'id' => $cabang->id,
                    'nama_cabang' => $cabang->nama_cabang,
                ];
            });

        return Inertia::render('transfer-stok/create', [
            'cabangs' => $cabangs,
        ]);
    }

    /**
     * Store new transfer
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal_transfer' => 'required|date',
            'cabang_tujuan_id' => 'required|exists:cabang,id',
            'items' => 'required|array|min:1',
            'items.*.barang_id' => 'required|exists:barang,id',
            'items.*.jumlah_transfer' => 'required|integer|min:1',
            'keterangan' => 'nullable|string',
        ]);

        $cabangAsalId = Auth::user()->cabang_id;

        // Validate stock availability
        foreach ($request->items as $item) {
            $stok = StokCabang::where('cabang_id', $cabangAsalId)
                ->where('barang_id', $item['barang_id'])
                ->first();

            if (!$stok || $stok->jumlah_stok < $item['jumlah_transfer']) {
                $barang = Barang::find($item['barang_id']);
                return back()->withErrors([
                    'items' => "Stok {$barang->nama_barang} tidak mencukupi"
                ]);
            }
        }

        DB::beginTransaction();
        try {
            // Generate nomor transfer
            $nomorTransfer = $this->generateNomorTransfer();

            // Create transfer
            $transfer = TransferStok::create([
                'nomor_transfer' => $nomorTransfer,
                'tanggal_transfer' => $request->tanggal_transfer,
                'cabang_asal_id' => $cabangAsalId,
                'cabang_tujuan_id' => $request->cabang_tujuan_id,
                'status_transfer' => 'pending',
                'total_item' => count($request->items),
                'keterangan' => $request->keterangan,
                'dibuat_oleh_id' => Auth::id(),
            ]);

            // Create details
            foreach ($request->items as $item) {
                DetailTransferStok::create([
                    'transfer_stok_id' => $transfer->id,
                    'barang_id' => $item['barang_id'],
                    'jumlah_transfer' => $item['jumlah_transfer'],
                    'keterangan' => $item['keterangan'] ?? null,
                ]);
            }

            DB::commit();

            return redirect()->route('transfer-stok.index')
                ->with('success', 'Transfer stok berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal membuat transfer: ' . $e->getMessage()]);
        }
    }

    /**
     * Show detail transfer
     */
    public function show($id)
    {
        $transfer = TransferStok::with([
            'cabangAsal',
            'cabangTujuan',
            'dibuatOleh',
            'disetujuiOleh',
            'diterimaOleh',
            'detailTransferStok.barang'
        ])->findOrFail($id);

        return Inertia::render('transfer-stok/show', [
            'transfer' => [
                'id' => $transfer->id,
                'nomor_transfer' => $transfer->nomor_transfer,
                'tanggal_transfer' => $transfer->tanggal_transfer->format('Y-m-d'),
                'cabang_asal' => $transfer->cabangAsal->nama_cabang,
                'cabang_tujuan' => $transfer->cabangTujuan->nama_cabang,
                'status_transfer' => $transfer->status_transfer,
                'total_item' => $transfer->total_item,
                'keterangan' => $transfer->keterangan,
                'dibuat_oleh' => $transfer->dibuatOleh->name,
                'disetujui_oleh' => $transfer->disetujuiOleh?->name,
                'tanggal_disetujui' => $transfer->tanggal_disetujui?->format('Y-m-d H:i'),
                'diterima_oleh' => $transfer->diterimaOleh?->name,
                'tanggal_diterima' => $transfer->tanggal_diterima?->format('Y-m-d H:i'),
                'items' => $transfer->detailTransferStok->map(function ($detail) {
                    return [
                        'id' => $detail->id,
                        'kode_barang' => $detail->barang->kode_barang,
                        'nama_barang' => $detail->barang->nama_barang,
                        'jumlah_transfer' => $detail->jumlah_transfer,
                        'jumlah_diterima' => $detail->jumlah_diterima,
                        'keterangan' => $detail->keterangan,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Approve transfer (from cabang asal)
     */
    public function approve($id)
    {
        $transfer = TransferStok::findOrFail($id);

        if ($transfer->status_transfer !== 'pending') {
            return back()->withErrors(['error' => 'Transfer sudah diproses']);
        }

        DB::beginTransaction();
        try {
            // Reduce stock from cabang asal
            foreach ($transfer->detailTransferStok as $detail) {
                $stok = StokCabang::where('cabang_id', $transfer->cabang_asal_id)
                    ->where('barang_id', $detail->barang_id)
                    ->first();

                if (!$stok || $stok->jumlah_stok < $detail->jumlah_transfer) {
                    throw new \Exception("Stok tidak mencukupi");
                }

                $stok->decrement('jumlah_stok', $detail->jumlah_transfer);
            }

            $transfer->update([
                'status_transfer' => 'dikirim',
                'disetujui_oleh_id' => Auth::id(),
                'tanggal_disetujui' => now(),
            ]);

            DB::commit();

            return redirect()->route('transfer-stok.index')
                ->with('success', 'Transfer disetujui dan stok dikurangi');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Receive transfer (from cabang tujuan)
     */
    public function receive(Request $request, $id)
    {
        $transfer = TransferStok::findOrFail($id);

        if ($transfer->status_transfer !== 'dikirim') {
            return back()->withErrors(['error' => 'Transfer belum dikirim']);
        }

        $request->validate([
            'items' => 'required|array',
            'items.*.detail_id' => 'required|exists:detail_transfer_stok,id',
            'items.*.jumlah_diterima' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->items as $item) {
                $detail = DetailTransferStok::find($item['detail_id']);
                
                // Update jumlah diterima
                $detail->update([
                    'jumlah_diterima' => $item['jumlah_diterima'],
                ]);

                // Add stock to cabang tujuan
                $stok = StokCabang::firstOrCreate(
                    [
                        'cabang_id' => $transfer->cabang_tujuan_id,
                        'barang_id' => $detail->barang_id,
                    ],
                    ['jumlah_stok' => 0]
                );

                $stok->increment('jumlah_stok', $item['jumlah_diterima']);
            }

            $transfer->update([
                'status_transfer' => 'diterima',
                'diterima_oleh_id' => Auth::id(),
                'tanggal_diterima' => now(),
            ]);

            DB::commit();

            return redirect()->route('transfer-stok.index')
                ->with('success', 'Transfer berhasil diterima');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Reject transfer
     */
    public function reject($id)
    {
        $transfer = TransferStok::findOrFail($id);

        if (!in_array($transfer->status_transfer, ['pending', 'dikirim'])) {
            return back()->withErrors(['error' => 'Transfer tidak dapat ditolak']);
        }

        DB::beginTransaction();
        try {
            // If already approved, return stock to cabang asal
            if ($transfer->status_transfer === 'dikirim') {
                foreach ($transfer->detailTransferStok as $detail) {
                    $stok = StokCabang::where('cabang_id', $transfer->cabang_asal_id)
                        ->where('barang_id', $detail->barang_id)
                        ->first();

                    $stok->increment('jumlah_stok', $detail->jumlah_transfer);
                }
            }

            $transfer->update([
                'status_transfer' => 'ditolak',
            ]);

            DB::commit();

            return redirect()->route('transfer-stok.index')
                ->with('success', 'Transfer ditolak');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete transfer (only if pending)
     */
    public function destroy($id)
    {
        $transfer = TransferStok::findOrFail($id);

        if ($transfer->status_transfer !== 'pending') {
            return back()->withErrors(['error' => 'Transfer yang sudah diproses tidak dapat dihapus']);
        }

        $transfer->delete();

        return redirect()->route('transfer-stok.index')
            ->with('success', 'Transfer berhasil dihapus');
    }

    /**
     * Search barang by keyword
     */
    public function searchBarang(Request $request)
    {
        $cabangId = Auth::user()->cabang_id;
        $keyword = $request->keyword;

        $barangs = Barang::with(['stokCabang' => function ($query) use ($cabangId) {
                $query->where('cabang_id', $cabangId);
            }])
            ->where(function ($query) use ($keyword) {
                $query->where('kode_barang', 'like', "%{$keyword}%")
                    ->orWhere('nama_barang', 'like', "%{$keyword}%");
            })
            ->limit(10)
            ->get()
            ->map(function ($barang) {
                $stok = $barang->stokCabang->first();
                return [
                    'id' => $barang->id,
                    'kode_barang' => $barang->kode_barang,
                    'nama_barang' => $barang->nama_barang,
                    'stok_tersedia' => $stok ? $stok->jumlah_stok : 0,
                ];
            });

        return response()->json($barangs);
    }

    /**
     * Generate nomor transfer
     */
    private function generateNomorTransfer(): string
    {
        $today = date('Ymd');
        $prefix = "TRF-{$today}-";

        $lastTransfer = TransferStok::where('nomor_transfer', 'like', $prefix . '%')
            ->orderBy('nomor_transfer', 'desc')
            ->first();

        if ($lastTransfer) {
            $lastNumber = (int) substr($lastTransfer->nomor_transfer, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
