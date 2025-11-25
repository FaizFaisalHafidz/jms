import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  stats: {
    penjualan: number;
    service: number;
    retur: number;
    total_pendapatan: number;
    laba_kotor_penjualan: number;
    laba_service: number;
    biaya_operasional: number;
    laba_bersih: number;
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
    <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pendapatan (Omzet)</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.total_pendapatan)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Penjualan: {formatCurrency(stats.penjualan)} | Service: {formatCurrency(stats.service)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Laba Penjualan</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-blue-600">{formatCurrency(stats.laba_kotor_penjualan)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Harga Jual - Harga Modal
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Laba Service</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-purple-600">{formatCurrency(stats.laba_service)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Jasa + Margin Spare Part
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Biaya Operasional</CardTitle>
          <TrendingDown className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-orange-600">{formatCurrency(stats.biaya_operasional)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Gaji, listrik, sewa, dll
          </div>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base md:text-lg font-medium">Laba Bersih</CardTitle>
          <DollarSign className={`h-5 w-5 ${stats.laba_bersih >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl md:text-3xl font-bold ${stats.laba_bersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.laba_bersih)}
          </div>
          <Badge variant={stats.laba_bersih >= 0 ? "default" : "destructive"} className="mt-2">
            {stats.laba_bersih >= 0 ? 'LABA' : 'RUGI'}
          </Badge>
          <div className="text-xs md:text-sm text-muted-foreground mt-2">
            Laba Penjualan ({formatCurrency(stats.laba_kotor_penjualan)}) + Laba Service ({formatCurrency(stats.laba_service)}) - Biaya Operasional ({formatCurrency(stats.biaya_operasional)}) - Retur ({formatCurrency(stats.retur)})
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
