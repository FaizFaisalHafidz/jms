import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Box,
    Building2,
    ClipboardList,
    FileText,
    LayoutGrid,
    Package,
    PackageSearch,
    Settings,
    ShoppingCart,
    Store,
    TrendingUp,
    Truck,
    Users,
    Wallet,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const roles = auth.roles || [];

    // Menu dasar untuk semua pengguna
    const dashboardMenu: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Menu untuk Super Admin
    const superAdminMenu: NavItem[] = [
        {
            title: 'Cabang',
            href: '/cabang',
            icon: Building2,
        },
        {
            title: 'Pengguna',
            href: '/users',
            icon: Users,
        },
        {
            title: 'Supplier',
            href: '/supplier',
            icon: Truck,
        },
        {
            title: 'Kategori Barang',
            href: '/kategori-barang',
            icon: Box,
        },
        // {
        //     title: 'Barang',
        //     href: '/barang',
        //     icon: Package,
        // },
        // {
        //     title: 'Pembelian',
        //     href: '/pembelian',
        //     icon: ShoppingCart,
        // },
        // {
        //     title: 'Point of Sale',
        //     href: '/pos',
        //     icon: Store,
        // },
        // {
        //     title: 'Service HP',
        //     href: '/service',
        //     icon: Wrench,
        // },
        // {
        //     title: 'Faktur',
        //     href: '/faktur',
        //     icon: FileText,
        // },
        // {
        //     title: 'Transfer Stok',
        //     href: '/transfer-stok',
        //     icon: PackageSearch,
        // },
        // {
        //     title: 'Retur',
        //     href: '/retur',
        //     icon: ClipboardList,
        // },
        // {
        //     title: 'Pengeluaran',
        //     href: '/pengeluaran',
        //     icon: Wallet,
        // },
        {
            title: 'Laporan',
            href: '/laporan',
            icon: BarChart3,
        },
        {
            title: 'Setting',
            href: '/setting',
            icon: Settings,
        },
    ];

    // Menu untuk Owner
    const ownerMenu: NavItem[] = [
        {
            title: 'Laporan Penjualan',
            href: '/laporan/penjualan',
            icon: TrendingUp,
        },
        {
            title: 'Laporan Pembelian',
            href: '/laporan/pembelian',
            icon: ShoppingCart,
        },
        {
            title: 'Laporan Laba Rugi',
            href: '/laporan/laba-rugi',
            icon: BarChart3,
        },
        {
            title: 'Laporan Stok',
            href: '/laporan/stok',
            icon: PackageSearch,
        }
        // {
        //     title: 'Transfer Stok',
        //     href: '/transfer-stok',
        //     icon: PackageSearch,
        // },
        // {
        //     title: 'Retur',
        //     href: '/retur',
        //     icon: ClipboardList,
        // },
    ];

    // Menu untuk Admin Cabang
    const adminCabangMenu: NavItem[] = [
        {
            title: 'Barang',
            href: '/barang',
            icon: Package,
        },
        {
            title: 'Pembelian',
            href: '/pembelian',
            icon: ShoppingCart,
        },
        {
            title: 'Point of Sale',
            href: '/pos',
            icon: Store,
        },
        {
            title: 'Service HP',
            href: '/service',
            icon: Wrench,
        },
        {
            title: 'Faktur',
            href: '/faktur',
            icon: FileText,
        },
        {
            title: 'Transfer Stok',
            href: '/transfer-stok',
            icon: PackageSearch,
        },
        {
            title: 'Retur',
            href: '/retur-penjualan',
            icon: ClipboardList,
        },
        {
            title: 'Pengeluaran',
            href: '/pengeluaran',
            icon: Wallet,
        },
        {
            title: 'Laporan Cabang',
            href: '/laporan/cabang',
            icon: BarChart3,
        },
    ];

    // Menentukan menu yang akan ditampilkan berdasarkan role
    let mainNavItems = [...dashboardMenu];

    if (roles.includes('super_admin')) {
        mainNavItems = [...mainNavItems, ...superAdminMenu];
    } else if (roles.includes('owner')) {
        mainNavItems = [...mainNavItems, ...ownerMenu];
    } else if (roles.includes('admin_cabang')) {
        mainNavItems = [...mainNavItems, ...adminCabangMenu];
    }

    const footerNavItems: NavItem[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
