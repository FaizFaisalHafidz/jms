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
        Schema::create('cabang', function (Blueprint $table) {
            $table->id();
            $table->string('kode_cabang', 10)->unique();
            $table->string('nama_cabang', 100);
            $table->text('alamat');
            $table->string('telepon', 20);
            $table->string('kota', 50);
            $table->string('provinsi', 50);
            $table->string('kode_pos', 10);
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cabang');
    }
};
