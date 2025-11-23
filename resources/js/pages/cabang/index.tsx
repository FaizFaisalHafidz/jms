import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Building2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CabangFormModal } from './partials/cabang-form-modal';
import { CabangStats } from './partials/cabang-stats';
import { CabangTable } from './partials/cabang-table';

interface Cabang {
    id: number;
    kode_cabang: string;
    nama_cabang: string;
    alamat: string;
    telepon: string;
    kota: string;
    provinsi: string;
    kode_pos: string;
    status_aktif: boolean;
    created_at: string;
}

interface CabangIndexProps extends PageProps {
    cabangs: Cabang[];
    stats: {
        total: number;
        aktif: number;
        nonaktif: number;
    };
}

export default function CabangIndex({ cabangs, stats, flash }: CabangIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCabang, setEditingCabang] = useState<Cabang | null>(null);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleCreate = () => {
        setEditingCabang(null);
        setIsModalOpen(true);
    };

    const handleEdit = (cabang: Cabang) => {
        setEditingCabang(cabang);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCabang(null);
    };

    return (
        <AppLayout>
            <Head title="Manajemen Cabang" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Manajemen Cabang"
                        description="Kelola data cabang toko"
                        icon={Building2}
                    />
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Cabang
                    </Button>
                </div>

                <CabangStats stats={stats} />

                <CabangTable data={cabangs} onEdit={handleEdit} />

                <CabangFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    cabang={editingCabang}
                />
            </div>
        </AppLayout>
    );
}
