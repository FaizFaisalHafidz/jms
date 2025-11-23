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
import { ArrowLeft, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface Cabang {
    id: number;
    nama_cabang: string;
}

interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    stok_tersedia: number;
}

interface TransferItem {
    barang_id: number;
    kode_barang: string;
    nama_barang: string;
    stok_tersedia: number;
    jumlah_transfer: number;
    keterangan: string;
}

interface Props {
    cabangs: Cabang[];
}

export default function TransferStokCreate({ cabangs }: Props) {
    const [tanggalTransfer, setTanggalTransfer] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [cabangTujuanId, setCabangTujuanId] = useState("");
    const [keterangan, setKeterangan] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<Barang[]>([]);
    const [items, setItems] = useState<TransferItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-search with debounce
    useEffect(() => {
        if (!searchKeyword || searchKeyword.length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await axios.post("/transfer-stok/search-barang", {
                    keyword: searchKeyword,
                });
                setSearchResults(response.data);
            } catch (error) {
                toast.error("Gagal mencari barang");
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchKeyword]);

    const handleAddItem = (barang: Barang) => {
        // Check if already added
        if (items.some((item) => item.barang_id === barang.id)) {
            toast.error("Barang sudah ditambahkan");
            return;
        }

        setItems([
            ...items,
            {
                barang_id: barang.id,
                kode_barang: barang.kode_barang,
                nama_barang: barang.nama_barang,
                stok_tersedia: barang.stok_tersedia,
                jumlah_transfer: 1,
                keterangan: "",
            },
        ]);
        setSearchKeyword("");
        setSearchResults([]);
        toast.success("Barang ditambahkan");
    };

    const handleUpdateJumlah = (index: number, jumlah: number) => {
        const newItems = [...items];
        newItems[index].jumlah_transfer = jumlah;
        setItems(newItems);
    };

    const handleUpdateKeterangan = (index: number, ket: string) => {
        const newItems = [...items];
        newItems[index].keterangan = ket;
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!cabangTujuanId) {
            toast.error("Pilih cabang tujuan");
            return;
        }

        if (items.length === 0) {
            toast.error("Tambahkan minimal 1 barang");
            return;
        }

        // Validate stock
        for (const item of items) {
            if (item.jumlah_transfer > item.stok_tersedia) {
                toast.error(`Stok ${item.nama_barang} tidak mencukupi`);
                return;
            }
        }

        setIsSubmitting(true);
        router.post(
            "/transfer-stok",
            {
                tanggal_transfer: tanggalTransfer,
                cabang_tujuan_id: cabangTujuanId,
                items: items.map((item) => ({
                    barang_id: item.barang_id,
                    jumlah_transfer: item.jumlah_transfer,
                    keterangan: item.keterangan,
                })),
                keterangan,
            },
            {
                onSuccess: () => {
                    toast.success("Transfer stok berhasil dibuat");
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error("Gagal membuat transfer");
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <AppLayout>
            <Head title="Transfer Stok Baru" />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit("/transfer-stok")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Transfer Stok Baru
                        </h1>
                        <p className="text-muted-foreground">
                            Buat transfer stok antar cabang
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Transfer</CardTitle>
                            <CardDescription>
                                Isi informasi dasar transfer stok
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal Transfer</Label>
                                    <Input
                                        type="date"
                                        value={tanggalTransfer}
                                        onChange={(e) => setTanggalTransfer(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Cabang Tujuan</Label>
                                    <Select
                                        value={cabangTujuanId}
                                        onValueChange={setCabangTujuanId}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih cabang tujuan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cabangs.map((cabang) => (
                                                <SelectItem
                                                    key={cabang.id}
                                                    value={cabang.id.toString()}
                                                >
                                                    {cabang.nama_cabang}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Keterangan</Label>
                                <Textarea
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    placeholder="Keterangan tambahan (opsional)"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Barang</CardTitle>
                            <CardDescription>Cari dan tambahkan barang</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Input
                                    placeholder="Cari barang (kode/nama)..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-3">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    </div>
                                )}
                                {searchResults.length > 0 && (
                                        <Card className="absolute top-full left-0 right-0 mt-1 z-10 max-h-60 overflow-auto">
                                            <CardContent className="p-2">
                                                {searchResults.map((barang) => (
                                                    <button
                                                        key={barang.id}
                                                        type="button"
                                                        onClick={() => handleAddItem(barang)}
                                                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm"
                                                    >
                                                        <div className="font-medium">
                                                            {barang.kode_barang} -{" "}
                                                            {barang.nama_barang}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Stok: {barang.stok_tersedia}
                                                        </div>
                                                    </button>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                            {items.length > 0 && (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Nama Barang</TableHead>
                                                <TableHead>Stok Tersedia</TableHead>
                                                <TableHead>Jumlah Transfer</TableHead>
                                                <TableHead>Keterangan</TableHead>
                                                <TableHead className="w-[80px]">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.kode_barang}</TableCell>
                                                    <TableCell>{item.nama_barang}</TableCell>
                                                    <TableCell>{item.stok_tersedia}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={item.stok_tersedia}
                                                            value={item.jumlah_transfer}
                                                            onChange={(e) =>
                                                                handleUpdateJumlah(
                                                                    index,
                                                                    parseInt(e.target.value) || 1
                                                                )
                                                            }
                                                            className="w-24"
                                                        />
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
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit("/transfer-stok")}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : "Simpan Transfer"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
