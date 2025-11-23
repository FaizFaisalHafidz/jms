<?php

namespace App\Http\Controllers;

use App\Models\Pembelian;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LaporanPembelianController extends Controller
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

        // Stats
        $totalPembelian = Pembelian::whereBetween('tanggal_pembelian', [$startDate, $endDate])
            ->sum('total_bayar');

        $totalTransaksi = Pembelian::whereBetween('tanggal_pembelian', [$startDate, $endDate])
            ->count();

        $totalItem = DB::table('detail_pembelian')
            ->join('pembelian', 'detail_pembelian.pembelian_id', '=', 'pembelian.id')
            ->whereBetween('pembelian.tanggal_pembelian', [$startDate, $endDate])
            ->sum('detail_pembelian.jumlah');

        $totalHutang = Pembelian::whereBetween('tanggal_pembelian', [$startDate, $endDate])
            ->whereIn('status_pembayaran', ['belum_lunas', 'cicilan'])
            ->sum('total_bayar');

        // Pembelian per Cabang
        $pembelianPerCabang = Cabang::where('status_aktif', true)
            ->withSum(['pembelian as total_pembelian' => function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_pembelian', [$startDate, $endDate]);
            }], 'total_bayar')
            ->withCount(['pembelian as total_transaksi' => function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_pembelian', [$startDate, $endDate]);
            }])
            ->get()
            ->map(function($cabang) {
                return [
                    'nama_cabang' => $cabang->nama_cabang,
                    'kota' => $cabang->kota,
                    'total_pembelian' => $cabang->total_pembelian ?? 0,
                    'total_transaksi' => $cabang->total_transaksi ?? 0,
                ];
            });

        // Grafik Pembelian
        $grafikPembelian = Pembelian::whereBetween('tanggal_pembelian', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(tanggal_pembelian) as tanggal'),
                DB::raw('SUM(total_bayar) as total'),
                DB::raw('COUNT(*) as jumlah_transaksi')
            )
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        // Top 10 Barang Terbeli
        $topBarang = DB::table('detail_pembelian')
            ->join('pembelian', 'detail_pembelian.pembelian_id', '=', 'pembelian.id')
            ->join('barang', 'detail_pembelian.barang_id', '=', 'barang.id')
            ->whereBetween('pembelian.tanggal_pembelian', [$startDate, $endDate])
            ->select(
                'barang.nama_barang',
                DB::raw('SUM(detail_pembelian.jumlah) as total_dibeli'),
                DB::raw('SUM(detail_pembelian.jumlah * detail_pembelian.harga_beli) as total_nilai')
            )
            ->groupBy('barang.nama_barang')
            ->orderByDesc('total_dibeli')
            ->limit(10)
            ->get();

        // Pembelian per Supplier
        $perSupplier = Pembelian::with('suplier:id,nama_suplier')
            ->whereBetween('tanggal_pembelian', [$startDate, $endDate])
            ->select('suplier_id', DB::raw('COUNT(*) as jumlah'), DB::raw('SUM(total_bayar) as total'))
            ->groupBy('suplier_id')
            ->get()
            ->map(function($item) {
                return [
                    'nama_suplier' => $item->suplier->nama_suplier,
                    'jumlah' => $item->jumlah,
                    'total' => $item->total,
                ];
            });

        return Inertia::render('laporan/pembelian/index', [
            'filters' => [
                'filter_type' => $filterType,
                'tanggal' => $filterType === 'harian' ? ($request->input('tanggal', date('Y-m-d'))) : null,
                'tahun' => $filterType === 'bulanan' ? ($request->input('tahun', date('Y'))) : null,
                'bulan' => $filterType === 'bulanan' ? ($request->input('bulan', date('m'))) : null,
            ],
            'stats' => [
                'total_pembelian' => $totalPembelian,
                'total_transaksi' => $totalTransaksi,
                'total_item' => $totalItem,
                'total_hutang' => $totalHutang,
            ],
            'pembelian_per_cabang' => $pembelianPerCabang,
            'grafik_pembelian' => $grafikPembelian,
            'top_barang' => $topBarang,
            'per_supplier' => $perSupplier,
        ]);
    }
}
