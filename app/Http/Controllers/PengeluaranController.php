<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PengeluaranController extends Controller
{
    /**
     * Display listing of pengeluaran
     */
    public function index()
    {
        $cabangId = Auth::user()->cabang_id;

        $pengeluarans = Pengeluaran::with('user')
            ->where('cabang_id', $cabangId)
            ->orderBy('tanggal_pengeluaran', 'desc')
            ->get()
            ->map(function ($pengeluaran) {
                return [
                    'id' => $pengeluaran->id,
                    'nomor_pengeluaran' => $pengeluaran->nomor_pengeluaran,
                    'tanggal_pengeluaran' => $pengeluaran->tanggal_pengeluaran->format('Y-m-d'),
                    'kategori_pengeluaran' => $pengeluaran->kategori_pengeluaran,
                    'jumlah' => $pengeluaran->jumlah,
                    'keterangan' => $pengeluaran->keterangan,
                    'user' => $pengeluaran->user->name,
                    'created_at' => $pengeluaran->created_at->format('Y-m-d H:i'),
                ];
            });

        // Stats
        $totalPengeluaran = Pengeluaran::where('cabang_id', $cabangId)->sum('jumlah');
        $totalTransaksi = Pengeluaran::where('cabang_id', $cabangId)->count();
        
        // This month
        $bulanIni = Pengeluaran::where('cabang_id', $cabangId)
            ->whereMonth('tanggal_pengeluaran', date('m'))
            ->whereYear('tanggal_pengeluaran', date('Y'))
            ->sum('jumlah');

        $stats = [
            'total' => $totalPengeluaran,
            'transaksi' => $totalTransaksi,
            'bulan_ini' => $bulanIni,
        ];

        return Inertia::render('pengeluaran/index', [
            'pengeluarans' => $pengeluarans,
            'stats' => $stats,
        ]);
    }

    /**
     * Store new pengeluaran
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal_pengeluaran' => 'required|date',
            'kategori_pengeluaran' => 'required|in:gaji,listrik,air,internet,sewa,transport,perlengkapan,lainnya',
            'jumlah' => 'required|integer|min:1',
            'keterangan' => 'nullable|string',
        ]);

        // Generate nomor pengeluaran
        $nomorPengeluaran = $this->generateNomorPengeluaran();

        Pengeluaran::create([
            'nomor_pengeluaran' => $nomorPengeluaran,
            'tanggal_pengeluaran' => $request->tanggal_pengeluaran,
            'cabang_id' => Auth::user()->cabang_id,
            'kategori_pengeluaran' => $request->kategori_pengeluaran,
            'jumlah' => $request->jumlah,
            'keterangan' => $request->keterangan,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('pengeluaran.index')
            ->with('success', 'Pengeluaran berhasil ditambahkan');
    }

    /**
     * Update pengeluaran
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'tanggal_pengeluaran' => 'required|date',
            'kategori_pengeluaran' => 'required|in:gaji,listrik,air,internet,sewa,transport,perlengkapan,lainnya',
            'jumlah' => 'required|integer|min:1',
            'keterangan' => 'nullable|string',
        ]);

        $pengeluaran = Pengeluaran::findOrFail($id);

        $pengeluaran->update([
            'tanggal_pengeluaran' => $request->tanggal_pengeluaran,
            'kategori_pengeluaran' => $request->kategori_pengeluaran,
            'jumlah' => $request->jumlah,
            'keterangan' => $request->keterangan,
        ]);

        return redirect()->route('pengeluaran.index')
            ->with('success', 'Pengeluaran berhasil diperbarui');
    }

    /**
     * Delete pengeluaran
     */
    public function destroy($id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);
        $pengeluaran->delete();

        return redirect()->route('pengeluaran.index')
            ->with('success', 'Pengeluaran berhasil dihapus');
    }

    /**
     * Generate nomor pengeluaran
     */
    private function generateNomorPengeluaran(): string
    {
        $today = date('Ymd');
        $prefix = "PGL-{$today}-";

        $lastPengeluaran = Pengeluaran::where('nomor_pengeluaran', 'like', $prefix . '%')
            ->orderBy('nomor_pengeluaran', 'desc')
            ->first();

        if ($lastPengeluaran) {
            $lastNumber = (int) substr($lastPengeluaran->nomor_pengeluaran, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
