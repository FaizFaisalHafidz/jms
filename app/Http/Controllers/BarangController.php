<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\KategoriBarang;
use App\Models\Suplier;
use App\Models\StokCabang;
use App\Models\Cabang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class BarangController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('super_admin');
        $isSupervisor = $user->hasRole('supervisor');
        
        // Build query dengan pagination dan filtering
        $query = Barang::query()
            ->select([
                'id', 'kategori_id', 'suplier_id', 'kode_barang', 
                'nama_barang', 'barcode', 'merk', 'tipe', 'satuan',
                'harga_asal', 'harga_konsumen', 'harga_konter', 'harga_partai',
                'stok_minimal', 'status_aktif'
            ])
            ->with([
                'kategori:id,nama_kategori',
                'suplier:id,nama_suplier',
                'stokCabang' => function ($query) use ($isSuperAdmin, $isSupervisor, $user) {
                    if (!$isSuperAdmin && !$isSupervisor) {
                        $query->where('cabang_id', $user->cabang_id);
                    }
                    $query->select('id', 'barang_id', 'cabang_id', 'jumlah_stok')
                          ->with('cabang:id,nama_cabang');
                },
                'hargaCabang' => function ($query) use ($user) {
                    if ($user->cabang_id) {
                        $query->where('cabang_id', $user->cabang_id);
                    }
                }
            ]);
        
        // Apply filters if provided
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }
        
        if ($request->filled('status')) {
            $query->where('status_aktif', $request->status);
        }
        
        // Pagination
        $barang = $query->orderBy('nama_barang')->paginate(10);
        
        // Transform data to use harga per cabang untuk semua user yang punya cabang_id
        if ($user->cabang_id) {
            $cabangId = $user->cabang_id;
            $barang->getCollection()->transform(function ($item) use ($cabangId) {
                // Check if hargaCabang is loaded
                if ($item->relationLoaded('hargaCabang') && $item->hargaCabang->isNotEmpty()) {
                    $hargaCustom = $item->hargaCabang->first();
                    $item->harga_asal = $hargaCustom->harga_asal ?? $item->harga_asal;
                    $item->harga_konsumen = $hargaCustom->harga_konsumen ?? $item->harga_konsumen;
                    $item->harga_konter = $hargaCustom->harga_konter ?? $item->harga_konter;
                    $item->harga_partai = $hargaCustom->harga_partai ?? $item->harga_partai;
                }
                return $item;
            });
        }
        
        // Get kategori and suplier for form - cache selectively
        $kategori = KategoriBarang::select('id', 'nama_kategori')
            ->where('status_aktif', true)
            ->orderBy('nama_kategori')
            ->get();
        
        $suplier = Suplier::select('id', 'nama_suplier')
            ->where('status_aktif', true)
            ->orderBy('nama_suplier')
            ->get();
        
        // Get all cabang untuk super admin dan supervisor (untuk modal harga cabang)
        $cabang = ($isSuperAdmin || $isSupervisor) 
            ? Cabang::select('id', 'nama_cabang')
                ->where('status_aktif', true)
                ->orderBy('nama_cabang')
                ->get() 
            : [];
        
        // Stats - optimized with single query
        $stats = Barang::selectRaw('
            COUNT(*) as total,
            SUM(CASE WHEN status_aktif = 1 THEN 1 ELSE 0 END) as aktif,
            SUM(CASE WHEN status_aktif = 0 THEN 1 ELSE 0 END) as nonaktif
        ')->first();

        // Check if user's cabang can manage stock
        $canManageStock = $isSuperAdmin || ($user->cabang && $user->cabang->can_manage_stock);

        return Inertia::render('barang/index', [
            'barang' => [
                'data' => $barang->items(),
                'meta' => [
                    'current_page' => $barang->currentPage(),
                    'from' => $barang->firstItem(),
                    'last_page' => $barang->lastPage(),
                    'per_page' => $barang->perPage(),
                    'to' => $barang->lastItem(),
                    'total' => $barang->total(),
                ],
            ],
            'kategori' => $kategori,
            'suplier' => $suplier,
            'cabang' => $cabang,
            'is_super_admin' => $isSuperAdmin,
            'can_manage_stock' => $canManageStock,
            'filters' => $request->only(['search', 'kategori_id', 'status']),
            'timestamp' => now()->timestamp,
            'stats' => [
                'total' => (int)$stats->total,
                'aktif' => (int)$stats->aktif,
                'nonaktif' => (int)$stats->nonaktif,
            ],
        ]);
    }

    /**
     * Generate kode barang based on kategori
     */
    public function generateKodeBarang(Request $request)
    {
        $kategoriId = $request->input('kategori_id');
        
        if (!$kategoriId) {
            return response()->json(['error' => 'Kategori ID required'], 400);
        }
        
        $kategori = KategoriBarang::find($kategoriId);
        if (!$kategori) {
            return response()->json(['error' => 'Kategori not found'], 404);
        }
        
        // Get first 3 letters of kategori name (uppercase)
        $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $kategori->nama_kategori), 0, 3));
        
        // Find last number for this prefix
        $lastBarang = Barang::where('kode_barang', 'LIKE', $prefix . '-%')
            ->orderBy('kode_barang', 'desc')
            ->first();
        
        if ($lastBarang) {
            // Extract number from last kode
            preg_match('/-(\d+)$/', $lastBarang->kode_barang, $matches);
            $lastNumber = isset($matches[1]) ? (int)$matches[1] : 0;
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        // Format: PREFIX-XXX (e.g., LCD-001)
        $kodeBarang = $prefix . '-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
        
        return response()->json(['kode_barang' => $kodeBarang]);
    }

    /**
     * Generate unique barcode (EAN-13 format)
     */
    private function generateBarcode(): string
    {
        do {
            // Generate 12 digit number (EAN-13 without check digit)
            $barcode = '899' . str_pad(rand(0, 999999999), 9, '0', STR_PAD_LEFT);
            
            // Calculate EAN-13 check digit
            $sum = 0;
            for ($i = 0; $i < 12; $i++) {
                $sum += (int)$barcode[$i] * (($i % 2 === 0) ? 1 : 3);
            }
            $checkDigit = (10 - ($sum % 10)) % 10;
            $barcode .= $checkDigit;
            
        } while (Barang::where('barcode', $barcode)->exists());
        
        return $barcode;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kategori_id' => 'required|exists:kategori_barang,id',
            'suplier_id' => 'required|exists:suplier,id',
            'kode_barang' => 'required|string|max:50|unique:barang,kode_barang',
            'nama_barang' => 'required|string|max:200',
            'merk' => 'nullable|string|max:50',
            'tipe' => 'nullable|string|max:50',
            'satuan' => 'required|string|max:20',
            'harga_asal' => 'required|integer|min:0',
            'harga_konsumen' => 'required|integer|min:0',
            'harga_konter' => 'required|integer|min:0',
            'harga_partai' => 'required|integer|min:0',
            'stok_minimal' => 'required|integer|min:0',
            'deskripsi' => 'nullable|string',
            'status_aktif' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $data = $validator->validated();
        
        // Auto-generate barcode if not provided
        $data['barcode'] = $this->generateBarcode();

        Barang::create($data);

        return redirect()->route('barang.index')
            ->with('success', 'Barang berhasil ditambahkan dengan barcode: ' . $data['barcode']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Barang $barang)
    {
        $validator = Validator::make($request->all(), [
            'kategori_id' => 'required|exists:kategori_barang,id',
            'suplier_id' => 'required|exists:suplier,id',
            'kode_barang' => 'required|string|max:50|unique:barang,kode_barang,' . $barang->id,
            'nama_barang' => 'required|string|max:200',
            'merk' => 'nullable|string|max:50',
            'tipe' => 'nullable|string|max:50',
            'satuan' => 'required|string|max:20',
            'harga_asal' => 'required|integer|min:0',
            'harga_konsumen' => 'required|integer|min:0',
            'harga_konter' => 'required|integer|min:0',
            'harga_partai' => 'required|integer|min:0',
            'stok_minimal' => 'required|integer|min:0',
            'deskripsi' => 'nullable|string',
            'status_aktif' => 'required|boolean',
            'regenerate_barcode' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $data = $validator->validated();
        
        // Regenerate barcode if requested
        if (isset($data['regenerate_barcode']) && $data['regenerate_barcode']) {
            $data['barcode'] = $this->generateBarcode();
            unset($data['regenerate_barcode']);
        } else {
            // Auto-generate barcode if NULL or empty (for imported/seeded data)
            if (empty($barang->barcode)) {
                $data['barcode'] = $this->generateBarcode();
            }
            unset($data['regenerate_barcode']);
        }

        $barang->update($data);

        return redirect()->route('barang.index')
            ->with('success', 'Barang berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Barang $barang)
    {
        // Check if barang has related records
        if ($barang->stokCabang()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Barang tidak dapat dihapus karena masih memiliki stok di cabang');
        }

        if ($barang->detailTransaksi()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Barang tidak dapat dihapus karena masih memiliki transaksi terkait');
        }

        if ($barang->detailPembelian()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Barang tidak dapat dihapus karena masih memiliki pembelian terkait');
        }

        $barang->delete();

        return redirect()->route('barang.index')
            ->with('success', 'Barang berhasil dihapus');
    }

    /**
     * Update stok cabang for a barang
     */
    public function updateStok(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('super_admin');
        
        // Check permission
        if (!$isSuperAdmin && (!$user->cabang || !$user->cabang->can_manage_stock)) {
            return response()->json([
                'success' => false,
                'message' => 'Cabang Anda tidak memiliki izin untuk mengelola stok. Hubungi super admin.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'barang_id' => 'required|exists:barang,id',
            'jumlah_stok' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $cabangId = Auth::user()->cabang_id;

        $stok = StokCabang::updateOrCreate(
            [
                'barang_id' => $request->barang_id,
                'cabang_id' => $cabangId,
            ],
            [
                'jumlah_stok' => $request->jumlah_stok,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Stok berhasil diperbarui',
            'data' => $stok,
        ]);
    }

    /**
     * Search barang untuk list (AJAX)
     */
    public function search(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('super_admin');
        $isSupervisor = $user->hasRole('supervisor');
        
        // Build query dengan pagination dan filtering
        $query = Barang::query()
            ->select([
                'id', 'kategori_id', 'suplier_id', 'kode_barang', 
                'nama_barang', 'barcode', 'merk', 'tipe', 'satuan',
                'harga_asal', 'harga_konsumen', 'harga_konter', 'harga_partai',
                'stok_minimal', 'status_aktif'
            ])
            ->with([
                'kategori:id,nama_kategori',
                'suplier:id,nama_suplier',
                'stokCabang' => function ($query) use ($isSuperAdmin, $isSupervisor, $user) {
                    if (!$isSuperAdmin && !$isSupervisor) {
                        $query->where('cabang_id', $user->cabang_id);
                    }
                    $query->select('id', 'barang_id', 'cabang_id', 'jumlah_stok')
                          ->with('cabang:id,nama_cabang');
                },
                'hargaCabang' => function ($query) use ($user) {
                    if ($user->cabang_id) {
                        $query->where('cabang_id', $user->cabang_id);
                    }
                }
            ]);
        
        // Apply filters if provided
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                  ->orWhere('kode_barang', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }
        
        if ($request->filled('status')) {
            $query->where('status_aktif', $request->status);
        }
        
        // Pagination
        $barang = $query->orderBy('nama_barang')->paginate(10);
        
        // Transform data to use harga per cabang untuk semua user yang punya cabang_id
        if ($user->cabang_id) {
            $cabangId = $user->cabang_id;
            $barang->getCollection()->transform(function ($item) use ($cabangId) {
                // Check if hargaCabang is loaded
                if ($item->relationLoaded('hargaCabang') && $item->hargaCabang->isNotEmpty()) {
                    $hargaCustom = $item->hargaCabang->first();
                    $item->harga_asal = $hargaCustom->harga_asal ?? $item->harga_asal;
                    $item->harga_konsumen = $hargaCustom->harga_konsumen ?? $item->harga_konsumen;
                    $item->harga_konter = $hargaCustom->harga_konter ?? $item->harga_konter;
                    $item->harga_partai = $hargaCustom->harga_partai ?? $item->harga_partai;
                }
                return $item;
            });
        }
        
        return response()->json([
            'success' => true,
            'data' => $barang->items(),
            'meta' => [
                'current_page' => $barang->currentPage(),
                'from' => $barang->firstItem(),
                'last_page' => $barang->lastPage(),
                'per_page' => $barang->perPage(),
                'to' => $barang->lastItem(),
                'total' => $barang->total(),
            ],
        ]);
    }

    /**
     * Get stock data for a specific product for all branches (AJAX)
     */
    public function getStokData($barang_id)
    {
        $stok = StokCabang::where('barang_id', $barang_id)
            ->get()
            ->keyBy('cabang_id');
            
        return response()->json([
            'success' => true,
            'data' => $stok
        ]);
    }

    /**
     * Batch update stok untuk beberapa cabang sekaligus (Supervisor/Super Admin)
     */
    public function batchUpdateStok(Request $request)
    {
        $user = Auth::user();
        if (!$user->hasRole('super_admin') && !$user->hasRole('supervisor')) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk fitur ini.');
        }

        $validator = Validator::make($request->all(), [
            'barang_id' => 'required|exists:barang,id',
            'updates' => 'required|array',
            'updates.*.cabang_id' => 'required|exists:cabang,id',
            'updates.*.jumlah_stok' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->with('error', 'Validasi gagal: ' . $validator->errors()->first());
        }

        foreach ($request->updates as $update) {
            StokCabang::updateOrCreate(
                [
                    'barang_id' => $request->barang_id,
                    'cabang_id' => $update['cabang_id'],
                ],
                [
                    'jumlah_stok' => $update['jumlah_stok'],
                ]
            );
        }

        return redirect()->back()->with('success', 'Stok berhasil diperbarui untuk ' . count($request->updates) . ' cabang');
    }
}
