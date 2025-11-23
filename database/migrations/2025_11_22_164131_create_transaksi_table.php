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
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_transaksi', 50)->unique();
            $table->dateTime('tanggal_transaksi');
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('restrict');
            $table->enum('jenis_transaksi', ['retail', 'konter', 'service', 'faktur'])->default('retail');
            $table->string('nama_pelanggan', 100)->nullable();
            $table->string('telepon_pelanggan', 20)->nullable();
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('diskon')->default(0);
            $table->unsignedBigInteger('biaya_service')->default(0);
            $table->unsignedBigInteger('total_bayar');
            $table->enum('metode_pembayaran', ['tunai', 'transfer', 'qris'])->default('tunai');
            $table->unsignedBigInteger('jumlah_bayar');
            $table->unsignedBigInteger('kembalian')->default(0);
            $table->bigInteger('total_laba')->default(0);
            $table->text('keterangan')->nullable();
            $table->enum('status_transaksi', ['selesai', 'pending', 'batal'])->default('selesai');
            $table->foreignId('kasir_id')->constrained('users')->onDelete('restrict');
            $table->timestamps();
            
            $table->index('tanggal_transaksi');
            $table->index('cabang_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
