<?php

namespace App\Http\Controllers;

use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CabangStockPermissionController extends Controller
{
    /**
     * Tampilkan halaman manage stock permission per cabang
     */
    public function index()
    {
        $cabangs = Cabang::orderBy('nama_cabang')->get();

        return Inertia::render('super-admin/stock-permission', [
            'cabangs' => $cabangs
        ]);
    }

    /**
     * Update stock permission untuk cabang tertentu
     */
    public function update(Request $request, Cabang $cabang)
    {
        $request->validate([
            'can_manage_stock' => 'required|boolean'
        ]);

        $cabang->update([
            'can_manage_stock' => $request->can_manage_stock
        ]);

        return back()->with('success', 'Permission stok cabang berhasil diupdate.');
    }

    /**
     * Batch update stock permission untuk beberapa cabang sekaligus
     */
    public function batchUpdate(Request $request)
    {
        $request->validate([
            'updates' => 'required|array',
            'updates.*.cabang_id' => 'required|exists:cabang,id',
            'updates.*.can_manage_stock' => 'required|boolean'
        ]);

        foreach ($request->updates as $update) {
            Cabang::where('id', $update['cabang_id'])
                ->update(['can_manage_stock' => $update['can_manage_stock']]);
        }

        return back()->with('success', 'Permission stok berhasil diupdate untuk ' . count($request->updates) . ' cabang.');
    }
}
