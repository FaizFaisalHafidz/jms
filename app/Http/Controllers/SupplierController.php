<?php

namespace App\Http\Controllers;

use App\Models\Suplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $suppliers = Suplier::orderBy('nama_suplier')->get();
        
        // Stats
        $total = Suplier::count();
        $aktif = Suplier::where('status_aktif', true)->count();
        $nonaktif = Suplier::where('status_aktif', false)->count();

        return Inertia::render('supplier/index', [
            'suppliers' => $suppliers,
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
            'kode_suplier' => 'required|string|max:20|unique:suplier,kode_suplier',
            'nama_suplier' => 'required|string|max:100',
            'nama_perusahaan' => 'nullable|string|max:150',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'kontak_person' => 'nullable|string|max:100',
            'status_aktif' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        Suplier::create($validator->validated());

        return redirect()->route('supplier.index')
            ->with('success', 'Supplier berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Suplier $supplier)
    {
        $validator = Validator::make($request->all(), [
            'kode_suplier' => 'required|string|max:20|unique:suplier,kode_suplier,' . $supplier->id,
            'nama_suplier' => 'required|string|max:100',
            'nama_perusahaan' => 'nullable|string|max:150',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'kontak_person' => 'nullable|string|max:100',
            'status_aktif' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $supplier->update($validator->validated());

        return redirect()->route('supplier.index')
            ->with('success', 'Supplier berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Suplier $supplier)
    {
        // Check if supplier has related records
        if ($supplier->barang()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Supplier tidak dapat dihapus karena masih memiliki barang terkait');
        }

        if ($supplier->pembelian()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Supplier tidak dapat dihapus karena masih memiliki pembelian terkait');
        }

        $supplier->delete();

        return redirect()->route('supplier.index')
            ->with('success', 'Supplier berhasil dihapus');
    }
}
