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
}

interface CabangFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    cabang: Cabang | null;
}

export function CabangFormModal({ isOpen, onClose, cabang }: CabangFormModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        kode_cabang: '',
        nama_cabang: '',
        alamat: '',
        telepon: '',
        kota: '',
        provinsi: '',
        kode_pos: '',
        status_aktif: true,
    });

    useEffect(() => {
        if (cabang) {
            setData({
                kode_cabang: cabang.kode_cabang,
                nama_cabang: cabang.nama_cabang,
                alamat: cabang.alamat,
                telepon: cabang.telepon,
                kota: cabang.kota,
                provinsi: cabang.provinsi,
                kode_pos: cabang.kode_pos,
                status_aktif: cabang.status_aktif,
            });
        } else {
            reset();
        }
    }, [cabang, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (cabang) {
            put(`/cabang/${cabang.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post('/cabang', {
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {cabang ? 'Edit Cabang' : 'Tambah Cabang'}
                        </DialogTitle>
                        <DialogDescription>
                            {cabang
                                ? 'Perbarui informasi cabang'
                                : 'Tambahkan cabang baru ke dalam sistem'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="kode_cabang">
                                Kode Cabang <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="kode_cabang"
                                value={data.kode_cabang}
                                onChange={(e) => setData('kode_cabang', e.target.value)}
                                placeholder="Contoh: TSK-MTB"
                                className={errors.kode_cabang ? 'border-red-500' : ''}
                            />
                            {errors.kode_cabang && (
                                <p className="text-sm text-red-500">{errors.kode_cabang}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nama_cabang">
                                Nama Cabang <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="nama_cabang"
                                value={data.nama_cabang}
                                onChange={(e) => setData('nama_cabang', e.target.value)}
                                placeholder="Contoh: Tasik Mitrabatik"
                                className={errors.nama_cabang ? 'border-red-500' : ''}
                            />
                            {errors.nama_cabang && (
                                <p className="text-sm text-red-500">{errors.nama_cabang}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alamat">
                                Alamat <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="alamat"
                                value={data.alamat}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setData('alamat', e.target.value)
                                }
                                placeholder="Masukkan alamat lengkap cabang"
                                rows={3}
                                className={errors.alamat ? 'border-red-500' : ''}
                            />
                            {errors.alamat && (
                                <p className="text-sm text-red-500">{errors.alamat}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telepon">
                                Telepon <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="telepon"
                                value={data.telepon}
                                onChange={(e) => setData('telepon', e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className={errors.telepon ? 'border-red-500' : ''}
                            />
                            {errors.telepon && (
                                <p className="text-sm text-red-500">{errors.telepon}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="kota">
                                    Kota <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="kota"
                                    value={data.kota}
                                    onChange={(e) => setData('kota', e.target.value)}
                                    placeholder="Contoh: Tasikmalaya"
                                    className={errors.kota ? 'border-red-500' : ''}
                                />
                                {errors.kota && (
                                    <p className="text-sm text-red-500">{errors.kota}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="provinsi">
                                    Provinsi <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="provinsi"
                                    value={data.provinsi}
                                    onChange={(e) => setData('provinsi', e.target.value)}
                                    placeholder="Contoh: Jawa Barat"
                                    className={errors.provinsi ? 'border-red-500' : ''}
                                />
                                {errors.provinsi && (
                                    <p className="text-sm text-red-500">{errors.provinsi}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kode_pos">
                                Kode Pos <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="kode_pos"
                                value={data.kode_pos}
                                onChange={(e) => setData('kode_pos', e.target.value)}
                                placeholder="Contoh: 46151"
                                className={errors.kode_pos ? 'border-red-500' : ''}
                            />
                            {errors.kode_pos && (
                                <p className="text-sm text-red-500">{errors.kode_pos}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status_aktif">
                                Status <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.status_aktif.toString()}
                                onValueChange={(value) =>
                                    setData('status_aktif', value === 'true')
                                }
                            >
                                <SelectTrigger
                                    className={errors.status_aktif ? 'border-red-500' : ''}
                                >
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Aktif</SelectItem>
                                    <SelectItem value="false">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status_aktif && (
                                <p className="text-sm text-red-500">{errors.status_aktif}</p>
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
