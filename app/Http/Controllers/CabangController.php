<?php

namespace App\Http\Controllers;

use App\Models\Cabang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CabangController extends Controller
{
    public function index()
    {
        $cabangs = Cabang::query()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cabang) {
                return [
                    'id' => $cabang->id,
                    'kode_cabang' => $cabang->kode_cabang,
                    'nama_cabang' => $cabang->nama_cabang,
                    'alamat' => $cabang->alamat,
                    'telepon' => $cabang->telepon,
                    'kota' => $cabang->kota,
                    'provinsi' => $cabang->provinsi,
                    'kode_pos' => $cabang->kode_pos,
                    'status_aktif' => $cabang->status_aktif,
                    'created_at' => $cabang->created_at->format('d/m/Y H:i'),
                ];
            });

        $stats = [
            'total' => Cabang::count(),
            'aktif' => Cabang::where('status_aktif', true)->count(),
            'nonaktif' => Cabang::where('status_aktif', false)->count(),
        ];

        return Inertia::render('cabang/index', [
            'cabangs' => $cabangs,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode_cabang' => 'required|string|max:10|unique:cabang,kode_cabang',
            'nama_cabang' => 'required|string|max:100',
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
            'kota' => 'required|string|max:50',
            'provinsi' => 'required|string|max:50',
            'kode_pos' => 'required|string|max:10',
            'status_aktif' => 'required|boolean',
        ], [
            'kode_cabang.required' => 'Kode cabang wajib diisi',
            'kode_cabang.unique' => 'Kode cabang sudah digunakan',
            'nama_cabang.required' => 'Nama cabang wajib diisi',
            'alamat.required' => 'Alamat wajib diisi',
            'telepon.required' => 'Telepon wajib diisi',
            'kota.required' => 'Kota wajib diisi',
            'provinsi.required' => 'Provinsi wajib diisi',
            'kode_pos.required' => 'Kode pos wajib diisi',
            'status_aktif.required' => 'Status aktif wajib dipilih',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        Cabang::create($validator->validated());

        return redirect()->route('cabang.index')
            ->with('success', 'Cabang berhasil ditambahkan');
    }

    public function update(Request $request, Cabang $cabang)
    {
        $validator = Validator::make($request->all(), [
            'kode_cabang' => 'required|string|max:10|unique:cabang,kode_cabang,' . $cabang->id,
            'nama_cabang' => 'required|string|max:100',
            'alamat' => 'required|string',
            'telepon' => 'required|string|max:20',
            'kota' => 'required|string|max:50',
            'provinsi' => 'required|string|max:50',
            'kode_pos' => 'required|string|max:10',
            'status_aktif' => 'required|boolean',
        ], [
            'kode_cabang.required' => 'Kode cabang wajib diisi',
            'kode_cabang.unique' => 'Kode cabang sudah digunakan',
            'nama_cabang.required' => 'Nama cabang wajib diisi',
            'alamat.required' => 'Alamat wajib diisi',
            'telepon.required' => 'Telepon wajib diisi',
            'kota.required' => 'Kota wajib diisi',
            'provinsi.required' => 'Provinsi wajib diisi',
            'kode_pos.required' => 'Kode pos wajib diisi',
            'status_aktif.required' => 'Status aktif wajib dipilih',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $cabang->update($validator->validated());

        return redirect()->route('cabang.index')
            ->with('success', 'Cabang berhasil diperbarui');
    }

    public function destroy(Cabang $cabang)
    {
        // Cek apakah cabang memiliki relasi yang masih aktif
        if ($cabang->users()->count() > 0) {
            return back()->with('error', 'Cabang tidak dapat dihapus karena masih memiliki pengguna');
        }

        if ($cabang->stokCabang()->count() > 0) {
            return back()->with('error', 'Cabang tidak dapat dihapus karena masih memiliki data stok');
        }

        $cabang->delete();

        return redirect()->route('cabang.index')
            ->with('success', 'Cabang berhasil dihapus');
    }
}
