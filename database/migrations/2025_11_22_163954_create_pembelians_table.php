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
        Schema::create('pembelian', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pembelian', 50)->unique();
            $table->date('tanggal_pembelian');
            $table->foreignId('suplier_id')->constrained('suplier')->onDelete('restrict');
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('restrict');
            $table->integer('total_item');
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('diskon')->default(0);
            $table->unsignedBigInteger('ongkos_kirim')->default(0);
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
        Schema::dropIfExists('pembelian');
    }
};
