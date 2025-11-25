import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import OwnerLayout from '@/layouts/owner-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface LaporanLayoutProps {
    children: ReactNode;
    title: string;
    breadcrumbs?: BreadcrumbItem[];
}

export default function LaporanLayout({ children, title, breadcrumbs }: LaporanLayoutProps) {
    const { isOwner } = useAuth();

    if (isOwner()) {
        return (
            <OwnerLayout title={title}>
                {children}
            </OwnerLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {children}
        </AppLayout>
    );
}
