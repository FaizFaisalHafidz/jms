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

        // ========================================
        // PENDAPATAN DARI PENJUALAN
        // ========================================
        $penjualan = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('total_bayar');

        // ========================================
        // PENDAPATAN DARI SERVICE HP
        // ========================================
        $serviceData = ServiceHp::whereIn('status_service', ['selesai', 'diambil'])
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->whereNull('tanggal_selesai')
                            ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                      });
            })
            ->selectRaw('
                SUM(total_biaya) as total_service,
                SUM(biaya_spare_part) as total_spare_part,
                SUM(biaya_jasa) as total_jasa_db
            ')
            ->first();
        
        $service = $serviceData->total_service ?? 0;
        $biayaSparePart = $serviceData->total_spare_part ?? 0;
        
        // Hitung biaya jasa = total - spare part
        $biayaJasa = $service - $biayaSparePart;

        // ========================================
        // RETUR
        // ========================================
        $retur = ReturPenjualan::where('status_retur', 'disetujui')
            ->where('jenis_retur', 'uang_kembali')
            ->whereBetween('tanggal_retur', [$startDate, $endDate])
            ->sum('total_nilai_retur');

        // Total diskon yang diberikan
        $totalDiskon = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('diskon');

        // ========================================
        // TOTAL OMZET
        // ========================================
        $totalOmzet = $penjualan + $service - $retur;

        // ========================================
        // BIAYA OPERASIONAL
        // ========================================
        $biayaOperasional = Pengeluaran::whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
            ->sum('jumlah');

        // ========================================
        // BREAKDOWN PER METODE PEMBAYARAN
        // ========================================
        // Penjualan per metode
        $penjualanPerMetode = Transaksi::whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->selectRaw('
                metode_pembayaran,
                SUM(total_bayar) as total
            ')
            ->groupBy('metode_pembayaran')
            ->get()
            ->pluck('total', 'metode_pembayaran');

        // Service per metode
        $servicePerMetode = ServiceHp::whereIn('status_service', ['selesai', 'diambil'])
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->whereNull('tanggal_selesai')
                            ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                      });
            })
            ->selectRaw('
                metode_pembayaran,
                SUM(total_biaya) as total
            ')
            ->groupBy('metode_pembayaran')
            ->get()
            ->pluck('total', 'metode_pembayaran');

        // Gabungkan total per metode (penjualan + service)
        $perMetode = [
            'tunai' => ($penjualanPerMetode['tunai'] ?? 0) + ($servicePerMetode['tunai'] ?? 0),
            'transfer' => ($penjualanPerMetode['transfer'] ?? 0) + ($servicePerMetode['transfer'] ?? 0),
            'qris' => ($penjualanPerMetode['qris'] ?? 0) + ($servicePerMetode['qris'] ?? 0),
            'edc' => ($penjualanPerMetode['edc'] ?? 0) + ($servicePerMetode['edc'] ?? 0),
        ];

        // Breakdown penjualan saja per metode (untuk ditampilkan)
        $penjualanMetode = [
            'tunai' => $penjualanPerMetode['tunai'] ?? 0,
            'transfer' => $penjualanPerMetode['transfer'] ?? 0,
            'qris' => $penjualanPerMetode['qris'] ?? 0,
            'edc' => $penjualanPerMetode['edc'] ?? 0,
        ];

        // ========================================
        // DETAIL SERVICE HP
        // ========================================
        $listService = ServiceHp::whereIn('status_service', ['selesai', 'diambil'])
            ->where(function($query) use ($startDate, $endDate) {
                $query->whereBetween('tanggal_selesai', [$startDate, $endDate])
                      ->orWhere(function($q) use ($startDate, $endDate) {
                          $q->whereNull('tanggal_selesai')
                            ->whereBetween('tanggal_masuk', [$startDate, $endDate]);
                      });
            })
            ->orderBy('tanggal_masuk')
            ->get(['nomor_service', 'total_biaya', 'metode_pembayaran']);

        // ========================================
        // DETAIL PENGELUARAN
        // ========================================
        $listPengeluaran = Pengeluaran::whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
            ->orderBy('tanggal_pengeluaran')
            ->get(['keterangan', 'jumlah', 'kategori_pengeluaran']);

        // Total uang tunai (dari penjualan + service)
        $totalTunai = $perMetode['tunai'];
        
        // Sisa kas = tunai - pengeluaran
        $sisaKas = $totalTunai - $biayaOperasional;

        // ========================================
        // SISA (OMZET - PENGELUARAN)
        // ========================================
        $sisa = $totalOmzet - $biayaOperasional;

        // Laba per Cabang (sederhana: omzet - pengeluaran)
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

                $pengeluaranCabang = Pengeluaran::where('cabang_id', $cabang->id)
                    ->whereBetween('tanggal_pengeluaran', [$startDate, $endDate])
                    ->sum('jumlah');

                $omzetCabang = $penjualanCabang + $serviceCabang - $returCabang;
                $sisaCabang = $omzetCabang - $pengeluaranCabang;

                return [
                    'nama_cabang' => $cabang->nama_cabang,
                    'kota' => $cabang->kota,
                    'omzet' => $omzetCabang,
                    'pengeluaran' => $pengeluaranCabang,
                    'sisa' => $sisaCabang,
                ];
            });

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
                // Pendapatan
                'penjualan' => $penjualan,
                'service' => $service,
                'retur' => $retur,
                'total_omzet' => $totalOmzet,
                
                // Breakdown Service
                'biaya_spare_part' => $biayaSparePart,
                'biaya_jasa' => $biayaJasa,
                
                // Biaya & Diskon
                'total_diskon' => $totalDiskon,
                'biaya_operasional' => $biayaOperasional,
                
                // Breakdown Per Metode Pembayaran
                'penjualan_metode' => $penjualanMetode,  // Penjualan saja per metode
                'per_metode' => $perMetode,              // Total (penjualan + service) per metode
                'total_tunai' => $totalTunai,
                'sisa_kas' => $sisaKas,
                
                // Sisa
                'sisa' => $sisa,
            ],
            'list_service' => $listService,
            'list_pengeluaran' => $listPengeluaran,
            'laba_per_cabang' => $labaPerCabang,
            'breakdown_pengeluaran' => $breakdownPengeluaran,
        ]);
    }
}

