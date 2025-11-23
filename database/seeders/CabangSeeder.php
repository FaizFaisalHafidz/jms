<?php

namespace Database\Seeders;

use App\Models\Cabang;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CabangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cabangs = [
            [
                'kode_cabang' => 'TSK-MTB',
                'nama_cabang' => 'Tasik Mitrabatik',
                'alamat' => 'Jl. Mitrabatik No. 123',
                'telepon' => '0265-123456',
                'kota' => 'Tasikmalaya',
                'provinsi' => 'Jawa Barat',
                'kode_pos' => '46123',
                'status_aktif' => true,
            ],
            [
                'kode_cabang' => 'TSK-BKR',
                'nama_cabang' => 'Tasik BKR',
                'alamat' => 'Jl. BKR No. 456',
                'telepon' => '0265-654321',
                'kota' => 'Tasikmalaya',
                'provinsi' => 'Jawa Barat',
                'kode_pos' => '46124',
                'status_aktif' => true,
            ],
            [
                'kode_cabang' => 'SBG-01',
                'nama_cabang' => 'Subang',
                'alamat' => 'Jl. Raya Subang No. 789',
                'telepon' => '0260-987654',
                'kota' => 'Subang',
                'provinsi' => 'Jawa Barat',
                'kode_pos' => '41211',
                'status_aktif' => true,
            ],
        ];

        foreach ($cabangs as $cabang) {
            Cabang::create($cabang);
        }
    }
}
