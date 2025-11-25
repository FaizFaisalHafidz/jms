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
import { PageProps } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Calendar, DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';

interface PembelianPerCabang {
  nama_cabang: string;
  kota: string;
  total_pembelian: number;
  total_transaksi: number;
}

interface GrafikData {
  tanggal: string;
  total: number;
  jumlah_transaksi: number;
}

interface TopBarang {
  nama_barang: string;
  total_dibeli: number;
  total_nilai: number;
}

interface PerSupplier {
  nama_suplier: string;
  jumlah: number;
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
    total_pembelian: number;
    total_transaksi: number;
    total_item: number;
    total_hutang: number;
  };
  pembelian_per_cabang: PembelianPerCabang[];
  grafik_pembelian: GrafikData[];
  top_barang: TopBarang[];
  per_supplier: PerSupplier[];
}

export default function LaporanPembelianPage({ filters, stats, pembelian_per_cabang, grafik_pembelian, top_barang, per_supplier }: Props) {
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
      router.get('/laporan/pembelian', {
        filter_type: 'harian',
        tanggal: new Date().toISOString().split('T')[0],
      }, {
        preserveState: true,
        preserveScroll: true,
      });
    } else {
      router.get('/laporan/pembelian', {
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
    router.get('/laporan/pembelian', {
      filter_type: 'harian',
      tanggal: value,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleMonthFilterChange = (key: string, value: string) => {
    router.get('/laporan/pembelian', {
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
      <Head title="Laporan Pembelian" />
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

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-4">
              <div className="p-2 bg-blue-500 rounded-lg w-fit mb-2">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-600 font-medium">Total Pembelian</p>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {formatRupiah(stats.total_pembelian)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-4">
              <div className="p-2 bg-green-500 rounded-lg w-fit mb-2">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-600 font-medium">Transaksi</p>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {stats.total_transaksi}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="p-4">
              <div className="p-2 bg-purple-500 rounded-lg w-fit mb-2">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-600 font-medium">Item Dibeli</p>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {stats.total_item}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-4">
              <div className="p-2 bg-orange-500 rounded-lg w-fit mb-2">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-600 font-medium">Total Hutang</p>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {formatRupiah(stats.total_hutang)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Barang */}
        {top_barang && top_barang.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Barang Terbanyak Dibeli
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {top_barang.slice(0, 5).map((barang, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-blue-50 to-transparent rounded-lg"
                >
                  <div className="w-6 h-6 bg-blue-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {barang.nama_barang}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {barang.total_dibeli} unit
                    </p>
                  </div>
                  <p className="text-xs font-bold text-gray-900">
                    {formatRupiah(barang.total_nilai)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Supplier */}
        {per_supplier && per_supplier.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Per Supplier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {per_supplier.map((supplier, index) => {
                const total = per_supplier.reduce((sum, s) => sum + s.total, 0);
                const percentage = (supplier.total / total) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {supplier.nama_suplier}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {supplier.jumlah} transaksi
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900">
                          {formatRupiah(supplier.total)}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Pembelian per Cabang */}
        {pembelian_per_cabang && pembelian_per_cabang.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Pembelian per Cabang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pembelian_per_cabang.map((cabang, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{cabang.nama_cabang}</p>
                    <p className="text-[10px] text-gray-500">{cabang.kota}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">
                      {formatRupiah(cabang.total_pembelian)}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {cabang.total_transaksi} transaksi
                    </p>
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

LaporanPembelianPage.layout = (page: React.ReactNode) => (
  <LaporanLayout title="Laporan Pembelian" children={page} />
);
