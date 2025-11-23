import { Heading } from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    CheckCircle,
    DollarSign,
    Minus,
    Plus,
    Printer,
    Scan,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    barcode?: string;
    harga_asal: number;
    harga_konsumen: number;
    harga_konter: number;
    satuan: string;
    stok: number;
}

interface CartItem {
    barang_id: number;
    kode_barang: string;
    nama_barang: string;
    jumlah: number;
    harga_jual: number;
    jenis_harga: 'konsumen' | 'konter';
    diskon_item: number;
    subtotal: number;
    stok: number;
}

interface TransaksiData {
    nomor_transaksi: string;
    tanggal_transaksi: string;
    kasir: string;
    nama_pelanggan?: string;
    telepon_pelanggan?: string;
    items: CartItem[];
    subtotal: number;
    diskon: number;
    biaya_service: number;
    total_bayar: number;
    jumlah_bayar: number;
    kembalian: number;
    metode_pembayaran: string;
}

interface Props {
    cabang_id: number;
    cabang_nama: string;
    cabang_alamat: string;
    cabang_telepon: string;
}

export default function PosIndex({ cabang_id, cabang_nama, cabang_alamat, cabang_telepon }: Props) {
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState<Barang[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [transaksiData, setTransaksiData] = useState<TransaksiData | null>(null);

    // Debug props
    console.log('Cabang Props:', { cabang_id, cabang_nama, cabang_alamat, cabang_telepon });

    // Form fields
    const [namaPelanggan, setNamaPelanggan] = useState('');
    const [teleponPelanggan, setTeleponPelanggan] = useState('');
    const [metodePembayaran, setMetodePembayaran] = useState<string>('tunai');
    const [diskon, setDiskon] = useState(0);
    const [biayaService, setBiayaService] = useState(0);
    const [jumlahBayar, setJumlahBayar] = useState(0);
    const [keterangan, setKeterangan] = useState('');

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    const handleSearch = async (value: string) => {
        setKeyword(value);
        if (value.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        try {
            const response = await axios.post('/pos/search-barang', {
                keyword: value,
            });
            setSearchResults(response.data.data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleSelectBarang = (
        barang: Barang,
        jenisHarga: 'konsumen' | 'konter'
    ) => {
        if (barang.stok <= 0) {
            toast.error('Stok barang tidak tersedia');
            return;
        }

        const hargaJual =
            jenisHarga === 'konsumen'
                ? barang.harga_konsumen
                : barang.harga_konter;

        // Check if item already in cart
        const existingIndex = cart.findIndex(
            (item) => item.barang_id === barang.id && item.jenis_harga === jenisHarga
        );

        if (existingIndex >= 0) {
            // Update quantity
            const newCart = [...cart];
            const newJumlah = newCart[existingIndex].jumlah + 1;

            if (newJumlah > barang.stok) {
                toast.error('Jumlah melebihi stok tersedia');
                return;
            }

            newCart[existingIndex].jumlah = newJumlah;
            newCart[existingIndex].subtotal = newJumlah * hargaJual;
            setCart(newCart);
        } else {
            // Add new item
            const newItem: CartItem = {
                barang_id: barang.id,
                kode_barang: barang.kode_barang,
                nama_barang: barang.nama_barang,
                jumlah: 1,
                harga_jual: hargaJual,
                jenis_harga: jenisHarga,
                diskon_item: 0,
                subtotal: hargaJual,
                stok: barang.stok,
            };
            setCart([...cart, newItem]);
        }

        // Clear search
        setKeyword('');
        setSearchResults([]);
        setShowResults(false);
        searchInputRef.current?.focus();
    };

    const handleUpdateQuantity = (index: number, delta: number) => {
        const newCart = [...cart];
        const newJumlah = newCart[index].jumlah + delta;

        if (newJumlah <= 0) {
            handleRemoveItem(index);
            return;
        }

        if (newJumlah > newCart[index].stok) {
            toast.error('Jumlah melebihi stok tersedia');
            return;
        }

        newCart[index].jumlah = newJumlah;
        newCart[index].subtotal = newJumlah * newCart[index].harga_jual;
        setCart(newCart);
    };

    const handleRemoveItem = (index: number) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - diskon + biayaService;
    };

    const calculateKembalian = () => {
        return jumlahBayar - calculateTotal();
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Keranjang masih kosong');
            return;
        }

        const total = calculateTotal();
        if (jumlahBayar < total) {
            toast.error('Jumlah bayar kurang dari total');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.post('/pos/store', {
                jenis_transaksi: 'retail',
                nama_pelanggan: namaPelanggan,
                telepon_pelanggan: teleponPelanggan,
                metode_pembayaran: metodePembayaran,
                diskon: diskon,
                biaya_service: biayaService,
                jumlah_bayar: jumlahBayar,
                keterangan: keterangan,
                detail: cart,
            });

            if (response.data.success) {
                const transaksi = response.data.data;
                
                // Prepare transaction data for modal
                setTransaksiData({
                    nomor_transaksi: transaksi.nomor_transaksi,
                    tanggal_transaksi: transaksi.tanggal_transaksi,
                    kasir: transaksi.kasir,
                    nama_pelanggan: namaPelanggan,
                    telepon_pelanggan: teleponPelanggan,
                    items: cart,
                    subtotal: calculateSubtotal(),
                    diskon: diskon,
                    biaya_service: biayaService,
                    total_bayar: calculateTotal(),
                    jumlah_bayar: jumlahBayar,
                    kembalian: transaksi.kembalian,
                    metode_pembayaran: metodePembayaran,
                });
                
                // Show success modal
                setShowSuccessModal(true);

                // Reset form
                setCart([]);
                setNamaPelanggan('');
                setTeleponPelanggan('');
                setMetodePembayaran('tunai');
                setDiskon(0);
                setBiayaService(0);
                setJumlahBayar(0);
                setKeterangan('');
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Gagal menyimpan transaksi'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrint = () => {
        if (!transaksiData) return;

        const printWindow = window.open('', '', 'width=300,height=600');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Struk - ${transaksiData.nomor_transaksi}</title>
                <style>
                    @media print {
                        @page { margin: 0; size: 58mm auto; }
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Courier New', monospace; 
                        font-size: 11px; 
                        width: 58mm;
                        padding: 5mm;
                        line-height: 1.4;
                    }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .line { border-top: 1px dashed #000; margin: 5px 0; }
                    .row { display: flex; justify-content: space-between; margin: 2px 0; }
                    .item { margin: 3px 0; }
                    .item-name { font-size: 10px; }
                    .item-detail { display: flex; justify-content: space-between; font-size: 9px; }
                    .total { font-size: 12px; margin-top: 5px; }
                    .footer { margin-top: 10px; font-size: 9px; }
                    .logo { width: 80px; height: auto; margin: 5px auto 8px; display: block; }
                </style>
            </head>
            <body>
                <div class="center">
                    <img src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/jms/logo-jms.png" alt="Logo" class="logo" />
                </div>
                <div class="center bold" style="font-size: 13px;">Cabang ${cabang_nama}</div>
                <div class="center" style="font-size: 9px;">${cabang_alamat || '-'}</div>
                <div class="center" style="font-size: 9px; margin-bottom: 5px;">Telp: ${cabang_telepon || '-'}</div>
                <div class="line"></div>
                <div class="center" style="font-size: 9px; margin-bottom: 5px;">STRUK PENJUALAN</div>
                <div class="line"></div>
                
                <div class="row">
                    <span>No. Transaksi</span>
                    <span class="bold">${transaksiData.nomor_transaksi}</span>
                </div>
                <div class="row">
                    <span>Tanggal</span>
                    <span>${new Date(transaksiData.tanggal_transaksi).toLocaleString('id-ID', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
                <div class="row">
                    <span>Kasir</span>
                    <span>${transaksiData.kasir}</span>
                </div>
                ${transaksiData.nama_pelanggan ? `
                <div class="row">
                    <span>Pelanggan</span>
                    <span>${transaksiData.nama_pelanggan}</span>
                </div>
                ` : ''}
                
                <div class="line"></div>
                
                ${transaksiData.items.map(item => `
                    <div class="item">
                        <div class="item-name bold">${item.nama_barang}</div>
                        <div class="item-detail">
                            <span>${item.jumlah} x ${formatRupiah(item.harga_jual)} (${item.jenis_harga})</span>
                            <span class="bold">${formatRupiah(item.subtotal)}</span>
                        </div>
                    </div>
                `).join('')}
                
                <div class="line"></div>
                
                <div class="row">
                    <span>Subtotal</span>
                    <span>${formatRupiah(transaksiData.subtotal)}</span>
                </div>
                ${transaksiData.diskon > 0 ? `
                <div class="row">
                    <span>Diskon</span>
                    <span>-${formatRupiah(transaksiData.diskon)}</span>
                </div>
                ` : ''}
                ${transaksiData.biaya_service > 0 ? `
                <div class="row">
                    <span>Biaya Service</span>
                    <span>${formatRupiah(transaksiData.biaya_service)}</span>
                </div>
                ` : ''}
                
                <div class="line"></div>
                
                <div class="row bold total">
                    <span>TOTAL</span>
                    <span>${formatRupiah(transaksiData.total_bayar)}</span>
                </div>
                <div class="row">
                    <span>Bayar (${transaksiData.metode_pembayaran.toUpperCase()})</span>
                    <span>${formatRupiah(transaksiData.jumlah_bayar)}</span>
                </div>
                <div class="row bold">
                    <span>Kembalian</span>
                    <span>${formatRupiah(transaksiData.kembalian)}</span>
                </div>
                
                <div class="line"></div>
                
                <div class="center footer">
                    Terima kasih atas kunjungan Anda<br>
                    Barang yang sudah dibeli tidak dapat dikembalikan
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        setTransaksiData(null);
        searchInputRef.current?.focus();
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
            <Head title="Point of Sale" />

            <div className="p-6 space-y-6">
                <Heading title="Point of Sale (POS)" icon={ShoppingCart} />

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Section - Search & Cart */}
                    <div className="col-span-8 space-y-4">
                        {/* Search Bar */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Scan className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Scan barcode atau ketik kode/nama barang..."
                                        value={keyword}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10 text-lg h-12"
                                    />
                                </div>

                                {/* Search Results */}
                                {showResults && searchResults.length > 0 && (
                                    <div className="mt-4 border rounded-lg divide-y max-h-64 overflow-y-auto">
                                        {searchResults.map((barang) => (
                                            <div
                                                key={barang.id}
                                                className="p-3 hover:bg-gray-50"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-medium">
                                                            {barang.nama_barang}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {barang.kode_barang} | Stok:{' '}
                                                            {barang.stok}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleSelectBarang(
                                                                barang,
                                                                'konsumen'
                                                            )
                                                        }
                                                        disabled={barang.stok <= 0}
                                                        className="flex-1"
                                                    >
                                                        Konsumen -{' '}
                                                        {formatRupiah(barang.harga_konsumen)}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleSelectBarang(
                                                                barang,
                                                                'konter'
                                                            )
                                                        }
                                                        disabled={barang.stok <= 0}
                                                        className="flex-1"
                                                    >
                                                        Konter -{' '}
                                                        {formatRupiah(barang.harga_konter)}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cart Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Keranjang Belanja</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cart.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Keranjang masih kosong
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 border rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {item.nama_barang}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.kode_barang} |{' '}
                                                        <span className="capitalize">
                                                            {item.jenis_harga}
                                                        </span>{' '}
                                                        - {formatRupiah(item.harga_jual)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleUpdateQuantity(index, -1)
                                                        }
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-12 text-center font-medium">
                                                        {item.jumlah}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleUpdateQuantity(index, 1)
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="w-32 text-right font-medium">
                                                    {formatRupiah(item.subtotal)}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Section - Payment */}
                    <div className="col-span-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Pelanggan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <Label>Nama Pelanggan</Label>
                                    <Input
                                        value={namaPelanggan}
                                        onChange={(e) => setNamaPelanggan(e.target.value)}
                                        placeholder="Opsional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>No. Telepon</Label>
                                    <Input
                                        value={teleponPelanggan}
                                        onChange={(e) =>
                                            setTeleponPelanggan(e.target.value)
                                        }
                                        placeholder="Opsional"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">
                                            {formatRupiah(calculateSubtotal())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm">Diskon:</Label>
                                        <Input
                                            type="number"
                                            value={diskon}
                                            onChange={(e) =>
                                                setDiskon(parseInt(e.target.value) || 0)
                                            }
                                            className="w-32 text-right"
                                            min={0}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm">Biaya Service:</Label>
                                        <Input
                                            type="number"
                                            value={biayaService}
                                            onChange={(e) =>
                                                setBiayaService(
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                            className="w-32 text-right"
                                            min={0}
                                        />
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span className="text-blue-600">
                                                {formatRupiah(calculateTotal())}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Metode Pembayaran</Label>
                                    <Select
                                        value={metodePembayaran}
                                        onValueChange={setMetodePembayaran}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tunai">Tunai</SelectItem>
                                            <SelectItem value="transfer">
                                                Transfer
                                            </SelectItem>
                                            <SelectItem value="qris">QRIS</SelectItem>
                                            <SelectItem value="edc">EDC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Jumlah Bayar</Label>
                                    <Input
                                        type="number"
                                        value={jumlahBayar}
                                        onChange={(e) =>
                                            setJumlahBayar(parseInt(e.target.value) || 0)
                                        }
                                        className="text-lg font-medium"
                                        min={0}
                                    />
                                </div>

                                {/* Kembalian Display - Always Visible */}
                                {calculateTotal() > 0 && jumlahBayar > 0 && (
                                    <div
                                        className={`p-4 border-2 rounded-lg ${
                                            calculateKembalian() >= 0
                                                ? 'bg-green-50 border-green-300'
                                                : 'bg-red-50 border-red-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span
                                                className={`text-sm font-medium ${
                                                    calculateKembalian() >= 0
                                                        ? 'text-green-700'
                                                        : 'text-red-700'
                                                }`}
                                            >
                                                {calculateKembalian() >= 0
                                                    ? 'Kembalian:'
                                                    : 'Kurang:'}
                                            </span>
                                            <span
                                                className={`text-2xl font-bold ${
                                                    calculateKembalian() >= 0
                                                        ? 'text-green-700'
                                                        : 'text-red-700'
                                                }`}
                                            >
                                                {formatRupiah(
                                                    Math.abs(calculateKembalian())
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Keterangan</Label>
                                    <Textarea
                                        value={keterangan}
                                        onChange={(e) => setKeterangan(e.target.value)}
                                        placeholder="Catatan tambahan"
                                        rows={2}
                                    />
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    disabled={
                                        cart.length === 0 ||
                                        jumlahBayar < calculateTotal() ||
                                        isProcessing
                                    }
                                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                                >
                                    <DollarSign className="mr-2 h-5 w-5" />
                                    {isProcessing ? 'Memproses...' : 'Bayar'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Success Modal */}
                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-6 w-6" />
                                Transaksi Berhasil!
                            </DialogTitle>
                        </DialogHeader>
                        
                        {transaksiData && (
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-center space-y-2">
                                        <div className="text-sm text-gray-600">No. Transaksi</div>
                                        <div className="text-xl font-bold text-gray-900">
                                            {transaksiData.nomor_transaksi}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Belanja</span>
                                        <span className="font-medium">
                                            {formatRupiah(transaksiData.total_bayar)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Jumlah Bayar</span>
                                        <span className="font-medium">
                                            {formatRupiah(transaksiData.jumlah_bayar)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between">
                                        <span className="text-gray-600 font-medium">Kembalian</span>
                                        <span className="font-bold text-green-600 text-lg">
                                            {formatRupiah(transaksiData.kembalian)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handlePrint}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Printer className="mr-2 h-4 w-4" />
                                        Cetak Struk
                                    </Button>
                                    <Button
                                        onClick={handleCloseModal}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Tutup
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
