import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  data: {
    nama_suplier: string;
    jumlah: number;
    total: number;
  }[];
}

export default function SupplierTable({ data }: Props) {
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
        <CardTitle>Pembelian per Supplier</CardTitle>
        <CardDescription>Breakdown berdasarkan supplier</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Jumlah Transaksi</TableHead>
              <TableHead className="text-right">Total Pembelian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((supplier, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{supplier.nama_suplier}</TableCell>
                <TableCell className="text-right">{supplier.jumlah}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(supplier.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
