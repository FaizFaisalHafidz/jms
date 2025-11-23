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

interface Service {
    id: number;
    nomor_service: string;
    tanggal_masuk: string;
    nama_pelanggan: string;
    telepon_pelanggan: string;
    merk_hp: string;
    tipe_hp: string;
    keluhan: string;
    total_biaya: number;
    status_service: string;
    teknisi: string;
    tanggal_selesai: string | null;
    tanggal_diambil: string | null;
}

interface ServiceDetail extends Service {
    imei: string | null;
    kerusakan: string | null;
    spare_part_diganti: string | null;
    biaya_spare_part: number;
    biaya_jasa: number;
    keterangan: string | null;
    cabang_nama: string;
    cabang_alamat: string;
    cabang_telepon: string;
}

interface Props {
    services: Service[];
}

export default function ServiceHpTable({ services }: Props) {
    const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
    const [showPrintModal, setShowPrintModal] = useState(false);

    const handleDelete = async (id: number, nomorService: string) => {
        if (!confirm(`Hapus service ${nomorService}?`)) return;

        try {
            await axios.delete(`/service/${id}`);
            toast.success('Service berhasil dihapus');
            router.reload();
        } catch (error) {
            toast.error('Gagal menghapus service');
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await axios.put(`/service/${id}`, { status_service: newStatus });
            toast.success('Status berhasil diubah');
            router.reload();
        } catch (error) {
            toast.error('Gagal mengubah status');
        }
    };

    const handlePrint = async (id: number) => {
        try {
            const response = await axios.get(`/service/${id}/detail`);
            setSelectedService(response.data);
            setShowPrintModal(true);
        } catch (error) {
            toast.error('Gagal memuat detail service');
        }
    };

    const handlePrintStruk = () => {
        if (!selectedService) return;

        const printWindow = window.open('', '', 'width=300,height=600');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Struk Service - ${selectedService.nomor_service}</title>
                <style>
                    @media print {
                        @page { margin: 0; size: 58mm auto; }
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Courier New', monospace; 
                        font-size: 11px; 
                        width: 58mm;
                        padding: 5mm;
                        line-height: 1.4;
                    }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .line { border-top: 1px dashed #000; margin: 5px 0; }
                    .row { display: flex; justify-content: space-between; margin: 2px 0; }
                    .label { font-size: 9px; color: #666; }
                    .value { font-size: 10px; }
                    .footer { margin-top: 10px; font-size: 9px; }
                    .logo { width: 80px; height: auto; margin: 5px auto 8px; display: block; }
                </style>
            </head>
            <body>
                <div class="center">
                    <img src="https://tugasbro.sgp1.cdn.digitaloceanspaces.com/jms/logo-jms.png" alt="Logo" class="logo" />
                </div>
                <div class="center bold" style="font-size: 13px;">Cabang ${selectedService.cabang_nama}</div>
                ${selectedService.cabang_alamat ? `<div class="center" style="font-size: 9px;">${selectedService.cabang_alamat}</div>` : ''}
                ${selectedService.cabang_telepon ? `<div class="center" style="font-size: 9px; margin-bottom: 5px;">Telp: ${selectedService.cabang_telepon}</div>` : ''}
                <div class="line"></div>
                <div class="center bold" style="font-size: 10px; margin-bottom: 5px;">NOTA SERVICE HP</div>
                <div class="line"></div>
                
                <div class="row">
                    <span>No. Service:</span>
                    <span class="bold">${selectedService.nomor_service}</span>
                </div>
                <div class="row">
                    <span>Tanggal:</span>
                    <span>${new Date(selectedService.tanggal_masuk).toLocaleString('id-ID', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
                
                <div class="line"></div>
                
                <div style="margin: 5px 0;">
                    <div class="label">Pelanggan:</div>
                    <div class="value bold">${selectedService.nama_pelanggan}</div>
                    <div class="value">${selectedService.telepon_pelanggan}</div>
                </div>
                
                <div style="margin: 5px 0;">
                    <div class="label">HP:</div>
                    <div class="value bold">${selectedService.merk_hp} ${selectedService.tipe_hp}</div>
                    ${selectedService.imei ? `<div class="value">IMEI: ${selectedService.imei}</div>` : ''}
                </div>
                
                <div style="margin: 5px 0;">
                    <div class="label">Keluhan:</div>
                    <div class="value">${selectedService.keluhan}</div>
                </div>
                
                ${selectedService.kerusakan ? `
                <div style="margin: 5px 0;">
                    <div class="label">Diagnosa:</div>
                    <div class="value">${selectedService.kerusakan}</div>
                </div>
                ` : ''}
                
                ${selectedService.spare_part_diganti ? `
                <div style="margin: 5px 0;">
                    <div class="label">Spare Part:</div>
                    <div class="value">${selectedService.spare_part_diganti}</div>
                </div>
                ` : ''}
                
                <div class="line"></div>
                
                ${selectedService.biaya_spare_part > 0 ? `
                <div class="row">
                    <span>Biaya Spare Part</span>
                    <span>Rp ${selectedService.biaya_spare_part.toLocaleString('id-ID')}</span>
                </div>
                ` : ''}
                <div class="row">
                    <span>Biaya Jasa</span>
                    <span>Rp ${selectedService.biaya_jasa.toLocaleString('id-ID')}</span>
                </div>
                
                <div class="line"></div>
                
                <div class="row bold" style="font-size: 12px;">
                    <span>TOTAL</span>
                    <span>Rp ${selectedService.total_biaya.toLocaleString('id-ID')}</span>
                </div>
                
                <div class="line"></div>
                
                <div style="margin: 5px 0;">
                    <div class="label">Status:</div>
                    <div class="value bold">${selectedService.status_service.toUpperCase()}</div>
                </div>
                
                ${selectedService.teknisi ? `
                <div style="margin: 5px 0;">
                    <div class="label">Teknisi:</div>
                    <div class="value">${selectedService.teknisi}</div>
                </div>
                ` : ''}
                
                ${selectedService.tanggal_selesai ? `
                <div style="margin: 5px 0;">
                    <div class="label">Selesai:</div>
                    <div class="value">${new Date(selectedService.tanggal_selesai).toLocaleString('id-ID', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
                ` : ''}
                
                <div class="line"></div>
                
                <div class="center footer">
                    Terima kasih atas kepercayaan Anda<br>
                    Garansi service sesuai ketentuan
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

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            diterima: { variant: 'secondary', label: 'Diterima' },
            dicek: { variant: 'default', label: 'Dicek' },
            dikerjakan: { variant: 'default', label: 'Dikerjakan' },
            selesai: { variant: 'default', label: 'Selesai' },
            diambil: { variant: 'default', label: 'Diambil' },
            batal: { variant: 'destructive', label: 'Batal' },
        };

        const config = variants[status] || variants.diterima;
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

    return (
        <>
        <Card>
            <CardContent className="p-6">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Service</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pelanggan</TableHead>
                                <TableHead>HP</TableHead>
                                <TableHead>Keluhan</TableHead>
                                <TableHead>Teknisi</TableHead>
                                <TableHead>Total Biaya</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="text-center text-muted-foreground"
                                    >
                                        Belum ada data service
                                    </TableCell>
                                </TableRow>
                            ) : (
                                services.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">
                                            {service.nomor_service}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(service.tanggal_masuk)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {service.nama_pelanggan}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {service.telepon_pelanggan}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {service.merk_hp}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {service.tipe_hp}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {service.keluhan}
                                        </TableCell>
                                        <TableCell>{service.teknisi}</TableCell>
                                        <TableCell>
                                            {formatRupiah(service.total_biaya)}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={service.status_service}
                                                onValueChange={(value) => handleStatusChange(service.id, value)}
                                            >
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="diterima">Diterima</SelectItem>
                                                    <SelectItem value="dicek">Dicek</SelectItem>
                                                    <SelectItem value="dikerjakan">Dikerjakan</SelectItem>
                                                    <SelectItem value="selesai">Selesai</SelectItem>
                                                    <SelectItem value="diambil">Diambil</SelectItem>
                                                    <SelectItem value="batal">Batal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePrint(service.id)}
                                                    title="Print Struk"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/service/${service.id}/edit`
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
                                                            service.id,
                                                            service.nomor_service
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
        <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Print Struk Service</DialogTitle>
                </DialogHeader>
                
                {selectedService && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-center space-y-1">
                                <div className="text-sm text-gray-600">No. Service</div>
                                <div className="text-xl font-bold text-gray-900">
                                    {selectedService.nomor_service}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Pelanggan</span>
                                <span className="font-medium">{selectedService.nama_pelanggan}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">HP</span>
                                <span className="font-medium">
                                    {selectedService.merk_hp} {selectedService.tipe_hp}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Biaya</span>
                                <span className="font-bold text-blue-600">
                                    Rp {selectedService.total_biaya.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handlePrintStruk}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Cetak Struk
                            </Button>
                            <Button
                                onClick={() => setShowPrintModal(false)}
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
}
