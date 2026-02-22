<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create Harga Cabang Table
 * 
 * Fitur ini memungkinkan setiap cabang memiliki harga berbeda untuk barang yang sama.
 * - Jika cabang punya harga custom di table ini → pakai harga custom
 * - Jika tidak ada di table ini → pakai harga default dari table barang
 * 
 * Dengan cara ini, data existing di table barang tetap aman dan tidak berubah.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('harga_cabang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barang_id')->constrained('barang')->onDelete('cascade');
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('cascade');
            
            // Harga custom per cabang (nullable = pakai harga default dari barang)
            $table->integer('harga_konsumen')->nullable();
            $table->integer('harga_konter')->nullable();
            $table->integer('harga_partai')->nullable();
            
            $table->timestamps();
            
            // Unique constraint: satu barang hanya punya satu harga per cabang
            $table->unique(['barang_id', 'cabang_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('harga_cabang');
    }
};
