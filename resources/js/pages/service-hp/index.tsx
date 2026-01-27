import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Smartphone, Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
    metode_pembayaran: string;
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
    filters: {
        search?: string;
        start_date?: string;
        end_date?: string;
    };
}

export default function ServiceHpIndex({ services, stats, filters }: Props) {
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get('/service', { ...filters, search: e.target.value }, { preserveState: true, replace: true });
    };

    const handleDateChange = (key: 'start_date' | 'end_date', value: string) => {
        router.get('/service', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    };
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

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Cari nomor service, pelanggan, merk HP..."
                            className="pl-9"
                            defaultValue={filters.search}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                className="pl-9 w-40"
                                placeholder="Tanggal Mulai"
                                value={filters.start_date || ''}
                                onChange={(e) => handleDateChange('start_date', e.target.value)}
                            />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                className="pl-9 w-40"
                                placeholder="Tanggal Akhir"
                                value={filters.end_date || ''}
                                onChange={(e) => handleDateChange('end_date', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <ServiceHpStats stats={stats} />
                <ServiceHpTable services={services} />
            </div>
        </AppLayout>
    );
}
