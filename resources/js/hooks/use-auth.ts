import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export function useAuth() {
    const { auth } = usePage<PageProps>().props;
    
    const hasRole = (role: string): boolean => {
        return auth.roles?.some(r => r.toLowerCase() === role.toLowerCase()) || false;
    };

    const isOwner = (): boolean => {
        return hasRole('owner');
    };

    const isAdmin = (): boolean => {
        return hasRole('Admin');
    };

    const isKasir = (): boolean => {
        return hasRole('Kasir');
    };

    return {
        user: auth.user,
        roles: auth.roles,
        hasRole,
        isOwner,
        isAdmin,
        isKasir,
    };
}
