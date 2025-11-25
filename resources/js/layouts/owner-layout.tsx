import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { Home, LogOut, Package, ShoppingBag, ShoppingCart, TrendingUp } from 'lucide-react';
import { type ReactNode, useState } from 'react';

interface OwnerLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function OwnerLayout({ children, title }: OwnerLayoutProps) {
    const { url } = usePage();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    
    const navItems = [
        {
            name: 'Beranda',
            href: '/owner/dashboard',
            icon: Home,
            active: url === '/owner/dashboard' || url === '/'
        },
        {
            name: 'Laba Rugi',
            href: '/laporan/laba-rugi',
            icon: TrendingUp,
            active: url.startsWith('/laporan/laba-rugi')
        },
        {
            name: 'Penjualan',
            href: '/laporan/penjualan',
            icon: ShoppingCart,
            active: url.startsWith('/laporan/penjualan')
        },
        {
            name: 'Pembelian',
            href: '/laporan/pembelian',
            icon: ShoppingBag,
            active: url.startsWith('/laporan/pembelian')
        },
        {
            name: 'Stok',
            href: '/laporan/stok',
            icon: Package,
            active: url.startsWith('/laporan/stok')
        }
    ];
    const handleLogout = () => {
        router.post('/logout');
    };

    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">
                            {title || 'Dashboard Owner'}
                        </h1>
                        <p className="text-xs text-gray-500">Jayamaksmur SPT</p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleLogoutClick}
                        className="text-gray-600 hover:text-red-600"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20">
                <div className="container mx-auto p-4 max-w-7xl">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
                <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors',
                                    item.active
                                        ? 'text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin keluar dari aplikasi?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                            Ya, Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
