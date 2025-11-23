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
        Schema::create('barang', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategori_barang')->onDelete('restrict');
            $table->foreignId('suplier_id')->constrained('suplier')->onDelete('restrict');
            $table->string('kode_barang', 50)->unique();
            $table->string('nama_barang', 200);
            $table->string('barcode', 128)->unique()->nullable();
            $table->string('merk', 50)->nullable();
            $table->string('tipe', 50)->nullable();
            $table->string('satuan', 20)->default('PCS');
            $table->unsignedBigInteger('harga_asal'); // Harga modal dalam rupiah
            $table->unsignedBigInteger('harga_konsumen'); // Harga retail
            $table->unsignedBigInteger('harga_konter'); // Harga reseller
            $table->integer('stok_minimal')->default(5);
            $table->text('deskripsi')->nullable();
            $table->string('foto_barang', 255)->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barang');
    }
};
