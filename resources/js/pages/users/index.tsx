import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Plus, Users as UsersIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserFormModal } from './partials/user-form-modal';
import { UserStats } from './partials/user-stats';
import { UserTable } from './partials/user-table';

interface User {
    id: number;
    name: string;
    email: string;
    cabang: {
        id: number;
        nama_cabang: string;
    } | null;
    roles: string[];
    status_aktif: boolean;
    created_at: string;
}

interface Role {
    value: string;
    label: string;
}

interface Cabang {
    value: number;
    label: string;
}

interface UserIndexProps extends PageProps {
    users: User[];
    roles: Role[];
    cabangs: Cabang[];
    stats: {
        total: number;
        aktif: number;
        nonaktif: number;
    };
}

export default function UserIndex({ users, roles, cabangs, stats, flash }: UserIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    return (
        <AppLayout>
            <Head title="Manajemen Pengguna" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Manajemen Pengguna"
                        description="Kelola data pengguna sistem"
                        icon={UsersIcon}
                    />
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pengguna
                    </Button>
                </div>

                <UserStats stats={stats} />

                <UserTable data={users} onEdit={handleEdit} />

                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    user={editingUser}
                    roles={roles}
                    cabangs={cabangs}
                />
            </div>
        </AppLayout>
    );
}
