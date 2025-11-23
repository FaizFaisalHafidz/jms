import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { ArrowLeft, Package } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface TransferItem {
    id: number;
    kode_barang: string;
    nama_barang: string;
    jumlah_transfer: number;
    jumlah_diterima: number;
    keterangan: string;
}

interface Transfer {
    id: number;
    nomor_transfer: string;
    tanggal_transfer: string;
    cabang_asal: string;
    cabang_tujuan: string;
    status_transfer: string;
    total_item: number;
    keterangan: string;
    dibuat_oleh: string;
    disetujui_oleh?: string;
    tanggal_disetujui?: string;
    diterima_oleh?: string;
    tanggal_diterima?: string;
    items: TransferItem[];
}

interface Props {
    transfer: Transfer;
}

export default function TransferStokDetail({ transfer }: Props) {
    const [receiveAmounts, setReceiveAmounts] = useState<Record<number, number>>(
        transfer.items.reduce((acc, item) => {
            acc[item.id] = item.jumlah_diterima || item.jumlah_transfer;
            return acc;
        }, {} as Record<number, number>)
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
        > = {
            pending: { variant: "secondary", label: "Pending" },
            disetujui: { variant: "default", label: "Disetujui" },
            dikirim: { variant: "default", label: "Dikirim" },
            diterima: { variant: "outline", label: "Diterima" },
            ditolak: { variant: "destructive", label: "Ditolak" },
        };

        const config = variants[status] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleReceive = (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        router.post(
            `/transfer-stok/${transfer.id}/receive`,
            {
                items: transfer.items.map((item) => ({
                    detail_id: item.id,
                    jumlah_diterima: receiveAmounts[item.id] || 0,
                })),
            },
            {
                onSuccess: () => {
                    toast.success("Transfer berhasil diterima");
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error("Gagal menerima transfer");
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <AppLayout>
            <Head title={`Detail Transfer - ${transfer.nomor_transfer}`} />

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
                            Detail Transfer Stok
                        </h1>
                        <p className="text-muted-foreground">
                            {transfer.nomor_transfer}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Transfer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nomor Transfer</span>
                                <span className="font-medium">{transfer.nomor_transfer}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tanggal</span>
                                <span className="font-medium">{transfer.tanggal_transfer}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dari Cabang</span>
                                <span className="font-medium">{transfer.cabang_asal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ke Cabang</span>
                                <span className="font-medium">{transfer.cabang_tujuan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                {getStatusBadge(transfer.status_transfer)}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Item</span>
                                <span className="font-medium">{transfer.total_item}</span>
                            </div>
                            {transfer.keterangan && (
                                <div className="pt-2 border-t">
                                    <span className="text-muted-foreground">Keterangan</span>
                                    <p className="mt-1">{transfer.keterangan}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dibuat Oleh</span>
                                <span className="font-medium">{transfer.dibuat_oleh}</span>
                            </div>
                            {transfer.disetujui_oleh && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Disetujui Oleh</span>
                                        <span className="font-medium">{transfer.disetujui_oleh}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tanggal Disetujui</span>
                                        <span className="font-medium">{transfer.tanggal_disetujui}</span>
                                    </div>
                                </>
                            )}
                            {transfer.diterima_oleh && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Diterima Oleh</span>
                                        <span className="font-medium">{transfer.diterima_oleh}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tanggal Diterima</span>
                                        <span className="font-medium">{transfer.tanggal_diterima}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Barang</CardTitle>
                        <CardDescription>
                            {transfer.status_transfer === "dikirim"
                                ? "Konfirmasi penerimaan barang"
                                : "Daftar barang dalam transfer"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transfer.status_transfer === "dikirim" ? (
                            <form onSubmit={handleReceive} className="space-y-4">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Kode</TableHead>
                                                <TableHead>Nama Barang</TableHead>
                                                <TableHead>Jumlah Dikirim</TableHead>
                                                <TableHead>Jumlah Diterima</TableHead>
                                                <TableHead>Keterangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transfer.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.kode_barang}</TableCell>
                                                    <TableCell>{item.nama_barang}</TableCell>
                                                    <TableCell>{item.jumlah_transfer}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={item.jumlah_transfer}
                                                            value={receiveAmounts[item.id]}
                                                            onChange={(e) =>
                                                                setReceiveAmounts({
                                                                    ...receiveAmounts,
                                                                    [item.id]: parseInt(e.target.value) || 0,
                                                                })
                                                            }
                                                            className="w-24"
                                                        />
                                                    </TableCell>
                                                    <TableCell>{item.keterangan || "-"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit("/transfer-stok")}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        <Package className="mr-2 h-4 w-4" />
                                        {isSubmitting ? "Memproses..." : "Terima Barang"}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Nama Barang</TableHead>
                                            <TableHead>Jumlah Transfer</TableHead>
                                            <TableHead>Jumlah Diterima</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transfer.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.kode_barang}</TableCell>
                                                <TableCell>{item.nama_barang}</TableCell>
                                                <TableCell>{item.jumlah_transfer}</TableCell>
                                                <TableCell>{item.jumlah_diterima}</TableCell>
                                                <TableCell>{item.keterangan || "-"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
