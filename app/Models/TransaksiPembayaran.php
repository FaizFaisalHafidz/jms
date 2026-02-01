<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiPembayaran extends Model
{
    protected $table = 'transaksi_pembayaran';

    protected $fillable = [
        'transaksi_id',
        'metode_pembayaran',
        'nominal',
        'keterangan',
    ];

    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class);
    }
}
