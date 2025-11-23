<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StokCabang extends Model
{
    protected $table = 'stok_cabang';

    protected $fillable = [
        'barang_id',
        'cabang_id',
        'jumlah_stok',
        'stok_minimal',
        'lokasi_rak',
    ];

    protected $casts = [
        'jumlah_stok' => 'integer',
        'stok_minimal' => 'integer',
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
}
