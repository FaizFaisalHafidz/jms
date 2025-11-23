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
        <CardTitle>Pembayaran per Metode</CardTitle>
        <CardDescription>Breakdown berdasarkan metode pembayaran</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metode</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((metode, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getMetodeIcon(metode.metode_pembayaran)}
                    <Badge variant={getMetodeVariant(metode.metode_pembayaran)}>
                      {metode.metode_pembayaran}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">{metode.jumlah}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(metode.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
