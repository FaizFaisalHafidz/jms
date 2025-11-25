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

        // Pendapatan dari Penjualan
        $penjualan = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('total_bayar');
        
        // Laba Kotor dari Penjualan (sudah dihitung saat transaksi)
        $labaKotorPenjualan = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('total_laba');

        // Pendapatan dari Service
        $service = ServiceHp::whereIn('status_service', ['selesai', 'diambil'])
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->whereNull('tanggal_selesai')
                            ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                      });
            })
            ->sum('total_biaya');
        
        // Laba dari Service (sudah dikurangi modal spare part jika pakai inventory)
        $labaService = ServiceHp::whereIn('status_service', ['selesai', 'diambil'])
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->whereNull('tanggal_selesai')
                            ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                      });
            })
            ->sum('laba_service');

        // Retur penjualan (pengurang pendapatan)
        $retur = ReturPenjualan::where('status_retur', 'disetujui')
            ->where('jenis_retur', 'uang_kembali')
            ->whereBetween('tanggal_retur', [$startDate, $endDate])
            ->sum('total_nilai_retur');

        $totalPendapatan = $penjualan + $service - $retur;

        // Biaya Operasional (tidak termasuk pembelian barang)
        $biayaOperasional = Pengeluaran::whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
            ->sum('jumlah');

        // Laba Bersih = Laba Kotor Penjualan + Laba Service - Biaya Operasional - Retur
        $labaBersih = $labaKotorPenjualan + $labaService - $biayaOperasional - $retur;

        // Laba per Cabang
        $labaPerCabang = Cabang::where('status_aktif', true)
            ->get()
            ->map(function($cabang) use ($startDate, $endDate) {
                $penjualanCabang = Transaksi::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
                    ->sum('total_bayar');
                
                $labaKotorCabang = Transaksi::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
                    ->sum('total_laba');

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

                $pengeluaranCabang = Pengeluaran::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
                    ->sum('jumlah');

                $pendapatan = $penjualanCabang + $serviceCabang - $returCabang;
                $labaBersih = $labaKotorCabang + $serviceCabang - $pengeluaranCabang - $returCabang;

                return [
                    'nama_cabang' => $cabang->nama_cabang,
                    'kota' => $cabang->kota,
                    'pendapatan' => $pendapatan,
                    'laba_kotor' => $labaKotorCabang,
                    'biaya_operasional' => $pengeluaranCabang,
                    'laba_bersih' => $labaBersih,
                ];
            });

        // Grafik Laba Harian
        $grafikLaba = [];
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $dayStart = $currentDate->copy()->startOfDay();
            $dayEnd = $currentDate->copy()->endOfDay();

            $dayLabaKotor = Transaksi::whereBetween('tanggal_transaksi', [$dayStart, $dayEnd])->sum('total_laba');
            $dayService = ServiceHp::whereIn('status_service', ['selesai', 'diambil'])
                ->whereBetween('tanggal_masuk', [$dayStart, $dayEnd])
                ->sum('total_biaya');
            $dayPengeluaran = Pengeluaran::whereBetween('tanggal_pengeluaran', [$dayStart, $dayEnd])->sum('jumlah');

            $dayLabaBersih = $dayLabaKotor + $dayService - $dayPengeluaran;

            $grafikLaba[] = [
                'tanggal' => $currentDate->format('Y-m-d'),
                'laba_kotor' => $dayLabaKotor,
                'pendapatan_service' => $dayService,
                'biaya_operasional' => $dayPengeluaran,
                'laba_bersih' => $dayLabaBersih,
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
                'laba_kotor_penjualan' => $labaKotorPenjualan,
                'laba_service' => $labaService,
                'biaya_operasional' => $biayaOperasional,
                'laba_bersih' => $labaBersih,
            ],
            'laba_per_cabang' => $labaPerCabang,
            'grafik_laba' => $grafikLaba,
            'breakdown_pengeluaran' => $breakdownPengeluaran,
        ]);
    }
}
