<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReturPenjualan extends Model
{
    protected $table = 'retur_penjualan';

    protected $fillable = [
        'nomor_retur',
        'tanggal_retur',
        'transaksi_id',
        'cabang_id',
        'total_item',
        'total_nilai_retur',
        'alasan_retur',
        'jenis_retur',
        'status_retur',
        'disetujui_oleh_id',
        'kasir_id',
    ];

    protected $casts = [
        'tanggal_retur' => 'date',
        'total_item' => 'integer',
        'total_nilai_retur' => 'integer',
    ];

    // Relationships
    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class);
    }

    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function disetujuiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh_id');
    }

    public function kasir(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kasir_id');
    }

    public function detailReturPenjualan(): HasMany
    {
        return $this->hasMany(DetailReturPenjualan::class);
    }
}
