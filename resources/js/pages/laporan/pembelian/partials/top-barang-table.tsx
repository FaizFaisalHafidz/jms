import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  data: {
    nama_barang: string;
    total_dibeli: number;
    total_nilai: number;
  }[];
}

export default function TopBarangTable({ data }: Props) {
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
        <CardTitle>Top 10 Barang Terbeli</CardTitle>
        <CardDescription>Barang yang paling banyak dibeli</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead className="text-right">Total Dibeli</TableHead>
              <TableHead className="text-right">Total Nilai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((barang, index) => (
              <TableRow key={index}>
                <TableCell>
                  {index < 3 ? (
                    <Badge variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}>
                      {index + 1}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">{index + 1}</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">{barang.nama_barang}</TableCell>
                <TableCell className="text-right">{barang.total_dibeli}</TableCell>
                <TableCell className="text-right">{formatCurrency(barang.total_nilai)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
