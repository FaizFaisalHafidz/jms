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

interface KategoriBarang {
    id: number;
    nama_kategori: string;
    deskripsi?: string;
    status_aktif: boolean;
}

interface KategoriBarangFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    kategori: KategoriBarang | null;
}

export function KategoriBarangFormModal({
    isOpen,
    onClose,
    kategori,
}: KategoriBarangFormModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        nama_kategori: '',
        deskripsi: '',
        status_aktif: true,
    });

    useEffect(() => {
        if (kategori) {
            setData({
                nama_kategori: kategori.nama_kategori,
                deskripsi: kategori.deskripsi || '',
                status_aktif: kategori.status_aktif,
            });
        } else {
            reset();
        }
    }, [kategori]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (kategori) {
            put(`/kategori-barang/${kategori.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/kategori-barang', {
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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {kategori ? 'Edit Kategori Barang' : 'Tambah Kategori Barang'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nama_kategori">
                            Nama Kategori <span className="text-red-600">*</span>
                        </Label>
                        <Input
                            id="nama_kategori"
                            value={data.nama_kategori}
                            onChange={(e) =>
                                setData('nama_kategori', e.target.value)
                            }
                            maxLength={100}
                            placeholder="Masukkan nama kategori"
                        />
                        {errors.nama_kategori && (
                            <p className="text-sm text-red-600">
                                {errors.nama_kategori}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <Textarea
                            id="deskripsi"
                            value={data.deskripsi}
                            onChange={(e) => setData('deskripsi', e.target.value)}
                            placeholder="Masukkan deskripsi kategori"
                            rows={3}
                        />
                        {errors.deskripsi && (
                            <p className="text-sm text-red-600">
                                {errors.deskripsi}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status_aktif">
                            Status <span className="text-red-600">*</span>
                        </Label>
                        <Select
                            value={data.status_aktif ? 'true' : 'false'}
                            onValueChange={(value) =>
                                setData('status_aktif', value === 'true')
                            }
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
                            <p className="text-sm text-red-600">
                                {errors.status_aktif}
                            </p>
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
                            {processing
                                ? 'Menyimpan...'
                                : kategori
                                  ? 'Perbarui'
                                  : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
