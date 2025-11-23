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
    public function index()
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('super_admin');
        
        // Jika super admin, load stok semua cabang. Jika tidak, hanya cabang sendiri
        $barang = Barang::with(['kategori', 'suplier', 'stokCabang' => function ($query) use ($isSuperAdmin, $user) {
                if (!$isSuperAdmin) {
                    $query->where('cabang_id', $user->cabang_id);
                }
                $query->with('cabang:id,nama_cabang');
            }])
            ->orderBy('nama_barang')
            ->get();
        
        // Get kategori and suplier for form
        $kategori = KategoriBarang::where('status_aktif', true)
            ->orderBy('nama_kategori')
            ->get();
        
        $suplier = Suplier::where('status_aktif', true)
            ->orderBy('nama_suplier')
            ->get();
        
        // Get all cabang untuk super admin
        $cabang = $isSuperAdmin ? Cabang::where('status_aktif', true)->orderBy('nama_cabang')->get() : [];
        
        // Stats
        $total = Barang::count();
        $aktif = Barang::where('status_aktif', true)->count();
        $nonaktif = Barang::where('status_aktif', false)->count();

        return Inertia::render('barang/index', [
            'barang' => $barang,
            'kategori' => $kategori,
            'suplier' => $suplier,
            'cabang' => $cabang,
            'is_super_admin' => $isSuperAdmin,
            'stats' => [
                'total' => $total,
                'aktif' => $aktif,
                'nonaktif' => $nonaktif,
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
            // Keep existing barcode
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

        $cabangId = auth()->user()->cabang_id;

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
}
