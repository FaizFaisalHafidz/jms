<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\StokCabang;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LaporanStokController extends Controller
{
    public function index(Request $request)
    {
        $cabangId = $request->input('cabang_id');

        // Stats
        $totalBarang = Barang::where('status_aktif', true)->count();
        
        $totalStok = StokCabang::when($cabangId, function($query) use ($cabangId) {
                $query->where('cabang_id', $cabangId);
            })
            ->sum('jumlah_stok');

        $stokRendah = StokCabang::when($cabangId, function($query) use ($cabangId) {
                $query->where('cabang_id', $cabangId);
            })
            ->whereRaw('jumlah_stok <= stok_minimal')
            ->count();

        $nilaiStok = StokCabang::with('barang')
            ->when($cabangId, function($query) use ($cabangId) {
                $query->where('cabang_id', $cabangId);
            })
            ->get()
            ->sum(function($stok) {
                return $stok->jumlah_stok * $stok->barang->harga_beli;
            });

        // Stok per Cabang
        $stokPerCabang = Cabang::where('status_aktif', true)
            ->withSum('stokCabang', 'jumlah_stok')
            ->withCount(['stokCabang as stok_rendah' => function($query) {
                $query->whereRaw('jumlah_stok <= stok_minimal');
            }])
            ->get()
            ->map(function($cabang) {
                return [
                    'id' => $cabang->id,
                    'nama_cabang' => $cabang->nama_cabang,
                    'kota' => $cabang->kota,
                    'total_stok' => $cabang->stok_cabang_sum_jumlah_stok ?? 0,
                    'stok_rendah' => $cabang->stok_rendah ?? 0,
                ];
            });

        // Detail Stok Barang
        $detailStok = Barang::with(['stokCabang' => function($query) use ($cabangId) {
                $query->when($cabangId, function($q) use ($cabangId) {
                    $q->where('cabang_id', $cabangId);
                })
                ->with('cabang:id,nama_cabang,kota');
            }, 'kategori:id,nama_kategori'])
            ->where('status_aktif', true)
            ->whereHas('stokCabang', function($query) use ($cabangId) {
                if ($cabangId) {
                    $query->where('cabang_id', $cabangId);
                }
            })
            ->get()
            ->flatMap(function($barang) use ($cabangId) {
                if ($cabangId) {
                    $stok = $barang->stokCabang->first();
                    if (!$stok) {
                        return [];
                    }
                    return [[
                        'kode_barang' => $barang->kode_barang,
                        'nama_barang' => $barang->nama_barang,
                        'kategori' => $barang->kategori ? $barang->kategori->nama_kategori : '-',
                        'cabang' => $stok->cabang->nama_cabang,
                        'jumlah_stok' => $stok->jumlah_stok,
                        'stok_minimal' => $stok->stok_minimal,
                        'status' => $stok->jumlah_stok <= $stok->stok_minimal ? 'rendah' : 'normal',
                    ]];
                } else {
                    return $barang->stokCabang->map(function($stok) use ($barang) {
                        return [
                            'kode_barang' => $barang->kode_barang,
                            'nama_barang' => $barang->nama_barang,
                            'kategori' => $barang->kategori ? $barang->kategori->nama_kategori : '-',
                            'cabang' => $stok->cabang->nama_cabang,
                            'kota' => $stok->cabang->kota,
                            'jumlah_stok' => $stok->jumlah_stok,
                            'stok_minimal' => $stok->stok_minimal,
                            'status' => $stok->jumlah_stok <= $stok->stok_minimal ? 'rendah' : 'normal',
                        ];
                    })->toArray();
                }
            })
            ->values()
            ->toArray();

        // Top 10 Barang Stok Terbanyak
        $topStok = StokCabang::with(['barang:id,nama_barang', 'cabang:id,nama_cabang'])
            ->when($cabangId, function($query) use ($cabangId) {
                $query->where('cabang_id', $cabangId);
            })
            ->orderByDesc('jumlah_stok')
            ->limit(10)
            ->get()
            ->map(function($stok) {
                return [
                    'nama_barang' => $stok->barang->nama_barang,
                    'cabang' => $stok->cabang->nama_cabang,
                    'jumlah_stok' => $stok->jumlah_stok,
                ];
            });

        // Stok Rendah (Alert)
        $alertStokRendah = StokCabang::with(['barang:id,nama_barang,kode_barang', 'cabang:id,nama_cabang,kota'])
            ->when($cabangId, function($query) use ($cabangId) {
                $query->where('cabang_id', $cabangId);
            })
            ->whereRaw('jumlah_stok <= stok_minimal')
            ->orderBy('jumlah_stok')
            ->get()
            ->map(function($stok) {
                return [
                    'kode_barang' => $stok->barang->kode_barang,
                    'nama_barang' => $stok->barang->nama_barang,
                    'cabang' => $stok->cabang->nama_cabang,
                    'kota' => $stok->cabang->kota,
                    'jumlah_stok' => $stok->jumlah_stok,
                    'stok_minimal' => $stok->stok_minimal,
                ];
            });

        // List Cabang untuk filter
        $cabangList = Cabang::where('status_aktif', true)
            ->orderBy('nama_cabang')
            ->get()
            ->map(function($cabang) {
                return [
                    'id' => $cabang->id,
                    'nama_cabang' => $cabang->nama_cabang,
                    'kota' => $cabang->kota,
                ];
            });

        return Inertia::render('laporan/stok/index', [
            'filters' => [
                'cabang_id' => $cabangId,
            ],
            'stats' => [
                'total_barang' => $totalBarang,
                'total_stok' => $totalStok,
                'stok_rendah' => $stokRendah,
                'nilai_stok' => $nilaiStok,
            ],
            'stok_per_cabang' => $stokPerCabang,
            'detail_stok' => $detailStok,
            'top_stok' => $topStok,
            'alert_stok_rendah' => $alertStokRendah,
            'cabang_list' => $cabangList,
        ]);
    }
}
