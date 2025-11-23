<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Pembelian;
use App\Models\ServiceHp;
use App\Models\ReturPenjualan;
use App\Models\Pengeluaran;
use App\Models\Barang;
use App\Models\StokCabang;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Cek role user
        if ($user->hasRole('super_admin')) {
            return $this->superAdminDashboard($today, $startOfMonth, $endOfMonth);
        } elseif ($user->hasRole('owner')) {
            return $this->ownerDashboard($today, $startOfMonth, $endOfMonth);
        } elseif ($user->hasRole('admin_cabang')) {
            return $this->adminCabangDashboard($user, $today, $startOfMonth, $endOfMonth);
        }

        // Default fallback
        return Inertia::render('dashboard', [
            'stats' => [],
            'charts' => [],
        ]);
    }

    private function superAdminDashboard($today, $startOfMonth, $endOfMonth)
    {
        // Total Cabang
        $totalCabang = Cabang::where('status_aktif', true)->count();

        // Total User
        $totalUser = \App\Models\User::count();

        // Total Barang
        $totalBarang = Barang::where('status_aktif', true)->count();

        // Total Stok Keseluruhan
        $totalStok = StokCabang::sum('jumlah_stok');

        // Penjualan Hari Ini
        $penjualanHariIni = Transaksi::whereDate('tanggal_transaksi', $today)->sum('total_bayar');

        // Penjualan Bulan Ini
        $penjualanBulanIni = Transaksi::whereBetween('tanggal_transaksi', [$startOfMonth, $endOfMonth])->sum('total_bayar');

        // Grafik Penjualan 7 Hari Terakhir
        $grafikPenjualan = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $total = Transaksi::whereDate('tanggal_transaksi', $date)->sum('total_bayar');
            $grafikPenjualan[] = [
                'tanggal' => $date->format('d M'),
                'total' => $total,
            ];
        }

        // Top 5 Cabang (Penjualan Bulan Ini)
        $topCabang = Cabang::where('status_aktif', true)
            ->withSum(['transaksi as total_penjualan' => function($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('tanggal_transaksi', [$startOfMonth, $endOfMonth]);
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

        return Inertia::render('dashboard', [
            'role' => 'super_admin',
            'stats' => [
                'total_cabang' => $totalCabang,
                'total_user' => $totalUser,
                'total_barang' => $totalBarang,
                'total_stok' => $totalStok,
                'penjualan_hari_ini' => $penjualanHariIni,
                'penjualan_bulan_ini' => $penjualanBulanIni,
            ],
            'grafik_penjualan' => $grafikPenjualan,
            'top_cabang' => $topCabang,
        ]);
    }

    private function ownerDashboard($today, $startOfMonth, $endOfMonth)
    {
        // Total Penjualan Hari Ini
        $penjualanHariIni = Transaksi::whereDate('tanggal_transaksi', $today)->sum('total_bayar');

        // Total Penjualan Bulan Ini
        $penjualanBulanIni = Transaksi::whereBetween('tanggal_transaksi', [$startOfMonth, $endOfMonth])->sum('total_bayar');

        // Total Laba Bulan Ini (dari field total_laba di transaksi)
        $labaBulanIni = Transaksi::whereBetween('tanggal_transaksi', [$startOfMonth, $endOfMonth])->sum('total_laba');

        // Total Pembelian Bulan Ini
        $pembelianBulanIni = Pembelian::whereBetween('tanggal_pembelian', [$startOfMonth, $endOfMonth])->sum('total_bayar');

        // Total Pengeluaran Bulan Ini
        $pengeluaranBulanIni = Pengeluaran::whereBetween('tanggal_pengeluaran', [$startOfMonth, $endOfMonth])->sum('jumlah');

        // Laba Bersih = Laba Penjualan - (Pembelian + Pengeluaran)
        $labaBersih = $labaBulanIni - ($pembelianBulanIni + $pengeluaranBulanIni);

        // Total Stok Keseluruhan
        $totalStok = StokCabang::sum('jumlah_stok');

        // Stok Rendah
        $stokRendah = StokCabang::whereRaw('jumlah_stok <= stok_minimal')->count();

        // Grafik Penjualan vs Pembelian 7 Hari Terakhir
        $grafikKeuangan = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $penjualan = Transaksi::whereDate('tanggal_transaksi', $date)->sum('total_bayar');
            $laba = Transaksi::whereDate('tanggal_transaksi', $date)->sum('total_laba');
            $pembelian = Pembelian::whereDate('tanggal_pembelian', $date)->sum('total_bayar');
            $pengeluaran = Pengeluaran::whereDate('tanggal_pengeluaran', $date)->sum('jumlah');
            $grafikKeuangan[] = [
                'tanggal' => $date->format('d M'),
                'penjualan' => $penjualan,
                'pembelian' => $pembelian,
                'laba_kotor' => $laba,
                'laba_bersih' => $laba - ($pembelian + $pengeluaran),
            ];
        }

        // Top 5 Barang Terlaris Bulan Ini
        $topBarang = DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.transaksi_id', '=', 'transaksi.id')
            ->whereBetween('transaksi.tanggal_transaksi', [$startOfMonth, $endOfMonth])
            ->select('detail_transaksi.nama_barang', DB::raw('SUM(detail_transaksi.jumlah) as total_terjual'))
            ->groupBy('detail_transaksi.nama_barang')
            ->orderByDesc('total_terjual')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'role' => 'owner',
            'stats' => [
                'penjualan_hari_ini' => $penjualanHariIni,
                'penjualan_bulan_ini' => $penjualanBulanIni,
                'pembelian_bulan_ini' => $pembelianBulanIni,
                'pengeluaran_bulan_ini' => $pengeluaranBulanIni,
                'laba_kotor_bulan_ini' => $labaBulanIni,
                'laba_bersih_bulan_ini' => $labaBersih,
                'total_stok' => $totalStok,
                'stok_rendah' => $stokRendah,
            ],
            'grafik_keuangan' => $grafikKeuangan,
            'top_barang' => $topBarang,
        ]);
    }

    private function adminCabangDashboard($user, $today, $startOfMonth, $endOfMonth)
    {
        $cabangId = $user->cabang_id;

        // Penjualan Hari Ini
        $penjualanHariIni = Transaksi::where('cabang_id', $cabangId)
            ->whereDate('tanggal_transaksi', $today)
            ->sum('total_bayar');

        // Penjualan Bulan Ini
        $penjualanBulanIni = Transaksi::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_transaksi', [$startOfMonth, $endOfMonth])
            ->sum('total_bayar');

        // Transaksi Hari Ini
        $transaksiHariIni = Transaksi::where('cabang_id', $cabangId)
            ->whereDate('tanggal_transaksi', $today)
            ->count();

        // Service HP Aktif
        $serviceAktif = ServiceHp::where('cabang_id', $cabangId)
            ->whereIn('status_service', ['antrian', 'sedang_dikerjakan'])
            ->count();

        // Stok Cabang
        $stokCabang = StokCabang::where('cabang_id', $cabangId)->sum('jumlah_stok');

        // Stok Rendah
        $stokRendah = StokCabang::where('cabang_id', $cabangId)
            ->whereRaw('jumlah_stok <= stok_minimal')
            ->count();

        // Grafik Penjualan 7 Hari Terakhir
        $grafikPenjualan = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $total = Transaksi::where('cabang_id', $cabangId)
                ->whereDate('tanggal_transaksi', $date)
                ->sum('total_bayar');
            $grafikPenjualan[] = [
                'tanggal' => $date->format('d M'),
                'total' => $total,
            ];
        }

        // Top 5 Barang Terlaris Bulan Ini
        $topBarang = DB::table('detail_transaksi')
            ->join('transaksi', 'detail_transaksi.transaksi_id', '=', 'transaksi.id')
            ->where('transaksi.cabang_id', $cabangId)
            ->whereBetween('transaksi.tanggal_transaksi', [$startOfMonth, $endOfMonth])
            ->select('detail_transaksi.nama_barang', DB::raw('SUM(detail_transaksi.jumlah) as total_terjual'))
            ->groupBy('detail_transaksi.nama_barang')
            ->orderByDesc('total_terjual')
            ->limit(5)
            ->get();

        // Transaksi Terbaru (5 terakhir)
        $transaksiTerbaru = Transaksi::where('cabang_id', $cabangId)
            ->with('kasir:id,name')
            ->orderByDesc('tanggal_transaksi')
            ->limit(5)
            ->get()
            ->map(function($trx) {
                return [
                    'kode_transaksi' => $trx->kode_transaksi,
                    'tanggal_transaksi' => $trx->tanggal_transaksi,
                    'total_bayar' => $trx->total_bayar,
                    'metode_pembayaran' => $trx->metode_pembayaran,
                    'kasir' => $trx->kasir->name,
                ];
            });

        return Inertia::render('dashboard', [
            'role' => 'admin_cabang',
            'stats' => [
                'penjualan_hari_ini' => $penjualanHariIni,
                'penjualan_bulan_ini' => $penjualanBulanIni,
                'transaksi_hari_ini' => $transaksiHariIni,
                'service_aktif' => $serviceAktif,
                'stok_cabang' => $stokCabang,
                'stok_rendah' => $stokRendah,
            ],
            'grafik_penjualan' => $grafikPenjualan,
            'top_barang' => $topBarang,
            'transaksi_terbaru' => $transaksiTerbaru,
        ]);
    }
}
