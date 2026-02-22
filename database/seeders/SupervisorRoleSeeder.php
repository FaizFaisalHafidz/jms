<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class SupervisorRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create supervisor role
        $supervisorRole = Role::firstOrCreate(['name' => 'supervisor']);

        // Define permissions for supervisor
        $permissions = [
            'view dashboard',
            'manage stock permission',
            'manage harga cabang',
            'manage kategori barang',
        ];

        // Create permissions if not exist
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to supervisor role
        $supervisorRole->syncPermissions($permissions);

        $this->command->info('Supervisor role created with permissions!');
    }
}
