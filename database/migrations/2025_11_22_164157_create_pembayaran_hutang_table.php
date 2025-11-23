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
        Schema::create('pembayaran_hutang', function (Blueprint $table) {
            $table->id();
            $table->enum('tipe_pembayaran', ['pembelian', 'faktur']);
            $table->unsignedBigInteger('referensi_id');
            $table->date('tanggal_bayar');
            $table->unsignedBigInteger('jumlah_bayar');
            $table->enum('metode_pembayaran', ['tunai', 'transfer', 'qris'])->default('tunai');
            $table->text('keterangan')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran_hutang');
    }
};
