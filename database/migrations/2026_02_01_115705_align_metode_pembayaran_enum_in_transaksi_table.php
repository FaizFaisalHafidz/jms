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
        // Using raw SQL is often safer for ENUM modifications in MySQL
        DB::statement("ALTER TABLE transaksi MODIFY COLUMN metode_pembayaran ENUM('tunai', 'transfer', 'qris', 'edc', 'split') NOT NULL DEFAULT 'tunai'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting to previous state (assuming it was tunai, transfer, qris) working assumption.
        // BE CAREFUL: If data with 'split' or 'edc' exists, this might fail or truncate.
        // For safety, we only revert if we are sure. But usually down() is for rollback.
        
        // We will just leave it or try to revert to include 'edc' if it was there? 
        // Let's assume we just revert to add 'split' removal.
        // It's risky. But standard practice requires down.
        // DB::statement("ALTER TABLE transaksi MODIFY COLUMN metode_pembayaran ENUM('tunai', 'transfer', 'qris') NOT NULL DEFAULT 'tunai'");
    }
};
