import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface TopBarangTableProps {
    data: Array<{
        nama_barang: string;
        total_terjual: number;
        total_omzet: number;
    }>;
}

export function TopBarangTable({ data }: TopBarangTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top 10 Barang Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                    <TableHead>Nama Barang</TableHead>
                                    <TableHead className="text-right">Terjual</TableHead>
                                    <TableHead className="text-right">Omzet</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">
                                            {item.nama_barang}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.total_terjual}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            Rp {item.total_omzet.toLocaleString('id-ID')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">
                        Belum ada data penjualan
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
