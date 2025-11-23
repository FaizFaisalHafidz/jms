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
        Schema::create('detail_transaksi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaksi_id')->constrained('transaksi')->onDelete('cascade');
            $table->foreignId('barang_id')->constrained('barang')->onDelete('restrict');
            $table->string('nama_barang', 200);
            $table->integer('jumlah');
            $table->unsignedBigInteger('harga_asal');
            $table->unsignedBigInteger('harga_jual');
            $table->enum('jenis_harga', ['konsumen', 'konter'])->default('konsumen');
            $table->unsignedBigInteger('diskon_item')->default(0);
            $table->unsignedBigInteger('subtotal');
            $table->bigInteger('laba');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_transaksi');
    }
};
