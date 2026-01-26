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
        Schema::table('barang', function (Blueprint $table) {
            // Add indexes for frequently queried columns
            $table->index('nama_barang', 'idx_barang_nama');
            $table->index('kode_barang', 'idx_barang_kode');
            $table->index('kategori_id', 'idx_barang_kategori');
            $table->index('status_aktif', 'idx_barang_status');
            $table->index(['kategori_id', 'status_aktif'], 'idx_barang_kategori_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('barang', function (Blueprint $table) {
            // Drop indexes
            $table->dropIndex('idx_barang_nama');
            $table->dropIndex('idx_barang_kode');
            $table->dropIndex('idx_barang_kategori');
            $table->dropIndex('idx_barang_status');
            $table->dropIndex('idx_barang_kategori_status');
        });
    }
};
