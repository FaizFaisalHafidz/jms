<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Cabang;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get cabang IDs
        $cabangMitrabatik = Cabang::where('kode_cabang', 'TSK-MTB')->first();
        $cabangBKR = Cabang::where('kode_cabang', 'TSK-BKR')->first();
        $cabangSubang = Cabang::where('kode_cabang', 'SBG-01')->first();

        // 1. Super Admin (tidak terikat cabang)
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@jms',
            'password' => Hash::make('password'),
            'cabang_id' => null,
            'status_aktif' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        // 2. Owner (tidak terikat cabang)
        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@jms',
            'password' => Hash::make('password'),
            'cabang_id' => null,
            'status_aktif' => true,
        ]);
        $owner->assignRole('owner');

        // 3. Admin Cabang Mitrabatik
        $adminMitrabatik = User::create([
            'name' => 'Admin Mitrabatik',
            'email' => 'admin.mitrabatik@jms',
            'password' => Hash::make('password'),
            'cabang_id' => $cabangMitrabatik->id,
            'status_aktif' => true,
        ]);
        $adminMitrabatik->assignRole('admin_cabang');

        // 4. Admin Cabang BKR
        $adminBKR = User::create([
            'name' => 'Admin BKR',
            'email' => 'admin.bkr@jms',
            'password' => Hash::make('password'),
            'cabang_id' => $cabangBKR->id,
            'status_aktif' => true,
        ]);
        $adminBKR->assignRole('admin_cabang');

        // 5. Admin Cabang Subang
        $adminSubang = User::create([
            'name' => 'Admin Subang',
            'email' => 'admin.subang@jms',
            'password' => Hash::make('password'),
            'cabang_id' => $cabangSubang->id,
            'status_aktif' => true,
        ]);
        $adminSubang->assignRole('admin_cabang');
    }
}
