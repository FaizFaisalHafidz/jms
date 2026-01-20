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
import axios from 'axios';
import { ArrowLeft, Plus, Smartphone, X } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Teknisi {
    id: number;
    name: string;
}

interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    harga_konsumen: number;
    harga_partai?: number;
}

interface SparePart {
    id: string;
    nama: string;
    biaya: number;
    dari_barang: boolean;
    barang_id?: number;
}

interface ServiceData {
    id: number;
    nomor_service: string;
    tanggal_masuk: string;
    nama_pelanggan: string;
    telepon_pelanggan: string;
    merk_hp: string;
    tipe_hp: string;
    keluhan: string;
    spare_part_diganti: string;
    biaya_spare_part: number;
    biaya_jasa: number;
    total_biaya: number;
    teknisi: string;
    kasir: string;
}

interface Props {
    teknisi: Teknisi[];
    cabang_nama: string;
    cabang_alamat: string;
    cabang_telepon: string;
}

export default function ServiceHpCreate({ teknisi, cabang_nama, cabang_alamat, cabang_telepon }: Props) {
    const [spareParts, setSpareParts] = useState<SparePart[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<Barang[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [serviceData, setServiceData] = useState<ServiceData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, reset, processing, errors } = useForm({
        tanggal_masuk: new Date().toISOString().slice(0, 16),
        nama_pelanggan: '',
        telepon_pelanggan: '',
        merk_hp: '',
        tipe_hp: '',
        imei: '',
        keluhan: '',
        kerusakan: '',
        spare_part_diganti: '',
        barang_id: null as number | null,
        jumlah_barang: null as number | null,
        biaya_spare_part: 0,
        biaya_jasa: 0,
        teknisi_id: '',
        keterangan: '',
        metode_pembayaran: 'tunai',
    });

    const handleSearchBarang = async (keyword: string) => {
        setSearchKeyword(keyword);
        if (keyword.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const response = await axios.post('/pos/search-barang', { keyword });
            setSearchResults(response.data.data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleAddSparePart = (barang: Barang) => {
        const newPart: SparePart = {
            id: Date.now().toString(),
            nama: barang.nama_barang,
            biaya: barang.harga_konsumen,
            dari_barang: true,
            barang_id: barang.id,
        };

        const updatedParts = [...spareParts, newPart];
        setSpareParts(updatedParts);
        updateSparePartData(updatedParts);

        setSearchKeyword('');
        setSearchResults([]);
        setShowResults(false);
    };

    const handleAddManualPart = () => {
        const newPart: SparePart = {
            id: Date.now().toString(),
            nama: '',
            biaya: 0,
            dari_barang: false,
        };

        setSpareParts([...spareParts, newPart]);
    };

    const handleUpdatePart = (id: string, field: 'nama' | 'biaya', value: string | number) => {
        const updatedParts = spareParts.map(part =>
            part.id === id ? { ...part, [field]: value } : part
        );
        setSpareParts(updatedParts);
        updateSparePartData(updatedParts);
    };

    const handleRemovePart = (id: string) => {
        const updatedParts = spareParts.filter(part => part.id !== id);
        setSpareParts(updatedParts);
        updateSparePartData(updatedParts);
    };

    const updateSparePartData = (parts: SparePart[]) => {
        const totalBiaya = parts.reduce((sum, part) => sum + (part.biaya || 0), 0);
        const partNames = parts.map(p => p.nama).filter(n => n).join(', ');

        // Ambil barang pertama yang dari inventory (dari_barang = true)
        const barangDariInventory = parts.find(p => p.dari_barang && p.barang_id);

        setData({
            ...data,
            biaya_spare_part: totalBiaya,
            spare_part_diganti: partNames,
            barang_id: barangDariInventory?.barang_id || null,
            jumlah_barang: barangDariInventory ? 1 : null,
        });
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        router.post('/service', data);
    };

    const totalBiaya = (data.biaya_spare_part || 0) + (data.biaya_jasa || 0);

    return (
        <AppLayout>
            <Head title="Tambah Service HP" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Tambah Service HP" icon={Smartphone} />
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
                                        {errors.tanggal_masuk && (
                                            <p className="text-sm text-red-600">
                                                {errors.tanggal_masuk}
                                            </p>
                                        )}
                                    </div>

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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Merk HP *</Label>
                                        <Input
                                            value={data.merk_hp}
                                            onChange={(e) =>
                                                setData('merk_hp', e.target.value)
                                            }
                                            placeholder="Samsung, Xiaomi, dll"
                                        />
                                        {errors.merk_hp && (
                                            <p className="text-sm text-red-600">
                                                {errors.merk_hp}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tipe HP *</Label>
                                        <Input
                                            value={data.tipe_hp}
                                            onChange={(e) =>
                                                setData('tipe_hp', e.target.value)
                                            }
                                            placeholder="Galaxy A54, Redmi Note 12, dll"
                                        />
                                        {errors.tipe_hp && (
                                            <p className="text-sm text-red-600">
                                                {errors.tipe_hp}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>IMEI</Label>
                                    <Input
                                        value={data.imei}
                                        onChange={(e) => setData('imei', e.target.value)}
                                        placeholder="Nomor IMEI HP"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Keluhan *</Label>
                                    <Textarea
                                        value={data.keluhan}
                                        onChange={(e) =>
                                            setData('keluhan', e.target.value)
                                        }
                                        placeholder="Jelaskan keluhan/kerusakan HP"
                                        rows={3}
                                    />
                                    {errors.keluhan && (
                                        <p className="text-sm text-red-600">
                                            {errors.keluhan}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Diagnosa Kerusakan</Label>
                                    <Textarea
                                        value={data.kerusakan}
                                        onChange={(e) =>
                                            setData('kerusakan', e.target.value)
                                        }
                                        placeholder="Hasil pengecekan/diagnosa"
                                        rows={2}
                                    />
                                </div>

                                {/* Spare Part Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Spare Part yang Diganti</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddManualPart}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Input Manual
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Search Barang */}
                                    <div className="relative">
                                        <Input
                                            value={searchKeyword}
                                            onChange={(e) => handleSearchBarang(e.target.value)}
                                            placeholder="Cari spare part dari data barang..."
                                        />
                                        {showResults && searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {searchResults.map((barang) => (
                                                    <button
                                                        key={barang.id}
                                                        type="button"
                                                        onClick={() => handleAddSparePart(barang)}
                                                        className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-0"
                                                    >
                                                        <div className="font-medium">{barang.nama_barang}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {barang.kode_barang} - Rp {barang.harga_konsumen.toLocaleString('id-ID')}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Spare Parts List */}
                                    {spareParts.length > 0 && (
                                        <div className="space-y-2 border rounded-lg p-3">
                                            {spareParts.map((part) => (
                                                <div key={part.id} className="flex gap-2 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            value={part.nama}
                                                            onChange={(e) =>
                                                                handleUpdatePart(part.id, 'nama', e.target.value)
                                                            }
                                                            placeholder="Nama spare part"
                                                            disabled={part.dari_barang}
                                                            className={part.dari_barang ? 'bg-gray-50' : ''}
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={part.biaya}
                                                            onChange={(e) =>
                                                                handleUpdatePart(part.id, 'biaya', parseInt(e.target.value) || 0)
                                                            }
                                                            placeholder="Biaya"
                                                            min={0}
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemovePart(part.id)}
                                                        className="mt-1"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <div className="pt-2 border-t">
                                                <div className="flex justify-between font-medium">
                                                    <span>Total Biaya Spare Part:</span>
                                                    <span className="text-blue-600">
                                                        Rp {data.biaya_spare_part.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                        {errors.nama_pelanggan && (
                                            <p className="text-sm text-red-600">
                                                {errors.nama_pelanggan}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>No. Telepon *</Label>
                                        <Input
                                            value={data.telepon_pelanggan}
                                            onChange={(e) =>
                                                setData('telepon_pelanggan', e.target.value)
                                            }
                                        />
                                        {errors.telepon_pelanggan && (
                                            <p className="text-sm text-red-600">
                                                {errors.telepon_pelanggan}
                                            </p>
                                        )}
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
                                            disabled
                                            className="bg-gray-50"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Otomatis dari spare part yang ditambahkan
                                        </p>
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
                                Simpan Service
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
