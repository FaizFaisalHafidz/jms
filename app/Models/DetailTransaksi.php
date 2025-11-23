<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailTransaksi extends Model
{
    protected $table = 'detail_transaksi';

    public $timestamps = false;

    protected $fillable = [
        'transaksi_id',
        'barang_id',
        'nama_barang',
        'jumlah',
        'harga_asal',
        'harga_jual',
        'jenis_harga',
        'diskon_item',
        'subtotal',
        'laba',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'harga_asal' => 'integer',
        'harga_jual' => 'integer',
        'diskon_item' => 'integer',
        'subtotal' => 'integer',
        'laba' => 'integer',
    ];

    // Relationships
    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class);
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }
}
