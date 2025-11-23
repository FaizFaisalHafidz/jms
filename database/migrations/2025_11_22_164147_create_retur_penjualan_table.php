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
        Schema::create('retur_penjualan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_retur', 50)->unique();
            $table->date('tanggal_retur');
            $table->foreignId('transaksi_id')->constrained('transaksi')->onDelete('restrict');
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('restrict');
            $table->integer('total_item');
            $table->unsignedBigInteger('total_nilai_retur');
            $table->text('alasan_retur');
            $table->enum('status_retur', ['pending', 'disetujui', 'ditolak'])->default('pending');
            $table->foreignId('disetujui_oleh_id')->nullable()->constrained('users')->onDelete('restrict');
            $table->foreignId('kasir_id')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retur_penjualan');
    }
};
