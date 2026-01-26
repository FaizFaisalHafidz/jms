import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LaporanLayout from "@/layouts/laporan-layout";
import { PageProps } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Award, Calendar, CreditCard, DollarSign, Package, ShoppingCart, TrendingUp, Store, Smartphone, AlertCircle, ArrowLeft } from 'lucide-react';
import DaftarTransaksiTable from './partials/daftar-transaksi-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface Cabang {
  id: number;
  nama_cabang: string;
  kota: string;
  alamat_lengkap: string;
}

interface PenjualanPerCabang {
  nama_cabang: string;
  kota: string;
  total_penjualan: number;
  total_transaksi: number;
}

interface GrafikData {
  tanggal: string;
  total: number;
  jumlah_transaksi: number;
}

interface TopBarang {
  nama_barang: string;
  total_terjual: number;
  total_omzet: number;
}

interface MetodePembayaran {
  metode_pembayaran: string;
  jumlah: number;
  total: number;
}

interface DetailTransaksiList {
  id: number;
  nama_barang: string;
  jumlah: number;
  harga_jual: number;
  subtotal: number;
}

interface TransaksiList {
  id: number;
  nomor_transaksi: string;
  tanggal_transaksi: string;
  nama_pelanggan: string | null;
  metode_pembayaran: string;
  total_bayar: number;
  status_transaksi: string;
  detail_transaksi: DetailTransaksiList[];
}

import SimplePagination from '@/components/simple-pagination';

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  per_page: number;
  to: number;
  total: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

interface ServiceList {
  id: number;
  nomor_service: string;
  tanggal_masuk: string;
  tanggal_selesai: string | null;
  merk_hp: string;
  tipe_hp: string;
  keluhan: string;
  kerusakan: string;
  total_biaya: number;
  status_service: string;
  nama_pelanggan: string;
}

interface Props extends PageProps {
  mode: 'selection' | 'detail';
  cabang_list: Cabang[];
  selected_cabang?: Cabang;
  filters: {
    filter_type: "harian" | "bulanan";
    tanggal?: string;
    tahun?: string;
    bulan?: string;
    cabang_id?: number;
  };
  stats: {
    total_penjualan: number;
    total_transaksi: number;
    total_item: number;
    total_laba: number;
    total_service_omzet: number;
    total_service_count: number;
    total_service_laba: number;
  };
  grafik_penjualan?: GrafikData[];
  top_barang?: TopBarang[];
  per_metode_pembayaran?: MetodePembayaran[];
  daftar_transaksi?: PaginatedResponse<TransaksiList>;
  daftar_service?: PaginatedResponse<ServiceList>;
}

export default function LaporanPenjualanPage({
  mode,
  cabang_list,
  selected_cabang,
  filters,
  stats,
  grafik_penjualan,
  top_barang,
  per_metode_pembayaran,
  daftar_transaksi,
  daftar_service
}: Props) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // States
  const [expandedService, setExpandedService] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState("penjualan");

  const toggleService = (id: number) => {
    setExpandedService(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  const handleBranchSelect = (cabangId: number) => {
    router.get('/laporan/penjualan', {
      cabang_id: cabangId,
      filter_type: 'harian', // Default to today
    });
  };

  const handleFilterTypeChange = (value: string) => {
    router.get('/laporan/penjualan', {
      ...filters,
      filter_type: value,
      tanggal: value === 'harian' ? new Date().toISOString().split('T')[0] : filters.tanggal,
      tahun: value === 'bulanan' ? currentYear.toString() : filters.tahun,
      bulan: value === 'bulanan' ? (new Date().getMonth() + 1).toString().padStart(2, '0') : filters.bulan,
    }, { preserveState: true, preserveScroll: true });
  };

  const handleDateChange = (value: string) => {
    router.get('/laporan/penjualan', {
      ...filters,
      tanggal: value,
    }, { preserveState: true, preserveScroll: true });
  };

  const handleMonthFilterChange = (key: string, value: string) => {
    router.get('/laporan/penjualan', {
      ...filters,
      [key]: value,
    }, { preserveState: true, preserveScroll: true });
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = () => {
    if (!filters) return '';
    if (filters.filter_type === 'harian' && filters.tanggal) {
      return new Date(filters.tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else if (filters.bulan && filters.tahun) {
      const month = months.find(m => m.value === filters.bulan);
      return (month?.label || '') + ' ' + filters.tahun;
    }
    return '';
  };

  // --- MODE SELECTION: GRID CABANG ---
  if (mode === 'selection') {
    return (
      <>
        <Head title="Pilih Cabang - Laporan Penjualan" />
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => router.get('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pilih Cabang</h2>
              <p className="text-sm text-gray-500">Silakan pilih cabang untuk melihat laporan penjualan.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cabang_list.map((cabang) => (
              <div
                key={cabang.id}
                onClick={() => handleBranchSelect(cabang.id)}
                className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center space-y-3 active:scale-95 duration-200"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{cabang.nama_cabang}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{cabang.kota}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // --- MODE DETAIL: TABS PENJUALAN & SERVICE ---
  return (
    <>
      <Head title={`Laporan - ${selected_cabang?.nama_cabang}`} />

      <div className="space-y-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => router.get('/laporan/penjualan')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{selected_cabang?.nama_cabang}</h1>
            <p className="text-xs text-gray-500">{selected_cabang?.alamat_lengkap}</p>
          </div>
        </div>

        {/* Filter Section (Collapsed to save space) */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {formatDate()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.filter_type}
                onValueChange={handleFilterTypeChange}
              >
                <SelectTrigger className="h-8 text-xs bg-gray-50">
                  <SelectValue />
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
                  className="h-8 text-xs bg-gray-50"
                />
              ) : (
                <div className="flex gap-1">
                  <Select
                    value={filters.bulan || ''}
                    onValueChange={(value) => handleMonthFilterChange('bulan', value)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-gray-50 flex-1">
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
                  <Select
                    value={filters.tahun || ''}
                    onValueChange={(value) => handleMonthFilterChange('tahun', value)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-gray-50 w-20">
                      <SelectValue placeholder="Thn" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary (Compact Grid) */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-xl p-3 text-white shadow-sm transition-colors duration-300 ${activeTab === 'penjualan' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
            <p className="text-[10px] font-medium opacity-90">
              {activeTab === 'penjualan' ? 'Total Penjualan' : 'Total Service'}
            </p>
            <p className="text-lg font-bold">
              {activeTab === 'penjualan' ? formatRupiah(stats.total_penjualan) : formatRupiah(stats.total_service_omzet)}
            </p>
            <p className="text-[10px] bg-white/20 w-fit px-1.5 rounded mt-1">
              {activeTab === 'penjualan' ? stats.total_transaksi : stats.total_service_count} Transaksi
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border shadow-sm">
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-gray-500">
                  {activeTab === 'penjualan' ? 'Total Laba Penjualan' : 'Total Laba Service'}
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {activeTab === 'penjualan' ? formatRupiah(stats.total_laba) : formatRupiah(stats.total_service_laba)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="penjualan"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-xs font-semibold rounded-md transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-2" />
              Penjualan
            </TabsTrigger>
            <TabsTrigger
              value="service"
              className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm text-xs font-semibold rounded-md transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 mr-2" />
              Service HP
            </TabsTrigger>
          </TabsList>

          {/* TAB PENJUALAN CONTENT */}
          <TabsContent value="penjualan" className="space-y-4 pt-2">
            {/* Top Products */}
            {top_barang && top_barang.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Produk Terlaris
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {top_barang.slice(0, 5).map((barang, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-amber-50 to-transparent rounded-lg"
                    >
                      <div className="w-6 h-6 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {barang.nama_barang}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {barang.total_terjual} terjual
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-900">
                        {formatRupiah(barang.total_omzet)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Payment Methods */}
            {per_metode_pembayaran && per_metode_pembayaran.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Metode Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {per_metode_pembayaran.map((metode, index) => {
                    const percentage = (metode.total / stats.total_penjualan) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {metode.metode_pembayaran}
                              </p>
                              <p className="text-xs text-gray-500">
                                {metode.jumlah} transaksi
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {formatRupiah(metode.total)}
                            </p>
                            <p className="text-xs text-gray-500">
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

            {/* Note: Reuse DaftarTransaksiTable but ensure it fits mobile or use a custom list here */}
            {daftar_transaksi && daftar_transaksi.data.length > 0 ? (
              <DaftarTransaksiTable transaksi={daftar_transaksi} />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-dashed">
                <ShoppingCart className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Belum ada data penjualan</p>
              </div>
            )}
          </TabsContent>

          {/* TAB SERVICE CONTENT */}
          <TabsContent value="service" className="space-y-3 pt-2">
            {daftar_service && daftar_service.data.length > 0 ? (
              <>
                <div className="space-y-3">
                  {daftar_service.data.map((service, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border shadow-sm overflow-hidden"
                    >
                      <div
                        onClick={() => toggleService(service.id)}
                        className="p-3 flex justify-between items-start cursor-pointer active:bg-gray-50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-blue-200 text-blue-700 bg-blue-50">
                              {service.nomor_service}
                            </Badge>
                            <span className="text-[10px] text-gray-500">
                              {new Date(service.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">
                            {service.merk_hp} {service.tipe_hp}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {service.kerusakan}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatRupiah(service.total_biaya)}</p>
                          <Badge
                            variant="default"
                            className={`mt-1 text-[10px] h-5 ${service.status_service === 'selesai' ? 'bg-green-500 hover:bg-green-600' :
                              service.status_service === 'diambil' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500'
                              }`}
                          >
                            {service.status_service}
                          </Badge>
                        </div>
                      </div>

                      {/* Expandable Details for Service */}
                      {expandedService[service.id] && (
                        <div className="bg-gray-50 p-3 border-t text-xs space-y-2 animate-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-gray-500">Pelanggan</p>
                              <p className="font-medium">{service.nama_pelanggan}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Keluhan</p>
                              <p className="font-medium line-clamp-2">{service.keluhan}</p>
                            </div>
                          </div>
                          {service.tanggal_selesai && (
                            <div className="pt-1 border-t border-gray-100 mt-2">
                              <div className="flex items-center gap-1.5 text-green-600 mt-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span className="font-medium">Selesai: {new Date(service.tanggal_selesai).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Pagination for Service */}
                <SimplePagination
                  links={daftar_service.links}
                  next_page_url={daftar_service.next_page_url}
                  prev_page_url={daftar_service.prev_page_url}
                  current_page={daftar_service.current_page}
                  last_page={daftar_service.last_page}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-dashed">
                <Smartphone className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Belum ada data service</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </>
  );
}

LaporanPenjualanPage.layout = (page: React.ReactNode) => (
  <LaporanLayout title="Laporan Penjualan" children={page} />
);
