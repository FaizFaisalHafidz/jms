<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Transaksi extends Model
{
    protected $table = 'transaksi';

    protected $fillable = [
        'nomor_transaksi',
        'tanggal_transaksi',
        'cabang_id',
        'jenis_transaksi',
        'nama_pelanggan',
        'telepon_pelanggan',
        'subtotal',
        'diskon',
        'biaya_service',
        'total_bayar',
        'metode_pembayaran',
        'jumlah_bayar',
        'kembalian',
        'total_laba',
        'keterangan',
        'status_transaksi',
        'kasir_id',
    ];

    protected $casts = [
        'tanggal_transaksi' => 'datetime',
        'subtotal' => 'integer',
        'diskon' => 'integer',
        'biaya_service' => 'integer',
        'total_bayar' => 'integer',
        'jumlah_bayar' => 'integer',
        'kembalian' => 'integer',
        'total_laba' => 'integer',
    ];

    // Relationships
    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function kasir(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kasir_id');
    }

    public function detailTransaksi(): HasMany
    {
        return $this->hasMany(DetailTransaksi::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailTransaksi::class);
    }

    public function serviceHp(): HasOne
    {
        return $this->hasOne(ServiceHp::class);
    }

    public function faktur(): HasOne
    {
        return $this->hasOne(Faktur::class);
    }
}
