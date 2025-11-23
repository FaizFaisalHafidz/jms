import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { FileText, Plus } from 'lucide-react';
import FakturStats from './partials/faktur-stats';
import FakturTable from './partials/faktur-table';

interface Faktur {
    id: number;
    nomor_faktur: string;
    tanggal_faktur: string;
    nama_pelanggan: string;
    telepon_pelanggan: string | null;
    alamat_pelanggan: string | null;
    subtotal: number;
    diskon: number;
    total_bayar: number;
    status_pembayaran: string;
    tanggal_jatuh_tempo: string | null;
    kasir: string;
    nomor_transaksi: string;
}

interface Stats {
    total: number;
    lunas: number;
    belum_lunas: number;
    cicilan: number;
}

interface Props {
    fakturs: Faktur[];
    stats: Stats;
}

export default function FakturIndex({ fakturs, stats }: Props) {
    console.log('Faktur Index - fakturs:', fakturs);
    console.log('Faktur Index - stats:', stats);
    
    return (
        <AppLayout>
            <Head title="Faktur" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Faktur" icon={FileText} />
                    <Button
                        onClick={() => router.visit('/faktur/create')}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Faktur
                    </Button>
                </div>

                {stats && <FakturStats stats={stats} />}
                {fakturs && <FakturTable fakturs={fakturs} />}
            </div>
        </AppLayout>
    );
}
