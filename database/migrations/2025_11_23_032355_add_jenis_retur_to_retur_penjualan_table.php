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
        Schema::table('retur_penjualan', function (Blueprint $table) {
            $table->enum('jenis_retur', ['uang_kembali', 'ganti_barang'])->default('uang_kembali')->after('alasan_retur');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('retur_penjualan', function (Blueprint $table) {
            $table->dropColumn('jenis_retur');
        });
    }
};
