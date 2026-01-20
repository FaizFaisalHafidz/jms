<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceHp extends Model
{
    protected $table = 'service_hp';

    protected $fillable = [
        'nomor_service',
        'tanggal_masuk',
        'cabang_id',
        'nama_pelanggan',
        'telepon_pelanggan',
        'merk_hp',
        'tipe_hp',
        'imei',
        'keluhan',
        'kerusakan',
        'spare_part_diganti',
        'barang_id',
        'jumlah_barang',
        'biaya_spare_part',
        'biaya_jasa',
        'total_biaya',
        'metode_pembayaran',
        'laba_service',
        'status_service',
        'tanggal_selesai',
        'tanggal_diambil',
        'teknisi_id',
        'kasir_id',
        'transaksi_id',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_masuk' => 'datetime',
        'tanggal_selesai' => 'datetime',
        'tanggal_diambil' => 'datetime',
        'biaya_spare_part' => 'integer',
        'biaya_jasa' => 'integer',
        'total_biaya' => 'integer',
        'laba_service' => 'integer',
    ];

    // Relationships
    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }

    public function teknisi(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teknisi_id');
    }

    public function kasir(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kasir_id');
    }

    public function transaksi(): BelongsTo
    {
        return $this->belongsTo(Transaksi::class);
    }
}
