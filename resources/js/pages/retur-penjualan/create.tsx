import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeft, Search, Trash2, Plus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

interface Transaksi {
    id: number;
    nomor_transaksi: string;
    tanggal_transaksi: string;
    total_bayar: number;
}

interface TransaksiItem {
    detail_transaksi_id: number;
    barang_id: number;
    kode_barang: string;
    nama_barang: string;
    jumlah_beli: number;
    harga_jual: number;
    subtotal: number;
}

interface ReturItem extends TransaksiItem {
    jumlah_retur: number;
    kondisi_barang: "baik" | "rusak";
    keterangan: string;
}

interface ReplacementItem {
    id: number;
    kode_barang: string;
    nama_barang: string;
    qty: number;
    harga_jual: number;
    stok: number;
}

interface Props {
    transaksis: Transaksi[];
}

export default function ReturPenjualanCreate({ transaksis }: Props) {
    const [tanggalRetur, setTanggalRetur] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [transaksiId, setTransaksiId] = useState("");
    const [alasanRetur, setAlasanRetur] = useState("");
    const [jenisRetur, setJenisRetur] = useState<"uang_kembali" | "ganti_barang">("uang_kembali");
    const [availableItems, setAvailableItems] = useState<TransaksiItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<ReturItem[]>([]);
    const [replacementItems, setReplacementItems] = useState<ReplacementItem[]>([]);

    // Search state for replacement items
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState<ReplacementItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (transaksiId) {
            loadTransaksiDetail(parseInt(transaksiId));
        } else {
            setAvailableItems([]);
            setSelectedItems([]);
        }
    }, [transaksiId]);

    const loadTransaksiDetail = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/retur-penjualan/${id}/transaksi-detail`);
            setAvailableItems(response.data.items);
        } catch (error) {
            toast.error("Gagal memuat detail transaksi");
        } finally {
            setIsLoading(false);
        }
    };

    // Search effect
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            handleSearch(debouncedQuery);
        } else {
            setSearchResults([]);
        }
    }, [debouncedQuery]);

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const response = await axios.post("/retur-penjualan/search-barang", {
                keyword: query,
            });
            setSearchResults(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddReplacement = (item: ReplacementItem) => {
        // Cek stok
        if (item.stok <= 0) {
            toast.error("Stok barang habis");
            return;
        }

        const existingItem = replacementItems.find((i) => i.id === item.id);
        if (existingItem) {
            if (existingItem.qty + 1 > item.stok) {
                toast.error("Stok tidak mencukupi");
                return;
            }
            setReplacementItems(
                replacementItems.map((i) =>
                    i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                )
            );
        } else {
            setReplacementItems([...replacementItems, { ...item, qty: 1 }]);
        }
        setSearchQuery(""); // clear search
        setSearchResults([]);
    };

    const handleUpdateReplacementQty = (index: number, qty: number, maxStok: number) => {
        if (qty > maxStok) {
            toast.error("Stok tidak mencukupi");
            return;
        }
        const newItems = [...replacementItems];
        newItems[index].qty = qty;
        setReplacementItems(newItems);
    };

    const handleRemoveReplacement = (index: number) => {
        setReplacementItems(replacementItems.filter((_, i) => i !== index));
    };

    const handleAddItem = (item: TransaksiItem) => {
        if (selectedItems.some((i) => i.detail_transaksi_id === item.detail_transaksi_id)) {
            toast.error("Barang sudah ditambahkan");
            return;
        }

        setSelectedItems([
            ...selectedItems,
            {
                ...item,
                jumlah_retur: 1,
                kondisi_barang: "baik",
                keterangan: "",
            },
        ]);
    };

    const handleUpdateJumlah = (index: number, jumlah: number) => {
        const newItems = [...selectedItems];
        newItems[index].jumlah_retur = jumlah;
        setSelectedItems(newItems);
    };

    const handleUpdateKondisi = (index: number, kondisi: "baik" | "rusak") => {
        const newItems = [...selectedItems];
        newItems[index].kondisi_barang = kondisi;
        setSelectedItems(newItems);
    };

    const handleUpdateKeterangan = (index: number, ket: string) => {
        const newItems = [...selectedItems];
        newItems[index].keterangan = ket;
        setSelectedItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return selectedItems.reduce(
            (sum, item) => sum + item.jumlah_retur * item.harga_jual,
            0
        );
    };

    const calculateTotalReplacement = () => {
        return replacementItems.reduce(
            (sum, item) => sum + item.qty * item.harga_jual,
            0
        );
    };

    const calculateNetPayment = () => {
        return calculateTotalReplacement() - calculateTotal();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!transaksiId) {
            toast.error("Pilih transaksi");
            return;
        }

        if (selectedItems.length === 0) {
            toast.error("Tambahkan minimal 1 barang");
            return;
        }

        if (!alasanRetur) {
            toast.error("Masukkan alasan retur");
            return;
        }

        // Validate jumlah retur
        for (const item of selectedItems) {
            if (item.jumlah_retur > item.jumlah_beli) {
                toast.error(`Jumlah retur ${item.nama_barang} melebihi jumlah beli`);
                return;
            }
        }

        if (jenisRetur === 'ganti_barang' && replacementItems.length === 0) {
            toast.error("Pilih barang pengganti");
            return;
        }

        const netPayment = calculateNetPayment();
        if (netPayment > 0 && !confirm(`Pelanggan harus membayar kekurangan Rp ${netPayment.toLocaleString('id-ID')}. Lanjutkan?`)) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            "/retur-penjualan",
            {
                tanggal_retur: tanggalRetur,
                transaksi_id: transaksiId,
                alasan_retur: alasanRetur,
                jenis_retur: jenisRetur,
                items: selectedItems.map((item) => ({
                    detail_transaksi_id: item.detail_transaksi_id,
                    barang_id: item.barang_id,
                    jumlah_retur: item.jumlah_retur,
                    harga_jual: item.harga_jual,
                    kondisi_barang: item.kondisi_barang,
                    keterangan: item.keterangan,
                })),
                items_pengganti: (jenisRetur === 'ganti_barang' ? replacementItems : []) as any,
                net_payment: netPayment,
            },
            {
                onSuccess: () => {
                    toast.success("Retur penjualan berhasil dibuat");
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error("Gagal membuat retur");
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <AppLayout>
            <Head title="Retur Penjualan Baru" />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit("/retur-penjualan")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Retur Penjualan Baru
                        </h1>
                        <p className="text-muted-foreground">
                            Buat retur untuk transaksi penjualan
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Retur</CardTitle>
                            <CardDescription>
                                Pilih transaksi dan isi informasi retur
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal Retur</Label>
                                    <Input
                                        type="date"
                                        value={tanggalRetur}
                                        onChange={(e) => setTanggalRetur(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Transaksi</Label>
                                    <Select
                                        value={transaksiId}
                                        onValueChange={setTransaksiId}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih transaksi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transaksis.map((transaksi) => (
                                                <SelectItem
                                                    key={transaksi.id}
                                                    value={transaksi.id.toString()}
                                                >
                                                    {transaksi.nomor_transaksi} -{" "}
                                                    {transaksi.tanggal_transaksi} (Rp{" "}
                                                    {transaksi.total_bayar.toLocaleString("id-ID")})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Alasan Retur</Label>
                                <Textarea
                                    value={alasanRetur}
                                    onChange={(e) => setAlasanRetur(e.target.value)}
                                    placeholder="Jelaskan alasan retur..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Jenis Retur</Label>
                                <Select value={jenisRetur} onValueChange={(value: any) => setJenisRetur(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="uang_kembali">Uang Kembali</SelectItem>
                                        <SelectItem value="ganti_barang">Ganti Barang</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    {jenisRetur === "uang_kembali"
                                        ? "Pelanggan akan menerima uang kembali"
                                        : "Barang rusak akan diganti dengan barang baru"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {transaksiId && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Pilih Barang</CardTitle>
                                <CardDescription>
                                    Pilih barang yang akan diretur dari transaksi
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? (
                                    <div className="text-center py-8">Loading...</div>
                                ) : (
                                    <>
                                        {availableItems.length > 0 && (
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Kode</TableHead>
                                                            <TableHead>Nama Barang</TableHead>
                                                            <TableHead>Jumlah Beli</TableHead>
                                                            <TableHead>Harga</TableHead>
                                                            <TableHead>Subtotal</TableHead>
                                                            <TableHead className="w-[100px]">
                                                                Aksi
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {availableItems.map((item) => (
                                                            <TableRow key={item.detail_transaksi_id}>
                                                                <TableCell>{item.kode_barang}</TableCell>
                                                                <TableCell>{item.nama_barang}</TableCell>
                                                                <TableCell>{item.jumlah_beli}</TableCell>
                                                                <TableCell>
                                                                    Rp{" "}
                                                                    {item.harga_jual.toLocaleString(
                                                                        "id-ID"
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    Rp{" "}
                                                                    {item.subtotal.toLocaleString("id-ID")}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        onClick={() => handleAddItem(item)}
                                                                        disabled={selectedItems.some(
                                                                            (i) =>
                                                                                i.detail_transaksi_id ===
                                                                                item.detail_transaksi_id
                                                                        )}
                                                                    >
                                                                        Pilih
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {selectedItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Barang Retur</CardTitle>
                                <CardDescription>
                                    Atur jumlah dan kondisi barang yang diretur
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Nama Barang</TableHead>
                                                <TableHead>Jumlah Retur</TableHead>
                                                <TableHead>Kondisi</TableHead>
                                                <TableHead>Harga</TableHead>
                                                <TableHead>Subtotal</TableHead>
                                                <TableHead>Keterangan</TableHead>
                                                <TableHead className="w-[80px]">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedItems.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.kode_barang}</TableCell>
                                                    <TableCell>{item.nama_barang}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={item.jumlah_beli}
                                                            value={item.jumlah_retur}
                                                            onChange={(e) =>
                                                                handleUpdateJumlah(
                                                                    index,
                                                                    parseInt(e.target.value) || 1
                                                                )
                                                            }
                                                            className="w-20"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={item.kondisi_barang}
                                                            onValueChange={(value: "baik" | "rusak") =>
                                                                handleUpdateKondisi(index, value)
                                                            }
                                                        >
                                                            <SelectTrigger className="w-28">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="baik">
                                                                    Baik
                                                                </SelectItem>
                                                                <SelectItem value="rusak">
                                                                    Rusak
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        Rp{" "}
                                                        {item.harga_jual.toLocaleString("id-ID")}
                                                    </TableCell>
                                                    <TableCell>
                                                        Rp{" "}
                                                        {(
                                                            item.jumlah_retur * item.harga_jual
                                                        ).toLocaleString("id-ID")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={item.keterangan}
                                                            onChange={(e) =>
                                                                handleUpdateKeterangan(
                                                                    index,
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Opsional"
                                                            className="w-32"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex justify-end">
                                    <div className="bg-muted px-6 py-4 rounded-lg">
                                        <div className="text-sm text-muted-foreground">
                                            Total Nilai Retur
                                        </div>
                                        <div className="text-2xl font-bold">
                                            Rp {calculateTotal().toLocaleString("id-ID")}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {jenisRetur === "ganti_barang" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Barang Pengganti</CardTitle>
                                <CardDescription>
                                    Cari dan pilih barang sebagai pengganti
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Search Section */}
                                <div className="space-y-2">
                                    <Label>Cari Barang</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Ketik kode, nama, atau scan barcode..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {searchResults.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                                                        onClick={() => handleAddReplacement(item as any)}
                                                    >
                                                        <div>
                                                            <div className="font-medium">
                                                                {item.nama_barang}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {item.kode_barang} | Stok: {item.stok}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-medium">
                                                            Rp {item.harga_jual.toLocaleString("id-ID")}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Replacement Items Table */}
                                {replacementItems.length > 0 && (
                                    <>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Nama Barang</TableHead>
                                                        <TableHead>Qty</TableHead>
                                                        <TableHead>Harga</TableHead>
                                                        <TableHead>Subtotal</TableHead>
                                                        <TableHead className="w-[50px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {replacementItems.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <div className="font-medium">{item.nama_barang}</div>
                                                                <div className="text-xs text-muted-foreground">{item.kode_barang}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    max={item.stok}
                                                                    value={item.qty}
                                                                    onChange={(e) =>
                                                                        handleUpdateReplacementQty(
                                                                            index,
                                                                            parseInt(e.target.value) || 1,
                                                                            item.stok
                                                                        )
                                                                    }
                                                                    className="w-20"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                Rp {item.harga_jual.toLocaleString("id-ID")}
                                                            </TableCell>
                                                            <TableCell>
                                                                Rp {(item.qty * item.harga_jual).toLocaleString("id-ID")}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveReplacement(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 border-t pt-4">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Total Retur</div>
                                                <div className="text-lg font-bold text-red-600">
                                                    - Rp {calculateTotal().toLocaleString("id-ID")}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Total Barang Baru</div>
                                                <div className="text-lg font-bold text-blue-600">
                                                    + Rp {calculateTotalReplacement().toLocaleString("id-ID")}
                                                </div>
                                            </div>
                                            <div className="bg-muted p-2 rounded">
                                                <div className="text-sm text-muted-foreground">
                                                    {calculateNetPayment() > 0 ? "Kurang Bayar" : "Kembalian"}
                                                </div>
                                                <div className={`text-xl font-bold ${calculateNetPayment() > 0 ? "text-red-600" : "text-green-600"}`}>
                                                    Rp {Math.abs(calculateNetPayment()).toLocaleString("id-ID")}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit("/retur-penjualan")}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan Retur"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
