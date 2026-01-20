import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, usePage } from "@inertiajs/react";
import { Plus, Printer } from "lucide-react";
import ReturPenjualanStats from "./partials/retur-penjualan-stats";
import ReturPenjualanTable from "./partials/retur-penjualan-table";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface ReturPenjualan {
    id: number;
    nomor_retur: string;
    tanggal_retur: string;
    nomor_transaksi: string;
    total_item: number;
    total_nilai_retur: number;
    status_retur: "pending" | "disetujui" | "ditolak";
    kasir: string;
}

interface Stats {
    total: number;
    pending: number;
    disetujui: number;
    ditolak: number;
}

interface Props {
    returs: ReturPenjualan[];
    stats: Stats;
}

export default function ReturPenjualanIndex({ returs, stats }: Props) {
    const { flash } = usePage<any>().props;
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [transaksiCetak, setTransaksiCetak] = useState<any>(null);

    useEffect(() => {
        if (flash.transaksi_baru) {
            setTransaksiCetak(flash.transaksi_baru);
            setShowPrintModal(true);
        }
    }, [flash]);

    const formatRupiah = (value: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const handlePrint = () => {
        if (!transaksiCetak) return;

        const printWindow = window.open('', '', 'width=300,height=600');
        if (!printWindow) return;

        // Map items from backend structure to print structure
        const items = transaksiCetak.detail_transaksi.map((item: any) => ({
            nama_barang: item.nama_barang,
            jumlah: item.jumlah,
            harga_jual: item.harga_jual,
            subtotal: item.subtotal
        }));

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Struk - ${transaksiCetak.nomor_transaksi}</title>
                <style>
                    @media print {
                        @page { margin: 0; size: 57.5mm auto; }
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Courier New', monospace; 
                        font-size: 7px; 
                        width: 49mm;
                        max-width: 49mm;
                        padding: 1mm 3mm 1mm 8mm;
                        line-height: 1.1;
                        overflow: hidden;
                        font-weight: bold;
                        color: #000;
                    }
                    .center { text-align: center; }
                    .line { border-top: 1px dashed #000; margin: 2px 0; }
                    .row { display: flex; justify-content: space-between; margin: 1px 0; font-size: 7px; gap: 3px; }
                    .row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 45%; }
                    .row span:last-child { text-align: right; }
                    .item { margin: 1px 0; }
                    .item-name { font-size: 7px; word-wrap: break-word; overflow-wrap: break-word; line-height: 1.2; }
                    .item-detail { display: flex; justify-content: space-between; font-size: 6px; gap: 3px; }
                    .item-detail span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 52%; }
                    .item-detail span:last-child { flex-shrink: 0; }
                    .total { font-size: 8px; margin-top: 1px; }
                    .footer { margin-top: 4px; font-size: 6px; line-height: 1.2; }
                    .logo { width: 38px; height: auto; margin: 2px auto 2px; display: block; }
                </style>
            </head>
            <body>
                <div class="center">
                    <img src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/jms/logo-jms.png" alt="Logo" class="logo" />
                </div>
                <div class="center bold" style="font-size: 8px; margin-bottom: 1px;">JAYA MAKMUR SPAREPART</div>
                <div class="center" style="font-size: 6px;">Cbg ${transaksiCetak.cabang?.nama_cabang || '-'}</div>
                <div class="center" style="font-size: 6px;">${transaksiCetak.cabang?.alamat || '-'}</div>
                <div class="center" style="font-size: 6px; margin-bottom: 2px;">Telp: ${transaksiCetak.cabang?.telepon || '-'}</div>
                <div class="line"></div>
                <div class="center" style="font-size: 6px; margin-bottom: 2px;">STRUK PENJUALAN (RETUR)</div>
                <div class="line"></div>
                
                <div class="row">
                    <span>No.</span>
                    <span class="bold">${transaksiCetak.nomor_transaksi}</span>
                </div>
                <div class="row">
                    <span>Tgl</span>
                    <span style="font-size: 7px;">${new Date(transaksiCetak.tanggal_transaksi).toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</span>
                </div>
                <div class="row">
                    <span>Kasir</span>
                    <span>${transaksiCetak.kasir?.name || '-'}</span>
                </div>
                ${transaksiCetak.nama_pelanggan ? `
                <div class="row">
                    <span>Cust</span>
                    <span>${transaksiCetak.nama_pelanggan}</span>
                </div>
                ` : ''}
                
                <div class="line"></div>
                
                ${items.map((item: any) => `
                    <div class="item">
                        <div class="item-name bold">${item.nama_barang}</div>
                        <div class="item-detail">
                            <span>${item.jumlah}x@${formatRupiah(item.harga_jual).replace('Rp ', '').replace('.', '')}</span>
                            <span class="bold">${formatRupiah(item.subtotal).replace('Rp ', '').replace('.', '')}</span>
                        </div>
                    </div>
                `).join('')}
                
                <div class="line"></div>
                
                <div class="row">
                    <span>Subtotal</span>
                    <span>${formatRupiah(transaksiCetak.subtotal)}</span>
                </div>
                
                <div class="line"></div>
                
                <div class="row bold total">
                    <span>TOTAL</span>
                    <span>${formatRupiah(transaksiCetak.total_bayar)}</span>
                </div>
                <div class="row">
                    <span>Bayar</span>
                    <span>${formatRupiah(transaksiCetak.jumlah_bayar)}</span>
                </div>
                <div class="row bold">
                    <span>Kembali</span>
                    <span>${formatRupiah(transaksiCetak.kembalian)}</span>
                </div>
                
                <div class="line"></div>
                
                <div class="center footer">
                    Terima kasih atas kunjungan Anda<br>
                    Barang yang sudah dibeli<br>tidak dapat dikembalikan
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <AppLayout>
            <Head title="Retur Penjualan" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Retur Penjualan</h1>
                        <p className="text-muted-foreground">
                            Kelola retur penjualan dan pengembalian barang
                        </p>
                    </div>
                    <Link href="/retur-penjualan/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Retur Baru
                        </Button>
                    </Link>
                </div>

                <ReturPenjualanStats stats={stats} />

                <ReturPenjualanTable returs={returs} />

                <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Transaksi Berhasil</DialogTitle>
                        </DialogHeader>
                        <div className="py-6">
                            <p className="text-center text-muted-foreground mb-4">
                                Transaksi tukar barang berhasil dibuat.
                            </p>
                            <div className="bg-muted p-4 rounded-lg text-center space-y-2">
                                <div className="text-sm font-medium">Total Bayar</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {transaksiCetak && formatRupiah(transaksiCetak.total_bayar)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {transaksiCetak && transaksiCetak.nomor_transaksi}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex sm:justify-center gap-2">
                            <Button variant="outline" onClick={() => setShowPrintModal(false)}>
                                Tutup
                            </Button>
                            <Button onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Cetak Struk
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
