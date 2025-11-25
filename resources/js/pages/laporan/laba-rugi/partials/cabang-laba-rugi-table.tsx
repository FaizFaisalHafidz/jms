import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  data: {
    nama_cabang: string;
    kota: string;
    pendapatan: number;
    laba_kotor: number;
    biaya_operasional: number;
    laba_bersih: number;
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
        <CardTitle className="text-lg md:text-xl">Laba Rugi per Cabang</CardTitle>
        <CardDescription className="text-sm">Breakdown laba rugi setiap cabang</CardDescription>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        <div className="w-full overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0">
          <div className="inline-block min-w-full align-middle">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs md:text-sm">Cabang</TableHead>
                  <TableHead className="text-xs md:text-sm">Kota</TableHead>
                  <TableHead className="text-right text-xs md:text-sm">Pendapatan</TableHead>
                  <TableHead className="text-right text-xs md:text-sm">Laba Kotor</TableHead>
                  <TableHead className="text-right text-xs md:text-sm">Biaya</TableHead>
                  <TableHead className="text-right text-xs md:text-sm">Laba Bersih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((cabang, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-xs md:text-sm">{cabang.nama_cabang}</TableCell>
                    <TableCell className="text-xs md:text-sm">{cabang.kota}</TableCell>
                    <TableCell className="text-right text-blue-600 text-xs md:text-sm whitespace-nowrap">{formatCurrency(cabang.pendapatan)}</TableCell>
                    <TableCell className="text-right text-green-600 text-xs md:text-sm whitespace-nowrap">{formatCurrency(cabang.laba_kotor)}</TableCell>
                    <TableCell className="text-right text-orange-600 text-xs md:text-sm whitespace-nowrap">{formatCurrency(cabang.biaya_operasional)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <span className={`${cabang.laba_bersih >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold text-xs md:text-sm whitespace-nowrap`}>
                          {formatCurrency(cabang.laba_bersih)}
                        </span>
                        <Badge variant={cabang.laba_bersih >= 0 ? "default" : "destructive"} className="text-xs">
                          {cabang.laba_bersih >= 0 ? 'L' : 'R'}
                        </Badge>
                      </div>
                    </TableCell>
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
