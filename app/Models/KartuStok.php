<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KartuStok extends Model
{
    protected $table = 'kartu_stok';

    public $timestamps = false;

    protected $fillable = [
        'barang_id',
        'cabang_id',
        'tanggal',
        'jenis_transaksi',
        'nomor_referensi',
        'jumlah',
        'stok_sebelum',
        'stok_sesudah',
        'keterangan',
        'user_id',
    ];

    protected $casts = [
        'tanggal' => 'datetime',
        'jumlah' => 'integer',
        'stok_sebelum' => 'integer',
        'stok_sesudah' => 'integer',
    ];

    // Relationships
    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }

    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
