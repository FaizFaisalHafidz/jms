<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Pembelian;
use App\Models\ServiceHp;
use App\Models\Pengeluaran;
use App\Models\ReturPenjualan;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $tahun = $request->input('tahun', date('Y'));
        $bulan = $request->input('bulan', date('m'));

        // Filter berdasarkan tahun dan bulan
        $startDate = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth();

        // Total keseluruhan semua cabang
        $totalPenjualan = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('total_bayar');

        $totalPembelian = Pembelian::whereBetween('tanggal_pembelian', [$startDate, $endDate])
            ->sum('total_bayar');

        $totalService = ServiceHp::where('status_service', 'diambil')
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->whereNull('tanggal_selesai')
                            ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                      });
            })
            ->sum('total_biaya');

        $totalPengeluaran = Pengeluaran::whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
            ->sum('jumlah');

        $totalRetur = ReturPenjualan::where('status_retur', 'disetujui')
            ->where('jenis_retur', 'uang_kembali')
            ->whereBetween('tanggal_retur', [$startDate, $endDate])
            ->sum('total_nilai_retur');

        $totalPendapatan = $totalPenjualan + $totalService - $totalRetur;
        $labaBersih = $totalPendapatan - $totalPembelian - $totalPengeluaran;

        // Laporan per Cabang
        $laporanPerCabang = Cabang::where('status_aktif', true)
            ->get()
            ->map(function ($cabang) use ($startDate, $endDate) {
                $penjualan = Transaksi::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
                    ->sum('total_bayar');

                $pembelian = Pembelian::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_pembelian', [$startDate, $endDate])
                    ->sum('total_bayar');

                $service = ServiceHp::where('cabang_id', $cabang->id)
                    ->where('status_service', 'diambil')
                    ->where(function($query) use ($startDate, $endDate) {
                        $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                              ->orWhere(function($q) use ($startDate, $endDate) {
                                  $q->whereNull('tanggal_selesai')
                                    ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                              });
                    })
                    ->sum('total_biaya');

                $pengeluaran = Pengeluaran::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
                    ->sum('jumlah');

                $retur = ReturPenjualan::where('cabang_id', $cabang->id)
                    ->where('status_retur', 'disetujui')
                    ->where('jenis_retur', 'uang_kembali')
                    ->whereBetween('tanggal_retur', [$startDate, $endDate])
                    ->sum('total_nilai_retur');

                $pendapatan = $penjualan + $service - $retur;
                $laba = $pendapatan - $pembelian - $pengeluaran;

                return [
                    'id' => $cabang->id,
                    'nama_cabang' => $cabang->nama_cabang,
                    'kota' => $cabang->kota,
                    'penjualan' => $penjualan,
                    'pembelian' => $pembelian,
                    'service' => $service,
                    'pengeluaran' => $pengeluaran,
                    'retur' => $retur,
                    'pendapatan' => $pendapatan,
                    'laba_bersih' => $laba,
                ];
            });

        // Grafik Penjualan per Hari
        $penjualanHarian = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(tanggal_transaksi) as tanggal'),
                DB::raw('SUM(total_bayar) as total')
            )
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        // Top 5 Cabang Terlaris
        $topCabang = Cabang::where('status_aktif', true)
            ->withSum(['transaksi as total_penjualan' => function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_transaksi', [$startDate, $endDate]);
            }], 'total_bayar')
            ->orderByDesc('total_penjualan')
            ->limit(5)
            ->get()
            ->map(function($cabang) {
                return [
                    'nama_cabang' => $cabang->nama_cabang,
                    'kota' => $cabang->kota,
                    'total_penjualan' => $cabang->total_penjualan ?? 0,
                ];
            });

        return Inertia::render('laporan/index', [
            'filters' => [
                'tahun' => $tahun,
                'bulan' => $bulan,
            ],
            'stats' => [
                'total_penjualan' => $totalPenjualan,
                'total_pembelian' => $totalPembelian,
                'total_service' => $totalService,
                'total_pengeluaran' => $totalPengeluaran,
                'total_retur' => $totalRetur,
                'total_pendapatan' => $totalPendapatan,
                'laba_bersih' => $labaBersih,
            ],
            'laporan_per_cabang' => $laporanPerCabang,
            'charts' => [
                'penjualan_harian' => $penjualanHarian,
            ],
            'top_cabang' => $topCabang,
        ]);
    }
}
