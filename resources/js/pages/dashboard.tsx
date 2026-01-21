import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, DollarSign, Package, ShoppingCart, Store, TrendingUp, Users, Wrench } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    description?: string;
}


function StatsCard({ title, value, icon, description, className, trend }: StatsCardProps & { className?: string, trend?: 'up' | 'down' | 'neutral' }) {
    const isCurrency =
        title.toLowerCase().includes('penjualan') ||
        title.toLowerCase().includes('pembelian') ||
        title.toLowerCase().includes('laba') ||
        title.toLowerCase().includes('pengeluaran') ||
        title.toLowerCase().includes('total bayar');

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    let formattedValue: string;

    if (typeof numValue === 'number' && !isNaN(numValue)) {
        if (isCurrency) {
            formattedValue = `Rp ${numValue.toLocaleString('id-ID')}`;
        } else {
            formattedValue = numValue.toLocaleString('id-ID');
        }
    } else {
        formattedValue = String(value);
    }

    // Determine icon color based on card type
    const getIconColor = () => {
        if (title.toLowerCase().includes('laba')) return 'text-emerald-600';
        if (title.toLowerCase().includes('pengeluaran') || title.toLowerCase().includes('stok rendah')) return 'text-rose-600';
        if (title.toLowerCase().includes('penjualan')) return 'text-blue-600';
        if (title.toLowerCase().includes('pembelian')) return 'text-violet-600';
        if (title.toLowerCase().includes('stok')) return 'text-amber-600';
        if (title.toLowerCase().includes('transaksi') || title.toLowerCase().includes('service')) return 'text-cyan-600';
        return 'text-slate-600';
    };

    const getIconBg = () => {
        if (title.toLowerCase().includes('laba')) return 'bg-emerald-50 dark:bg-emerald-950/50';
        if (title.toLowerCase().includes('pengeluaran') || title.toLowerCase().includes('stok rendah')) return 'bg-rose-50 dark:bg-rose-950/50';
        if (title.toLowerCase().includes('penjualan')) return 'bg-blue-50 dark:bg-blue-950/50';
        if (title.toLowerCase().includes('pembelian')) return 'bg-violet-50 dark:bg-violet-950/50';
        if (title.toLowerCase().includes('stok')) return 'bg-amber-50 dark:bg-amber-950/50';
        if (title.toLowerCase().includes('transaksi') || title.toLowerCase().includes('service')) return 'bg-cyan-50 dark:bg-cyan-950/50';
        return 'bg-slate-50 dark:bg-slate-950/50';
    };

    return (
        <Card className={cn(
            "group relative overflow-hidden border-0 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-all duration-200",
            className
        )}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-1 flex-1">
                    <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {title}
                    </CardTitle>
                </div>
                <div className={cn(
                    "p-2.5 rounded-xl transition-transform group-hover:scale-110",
                    getIconBg(),
                    getIconColor()
                )}>
                    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, {
                        className: "h-5 w-5",
                        strokeWidth: 2
                    }) : icon}
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {formattedValue}
                </div>
                {description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface Props {
    role?: 'super_admin' | 'owner' | 'admin_cabang';
    stats: Record<string, number>;
    grafik_penjualan?: Array<{ tanggal: string; total: number }>;
    grafik_keuangan?: Array<{ tanggal: string; penjualan: number; pembelian: number; laba_kotor: number; laba_bersih: number }>;
    top_cabang?: Array<{ nama_cabang: string; kota: string; total_penjualan: number }>;
    top_barang?: Array<{ nama_barang: string; total_terjual: number }>;
    transaksi_terbaru?: Array<{ kode_transaksi: string; tanggal_transaksi: string; total_bayar: number; metode_pembayaran: string; kasir: string }>;
}

export default function Dashboard({
    role,
    stats = {},
    grafik_penjualan = [],
    grafik_keuangan = [],
    top_cabang = [],
    top_barang = [],
    transaksi_terbaru = []
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-8 shadow-lg">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
                            <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">
                                {role === 'super_admin' && 'System Administrator'}
                                {role === 'owner' && 'Business Owner'}
                                {role === 'admin_cabang' && 'Branch Manager'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            Selamat Datang Kembali!
                        </h1>
                        <p className="text-blue-50 text-base max-w-2xl leading-relaxed">
                            {role === 'super_admin' && 'Kelola seluruh aspek sistem dan monitor performa bisnis secara menyeluruh.'}
                            {role === 'owner' && 'Pantau performa bisnis dan keuangan Anda secara real-time dengan insight yang actionable.'}
                            {role === 'admin_cabang' && 'Kelola operasional harian cabang dengan efisien dan monitor performa tim Anda.'}
                        </p>
                    </div>

                    {/* Subtle decorative elements */}
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-indigo-400/10 blur-2xl" />
                </div>

                {/* Stats Cards */}
                {role === 'super_admin' && (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <StatsCard title="Total Cabang" value={stats.total_cabang} icon={<Store />} />
                        <StatsCard title="Total User" value={stats.total_user} icon={<Users />} />
                        <StatsCard title="Total Barang" value={stats.total_barang} icon={<Package />} />
                        <StatsCard title="Total Stok" value={stats.total_stok} icon={<Package />} />
                        <StatsCard title="Penjualan Hari Ini" value={stats.penjualan_hari_ini} icon={<DollarSign />} />
                        <StatsCard title="Penjualan Bulan Ini" value={stats.penjualan_bulan_ini} icon={<TrendingUp />} />
                    </div>
                )}

                {role === 'owner' && (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard title="Penjualan Hari Ini" value={stats.penjualan_hari_ini} icon={<DollarSign />} />
                        <StatsCard title="Penjualan Bulan Ini" value={stats.penjualan_bulan_ini} icon={<TrendingUp />} />
                        <StatsCard title="Laba Kotor Bulan Ini" value={stats.laba_kotor_bulan_ini} icon={<DollarSign />} description="Dari penjualan" />
                        <StatsCard title="Laba Bersih Bulan Ini" value={stats.laba_bersih_bulan_ini} icon={<DollarSign />} description="Setelah biaya" />
                        <StatsCard title="Pembelian Bulan Ini" value={stats.pembelian_bulan_ini} icon={<ShoppingCart />} />
                        <StatsCard title="Pengeluaran Bulan Ini" value={stats.pengeluaran_bulan_ini} icon={<ShoppingCart />} />
                        <StatsCard title="Total Stok" value={stats.total_stok} icon={<Package />} />
                        <StatsCard title="Stok Rendah" value={stats.stok_rendah} icon={<AlertTriangle />} />
                    </div>
                )}

                {role === 'admin_cabang' && (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <StatsCard title="Penjualan Hari Ini" value={stats.penjualan_hari_ini} icon={<DollarSign />} />
                        <StatsCard title="Penjualan Bulan Ini" value={stats.penjualan_bulan_ini} icon={<TrendingUp />} />
                        <StatsCard title="Transaksi Hari Ini" value={stats.transaksi_hari_ini} icon={<ShoppingCart />} />
                        <StatsCard title="Service Aktif" value={stats.service_aktif} icon={<Wrench />} />
                        <StatsCard title="Stok Cabang" value={stats.stok_cabang} icon={<Package />} />
                        <StatsCard title="Stok Rendah" value={stats.stok_rendah} icon={<AlertTriangle />} />
                    </div>
                )}

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                    {(role === 'super_admin' || role === 'admin_cabang') && grafik_penjualan.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Grafik Penjualan (7 Hari Terakhir)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={grafik_penjualan}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="tanggal" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                                        <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {role === 'owner' && grafik_keuangan.length > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Grafik Keuangan (7 Hari Terakhir)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={grafik_keuangan}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="tanggal" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                                        <Legend />
                                        <Bar dataKey="penjualan" fill="#82ca9d" name="Penjualan" />
                                        <Bar dataKey="pembelian" fill="#ff7675" name="Pembelian" />
                                        <Bar dataKey="laba_kotor" fill="#74b9ff" name="Laba Kotor" />
                                        <Bar dataKey="laba_bersih" fill="#0984e3" name="Laba Bersih" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {role === 'super_admin' && top_cabang.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Top 5 Cabang (Bulan Ini)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {top_cabang.map((cabang, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{cabang.nama_cabang}</p>
                                                <p className="text-xs text-muted-foreground">{cabang.kota}</p>
                                            </div>
                                            <p className="font-semibold">
                                                Rp {cabang.total_penjualan.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {(role === 'owner' || role === 'admin_cabang') && top_barang.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Top 5 Barang Terlaris (Bulan Ini)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {top_barang.map((barang, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <p className="font-medium">{barang.nama_barang}</p>
                                            <p className="font-semibold">
                                                {barang.total_terjual} unit
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {role === 'admin_cabang' && transaksi_terbaru.length > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Transaksi Terbaru</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {transaksi_terbaru.map((trx, index) => (
                                        <div key={index} className="flex items-center justify-between border-b pb-3">
                                            <div>
                                                <p className="font-medium">{trx.kode_transaksi}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(trx.tanggal_transaksi).toLocaleString('id-ID')} • {trx.kasir}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    Rp {trx.total_bayar.toLocaleString('id-ID')}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {trx.metode_pembayaran}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
