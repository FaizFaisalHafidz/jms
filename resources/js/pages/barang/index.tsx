import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Package, Plus, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BarangFormModal } from './partials/barang-form-modal';
import { BarangStats } from './partials/barang-stats';
import { BarangTable } from './partials/barang-table';
import { BarcodePrintModal } from './partials/barcode-print-modal';

interface KategoriBarang {
    id: number;
    nama_kategori: string;
}

interface Suplier {
    id: number;
    nama_suplier: string;
}

interface Barang {
    id: number;
    kategori_id: number;
    suplier_id: number;
    kode_barang: string;
    nama_barang: string;
    barcode?: string;
    merk?: string;
    tipe?: string;
    satuan: string;
    harga_asal: number;
    harga_konsumen: number;
    harga_konter: number;
    stok_minimal: number;
    deskripsi?: string;
    foto_barang?: string;
    status_aktif: boolean;
    kategori: KategoriBarang;
    suplier: Suplier;
}

interface BarangStats {
    total: number;
    aktif: number;
    nonaktif: number;
}

interface Props {
    barang: Barang[];
    kategori: KategoriBarang[];
    suplier: Suplier[];
    stats: BarangStats;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function BarangIndex({
    barang,
    kategori,
    suplier,
    stats,
    flash,
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleCreate = () => {
        setSelectedBarang(null);
        setIsModalOpen(true);
    };

    const handleEdit = (barang: Barang) => {
        setSelectedBarang(barang);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBarang(null);
    };

    return (
        <AppLayout>
            <Head title="Kelola Barang" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Heading title="Kelola Barang" icon={Package} />
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsPrintModalOpen(true)}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Cetak Barcode
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Barang
                        </Button>
                    </div>
                </div>

                <BarangStats stats={stats} />

                <BarangTable barang={barang} onEdit={handleEdit} />

                <BarangFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    barang={selectedBarang}
                    kategori={kategori}
                    suplier={suplier}
                />

                <BarcodePrintModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    barang={barang}
                />
            </div>
        </AppLayout>
    );
}
