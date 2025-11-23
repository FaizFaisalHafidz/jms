<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Suplier extends Model
{
    protected $table = 'suplier';

    protected $fillable = [
        'kode_suplier',
        'nama_suplier',
        'nama_perusahaan',
        'alamat',
        'telepon',
        'email',
        'kontak_person',
        'status_aktif',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
    ];

    // Relationships
    public function barang(): HasMany
    {
        return $this->hasMany(Barang::class);
    }

    public function pembelian(): HasMany
    {
        return $this->hasMany(Pembelian::class);
    }
}
