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
            ->where('status_service', 'diambil')
            ->where('status_service', 'diambil')
            ->whereBetween('tanggal_diambil', [$startDate, $endDate])
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

        $cabang = auth()->user()->cabang;
        
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
            'cabang' => [
                'nama' => $cabang->nama_cabang ?? '-',
                'alamat' => $cabang->alamat ?? '-',
                'telepon' => $cabang->telepon ?? '-',
            ],
        ]);
    }

    /**
     * Get closing data for print (all transactions for the day)
     */
    public function closingData(Request $request)
    {
        $cabangId = auth()->user()->cabang_id;
        $cabang = auth()->user()->cabang;
        
        // Filter type: 'harian' atau 'bulanan'
        $filterType = $request->input('filter_type', 'harian');
        
        if ($filterType === 'harian') {
            $tanggal = $request->input('tanggal', date('Y-m-d'));
            $startDate = Carbon::parse($tanggal)->startOfDay();
            $endDate = Carbon::parse($tanggal)->endOfDay();
            $periodeLabel = Carbon::parse($tanggal)->locale('id')->isoFormat('dddd, D MMMM YYYY');
        } else {
            $tahun = $request->input('tahun', date('Y'));
            $bulan = $request->input('bulan', date('m'));
            $startDate = Carbon::createFromDate($tahun, $bulan, 1)->startOfMonth();
            $endDate = Carbon::createFromDate($tahun, $bulan, 1)->endOfMonth();
            $periodeLabel = Carbon::createFromDate($tahun, $bulan, 1)->locale('id')->isoFormat('MMMM YYYY');
        }

        // Get all transactions for the period (with metode_pembayaran)
        $transaksiRaw = Transaksi::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->with('kasir:id,name')
            ->orderBy('tanggal_transaksi', 'asc')
            ->get();

        $transaksi = $transaksiRaw->map(function ($item) {
            return [
                'nomor_transaksi' => $item->nomor_transaksi,
                'tanggal_transaksi' => $item->tanggal_transaksi,
                'total_harga' => $item->total_bayar,
                'metode_pembayaran' => $item->metode_pembayaran,
                'kasir' => $item->kasir->name ?? '-',
            ];
        });

        // Get all services for the period
        $servicesRaw = ServiceHp::where('cabang_id', $cabangId)
            ->where('status_service', 'diambil')
            ->where('status_service', 'diambil')
            ->whereBetween('tanggal_diambil', [$startDate, $endDate])
            ->orderBy('tanggal_masuk', 'asc')
            ->get();

        $services = $servicesRaw->map(function ($item) {
            return [
                'nomor_service' => $item->nomor_service,
                'tanggal' => $item->tanggal_selesai ?? $item->tanggal_masuk,
                'total_biaya' => $item->total_biaya,
                'metode_pembayaran' => $item->metode_pembayaran,
                'pelanggan' => $item->nama_pelanggan,
            ];
        });

        // Calculate totals per payment method (Combined Sales + Service)
        $perMetode = [
            'tunai' => $transaksiRaw->where('metode_pembayaran', 'tunai')->sum('total_bayar') + $servicesRaw->where('metode_pembayaran', 'tunai')->sum('total_biaya'),
            'transfer' => $transaksiRaw->where('metode_pembayaran', 'transfer')->sum('total_bayar') + $servicesRaw->where('metode_pembayaran', 'transfer')->sum('total_biaya'),
            'qris' => $transaksiRaw->where('metode_pembayaran', 'qris')->sum('total_bayar') + $servicesRaw->where('metode_pembayaran', 'qris')->sum('total_biaya'),
            'edc' => $transaksiRaw->where('metode_pembayaran', 'edc')->sum('total_bayar') + $servicesRaw->where('metode_pembayaran', 'edc')->sum('total_biaya'),
        ];

        // Total calculations
        $totalPenjualan = $transaksi->sum('total_harga');
        $totalService = $services->sum('total_biaya');
        
        $expenses = Pengeluaran::where('cabang_id', $cabangId)
            ->whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
            ->select('keterangan', 'jumlah', 'kategori_pengeluaran')
            ->orderBy('tanggal_pengeluaran')
            ->get();

        $totalPengeluaran = $expenses->sum('jumlah');

        $totalRetur = ReturPenjualan::where('cabang_id', $cabangId)
            ->where('status_retur', 'disetujui')
            ->where('jenis_retur', 'uang_kembali')
            ->whereBetween('tanggal_retur', [$startDate, $endDate])
            ->sum('total_nilai_retur');

        // Calculate Cash Flow (Estimasi)
        // Hanya hitung service yang dibayar tunai
        $totalTunai = $perMetode['tunai'];
        $sisaUangCash = $totalTunai - $totalPengeluaran - $totalRetur;

        return response()->json([
            'cabang' => [
                'nama' => $cabang->nama_cabang ?? '-',
                'alamat' => $cabang->alamat ?? '-',
                'telepon' => $cabang->telepon ?? '-',
            ],
            'periode' => $periodeLabel,
            'filter_type' => $filterType,
            'tanggal_cetak' => now()->locale('id')->isoFormat('D MMMM YYYY, HH:mm'),
            'transaksi' => $transaksi,
            'services' => $services,
            'expenses' => $expenses,
            'per_metode' => $perMetode,
            'summary' => [
                'total_penjualan' => $totalPenjualan,
                'total_service' => $totalService,
                'total_pengeluaran' => $totalPengeluaran,
                'total_retur' => $totalRetur,
                'pendapatan_kotor' => $totalPenjualan + $totalService,
                'pendapatan_bersih' => $totalPenjualan + $totalService - $totalRetur - $totalPengeluaran,
                'jumlah_transaksi' => $transaksi->count(),
                'jumlah_service' => $services->count(),
                'jumlah_pengeluaran' => $expenses->count(),
                'cash_flow' => [
                    'masuk_tunai' => $totalTunai,
                    'keluar_pengeluaran' => $totalPengeluaran,
                    'keluar_retur' => $totalRetur,
                    'sisa_uang_cash' => $sisaUangCash
                ]
            ],
        ]);
    }
}
