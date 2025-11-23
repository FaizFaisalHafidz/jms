import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertTriangle, DollarSign, Package, ShoppingCart, Store, TrendingUp, Users, Wrench } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

function StatsCard({ title, value, icon, description }: StatsCardProps) {
	const isCurrency =
		title.toLowerCase().includes('penjualan') ||
		title.toLowerCase().includes('pembelian') ||
		title.toLowerCase().includes('laba') ||
		title.toLowerCase().includes('pengeluaran');

	// Ensure value is a number
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

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{formattedValue}</div>
				{description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        {role === 'super_admin' && 'Overview sistem keseluruhan'}
                        {role === 'owner' && 'Monitoring bisnis dan keuangan'}
                        {role === 'admin_cabang' && 'Monitoring operasional cabang'}
                    </p>
                </div>

                {/* Stats Cards */}
                {role === 'super_admin' && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <StatsCard title="Total Cabang" value={stats.total_cabang} icon={<Store className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Total User" value={stats.total_user} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Total Barang" value={stats.total_barang} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Total Stok" value={stats.total_stok} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Penjualan Hari Ini" value={stats.penjualan_hari_ini} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Penjualan Bulan Ini" value={stats.penjualan_bulan_ini} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
                    </div>
                )}

                {role === 'owner' && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard title="Penjualan Hari Ini" value={stats.penjualan_hari_ini} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Penjualan Bulan Ini" value={stats.penjualan_bulan_ini} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Laba Kotor Bulan Ini" value={stats.laba_kotor_bulan_ini} icon={<DollarSign className="h-4 w-4 text-blue-600" />} description="Dari penjualan" />
                        <StatsCard title="Laba Bersih Bulan Ini" value={stats.laba_bersih_bulan_ini} icon={<DollarSign className="h-4 w-4 text-green-600" />} description="Setelah biaya" />
                        <StatsCard title="Pembelian Bulan Ini" value={stats.pembelian_bulan_ini} icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Pengeluaran Bulan Ini" value={stats.pengeluaran_bulan_ini} icon={<ShoppingCart className="h-4 w-4 text-red-600" />} />
                        <StatsCard title="Total Stok" value={stats.total_stok} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Stok Rendah" value={stats.stok_rendah} icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />} />
                    </div>
                )}

                {role === 'admin_cabang' && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <StatsCard title="Penjualan Hari Ini" value={stats.penjualan_hari_ini} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Penjualan Bulan Ini" value={stats.penjualan_bulan_ini} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Transaksi Hari Ini" value={stats.transaksi_hari_ini} icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Service Aktif" value={stats.service_aktif} icon={<Wrench className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Stok Cabang" value={stats.stok_cabang} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
                        <StatsCard title="Stok Rendah" value={stats.stok_rendah} icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />} />
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
