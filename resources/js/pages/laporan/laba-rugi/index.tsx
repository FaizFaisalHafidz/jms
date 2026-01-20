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
import { Calendar } from 'lucide-react';

interface LabaPerCabang {
  nama_cabang: string;
  kota: string;
  omzet: number;
  pengeluaran: number;
  sisa: number;
}

interface Service {
  nomor_service: string;
  total_biaya: number;
  metode_pembayaran: string;
}

interface Pengeluaran {
  keterangan: string;
  jumlah: number;
  kategori_pengeluaran: string;
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
    total_omzet: number;
    biaya_spare_part: number;
    biaya_jasa: number;
    total_diskon: number;
    biaya_operasional: number;
    penjualan_metode: {
      tunai: number;
      transfer: number;
      qris: number;
      edc: number;
    };
    per_metode: {
      tunai: number;
      transfer: number;
      qris: number;
      edc: number;
    };
    total_tunai: number;
    sisa_kas: number;
    sisa: number;
  };
  list_service: Service[];
  list_pengeluaran: Pengeluaran[];
  laba_per_cabang: LabaPerCabang[];
  breakdown_pengeluaran: any[];
}

export default function LaporanLabaRugiPage({ filters, stats, list_service, list_pengeluaran, laba_per_cabang }: Props) {
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
      <div className="space-y-3">
        {/* Filter Section */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">
                {formatDate()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.filter_type}
                onValueChange={handleFilterTypeChange}
              >
                <SelectTrigger className="h-8 text-xs">
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
                  className="h-8 text-xs"
                />
              ) : (
                <Select
                  value={filters.tahun || ''}
                  onValueChange={(value) => handleMonthFilterChange('tahun', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
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
              )}
            </div>

            {filters.filter_type === 'bulanan' && (
              <div className="mt-2">
                <Select
                  value={filters.bulan || ''}
                  onValueChange={(value) => handleMonthFilterChange('bulan', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
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

        {/* Total Penjualan & Metode Bayar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-700">Total Penjualan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 font-bold">
              <span>Total Penjualan</span>
              <span>{formatRupiah(stats.penjualan)}</span>
            </div>

            <div className="pt-1 border-t">
              <div className="text-[10px] font-semibold text-gray-600 mb-1">PER METODE BAYAR:</div>
              {stats.penjualan_metode.tunai > 0 && (
                <div className="flex justify-between py-0.5 pl-2">
                  <span className="text-gray-600">Tunai</span>
                  <span className="font-medium">{formatRupiah(stats.penjualan_metode.tunai)}</span>
                </div>
              )}
              {stats.penjualan_metode.transfer > 0 && (
                <div className="flex justify-between py-0.5 pl-2">
                  <span className="text-gray-600">Transfer</span>
                  <span className="font-medium">{formatRupiah(stats.penjualan_metode.transfer)}</span>
                </div>
              )}
              {stats.penjualan_metode.qris > 0 && (
                <div className="flex justify-between py-0.5 pl-2">
                  <span className="text-gray-600">QRIS</span>
                  <span className="font-medium">{formatRupiah(stats.penjualan_metode.qris)}</span>
                </div>
              )}
              {stats.penjualan_metode.edc > 0 && (
                <div className="flex justify-between py-0.5 pl-2">
                  <span className="text-gray-600">EDC</span>
                  <span className="font-medium">{formatRupiah(stats.penjualan_metode.edc)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service HP */}
        {list_service && list_service.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-700">
                SERVICE HP ({list_service.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              {list_service.map((service, index) => (
                <div key={index} className="flex justify-between py-0.5">
                  <span className="text-gray-600">{service.nomor_service}</span>
                  <span className="font-medium">{formatRupiah(service.total_biaya)}</span>
                </div>
              ))}
              <div className="flex justify-between py-1 border-t font-semibold mt-1">
                <span>Total Service</span>
                <span>{formatRupiah(stats.service)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pengeluaran */}
        {list_pengeluaran && list_pengeluaran.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-700">
                PENGELUARAN ({list_pengeluaran.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              {list_pengeluaran.map((item, index) => (
                <div key={index} className="flex justify-between py-0.5">
                  <span className="text-gray-600 truncate max-w-[200px]">
                    {item.keterangan || item.kategori_pengeluaran}
                  </span>
                  <span className="font-medium">{formatRupiah(item.jumlah)}</span>
                </div>
              ))}
              <div className="flex justify-between py-1 border-t font-semibold mt-1">
                <span>Total Pengeluaran</span>
                <span>{formatRupiah(stats.biaya_operasional)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ringkasan Pendapatan */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-700">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Total Pendapatan</span>
              <span className="font-semibold">{formatRupiah(stats.total_omzet)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Total Pengeluaran</span>
              <span className="font-semibold text-red-600">-{formatRupiah(stats.biaya_operasional)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-t-2 border-gray-900">
              <span className={cn("font-bold", stats.sisa >= 0 ? "text-gray-900" : "text-red-600")}>
                LABA BERSIH
              </span>
              <span className={cn("font-bold", stats.sisa >= 0 ? "text-gray-900" : "text-red-600")}>
                {formatRupiah(stats.sisa)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Rincian Keuangan */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-700">RINCIAN KEUANGAN</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Total Tunai (Cash)</span>
              <span className="font-semibold">{formatRupiah(stats.per_metode.tunai)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Total Transfer</span>
              <span className="font-semibold">{formatRupiah(stats.per_metode.transfer)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Total QRIS</span>
              <span className="font-semibold">{formatRupiah(stats.per_metode.qris)}</span>
            </div>
            {stats.per_metode.edc > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Total EDC</span>
                <span className="font-semibold">{formatRupiah(stats.per_metode.edc)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sisa Uang Cash */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-gray-700">SISA UANG CASH</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Masuk (Tunai)</span>
              <span className="font-semibold">{formatRupiah(stats.total_tunai)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Pengeluaran</span>
              <span className="font-semibold text-red-600">-{formatRupiah(stats.biaya_operasional)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-t-2 border-gray-900">
              <span className={cn("font-bold", stats.sisa_kas >= 0 ? "text-gray-900" : "text-red-600")}>
                SISA CASH
              </span>
              <span className={cn("font-bold", stats.sisa_kas >= 0 ? "text-gray-900" : "text-red-600")}>
                {formatRupiah(stats.sisa_kas)}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 pt-0.5">
              Estimasi uang tunai yang seharusnya ada di kas
            </div>
          </CardContent>
        </Card>

        {/* Sisa per Cabang */}
        {laba_per_cabang && laba_per_cabang.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-gray-700">Per Cabang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {laba_per_cabang.map((cabang, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <div>
                    <div className="font-medium text-gray-900">{cabang.nama_cabang}</div>
                    <div className="text-[10px] text-gray-500">Omzet: {formatRupiah(cabang.omzet)}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-semibold",
                      cabang.sisa >= 0 ? "text-gray-900" : "text-red-600"
                    )}>
                      {formatRupiah(cabang.sisa)}
                    </div>
                  </div>
                </div>
              ))}
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
