<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransferStok extends Model
{
    protected $table = 'transfer_stok';

    protected $fillable = [
        'nomor_transfer',
        'tanggal_transfer',
        'cabang_asal_id',
        'cabang_tujuan_id',
        'status_transfer',
        'total_item',
        'keterangan',
        'dibuat_oleh_id',
        'disetujui_oleh_id',
        'tanggal_disetujui',
        'diterima_oleh_id',
        'tanggal_diterima',
    ];

    protected $casts = [
        'tanggal_transfer' => 'date',
        'tanggal_disetujui' => 'datetime',
        'tanggal_diterima' => 'datetime',
        'total_item' => 'integer',
    ];

    // Relationships
    public function cabangAsal(): BelongsTo
    {
        return $this->belongsTo(Cabang::class, 'cabang_asal_id');
    }

    public function cabangTujuan(): BelongsTo
    {
        return $this->belongsTo(Cabang::class, 'cabang_tujuan_id');
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh_id');
    }

    public function disetujuiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh_id');
    }

    public function diterimaOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diterima_oleh_id');
    }

    public function detailTransferStok(): HasMany
    {
        return $this->hasMany(DetailTransferStok::class);
    }
}
