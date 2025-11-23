import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

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
}

interface Role {
    value: string;
    label: string;
}

interface Cabang {
    value: number;
    label: string;
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    roles: Role[];
    cabangs: Cabang[];
}

export function UserFormModal({ isOpen, onClose, user, roles, cabangs }: UserFormModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        cabang_id: '',
        status_aktif: true,
    });

    useEffect(() => {
        if (user) {
            setData({
                name: user.name,
                email: user.email,
                password: '',
                password_confirmation: '',
                role: user.roles[0] || '',
                cabang_id: user.cabang?.id.toString() || '',
                status_aktif: user.status_aktif,
            });
        } else {
            reset();
        }
    }, [user, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (user) {
            put(`/users/${user.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post('/users', {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {user ? 'Edit Pengguna' : 'Tambah Pengguna'}
                        </DialogTitle>
                        <DialogDescription>
                            {user
                                ? 'Perbarui informasi pengguna'
                                : 'Tambahkan pengguna baru ke dalam sistem'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nama <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Masukkan nama lengkap"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Masukkan email"
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password {!user && <span className="text-red-500">*</span>}
                                {user && <span className="text-xs text-muted-foreground"> (Kosongkan jika tidak ingin mengubah)</span>}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan password"
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Konfirmasi Password {!user && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Masukkan ulang password"
                                className={errors.password_confirmation ? 'border-red-500' : ''}
                            />
                            {errors.password_confirmation && (
                                <p className="text-sm text-red-500">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Role <span className="text-red-500">*</span>
                            </Label>
                            <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Pilih role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-500">{errors.role}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cabang_id">
                                Cabang {data.role === 'admin_cabang' && <span className="text-red-500">*</span>}
                            </Label>
                            <Select
                                value={data.cabang_id}
                                onValueChange={(value) => setData('cabang_id', value)}
                            >
                                <SelectTrigger className={errors.cabang_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Pilih cabang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cabangs.map((cabang) => (
                                        <SelectItem
                                            key={cabang.value}
                                            value={cabang.value.toString()}
                                        >
                                            {cabang.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {data.role === 'admin_cabang' 
                                    ? 'Wajib pilih cabang untuk Admin Cabang'
                                    : 'Opsional untuk role selain Admin Cabang'}
                            </p>
                            {errors.cabang_id && (
                                <p className="text-sm text-red-500">{errors.cabang_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status_aktif">
                                Status <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.status_aktif.toString()}
                                onValueChange={(value) => setData('status_aktif', value === 'true')}
                            >
                                <SelectTrigger
                                    className={errors.status_aktif ? 'border-red-500' : ''}
                                >
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Aktif</SelectItem>
                                    <SelectItem value="false">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status_aktif && (
                                <p className="text-sm text-red-500">{errors.status_aktif}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
