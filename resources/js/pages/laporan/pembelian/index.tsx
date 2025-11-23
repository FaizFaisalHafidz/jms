import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from "@/layouts/app-layout";
import { PageProps } from "@/types";
import { Head, router } from "@inertiajs/react";
import CabangPembelianTable from "./partials/cabang-pembelian-table";
import GrafikPembelian from "./partials/grafik-pembelian";
import PembelianStats from "./partials/pembelian-stats";
import SupplierTable from "./partials/supplier-table";
import TopBarangTable from "./partials/top-barang-table";

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

  return (
    <>
      <Head title="Laporan Pembelian" />
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Pembelian</h1>
          <p className="text-muted-foreground">
            Laporan pembelian seluruh cabang
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filter_type">Tipe Filter</Label>
                <Select
                  value={filters.filter_type}
                  onValueChange={handleFilterTypeChange}
                >
                  <SelectTrigger id="filter_type">
                    <SelectValue placeholder="Pilih tipe filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harian">Harian</SelectItem>
                    <SelectItem value="bulanan">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filters.filter_type === 'harian' ? (
                <div className="space-y-2">
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={filters.tanggal || ''}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tahun">Tahun</Label>
                    <Select
                      value={filters.tahun || ''}
                      onValueChange={(value) => handleMonthFilterChange('tahun', value)}
                    >
                      <SelectTrigger id="tahun">
                        <SelectValue placeholder="Pilih tahun" />
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

                  <div className="space-y-2">
                    <Label htmlFor="bulan">Bulan</Label>
                    <Select
                      value={filters.bulan || ''}
                      onValueChange={(value) => handleMonthFilterChange('bulan', value)}
                    >
                      <SelectTrigger id="bulan">
                        <SelectValue placeholder="Pilih bulan" />
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <PembelianStats stats={stats} />

        <div className="grid gap-6 md:grid-cols-2">
          <GrafikPembelian data={grafik_pembelian} />
          <SupplierTable data={per_supplier} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <TopBarangTable data={top_barang} />
          <CabangPembelianTable data={pembelian_per_cabang} />
        </div>
      </div>
    </>
  );
}

LaporanPembelianPage.layout = (page: React.ReactNode) => (
  <AppLayout children={page} />
);
