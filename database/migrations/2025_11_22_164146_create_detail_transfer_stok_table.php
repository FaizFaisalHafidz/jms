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
        Schema::create('detail_transfer_stok', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transfer_stok_id')->constrained('transfer_stok')->onDelete('cascade');
            $table->foreignId('barang_id')->constrained('barang')->onDelete('restrict');
            $table->integer('jumlah_transfer');
            $table->integer('jumlah_diterima')->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_transfer_stok');
    }
};
