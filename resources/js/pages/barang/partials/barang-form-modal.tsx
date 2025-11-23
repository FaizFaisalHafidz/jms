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
import axios from 'axios';
import { useEffect, useState } from 'react';
import Barcode from 'react-barcode';

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
    status_aktif: boolean;
}

interface BarangFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    barang: Barang | null;
    kategori: KategoriBarang[];
    suplier: Suplier[];
}

export function BarangFormModal({
    isOpen,
    onClose,
    barang,
    kategori,
    suplier,
}: BarangFormModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        kategori_id: 0,
        suplier_id: 0,
        kode_barang: '',
        nama_barang: '',
        merk: '',
        tipe: '',
        satuan: 'PCS',
        harga_asal: 0,
        harga_konsumen: 0,
        harga_konter: 0,
        stok_minimal: 5,
        deskripsi: '',
        status_aktif: true,
        regenerate_barcode: false,
    });

    const [isGeneratingKode, setIsGeneratingKode] = useState(false);

    // Auto-generate kode barang when kategori changes (only for new barang)
    useEffect(() => {
        if (!barang && data.kategori_id > 0 && !isGeneratingKode) {
            setIsGeneratingKode(true);
            axios
                .post('/barang/generate-kode', {
                    kategori_id: data.kategori_id,
                })
                .then((response) => {
                    setData('kode_barang', response.data.kode_barang);
                })
                .catch((error) => {
                    console.error('Error generating kode:', error);
                })
                .finally(() => {
                    setIsGeneratingKode(false);
                });
        }
    }, [data.kategori_id, barang]);

    useEffect(() => {
        if (barang) {
            setData({
                kategori_id: barang.kategori_id,
                suplier_id: barang.suplier_id,
                kode_barang: barang.kode_barang,
                nama_barang: barang.nama_barang,
                merk: barang.merk || '',
                tipe: barang.tipe || '',
                satuan: barang.satuan,
                harga_asal: barang.harga_asal,
                harga_konsumen: barang.harga_konsumen,
                harga_konter: barang.harga_konter,
                stok_minimal: barang.stok_minimal,
                deskripsi: barang.deskripsi || '',
                status_aktif: barang.status_aktif,
                regenerate_barcode: false,
            });
        } else {
            reset();
        }
    }, [barang]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (barang) {
            put(`/barang/${barang.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/barang', {
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {barang ? 'Edit Barang' : 'Tambah Barang'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="kategori_id">
                                Kategori <span className="text-red-600">*</span>
                            </Label>
                            <Select
                                value={data.kategori_id.toString()}
                                onValueChange={(value) =>
                                    setData('kategori_id', parseInt(value))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kategori.map((k) => (
                                        <SelectItem
                                            key={k.id}
                                            value={k.id.toString()}
                                        >
                                            {k.nama_kategori}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.kategori_id && (
                                <p className="text-sm text-red-600">
                                    {errors.kategori_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="suplier_id">
                                Supplier <span className="text-red-600">*</span>
                            </Label>
                            <Select
                                value={data.suplier_id.toString()}
                                onValueChange={(value) =>
                                    setData('suplier_id', parseInt(value))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suplier.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={s.id.toString()}
                                        >
                                            {s.nama_suplier}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.suplier_id && (
                                <p className="text-sm text-red-600">
                                    {errors.suplier_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="kode_barang">
                                Kode Barang{' '}
                                <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="kode_barang"
                                value={data.kode_barang}
                                onChange={(e) =>
                                    setData('kode_barang', e.target.value)
                                }
                                maxLength={50}
                                placeholder="Auto-generate dari kategori"
                                disabled={isGeneratingKode}
                            />
                            {isGeneratingKode && (
                                <p className="text-sm text-blue-600">
                                    Generating kode...
                                </p>
                            )}
                            {errors.kode_barang && (
                                <p className="text-sm text-red-600">
                                    {errors.kode_barang}
                                </p>
                            )}
                        </div>

                        {barang && barang.barcode && (
                            <div className="space-y-2">
                                <Label>Barcode Saat Ini</Label>
                                <div className="p-4 bg-white dark:bg-gray-900 border rounded-md flex justify-center">
                                    <Barcode 
                                        value={barang.barcode} 
                                        height={60}
                                        fontSize={14}
                                        margin={5}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="regenerate_barcode"
                                        checked={data.regenerate_barcode}
                                        onChange={(e) =>
                                            setData('regenerate_barcode', e.target.checked)
                                        }
                                        className="rounded"
                                    />
                                    <Label htmlFor="regenerate_barcode" className="text-sm cursor-pointer">
                                        Generate barcode baru
                                    </Label>
                                </div>
                            </div>
                        )}

                        {!barang && (
                            <div className="space-y-2">
                                <Label>Barcode</Label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <p className="text-sm text-muted-foreground text-center italic">
                                        Barcode akan di-generate otomatis setelah barang disimpan
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nama_barang">
                            Nama Barang <span className="text-red-600">*</span>
                        </Label>
                        <Input
                            id="nama_barang"
                            value={data.nama_barang}
                            onChange={(e) =>
                                setData('nama_barang', e.target.value)
                            }
                            maxLength={200}
                            placeholder="Masukkan nama barang"
                        />
                        {errors.nama_barang && (
                            <p className="text-sm text-red-600">
                                {errors.nama_barang}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="merk">Merk</Label>
                            <Input
                                id="merk"
                                value={data.merk}
                                onChange={(e) => setData('merk', e.target.value)}
                                maxLength={50}
                                placeholder="Masukkan merk"
                            />
                            {errors.merk && (
                                <p className="text-sm text-red-600">
                                    {errors.merk}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tipe">Tipe</Label>
                            <Input
                                id="tipe"
                                value={data.tipe}
                                onChange={(e) => setData('tipe', e.target.value)}
                                maxLength={50}
                                placeholder="Masukkan tipe"
                            />
                            {errors.tipe && (
                                <p className="text-sm text-red-600">
                                    {errors.tipe}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="satuan">
                                Satuan <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="satuan"
                                value={data.satuan}
                                onChange={(e) =>
                                    setData('satuan', e.target.value)
                                }
                                maxLength={20}
                                placeholder="PCS"
                            />
                            {errors.satuan && (
                                <p className="text-sm text-red-600">
                                    {errors.satuan}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="harga_asal">
                                Harga Modal <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="harga_asal"
                                type="number"
                                value={data.harga_asal}
                                onChange={(e) =>
                                    setData('harga_asal', parseInt(e.target.value) || 0)
                                }
                                min={0}
                                placeholder="0"
                            />
                            {errors.harga_asal && (
                                <p className="text-sm text-red-600">
                                    {errors.harga_asal}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="harga_konsumen">
                                Harga Konsumen{' '}
                                <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="harga_konsumen"
                                type="number"
                                value={data.harga_konsumen}
                                onChange={(e) =>
                                    setData(
                                        'harga_konsumen',
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                min={0}
                                placeholder="0"
                            />
                            {errors.harga_konsumen && (
                                <p className="text-sm text-red-600">
                                    {errors.harga_konsumen}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="harga_konter">
                                Harga Konter{' '}
                                <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="harga_konter"
                                type="number"
                                value={data.harga_konter}
                                onChange={(e) =>
                                    setData(
                                        'harga_konter',
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                min={0}
                                placeholder="0"
                            />
                            {errors.harga_konter && (
                                <p className="text-sm text-red-600">
                                    {errors.harga_konter}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stok_minimal">
                            Stok Minimal <span className="text-red-600">*</span>
                        </Label>
                        <Input
                            id="stok_minimal"
                            type="number"
                            value={data.stok_minimal}
                            onChange={(e) =>
                                setData('stok_minimal', parseInt(e.target.value) || 0)
                            }
                            min={0}
                            placeholder="5"
                        />
                        {errors.stok_minimal && (
                            <p className="text-sm text-red-600">
                                {errors.stok_minimal}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <Textarea
                            id="deskripsi"
                            value={data.deskripsi}
                            onChange={(e) => setData('deskripsi', e.target.value)}
                            placeholder="Masukkan deskripsi barang"
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
                                : barang
                                  ? 'Perbarui'
                                  : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
