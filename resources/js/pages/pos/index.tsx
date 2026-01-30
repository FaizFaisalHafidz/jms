import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BarcodeCameraScanner } from '@/components/barcode-camera-scanner';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    barcode?: string;
    harga_asal: number;
    harga_konsumen: number;
    harga_konter: number;
    harga_partai: number;
    satuan: string;
    stok: number;
}

interface CartItem {
    barang_id: number;
    kode_barang: string;
    nama_barang: string;
    jumlah: number;
    harga_jual: number;
    jenis_harga: 'konsumen' | 'konter' | 'partai';
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

interface RecentTransaction {
    id: number;
    nomor_transaksi: string;
    tanggal_transaksi: string;
    kasir: {
        id: number;
        name: string;
    };
    nama_pelanggan?: string;
    telepon_pelanggan?: string;
    subtotal: number;
    diskon: number;
    biaya_service: number;
    total_bayar: number;
    jumlah_bayar: number;
    kembalian: number;
    metode_pembayaran: string;
    detail_transaksi: any[];
}

interface Props {
    cabang_id: number;
    cabang_nama: string;
    cabang_alamat: string;
    cabang_telepon: string;
    recentTransactions: RecentTransaction[];
}

export default function PosIndex({ cabang_id, cabang_nama, cabang_alamat, cabang_telepon, recentTransactions }: Props) {
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
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSearchRef = useRef<string>('');

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    const performSearch = async (value: string) => {
        // Prevent duplicate searches
        if (lastSearchRef.current === value) return;
        lastSearchRef.current = value;

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

    const handleSearch = useCallback(async (value: string, immediate: boolean = false) => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        setKeyword(value);

        if (value.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            lastSearchRef.current = '';
            return;
        }

        // If immediate (from barcode scanner), search right away
        if (immediate) {
            performSearch(value);
            return;
        }

        // Otherwise debounce for manual typing
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    }, []);

    const handleSelectBarang = (
        barang: Barang,
        jenisHarga: 'konsumen' | 'konter' | 'partai'
    ) => {
        if (barang.stok <= 0) {
            toast.error('Stok barang tidak tersedia');
            return;
        }

        const hargaJual =
            jenisHarga === 'konsumen'
                ? barang.harga_konsumen
                : jenisHarga === 'konter'
                    ? barang.harga_konter
                    : barang.harga_partai;

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

    const handlePrint = (data?: TransaksiData) => {
        const dataToPrint = data || transaksiData;
        if (!dataToPrint) return;

        const printWindow = window.open('', '', 'width=300,height=600');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Struk - ${dataToPrint.nomor_transaksi}</title>
                <style>
                    @media print {
                        @page { margin: 0; size: 57.5mm auto; }
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Courier New', monospace; 
                        font-size: 10px; 
                        width: 50mm;
                        padding: 1mm 1.5mm;
                        line-height: 1.25;
                        overflow: hidden;
                        font-weight: bold;
                        color: #000;
                    }
                    .center { text-align: center; }
                    .line { 
                        border-top: 1px dashed #000; 
                        margin: 2px auto;
                        max-width: 85%;
                    }
                    .row { 
                        display: flex; 
                        justify-content: space-between; 
                        margin: 1.5px auto; 
                        font-size: 10px; 
                        gap: 5px;
                        max-width: 85%;
                    }
                    .row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                    .row span:first-child { max-width: 60%; }
                    .row span:last-child { text-align: right; flex-shrink: 0; }
                    .center-row { text-align: center; margin: 2px 0; font-size: 9px; word-wrap: break-word; }
                    .item { 
                        margin: 2px auto;
                        max-width: 85%;
                    }
                    .item-name { 
                        font-size: 10px; 
                        word-wrap: break-word; 
                        overflow-wrap: break-word; 
                        line-height: 1.3;
                    }
                    .item-detail { 
                        display: flex; 
                        justify-content: space-between; 
                        font-size: 9px; 
                        gap: 5px; 
                        margin-top: 1px;
                    }
                    .item-detail span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; }
                    .item-detail span:last-child { flex-shrink: 0; }
                    .total { font-size: 11px; margin-top: 2px; }
                    .footer { margin-top: 4px; font-size: 8px; line-height: 1.3; font-weight: normal; }
                    .logo { width: 42px; height: auto; margin: 2px auto 2px; display: block; }
                    .header-title { font-size: 11px; margin-bottom: 2px; letter-spacing: 0.2px; }
                    .header-info { font-size: 8px; font-weight: normal; }
                </style>
            </head>
            <body>
                <div class="center">
                    <img src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/jms/logo-jms.png" alt="Logo" class="logo" />
                </div>
                <div class="center header-title">JAYA MAKMUR SPAREPART</div>
                <div class="center header-info">Cbg ${cabang_nama}</div>
                <div class="center header-info">${cabang_alamat || '-'}</div>
                <div class="center header-info" style="margin-bottom: 2px;">Telp: ${cabang_telepon || '-'}</div>
                <div class="line"></div>
                <div class="center" style="font-size: 9px; margin-bottom: 2px;">STRUK PENJUALAN</div>
                <div class="line"></div>
                
                <div class="center-row">No. ${dataToPrint.nomor_transaksi}</div>
                <div class="center-row">${new Date(dataToPrint.tanggal_transaksi).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</div>
                <div class="row">
                    <span>Kasir</span>
                    <span>${dataToPrint.kasir}</span>
                </div>
                ${dataToPrint.nama_pelanggan ? `
                <div class="row">
                    <span>Cust</span>
                    <span>${dataToPrint.nama_pelanggan}</span>
                </div>
                ` : ''}
                
                <div class="line"></div>
                
                ${dataToPrint.items.map(item => `
                    <div class="item">
                        <div class="item-name">${item.nama_barang}</div>
                        <div class="item-detail">
                            <span>${item.jumlah}x@${formatRupiah(item.harga_jual).replace('Rp ', '').replace('.', '')}</span>
                            <span>${formatRupiah(item.subtotal).replace('Rp ', '').replace('.', '')}</span>
                        </div>
                    </div>
                `).join('')}
                
                <div class="line"></div>
                
                <div class="row">
                    <span>Subtotal</span>
                    <span>${formatRupiah(dataToPrint.subtotal)}</span>
                </div>
                ${dataToPrint.diskon > 0 ? `
                <div class="row">
                    <span>Diskon</span>
                    <span>-${formatRupiah(dataToPrint.diskon)}</span>
                </div>
                ` : ''}
                ${dataToPrint.biaya_service > 0 ? `
                <div class="row">
                    <span>Biaya Servis</span>
                    <span>${formatRupiah(dataToPrint.biaya_service)}</span>
                </div>
                ` : ''}
                
                <div class="line"></div>
                
                <div class="row total">
                    <span>TOTAL</span>
                    <span>${formatRupiah(dataToPrint.total_bayar)}</span>
                </div>
                <div class="row">
                    <span>Bayar</span>
                    <span>${formatRupiah(dataToPrint.jumlah_bayar)}</span>
                </div>
                <div class="row">
                    <span>Kembali</span>
                    <span>${formatRupiah(dataToPrint.kembalian)}</span>
                </div>
                
                <div class="line"></div>
                
                <div class="center footer">
                    Terima kasih atas kunjungan Anda<br>
                    Barang yang sudah dibeli<br>tidak dapat dikembalikan
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

    const handlePrintRecent = (transaction: RecentTransaction) => {
        const data: TransaksiData = {
            nomor_transaksi: transaction.nomor_transaksi,
            tanggal_transaksi: transaction.tanggal_transaksi,
            kasir: transaction.kasir.name,
            nama_pelanggan: transaction.nama_pelanggan,
            telepon_pelanggan: transaction.telepon_pelanggan,
            items: transaction.detail_transaksi.map((dt: any) => ({
                barang_id: dt.barang_id,
                kode_barang: '-',
                nama_barang: dt.nama_barang,
                jumlah: dt.jumlah,
                harga_jual: dt.harga_jual,
                jenis_harga: dt.jenis_harga,
                diskon_item: dt.diskon_item || 0,
                subtotal: dt.subtotal,
                stok: 0
            })),
            subtotal: transaction.subtotal,
            diskon: transaction.diskon,
            biaya_service: transaction.biaya_service,
            total_bayar: transaction.total_bayar,
            jumlah_bayar: transaction.jumlah_bayar,
            kembalian: transaction.kembalian,
            metode_pembayaran: transaction.metode_pembayaran
        };
        handlePrint(data);
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


    const [transactionSearchKeyword, setTransactionSearchKeyword] = useState('');
    const [transactionSearchDate, setTransactionSearchDate] = useState(new Date().toISOString().split('T')[0]);
    const [displayedTransactions, setDisplayedTransactions] = useState<RecentTransaction[]>(recentTransactions);
    const transactionSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial load sync
    useEffect(() => {
        setDisplayedTransactions(recentTransactions);
    }, [recentTransactions]);

    const performTransactionSearch = async (keyword: string, date: string) => {
        try {
            const response = await axios.post('/pos/search-transaksi', {
                keyword,
                date,
            });
            if (response.data.success) {
                setDisplayedTransactions(response.data.data);
            }
        } catch (error) {
            console.error('Transaction search error:', error);
            toast.error('Gagal mencari transaksi');
        }
    };

    const handleTransactionSearch = useCallback((value: string) => {
        setTransactionSearchKeyword(value);

        if (transactionSearchTimeoutRef.current) {
            clearTimeout(transactionSearchTimeoutRef.current);
        }

        transactionSearchTimeoutRef.current = setTimeout(() => {
            performTransactionSearch(value, transactionSearchDate);
        }, 300);
    }, [transactionSearchDate]);

    const handleTransactionDateChange = useCallback((value: string) => {
        setTransactionSearchDate(value);
        performTransactionSearch(transactionSearchKeyword, value);
    }, [transactionSearchKeyword]);

    return (
        <AppLayout>
            <Head title="Point of Sale" />

            <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50 min-h-screen">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                        <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Point of Sale</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sistem kasir cepat dan praktis</p>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Section - Search & Cart */}
                    <div className="col-span-8 space-y-4">
                        {/* Search Bar */}
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Scan className="absolute left-4 top-4 h-5 w-5 text-blue-500" />
                                        <Input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Scan barcode atau ketik kode/nama barang..."
                                            value={keyword}
                                            onChange={(e) => handleSearch(e.target.value, false)}
                                            className="pl-12 text-lg h-14 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl"
                                        />
                                    </div>
                                    <BarcodeCameraScanner
                                        onScanSuccess={(barcode) => handleSearch(barcode, true)}
                                    />
                                </div>

                                {/* Search Results */}
                                {showResults && searchResults.length > 0 && (
                                    <div className="mt-4 border-0 rounded-xl shadow-lg divide-y divide-slate-100 max-h-96 overflow-y-auto bg-white">
                                        {searchResults.map((barang) => (
                                            <div
                                                key={barang.id}
                                                className="p-4 hover:bg-blue-50/50 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="font-semibold text-slate-900">
                                                            {barang.nama_barang}
                                                        </div>
                                                        <div className="text-sm text-slate-500 mt-1">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{barang.kode_barang}</span>
                                                                <span className={cn(
                                                                    "font-medium px-2 py-0.5 rounded text-xs",
                                                                    barang.stok > 10 ? "bg-emerald-100 text-emerald-700" :
                                                                        barang.stok > 0 ? "bg-amber-100 text-amber-700" :
                                                                            "bg-red-100 text-red-700"
                                                                )}>
                                                                    Stok: {barang.stok}
                                                                </span>
                                                            </span>
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
                                                        className="flex-1 border-blue-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
                                                    >
                                                        <span className="text-xs">Konsumen</span>
                                                        <span className="font-semibold ml-1">{formatRupiah(barang.harga_konsumen)}</span>
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
                                                        className="flex-1 border-violet-200 hover:bg-violet-50 hover:border-violet-400 hover:text-violet-700"
                                                    >
                                                        <span className="text-xs">Konter</span>
                                                        <span className="font-semibold ml-1">{formatRupiah(barang.harga_konter)}</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleSelectBarang(
                                                                barang,
                                                                'partai'
                                                            )
                                                        }
                                                        disabled={barang.stok <= 0}
                                                        className="flex-1 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700"
                                                    >
                                                        <span className="text-xs">Partai</span>
                                                        <span className="font-semibold ml-1">{formatRupiah(barang.harga_partai)}</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cart Items */}
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                                    <span>Keranjang Belanja</span>
                                    {cart.length > 0 && (
                                        <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                            {cart.length} item
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400">
                                        <ShoppingCart className="h-16 w-16 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">Keranjang masih kosong</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {cart.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-white"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-slate-900 truncate">
                                                        {item.nama_barang}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.kode_barang}</span>
                                                        <span className={cn(
                                                            "capitalize px-2 py-0.5 rounded font-medium",
                                                            item.jenis_harga === 'konsumen' ? "bg-blue-100 text-blue-700" :
                                                                item.jenis_harga === 'konter' ? "bg-violet-100 text-violet-700" :
                                                                    "bg-emerald-100 text-emerald-700"
                                                        )}>
                                                            {item.jenis_harga}
                                                        </span>
                                                        <span className="text-slate-600">@ {formatRupiah(item.harga_jual)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleUpdateQuantity(index, -1)
                                                        }
                                                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <span className="w-10 text-center font-bold text-slate-900">
                                                        {item.jumlah}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleUpdateQuantity(index, 1)
                                                        }
                                                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="w-28 text-right font-bold text-slate-900">
                                                    {formatRupiah(item.subtotal)}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Transactions */}
                        <Card className="border-0 shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span>Riwayat Transaksi</span>
                                </CardTitle>
                                <div className="flex gap-2">
                                    <div className="w-40">
                                        <Input
                                            type="date"
                                            value={transactionSearchDate}
                                            onChange={(e) => handleTransactionDateChange(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="w-64">
                                        <Input
                                            placeholder="Cari No. Transaksi..."
                                            value={transactionSearchKeyword}
                                            onChange={(e) => handleTransactionSearch(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Waktu</TableHead>
                                            <TableHead>No. Transaksi</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-slate-500 py-4">
                                                    Tidak ada transaksi ditemukan
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            displayedTransactions.map((trx) => (
                                                <TableRow key={trx.id}>
                                                    <TableCell className="text-xs">
                                                        {new Date(trx.tanggal_transaksi).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {trx.nomor_transaksi}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-xs">
                                                        {formatRupiah(trx.total_bayar)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handlePrintRecent(trx)}
                                                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                            title="Cetak Struk"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Section - Payment */}
                    <div className="col-span-4 space-y-4">
                        <Card className="border-0 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-base">Informasi Pelanggan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Nama Pelanggan</Label>
                                    <Input
                                        value={namaPelanggan}
                                        onChange={(e) => setNamaPelanggan(e.target.value)}
                                        placeholder="Opsional"
                                        className="border-slate-200 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">No. Telepon</Label>
                                    <Input
                                        value={teleponPelanggan}
                                        onChange={(e) =>
                                            setTeleponPelanggan(e.target.value)
                                        }
                                        placeholder="Opsional"
                                        className="border-slate-200 focus:border-blue-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-base">Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm py-2">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-semibold text-slate-900">
                                            {formatRupiah(calculateSubtotal())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-t border-slate-100">
                                        <Label className="text-sm text-slate-600">Diskon:</Label>
                                        <Input
                                            type="number"
                                            value={diskon}
                                            onChange={(e) =>
                                                setDiskon(parseInt(e.target.value) || 0)
                                            }
                                            className="w-32 text-right border-slate-200"
                                            min={0}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <Label className="text-sm text-slate-600">Biaya Service:</Label>
                                        <Input
                                            type="number"
                                            value={biayaService}
                                            onChange={(e) =>
                                                setBiayaService(
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                            className="w-32 text-right border-slate-200"
                                            min={0}
                                        />
                                    </div>
                                    <div className="border-t-2 border-slate-200 pt-3 mt-2">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-base font-semibold text-slate-700">Total Bayar:</span>
                                            <span className="text-2xl font-bold text-blue-600">
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
                                        className={`p-4 border-2 rounded-lg ${calculateKembalian() >= 0
                                            ? 'bg-green-50 border-green-300'
                                            : 'bg-red-50 border-red-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span
                                                className={`text-sm font-medium ${calculateKembalian() >= 0
                                                    ? 'text-green-700'
                                                    : 'text-red-700'
                                                    }`}
                                            >
                                                {calculateKembalian() >= 0
                                                    ? 'Kembalian:'
                                                    : 'Kurang:'}
                                            </span>
                                            <span
                                                className={`text-2xl font-bold ${calculateKembalian() >= 0
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
                                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <DollarSign className="mr-2 h-6 w-6" />
                                    {isProcessing ? 'Memproses...' : 'Proses Pembayaran'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Success Modal */}
                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent className="max-w-md border-0 shadow-2xl">
                        <DialogHeader className="text-center pb-2">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg animate-bounce">
                                <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                            </div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 text-center">
                                Transaksi Berhasil! 🎉
                            </DialogTitle>
                            <p className="text-sm text-slate-500 mt-1">Pembayaran telah berhasil diproses</p>
                        </DialogHeader>

                        {transaksiData && (
                            <div className="space-y-4 pt-2">
                                {/* Transaction Number */}
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 shadow-sm">
                                    <div className="text-center space-y-1.5">
                                        <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">Nomor Transaksi</div>
                                        <div className="text-xl font-bold text-slate-900 font-mono">
                                            {transaksiData.nomor_transaksi}
                                        </div>
                                    </div>
                                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl" />
                                </div>

                                {/* Payment Details */}
                                <div className="space-y-2.5 bg-slate-50 rounded-xl p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Total Belanja</span>
                                        <span className="font-semibold text-slate-900">
                                            {formatRupiah(transaksiData.total_bayar)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Jumlah Bayar</span>
                                        <span className="font-semibold text-slate-900">
                                            {formatRupiah(transaksiData.jumlah_bayar)}
                                        </span>
                                    </div>
                                    <div className="border-t-2 border-emerald-100 pt-2.5 flex justify-between items-center">
                                        <span className="text-sm font-semibold text-slate-700">Kembalian</span>
                                        <span className="font-bold text-emerald-600 text-xl">
                                            {formatRupiah(transaksiData.kembalian)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        onClick={() => handlePrint()}
                                        className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                                    >
                                        <Printer className="mr-2 h-4 w-4" />
                                        Cetak Struk
                                    </Button>
                                    <Button
                                        onClick={handleCloseModal}
                                        variant="outline"
                                        className="flex-1 h-11 border-2 hover:bg-slate-50"
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
