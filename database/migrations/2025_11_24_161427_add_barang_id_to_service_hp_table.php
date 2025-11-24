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
        Schema::table('service_hp', function (Blueprint $table) {
            $table->foreignId('barang_id')->nullable()->after('spare_part_diganti')->constrained('barang')->onDelete('set null');
            $table->integer('jumlah_barang')->nullable()->after('barang_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_hp', function (Blueprint $table) {
            $table->dropForeign(['barang_id']);
            $table->dropColumn(['barang_id', 'jumlah_barang']);
        });
    }
};
