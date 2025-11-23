import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    harga_asal: number;
    satuan: string;
}

interface Cabang {
    id: number;
    nama_cabang: string;
}

interface Suplier {
    id: number;
    nama_suplier: string;
}

interface DetailItem {
    barang_id: number;
    jumlah: number;
    harga_beli: number;
    subtotal: number;
}

interface Props {
    barang: Barang[];
    cabang: Cabang[];
    suplier: Suplier[];
}

export default function PembelianCreate({ barang, cabang, suplier }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tanggal_pembelian: new Date().toISOString().split('T')[0],
        suplier_id: 0,
        cabang_id: 0,
        total_item: 0,
        subtotal: 0,
        diskon: 0,
        ongkos_kirim: 0,
        total_bayar: 0,
        status_pembayaran: 'belum_lunas' as 'lunas' | 'belum_lunas' | 'cicilan',
        tanggal_jatuh_tempo: '',
        keterangan: '',
        detail: [] as DetailItem[],
    });

    const [detailItems, setDetailItems] = useState<DetailItem[]>([
        { barang_id: 0, jumlah: 1, harga_beli: 0, subtotal: 0 },
    ]);

    const handleAddRow = () => {
        setDetailItems([
            ...detailItems,
            { barang_id: 0, jumlah: 1, harga_beli: 0, subtotal: 0 },
        ]);
    };

    const handleRemoveRow = (index: number) => {
        if (detailItems.length > 1) {
            const newItems = detailItems.filter((_, i) => i !== index);
            setDetailItems(newItems);
            calculateTotals(newItems, data.diskon, data.ongkos_kirim);
        }
    };

    const handleDetailChange = (
        index: number,
        field: keyof DetailItem,
        value: number
    ) => {
        const newItems = [...detailItems];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate subtotal for this item
        if (field === 'jumlah' || field === 'harga_beli') {
            newItems[index].subtotal =
                newItems[index].jumlah * newItems[index].harga_beli;
        }

        // Auto-fill harga_beli from barang if barang_id changes
        if (field === 'barang_id' && value > 0) {
            const selectedBarang = barang.find((b) => b.id === value);
            if (selectedBarang) {
                newItems[index].harga_beli = selectedBarang.harga_asal;
                newItems[index].subtotal =
                    newItems[index].jumlah * selectedBarang.harga_asal;
            }
        }

        setDetailItems(newItems);
        calculateTotals(newItems, data.diskon, data.ongkos_kirim);
    };

    const calculateTotals = (
        items: DetailItem[],
        diskon: number,
        ongkir: number
    ) => {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const totalItem = items.filter((item) => item.barang_id > 0).length;
        const totalBayar = subtotal - diskon + ongkir;
        const validDetails = items.filter((item) => item.barang_id > 0);

        setData({
            ...data,
            total_item: totalItem,
            subtotal,
            total_bayar: totalBayar,
            diskon,
            ongkos_kirim: ongkir,
            detail: validDetails,
        });
    };

    const handleDiskonChange = (value: number) => {
        setData('diskon', value);
        calculateTotals(detailItems, value, data.ongkos_kirim);
    };

    const handleOngkirChange = (value: number) => {
        setData('ongkos_kirim', value);
        calculateTotals(detailItems, data.diskon, value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/pembelian');
    };

    const handleBack = () => {
        router.visit('/pembelian');
    };

    const formatRupiah = (value: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AppLayout>
            <Head title="Tambah Pembelian" />

            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Heading title="Tambah Pembelian" icon={ShoppingCart} />
                    <Button
                        onClick={handleBack}
                        variant="outline"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Master Data Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Pembelian</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal_pembelian">
                                        Tanggal Pembelian{' '}
                                        <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="tanggal_pembelian"
                                        type="date"
                                        value={data.tanggal_pembelian}
                                        onChange={(e) =>
                                            setData('tanggal_pembelian', e.target.value)
                                        }
                                    />
                                    {errors.tanggal_pembelian && (
                                        <p className="text-sm text-red-600">
                                            {errors.tanggal_pembelian}
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

                                <div className="space-y-2">
                                    <Label htmlFor="cabang_id">
                                        Cabang <span className="text-red-600">*</span>
                                    </Label>
                                    <Select
                                        value={data.cabang_id.toString()}
                                        onValueChange={(value) =>
                                            setData('cabang_id', parseInt(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih cabang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cabang.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={c.id.toString()}
                                                >
                                                    {c.nama_cabang}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.cabang_id && (
                                        <p className="text-sm text-red-600">
                                            {errors.cabang_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status_pembayaran">
                                        Status Pembayaran{' '}
                                        <span className="text-red-600">*</span>
                                    </Label>
                                    <Select
                                        value={data.status_pembayaran}
                                        onValueChange={(value: any) =>
                                            setData('status_pembayaran', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lunas">Lunas</SelectItem>
                                            <SelectItem value="belum_lunas">
                                                Belum Lunas
                                            </SelectItem>
                                            <SelectItem value="cicilan">Cicilan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status_pembayaran && (
                                        <p className="text-sm text-red-600">
                                            {errors.status_pembayaran}
                                        </p>
                                    )}
                                </div>

                                {data.status_pembayaran !== 'lunas' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal_jatuh_tempo">
                                            Tanggal Jatuh Tempo
                                        </Label>
                                        <Input
                                            id="tanggal_jatuh_tempo"
                                            type="date"
                                            value={data.tanggal_jatuh_tempo}
                                            onChange={(e) =>
                                                setData(
                                                    'tanggal_jatuh_tempo',
                                                    e.target.value
                                                )
                                            }
                                        />
                                        {errors.tanggal_jatuh_tempo && (
                                            <p className="text-sm text-red-600">
                                                {errors.tanggal_jatuh_tempo}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keterangan">Keterangan</Label>
                                <Textarea
                                    id="keterangan"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder="Masukkan keterangan pembelian"
                                    rows={3}
                                />
                                {errors.keterangan && (
                                    <p className="text-sm text-red-600">
                                        {errors.keterangan}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detail Items Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Detail Barang</CardTitle>
                                <Button
                                    type="button"
                                    onClick={handleAddRow}
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2 text-sm font-medium">
                                                Barang
                                            </th>
                                            <th className="text-left p-2 text-sm font-medium w-32">
                                                Jumlah
                                            </th>
                                            <th className="text-left p-2 text-sm font-medium w-40">
                                                Harga Beli
                                            </th>
                                            <th className="text-left p-2 text-sm font-medium w-40">
                                                Subtotal
                                            </th>
                                            <th className="text-center p-2 text-sm font-medium w-20">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailItems.map((item, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="p-2">
                                                    <Select
                                                        value={item.barang_id.toString()}
                                                        onValueChange={(value) =>
                                                            handleDetailChange(
                                                                index,
                                                                'barang_id',
                                                                parseInt(value)
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih barang" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {barang.map((b) => (
                                                                <SelectItem
                                                                    key={b.id}
                                                                    value={b.id.toString()}
                                                                >
                                                                    {b.kode_barang} -{' '}
                                                                    {b.nama_barang}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        value={item.jumlah}
                                                        onChange={(e) =>
                                                            handleDetailChange(
                                                                index,
                                                                'jumlah',
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        min={1}
                                                        className="w-full"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        value={item.harga_beli}
                                                        onChange={(e) =>
                                                            handleDetailChange(
                                                                index,
                                                                'harga_beli',
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        min={0}
                                                        className="w-full"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <div className="text-sm font-medium">
                                                        {formatRupiah(item.subtotal)}
                                                    </div>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleRemoveRow(index)}
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={detailItems.length === 1}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {errors.detail && (
                                <p className="text-sm text-red-600 mt-2">
                                    {errors.detail}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Summary Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-w-md ml-auto">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Subtotal:</span>
                                    <span className="font-medium">
                                        {formatRupiah(data.subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center gap-4">
                                    <Label htmlFor="diskon" className="text-sm">
                                        Diskon:
                                    </Label>
                                    <Input
                                        id="diskon"
                                        type="number"
                                        value={data.diskon}
                                        onChange={(e) =>
                                            handleDiskonChange(
                                                parseInt(e.target.value) || 0
                                            )
                                        }
                                        min={0}
                                        className="w-40 text-right"
                                    />
                                </div>

                                <div className="flex justify-between items-center gap-4">
                                    <Label htmlFor="ongkos_kirim" className="text-sm">
                                        Ongkos Kirim:
                                    </Label>
                                    <Input
                                        id="ongkos_kirim"
                                        type="number"
                                        value={data.ongkos_kirim}
                                        onChange={(e) =>
                                            handleOngkirChange(
                                                parseInt(e.target.value) || 0
                                            )
                                        }
                                        min={0}
                                        className="w-40 text-right"
                                    />
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">
                                            Total Bayar:
                                        </span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            {formatRupiah(data.total_bayar)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pembelian'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
