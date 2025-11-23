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
        Schema::create('service_hp', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_service', 50)->unique();
            $table->dateTime('tanggal_masuk');
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('restrict');
            $table->string('nama_pelanggan', 100);
            $table->string('telepon_pelanggan', 20);
            $table->string('merk_hp', 50);
            $table->string('tipe_hp', 50);
            $table->string('imei', 20)->nullable();
            $table->text('keluhan');
            $table->text('kerusakan')->nullable();
            $table->text('spare_part_diganti')->nullable();
            $table->unsignedBigInteger('biaya_spare_part')->default(0);
            $table->unsignedBigInteger('biaya_jasa')->default(0);
            $table->unsignedBigInteger('total_biaya');
            $table->enum('status_service', ['diterima', 'dicek', 'dikerjakan', 'selesai', 'diambil', 'batal'])->default('diterima');
            $table->dateTime('tanggal_selesai')->nullable();
            $table->dateTime('tanggal_diambil')->nullable();
            $table->foreignId('teknisi_id')->nullable()->constrained('users')->onDelete('restrict');
            $table->foreignId('kasir_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('transaksi_id')->nullable()->constrained('transaksi')->onDelete('set null');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_hp');
    }
};
