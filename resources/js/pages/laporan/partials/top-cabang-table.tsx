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

interface TopCabangTableProps {
    data: Array<{
        nama_cabang: string;
        kota: string;
        total_penjualan: number;
    }>;
}

export function TopCabangTable({ data }: TopCabangTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top 5 Cabang Terlaris</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead>Kota</TableHead>
                                    <TableHead className="text-right">Total Penjualan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    index === 0
                                                        ? 'default'
                                                        : index === 1
                                                            ? 'secondary'
                                                            : 'outline'
                                                }
                                            >
                                                #{index + 1}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {item.nama_cabang}
                                        </TableCell>
                                        <TableCell>{item.kota}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatRupiah(item.total_penjualan)}
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
