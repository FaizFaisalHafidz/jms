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
        Schema::create('pengeluaran', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pengeluaran', 50)->unique();
            $table->date('tanggal_pengeluaran');
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('restrict');
            $table->enum('kategori_pengeluaran', ['gaji', 'listrik', 'air', 'internet', 'sewa', 'transport', 'perlengkapan', 'lainnya']);
            $table->unsignedBigInteger('jumlah');
            $table->text('keterangan')->nullable();
            $table->string('bukti_pengeluaran', 255)->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengeluaran');
    }
};
