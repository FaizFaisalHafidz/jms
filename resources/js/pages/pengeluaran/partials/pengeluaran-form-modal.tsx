import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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

interface Pengeluaran {
    id: number;
    tanggal_pengeluaran: string;
    kategori_pengeluaran: string;
    jumlah: number;
    keterangan: string | null;
}

interface PengeluaranFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    pengeluaran: Pengeluaran | null;
}

export function PengeluaranFormModal({ isOpen, onClose, pengeluaran }: PengeluaranFormModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        tanggal_pengeluaran: new Date().toISOString().split('T')[0],
        kategori_pengeluaran: '',
        jumlah: '',
        keterangan: '',
    });

    useEffect(() => {
        if (pengeluaran) {
            setData({
                tanggal_pengeluaran: pengeluaran.tanggal_pengeluaran,
                kategori_pengeluaran: pengeluaran.kategori_pengeluaran,
                jumlah: pengeluaran.jumlah.toString(),
                keterangan: pengeluaran.keterangan || '',
            });
        } else {
            reset();
            setData('tanggal_pengeluaran', new Date().toISOString().split('T')[0]);
        }
    }, [pengeluaran, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (pengeluaran) {
            put(`/pengeluaran/${pengeluaran.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post('/pengeluaran', {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {pengeluaran ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
                        </DialogTitle>
                        <DialogDescription>
                            {pengeluaran
                                ? 'Perbarui informasi pengeluaran'
                                : 'Tambahkan pengeluaran baru'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="tanggal_pengeluaran">
                                Tanggal <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="tanggal_pengeluaran"
                                type="date"
                                value={data.tanggal_pengeluaran}
                                onChange={(e) => setData('tanggal_pengeluaran', e.target.value)}
                                className={errors.tanggal_pengeluaran ? 'border-red-500' : ''}
                            />
                            {errors.tanggal_pengeluaran && (
                                <p className="text-sm text-red-500">{errors.tanggal_pengeluaran}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kategori_pengeluaran">
                                Kategori <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.kategori_pengeluaran}
                                onValueChange={(value) => setData('kategori_pengeluaran', value)}
                            >
                                <SelectTrigger
                                    className={errors.kategori_pengeluaran ? 'border-red-500' : ''}
                                >
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gaji">Gaji</SelectItem>
                                    <SelectItem value="listrik">Listrik</SelectItem>
                                    <SelectItem value="air">Air</SelectItem>
                                    <SelectItem value="internet">Internet</SelectItem>
                                    <SelectItem value="sewa">Sewa</SelectItem>
                                    <SelectItem value="transport">Transport</SelectItem>
                                    <SelectItem value="perlengkapan">Perlengkapan</SelectItem>
                                    <SelectItem value="lainnya">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.kategori_pengeluaran && (
                                <p className="text-sm text-red-500">{errors.kategori_pengeluaran}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jumlah">
                                Jumlah <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="jumlah"
                                type="number"
                                min="1"
                                value={data.jumlah}
                                onChange={(e) => setData('jumlah', e.target.value)}
                                placeholder="Masukkan jumlah pengeluaran"
                                className={errors.jumlah ? 'border-red-500' : ''}
                            />
                            {errors.jumlah && (
                                <p className="text-sm text-red-500">{errors.jumlah}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="keterangan">Keterangan</Label>
                            <Textarea
                                id="keterangan"
                                value={data.keterangan}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setData('keterangan', e.target.value)
                                }
                                placeholder="Masukkan keterangan (opsional)"
                                rows={3}
                                className={errors.keterangan ? 'border-red-500' : ''}
                            />
                            {errors.keterangan && (
                                <p className="text-sm text-red-500">{errors.keterangan}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
