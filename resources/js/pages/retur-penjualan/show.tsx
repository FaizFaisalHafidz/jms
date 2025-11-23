import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { ArrowLeft } from "lucide-react";

interface ReturItem {
    id: number;
    kode_barang: string;
    nama_barang: string;
    jumlah_retur: number;
    harga_jual: number;
    subtotal: number;
    kondisi_barang: "baik" | "rusak";
    keterangan: string | null;
}

interface Retur {
    id: number;
    nomor_retur: string;
    tanggal_retur: string;
    nomor_transaksi: string;
    tanggal_transaksi: string;
    total_item: number;
    total_nilai_retur: number;
    alasan_retur: string;
    status_retur: string;
    kasir: string;
    disetujui_oleh?: string;
    items: ReturItem[];
}

interface Props {
    retur: Retur;
}

export default function ReturPenjualanShow({ retur }: Props) {
    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
        > = {
            pending: { variant: "secondary", label: "Pending" },
            disetujui: { variant: "outline", label: "Disetujui" },
            ditolak: { variant: "destructive", label: "Ditolak" },
        };

        const config = variants[status] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getKondisiBadge = (kondisi: string) => {
        return kondisi === "baik" ? (
            <Badge variant="outline">Baik</Badge>
        ) : (
            <Badge variant="destructive">Rusak</Badge>
        );
    };

    return (
        <AppLayout>
            <Head title={`Detail Retur - ${retur.nomor_retur}`} />

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
                            Detail Retur Penjualan
                        </h1>
                        <p className="text-muted-foreground">{retur.nomor_retur}</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Retur</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nomor Retur</span>
                                <span className="font-medium">{retur.nomor_retur}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tanggal Retur</span>
                                <span className="font-medium">{retur.tanggal_retur}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                {getStatusBadge(retur.status_retur)}
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Item</span>
                                <span className="font-medium">{retur.total_item}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Nilai Retur</span>
                                <span className="font-medium">
                                    Rp {retur.total_nilai_retur.toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="pt-2 border-t">
                                <span className="text-muted-foreground">Alasan Retur</span>
                                <p className="mt-1">{retur.alasan_retur}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Transaksi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">No. Transaksi</span>
                                <span className="font-medium">{retur.nomor_transaksi}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Tanggal Transaksi
                                </span>
                                <span className="font-medium">{retur.tanggal_transaksi}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kasir</span>
                                <span className="font-medium">{retur.kasir}</span>
                            </div>
                            {retur.disetujui_oleh && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Disetujui Oleh</span>
                                    <span className="font-medium">{retur.disetujui_oleh}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Barang Retur</CardTitle>
                        <CardDescription>Daftar barang yang diretur</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {retur.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.kode_barang}</TableCell>
                                            <TableCell>{item.nama_barang}</TableCell>
                                            <TableCell>{item.jumlah_retur}</TableCell>
                                            <TableCell>
                                                {getKondisiBadge(item.kondisi_barang)}
                                            </TableCell>
                                            <TableCell>
                                                Rp {item.harga_jual.toLocaleString("id-ID")}
                                            </TableCell>
                                            <TableCell>
                                                Rp {item.subtotal.toLocaleString("id-ID")}
                                            </TableCell>
                                            <TableCell>{item.keterangan || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end mt-4">
                            <div className="bg-muted px-6 py-4 rounded-lg">
                                <div className="text-sm text-muted-foreground">
                                    Total Nilai Retur
                                </div>
                                <div className="text-2xl font-bold">
                                    Rp {retur.total_nilai_retur.toLocaleString("id-ID")}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
