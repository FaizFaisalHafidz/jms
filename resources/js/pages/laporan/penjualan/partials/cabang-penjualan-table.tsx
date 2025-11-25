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
        <CardTitle className="text-lg md:text-xl">Penjualan per Cabang</CardTitle>
        <CardDescription className="text-sm">Breakdown penjualan setiap cabang</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs md:text-sm">Cabang</TableHead>
              <TableHead className="text-xs md:text-sm">Kota</TableHead>
              <TableHead className="text-right text-xs md:text-sm">Total Penjualan</TableHead>
              <TableHead className="text-right text-xs md:text-sm">Jumlah Transaksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cabang, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-xs md:text-sm">{cabang.nama_cabang}</TableCell>
                <TableCell className="text-xs md:text-sm">{cabang.kota}</TableCell>
                <TableCell className="text-right text-xs md:text-sm whitespace-nowrap">{formatCurrency(cabang.total_penjualan)}</TableCell>
                <TableCell className="text-right text-xs md:text-sm">{cabang.total_transaksi}</TableCell>
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
