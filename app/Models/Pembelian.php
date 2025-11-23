<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pembelian extends Model
{
    protected $table = 'pembelian';

    protected $fillable = [
        'nomor_pembelian',
        'tanggal_pembelian',
        'suplier_id',
        'cabang_id',
        'total_item',
        'subtotal',
        'diskon',
        'ongkos_kirim',
        'total_bayar',
        'status_pembayaran',
        'tanggal_jatuh_tempo',
        'keterangan',
        'user_id',
    ];

    protected $casts = [
        'tanggal_pembelian' => 'date',
        'tanggal_jatuh_tempo' => 'date',
        'total_item' => 'integer',
        'subtotal' => 'integer',
        'diskon' => 'integer',
        'ongkos_kirim' => 'integer',
        'total_bayar' => 'integer',
    ];

    // Relationships
    public function suplier(): BelongsTo
    {
        return $this->belongsTo(Suplier::class);
    }

    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function detailPembelian(): HasMany
    {
        return $this->hasMany(DetailPembelian::class);
    }
}
