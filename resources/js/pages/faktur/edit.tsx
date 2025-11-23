import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { ArrowLeft, FileText } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Faktur {
    id: number;
    nomor_faktur: string;
    tanggal_faktur: string;
    nama_pelanggan: string;
    telepon_pelanggan: string | null;
    alamat_pelanggan: string | null;
    subtotal: number;
    diskon: number;
    total_bayar: number;
    status_pembayaran: string;
    tanggal_jatuh_tempo: string | null;
    keterangan: string | null;
    nomor_transaksi: string;
    items: Array<{
        nama_barang: string;
        qty: number;
        harga: number;
        subtotal: number;
    }>;
}

interface Props {
    faktur: Faktur;
}

export default function FakturEdit({ faktur }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nama_pelanggan: faktur.nama_pelanggan,
        telepon_pelanggan: faktur.telepon_pelanggan || '',
        alamat_pelanggan: faktur.alamat_pelanggan || '',
        tanggal_faktur: faktur.tanggal_faktur,
        tanggal_jatuh_tempo: faktur.tanggal_jatuh_tempo || '',
        status_pembayaran: faktur.status_pembayaran,
        keterangan: faktur.keterangan || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        router.put(`/faktur/${faktur.id}`, data);
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
            <Head title="Edit Faktur" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Edit Faktur" icon={FileText} />
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/faktur')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg">
                                        Detail Transaksi
                                    </h3>

                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    No. Faktur:
                                                </span>
                                                <span className="font-medium">
                                                    {faktur.nomor_faktur}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    No. Transaksi:
                                                </span>
                                                <span className="font-medium">
                                                    {faktur.nomor_transaksi}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Subtotal:
                                                </span>
                                                <span>
                                                    {formatRupiah(
                                                        faktur.subtotal
                                                    )}
                                                </span>
                                            </div>
                                            {faktur.diskon > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        Diskon:
                                                    </span>
                                                    <span>
                                                        {formatRupiah(
                                                            faktur.diskon
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2 border-t">
                                                <span className="font-semibold">
                                                    Total:
                                                </span>
                                                <span className="font-semibold text-blue-600">
                                                    {formatRupiah(
                                                        faktur.total_bayar
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <h5 className="font-medium text-sm mb-2">
                                                Items:
                                            </h5>
                                            <div className="space-y-1">
                                                {faktur.items.map(
                                                    (item, index) => (
                                                        <div
                                                            key={index}
                                                            className="text-sm flex justify-between"
                                                        >
                                                            <span>
                                                                {
                                                                    item.nama_barang
                                                                }{' '}
                                                                x {item.qty}
                                                            </span>
                                                            <span>
                                                                {formatRupiah(
                                                                    item.subtotal
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg">
                                        Data Pelanggan
                                    </h3>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama_pelanggan">
                                                Nama Pelanggan *
                                            </Label>
                                            <Input
                                                id="nama_pelanggan"
                                                value={data.nama_pelanggan}
                                                onChange={(e) =>
                                                    setData(
                                                        'nama_pelanggan',
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            {errors.nama_pelanggan && (
                                                <p className="text-sm text-red-600">
                                                    {errors.nama_pelanggan}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="telepon_pelanggan">
                                                Telepon
                                            </Label>
                                            <Input
                                                id="telepon_pelanggan"
                                                value={data.telepon_pelanggan}
                                                onChange={(e) =>
                                                    setData(
                                                        'telepon_pelanggan',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="alamat_pelanggan">
                                            Alamat
                                        </Label>
                                        <Textarea
                                            id="alamat_pelanggan"
                                            value={data.alamat_pelanggan}
                                            onChange={(e) =>
                                                setData(
                                                    'alamat_pelanggan',
                                                    e.target.value
                                                )
                                            }
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg">
                                        Informasi Faktur
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal_faktur">
                                            Tanggal Faktur *
                                        </Label>
                                        <Input
                                            id="tanggal_faktur"
                                            type="date"
                                            value={data.tanggal_faktur}
                                            onChange={(e) =>
                                                setData(
                                                    'tanggal_faktur',
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                        {errors.tanggal_faktur && (
                                            <p className="text-sm text-red-600">
                                                {errors.tanggal_faktur}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status_pembayaran">
                                            Status Pembayaran *
                                        </Label>
                                        <Select
                                            value={data.status_pembayaran}
                                            onValueChange={(value) =>
                                                setData(
                                                    'status_pembayaran',
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lunas">
                                                    Lunas
                                                </SelectItem>
                                                <SelectItem value="belum_lunas">
                                                    Belum Lunas
                                                </SelectItem>
                                                <SelectItem value="cicilan">
                                                    Cicilan
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status_pembayaran && (
                                            <p className="text-sm text-red-600">
                                                {errors.status_pembayaran}
                                            </p>
                                        )}
                                    </div>

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
                                        <p className="text-xs text-gray-500">
                                            Opsional, untuk faktur dengan
                                            pembayaran tempo
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="keterangan">
                                            Keterangan
                                        </Label>
                                        <Textarea
                                            id="keterangan"
                                            value={data.keterangan}
                                            onChange={(e) =>
                                                setData(
                                                    'keterangan',
                                                    e.target.value
                                                )
                                            }
                                            rows={3}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        Update Faktur
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
