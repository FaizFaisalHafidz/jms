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
import { ArrowLeft, Smartphone } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Service {
    id: number;
    nomor_service: string;
    tanggal_masuk: string;
    nama_pelanggan: string;
    telepon_pelanggan: string;
    merk_hp: string;
    tipe_hp: string;
    imei: string | null;
    keluhan: string;
    kerusakan: string | null;
    spare_part_diganti: string | null;
    biaya_spare_part: number;
    biaya_jasa: number;
    total_biaya: number;
    status_service: string;
    teknisi_id: number | null;
    tanggal_selesai: string | null;
    tanggal_diambil: string | null;
    keterangan: string | null;
    metode_pembayaran: string;
}

interface Teknisi {
    id: number;
    name: string;
}

interface Props {
    service: Service;
    teknisi: Teknisi[];
}

export default function ServiceHpEdit({ service, teknisi }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        tanggal_masuk: service.tanggal_masuk.slice(0, 16),
        nama_pelanggan: service.nama_pelanggan,
        telepon_pelanggan: service.telepon_pelanggan,
        merk_hp: service.merk_hp,
        tipe_hp: service.tipe_hp,
        imei: service.imei || '',
        keluhan: service.keluhan,
        kerusakan: service.kerusakan || '',
        spare_part_diganti: service.spare_part_diganti || '',
        biaya_spare_part: service.biaya_spare_part,
        biaya_jasa: service.biaya_jasa,
        status_service: service.status_service,
        teknisi_id: service.teknisi_id?.toString() || '',
        tanggal_selesai: service.tanggal_selesai?.slice(0, 16) || '',
        tanggal_diambil: service.tanggal_diambil?.slice(0, 16) || '',
        keterangan: service.keterangan || '',
        metode_pembayaran: service.metode_pembayaran || 'tunai',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/service/${service.id}`);
    };

    const totalBiaya = (data.biaya_spare_part || 0) + (data.biaya_jasa || 0);

    return (
        <AppLayout>
            <Head title="Edit Service HP" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title={`Edit Service - ${service.nomor_service}`}
                        icon={Smartphone}
                    />
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/service')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Data HP */}
                        <Card className="lg:col-span-2">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-semibold text-lg">Data HP & Keluhan</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tanggal Masuk</Label>
                                        <Input
                                            type="datetime-local"
                                            value={data.tanggal_masuk}
                                            onChange={(e) =>
                                                setData('tanggal_masuk', e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Status Service *</Label>
                                        <Select
                                            value={data.status_service}
                                            onValueChange={(value) =>
                                                setData('status_service', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="diterima">
                                                    Diterima
                                                </SelectItem>
                                                <SelectItem value="dicek">Dicek</SelectItem>
                                                <SelectItem value="dikerjakan">
                                                    Dikerjakan
                                                </SelectItem>
                                                <SelectItem value="selesai">
                                                    Selesai
                                                </SelectItem>
                                                <SelectItem value="diambil">
                                                    Diambil
                                                </SelectItem>
                                                <SelectItem value="batal">Batal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Teknisi</Label>
                                        <Select
                                            value={data.teknisi_id}
                                            onValueChange={(value) =>
                                                setData('teknisi_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih teknisi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teknisi.map((t) => (
                                                    <SelectItem
                                                        key={t.id}
                                                        value={t.id.toString()}
                                                    >
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tanggal Selesai</Label>
                                        <Input
                                            type="datetime-local"
                                            value={data.tanggal_selesai}
                                            onChange={(e) =>
                                                setData('tanggal_selesai', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tanggal Diambil</Label>
                                    <Input
                                        type="datetime-local"
                                        value={data.tanggal_diambil}
                                        onChange={(e) =>
                                            setData('tanggal_diambil', e.target.value)
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Merk HP *</Label>
                                        <Input
                                            value={data.merk_hp}
                                            onChange={(e) =>
                                                setData('merk_hp', e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tipe HP *</Label>
                                        <Input
                                            value={data.tipe_hp}
                                            onChange={(e) =>
                                                setData('tipe_hp', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>IMEI</Label>
                                    <Input
                                        value={data.imei}
                                        onChange={(e) => setData('imei', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Keluhan *</Label>
                                    <Textarea
                                        value={data.keluhan}
                                        onChange={(e) =>
                                            setData('keluhan', e.target.value)
                                        }
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Diagnosa Kerusakan</Label>
                                    <Textarea
                                        value={data.kerusakan}
                                        onChange={(e) =>
                                            setData('kerusakan', e.target.value)
                                        }
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Spare Part yang Diganti</Label>
                                    <Textarea
                                        value={data.spare_part_diganti}
                                        onChange={(e) =>
                                            setData('spare_part_diganti', e.target.value)
                                        }
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Keterangan Tambahan</Label>
                                    <Textarea
                                        value={data.keterangan}
                                        onChange={(e) =>
                                            setData('keterangan', e.target.value)
                                        }
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Data Pelanggan */}
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg">
                                        Data Pelanggan
                                    </h3>

                                    <div className="space-y-2">
                                        <Label>Nama Pelanggan *</Label>
                                        <Input
                                            value={data.nama_pelanggan}
                                            onChange={(e) =>
                                                setData('nama_pelanggan', e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>No. Telepon *</Label>
                                        <Input
                                            value={data.telepon_pelanggan}
                                            onChange={(e) =>
                                                setData('telepon_pelanggan', e.target.value)
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Biaya */}
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg">Biaya Service</h3>

                                    <div className="space-y-2">
                                        <Label>Biaya Spare Part</Label>
                                        <Input
                                            type="number"
                                            value={data.biaya_spare_part}
                                            onChange={(e) =>
                                                setData(
                                                    'biaya_spare_part',
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                            min={0}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Biaya Jasa</Label>
                                        <Input
                                            type="number"
                                            value={data.biaya_jasa}
                                            onChange={(e) =>
                                                setData(
                                                    'biaya_jasa',
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                            min={0}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Metode Pembayaran</Label>
                                        <Select
                                            value={data.metode_pembayaran}
                                            onValueChange={(value) =>
                                                setData('metode_pembayaran', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih metode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tunai">Tunai</SelectItem>
                                                <SelectItem value="transfer">Transfer</SelectItem>
                                                <SelectItem value="qris">QRIS</SelectItem>
                                                <SelectItem value="edc">EDC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">
                                                Total Biaya:
                                            </span>
                                            <span className="text-xl font-bold text-blue-600">
                                                Rp {totalBiaya.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                Update Service
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
