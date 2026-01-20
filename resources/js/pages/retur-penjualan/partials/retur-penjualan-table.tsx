import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { router } from "@inertiajs/react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
} from "@tanstack/react-table";
import axios from "axios";
import { CheckCircle, Eye, Printer, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReturPenjualan {
    id: number;
    nomor_retur: string;
    tanggal_retur: string;
    nomor_transaksi: string;
    total_item: number;
    total_nilai_retur: number;
    jenis_retur: "uang_kembali" | "ganti_barang";
    status_retur: "pending" | "disetujui" | "ditolak";
    kasir: string;
}

interface Props {
    returs: ReturPenjualan[];
}

export default function ReturPenjualanTable({ returs }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
        > = {
            pending: { variant: "secondary", label: "Pending" },
            disetujui: { variant: "outline", label: "Disetujui" },
            ditolak: { variant: "destructive", label: "Ditolak" },
        };

        const config = variants[status] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleApprove = async (id: number) => {
        try {
            await axios.post(`/retur-penjualan/${id}/approve`);
            toast.success("Retur disetujui dan stok dikembalikan");
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyetujui retur");
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axios.post(`/retur-penjualan/${id}/reject`);
            toast.success("Retur ditolak");
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menolak retur");
        }
    };

    const handleView = (id: number) => {
        router.visit(`/retur-penjualan/${id}`);
    };

    const handleDelete = (id: number) => {
        router.delete(`/retur-penjualan/${id}`, {
            onSuccess: () => {
                toast.success("Retur berhasil dihapus");
                setDeleteId(null);
            },
            onError: () => {
                toast.error("Gagal menghapus retur");
            },
        });
    };

    const handlePrint = async (id: number) => {
        try {
            const response = await axios.get(`/retur-penjualan/${id}/print-exchange`);
            const transaksiCetak = response.data;

            if (!transaksiCetak) {
                toast.error("Data transaksi pengganti tidak ditemukan");
                return;
            }

            const printWindow = window.open('', '', 'width=300,height=600');
            if (!printWindow) return;

            const formatRupiah = (value: number) => new Intl.NumberFormat('id-ID', {
                style: 'currency', currency: 'IDR', minimumFractionDigits: 0
            }).format(value);

            // Map items
            const details = transaksiCetak.detail_transaksi || transaksiCetak.detailTransaksi || [];
            const items = details.map((item: any) => ({
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

        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 404) {
                toast.error("Transaksi pengganti tidak ditemukan (Mungkin dibuat sebelum fitur ini ada)");
            } else {
                toast.error("Gagal mencetak struk: " + (error.response?.data?.message || error.message));
            }
        }
    };

    const columns: ColumnDef<ReturPenjualan>[] = [
        {
            accessorKey: "nomor_retur",
            header: "Nomor Retur",
        },
        {
            accessorKey: "tanggal_retur",
            header: "Tanggal",
        },
        {
            accessorKey: "nomor_transaksi",
            header: "No. Transaksi",
        },
        {
            accessorKey: "total_item",
            header: "Total Item",
        },
        {
            accessorKey: "total_nilai_retur",
            header: "Nilai Retur",
            cell: ({ row }) => {
                return `Rp ${row.getValue<number>("total_nilai_retur").toLocaleString("id-ID")}`;
            },
        },
        {
            accessorKey: "kasir",
            header: "Kasir",
        },
        {
            accessorKey: "status_retur",
            header: "Status",
            cell: ({ row }) => getStatusBadge(row.getValue("status_retur")),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const retur = row.original;
                return (
                    <div className="flex items-center gap-2">
                        {retur.jenis_retur === 'ganti_barang' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePrint(retur.id)}
                                title="Cetak Struk"
                            >
                                <Printer className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(retur.id)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>

                        {retur.status_retur === "pending" && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleApprove(retur.id)}
                                    title="Setujui"
                                >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReject(retur.id)}
                                    title="Tolak"
                                >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteId(retur.id)}
                                    title="Hapus"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: returs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Cari nomor retur..."
                    value={(table.getColumn("nomor_retur")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("nomor_retur")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Tidak ada data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Selanjutnya
                    </Button>
                </div>
            </div>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Retur?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Retur yang sudah dihapus tidak dapat dikembalikan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
