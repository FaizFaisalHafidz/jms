import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  stats: {
    penjualan: number;
    service: number;
    retur: number;
    total_pendapatan: number;
    pembelian: number;
    biaya_operasional: number;
    total_pengeluaran: number;
    laba_rugi: number;
  };
}

export default function LabaRugiStats({ stats }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.total_pendapatan)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Penjualan: {formatCurrency(stats.penjualan)} | Service: {formatCurrency(stats.service)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.total_pengeluaran)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Pembelian: {formatCurrency(stats.pembelian)} | Operasional: {formatCurrency(stats.biaya_operasional)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retur</CardTitle>
          <Activity className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.retur)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Laba/Rugi</CardTitle>
          <DollarSign className={`h-4 w-4 ${stats.laba_rugi >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.laba_rugi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.laba_rugi)}
          </div>
          <Badge variant={stats.laba_rugi >= 0 ? "default" : "destructive"} className="mt-2">
            {stats.laba_rugi >= 0 ? 'LABA' : 'RUGI'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
