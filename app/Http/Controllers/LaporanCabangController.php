<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Pembelian;
use App\Models\ServiceHp;
use App\Models\Pengeluaran;
use App\Models\ReturPenjualan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LaporanCabangController extends Controller
{
    public function index(Request $request)
    {
        $cabangId = auth()->user()->cabang_id;
        
        // Filter type: 'harian' atau 'bulanan'
        $filterType = $request->input('filter_type', 'harian');
        
        if ($filterType === 'harian') {
            // Default hari ini
            $tanggal = $request->input('tanggal', date('Y-m-d'));
            $startDate = Carbon::parse($tanggal)->startOfDay();
            $endDate = Carbon::parse($tanggal)->endOfDay();
        } else {
            // Filter bulanan
            $tahun = $request->input('tahun', date('Y'));
            $bulan = $request->input('bulan', date('m'));
            $startDate = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth();
            $endDate = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth();
        }

        // Total Penjualan (dari transaksi)
        $totalPenjualan = Transaksi::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('total_bayar');

        // Total Pembelian
        $totalPembelian = Pembelian::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_pembelian', [$startDate, $endDate])
            ->sum('total_bayar');

        // Total Service HP (hanya yang sudah selesai atau diambil)
        $totalService = ServiceHp::where('cabang_id', $cabangId)
            ->whereIn('status_service', ['selesai', 'diambil'])
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->whereNull('tanggal_selesai')
                            ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                      });
            })
            ->sum('total_biaya');

        // Total Pengeluaran
        $totalPengeluaran = Pengeluaran::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
            ->sum('jumlah');

        // Total Retur (hanya yang uang kembali, bukan ganti barang)
        $totalRetur = ReturPenjualan::where('cabang_id', $cabangId)
            ->where('status_retur', 'disetujui')
            ->where('jenis_retur', 'uang_kembali')
            ->whereBetween('tanggal_retur', [$startDate, $endDate])
            ->sum('total_nilai_retur');

        // Pendapatan Bersih
        $totalPendapatan = $totalPenjualan + $totalService - $totalRetur;
        $labaBersih = $totalPendapatan - $totalPembelian - $totalPengeluaran;

        // Grafik Penjualan per Hari (30 hari terakhir)
        $penjualanHarian = Transaksi::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(tanggal_transaksi) as tanggal'),
                DB::raw('SUM(total_bayar) as total')
            )
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        // Grafik Pengeluaran per Kategori
        $pengeluaranKategori = Pengeluaran::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
            ->select('kategori_pengeluaran', DB::raw('SUM(jumlah) as total'))
            ->groupBy('kategori_pengeluaran')
            ->get();

        // Top 10 Barang Terlaris
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

        // Transaksi Terbaru (10 terakhir)
        $transaksiTerbaru = Transaksi::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->with('kasir:id,name')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'nomor_transaksi' => $item->nomor_transaksi,
                    'tanggal_transaksi' => $item->tanggal_transaksi,
                    'total_harga' => $item->total_bayar,
                    'user' => $item->kasir->name,
                ];
            });

        return Inertia::render('laporan/cabang/index', [
            'filters' => [
                'filter_type' => $filterType,
                'tanggal' => $filterType === 'harian' ? ($request->input('tanggal', date('Y-m-d'))) : null,
                'tahun' => $filterType === 'bulanan' ? ($request->input('tahun', date('Y'))) : null,
                'bulan' => $filterType === 'bulanan' ? ($request->input('bulan', date('m'))) : null,
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
            'charts' => [
                'penjualan_harian' => $penjualanHarian,
                'pengeluaran_kategori' => $pengeluaranKategori,
            ],
            'top_barang' => $topBarang,
            'transaksi_terbaru' => $transaksiTerbaru,
        ]);
    }
}
