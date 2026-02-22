import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Lock, LockOpen, Settings, Save, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Cabang {
    id: number;
    kode_cabang: string;
    nama_cabang: string;
    alamat: string;
    kota: string;
    status_aktif: boolean;
    can_manage_stock: boolean;
}

interface StockPermissionProps extends PageProps {
    cabangs: Cabang[];
}

export default function StockPermission({ cabangs, flash }: StockPermissionProps) {
    const [permissions, setPermissions] = useState<Record<number, boolean>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize permissions state
    useEffect(() => {
        const initialPermissions: Record<number, boolean> = {};
        cabangs.forEach((cabang) => {
            initialPermissions[cabang.id] = cabang.can_manage_stock;
        });
        setPermissions(initialPermissions);
    }, [cabangs]);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            setHasChanges(false);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const togglePermission = (cabangId: number) => {
        setPermissions((prev) => ({
            ...prev,
            [cabangId]: !prev[cabangId],
        }));
        setHasChanges(true);
    };

    const handleSaveAll = () => {
        setIsSaving(true);

        const updates = cabangs
            .filter((cabang) => cabang.can_manage_stock !== permissions[cabang.id])
            .map((cabang) => ({
                cabang_id: cabang.id,
                can_manage_stock: permissions[cabang.id],
            }));

        if (updates.length === 0) {
            toast.info('Tidak ada perubahan untuk disimpan');
            setIsSaving(false);
            return;
        }

        router.post(
            '/super-admin/stock-permission/batch',
            { updates },
            {
                onSuccess: () => {
                    setIsSaving(false);
                },
                onError: () => {
                    setIsSaving(false);
                    toast.error('Gagal menyimpan perubahan');
                },
            }
        );
    };

    const handleReset = () => {
        const initialPermissions: Record<number, boolean> = {};
        cabangs.forEach((cabang) => {
            initialPermissions[cabang.id] = cabang.can_manage_stock;
        });
        setPermissions(initialPermissions);
        setHasChanges(false);
        toast.info('Perubahan dibatalkan');
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Permission Stok Cabang" />

            <div className="space-y-6 p-6">
                <Heading
                    title="Pengaturan Permission Stok Cabang"
                    description="Atur izin cabang untuk mengelola stok barang. Hanya cabang yang diaktifkan yang dapat melakukan transaksi yang mempengaruhi stok."
                    icon={Settings}
                />

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cabang</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cabangs.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dapat Kelola Stok</CardTitle>
                            <LockOpen className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {Object.values(permissions).filter((p) => p).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Terkunci</CardTitle>
                            <Lock className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {Object.values(permissions).filter((p) => !p).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                {hasChanges && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-medium text-orange-900">Ada perubahan yang belum disimpan</p>
                                <p className="text-sm text-orange-700">
                                    Klik "Simpan Semua Perubahan" untuk menyimpan atau "Batal" untuk reset
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                                    Batal
                                </Button>
                                <Button onClick={handleSaveAll} disabled={isSaving}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Cabang List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Cabang</CardTitle>
                        <CardDescription>
                            Toggle switch untuk mengaktifkan/menonaktifkan izin kelola stok per cabang
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {cabangs.map((cabang) => (
                                <div
                                    key={cabang.id}
                                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-semibold">{cabang.nama_cabang}</h4>
                                            <Badge variant="secondary">{cabang.kode_cabang}</Badge>
                                            {!cabang.status_aktif && (
                                                <Badge variant="destructive">Non-Aktif</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {cabang.alamat}, {cabang.kota}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            {permissions[cabang.id] ? (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <LockOpen className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Dapat Kelola Stok</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-600">
                                                    <Lock className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Terkunci</span>
                                                </div>
                                            )}
                                        </div>

                                        <Switch
                                            checked={permissions[cabang.id] || false}
                                            onCheckedChange={() => togglePermission(cabang.id)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {cabangs.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Belum ada data cabang</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-900">Informasi</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-800 space-y-2">
                        <p>
                            <strong>• Dapat Kelola Stok:</strong> Cabang dapat melakukan transaksi yang mempengaruhi
                            stok (penjualan, transfer, pembelian, dll)
                        </p>
                        <p>
                            <strong>• Terkunci:</strong> Cabang tidak dapat melakukan transaksi yang mempengaruhi
                            stok. Hanya Super Admin yang dapat mengatur stok.
                        </p>
                        <p>
                            <strong>• Super Admin:</strong> Selalu memiliki akses penuh untuk mengelola stok di semua
                            cabang, terlepas dari pengaturan ini.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
