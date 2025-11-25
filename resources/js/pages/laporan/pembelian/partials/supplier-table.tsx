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
        <CardTitle className="text-lg md:text-xl">Per Supplier</CardTitle>
        <CardDescription className="text-sm">Breakdown berdasarkan supplier</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs md:text-sm">Supplier</TableHead>
              <TableHead className="text-right text-xs md:text-sm">Jumlah Transaksi</TableHead>
              <TableHead className="text-right text-xs md:text-sm">Total Pembelian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((supplier, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-xs md:text-sm">{supplier.nama_suplier}</TableCell>
                <TableCell className="text-right text-xs md:text-sm">{supplier.jumlah}</TableCell>
                <TableCell className="text-right font-medium text-xs md:text-sm whitespace-nowrap">{formatCurrency(supplier.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
