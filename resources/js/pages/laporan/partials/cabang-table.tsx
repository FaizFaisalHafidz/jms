import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatRupiah } from '@/lib/utils';

interface CabangTableProps {
    data: Array<{
        id: number;
        nama_cabang: string;
        kota: string;
        penjualan: number;
        pembelian: number;
        service: number;
        pengeluaran: number;
        retur: number;
        pendapatan: number;
        laba_bersih: number;
    }>;
}

export function CabangTable({ data }: CabangTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Laporan Per Cabang</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead>Kota</TableHead>
                                    <TableHead className="text-right">Penjualan</TableHead>
                                    <TableHead className="text-right">Service</TableHead>
                                    <TableHead className="text-right">Retur</TableHead>
                                    <TableHead className="text-right">Pendapatan</TableHead>
                                    <TableHead className="text-right">Pembelian</TableHead>
                                    <TableHead className="text-right">Pengeluaran</TableHead>
                                    <TableHead className="text-right">Laba Bersih</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.nama_cabang}
                                        </TableCell>
                                        <TableCell>{item.kota}</TableCell>
                                        <TableCell className="text-right">
                                            {formatRupiah(item.penjualan)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatRupiah(item.service)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                            {formatRupiah(item.retur)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatRupiah(item.pendapatan)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatRupiah(item.pembelian)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatRupiah(item.pengeluaran)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant={
                                                    item.laba_bersih >= 0 ? 'default' : 'destructive'
                                                }
                                            >
                                                {formatRupiah(item.laba_bersih)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">
                        Belum ada data cabang
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
