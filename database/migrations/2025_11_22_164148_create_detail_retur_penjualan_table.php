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
        Schema::create('detail_retur_penjualan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retur_penjualan_id')->constrained('retur_penjualan')->onDelete('cascade');
            $table->foreignId('detail_transaksi_id')->constrained('detail_transaksi')->onDelete('restrict');
            $table->foreignId('barang_id')->constrained('barang')->onDelete('restrict');
            $table->integer('jumlah_retur');
            $table->unsignedBigInteger('harga_jual');
            $table->unsignedBigInteger('subtotal');
            $table->enum('kondisi_barang', ['baik', 'rusak'])->default('baik');
            $table->text('keterangan')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_retur_penjualan');
    }
};
