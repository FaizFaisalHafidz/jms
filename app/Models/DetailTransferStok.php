<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailTransferStok extends Model
{
    protected $table = 'detail_transfer_stok';

    public $timestamps = false;

    protected $fillable = [
        'transfer_stok_id',
        'barang_id',
        'jumlah_transfer',
        'jumlah_diterima',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_transfer' => 'integer',
        'jumlah_diterima' => 'integer',
    ];

    // Relationships
    public function transferStok(): BelongsTo
    {
        return $this->belongsTo(TransferStok::class);
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }
}
