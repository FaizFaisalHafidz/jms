import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Smartphone } from 'lucide-react';
import ServiceHpStats from './partials/service-hp-stats';
import ServiceHpTable from './partials/service-hp-table';

interface Service {
    id: number;
    nomor_service: string;
    tanggal_masuk: string;
    nama_pelanggan: string;
    telepon_pelanggan: string;
    merk_hp: string;
    tipe_hp: string;
    keluhan: string;
    total_biaya: number;
    status_service: string;
    teknisi: string;
    tanggal_selesai: string | null;
    tanggal_diambil: string | null;
}

interface Stats {
    total: number;
    diterima: number;
    dikerjakan: number;
    selesai: number;
}

interface Props {
    services: Service[];
    stats: Stats;
}

export default function ServiceHpIndex({ services, stats }: Props) {
    return (
        <AppLayout>
            <Head title="Service HP" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Service HP" icon={Smartphone} />
                    <Button
                        onClick={() => router.visit('/service/create')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Tambah Service
                    </Button>
                </div>

                <ServiceHpStats stats={stats} />
                <ServiceHpTable services={services} />
            </div>
        </AppLayout>
    );
}
