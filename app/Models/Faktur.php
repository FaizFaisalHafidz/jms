<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Faktur extends Model
{
    protected $table = 'faktur';

    protected $fillable = [
        'nomor_faktur',
        'tanggal_faktur',
        'cabang_id',
        'transaksi_id',
        'nama_pelanggan',
        'telepon_pelanggan',
        'alamat_pelanggan',
        'subtotal',
        'diskon',
        'total_bayar',
        'status_pembayaran',
        'tanggal_jatuh_tempo',
        'keterangan',
        'user_id',
    ];

    protected $casts = [
        'tanggal_faktur' => 'date',
        'tanggal_jatuh_tempo' => 'date',
        'subtotal' => 'integer',
        'diskon' => 'integer',
        'total_bayar' => 'integer',
    ];

    // Relationships
    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
