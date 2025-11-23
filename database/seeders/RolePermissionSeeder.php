<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            // Master Data
            'kelola-cabang',
            'kelola-suplier',
            'kelola-kategori-barang',
            'kelola-barang',
            'kelola-stok',
            
            // Transaksi
            'kelola-pembelian',
            'kelola-transaksi',
            'kelola-service',
            'kelola-faktur',
            
            // Transfer & Retur
            'buat-transfer-stok',
            'approve-transfer-stok',
            'terima-transfer-stok',
            'kelola-retur',
            'approve-retur',
            
            // Keuangan
            'kelola-pembayaran',
            'kelola-pengeluaran',
            
            // Laporan
            'lihat-laporan-cabang',
            'lihat-laporan-semua-cabang',
            'export-laporan',
            
            // User Management
            'kelola-user',
            'kelola-role',
            
            // Setting
            'kelola-setting',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Roles & Assign Permissions
        
        // 1. Super Admin - Full Access
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // 2. Owner - Read all + approve
        $owner = Role::create(['name' => 'owner']);
        $owner->givePermissionTo([
            'lihat-laporan-semua-cabang',
            'export-laporan',
            'approve-transfer-stok',
            'approve-retur',
        ]);

        // 3. Admin Cabang - Full access untuk cabang sendiri
        $adminCabang = Role::create(['name' => 'admin_cabang']);
        $adminCabang->givePermissionTo([
            'kelola-barang',
            'kelola-stok',
            'kelola-pembelian',
            'kelola-transaksi',
            'kelola-service',
            'kelola-faktur',
            'buat-transfer-stok',
            'terima-transfer-stok',
            'kelola-retur',
            'kelola-pembayaran',
            'kelola-pengeluaran',
            'lihat-laporan-cabang',
            'export-laporan',
        ]);
    }
}
