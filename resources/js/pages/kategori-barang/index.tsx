import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Box, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { KategoriBarangFormModal } from './partials/kategori-barang-form-modal';
import { KategoriBarangStats } from './partials/kategori-barang-stats';
import { KategoriBarangTable } from './partials/kategori-barang-table';

interface KategoriBarang {
    id: number;
    nama_kategori: string;
    deskripsi?: string;
    status_aktif: boolean;
}

interface KategoriBarangStats {
    total: number;
    aktif: number;
    nonaktif: number;
}

interface Props {
    kategoriBarang: KategoriBarang[];
    stats: KategoriBarangStats;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function KategoriBarangIndex({
    kategoriBarang,
    stats,
    flash,
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKategori, setSelectedKategori] =
        useState<KategoriBarang | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleCreate = () => {
        setSelectedKategori(null);
        setIsModalOpen(true);
    };

    const handleEdit = (kategori: KategoriBarang) => {
        setSelectedKategori(kategori);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedKategori(null);
    };

    return (
        <AppLayout>
            <Head title="Kelola Kategori Barang" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Heading title="Kelola Kategori Barang" icon={Box} />
                    <Button
                        onClick={handleCreate}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Kategori
                    </Button>
                </div>

                <KategoriBarangStats stats={stats} />

                <KategoriBarangTable
                    kategoriBarang={kategoriBarang}
                    onEdit={handleEdit}
                />

                <KategoriBarangFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    kategori={selectedKategori}
                />
            </div>
        </AppLayout>
    );
}
