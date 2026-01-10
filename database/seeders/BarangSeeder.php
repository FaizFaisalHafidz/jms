<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\KategoriBarang;
use App\Models\Suplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class BarangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Path ke file CSV
        $csvFile = base_path('BARANG SPP MITRA BATIK.csv');

        if (!File::exists($csvFile)) {
            $this->command->error("File CSV tidak ditemukan: {$csvFile}");
            return;
        }

        // Buat atau ambil supplier default
        $supplierDefault = Suplier::firstOrCreate(
            ['kode_suplier' => 'SUP-DEFAULT'],
            [
                'nama_suplier' => 'Supplier Default',
                'nama_perusahaan' => 'Supplier Default',
                'alamat' => '-',
                'telepon' => '-',
                'email' => null,
                'kontak_person' => '-',
                'status_aktif' => true,
            ]
        );

        // Baca file CSV
        $file = fopen($csvFile, 'r');
        
        // Skip header
        $header = fgetcsv($file, 0, ';');
        
        // Array untuk menyimpan kategori yang sudah dibuat
        $kategoris = [];
        
        // Counter
        $totalBarang = 0;
        $totalKategori = 0;

        $this->command->info('Memulai import data barang...');

        while (($row = fgetcsv($file, 0, ';')) !== false) {
            // Skip baris kosong
            if (empty($row[1])) {
                continue;
            }

            $namaBarang = trim($row[1]);
            
            // Tentukan kategori berdasarkan nama barang
            $namaKategori = $this->tentukanKategori($namaBarang);
            
            // Buat atau ambil kategori
            if (!isset($kategoris[$namaKategori])) {
                $kategori = KategoriBarang::firstOrCreate(
                    ['nama_kategori' => $namaKategori],
                    [
                        'deskripsi' => 'Kategori ' . $namaKategori,
                        'status_aktif' => true,
                    ]
                );
                $kategoris[$namaKategori] = $kategori->id;
                $totalKategori++;
                $this->command->info("Kategori dibuat: {$namaKategori}");
            }

            // Buat kode barang
            $kodeBarang = $this->generateKodeBarang($namaBarang, $row[0]);

            // Ambil harga dari CSV (kolom 2 dan 3)
            $hargaKonter = $this->parseHarga($row[2] ?? null);
            $hargaKonsumen = $this->parseHarga($row[3] ?? null);
            
            // Buat barang
            Barang::create([
                'kategori_id' => $kategoris[$namaKategori],
                'suplier_id' => $supplierDefault->id,
                'kode_barang' => $kodeBarang,
                'nama_barang' => $namaBarang,
                'barcode' => null,
                'merk' => $this->extractMerk($namaBarang),
                'tipe' => $this->extractTipe($namaBarang),
                'satuan' => 'PCS',
                'harga_asal' => 0,
                'harga_konsumen' => $hargaKonsumen,
                'harga_konter' => $hargaKonter,
                'stok_minimal' => 5,
                'deskripsi' => null,
                'foto_barang' => null,
                'status_aktif' => true,
            ]);

            $totalBarang++;

            // Progress setiap 100 barang
            if ($totalBarang % 100 == 0) {
                $this->command->info("Progress: {$totalBarang} barang telah diimport...");
            }
        }

        fclose($file);

        $this->command->info("========================================");
        $this->command->info("Import selesai!");
        $this->command->info("Total Kategori: {$totalKategori}");
        $this->command->info("Total Barang: {$totalBarang}");
        $this->command->info("========================================");
    }

    /**
     * Tentukan kategori berdasarkan nama barang
     */
    private function tentukanKategori(string $namaBarang): string
    {
        $namaBarang = strtoupper($namaBarang);

        // LCD & Touchscreen
        if (str_contains($namaBarang, 'LCD') || str_contains($namaBarang, 'LCDTS')) {
            // Berdasarkan brand
            if (str_contains($namaBarang, 'SAMSUNG')) {
                return 'LCD Samsung';
            } elseif (str_contains($namaBarang, 'OPPO') || str_contains($namaBarang, 'REALME')) {
                return 'LCD Oppo/Realme';
            } elseif (str_contains($namaBarang, 'VIVO')) {
                return 'LCD Vivo';
            } elseif (str_contains($namaBarang, 'XIAOMI') || str_contains($namaBarang, 'REDMI') || str_contains($namaBarang, 'POCO')) {
                return 'LCD Xiaomi';
            } elseif (str_contains($namaBarang, 'IPHONE')) {
                return 'LCD iPhone';
            } elseif (str_contains($namaBarang, 'INFINIX') || str_contains($namaBarang, 'ITEL')) {
                return 'LCD Infinix';
            } elseif (str_contains($namaBarang, 'ZENFONE')) {
                return 'LCD Asus Zenfone';
            } elseif (str_contains($namaBarang, 'NOKIA')) {
                return 'LCD Nokia';
            } elseif (str_contains($namaBarang, 'HUAWEI')) {
                return 'LCD Huawei';
            }
            return 'LCD Lainnya';
        }

        // Flexible/Flexibel
        if (str_contains($namaBarang, 'FLX') || str_contains($namaBarang, 'FLEXIBEL')) {
            // FLX TC (Touchscreen)
            if (str_contains($namaBarang, 'FLX TC')) {
                if (str_contains($namaBarang, 'VIVO')) {
                    return 'Flexible Touchscreen Vivo';
                } elseif (str_contains($namaBarang, 'IPHONE')) {
                    return 'Flexible Touchscreen iPhone';
                } elseif (str_contains($namaBarang, 'OPPO') || str_contains($namaBarang, 'REALME')) {
                    return 'Flexible Touchscreen Oppo/Realme';
                } elseif (str_contains($namaBarang, 'XIAOMI') || str_contains($namaBarang, 'REDMI')) {
                    return 'Flexible Touchscreen Xiaomi';
                } elseif (str_contains($namaBarang, 'SAMSUNG')) {
                    return 'Flexible Touchscreen Samsung';
                } elseif (str_contains($namaBarang, 'INFINIX')) {
                    return 'Flexible Touchscreen Infinix';
                } elseif (str_contains($namaBarang, 'ZENFONE')) {
                    return 'Flexible Touchscreen Asus';
                }
                return 'Flexible Touchscreen Lainnya';
            }
            
            // FLX ON/OF & VOL
            if (str_contains($namaBarang, 'ON/OF') || str_contains($namaBarang, 'VOL')) {
                if (str_contains($namaBarang, 'OPPO') || str_contains($namaBarang, 'REALME')) {
                    return 'Flexible Button Oppo/Realme';
                } elseif (str_contains($namaBarang, 'XIAOMI') || str_contains($namaBarang, 'REDMI')) {
                    return 'Flexible Button Xiaomi';
                } elseif (str_contains($namaBarang, 'SAMSUNG')) {
                    return 'Flexible Button Samsung';
                } elseif (str_contains($namaBarang, 'VIVO')) {
                    return 'Flexible Button Vivo';
                } elseif (str_contains($namaBarang, 'INFINIX')) {
                    return 'Flexible Button Infinix';
                } elseif (str_contains($namaBarang, 'IPHONE')) {
                    return 'Flexible Button iPhone';
                } elseif (str_contains($namaBarang, 'ZENFONE')) {
                    return 'Flexible Button Asus';
                }
                return 'Flexible Button Lainnya';
            }

            // FLX FINGER PRINT
            if (str_contains($namaBarang, 'FINGER')) {
                return 'Flexible Fingerprint';
            }

            // FLX BOARD
            if (str_contains($namaBarang, 'BOARD')) {
                return 'Flexible Board';
            }

            // FLX SIM
            if (str_contains($namaBarang, 'SIM')) {
                return 'Flexible SIM';
            }

            // FLX HOME BUTTON
            if (str_contains($namaBarang, 'HOME BUTTON')) {
                return 'Flexible Home Button';
            }

            // FLX HF (Handsfree/Headphone Jack)
            if (str_contains($namaBarang, 'HF')) {
                return 'Flexible Handsfree Jack';
            }

            return 'Flexible Lainnya';
        }

        // Speaker
        if (str_contains($namaBarang, 'SPEAKER')) {
            return 'Speaker';
        }

        // Bazer/Buzzer
        if (str_contains($namaBarang, 'BAZER')) {
            return 'Bazer/Buzzer';
        }

        // Kamera
        if (str_contains($namaBarang, 'KAMERA') || str_contains($namaBarang, 'KACA KAMERA')) {
            if (str_contains($namaBarang, 'KACA')) {
                return 'Kaca Kamera';
            }
            return 'Kamera';
        }

        // SIM Lock/Simtray
        if (str_contains($namaBarang, 'SIMLOCK')) {
            return 'SIM Tray';
        }

        // Pernik/Rubber
        if (str_contains($namaBarang, 'PERNIK') || str_contains($namaBarang, 'RUBER')) {
            return 'Pernik Rubber';
        }

        // Frame
        if (str_contains($namaBarang, 'FRAME') || str_contains($namaBarang, 'MIDLE')) {
            return 'Frame/Middle Housing';
        }

        // Backdoor
        if (str_contains($namaBarang, 'BACKDOR')) {
            return 'Backdoor/Back Cover';
        }

        // Touchscreen
        if (str_contains($namaBarang, 'TOUCHSCREEN')) {
            return 'Touchscreen';
        }

        // Konektor
        if (str_contains($namaBarang, 'CONEKTOR') || str_contains($namaBarang, 'CON ')) {
            return 'Konektor';
        }

        // Kabel
        if (str_contains($namaBarang, 'KABEL')) {
            return 'Kabel';
        }

        // Jaring/Penutup
        if (str_contains($namaBarang, 'JARING') || str_contains($namaBarang, 'PENUTUP')) {
            return 'Jaring/Penutup Lubang';
        }

        // IC
        if (str_contains($namaBarang, 'IC ')) {
            return 'IC Komponen';
        }

        // Glass OCA
        if (str_contains($namaBarang, 'GLASS OCA') || str_contains($namaBarang, 'OCA')) {
            return 'Glass OCA';
        }

        // Home Button (tanpa FLX)
        if (str_contains($namaBarang, 'HOME BUTTON')) {
            return 'Home Button';
        }

        // MIC
        if (str_contains($namaBarang, 'MIC ')) {
            return 'Microphone';
        }

        // Plug In / Port Charging
        if (str_contains($namaBarang, 'PLUG IN')) {
            return 'Plug In/Port Charging';
        }

        // Switch
        if (str_contains($namaBarang, 'SWITCH')) {
            return 'Switch/Saklar';
        }

        // Baud
        if (str_contains($namaBarang, 'BAUD')) {
            return 'Baud';
        }

        // Alat & Tools
        if (str_contains($namaBarang, 'LEM ') || 
            str_contains($namaBarang, 'SOLDER') || 
            str_contains($namaBarang, 'OBENG') || 
            str_contains($namaBarang, 'PINSET') || 
            str_contains($namaBarang, 'TIMAH') ||
            str_contains($namaBarang, 'BLOWER') ||
            str_contains($namaBarang, 'MATA SOLDER')) {
            return 'Alat & Tools';
        }

        return 'Sparepart Lainnya';
    }

    /**
     * Generate kode barang
     */
    private function generateKodeBarang(string $namaBarang, string $no): string
    {
        // Ambil 3 huruf pertama dari setiap kata
        $words = explode(' ', $namaBarang);
        $kode = '';
        
        foreach (array_slice($words, 0, 3) as $word) {
            $kode .= substr($word, 0, 3);
        }
        
        // Tambahkan nomor urut
        return strtoupper($kode) . '-' . str_pad($no, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Extract merk dari nama barang
     */
    private function extractMerk(string $namaBarang): ?string
    {
        $brands = [
            'SAMSUNG', 'OPPO', 'REALME', 'VIVO', 'XIAOMI', 'REDMI', 'POCO',
            'IPHONE', 'INFINIX', 'ITEL', 'ZENFONE', 'ASUS', 'NOKIA',
            'HUAWEI', 'LENOVO', 'SONY', 'BB', 'MEIZU', 'LG', 'LAVA'
        ];

        $namaUpper = strtoupper($namaBarang);
        
        foreach ($brands as $brand) {
            if (str_contains($namaUpper, $brand)) {
                return $brand;
            }
        }

        return null;
    }

    /**
     * Extract tipe/model dari nama barang
     */
    private function extractTipe(string $namaBarang): ?string
    {
        // Ambil tipe setelah brand (contoh: A51, NOTE 10, dll)
        if (preg_match('/([A-Z0-9]+(?:[-\+\/][A-Z0-9]+)*)/i', $namaBarang, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Parse harga dari string
     */
    private function parseHarga(?string $harga): int
    {
        if (empty($harga)) {
            return 0;
        }

        // Hapus karakter non-numeric kecuali koma dan titik
        $harga = preg_replace('/[^0-9,.]/', '', $harga);
        
        // Ganti koma dengan titik untuk decimal
        $harga = str_replace(',', '.', $harga);
        
        return (int) floatval($harga);
    }
}
