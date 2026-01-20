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

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Laporan Cabang</h1>
                        <p className="text-muted-foreground">
                            Laporan keuangan dan operasional cabang {cabang?.nama}
                        </p>
                    </div>
                    <PrintClosingButton filters={filters} />
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

