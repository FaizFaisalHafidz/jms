import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  data: {
    nama_cabang: string;
    kota: string;
    pendapatan: number;
    pengeluaran: number;
    laba_rugi: number;
  }[];
}

export default function CabangLabaRugiTable({ data }: Props) {
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
        <CardTitle>Laba Rugi per Cabang</CardTitle>
        <CardDescription>Breakdown laba rugi setiap cabang</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cabang</TableHead>
              <TableHead>Kota</TableHead>
              <TableHead className="text-right">Pendapatan</TableHead>
              <TableHead className="text-right">Pengeluaran</TableHead>
              <TableHead className="text-right">Laba/Rugi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cabang, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{cabang.nama_cabang}</TableCell>
                <TableCell>{cabang.kota}</TableCell>
                <TableCell className="text-right text-green-600">{formatCurrency(cabang.pendapatan)}</TableCell>
                <TableCell className="text-right text-red-600">{formatCurrency(cabang.pengeluaran)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={cabang.laba_rugi >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {formatCurrency(cabang.laba_rugi)}
                    </span>
                    <Badge variant={cabang.laba_rugi >= 0 ? "default" : "destructive"} className="text-xs">
                      {cabang.laba_rugi >= 0 ? 'L' : 'R'}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
