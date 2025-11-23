import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { CabangTable } from './partials/cabang-table';
import { LaporanFilters } from './partials/laporan-filters';
import { LaporanStats } from './partials/laporan-stats';
import { PenjualanChart } from './partials/penjualan-chart';
import { TopCabangTable } from './partials/top-cabang-table';

interface LaporanProps {
    filters: {
        tahun: string;
        bulan: string;
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
    laporan_per_cabang: Array<{
        id: number;
        nama_cabang: string;
        kota: string;
        penjualan: number;
        pembelian: number;
        service: number;
        pengeluaran: number;
        retur: number;
        pendapatan: number;
        laba_bersih: number;
    }>;
    charts: {
        penjualan_harian: Array<{
            tanggal: string;
            total: number;
        }>;
    };
    top_cabang: Array<{
        nama_cabang: string;
        kota: string;
        total_penjualan: number;
    }>;
}

export default function LaporanIndex({
    filters,
    stats,
    laporan_per_cabang,
    charts,
    top_cabang,
}: LaporanProps) {
    return (
        <AppLayout>
            <Head title="Laporan Keseluruhan" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Laporan Keseluruhan</h1>
                        <p className="text-muted-foreground">
                            Laporan keuangan semua cabang
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <LaporanFilters filters={filters} basePath="/laporan" />

                {/* Stats Cards */}
                <LaporanStats stats={stats} />

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                    <PenjualanChart data={charts.penjualan_harian} />
                    <TopCabangTable data={top_cabang} />
                </div>

                {/* Laporan Per Cabang */}
                <CabangTable data={laporan_per_cabang} />
            </div>
        </AppLayout>
    );
}
