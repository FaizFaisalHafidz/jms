<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Route::get('/', function () {
//     return Inertia::render('welcome', [
//         'canRegister' => Features::enabled(Features::registration()),
//     ]);
// })->name('home');

Route::redirect('/', 'dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
        ->middleware('redirect.owner')
        ->name('dashboard');

    // Owner Routes
    Route::middleware(['redirect.not.owner'])->prefix('owner')->name('owner.')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\OwnerDashboardController::class, 'index'])->name('dashboard');
        
        // Profile
        Route::get('profile', [\App\Http\Controllers\OwnerProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile/password', [\App\Http\Controllers\OwnerProfileController::class, 'updatePassword'])->name('profile.password.update');
    });

    // Cabang Routes
    Route::resource('cabang', \App\Http\Controllers\CabangController::class)->except(['show', 'create', 'edit']);
    
    // User Routes
    Route::resource('users', \App\Http\Controllers\UserController::class)->except(['show', 'create', 'edit']);
    
    // Supplier Routes
    Route::resource('supplier', \App\Http\Controllers\SupplierController::class)->except(['show', 'create', 'edit']);
    
    // Kategori Barang Routes
    Route::resource('kategori-barang', \App\Http\Controllers\KategoriBarangController::class)->except(['show', 'create', 'edit']);
    
    // Barang Routes
    Route::resource('barang', \App\Http\Controllers\BarangController::class)->except(['show', 'create', 'edit']);
    Route::post('barang/generate-kode', [\App\Http\Controllers\BarangController::class, 'generateKodeBarang'])->name('barang.generate-kode');
    Route::post('barang/update-stok', [\App\Http\Controllers\BarangController::class, 'updateStok'])->name('barang.update-stok');
    Route::post('barang/search', [\App\Http\Controllers\BarangController::class, 'search'])->name('barang.search');
    
    // Pembelian Routes
    Route::resource('pembelian', \App\Http\Controllers\PembelianController::class)->except(['show', 'edit']);
    
    // POS Routes
    Route::get('pos', [\App\Http\Controllers\PosController::class, 'index'])->name('pos.index');
    Route::post('pos/search-barang', [\App\Http\Controllers\PosController::class, 'searchBarang'])->name('pos.search-barang');
    Route::post('pos/store', [\App\Http\Controllers\PosController::class, 'store'])->name('pos.store');
    
    // Service HP Routes
    Route::get('service/create', [\App\Http\Controllers\ServiceHpController::class, 'create'])->name('service.create');
    Route::get('service/{service}/edit', [\App\Http\Controllers\ServiceHpController::class, 'edit'])->name('service.edit');
    Route::get('service/{service}/detail', [\App\Http\Controllers\ServiceHpController::class, 'detail'])->name('service.detail');
    Route::resource('service', \App\Http\Controllers\ServiceHpController::class)->except(['show', 'create', 'edit']);
    
    // Faktur Routes
    Route::get('faktur/create', [\App\Http\Controllers\FakturController::class, 'create'])->name('faktur.create');
    Route::get('faktur/{faktur}/edit', [\App\Http\Controllers\FakturController::class, 'edit'])->name('faktur.edit');
    Route::get('faktur/{faktur}/detail', [\App\Http\Controllers\FakturController::class, 'detail'])->name('faktur.detail');
    Route::resource('faktur', \App\Http\Controllers\FakturController::class)->except(['show', 'create', 'edit']);
    
    // Transfer Stok Routes
    Route::get('transfer-stok/create', [\App\Http\Controllers\TransferStokController::class, 'create'])->name('transfer-stok.create');
    Route::post('transfer-stok/search-barang', [\App\Http\Controllers\TransferStokController::class, 'searchBarang'])->name('transfer-stok.search-barang');
    Route::post('transfer-stok/{id}/approve', [\App\Http\Controllers\TransferStokController::class, 'approve'])->name('transfer-stok.approve');
    Route::post('transfer-stok/{id}/receive', [\App\Http\Controllers\TransferStokController::class, 'receive'])->name('transfer-stok.receive');
    Route::post('transfer-stok/{id}/reject', [\App\Http\Controllers\TransferStokController::class, 'reject'])->name('transfer-stok.reject');
    Route::resource('transfer-stok', \App\Http\Controllers\TransferStokController::class)->except(['create', 'edit']);
    
    // Retur Penjualan Routes
    Route::get('retur-penjualan/create', [\App\Http\Controllers\ReturPenjualanController::class, 'create'])->name('retur-penjualan.create');
    Route::post('retur-penjualan/search-barang', [\App\Http\Controllers\ReturPenjualanController::class, 'searchBarang'])->name('retur-penjualan.search-barang');
    Route::get('retur-penjualan/{id}/transaksi-detail', [\App\Http\Controllers\ReturPenjualanController::class, 'getTransaksiDetail'])->name('retur-penjualan.transaksi-detail');
    Route::post('retur-penjualan/{id}/approve', [\App\Http\Controllers\ReturPenjualanController::class, 'approve'])->name('retur-penjualan.approve');
    Route::post('retur-penjualan/{id}/reject', [\App\Http\Controllers\ReturPenjualanController::class, 'reject'])->name('retur-penjualan.reject');
    Route::get('retur-penjualan/{id}/print-exchange', [\App\Http\Controllers\ReturPenjualanController::class, 'printExchange'])->name('retur-penjualan.print-exchange');
    Route::resource('retur-penjualan', \App\Http\Controllers\ReturPenjualanController::class)->except(['create', 'edit']);
    
    // Pengeluaran Routes
    Route::resource('pengeluaran', \App\Http\Controllers\PengeluaranController::class)->except(['show', 'create', 'edit']);
    
    // Laporan Routes
    Route::get('laporan', [\App\Http\Controllers\LaporanController::class, 'index'])->name('laporan.index');
    Route::get('laporan/cabang', [\App\Http\Controllers\LaporanCabangController::class, 'index'])->name('laporan.cabang');
    Route::get('laporan/cabang/closing', [\App\Http\Controllers\LaporanCabangController::class, 'closingData'])->name('laporan.cabang.closing');
    Route::get('laporan/penjualan', [\App\Http\Controllers\LaporanPenjualanController::class, 'index'])->name('laporan.penjualan');
    Route::get('laporan/pembelian', [\App\Http\Controllers\LaporanPembelianController::class, 'index'])->name('laporan.pembelian');
    Route::get('laporan/laba-rugi', [\App\Http\Controllers\LaporanLabaRugiController::class, 'index'])->name('laporan.laba-rugi');
    Route::get('laporan/stok', [\App\Http\Controllers\LaporanStokController::class, 'index'])->name('laporan.stok');
});


require __DIR__.'/settings.php';
