<?php

use App\Models\Transaksi;
use App\Models\Cabang;
use Carbon\Carbon;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Cari Cabang
$cabang = Cabang::find(1); // ID 1 adalah Tasik Mitrabatik

if (!$cabang) {
    echo "Cabang Mitra Batik tidak ditemukan.\n";
    exit;
}

echo "Cabang: " . $cabang->nama_cabang . " (ID: " . $cabang->id . ")\n";

// Set Tanggal: 3 Februari 2026
$targetDate = Carbon::create(2026, 2, 3);
$startDate = $targetDate->copy()->startOfDay();
$endDate = $targetDate->copy()->endOfDay();

echo "Mengecek transaksi dengan kembalian pada tanggal: " . $targetDate->format('l, d F Y') . "\n";
echo str_repeat("-", 95) . "\n";
echo sprintf("%-20s | %-12s | %-15s | %-15s | %-15s\n", "No Transaksi", "Metode", "Total Bayar", "Jumlah Bayar", "Kembalian");
echo str_repeat("-", 95) . "\n";

$transaksi = Transaksi::where('cabang_id', $cabang->id)
    ->where('kembalian', '>', 0)
    ->whereBetween('updated_at', [$startDate, $endDate]) // Menggunakan updated_at/created_at
    ->orderBy('created_at', 'asc')
    ->get();

$totalKembalian = 0;
$totalTransaksi = 0;

foreach ($transaksi as $trx) {
     // Hanya tampilkan jika Tunai atau Split (karena ini yang relevan dengan selisih cash)
    if ($trx->metode_pembayaran == 'tunai' || $trx->metode_pembayaran == 'split') {
        echo sprintf(
            "%-20s | %-12s | Rp %-12s | Rp %-12s | Rp %-12s\n",
            $trx->nomor_transaksi,
            $trx->metode_pembayaran,
            number_format($trx->total_bayar, 0, ',', '.'),
            number_format($trx->jumlah_bayar, 0, ',', '.'),
            number_format($trx->kembalian, 0, ',', '.')
        );
        $totalKembalian += $trx->kembalian;
        $totalTransaksi++;
    }
}

echo str_repeat("-", 95) . "\n";
echo "Total Transaksi: " . $totalTransaksi . "\n";
echo "Total Selisih (Uang Keluar untuk Kembalian): Rp " . number_format($totalKembalian, 0, ',', '.') . "\n";
