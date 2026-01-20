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
            $table->enum('metode_pembayaran', ['tunai', 'transfer', 'qris', 'edc'])->default('tunai')->after('total_biaya');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_hp', function (Blueprint $table) {
            $table->dropColumn('metode_pembayaran');
        });
    }
};
