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
        Schema::create('faktur', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_faktur', 50)->unique();
            $table->date('tanggal_faktur');
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('restrict');
            $table->foreignId('transaksi_id')->constrained('transaksi')->onDelete('restrict');
            $table->string('nama_pelanggan', 100);
            $table->string('telepon_pelanggan', 20)->nullable();
            $table->text('alamat_pelanggan')->nullable();
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('diskon')->default(0);
            $table->unsignedBigInteger('total_bayar');
            $table->enum('status_pembayaran', ['lunas', 'belum_lunas', 'cicilan'])->default('belum_lunas');
            $table->date('tanggal_jatuh_tempo')->nullable();
            $table->text('keterangan')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faktur');
    }
};
