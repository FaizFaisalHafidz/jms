<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HargaCabang extends Model
{
    protected $table = 'harga_cabang';

    protected $fillable = [
        'barang_id',
        'cabang_id',
        'harga_konsumen',
        'harga_konter',
        'harga_partai',
    ];

    protected $casts = [
        'harga_konsumen' => 'integer',
        'harga_konter' => 'integer',
        'harga_partai' => 'integer',
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
