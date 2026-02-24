import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    harga_asal: number;
    harga_konsumen: number;
    harga_konter: number;
    harga_partai: number;
    kategori: {
        nama_kategori: string;
    };
}

interface Cabang {
    id: number;
    nama_cabang: string;
}

interface HargaCabangModalProps {
    isOpen: boolean;
    onClose: () => void;
    barang: Barang | null;
    cabangs: Cabang[];
}

export function HargaCabangModal({ isOpen, onClose, barang, cabangs }: HargaCabangModalProps) {
    const [hargaData, setHargaData] = useState<Record<number, {
        harga_konsumen: string;
        harga_konter: string;
        harga_partai: string;
    }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hargaAsal, setHargaAsal] = useState<string>('');

    useEffect(() => {
        if (isOpen && barang) {
            setHargaAsal(barang.harga_asal?.toString() || '');
            setIsLoading(true);
            axios.get(`/super-admin/harga-cabang/${barang.id}/data`)
                .then(response => {
                    const customData = response.data.data;
                    const initialData: Record<number, any> = {};
                    cabangs.forEach(cabang => {
                        const custom = customData[cabang.id];
                        initialData[cabang.id] = {
                            harga_konsumen: custom?.harga_konsumen?.toString() || '',
                            harga_konter: custom?.harga_konter?.toString() || '',
                            harga_partai: custom?.harga_partai?.toString() || '',
                        };
                    });
                    setHargaData(initialData);
                })
                .catch(error => {
                    console.error('Failed to fetch custom prices:', error);
                    toast.error('Gagal memuat data harga cabang');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, barang, cabangs]);

    const handleHargaChange = (cabangId: number, tipeHarga: string, value: string) => {
        setHargaData(prev => ({
            ...prev,
            [cabangId]: {
                ...prev[cabangId],
                [tipeHarga]: value,
            }
        }));
    };

    const handleSaveAll = () => {
        if (!barang) return;
        setIsSaving(true);
        const updates = cabangs.map(cabang => ({
            cabang_id: cabang.id,
            harga_konsumen: hargaData[cabang.id]?.harga_konsumen ? parseInt(hargaData[cabang.id].harga_konsumen) : null,
            harga_konter: hargaData[cabang.id]?.harga_konter ? parseInt(hargaData[cabang.id].harga_konter) : null,
            harga_partai: hargaData[cabang.id]?.harga_partai ? parseInt(hargaData[cabang.id].harga_partai) : null,
        }));

        router.post(
            '/super-admin/harga-cabang/batch',
            {
                barang_id: barang.id,
                harga_asal: hargaAsal ? parseInt(hargaAsal) : null,
                updates
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    toast.success('Harga custom berhasil disimpan');
                    onClose();
                },
                onError: () => {
                    setIsSaving(false);
                    toast.error('Gagal menyimpan perubahan');
                },
            }
        );
    };

    const handleResetCabang = (cabangId: number) => {
        if (!barang) return;
        if (confirm('Reset harga ke default untuk cabang ini?')) {
            router.post('/super-admin/harga-cabang/reset', {
                barang_id: barang.id,
                cabang_id: cabangId,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Harga dikembalikan ke default');
                    // Reset field value locally
                    setHargaData(prev => ({
                        ...prev,
                        [cabangId]: {
                            harga_konsumen: '',
                            harga_konter: '',
                            harga_partai: '',
                        }
                    }));
                }
            });
        }
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (!barang) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Harga Per Cabang</DialogTitle>
                    <DialogDescription>
                        {barang.nama_barang} ({barang.kode_barang})
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Memuat data...</div>
                ) : (
                    <div className="space-y-6 mt-4">
                        <div className="flex flex-col space-y-2 max-w-sm">
                            <Label htmlFor="harga_asal">Harga Awal / Modal Asal</Label>
                            <Input
                                id="harga_asal"
                                type="number"
                                placeholder="Masukkan harga awal/modal"
                                value={hargaAsal}
                                onChange={(e) => setHargaAsal(e.target.value)}
                            />
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cabang</TableHead>
                                        <TableHead>Harga Konsumen</TableHead>
                                        <TableHead>Harga Konter</TableHead>
                                        <TableHead>Harga Partai</TableHead>
                                        <TableHead className="w-[80px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cabangs.map((cabang) => (
                                        <TableRow key={cabang.id}>
                                            <TableCell className="font-medium">{cabang.nama_cabang}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    placeholder={formatRupiah(barang.harga_konsumen)}
                                                    value={hargaData[cabang.id]?.harga_konsumen || ''}
                                                    onChange={(e) => handleHargaChange(cabang.id, 'harga_konsumen', e.target.value)}
                                                    className="w-full min-w-[150px]"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    placeholder={formatRupiah(barang.harga_konter)}
                                                    value={hargaData[cabang.id]?.harga_konter || ''}
                                                    onChange={(e) => handleHargaChange(cabang.id, 'harga_konter', e.target.value)}
                                                    className="w-full min-w-[150px]"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    placeholder={formatRupiah(barang.harga_partai)}
                                                    value={hargaData[cabang.id]?.harga_partai || ''}
                                                    onChange={(e) => handleHargaChange(cabang.id, 'harga_partai', e.target.value)}
                                                    className="w-full min-w-[150px]"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleResetCabang(cabang.id)}
                                                    title="Reset ke Default"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cabangs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                Tidak ada data cabang
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                            <Button onClick={handleSaveAll} disabled={isSaving || cabangs.length === 0}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'Menyimpan...' : 'Simpan Semua'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
