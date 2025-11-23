<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LaporanPenjualanController extends Controller
{
    public function index(Request $request)
    {
        // Filter type: 'harian' atau 'bulanan'
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

        // Total Penjualan
        $totalPenjualan = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('total_bayar');

        $totalTransaksi = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->count();

        $totalItem = DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.transaksi_id', '=', 'transaksi.id')
            ->whereBetween('transaksi.tanggal_transaksi', [$startDate, $endDate])
            ->sum('detail_transaksi.jumlah');

        $totalLaba = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('total_laba');

        // Penjualan per Cabang
        $penjualanPerCabang = Cabang::where('status_aktif', true)
            ->withSum(['transaksi as total_penjualan' => function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_transaksi', [$startDate, $endDate]);
            }], 'total_bayar')
            ->withCount(['transaksi as total_transaksi' => function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_transaksi', [$startDate, $endDate]);
            }])
            ->get()
            ->map(function($cabang) {
                return [
                    'nama_cabang' => $cabang->nama_cabang,
                    'kota' => $cabang->kota,
                    'total_penjualan' => $cabang->total_penjualan ?? 0,
                    'total_transaksi' => $cabang->total_transaksi ?? 0,
                ];
            });

        // Grafik Penjualan
        $grafikPenjualan = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(tanggal_transaksi) as tanggal'),
                DB::raw('SUM(total_bayar) as total'),
                DB::raw('COUNT(*) as jumlah_transaksi')
            )
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        // Top 10 Barang Terlaris
        $topBarang = DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.transaksi_id', '=', 'transaksi.id')
            ->whereBetween('transaksi.tanggal_transaksi', [$startDate, $endDate])
            ->select(
                'detail_transaksi.nama_barang',
                DB::raw('SUM(detail_transaksi.jumlah) as total_terjual'),
                DB::raw('SUM(detail_transaksi.jumlah * detail_transaksi.harga_jual) as total_omzet')
            )
            ->groupBy('detail_transaksi.nama_barang')
            ->orderByDesc('total_terjual')
            ->limit(10)
            ->get();

        // Penjualan per Metode Pembayaran
        $perMetodePembayaran = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->select('metode_pembayaran', DB::raw('COUNT(*) as jumlah'), DB::raw('SUM(total_bayar) as total'))
            ->groupBy('metode_pembayaran')
            ->get();

        return Inertia::render('laporan/penjualan/index', [
            'filters' => [
                'filter_type' => $filterType,
                'tanggal' => $filterType === 'harian' ? ($request->input('tanggal', date('Y-m-d'))) : null,
                'tahun' => $filterType === 'bulanan' ? ($request->input('tahun', date('Y'))) : null,
                'bulan' => $filterType === 'bulanan' ? ($request->input('bulan', date('m'))) : null,
            ],
            'stats' => [
                'total_penjualan' => $totalPenjualan,
                'total_transaksi' => $totalTransaksi,
                'total_item' => $totalItem,
                'total_laba' => $totalLaba,
            ],
            'penjualan_per_cabang' => $penjualanPerCabang,
            'grafik_penjualan' => $grafikPenjualan,
            'top_barang' => $topBarang,
            'per_metode_pembayaran' => $perMetodePembayaran,
        ]);
    }
}
