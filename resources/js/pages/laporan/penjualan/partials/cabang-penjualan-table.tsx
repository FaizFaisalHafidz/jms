import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  data: {
    nama_cabang: string;
    kota: string;
    total_penjualan: number;
    total_transaksi: number;
  }[];
}

export default function CabangPenjualanTable({ data }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Penjualan per Cabang</CardTitle>
        <CardDescription>Breakdown penjualan setiap cabang</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cabang</TableHead>
              <TableHead>Kota</TableHead>
              <TableHead className="text-right">Total Penjualan</TableHead>
              <TableHead className="text-right">Total Transaksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cabang, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{cabang.nama_cabang}</TableCell>
                <TableCell>{cabang.kota}</TableCell>
                <TableCell className="text-right">{formatCurrency(cabang.total_penjualan)}</TableCell>
                <TableCell className="text-right">{cabang.total_transaksi}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
