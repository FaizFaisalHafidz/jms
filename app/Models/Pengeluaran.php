<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';

    protected $fillable = [
        'nomor_pengeluaran',
        'tanggal_pengeluaran',
        'cabang_id',
        'kategori_pengeluaran',
        'jumlah',
        'keterangan',
        'bukti_pengeluaran',
        'user_id',
    ];

    protected $casts = [
        'tanggal_pengeluaran' => 'date',
        'jumlah' => 'integer',
    ];

    // Relationships
    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
