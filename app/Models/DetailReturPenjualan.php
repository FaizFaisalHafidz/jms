<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailReturPenjualan extends Model
{
    protected $table = 'detail_retur_penjualan';

    public $timestamps = false;

    protected $fillable = [
        'retur_penjualan_id',
        'detail_transaksi_id',
        'barang_id',
        'jumlah_retur',
        'harga_jual',
        'subtotal',
        'kondisi_barang',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_retur' => 'integer',
        'harga_jual' => 'integer',
        'subtotal' => 'integer',
    ];

    // Relationships
    public function returPenjualan(): BelongsTo
    {
        return $this->belongsTo(ReturPenjualan::class);
    }

    public function detailTransaksi(): BelongsTo
    {
        return $this->belongsTo(DetailTransaksi::class);
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }
}
