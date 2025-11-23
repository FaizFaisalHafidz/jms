<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barang extends Model
{
    protected $table = 'barang';

    protected $fillable = [
        'kategori_id',
        'suplier_id',
        'kode_barang',
        'nama_barang',
        'barcode',
        'merk',
        'tipe',
        'satuan',
        'harga_asal',
        'harga_konsumen',
        'harga_konter',
        'stok_minimal',
        'deskripsi',
        'foto_barang',
        'status_aktif',
    ];

    protected $casts = [
        'harga_asal' => 'integer',
        'harga_konsumen' => 'integer',
        'harga_konter' => 'integer',
        'stok_minimal' => 'integer',
        'status_aktif' => 'boolean',
    ];

    // Relationships
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_id');
    }

    public function suplier(): BelongsTo
    {
        return $this->belongsTo(Suplier::class, 'suplier_id');
    }

    public function stokCabang(): HasMany
    {
        return $this->hasMany(StokCabang::class);
    }

    public function detailTransaksi(): HasMany
    {
        return $this->hasMany(DetailTransaksi::class);
    }

    public function detailPembelian(): HasMany
    {
        return $this->hasMany(DetailPembelian::class);
    }
}
