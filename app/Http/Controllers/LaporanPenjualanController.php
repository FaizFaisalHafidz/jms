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
        $cabangList = Cabang::where('status_aktif', true)->get();
        $cabangId = $request->input('cabang_id');

        // Jika tidak ada cabang yang dipilih, kembalikan hanya list cabang
        if (!$cabangId) {
            return Inertia::render('laporan/penjualan/index', [
                'mode' => 'selection',
                'cabang_list' => $cabangList,
                'filters' => [
                    'filter_type' => 'harian',
                ],
                'stats' => [ // Default stats or null
                    'total_penjualan' => 0,
                    'total_transaksi' => 0,
                    'total_item' => 0,
                    'total_laba' => 0,
                    'total_service_omzet' => 0,
                    'total_service_count' => 0,
                    'total_service_laba' => 0,
                ],
            ]);
        }

        $selectedCabang = Cabang::find($cabangId);
        if (!$selectedCabang) {
            return redirect()->route('laporan.penjualan');
        }

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

        // Base Query Scoped by Cabang
        $transaksiQuery = Transaksi::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate]);

        // Stats
        $totalPenjualan = (clone $transaksiQuery)->sum('total_bayar');
        $totalTransaksi = (clone $transaksiQuery)->count();
        $totalLaba = (clone $transaksiQuery)->sum('total_laba');
        
        $totalItem = DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.transaksi_id', '=', 'transaksi.id')
            ->where('transaksi.cabang_id', $cabangId)
            ->whereBetween('transaksi.tanggal_transaksi', [$startDate, $endDate])
            ->sum('detail_transaksi.jumlah');

        // Service Query Scoped by Cabang (Base for Date and Cabang)
        // Gunakan tanggal_diambil untuk laporan pendapatan service yang akurat
        $serviceBaseQuery = \App\Models\ServiceHp::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_diambil', [$startDate, $endDate]);

        // Stats Service (Hanya yang sudah 'diambil' yang dihitung sebagai pendapatan)
        $serviceStatsQuery = (clone $serviceBaseQuery)->where('status_service', 'diambil');

        $totalServiceOmzet = $serviceStatsQuery->sum('total_biaya');
        $totalServiceCount = $serviceStatsQuery->count();
        $totalServiceLaba = $serviceStatsQuery->sum('laba_service');

        $totalKeseluruhan = $totalPenjualan + $totalServiceOmzet;

        // Daftar Transaksi (Penjualan)
        $daftarTransaksi = Transaksi::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->with(['detailTransaksi:id,transaksi_id,nama_barang,jumlah,harga_jual,subtotal'])
            ->orderByDesc('tanggal_transaksi')
            ->paginate(10, ['*'], 'page_transaksi')
            ->withQueryString();

        // Daftar Service (Menampilkan yang 'selesai' dan 'diambil' untuk monitoring)
        $daftarService = (clone $serviceBaseQuery)
            ->whereIn('status_service', ['selesai', 'diambil'])
            ->orderByDesc('updated_at')
            ->paginate(10, ['*'], 'page_service')
            ->withQueryString();
            
        // Jika ingin juga menampilkan service yang masuk tapi belum selesai, bisa disesuaikan querynya
        // Untuk laporan keuangan biasanya yang sudah lunas/selesai.
        
        // Grafik Penjualan
        $grafikPenjualan = Transaksi::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(tanggal_transaksi) as tanggal'),
                DB::raw('SUM(total_bayar) as total'),
                DB::raw('COUNT(*) as jumlah_transaksi')
            )
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        // Top Barang
        $topBarang = DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.transaksi_id', '=', 'transaksi.id')
            ->where('transaksi.cabang_id', $cabangId)
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

        $perMetodePembayaran = DB::table('transaksi_pembayaran')
            ->join('transaksi', 'transaksi_pembayaran.transaksi_id', '=', 'transaksi.id')
            ->where('transaksi.cabang_id', $cabangId)
            ->whereBetween('transaksi.tanggal_transaksi', [$startDate, $endDate])
            ->select(
                'transaksi_pembayaran.metode_pembayaran',
                DB::raw('COUNT(DISTINCT transaksi.id) as jumlah_transaksi'), // Count affected transactions
                DB::raw('SUM(transaksi_pembayaran.nominal) as total') // Sum actual payments
            )
            ->groupBy('transaksi_pembayaran.metode_pembayaran')
            ->get();

        return Inertia::render('laporan/penjualan/index', [
            'mode' => 'detail',
            'cabang_list' => $cabangList,
            'selected_cabang' => $selectedCabang,
            'filters' => [
                'filter_type' => $filterType,
                'tanggal' => $filterType === 'harian' ? ($request->input('tanggal', date('Y-m-d'))) : null,
                'tahun' => $filterType === 'bulanan' ? ($request->input('tahun', date('Y'))) : null,
                'bulan' => $filterType === 'bulanan' ? ($request->input('bulan', date('m'))) : null,
                'cabang_id' => $cabangId,
            ],
            'stats' => [
                'total_penjualan' => $totalPenjualan,
                'total_transaksi' => $totalTransaksi,
                'total_item' => $totalItem,
                'total_laba' => $totalLaba,
                'total_service_omzet' => $totalServiceOmzet,
                'total_service_count' => $totalServiceCount,
                'total_service_laba' => $totalServiceLaba,
                'total_keseluruhan' => $totalKeseluruhan,
            ],
            'grafik_penjualan' => $grafikPenjualan,
            'top_barang' => $topBarang,
            'per_metode_pembayaran' => $perMetodePembayaran,
            'daftar_transaksi' => $daftarTransaksi,
            'daftar_service' => $daftarService,
        ]);
    }
}

