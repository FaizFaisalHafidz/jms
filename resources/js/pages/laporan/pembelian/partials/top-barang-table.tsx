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
        <CardTitle className="text-lg md:text-xl">Top 10 Barang Terbeli</CardTitle>
        <CardDescription className="text-sm">Barang yang paling banyak dibeli</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-xs md:text-sm">#</TableHead>
              <TableHead className="text-xs md:text-sm">Nama Barang</TableHead>
              <TableHead className="text-right text-xs md:text-sm">Total Dibeli</TableHead>
              <TableHead className="text-right text-xs md:text-sm">Total Nilai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((barang, index) => (
              <TableRow key={index}>
                <TableCell>
                  {index < 3 ? (
                    <Badge variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"} className="text-xs">
                      {index + 1}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs md:text-sm">{index + 1}</span>
                  )}
                </TableCell>
                <TableCell className="font-medium text-xs md:text-sm">{barang.nama_barang}</TableCell>
                <TableCell className="text-right text-xs md:text-sm">{barang.total_dibeli}</TableCell>
                <TableCell className="text-right text-xs md:text-sm whitespace-nowrap">{formatCurrency(barang.total_nilai)}</TableCell>
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
