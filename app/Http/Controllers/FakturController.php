<?php

namespace App\Http\Controllers;

use App\Models\Faktur;
use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FakturController extends Controller
{
    /**
     * Display a listing of faktur
     */
    public function index()
    {
        $cabangId = Auth::user()->cabang_id;

        // Get faktur list with relations
        $fakturs = Faktur::with(['transaksi', 'user'])
            ->where('cabang_id', $cabangId)
            ->orderBy('tanggal_faktur', 'desc')
            ->get()
            ->map(function ($faktur) {
                return [
                    'id' => $faktur->id,
                    'nomor_faktur' => $faktur->nomor_faktur,
                    'tanggal_faktur' => $faktur->tanggal_faktur->format('Y-m-d'),
                    'nama_pelanggan' => $faktur->nama_pelanggan,
                    'telepon_pelanggan' => $faktur->telepon_pelanggan,
                    'alamat_pelanggan' => $faktur->alamat_pelanggan,
                    'subtotal' => $faktur->subtotal,
                    'diskon' => $faktur->diskon,
                    'total_bayar' => $faktur->total_bayar,
                    'status_pembayaran' => $faktur->status_pembayaran,
                    'tanggal_jatuh_tempo' => $faktur->tanggal_jatuh_tempo?->format('Y-m-d'),
                    'kasir' => $faktur->user->name,
                    'nomor_transaksi' => $faktur->transaksi->nomor_transaksi,
                ];
            });

        // Calculate stats
        $stats = [
            'total' => Faktur::where('cabang_id', $cabangId)->count(),
            'lunas' => Faktur::where('cabang_id', $cabangId)
                ->where('status_pembayaran', 'lunas')
                ->count(),
            'belum_lunas' => Faktur::where('cabang_id', $cabangId)
                ->where('status_pembayaran', 'belum_lunas')
                ->count(),
            'cicilan' => Faktur::where('cabang_id', $cabangId)
                ->where('status_pembayaran', 'cicilan')
                ->count(),
        ];

        return Inertia::render('faktur/index', [
            'fakturs' => $fakturs,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new faktur
     */
    public function create()
    {
        $cabangId = Auth::user()->cabang_id;

        // Get available transactions (retail/konter type without faktur)
        $transaksis = Transaksi::whereDoesntHave('faktur')
            ->where('cabang_id', $cabangId)
            ->whereIn('jenis_transaksi', ['retail', 'konter'])
            ->with('details.barang')
            ->orderBy('tanggal_transaksi', 'desc')
            ->get()
            ->map(function ($transaksi) {
                return [
                    'id' => $transaksi->id,
                    'nomor_transaksi' => $transaksi->nomor_transaksi,
                    'tanggal_transaksi' => $transaksi->tanggal_transaksi->format('Y-m-d'),
                    'nama_pelanggan' => $transaksi->nama_pelanggan,
                    'subtotal' => $transaksi->subtotal,
                    'diskon' => $transaksi->diskon,
                    'total_bayar' => $transaksi->total_bayar,
                    'items' => $transaksi->details->map(function ($detail) {
                        return [
                            'nama_barang' => $detail->nama_barang ?? $detail->barang->nama_barang,
                            'qty' => $detail->jumlah,
                            'harga' => $detail->harga_jual,
                            'subtotal' => $detail->subtotal,
                        ];
                    }),
                ];
            });

        return Inertia::render('faktur/create', [
            'transaksis' => $transaksis,
        ]);
    }

    /**
     * Store a newly created faktur
     */
    public function store(Request $request)
    {
        $request->validate([
            'transaksi_id' => 'required|exists:transaksi,id',
            'nama_pelanggan' => 'required|string|max:100',
            'telepon_pelanggan' => 'nullable|string|max:20',
            'alamat_pelanggan' => 'nullable|string',
            'tanggal_faktur' => 'required|date',
            'tanggal_jatuh_tempo' => 'nullable|date',
            'status_pembayaran' => 'required|in:lunas,belum_lunas,cicilan',
            'keterangan' => 'nullable|string',
        ]);

        $cabangId = Auth::user()->cabang_id;

        // Get transaksi
        $transaksi = Transaksi::findOrFail($request->transaksi_id);

        // Check if transaksi already has faktur
        if (Faktur::where('transaksi_id', $transaksi->id)->exists()) {
            return back()->withErrors(['transaksi_id' => 'Transaksi ini sudah memiliki faktur']);
        }

        // Generate nomor faktur
        $nomorFaktur = $this->generateNomorFaktur();

        $faktur = Faktur::create([
            'nomor_faktur' => $nomorFaktur,
            'tanggal_faktur' => $request->tanggal_faktur,
            'cabang_id' => $cabangId,
            'transaksi_id' => $request->transaksi_id,
            'nama_pelanggan' => $request->nama_pelanggan,
            'telepon_pelanggan' => $request->telepon_pelanggan,
            'alamat_pelanggan' => $request->alamat_pelanggan,
            'subtotal' => $transaksi->subtotal,
            'diskon' => $transaksi->diskon,
            'total_bayar' => $transaksi->total_bayar,
            'status_pembayaran' => $request->status_pembayaran,
            'tanggal_jatuh_tempo' => $request->tanggal_jatuh_tempo,
            'keterangan' => $request->keterangan,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('faktur.index')
            ->with('success', 'Faktur berhasil dibuat');
    }

    /**
     * Show the form for editing the faktur
     */
    public function edit($id)
    {
        $faktur = Faktur::with(['transaksi.details.barang'])->findOrFail($id);

        return Inertia::render('faktur/edit', [
            'faktur' => [
                'id' => $faktur->id,
                'nomor_faktur' => $faktur->nomor_faktur,
                'tanggal_faktur' => $faktur->tanggal_faktur->format('Y-m-d'),
                'nama_pelanggan' => $faktur->nama_pelanggan,
                'telepon_pelanggan' => $faktur->telepon_pelanggan,
                'alamat_pelanggan' => $faktur->alamat_pelanggan,
                'subtotal' => $faktur->subtotal,
                'diskon' => $faktur->diskon,
                'total_bayar' => $faktur->total_bayar,
                'status_pembayaran' => $faktur->status_pembayaran,
                'tanggal_jatuh_tempo' => $faktur->tanggal_jatuh_tempo?->format('Y-m-d'),
                'keterangan' => $faktur->keterangan,
                'nomor_transaksi' => $faktur->transaksi->nomor_transaksi,
                'items' => $faktur->transaksi->details->map(function ($detail) {
                    return [
                        'nama_barang' => $detail->nama_barang ?? $detail->barang->nama_barang,
                        'qty' => $detail->jumlah,
                        'harga' => $detail->harga_jual,
                        'subtotal' => $detail->subtotal,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Update the faktur
     */
    public function update(Request $request, $id)
    {
        $faktur = Faktur::findOrFail($id);

        // Check if this is a partial update (status only)
        if ($request->has('status_pembayaran') && count($request->all()) === 1) {
            $request->validate([
                'status_pembayaran' => 'required|in:lunas,belum_lunas,cicilan',
            ]);

            $faktur->update([
                'status_pembayaran' => $request->status_pembayaran,
            ]);

            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Status pembayaran berhasil diubah',
                ]);
            }

            return redirect()->route('faktur.index')
                ->with('success', 'Status pembayaran berhasil diubah');
        }

        // Full update
        $request->validate([
            'nama_pelanggan' => 'required|string|max:100',
            'telepon_pelanggan' => 'nullable|string|max:20',
            'alamat_pelanggan' => 'nullable|string',
            'tanggal_faktur' => 'required|date',
            'tanggal_jatuh_tempo' => 'nullable|date',
            'status_pembayaran' => 'required|in:lunas,belum_lunas,cicilan',
            'keterangan' => 'nullable|string',
        ]);

        $faktur->update([
            'nama_pelanggan' => $request->nama_pelanggan,
            'telepon_pelanggan' => $request->telepon_pelanggan,
            'alamat_pelanggan' => $request->alamat_pelanggan,
            'tanggal_faktur' => $request->tanggal_faktur,
            'tanggal_jatuh_tempo' => $request->tanggal_jatuh_tempo,
            'status_pembayaran' => $request->status_pembayaran,
            'keterangan' => $request->keterangan,
        ]);

        return redirect()->route('faktur.index')
            ->with('success', 'Faktur berhasil diupdate');
    }

    /**
     * Remove the faktur
     */
    public function destroy($id)
    {
        $faktur = Faktur::findOrFail($id);
        $faktur->delete();

        return redirect()->route('faktur.index')
            ->with('success', 'Faktur berhasil dihapus');
    }

    /**
     * Get faktur detail for print
     */
    public function detail($id)
    {
        $faktur = Faktur::with(['transaksi.details.barang', 'cabang', 'user'])->findOrFail($id);

        return response()->json([
            'id' => $faktur->id,
            'nomor_faktur' => $faktur->nomor_faktur,
            'tanggal_faktur' => $faktur->tanggal_faktur->format('Y-m-d'),
            'nama_pelanggan' => $faktur->nama_pelanggan,
            'telepon_pelanggan' => $faktur->telepon_pelanggan,
            'alamat_pelanggan' => $faktur->alamat_pelanggan,
            'subtotal' => $faktur->subtotal,
            'diskon' => $faktur->diskon,
            'total_bayar' => $faktur->total_bayar,
            'status_pembayaran' => $faktur->status_pembayaran,
            'tanggal_jatuh_tempo' => $faktur->tanggal_jatuh_tempo?->format('d M Y'),
            'keterangan' => $faktur->keterangan,
            'kasir' => $faktur->user->name,
            'cabang_nama' => $faktur->cabang->nama_cabang,
            'cabang_alamat' => $faktur->cabang->alamat,
            'cabang_telepon' => $faktur->cabang->telepon,
            'items' => $faktur->transaksi->details->map(function ($detail) {
                return [
                    'nama_barang' => $detail->nama_barang ?? $detail->barang->nama_barang,
                    'qty' => $detail->jumlah,
                    'harga' => $detail->harga_jual,
                    'subtotal' => $detail->subtotal,
                ];
            }),
        ]);
    }

    /**
     * Generate nomor faktur (FKT-YYYYMMDD-XXXX)
     */
    private function generateNomorFaktur(): string
    {
        $today = date('Ymd');
        $prefix = "FKT-{$today}-";

        $lastFaktur = Faktur::where('nomor_faktur', 'like', $prefix . '%')
            ->orderBy('nomor_faktur', 'desc')
            ->first();

        if ($lastFaktur) {
            $lastNumber = (int) substr($lastFaktur->nomor_faktur, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
