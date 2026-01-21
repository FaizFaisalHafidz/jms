import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { LaporanFilters } from './partials/laporan-filters';
import { LaporanStats } from './partials/laporan-stats';
import { PengeluaranChart } from './partials/pengeluaran-chart';
import { PenjualanChart } from './partials/penjualan-chart';
import { PrintClosingButton } from './partials/print-closing-button';
import { TopBarangTable } from './partials/top-barang-table';
import { TransaksiTerbaruTable } from './partials/transaksi-terbaru-table';

interface LaporanCabangProps {
    filters: {
        filter_type: string;
        tanggal: string | null;
        tahun: string | null;
        bulan: string | null;
    };
    stats: {
        total_penjualan: number;
        total_pembelian: number;
        total_service: number;
        total_pengeluaran: number;
        total_retur: number;
        total_pendapatan: number;
        laba_bersih: number;
    };
    charts: {
        penjualan_harian: Array<{
            tanggal: string;
            total: number;
        }>;
        pengeluaran_kategori: Array<{
            kategori_pengeluaran: string;
            total: number;
        }>;
    };
    top_barang: Array<{
        nama_barang: string;
        total_terjual: number;
        total_omzet: number;
    }>;
    transaksi_terbaru: Array<{
        nomor_transaksi: string;
        tanggal_transaksi: string;
        total_harga: number;
        user: string;
    }>;
    cabang: {
        nama: string;
        alamat: string;
        telepon: string;
    };
}

export default function LaporanCabangIndex({
    filters,
    stats,
    charts,
    top_barang,
    transaksi_terbaru,
    cabang,
}: LaporanCabangProps) {
    return (
        <AppLayout>
            <Head title="Laporan Cabang" />

            <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50 min-h-screen">
                {/* Modern Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-8 shadow-lg">
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                                <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">
                                    Financial Report
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                Laporan Cabang
                            </h1>
                            <p className="text-blue-50 text-base max-w-2xl leading-relaxed">
                                Laporan keuangan dan operasional <span className="font-semibold">{cabang?.nama}</span>
                            </p>
                        </div>
                        <PrintClosingButton filters={filters} />
                    </div>

                    {/* Subtle decorative elements */}
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-indigo-400/10 blur-2xl" />
                </div>

                {/* Filters */}
                <LaporanFilters filters={filters} />

                {/* Stats Cards */}
                <LaporanStats stats={stats} />

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                    <PenjualanChart data={charts.penjualan_harian} />
                    <PengeluaranChart data={charts.pengeluaran_kategori} />
                </div>

                {/* Top Barang & Transaksi Terbaru */}
                <div className="grid gap-6 md:grid-cols-2">
                    <TopBarangTable data={top_barang} />
                    <TransaksiTerbaruTable data={transaksi_terbaru} />
                </div>
            </div>
        </AppLayout>
    );
}

