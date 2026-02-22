import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DollarSign, Save, RotateCcw, Package, Building2, Search } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    harga_konsumen: number;
    harga_konter: number;
    harga_partai: number;
    kategori: {
        nama_kategori: string;
    };
}

interface Cabang {
    id: number;
    kode_cabang: string;
    nama_cabang: string;
    kota: string;
}

interface HargaCustom {
    cabang_id: number;
    harga_konsumen: number | null;
    harga_konter: number | null;
    harga_partai: number | null;
}

interface HargaCabangProps extends PageProps {
    cabangs: Cabang[];
    barang_detail: Barang | null;
    harga_custom: Record<number, HargaCustom>;
}

export default function HargaCabang({ cabangs, barang_detail, harga_custom, flash }: HargaCabangProps) {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<Barang[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedBarangData, setSelectedBarangData] = useState<Barang | null>(barang_detail);
    const [hargaData, setHargaData] = useState<Record<number, {
        harga_konsumen: string;
        harga_konter: string;
        harga_partai: string;
    }>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            setHasChanges(false);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Initialize harga data ketika barang dipilih
    useEffect(() => {
        if (selectedBarangData) {
            const initialData: Record<number, any> = {};

            cabangs.forEach(cabang => {
                const custom = harga_custom[cabang.id];
                initialData[cabang.id] = {
                    harga_konsumen: custom?.harga_konsumen?.toString() || '',
                    harga_konter: custom?.harga_konter?.toString() || '',
                    harga_partai: custom?.harga_partai?.toString() || '',
                };
            });

            setHargaData(initialData);
            setHasChanges(false);
        }
    }, [selectedBarangData, harga_custom, cabangs]);

    // Search barang
    useEffect(() => {
        if (searchKeyword.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await axios.post('/super-admin/harga-cabang/search-barang', {
                    keyword: searchKeyword
                });
                setSearchResults(response.data.data);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectBarang = (barang: Barang) => {
        setSelectedBarangData(barang);
        // Redirect dengan query parameter untuk reload data harga
        router.get(`/super-admin/harga-cabang?barang_id=${barang.id}`);
        setSearchKeyword('');
        setShowResults(false);
    };

    const handleHargaChange = (cabangId: number, tipeHarga: string, value: string) => {
        setHargaData(prev => ({
            ...prev,
            [cabangId]: {
                ...prev[cabangId],
                [tipeHarga]: value,
            }
        }));
        setHasChanges(true);
    };

    const handleSaveAll = () => {
        if (!selectedBarangData) return;

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
                barang_id: selectedBarangData.id,
                updates
            },
            {
                onSuccess: () => {
                    setIsSaving(false);
                },
                onError: () => {
                    setIsSaving(false);
                    toast.error('Gagal menyimpan perubahan');
                },
            }
        );
    };

    const handleResetCabang = (cabangId: number) => {
        if (!selectedBarangData) return;

        if (confirm('Reset harga ke default untuk cabang ini?')) {
            router.post('/super-admin/harga-cabang/reset', {
                barang_id: selectedBarangData.id,
                cabang_id: cabangId,
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

    return (
        <AppLayout>
            <Head title="Pengaturan Harga Per Cabang" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Pengaturan Harga Per Cabang"
                    description="Atur harga berbeda untuk setiap cabang. Kosongkan untuk menggunakan harga default."
                    icon={DollarSign}
                />

                {/* Search Barang */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cari Barang</CardTitle>
                        <CardDescription>
                            Ketik nama atau kode barang untuk mencari
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative" ref={searchRef}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama barang, kode barang, atau barcode..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                                    {searchResults.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelectBarang(item)}
                                            className="w-full px-4 py-3 text-left hover:bg-accent border-b last:border-b-0 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{item.nama_barang}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.kode_barang} | {item.kategori.nama_kategori}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <p className="font-semibold">{formatRupiah(item.harga_konsumen)}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showResults && searchResults.length === 0 && searchKeyword.length >= 2 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                                    Barang tidak ditemukan
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Info Barang Terpilih */}
                {selectedBarangData && (
                    <>
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="text-blue-900 flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    {selectedBarangData.nama_barang}
                                </CardTitle>
                                <CardDescription className="text-blue-700">
                                    Kode: {selectedBarangData.kode_barang} | Kategori: {selectedBarangData.kategori.nama_kategori}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-blue-800">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="font-semibold">Harga Default Konsumen:</p>
                                        <p className="text-lg font-bold">{formatRupiah(selectedBarangData.harga_konsumen)}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Harga Default Konter:</p>
                                        <p className="text-lg font-bold">{formatRupiah(selectedBarangData.harga_konter)}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Harga Default Partai:</p>
                                        <p className="text-lg font-bold">{formatRupiah(selectedBarangData.harga_partai)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        {hasChanges && (
                            <Card className="border-orange-200 bg-orange-50">
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="font-medium text-orange-900">Ada perubahan yang belum disimpan</p>
                                        <p className="text-sm text-orange-700">
                                            Klik "Simpan Semua Perubahan" untuk menyimpan
                                        </p>
                                    </div>
                                    <Button onClick={handleSaveAll} disabled={isSaving}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tabel Harga Per Cabang */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Harga Per Cabang</CardTitle>
                                <CardDescription>
                                    Masukkan harga custom atau kosongkan untuk menggunakan harga default
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[250px]">Cabang</TableHead>
                                            <TableHead>Harga Konsumen</TableHead>
                                            <TableHead>Harga Konter</TableHead>
                                            <TableHead>Harga Partai</TableHead>
                                            <TableHead className="w-[100px]">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cabangs.map((cabang) => (
                                            <TableRow key={cabang.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-semibold">{cabang.nama_cabang}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {cabang.kode_cabang} - {cabang.kota}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        placeholder={formatRupiah(selectedBarangData.harga_konsumen)}
                                                        value={hargaData[cabang.id]?.harga_konsumen || ''}
                                                        onChange={(e) => handleHargaChange(cabang.id, 'harga_konsumen', e.target.value)}
                                                        className="w-40"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        placeholder={formatRupiah(selectedBarangData.harga_konter)}
                                                        value={hargaData[cabang.id]?.harga_konter || ''}
                                                        onChange={(e) => handleHargaChange(cabang.id, 'harga_konter', e.target.value)}
                                                        className="w-40"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        placeholder={formatRupiah(selectedBarangData.harga_partai)}
                                                        value={hargaData[cabang.id]?.harga_partai || ''}
                                                        onChange={(e) => handleHargaChange(cabang.id, 'harga_partai', e.target.value)}
                                                        className="w-40"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleResetCabang(cabang.id)}
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-green-900">Informasi</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-green-800 space-y-2">
                                <p>
                                    <strong>• Harga Custom:</strong> Masukkan nilai untuk menggunakan harga khusus di cabang tersebut
                                </p>
                                <p>
                                    <strong>• Harga Default:</strong> Kosongkan field untuk menggunakan harga default dari master barang
                                </p>
                                <p>
                                    <strong>• Reset:</strong> Klik tombol reset untuk menghapus harga custom dan kembali ke harga default
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Empty State */}
                {!selectedBarangData && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Search className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Cari Barang</h3>
                            <p className="text-muted-foreground">
                                Gunakan kolom pencarian di atas untuk mencari dan memilih barang
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
