<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cabang extends Model
{
    protected $table = 'cabang';

    protected $fillable = [
        'kode_cabang',
        'nama_cabang',
        'alamat',
        'telepon',
        'kota',
        'provinsi',
        'kode_pos',
        'status_aktif',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
    ];

    // Relationships
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function stokCabang(): HasMany
    {
        return $this->hasMany(StokCabang::class);
    }

    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class);
    }

    public function pembelian(): HasMany
    {
        return $this->hasMany(Pembelian::class);
    }
}
