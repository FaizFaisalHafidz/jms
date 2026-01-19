import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import Barcode from 'react-barcode';

interface KategoriBarang {
    id: number;
    nama_kategori: string;
}

interface Suplier {
    id: number;
    nama_suplier: string;
}

interface Barang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    barcode?: string;
    harga_konsumen: number;
    harga_partai?: number;
    kategori: KategoriBarang;
    suplier: Suplier;
}

interface BarangPrintItem extends Barang {
    jumlah: number;
    selected: boolean;
}

interface BarcodePrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    barang: Barang[];
}

export function BarcodePrintModal({
    isOpen,
    onClose,
    barang,
}: BarcodePrintModalProps) {
    const [printItems, setPrintItems] = useState<BarangPrintItem[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Initialize print items when modal opens
    useEffect(() => {
        if (isOpen && barang.length > 0) {
            setPrintItems(
                barang
                    .filter((b) => b.barcode)
                    .map((b) => ({
                        ...b,
                        jumlah: 1,
                        selected: false,
                    }))
            );
        }
    }, [isOpen, barang]);

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        setPrintItems(
            printItems.map((item) => ({ ...item, selected: checked }))
        );
    };

    const handleSelectItem = (index: number, checked: boolean) => {
        const newItems = [...printItems];
        newItems[index].selected = checked;
        setPrintItems(newItems);
        setSelectAll(newItems.every((item) => item.selected));
    };

    const handleJumlahChange = (index: number, jumlah: number) => {
        const newItems = [...printItems];
        newItems[index].jumlah = Math.max(1, jumlah);
        setPrintItems(newItems);
    };

    const handlePrint = () => {
        const selectedItems = printItems.filter((item) => item.selected);

        if (selectedItems.length === 0) {
            alert('Pilih minimal 1 barang untuk dicetak');
            return;
        }

        // Create print content
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cetak Barcode - Thermal</title>
                <style>
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 2mm 0;
                        }
                        body {
                            margin: 0;
                        }
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        margin: 0;
                        padding: 0;
                        width: 80mm;
                        background: white;
                    }
                    .barcode-container {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                    }
                    .barcode-item {
                        width: 100%;
                        padding: 5mm 3mm;
                        text-align: center;
                        background: white;
                        page-break-inside: avoid;
                        border-bottom: 1px dashed #999;
                    }
                    .barcode-item:last-child {
                        border-bottom: none;
                    }
                    .barcode-item h4 {
                        margin: 2mm 0;
                        font-size: 11pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        word-wrap: break-word;
                        line-height: 1.2;
                    }
                    .barcode-item .info {
                        margin: 2mm 0;
                        font-size: 9pt;
                        color: #333;
                    }
                    .barcode-item .barcode-wrapper {
                        margin: 3mm 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .barcode-item .price {
                        margin: 2mm 0;
                        font-size: 10pt;
                        font-weight: bold;
                    }
                    .divider {
                        margin: 3mm 0;
                        border-top: 1px dashed #999;
                    }
                </style>
            </head>
            <body>
                <div class="barcode-container">
                    ${selectedItems
                .map((item) => {
                    const barcodeElements = [];
                    for (let i = 0; i < item.jumlah; i++) {
                        barcodeElements.push(`
                                    <div class="barcode-item">
                                        <h4>${item.nama_barang}</h4>
                                        <div class="info">Kode: ${item.kode_barang}</div>
                                        <div class="barcode-wrapper">
                                            <svg id="barcode-${item.id}-${i}"></svg>
                                        </div>
                                        <div class="price">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.harga_konsumen)}</div>
                                    </div>
                                `);
                    }
                    return barcodeElements.join('');
                })
                .join('')}
                </div>
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                <script>
                    window.onload = function() {
                        ${selectedItems
                .map((item) => {
                    const scripts = [];
                    for (let i = 0; i < item.jumlah; i++) {
                        scripts.push(`
                                        JsBarcode("#barcode-${item.id}-${i}", "${item.barcode}", {
                                            format: "CODE128",
                                            width: 1.5,
                                            height: 40,
                                            displayValue: true,
                                            fontSize: 11,
                                            margin: 2,
                                            marginTop: 5,
                                            marginBottom: 5
                                        });
                                    `);
                    }
                    return scripts.join('');
                })
                .join('')}
                        setTimeout(function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            };
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cetak Barcode</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                        <Checkbox
                            id="select-all"
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                        />
                        <Label
                            htmlFor="select-all"
                            className="font-medium cursor-pointer"
                        >
                            Pilih Semua Barang
                        </Label>
                    </div>

                    <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                        {printItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <Checkbox
                                        checked={item.selected}
                                        onCheckedChange={(checked) =>
                                            handleSelectItem(
                                                index,
                                                checked as boolean
                                            )
                                        }
                                        className="mt-1"
                                    />
                                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4">
                                            <p className="font-medium">
                                                {item.nama_barang}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {item.kode_barang}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatRupiah(
                                                    item.harga_konsumen
                                                )}
                                            </p>
                                        </div>
                                        <div className="col-span-4 flex justify-center">
                                            {item.barcode && (
                                                <Barcode
                                                    value={item.barcode}
                                                    height={30}
                                                    width={1.5}
                                                    fontSize={10}
                                                    margin={2}
                                                />
                                            )}
                                        </div>
                                        <div className="col-span-4">
                                            <Label
                                                htmlFor={`jumlah-${item.id}`}
                                                className="text-sm"
                                            >
                                                Jumlah Cetak
                                            </Label>
                                            <Input
                                                id={`jumlah-${item.id}`}
                                                type="number"
                                                min="1"
                                                value={item.jumlah}
                                                onChange={(e) =>
                                                    handleJumlahChange(
                                                        index,
                                                        parseInt(
                                                            e.target.value
                                                        ) || 1
                                                    )
                                                }
                                                className="mt-1"
                                                disabled={!item.selected}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {printItems.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Tidak ada barang dengan barcode
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                        <p className="text-sm text-gray-600">
                            {printItems.filter((item) => item.selected).length}{' '}
                            barang dipilih |{' '}
                            {printItems
                                .filter((item) => item.selected)
                                .reduce((sum, item) => sum + item.jumlah, 0)}{' '}
                            total barcode
                        </p>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handlePrint}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Cetak Barcode
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
