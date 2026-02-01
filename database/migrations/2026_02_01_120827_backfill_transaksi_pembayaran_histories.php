<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Get all transactions that don't have detailed payment records yet
        // We assume transactions without entries in transaksi_pembayaran depend on the 'metode_pembayaran' and 'jumlah_bayar' columns in 'transaksi' table
        
        $transactions = DB::table('transaksi')
            ->leftJoin('transaksi_pembayaran', 'transaksi.id', '=', 'transaksi_pembayaran.transaksi_id')
            ->whereNull('transaksi_pembayaran.id')
            ->select('transaksi.id', 'transaksi.metode_pembayaran', 'transaksi.jumlah_bayar', 'transaksi.created_at', 'transaksi.updated_at')
            ->get();

        $dataToInsert = [];
        $now = now();

        foreach ($transactions as $trx) {
            // Mapping existing payment method to valid enums if needed, or simply copying
            // Assuming old data is valid: 'tunai', 'transfer', 'qris', 'edc'
            // If the old method is 'split' (unlikely for old data), we might need logic, but assume standard single payment.
            
            $metode = $trx->metode_pembayaran;
            // Fallback for safety if somehow empty
            if (empty($metode)) {
                $metode = 'tunai';
            }

            $dataToInsert[] = [
                'transaksi_id' => $trx->id,
                'metode_pembayaran' => $metode,
                'nominal' => $trx->jumlah_bayar,
                'keterangan' => 'Migrasi data historis',
                'created_at' => $trx->created_at,
                'updated_at' => $trx->updated_at,
            ];

            // Insert in chunks to avoid memory issues if dataset is huge
            if (count($dataToInsert) >= 500) {
                DB::table('transaksi_pembayaran')->insert($dataToInsert);
                $dataToInsert = [];
            }
        }

        if (!empty($dataToInsert)) {
            DB::table('transaksi_pembayaran')->insert($dataToInsert);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Ideally we delete records that have 'Migrasi data historis' description
        // content of this method is optional for data migrations
        DB::table('transaksi_pembayaran')
            ->where('keterangan', 'Migrasi data historis')
            ->delete();
    }
};
