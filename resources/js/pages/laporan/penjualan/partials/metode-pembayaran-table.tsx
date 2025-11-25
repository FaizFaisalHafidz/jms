import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, QrCode, Wallet } from "lucide-react";

interface Props {
  data: {
    metode_pembayaran: string;
    jumlah: number;
    total: number;
  }[];
}

export default function MetodePembayaranTable({ data }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMetodeIcon = (metode: string) => {
    switch (metode.toLowerCase()) {
      case "tunai":
        return <Wallet className="h-4 w-4" />;
      case "transfer":
        return <CreditCard className="h-4 w-4" />;
      case "qris":
        return <QrCode className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMetodeVariant = (metode: string): "default" | "secondary" | "outline" => {
    switch (metode.toLowerCase()) {
      case "tunai":
        return "default";
      case "transfer":
        return "secondary";
      case "qris":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Per Metode Pembayaran</CardTitle>
        <CardDescription className="text-sm">Breakdown berdasarkan metode pembayaran</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs md:text-sm">Metode</TableHead>
              <TableHead className="text-right text-xs md:text-sm">Jumlah</TableHead>
              <TableHead className="text-right text-xs md:text-sm">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((metode, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getMetodeIcon(metode.metode_pembayaran)}
                    <Badge variant={getMetodeVariant(metode.metode_pembayaran)} className="text-xs">
                      {metode.metode_pembayaran}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs md:text-sm">{metode.jumlah}</TableCell>
                <TableCell className="text-right font-medium text-xs md:text-sm whitespace-nowrap">{formatCurrency(metode.total)}</TableCell>
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
