<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\Cabang;
use App\Models\HargaCabang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HargaCabangController extends Controller
{
    /**
     * Tampilkan halaman manage harga per cabang untuk barang tertentu
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('super_admin');
        $isSupervisor = $user->hasRole('supervisor');

        if (!$isSuperAdmin && !$isSupervisor) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke halaman ini');
        }

        // Get all active cabang
        $cabangs = Cabang::where('status_aktif', true)
            ->orderBy('nama_cabang')
            ->get();

        // Jika ada barang_id di request, load detail barang dan harga custom
        $barangDetail = null;
        $hargaCustom = [];
        
        if ($request->filled('barang_id')) {
            $barangDetail = Barang::with(['kategori', 'suplier'])
                ->where('id', $request->barang_id)
                ->first();
                
            if ($barangDetail) {
                $hargaCustom = HargaCabang::where('barang_id', $request->barang_id)
                    ->get()
                    ->keyBy('cabang_id');
            }
        }

        return Inertia::render('super-admin/harga-cabang', [
            'cabangs' => $cabangs,
            'barang_detail' => $barangDetail,
            'harga_custom' => $hargaCustom,
        ]);
    }

    /**
     * Search barang untuk dropdown (AJAX)
     */
    public function searchBarang(Request $request)
    {
        $keyword = $request->input('keyword', '');
        
        $barang = Barang::with(['kategori'])
            ->where('status_aktif', true)
            ->where(function($q) use ($keyword) {
                $q->where('nama_barang', 'like', "%{$keyword}%")
                  ->orWhere('kode_barang', 'like', "%{$keyword}%")
                  ->orWhere('barcode', 'like', "%{$keyword}%");
            })
            ->select('id', 'kode_barang', 'nama_barang', 'kategori_id', 'harga_konsumen', 'harga_konter', 'harga_partai')
            ->orderBy('nama_barang')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $barang
        ]);
    }

    /**
     * Update atau create harga custom untuk cabang tertentu
     */
    public function update(Request $request)
    {
        $request->validate([
            'barang_id' => 'required|exists:barang,id',
            'cabang_id' => 'required|exists:cabang,id',
            'harga_konsumen' => 'nullable|integer|min:0',
            'harga_konter' => 'nullable|integer|min:0',
            'harga_partai' => 'nullable|integer|min:0',
        ]);

        // Jika semua harga null, hapus record (kembali ke harga default)
        if (
            $request->harga_konsumen === null &&
            $request->harga_konter === null &&
            $request->harga_partai === null
        ) {
            HargaCabang::where('barang_id', $request->barang_id)
                ->where('cabang_id', $request->cabang_id)
                ->delete();

            return back()->with('success', 'Harga dikembalikan ke default');
        }

        // Update atau create harga custom
        HargaCabang::updateOrCreate(
            [
                'barang_id' => $request->barang_id,
                'cabang_id' => $request->cabang_id,
            ],
            [
                'harga_konsumen' => $request->harga_konsumen,
                'harga_konter' => $request->harga_konter,
                'harga_partai' => $request->harga_partai,
            ]
        );

        return back()->with('success', 'Harga custom berhasil disimpan');
    }

    /**
     * Batch update harga untuk satu barang di beberapa cabang
     */
    public function batchUpdate(Request $request)
    {
        $request->validate([
            'barang_id' => 'required|exists:barang,id',
            'updates' => 'required|array',
            'updates.*.cabang_id' => 'required|exists:cabang,id',
            'updates.*.harga_konsumen' => 'nullable|integer|min:0',
            'updates.*.harga_konter' => 'nullable|integer|min:0',
            'updates.*.harga_partai' => 'nullable|integer|min:0',
        ]);

        foreach ($request->updates as $update) {
            // Skip jika semua harga null
            if (
                $update['harga_konsumen'] === null &&
                $update['harga_konter'] === null &&
                $update['harga_partai'] === null
            ) {
                continue;
            }

            HargaCabang::updateOrCreate(
                [
                    'barang_id' => $request->barang_id,
                    'cabang_id' => $update['cabang_id'],
                ],
                [
                    'harga_konsumen' => $update['harga_konsumen'],
                    'harga_konter' => $update['harga_konter'],
                    'harga_partai' => $update['harga_partai'],
                ]
            );
        }

        return back()->with('success', 'Harga berhasil diupdate untuk ' . count($request->updates) . ' cabang');
    }

    /**
     * Reset harga cabang ke default (hapus custom price)
     */
    public function reset(Request $request)
    {
        $request->validate([
            'barang_id' => 'required|exists:barang,id',
            'cabang_id' => 'required|exists:cabang,id',
        ]);

        HargaCabang::where('barang_id', $request->barang_id)
            ->where('cabang_id', $request->cabang_id)
            ->delete();

        return back()->with('success', 'Harga dikembalikan ke default');
    }
}
