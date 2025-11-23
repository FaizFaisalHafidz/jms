import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Package, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SupplierFormModal } from './partials/supplier-form-modal';
import { SupplierStats } from './partials/supplier-stats';
import { SupplierTable } from './partials/supplier-table';

interface Supplier {
  id: number;
  kode_suplier: string;
  nama_suplier: string;
  nama_perusahaan?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  kontak_person?: string;
  status_aktif: boolean;
}

interface SupplierStats {
  total: number;
  aktif: number;
  nonaktif: number;
}

interface Props {
  suppliers: Supplier[];
  stats: SupplierStats;
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function SupplierIndex({ suppliers, stats, flash }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  const handleCreate = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  return (
    <AppLayout>
      <Head title="Kelola Supplier" />
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Heading title="Kelola Supplier" icon={Package} />
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Supplier
          </Button>
        </div>

        <SupplierStats stats={stats} />
        
        <SupplierTable 
          suppliers={suppliers} 
          onEdit={handleEdit}
        />

        <SupplierFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          supplier={selectedSupplier}
        />
      </div>
    </AppLayout>
  );
}
