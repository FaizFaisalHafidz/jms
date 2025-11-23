<?php

namespace App\Http\Controllers;

use App\Models\KategoriBarang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class KategoriBarangController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kategoriBarang = KategoriBarang::orderBy('nama_kategori')->get();
        
        // Stats
        $total = KategoriBarang::count();
        $aktif = KategoriBarang::where('status_aktif', true)->count();
        $nonaktif = KategoriBarang::where('status_aktif', false)->count();

        return Inertia::render('kategori-barang/index', [
            'kategoriBarang' => $kategoriBarang,
            'stats' => [
                'total' => $total,
                'aktif' => $aktif,
                'nonaktif' => $nonaktif,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_kategori' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'status_aktif' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        KategoriBarang::create($validator->validated());

        return redirect()->route('kategori-barang.index')
            ->with('success', 'Kategori barang berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KategoriBarang $kategoriBarang)
    {
        $validator = Validator::make($request->all(), [
            'nama_kategori' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'status_aktif' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $kategoriBarang->update($validator->validated());

        return redirect()->route('kategori-barang.index')
            ->with('success', 'Kategori barang berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KategoriBarang $kategoriBarang)
    {
        // Check if kategori has related barang
        if ($kategoriBarang->barang()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Kategori barang tidak dapat dihapus karena masih memiliki barang terkait');
        }

        $kategoriBarang->delete();

        return redirect()->route('kategori-barang.index')
            ->with('success', 'Kategori barang berhasil dihapus');
    }
}
