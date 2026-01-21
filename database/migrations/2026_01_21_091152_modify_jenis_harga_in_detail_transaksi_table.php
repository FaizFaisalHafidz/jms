<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('detail_transaksi', function (Blueprint $table) {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE detail_transaksi MODIFY COLUMN jenis_harga ENUM('konsumen', 'konter', 'partai') NOT NULL DEFAULT 'konsumen'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('detail_transaksi', function (Blueprint $table) {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE detail_transaksi MODIFY COLUMN jenis_harga ENUM('konsumen', 'konter') NOT NULL DEFAULT 'konsumen'");
        });
    }
};
