import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner-layout';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowRight, Package, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';

interface DashboardOwnerProps {
    user: {
        name: string;
        email: string;
    };
}

export default function DashboardOwner({ user }: DashboardOwnerProps) {
    const menuItems = [
        {
            title: 'Laporan Laba Rugi',
            description: 'Lihat tren laba rugi harian dan per cabang',
            icon: TrendingUp,
            href: '/laporan/laba-rugi',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Laporan Penjualan',
            description: 'Monitor omzet dan transaksi penjualan',
            icon: ShoppingCart,
            href: '/laporan/penjualan',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            gradient: 'from-green-500 to-green-600'
        },
        {
            title: 'Laporan Stok',
            description: 'Cek stok barang dan pergerakan inventori',
            icon: Package,
            href: '/laporan/stok',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Laporan Pembelian',
            description: 'Pantau pembelian dan hutang supplier',
            icon: Wallet,
            href: '/laporan/pembelian',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            gradient: 'from-orange-500 to-orange-600'
        }
    ];

    return (
        <OwnerLayout title="Dashboard Owner">
            {/* Welcome Card */}
            <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
                <CardHeader>
                    <CardTitle className="text-2xl">Selamat Datang, {user.name}! 👋</CardTitle>
                    <CardDescription className="text-blue-100">
                        Kelola dan monitor bisnis Anda dengan mudah
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Quick Stats - Optional, bisa ditambahkan nanti dengan data real */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Laporan</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Pilih laporan yang ingin Anda lihat
                </p>
            </div>

            {/* Menu Cards */}
            <div className="grid grid-cols-1 gap-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-gray-300 cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className={cn(
                                                'p-3 rounded-xl',
                                                item.bgColor
                                            )}>
                                                <Icon className={cn('h-6 w-6', item.color)} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Info Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>Gunakan menu navigasi di bawah untuk berpindah halaman</p>
            </div>
        </OwnerLayout>
    );
}
