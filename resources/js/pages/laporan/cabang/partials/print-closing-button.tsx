import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { ChevronDown, Loader2, Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PrintClosingButtonProps {
    filters: {
        filter_type: string;
        tanggal: string | null;
        tahun: string | null;
        bulan: string | null;
    };
}

interface ClosingData {
    cabang: {
        nama: string;
        alamat: string;
        telepon: string;
    };
    periode: string;
    filter_type: string;
    tanggal_cetak: string;
    transaksi: Array<{
        nomor_transaksi: string;
        tanggal_transaksi: string;
        total_harga: number;
        metode_pembayaran: string;
        kasir: string;
    }>;
    services: Array<{
        nomor_service: string;
        tanggal: string;
        total_biaya: number;
        pelanggan: string;
    }>;
    expenses: Array<{
        keterangan: string;
        jumlah: number;
        kategori_pengeluaran: string;
    }>;
    per_metode: {
        tunai: number;
        transfer: number;
        qris: number;
        edc: number;
    };
    summary: {
        total_penjualan: number;
        total_service: number;
        total_pengeluaran: number;
        total_retur: number;
        pendapatan_kotor: number;
        pendapatan_bersih: number;
        jumlah_transaksi: number;
        jumlah_service: number;
        jumlah_pengeluaran: number;
        cash_flow: {
            masuk_tunai: number;
            keluar_pengeluaran: number;
            keluar_retur: number;
            sisa_uang_cash: number;
        };
    };
}

type PrintType = 'all' | 'penjualan' | 'service' | 'expenses';

export function PrintClosingButton({ filters }: PrintClosingButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const formatRupiah = (value: number): string => {
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    const handlePrint = async (printType: PrintType) => {
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            params.append('filter_type', filters.filter_type);

            if (filters.filter_type === 'harian' && filters.tanggal) {
                params.append('tanggal', filters.tanggal);
            } else if (filters.filter_type === 'bulanan') {
                if (filters.tahun) params.append('tahun', filters.tahun);
                if (filters.bulan) params.append('bulan', filters.bulan);
            }

            const response = await axios.get<ClosingData>(`/laporan/cabang/closing?${params.toString()}`);
            const data = response.data;

            const printWindow = window.open('', '', 'width=300,height=600');
            if (!printWindow) {
                toast.error('Gagal membuka jendela print');
                return;
            }

            // Determine title and content based on print type
            let title = 'LAPORAN CLOSING';
            let showPenjualan = true;
            let showService = true;
            let showExpenses = true;

            if (printType === 'penjualan') {
                title = 'CLOSING PENJUALAN';
                showService = false;
                showExpenses = false;
            } else if (printType === 'service') {
                title = 'CLOSING SERVICE';
                showPenjualan = false;
                showExpenses = false;
            } else if (printType === 'expenses') {
                title = 'CLOSING PENGELUARAN';
                showPenjualan = false;
                showService = false;
            }

            // Calculate totals based on what's shown
            const totalPenjualan = showPenjualan ? data.summary.total_penjualan : 0;
            const totalService = showService ? data.summary.total_service : 0;
            const totalPendapatan = totalPenjualan + totalService;
            const totalPengeluaran = showExpenses ? data.summary.total_pengeluaran : 0;
            const totalBersih = totalPendapatan - totalPengeluaran;

            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${title} - ${data.periode}</title>
                    <style>
                        @media print {
                            @page { margin: 0; size: 57.5mm auto; }
                        }
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Courier New', monospace; 
                            font-size: 7px; 
                            width: 48mm;
                            padding: 1mm 2mm;
                            line-height: 1.1;
                            overflow: hidden;
                            font-weight: bold;
                            color: #000;
                        }
                        .center { text-align: center; }
                        .line { border-top: 1px dashed #000; margin: 2px 0; }
                        .double-line { border-top: 2px solid #000; margin: 3px 0; }
                        .row { display: flex; justify-content: space-between; margin: 1px 0; font-size: 7px; gap: 3px; }
                        .row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                        .row span:first-child { max-width: 55%; }
                        .row span:last-child { text-align: right; flex-shrink: 0; }
                        .section-title { font-size: 7px; margin: 3px 0 2px 0; text-decoration: underline; }
                        .item { margin: 1px 0; }
                        .item-row { display: flex; justify-content: space-between; font-size: 6px; gap: 2px; }
                        .item-row span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; }
                        .item-row span:last-child { flex-shrink: 0; text-align: right; }
                        .total-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 8px; }
                        .grand-total { font-size: 10px; margin: 4px 0; }
                        .footer { margin-top: 4px; font-size: 6px; line-height: 1.2; }
                        .logo { width: 38px; height: auto; margin: 2px auto 2px; display: block; }
                        .metode-section { margin: 3px 0; padding: 2px 0; }
                        .metode-row { display: flex; justify-content: space-between; font-size: 6px; margin: 1px 0; }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <img src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/jms/logo-jms.png" alt="Logo" class="logo" />
                    </div>
                    <div class="center" style="font-size: 8px; margin-bottom: 1px;">JAYA MAKMUR SPAREPART</div>
                    <div class="center" style="font-size: 6px;">Cbg ${data.cabang.nama}</div>
                    ${data.cabang.alamat !== '-' ? `<div class="center" style="font-size: 6px;">${data.cabang.alamat}</div>` : ''}
                    ${data.cabang.telepon !== '-' ? `<div class="center" style="font-size: 6px; margin-bottom: 2px;">Telp: ${data.cabang.telepon}</div>` : ''}
                    <div class="line"></div>
                    <div class="center" style="font-size: 7px; margin-bottom: 2px;">${title}</div>
                    <div class="line"></div>
                    
                    <div class="row">
                        <span>Periode:</span>
                        <span>${data.periode}</span>
                    </div>
                    <div class="row">
                        <span>Dicetak:</span>
                        <span>${data.tanggal_cetak}</span>
                    </div>
                    
                    <div class="line"></div>
                    
                    ${showPenjualan ? `
                        ${data.transaksi.length > 0 ? `
                            <div class="section-title">TRANSAKSI PENJUALAN (${data.summary.jumlah_transaksi})</div>
                            ${data.transaksi.map(trx => `
                                <div class="item">
                                    <div class="item-row">
                                        <span>${trx.nomor_transaksi}</span>
                                        <span>${formatRupiah(trx.total_harga)}</span>
                                    </div>
                                </div>
                            `).join('')}
                            <div class="row" style="margin-top: 3px;">
                                <span>Total Penjualan</span>
                                <span>${formatRupiah(data.summary.total_penjualan)}</span>
                            </div>
                            
                            <div class="line"></div>
                            
                            <div class="section-title">PER METODE BAYAR</div>
                            <div class="metode-section">
                                ${data.per_metode.tunai > 0 ? `
                                    <div class="metode-row">
                                        <span>Tunai</span>
                                        <span>${formatRupiah(data.per_metode.tunai)}</span>
                                    </div>
                                ` : ''}
                                ${data.per_metode.transfer > 0 ? `
                                    <div class="metode-row">
                                        <span>Transfer</span>
                                        <span>${formatRupiah(data.per_metode.transfer)}</span>
                                    </div>
                                ` : ''}
                                ${data.per_metode.qris > 0 ? `
                                    <div class="metode-row">
                                        <span>QRIS</span>
                                        <span>${formatRupiah(data.per_metode.qris)}</span>
                                    </div>
                                ` : ''}
                                ${data.per_metode.edc > 0 ? `
                                    <div class="metode-row">
                                        <span>EDC</span>
                                        <span>${formatRupiah(data.per_metode.edc)}</span>
                                    </div>
                                ` : ''}
                                ${(data.per_metode.tunai === 0 && data.per_metode.transfer === 0 && data.per_metode.qris === 0 && data.per_metode.edc === 0) ? `
                                    <div style="font-size: 6px; text-align: center;">-</div>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="section-title">TRANSAKSI PENJUALAN</div>
                            <div style="font-size: 6px; text-align: center; margin: 2px 0;">Tidak ada transaksi</div>
                            <div class="row" style="margin-top: 3px;">
                                <span>Total Penjualan</span>
                                <span>${formatRupiah(0)}</span>
                            </div>
                        `}
                        <div class="line"></div>
                    ` : ''}
                    
                    ${showService ? `
                        ${data.services.length > 0 ? `
                            <div class="section-title">SERVICE HP (${data.summary.jumlah_service})</div>
                            ${data.services.map(svc => `
                                <div class="item">
                                    <div class="item-row">
                                        <span>${svc.nomor_service}</span>
                                        <span>${formatRupiah(svc.total_biaya)}</span>
                                    </div>
                                </div>
                            `).join('')}
                            <div class="row" style="margin-top: 3px;">
                                <span>Total Service</span>
                                <span>${formatRupiah(data.summary.total_service)}</span>
                            </div>
                        ` : `
                            <div class="section-title">SERVICE HP</div>
                            <div style="font-size: 6px; text-align: center; margin: 2px 0;">Tidak ada service</div>
                            <div class="row" style="margin-top: 3px;">
                                <span>Total Service</span>
                                <span>${formatRupiah(0)}</span>
                            </div>
                        `}
                        <div class="line"></div>
                    ` : ''}

                    ${showExpenses ? `
                        <div class="section-title">PENGELUARAN (${data.summary.jumlah_pengeluaran})</div>
                        ${data.expenses.length > 0 ? `
                            ${data.expenses.map(exp => `
                                <div class="item">
                                    <div class="item-row">
                                        <span>${exp.keterangan || exp.kategori_pengeluaran}</span>
                                        <span>${formatRupiah(exp.jumlah)}</span>
                                    </div>
                                </div>
                            `).join('')}
                            <div class="row" style="margin-top: 3px;">
                                <span>Total Pengeluaran</span>
                                <span>${formatRupiah(data.summary.total_pengeluaran)}</span>
                            </div>
                        ` : `
                            <div style="font-size: 6px; text-align: center; margin: 2px 0;">Tidak ada pengeluaran</div>
                        `}
                        <div class="line"></div>
                    ` : ''}
                    
                    <div class="double-line"></div>
                    
                    ${printType === 'all' ? `
                    <div class="row total-row">
                        <span>Total Pendapatan</span>
                        <span>${formatRupiah(totalPendapatan)}</span>
                    </div>
                    <div class="row total-row" style="color: red;">
                        <span>Total Pengeluaran</span>
                        <span>- ${formatRupiah(totalPengeluaran)}</span>
                    </div>
                    <div class="row total-row grand-total">
                        <span>LABA BERSIH (Harian)</span>
                        <span>${formatRupiah(totalBersih)}</span>
                    </div>

                    <div class="line"></div>
                    <div class="section-title center">RINCIAN KEUANGAN</div>

                    <div class="row item-row">
                        <span>Total Tunai (Cash)</span>
                        <span>${formatRupiah(data.per_metode.tunai)}</span>
                    </div>
                    ${data.per_metode.transfer > 0 ? `
                        <div class="row item-row">
                            <span>Total Transfer</span>
                            <span>${formatRupiah(data.per_metode.transfer)}</span>
                        </div>
                    ` : ''}
                    ${data.per_metode.qris > 0 ? `
                        <div class="row item-row">
                            <span>Total QRIS</span>
                            <span>${formatRupiah(data.per_metode.qris)}</span>
                        </div>
                    ` : ''}
                    ${data.per_metode.edc > 0 ? `
                        <div class="row item-row">
                            <span>Total EDC</span>
                            <span>${formatRupiah(data.per_metode.edc)}</span>
                        </div>
                    ` : ''}

                    <div class="line"></div>
                    <div class="section-title center">SISA UANG CASH</div>
                    
                    <div class="row item-row">
                        <span>Masuk (Tunai)</span>
                        <span>${formatRupiah(data.summary.cash_flow.masuk_tunai)}</span>
                    </div>
                     <div class="row item-row">
                        <span>Pengeluaran</span>
                        <span>- ${formatRupiah(data.summary.cash_flow.keluar_pengeluaran)}</span>
                    </div>
                    ${data.summary.cash_flow.keluar_retur > 0 ? `
                    <div class="row item-row">
                        <span>Retur</span>
                        <span>- ${formatRupiah(data.summary.cash_flow.keluar_retur)}</span>
                    </div>
                    ` : ''}
                    <div class="row total-row grand-total" style="margin-top: 4px; border-top: 1px dashed black; padding-top: 2px;">
                        <span>SISA CASH</span>
                        <span>${formatRupiah(data.summary.cash_flow.sisa_uang_cash)}</span>
                    </div>
                    ` : `
                    <div class="row total-row grand-total">
                        <span>TOTAL</span>
                        <span>${formatRupiah(totalBersih < 0 ? Math.abs(totalBersih) : totalBersih)}</span>
                    </div>
                    `}
                    
                    <div class="line"></div>
                    
                    <div class="center footer">
                        Laporan ini dicetak secara otomatis<br>
                        JMS - Jaya Makmur Sparepart
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

        } catch (error) {
            console.error('Print error:', error);
            toast.error('Gagal memuat data laporan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Printer className="mr-2 h-4 w-4" />
                    )}
                    Print Closing
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePrint('all')}>
                    <Printer className="mr-2 h-4 w-4" />
                    Semua (Penjualan + Service)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePrint('penjualan')}>
                    <Printer className="mr-2 h-4 w-4" />
                    Penjualan Saja
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePrint('service')}>
                    <Printer className="mr-2 h-4 w-4" />
                    Service Saja
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePrint('expenses')}>
                    <Printer className="mr-2 h-4 w-4" />
                    Pengeluaran Saja
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
