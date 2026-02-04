<?php

use App\Models\Transaksi;
use Carbon\Carbon;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check for last 7 days to be sure
$startDate = Carbon::today()->subDays(7);
$endDate = Carbon::now();

echo "Checking transactions with change (Kembalian) from " . $startDate->format('Y-m-d') . " to " . $endDate->format('Y-m-d') . "\n";
echo str_repeat("-", 80) . "\n";
echo sprintf("%-20s | %-12s | %-15s | %-15s | %-15s\n", "No Transaksi", "Metode", "Total Bayar", "Jumlah Bayar", "Kembalian");
echo str_repeat("-", 80) . "\n";

$transaksi = Transaksi::where('kembalian', '>', 0)
    ->whereBetween('created_at', [$startDate, $endDate])
    ->orderBy('created_at', 'desc')
    ->get();

$totalKembalian = 0;

foreach ($transaksi as $trx) {
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
    }
}

echo str_repeat("-", 80) . "\n";
echo "Total Selisih (Total Kembalian): Rp " . number_format($totalKembalian, 0, ',', '.') . "\n";
