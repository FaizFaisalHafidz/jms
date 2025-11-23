import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface TransaksiTerbaruTableProps {
    data: Array<{
        nomor_transaksi: string;
        tanggal_transaksi: string;
        total_harga: number;
        user: string;
    }>;
}

export function TransaksiTerbaruTable({ data }: TransaksiTerbaruTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>10 Transaksi Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nomor</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Kasir</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            {item.nomor_transaksi}
                                        </TableCell>
                                        <TableCell>{item.tanggal_transaksi}</TableCell>
                                        <TableCell className="text-right">
                                            Rp {item.total_harga.toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell>{item.user}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">
                        Belum ada data transaksi
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
