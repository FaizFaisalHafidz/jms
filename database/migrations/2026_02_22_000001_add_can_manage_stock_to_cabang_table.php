<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Add Stock Management Permission per Cabang
 * 
 * Fitur ini memungkinkan Super Admin untuk mengatur izin pengelolaan stok per cabang.
 * - Cabang dengan can_manage_stock = true: Dapat update stok barang
 * - Cabang dengan can_manage_stock = false: Hanya bisa lihat stok (read-only)
 * - Super Admin: Selalu punya akses penuh
 * 
 * Halaman management: /super-admin/stock-permission
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cabang', function (Blueprint $table) {
            $table->boolean('can_manage_stock')->default(true)->after('status_aktif')
                ->comment('Izin cabang untuk mengatur/edit stok barang');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cabang', function (Blueprint $table) {
            $table->dropColumn('can_manage_stock');
        });
    }
};
