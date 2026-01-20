import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OwnerLayout from '@/layouts/owner-layout';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    FileText,
    Package,
    Settings,
    ShoppingCart,
    TrendingUp,
    Users,
    Wallet,
    Wrench
} from 'lucide-react';

interface DashboardOwnerProps {
    user: {
        name: string;
        email: string;
    };
}

export default function DashboardOwner({ user }: DashboardOwnerProps) {
    const menuItems = [
        {
            title: 'Laba Rugi',
            icon: TrendingUp,
            href: '/laporan/laba-rugi',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Penjualan',
            icon: ShoppingCart,
            href: '/laporan/penjualan',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            gradient: 'from-green-500 to-green-600'
        },
        {
            title: 'Stok Barang',
            icon: Package,
            href: '/laporan/stok',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            gradient: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Pembelian',
            icon: Wallet,
            href: '/laporan/pembelian',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            gradient: 'from-orange-500 to-orange-600'
        },
    ];

    return (
        <OwnerLayout title="Dashboard Owner">
            {/* Welcome Card */}
            <Card className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Hai, {user.name}! 👋</CardTitle>
                    <CardDescription className="text-blue-100 text-sm">
                        Kelola bisnis Anda dengan mudah
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Section Title */}
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">Menu Utama</h2>
                <p className="text-xs text-gray-600 mt-1">
                    Pilih menu yang ingin Anda akses
                </p>
            </div>

            {/* Grid Menu - Mobile App Style */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
                                <div className={cn(
                                    'p-2 rounded-lg mb-1.5 transition-transform group-hover:scale-110',
                                    item.bgColor
                                )}>
                                    <Icon className={cn('h-5 w-5', item.color)} />
                                </div>
                                <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                                    {item.title}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Access Section */}
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">Akses Cepat</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Link href="/laporan/laba-rugi">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-white/20">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-100">Laporan</p>
                                    <p className="text-sm font-semibold text-white">Laba Rugi</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/laporan/penjualan">
                    <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-white/20">
                                    <ShoppingCart className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-green-100">Laporan</p>
                                    <p className="text-sm font-semibold text-white">Penjualan</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </OwnerLayout>
    );
}
