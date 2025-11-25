import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import LaporanLayout from "@/layouts/laporan-layout";
import { cn } from '@/lib/utils';
import { PageProps } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Activity, Calendar, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface LabaPerCabang {
  nama_cabang: string;
  kota: string;
  pendapatan: number;
  laba_kotor: number;
  biaya_operasional: number;
  laba_bersih: number;
}

interface GrafikData {
  tanggal: string;
  laba_kotor: number;
  pendapatan_service: number;
  biaya_operasional: number;
  laba_bersih: number;
}

interface BreakdownData {
  kategori_pengeluaran: string;
  total: number;
}

interface Props extends PageProps {
  filters: {
    filter_type: "harian" | "bulanan";
    tanggal?: string;
    tahun?: string;
    bulan?: string;
  };
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
  laba_per_cabang: LabaPerCabang[];
  grafik_laba: GrafikData[];
  breakdown_pengeluaran: BreakdownData[];
}

export default function LaporanLabaRugiPage({ filters, stats, laba_per_cabang, grafik_laba, breakdown_pengeluaran }: Props) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const handleFilterTypeChange = (value: string) => {
    if (value === 'harian') {
      router.get('/laporan/laba-rugi', {
        filter_type: 'harian',
        tanggal: new Date().toISOString().split('T')[0],
      }, {
        preserveState: true,
        preserveScroll: true,
      });
    } else {
      router.get('/laporan/laba-rugi', {
        filter_type: 'bulanan',
        tahun: currentYear.toString(),
        bulan: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      }, {
        preserveState: true,
        preserveScroll: true,
      });
    }
  };

  const handleDateChange = (value: string) => {
    router.get('/laporan/laba-rugi', {
      filter_type: 'harian',
      tanggal: value,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleMonthFilterChange = (key: string, value: string) => {
    router.get('/laporan/laba-rugi', {
      filter_type: 'bulanan',
      tahun: key === 'tahun' ? value : filters.tahun,
      bulan: key === 'bulan' ? value : filters.bulan,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = () => {
    if (filters.filter_type === 'harian' && filters.tanggal) {
      return new Date(filters.tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else if (filters.bulan && filters.tahun) {
      const month = months.find(m => m.value === filters.bulan);
      return `${month?.label} ${filters.tahun}`;
    }
    return '';
  };

  return (
    <>
      <Head title="Laporan Laba Rugi" />
      <div className="space-y-4">
        {/* Filter Section - Compact */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {formatDate()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.filter_type}
                onValueChange={handleFilterTypeChange}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harian">Harian</SelectItem>
                  <SelectItem value="bulanan">Bulanan</SelectItem>
                </SelectContent>
              </Select>

              {filters.filter_type === 'harian' ? (
                <Input
                  type="date"
                  value={filters.tanggal || ''}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="h-9 text-xs"
                />
              ) : (
                <>
                  <Select
                    value={filters.tahun || ''}
                    onValueChange={(value) => handleMonthFilterChange('tahun', value)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
            
            {filters.filter_type === 'bulanan' && (
              <div className="mt-2">
                <Select
                  value={filters.bulan || ''}
                  onValueChange={(value) => handleMonthFilterChange('bulan', value)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3">
          {/* Omzet */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-gray-600 font-medium">Omzet</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {formatRupiah(stats.total_pendapatan).replace('Rp', 'Rp ')}
                </p>
                <p className="text-[9px] text-gray-500">
                  Penjualan + Service
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Laba Bersih */}
          <Card className={cn(
            "border-0 shadow-sm",
            stats.laba_bersih >= 0 
              ? "bg-gradient-to-br from-green-50 to-green-100/50" 
              : "bg-gradient-to-br from-red-50 to-red-100/50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  stats.laba_bersih >= 0 ? "bg-green-500" : "bg-red-500"
                )}>
                  {stats.laba_bersih >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-white" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-gray-600 font-medium">Laba Bersih</p>
                <p className={cn(
                  "text-sm font-bold leading-tight",
                  stats.laba_bersih >= 0 ? "text-green-700" : "text-red-700"
                )}>
                  {formatRupiah(stats.laba_bersih).replace('Rp', 'Rp ')}
                </p>
                <p className="text-[9px] text-gray-500">
                  Setelah operasional
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Laba - Compact Cards */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Rincian Laba
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Laba Penjualan */}
            <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
              <div>
                <p className="text-[10px] text-gray-600 mb-0.5">Laba Penjualan</p>
                <p className="text-xs font-bold text-green-700">
                  {formatRupiah(stats.laba_kotor_penjualan)}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>

            {/* Laba Service */}
            <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-lg">
              <div>
                <p className="text-[10px] text-gray-600 mb-0.5">Laba Service</p>
                <p className="text-xs font-bold text-purple-700">
                  {formatRupiah(stats.laba_service)}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
            </div>

            {/* Biaya Operasional */}
            <div className="flex items-center justify-between p-2.5 bg-orange-50 rounded-lg">
              <div>
                <p className="text-[10px] text-gray-600 mb-0.5">Biaya Operasional</p>
                <p className="text-xs font-bold text-orange-700">
                  {formatRupiah(stats.biaya_operasional)}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Laba per Cabang */}
        {laba_per_cabang && laba_per_cabang.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Laba per Cabang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {laba_per_cabang.map((cabang, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{cabang.nama_cabang}</p>
                    <p className="text-xs text-gray-500">{cabang.kota}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      cabang.laba_bersih >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatRupiah(cabang.laba_bersih)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Omzet: {formatRupiah(cabang.pendapatan)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Breakdown Pengeluaran */}
        {breakdown_pengeluaran && breakdown_pengeluaran.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Kategori Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {breakdown_pengeluaran.map((item, index) => {
                const percentage = (item.total / stats.biaya_operasional) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-700">
                        {item.kategori_pengeluaran}
                      </p>
                      <p className="text-xs font-bold text-gray-900">
                        {formatRupiah(item.total)}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-orange-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

LaporanLabaRugiPage.layout = (page: React.ReactNode) => (
  <LaporanLayout title="Laporan Laba Rugi" children={page} />
);
