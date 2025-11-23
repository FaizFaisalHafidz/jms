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
        Schema::create('transfer_stok', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_transfer', 50)->unique();
            $table->date('tanggal_transfer');
            $table->foreignId('cabang_asal_id')->constrained('cabang')->onDelete('restrict');
            $table->foreignId('cabang_tujuan_id')->constrained('cabang')->onDelete('restrict');
            $table->enum('status_transfer', ['pending', 'disetujui', 'dikirim', 'diterima', 'ditolak'])->default('pending');
            $table->integer('total_item');
            $table->text('keterangan')->nullable();
            $table->foreignId('dibuat_oleh_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('disetujui_oleh_id')->nullable()->constrained('users')->onDelete('restrict');
            $table->dateTime('tanggal_disetujui')->nullable();
            $table->foreignId('diterima_oleh_id')->nullable()->constrained('users')->onDelete('restrict');
            $table->dateTime('tanggal_diterima')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfer_stok');
    }
};
