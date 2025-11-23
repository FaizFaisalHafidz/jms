<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PembayaranHutang extends Model
{
    protected $table = 'pembayaran_hutang';

    public $timestamps = false;

    protected $fillable = [
        'tipe_pembayaran',
        'referensi_id',
        'tanggal_bayar',
        'jumlah_bayar',
        'metode_pembayaran',
        'keterangan',
        'user_id',
    ];

    protected $casts = [
        'tanggal_bayar' => 'date',
        'jumlah_bayar' => 'integer',
        'referensi_id' => 'integer',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Polymorphic relationship helper
    public function getReferensi()
    {
        if ($this->tipe_pembayaran === 'pembelian') {
            return Pembelian::find($this->referensi_id);
        } elseif ($this->tipe_pembayaran === 'faktur') {
            return Faktur::find($this->referensi_id);
        }
        return null;
    }
}
