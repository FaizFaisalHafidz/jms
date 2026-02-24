import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
}

interface Cabang {
    id: number;
    nama_cabang: string;
}

interface StokCabangModalProps {
    isOpen: boolean;
    onClose: () => void;
    barang: Barang | null;
    cabangs: Cabang[];
}

export function StokCabangModal({ isOpen, onClose, barang, cabangs }: StokCabangModalProps) {
    const [stokData, setStokData] = useState<Record<number, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && barang) {
            setIsLoading(true);
            axios.get(`/super-admin/stok-cabang/${barang.id}/data`)
                .then(response => {
                    const customData = response.data.data;
                    const initialData: Record<number, string> = {};
                    cabangs.forEach(cabang => {
                        const custom = customData[cabang.id];
                        initialData[cabang.id] = custom?.jumlah_stok?.toString() || '0';
                    });
                    setStokData(initialData);
                })
                .catch(error => {
                    console.error('Failed to fetch stock:', error);
                    toast.error('Gagal memuat data stok cabang');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, barang, cabangs]);

    const handleStokChange = (cabangId: number, value: string) => {
        setStokData(prev => ({
            ...prev,
            [cabangId]: value,
        }));
    };

    const handleSaveAll = () => {
        if (!barang) return;
        setIsSaving(true);
        const updates = cabangs.map(cabang => ({
            cabang_id: cabang.id,
            jumlah_stok: stokData[cabang.id] ? parseInt(stokData[cabang.id]) : 0,
        }));

        router.post(
            '/super-admin/stok-cabang/batch',
            {
                barang_id: barang.id,
                updates
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    toast.success('Stok berhasil disimpan');
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
        setStokData(prev => ({
            ...prev,
            [cabangId]: '0',
        }));
    };

    if (!barang) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Stok Per Cabang</DialogTitle>
                    <DialogDescription>
                        {barang.nama_barang} ({barang.kode_barang})
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Memuat data...</div>
                ) : (
                    <div className="space-y-6 mt-4">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cabang</TableHead>
                                        <TableHead>Jumlah Stok</TableHead>
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
                                                    placeholder="0"
                                                    value={stokData[cabang.id] || ''}
                                                    onChange={(e) => handleStokChange(cabang.id, e.target.value)}
                                                    className="w-full min-w-[150px]"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleResetCabang(cabang.id)}
                                                    title="Reset ke Nol"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {cabangs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-4">
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
