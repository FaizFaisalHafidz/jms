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

class LaporanLabaRugiController extends Controller
{
    public function index(Request $request)
    {
        $filterType = $request->input('filter_type', 'harian');
        
        if ($filterType === 'harian') {
            $tanggal = $request->input('tanggal', date('Y-m-d'));
            $startDate = Carbon::parse($tanggal)->startOfDay();
            $endDate = Carbon::parse($tanggal)->endOfDay();
        } else {
            $tahun = $request->input('tahun', date('Y'));
            $bulan = $request->input('bulan', date('m'));
            $startDate = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth();
            $endDate = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth();
        }

        // Pendapatan
        $penjualan = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('total_bayar');

        $service = ServiceHp::whereIn('status_service', ['selesai', 'diambil'])
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->whereNull('tanggal_selesai')
                            ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                      });
            })
            ->sum('total_biaya');

        $retur = ReturPenjualan::where('status_retur', 'disetujui')
            ->where('jenis_retur', 'uang_kembali')
            ->whereBetween('tanggal_retur', [$startDate, $endDate])
            ->sum('total_nilai_retur');

        $totalPendapatan = $penjualan + $service - $retur;

        // Pengeluaran
        $pembelian = Pembelian::whereBetween('tanggal_pembelian', [$startDate, $endDate])
            ->sum('total_bayar');

        $biayaOperasional = Pengeluaran::whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
            ->sum('jumlah');

        $totalPengeluaran = $pembelian + $biayaOperasional;

        // Laba/Rugi
        $labaRugi = $totalPendapatan - $totalPengeluaran;

        // Laba per Cabang
        $labaPerCabang = Cabang::where('status_aktif', true)
            ->get()
            ->map(function($cabang) use ($startDate, $endDate) {
                $penjualanCabang = Transaksi::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
                    ->sum('total_bayar');

                $serviceCabang = ServiceHp::where('cabang_id', $cabang->id)
                    ->whereIn('status_service', ['selesai', 'diambil'])
                    ->where(function($query) use ($startDate, $endDate) {
                        $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                              ->orWhere(function($q) use ($startDate, $endDate) {
                                  $q->whereNull('tanggal_selesai')
                                    ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                              });
                    })
                    ->sum('total_biaya');

                $returCabang = ReturPenjualan::where('cabang_id', $cabang->id)
                    ->where('status_retur', 'disetujui')
                    ->where('jenis_retur', 'uang_kembali')
                    ->whereBetween('tanggal_retur', [$startDate, $endDate])
                    ->sum('total_nilai_retur');

                $pembelianCabang = Pembelian::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_pembelian', [$startDate, $endDate])
                    ->sum('total_bayar');

                $pengeluaranCabang = Pengeluaran::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
                    ->sum('jumlah');

                $pendapatan = $penjualanCabang + $serviceCabang - $returCabang;
                $pengeluaran = $pembelianCabang + $pengeluaranCabang;
                $laba = $pendapatan - $pengeluaran;

                return [
                    'nama_cabang' => $cabang->nama_cabang,
                    'kota' => $cabang->kota,
                    'pendapatan' => $pendapatan,
                    'pengeluaran' => $pengeluaran,
                    'laba_rugi' => $laba,
                ];
            });

        // Grafik Laba Harian
        $grafikLaba = [];
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $dayStart = $currentDate->copy()->startOfDay();
            $dayEnd = $currentDate->copy()->endOfDay();

            $dayPenjualan = Transaksi::whereBetween('tanggal_transaksi', [$dayStart, $dayEnd])->sum('total_bayar');
            $dayService = ServiceHp::whereIn('status_service', ['selesai', 'diambil'])
                ->whereBetween('tanggal_masuk', [$dayStart, $dayEnd])
                ->sum('total_biaya');
            $dayPembelian = Pembelian::whereBetween('tanggal_pembelian', [$dayStart, $dayEnd])->sum('total_bayar');
            $dayPengeluaran = Pengeluaran::whereBetween('tanggal_pengeluaran', [$dayStart, $dayEnd])->sum('jumlah');

            $dayPendapatan = $dayPenjualan + $dayService;
            $dayTotal = $dayPendapatan - $dayPembelian - $dayPengeluaran;

            $grafikLaba[] = [
                'tanggal' => $currentDate->format('Y-m-d'),
                'pendapatan' => $dayPendapatan,
                'pengeluaran' => $dayPembelian + $dayPengeluaran,
                'laba' => $dayTotal,
            ];

            $currentDate->addDay();
        }

        // Breakdown Pengeluaran
        $breakdownPengeluaran = Pengeluaran::whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
            ->select('kategori_pengeluaran', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori_pengeluaran')
            ->get();

        return Inertia::render('laporan/laba-rugi/index', [
            'filters' => [
                'filter_type' => $filterType,
                'tanggal' => $filterType === 'harian' ? ($request->input('tanggal', date('Y-m-d'))) : null,
                'tahun' => $filterType === 'bulanan' ? ($request->input('tahun', date('Y'))) : null,
                'bulan' => $filterType === 'bulanan' ? ($request->input('bulan', date('m'))) : null,
            ],
            'stats' => [
                'penjualan' => $penjualan,
                'service' => $service,
                'retur' => $retur,
                'total_pendapatan' => $totalPendapatan,
                'pembelian' => $pembelian,
                'biaya_operasional' => $biayaOperasional,
                'total_pengeluaran' => $totalPengeluaran,
                'laba_rugi' => $labaRugi,
            ],
            'laba_per_cabang' => $labaPerCabang,
            'grafik_laba' => $grafikLaba,
            'breakdown_pengeluaran' => $breakdownPengeluaran,
        ]);
    }
}
