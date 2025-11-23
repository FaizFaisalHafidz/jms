<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriBarang extends Model
{
    protected $table = 'kategori_barang';

    protected $fillable = [
        'nama_kategori',
        'deskripsi',
        'status_aktif',
    ];

    protected $casts = [
        'status_aktif' => 'boolean',
    ];

    // Relationships
    public function barang(): HasMany
    {
        return $this->hasMany(Barang::class, 'kategori_id');
    }
}
