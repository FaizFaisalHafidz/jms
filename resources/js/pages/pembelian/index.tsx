import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { PembelianStats } from './partials/pembelian-stats';
import { PembelianTable } from './partials/pembelian-table';

interface Pembelian {
    id: number;
    nomor_pembelian: string;
    tanggal_pembelian: string;
    total_item: number;
    subtotal: number;
    diskon: number;
    ongkos_kirim: number;
    total_bayar: number;
    status_pembayaran: 'lunas' | 'belum_lunas' | 'cicilan';
    tanggal_jatuh_tempo: string | null;
    keterangan: string | null;
    suplier: {
        id: number;
        nama_suplier: string;
    };
    cabang: {
        id: number;
        nama_cabang: string;
    };
    user: {
        id: number;
        name: string;
    };
}

interface Stats {
    total: number;
    total_nilai: number;
    lunas: number;
    belum_lunas: number;
}

interface Props {
    pembelian: Pembelian[];
    stats: Stats;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function PembelianIndex({ pembelian, stats, flash }: Props) {
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleCreate = () => {
        router.visit('/pembelian/create');
    };

    return (
        <AppLayout>
            <Head title="Kelola Pembelian" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Heading title="Kelola Pembelian" icon={ShoppingCart} />
                    <Button 
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pembelian
                    </Button>
                </div>

                <PembelianStats stats={stats} />

                <PembelianTable pembelian={pembelian} />
            </div>
        </AppLayout>
    );
}
