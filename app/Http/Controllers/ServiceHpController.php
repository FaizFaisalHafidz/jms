<?php

namespace App\Http\Controllers;

use App\Models\ServiceHp;
use App\Models\Cabang;
use App\Models\User;
use App\Models\Barang;
use App\Models\StokCabang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ServiceHpController extends Controller
{
    /**
     * Display a listing of service hp
     */
    public function index(Request $request)
    {
        $cabangId = Auth::user()->cabang_id;
        $search = $request->input('search');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        
        $query = ServiceHp::with(['cabang', 'teknisi', 'kasir'])
            ->where('cabang_id', $cabangId);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('nomor_service', 'like', "%{$search}%")
                  ->orWhere('nama_pelanggan', 'like', "%{$search}%")
                  ->orWhere('merk_hp', 'like', "%{$search}%")
                  ->orWhere('tipe_hp', 'like', "%{$search}%")
                  ->orWhere('telepon_pelanggan', 'like', "%{$search}%");
            });
        }

        if ($startDate && $endDate) {
            $query->whereBetween('tanggal_masuk', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->whereDate('tanggal_masuk', '>=', $startDate);
        }

        $services = $query->latest()
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'nomor_service' => $service->nomor_service,
                    'tanggal_masuk' => $service->tanggal_masuk,
                    'nama_pelanggan' => $service->nama_pelanggan,
                    'telepon_pelanggan' => $service->telepon_pelanggan,
                    'merk_hp' => $service->merk_hp,
                    'tipe_hp' => $service->tipe_hp,
                    'keluhan' => $service->keluhan,
                    'total_biaya' => $service->total_biaya,
                    'status_service' => $service->status_service,
                    'teknisi' => $service->teknisi ? $service->teknisi->name : '-',
                    'tanggal_selesai' => $service->tanggal_selesai,
                    'tanggal_diambil' => $service->tanggal_diambil,
                    'metode_pembayaran' => $service->metode_pembayaran,
                ];
            });

        // Stats (tetap hitung total global untuk indikator kinerja, atau mau difilter juga? 
        // Biasanya stats dashboard itu global hari ini/pending, tapi jika user mau filter tanggal, 
        // mungkin list saja yang berubah. Untuk sekarang biar stats tetap general per cabang)
        $stats = [
            'total' => ServiceHp::where('cabang_id', $cabangId)->count(),
            'diterima' => ServiceHp::where('cabang_id', $cabangId)->where('status_service', 'diterima')->count(),
            'dikerjakan' => ServiceHp::where('cabang_id', $cabangId)->whereIn('status_service', ['dicek', 'dikerjakan'])->count(),
            'selesai' => ServiceHp::where('cabang_id', $cabangId)->where('status_service', 'selesai')->count(),
        ];

        return Inertia::render('service-hp/index', [
            'services' => $services,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * Show the form for creating a new service
     */
    public function create()
    {
        $user = Auth::user();
        $cabangId = $user->cabang_id;
        $cabang = Cabang::find($cabangId);
        
        $teknisi = User::where('cabang_id', $cabangId)->get();

        return Inertia::render('service-hp/create', [
            'teknisi' => $teknisi,
            'cabang_nama' => $cabang ? $cabang->nama_cabang : 'Toko',
            'cabang_alamat' => $cabang ? $cabang->alamat : '',
            'cabang_telepon' => $cabang ? $cabang->telepon : '',
        ]);
    }

    /**
     * Store a newly created service
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal_masuk' => 'required|date',
            'nama_pelanggan' => 'required|string|max:100',
            'telepon_pelanggan' => 'required|string|max:20',
            'merk_hp' => 'required|string|max:50',
            'tipe_hp' => 'required|string|max:50',
            'imei' => 'nullable|string|max:20',
            'keluhan' => 'required|string',
            'kerusakan' => 'nullable|string',
            'spare_part_diganti' => 'nullable|string',
            'biaya_spare_part' => 'nullable|integer|min:0',
            'biaya_jasa' => 'nullable|integer|min:0',
            'teknisi_id' => 'nullable|exists:users,id',
            'keterangan' => 'nullable|string',
            'barang_id' => 'nullable|exists:barang,id',
            'jumlah_barang' => 'nullable|integer|min:1',
            'metode_pembayaran' => 'required|in:tunai,transfer,qris,edc',
        ]);

        DB::beginTransaction();
        try {
            $cabangId = Auth::user()->cabang_id;
            $nomorService = $this->generateNomorService();

            $biayaSparePart = $request->biaya_spare_part ?? 0;
            $biayaJasa = $request->biaya_jasa ?? 0;
            $totalBiaya = $biayaSparePart + $biayaJasa;
            
            // Hitung laba service
            $labaService = $biayaJasa; // Laba jasa = 100% dari biaya jasa

            // Jika menggunakan barang dari inventory, kurangi stok dan hitung laba spare part
            if ($request->barang_id && $request->jumlah_barang) {
                $stokCabang = StokCabang::where('cabang_id', $cabangId)
                    ->where('barang_id', $request->barang_id)
                    ->first();

                if (!$stokCabang || $stokCabang->jumlah_stok < $request->jumlah_barang) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Stok barang tidak mencukupi',
                    ], 400);
                }

                // Ambil harga asal barang untuk hitung laba
                $barang = Barang::find($request->barang_id);
                $hargaModalSparePart = $barang->harga_asal * $request->jumlah_barang;
                
                // Laba spare part = biaya yang dikenakan - harga modal
                $labaSparePart = $biayaSparePart - $hargaModalSparePart;
                $labaService += $labaSparePart;

                // Kurangi stok
                $stokCabang->decrement('jumlah_stok', $request->jumlah_barang);
            } else {
                // Jika spare part manual (tidak dari inventory), anggap semua biaya spare part adalah laba
                $labaService += $biayaSparePart;
            }

            $service = ServiceHp::create([
                'nomor_service' => $nomorService,
                'tanggal_masuk' => $request->tanggal_masuk,
                'cabang_id' => $cabangId,
                'nama_pelanggan' => $request->nama_pelanggan,
                'telepon_pelanggan' => $request->telepon_pelanggan,
                'merk_hp' => $request->merk_hp,
                'tipe_hp' => $request->tipe_hp,
                'imei' => $request->imei,
                'keluhan' => $request->keluhan,
                'kerusakan' => $request->kerusakan,
                'spare_part_diganti' => $request->spare_part_diganti,
                'barang_id' => $request->barang_id,
                'jumlah_barang' => $request->jumlah_barang,
                'biaya_spare_part' => $biayaSparePart,
                'biaya_jasa' => $biayaJasa,
                'total_biaya' => $totalBiaya,
                'metode_pembayaran' => $request->metode_pembayaran,
                'laba_service' => $labaService,
                'status_service' => 'diterima',
                'teknisi_id' => $request->teknisi_id,
                'kasir_id' => Auth::id(),
                'keterangan' => $request->keterangan,
            ]);

            DB::commit();

            // Load teknisi relation
            $service->load('teknisi');

            // Check if request wants JSON response (for AJAX)
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Data service berhasil ditambahkan',
                    'data' => [
                        'id' => $service->id,
                        'nomor_service' => $service->nomor_service,
                        'tanggal_masuk' => $service->tanggal_masuk,
                        'nama_pelanggan' => $service->nama_pelanggan,
                        'telepon_pelanggan' => $service->telepon_pelanggan,
                        'merk_hp' => $service->merk_hp,
                        'tipe_hp' => $service->tipe_hp,
                        'keluhan' => $service->keluhan,
                        'spare_part_diganti' => $service->spare_part_diganti,
                        'biaya_spare_part' => $service->biaya_spare_part,
                        'biaya_jasa' => $service->biaya_jasa,
                        'total_biaya' => $service->total_biaya,
                        'metode_pembayaran' => $service->metode_pembayaran,
                        'teknisi' => $service->teknisi ? $service->teknisi->name : '-',
                        'kasir' => Auth::user()->name,
                    ],
                ]);
            }

            return redirect()->route('service.index')
                ->with('success', 'Data service berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified service
     */
    public function edit($id)
    {
        $serviceHp = ServiceHp::findOrFail($id);
        $user = Auth::user();
        $cabangId = $user->cabang_id;
        $cabang = Cabang::find($cabangId);
        
        $teknisi = User::where('cabang_id', $cabangId)->get();

        return Inertia::render('service-hp/edit', [
            'service' => $serviceHp,
            'teknisi' => $teknisi,
            'cabang_nama' => $cabang ? $cabang->nama_cabang : 'Toko',
            'cabang_alamat' => $cabang ? $cabang->alamat : '',
            'cabang_telepon' => $cabang ? $cabang->telepon : '',
        ]);
    }

    /**
     * Update the specified service
     */
    public function update(Request $request, $id)
    {
        $serviceHp = ServiceHp::findOrFail($id);
        
        // Check if this is a partial update (e.g., only status change)
        if ($request->has('status_service') && count($request->all()) === 1) {
            $request->validate([
                'status_service' => 'required|in:diterima,dicek,dikerjakan,selesai,diambil,batal',
            ]);
            
            $updateData = ['status_service' => $request->status_service];
            
            // Auto set tanggal_selesai if status is 'selesai' and not set
            if ($request->status_service === 'selesai' && !$serviceHp->tanggal_selesai) {
                $updateData['tanggal_selesai'] = now();
            }
            // Auto set tanggal_diambil if status is 'diambil' and not set
            if ($request->status_service === 'diambil' && !$serviceHp->tanggal_diambil) {
                $updateData['tanggal_diambil'] = now();
                // Ensure tanggal_selesai is also set if it was missed
                if (!$serviceHp->tanggal_selesai) {
                    $updateData['tanggal_selesai'] = now();
                }
            }

            $serviceHp->update($updateData);
            
            if ($request->wantsJson() || $request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Status berhasil diubah',
                ]);
            }
            
            return redirect()->route('service.index')
                ->with('success', 'Status berhasil diubah');
        }
        
        // Full update validation
        $request->validate([
            'tanggal_masuk' => 'required|date',
            'nama_pelanggan' => 'required|string|max:100',
            'telepon_pelanggan' => 'required|string|max:20',
            'merk_hp' => 'required|string|max:50',
            'tipe_hp' => 'required|string|max:50',
            'imei' => 'nullable|string|max:20',
            'keluhan' => 'required|string',
            'kerusakan' => 'nullable|string',
            'spare_part_diganti' => 'nullable|string',
            'biaya_spare_part' => 'nullable|integer|min:0',
            'biaya_jasa' => 'nullable|integer|min:0',
            'status_service' => 'required|in:diterima,dicek,dikerjakan,selesai,diambil,batal',
            'teknisi_id' => 'nullable|exists:users,id',
            'tanggal_selesai' => 'nullable|date',
            'tanggal_diambil' => 'nullable|date',
            'keterangan' => 'nullable|string',
            'barang_id' => 'nullable|exists:barang,id',
            'jumlah_barang' => 'nullable|integer|min:1',
            'metode_pembayaran' => 'required|in:tunai,transfer,qris,edc',
        ]);

        DB::beginTransaction();
        try {
            $cabangId = Auth::user()->cabang_id;

            // Handle stok changes jika barang berubah
            $oldBarangId = $serviceHp->barang_id;
            $oldJumlah = $serviceHp->jumlah_barang;
            $newBarangId = $request->barang_id;
            $newJumlah = $request->jumlah_barang;

            // Restore stok lama jika ada
            if ($oldBarangId && $oldJumlah) {
                $oldStok = StokCabang::where('cabang_id', $cabangId)
                    ->where('barang_id', $oldBarangId)
                    ->first();
                
                if ($oldStok) {
                    $oldStok->increment('jumlah_stok', $oldJumlah);
                }
            }

            // Kurangi stok baru jika ada
            if ($newBarangId && $newJumlah) {
                $newStok = StokCabang::where('cabang_id', $cabangId)
                    ->where('barang_id', $newBarangId)
                    ->first();

                if (!$newStok || $newStok->jumlah_stok < $newJumlah) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Stok barang tidak mencukupi',
                    ], 400);
                }

                $newStok->decrement('jumlah_stok', $newJumlah);
            }

            $biayaSparePart = $request->biaya_spare_part ?? 0;
            $biayaJasa = $request->biaya_jasa ?? 0;
            $totalBiaya = $biayaSparePart + $biayaJasa;

            $serviceHp->update([
                'tanggal_masuk' => $request->tanggal_masuk,
                'nama_pelanggan' => $request->nama_pelanggan,
                'telepon_pelanggan' => $request->telepon_pelanggan,
                'merk_hp' => $request->merk_hp,
                'tipe_hp' => $request->tipe_hp,
                'imei' => $request->imei,
                'keluhan' => $request->keluhan,
                'kerusakan' => $request->kerusakan,
                'spare_part_diganti' => $request->spare_part_diganti,
                'barang_id' => $newBarangId,
                'jumlah_barang' => $newJumlah,
                'biaya_spare_part' => $biayaSparePart,
                'biaya_jasa' => $biayaJasa,
                'total_biaya' => $totalBiaya,
                'metode_pembayaran' => $request->metode_pembayaran,
                'status_service' => $request->status_service,
                'teknisi_id' => $request->teknisi_id,
                'tanggal_selesai' => $request->tanggal_selesai ?? ($request->status_service === 'selesai' && !$serviceHp->tanggal_selesai ? now() : $serviceHp->tanggal_selesai),
                'tanggal_diambil' => $request->tanggal_diambil ?? ($request->status_service === 'diambil' && !$serviceHp->tanggal_diambil ? now() : $serviceHp->tanggal_diambil),
                'keterangan' => $request->keterangan,
            ]);

            DB::commit();

            return redirect()->route('service.index')
                ->with('success', 'Data service berhasil diupdate');
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified service
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $serviceHp = ServiceHp::findOrFail($id);
            $cabangId = Auth::user()->cabang_id;

            // Restore stok jika service ini pakai barang dari inventory
            if ($serviceHp->barang_id && $serviceHp->jumlah_barang) {
                $stokCabang = StokCabang::where('cabang_id', $cabangId)
                    ->where('barang_id', $serviceHp->barang_id)
                    ->first();
                
                if ($stokCabang) {
                    $stokCabang->increment('jumlah_stok', $serviceHp->jumlah_barang);
                }
            }

            $serviceHp->delete();

            DB::commit();

            return redirect()->route('service.index')
                ->with('success', 'Data service berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('service.index')
                ->with('error', 'Gagal menghapus service: ' . $e->getMessage());
        }
    }

    /**
     * Get service detail for print
     */
    public function detail($id)
    {
        $serviceHp = ServiceHp::with(['cabang', 'teknisi'])->findOrFail($id);
        
        return response()->json([
            'id' => $serviceHp->id,
            'nomor_service' => $serviceHp->nomor_service,
            'tanggal_masuk' => $serviceHp->tanggal_masuk,
            'nama_pelanggan' => $serviceHp->nama_pelanggan,
            'telepon_pelanggan' => $serviceHp->telepon_pelanggan,
            'merk_hp' => $serviceHp->merk_hp,
            'tipe_hp' => $serviceHp->tipe_hp,
            'imei' => $serviceHp->imei,
            'keluhan' => $serviceHp->keluhan,
            'kerusakan' => $serviceHp->kerusakan,
            'spare_part_diganti' => $serviceHp->spare_part_diganti,
            'biaya_spare_part' => $serviceHp->biaya_spare_part,
            'biaya_jasa' => $serviceHp->biaya_jasa,
            'total_biaya' => $serviceHp->total_biaya,
            'metode_pembayaran' => $serviceHp->metode_pembayaran,
            'status_service' => $serviceHp->status_service,
            'teknisi' => $serviceHp->teknisi ? $serviceHp->teknisi->name : null,
            'tanggal_selesai' => $serviceHp->tanggal_selesai,
            'tanggal_diambil' => $serviceHp->tanggal_diambil,
            'keterangan' => $serviceHp->keterangan,
            'cabang_nama' => $serviceHp->cabang->nama_cabang,
            'cabang_alamat' => $serviceHp->cabang->alamat,
            'cabang_telepon' => $serviceHp->cabang->telepon,
        ]);
    }

    /**
     * Generate nomor service format: SRV-YYYYMMDD-XXXX
     */
    private function generateNomorService()
    {
        $prefix = 'SRV-' . date('Ymd') . '-';
        
        $lastService = ServiceHp::where('nomor_service', 'LIKE', $prefix . '%')
            ->orderBy('nomor_service', 'desc')
            ->first();
        
        if ($lastService) {
            preg_match('/-(\d+)$/', $lastService->nomor_service, $matches);
            $lastNumber = isset($matches[1]) ? (int)$matches[1] : 0;
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
