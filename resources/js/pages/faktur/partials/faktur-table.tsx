import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Edit, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Faktur {
    id: number;
    nomor_faktur: string;
    tanggal_faktur: string;
    nama_pelanggan: string;
    telepon_pelanggan: string | null;
    alamat_pelanggan: string | null;
    subtotal: number;
    diskon: number;
    total_bayar: number;
    status_pembayaran: string;
    tanggal_jatuh_tempo: string | null;
    kasir: string;
    nomor_transaksi: string;
}

interface FakturDetail extends Faktur {
    keterangan: string | null;
    cabang_nama: string;
    cabang_alamat: string;
    cabang_telepon: string;
    items: Array<{
        nama_barang: string;
        qty: number;
        harga: number;
        subtotal: number;
    }>;
}

interface Props {
    fakturs: Faktur[];
}

export default function FakturTable({ fakturs }: Props) {
    console.log('FakturTable - fakturs:', fakturs);
    
    const [selectedFaktur, setSelectedFaktur] =
        useState<FakturDetail | null>(null);
    const [showPrintModal, setShowPrintModal] = useState(false);

    const handleDelete = async (id: number, nomorFaktur: string) => {
        if (!confirm(`Hapus faktur ${nomorFaktur}?`)) return;

        try {
            await axios.delete(`/faktur/${id}`);
            toast.success('Faktur berhasil dihapus');
            router.reload();
        } catch (error) {
            toast.error('Gagal menghapus faktur');
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await axios.put(`/faktur/${id}`, {
                status_pembayaran: newStatus,
            });
            toast.success('Status pembayaran berhasil diubah');
            router.reload();
        } catch (error) {
            toast.error('Gagal mengubah status');
        }
    };

    const handlePrint = async (id: number) => {
        try {
            const response = await axios.get(`/faktur/${id}/detail`);
            setSelectedFaktur(response.data);
            setShowPrintModal(true);
        } catch (error) {
            toast.error('Gagal memuat detail faktur');
        }
    };

    const handlePrintFaktur = () => {
        if (!selectedFaktur) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Faktur - ${selectedFaktur.nomor_faktur}</title>
                <style>
                    @page { 
                        size: A4; 
                        margin: 15mm; 
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        position: relative;
                        padding: 20px;
                        color: #1a1a1a;
                        background: #fff;
                    }
                    
                    /* Watermark Logo */
                    .watermark {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        opacity: 0.08;
                        z-index: 0;
                        pointer-events: none;
                    }
                    .watermark img {
                        width: 400px;
                        height: auto;
                    }
                    
                    /* Content wrapper */
                    .content {
                        position: relative;
                        z-index: 1;
                    }
                    
                    /* Header Section */
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #2563eb;
                        margin-bottom: 30px;
                    }
                    .header-left {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    }
                    .logo {
                        width: 80px;
                        height: 80px;
                        object-fit: contain;
                    }
                    .company-details h1 {
                        font-size: 24px;
                        font-weight: 700;
                        color: #2563eb;
                        margin-bottom: 5px;
                    }
                    .company-details p {
                        font-size: 11px;
                        color: #666;
                        line-height: 1.5;
                    }
                    .header-right {
                        text-align: right;
                    }
                    .invoice-title {
                        font-size: 32px;
                        font-weight: 800;
                        color: #2563eb;
                        letter-spacing: 2px;
                        margin-bottom: 5px;
                    }
                    .invoice-subtitle {
                        font-size: 11px;
                        color: #666;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    /* Invoice Info */
                    .invoice-info {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        gap: 30px;
                    }
                    .info-box {
                        flex: 1;
                        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid #bae6fd;
                    }
                    .info-label {
                        font-size: 10px;
                        font-weight: 600;
                        color: #0369a1;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-bottom: 10px;
                    }
                    .info-content {
                        font-size: 13px;
                        line-height: 1.6;
                    }
                    .info-content strong {
                        font-size: 15px;
                        color: #0c4a6e;
                        display: block;
                        margin-bottom: 3px;
                    }
                    .invoice-meta {
                        background: #fff;
                        border: 2px solid #2563eb;
                    }
                    .invoice-meta .meta-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .invoice-meta .meta-row:last-child {
                        border-bottom: none;
                    }
                    .invoice-meta .meta-label {
                        font-weight: 600;
                        color: #374151;
                    }
                    .invoice-meta .meta-value {
                        color: #1f2937;
                        font-weight: 600;
                    }
                    
                    /* Status Badge */
                    .status-badge {
                        display: inline-block;
                        padding: 6px 16px;
                        border-radius: 20px;
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .status-lunas {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: white;
                        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                    }
                    .status-belum {
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                        color: white;
                        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
                    }
                    .status-cicilan {
                        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                        color: white;
                        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
                    }
                    
                    /* Table */
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 25px 0;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .items-table thead {
                        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                        color: white;
                    }
                    .items-table th {
                        padding: 14px 12px;
                        text-align: left;
                        font-weight: 600;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .items-table tbody tr {
                        border-bottom: 1px solid #e5e7eb;
                        transition: background 0.2s;
                    }
                    .items-table tbody tr:nth-child(even) {
                        background: #f9fafb;
                    }
                    .items-table tbody tr:hover {
                        background: #f0f9ff;
                    }
                    .items-table td {
                        padding: 12px;
                        font-size: 12px;
                        color: #374151;
                    }
                    .text-center {
                        text-align: center;
                    }
                    .text-right {
                        text-align: right;
                    }
                    
                    /* Summary */
                    .summary-section {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 30px;
                    }
                    .summary-box {
                        width: 350px;
                        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                        border: 2px solid #cbd5e1;
                        border-radius: 12px;
                        padding: 20px;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        font-size: 13px;
                    }
                    .summary-row.subtotal {
                        color: #64748b;
                    }
                    .summary-row.discount {
                        color: #dc2626;
                        font-weight: 600;
                    }
                    .summary-row.total {
                        margin-top: 10px;
                        padding-top: 15px;
                        border-top: 3px double #2563eb;
                        font-size: 18px;
                        font-weight: 800;
                        color: #1e40af;
                    }
                    .summary-row.total .amount {
                        color: #2563eb;
                    }
                    
                    /* Notes */
                    .notes-section {
                        margin-top: 30px;
                        padding: 20px;
                        background: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        border-radius: 8px;
                    }
                    .notes-title {
                        font-weight: 700;
                        color: #92400e;
                        margin-bottom: 8px;
                        font-size: 13px;
                    }
                    .notes-content {
                        color: #78350f;
                        font-size: 12px;
                        line-height: 1.6;
                    }
                    
                    /* Footer */
                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 2px solid #e5e7eb;
                        text-align: center;
                    }
                    .footer-thank {
                        font-size: 16px;
                        font-weight: 600;
                        color: #2563eb;
                        margin-bottom: 10px;
                    }
                    .footer-info {
                        font-size: 10px;
                        color: #9ca3af;
                        line-height: 1.6;
                    }
                    
                    @media print {
                        body { 
                            padding: 0;
                        }
                        .items-table tbody tr:hover {
                            background: inherit;
                        }
                    }
                </style>
            </head>
            <body>
                <!-- Watermark -->
                <div class="watermark">
                    <img src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/jms/logo-jms.png" alt="Watermark">
                </div>
                
                <!-- Content -->
                <div class="content">
                    <!-- Header -->
                    <div class="header">
                        <div class="header-left">
                            <img src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/jms/logo-jms.png" class="logo" alt="Logo">
                            <div class="company-details">
                                <h1>${selectedFaktur.cabang_nama}</h1>
                                ${selectedFaktur.cabang_alamat ? `<p>📍 ${selectedFaktur.cabang_alamat}</p>` : ''}
                                ${selectedFaktur.cabang_telepon ? `<p>📞 ${selectedFaktur.cabang_telepon}</p>` : ''}
                            </div>
                        </div>
                        <div class="header-right">
                            <div class="invoice-title">FAKTUR</div>
                            <div class="invoice-subtitle">Sales Invoice</div>
                        </div>
                    </div>
                    
                    <!-- Invoice Info -->
                    <div class="invoice-info">
                        <!-- Customer Info -->
                        <div class="info-box">
                            <div class="info-label">Ditagih Kepada</div>
                            <div class="info-content">
                                <strong>${selectedFaktur.nama_pelanggan}</strong>
                                ${selectedFaktur.telepon_pelanggan ? `<div>📱 ${selectedFaktur.telepon_pelanggan}</div>` : ''}
                                ${selectedFaktur.alamat_pelanggan ? `<div>📍 ${selectedFaktur.alamat_pelanggan}</div>` : ''}
                            </div>
                        </div>
                        
                        <!-- Invoice Meta -->
                        <div class="info-box invoice-meta">
                            <div class="meta-row">
                                <span class="meta-label">No. Faktur</span>
                                <span class="meta-value">${selectedFaktur.nomor_faktur}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Tanggal</span>
                                <span class="meta-value">${new Date(selectedFaktur.tanggal_faktur).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                            ${selectedFaktur.tanggal_jatuh_tempo ? `
                            <div class="meta-row">
                                <span class="meta-label">Jatuh Tempo</span>
                                <span class="meta-value">${selectedFaktur.tanggal_jatuh_tempo}</span>
                            </div>
                            ` : ''}
                            <div class="meta-row">
                                <span class="meta-label">Status</span>
                                <span class="status-badge status-${selectedFaktur.status_pembayaran === 'lunas' ? 'lunas' : selectedFaktur.status_pembayaran === 'belum_lunas' ? 'belum' : 'cicilan'}">
                                    ${selectedFaktur.status_pembayaran === 'lunas' ? '✓ LUNAS' : selectedFaktur.status_pembayaran === 'belum_lunas' ? '⏳ BELUM LUNAS' : '💳 CICILAN'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Items Table -->
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 50px;">No</th>
                                <th>Deskripsi Barang</th>
                                <th class="text-center" style="width: 80px;">Qty</th>
                                <th class="text-right" style="width: 130px;">Harga Satuan</th>
                                <th class="text-right" style="width: 140px;">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selectedFaktur.items.map((item, index) => `
                                <tr>
                                    <td class="text-center">${index + 1}</td>
                                    <td><strong>${item.nama_barang || '-'}</strong></td>
                                    <td class="text-center">${item.qty || 0}</td>
                                    <td class="text-right">Rp ${(item.harga || 0).toLocaleString('id-ID')}</td>
                                    <td class="text-right"><strong>Rp ${(item.subtotal || 0).toLocaleString('id-ID')}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <!-- Summary -->
                    <div class="summary-section">
                        <div class="summary-box">
                            <div class="summary-row subtotal">
                                <span>Subtotal</span>
                                <span>Rp ${(selectedFaktur.subtotal || 0).toLocaleString('id-ID')}</span>
                            </div>
                            ${selectedFaktur.diskon > 0 ? `
                            <div class="summary-row discount">
                                <span>Diskon</span>
                                <span>- Rp ${(selectedFaktur.diskon || 0).toLocaleString('id-ID')}</span>
                            </div>
                            ` : ''}
                            <div class="summary-row total">
                                <span>TOTAL</span>
                                <span class="amount">Rp ${(selectedFaktur.total_bayar || 0).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Notes -->
                    ${selectedFaktur.keterangan ? `
                    <div class="notes-section">
                        <div class="notes-title">📝 Catatan:</div>
                        <div class="notes-content">${selectedFaktur.keterangan}</div>
                    </div>
                    ` : ''}
                    
                    <!-- Footer -->
                    <div class="footer">
                        <div class="footer-thank">Terima Kasih Atas Kepercayaan Anda! 🙏</div>
                        <div class="footer-info">
                            Faktur ini dicetak oleh <strong>${selectedFaktur.kasir}</strong> pada ${new Date().toLocaleString('id-ID', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}<br>
                            Dokumen ini sah sebagai bukti pembayaran yang dikeluarkan secara resmi oleh sistem.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for images and styles to load
        printWindow.onload = function() {
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        };
        
        // Fallback if onload doesn't fire
        setTimeout(() => {
            if (!printWindow.closed) {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }, 1000);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            { variant: any; label: string }
        > = {
            lunas: { variant: 'default', label: 'Lunas' },
            belum_lunas: { variant: 'secondary', label: 'Belum Lunas' },
            cicilan: { variant: 'outline', label: 'Cicilan' },
        };

        const config = variants[status] || variants.belum_lunas;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatRupiah = (value: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    try {
        return (
            <>
                <Card>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No. Faktur</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Pelanggan</TableHead>
                                        <TableHead>No. Transaksi</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Jatuh Tempo</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fakturs.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center text-muted-foreground"
                                            >
                                                Belum ada data faktur
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        fakturs.map((faktur) => (
                                        <TableRow key={faktur.id}>
                                            <TableCell className="font-medium">
                                                {faktur.nomor_faktur}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    faktur.tanggal_faktur
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {
                                                            faktur.nama_pelanggan
                                                        }
                                                    </div>
                                                    {faktur.telepon_pelanggan && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {
                                                                faktur.telepon_pelanggan
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {faktur.nomor_transaksi}
                                            </TableCell>
                                            <TableCell>
                                                {formatRupiah(
                                                    faktur.total_bayar
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {faktur.tanggal_jatuh_tempo
                                                    ? formatDate(
                                                          faktur.tanggal_jatuh_tempo
                                                      )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={
                                                        faktur.status_pembayaran
                                                    }
                                                    onValueChange={(value) =>
                                                        handleStatusChange(
                                                            faktur.id,
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="lunas">
                                                            Lunas
                                                        </SelectItem>
                                                        <SelectItem value="belum_lunas">
                                                            Belum Lunas
                                                        </SelectItem>
                                                        <SelectItem value="cicilan">
                                                            Cicilan
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handlePrint(
                                                                faktur.id
                                                            )
                                                        }
                                                        title="Print Faktur"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/faktur/${faktur.id}/edit`
                                                            )
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                faktur.id,
                                                                faktur.nomor_faktur
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Print Modal */}
            <Dialog
                open={showPrintModal}
                onOpenChange={setShowPrintModal}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Print Faktur</DialogTitle>
                    </DialogHeader>

                    {selectedFaktur && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-center space-y-1">
                                    <div className="text-sm text-gray-600">
                                        No. Faktur
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {selectedFaktur.nomor_faktur}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Pelanggan
                                    </span>
                                    <span className="font-medium">
                                        {selectedFaktur.nama_pelanggan}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Total
                                    </span>
                                    <span className="font-bold text-blue-600">
                                        {formatRupiah(
                                            selectedFaktur.total_bayar
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Status
                                    </span>
                                    <span className="font-medium">
                                        {getStatusBadge(
                                            selectedFaktur.status_pembayaran
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handlePrintFaktur}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Cetak Faktur
                                </Button>
                                <Button
                                    onClick={() =>
                                        setShowPrintModal(false)
                                    }
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
    } catch (error) {
        console.error('FakturTable render error:', error);
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-red-600">
                        Error rendering table: {error instanceof Error ? error.message : 'Unknown error'}
                    </div>
                </CardContent>
            </Card>
        );
    }
}
