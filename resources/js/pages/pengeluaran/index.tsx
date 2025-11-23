import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { Plus, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PengeluaranFormModal } from "./partials/pengeluaran-form-modal";
import { PengeluaranStats } from "./partials/pengeluaran-stats";
import { PengeluaranTable } from "./partials/pengeluaran-table";

interface Pengeluaran {
    id: number;
    nomor_pengeluaran: string;
    tanggal_pengeluaran: string;
    kategori_pengeluaran: string;
    jumlah: number;
    keterangan: string | null;
    user: string;
    created_at: string;
}

interface PengeluaranIndexProps extends PageProps {
    pengeluarans: Pengeluaran[];
    stats: {
        total: number;
        transaksi: number;
        bulan_ini: number;
    };
}

export default function PengeluaranIndex({
    pengeluarans,
    stats,
    flash,
}: PengeluaranIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPengeluaran, setEditingPengeluaran] = useState<Pengeluaran | null>(
        null
    );

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
        setEditingPengeluaran(null);
        setIsModalOpen(true);
    };

    const handleEdit = (pengeluaran: Pengeluaran) => {
        setEditingPengeluaran(pengeluaran);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPengeluaran(null);
    };

    return (
        <AppLayout>
            <Head title="Pengeluaran" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Pengeluaran"
                        description="Kelola data pengeluaran cabang"
                        icon={Wallet}
                    />
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pengeluaran
                    </Button>
                </div>

                <PengeluaranStats stats={stats} />

                <PengeluaranTable data={pengeluarans} onEdit={handleEdit} />

                <PengeluaranFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    pengeluaran={editingPengeluaran}
                />
            </div>
        </AppLayout>
    );
}
