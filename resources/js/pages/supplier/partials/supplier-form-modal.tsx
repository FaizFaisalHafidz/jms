import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

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

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

export function SupplierFormModal({ isOpen, onClose, supplier }: SupplierFormModalProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    kode_suplier: '',
    nama_suplier: '',
    nama_perusahaan: '',
    alamat: '',
    telepon: '',
    email: '',
    kontak_person: '',
    status_aktif: true,
  });

  useEffect(() => {
    if (supplier) {
      setData({
        kode_suplier: supplier.kode_suplier,
        nama_suplier: supplier.nama_suplier,
        nama_perusahaan: supplier.nama_perusahaan || '',
        alamat: supplier.alamat || '',
        telepon: supplier.telepon || '',
        email: supplier.email || '',
        kontak_person: supplier.kontak_person || '',
        status_aktif: supplier.status_aktif,
      });
    } else {
      reset();
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (supplier) {
      put(`/supplier/${supplier.id}`, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    } else {
      post('/supplier', {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Edit Supplier' : 'Tambah Supplier'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kode_suplier">
                Kode Supplier <span className="text-red-600">*</span>
              </Label>
              <Input
                id="kode_suplier"
                value={data.kode_suplier}
                onChange={(e) => setData('kode_suplier', e.target.value)}
                maxLength={20}
                placeholder="Masukkan kode supplier"
              />
              {errors.kode_suplier && (
                <p className="text-sm text-red-600">{errors.kode_suplier}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_suplier">
                Nama Supplier <span className="text-red-600">*</span>
              </Label>
              <Input
                id="nama_suplier"
                value={data.nama_suplier}
                onChange={(e) => setData('nama_suplier', e.target.value)}
                maxLength={100}
                placeholder="Masukkan nama supplier"
              />
              {errors.nama_suplier && (
                <p className="text-sm text-red-600">{errors.nama_suplier}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nama_perusahaan">Nama Perusahaan</Label>
            <Input
              id="nama_perusahaan"
              value={data.nama_perusahaan}
              onChange={(e) => setData('nama_perusahaan', e.target.value)}
              maxLength={150}
              placeholder="Masukkan nama perusahaan"
            />
            {errors.nama_perusahaan && (
              <p className="text-sm text-red-600">{errors.nama_perusahaan}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              value={data.alamat}
              onChange={(e) => setData('alamat', e.target.value)}
              placeholder="Masukkan alamat supplier"
              rows={3}
            />
            {errors.alamat && (
              <p className="text-sm text-red-600">{errors.alamat}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input
                id="telepon"
                value={data.telepon}
                onChange={(e) => setData('telepon', e.target.value)}
                maxLength={20}
                placeholder="Masukkan nomor telepon"
              />
              {errors.telepon && (
                <p className="text-sm text-red-600">{errors.telepon}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                maxLength={100}
                placeholder="Masukkan email"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kontak_person">Kontak Person</Label>
            <Input
              id="kontak_person"
              value={data.kontak_person}
              onChange={(e) => setData('kontak_person', e.target.value)}
              maxLength={100}
              placeholder="Masukkan nama kontak person"
            />
            {errors.kontak_person && (
              <p className="text-sm text-red-600">{errors.kontak_person}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_aktif">
              Status <span className="text-red-600">*</span>
            </Label>
            <Select
              value={data.status_aktif ? 'true' : 'false'}
              onValueChange={(value) => setData('status_aktif', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
            {errors.status_aktif && (
              <p className="text-sm text-red-600">{errors.status_aktif}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={processing}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processing ? 'Menyimpan...' : supplier ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
