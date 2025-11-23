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
import { CheckCircle, Eye, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TransferStok {
    id: number;
    nomor_transfer: string;
    tanggal_transfer: string;
    cabang_asal: string;
    cabang_tujuan: string;
    status_transfer: "pending" | "disetujui" | "dikirim" | "diterima" | "ditolak";
    total_item: number;
    dibuat_oleh: string;
}

interface Props {
    transfers: TransferStok[];
}

export default function TransferStokTable({ transfers }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
        > = {
            pending: { variant: "secondary", label: "Pending" },
            disetujui: { variant: "default", label: "Disetujui" },
            dikirim: { variant: "default", label: "Dikirim" },
            diterima: { variant: "outline", label: "Diterima" },
            ditolak: { variant: "destructive", label: "Ditolak" },
        };

        const config = variants[status] || variants.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleApprove = async (id: number) => {
        try {
            await axios.post(`/transfer-stok/${id}/approve`);
            toast.success("Transfer disetujui dan stok dikurangi");
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyetujui transfer");
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axios.post(`/transfer-stok/${id}/reject`);
            toast.success("Transfer ditolak");
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menolak transfer");
        }
    };

    const handleView = (id: number) => {
        router.visit(`/transfer-stok/${id}`);
    };

    const handleDelete = (id: number) => {
        router.delete(`/transfer-stok/${id}`, {
            onSuccess: () => {
                toast.success("Transfer berhasil dihapus");
                setDeleteId(null);
            },
            onError: () => {
                toast.error("Gagal menghapus transfer");
            },
        });
    };

    const columns: ColumnDef<TransferStok>[] = [
        {
            accessorKey: "nomor_transfer",
            header: "Nomor Transfer",
        },
        {
            accessorKey: "tanggal_transfer",
            header: "Tanggal",
        },
        {
            accessorKey: "cabang_asal",
            header: "Dari Cabang",
        },
        {
            accessorKey: "cabang_tujuan",
            header: "Ke Cabang",
        },
        {
            accessorKey: "total_item",
            header: "Total Item",
        },
        {
            accessorKey: "dibuat_oleh",
            header: "Dibuat Oleh",
        },
        {
            accessorKey: "status_transfer",
            header: "Status",
            cell: ({ row }) => getStatusBadge(row.getValue("status_transfer")),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const transfer = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(transfer.id)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>

                        {transfer.status_transfer === "pending" && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleApprove(transfer.id)}
                                    title="Setujui"
                                >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReject(transfer.id)}
                                    title="Tolak"
                                >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteId(transfer.id)}
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
        data: transfers,
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
                    placeholder="Cari nomor transfer..."
                    value={(table.getColumn("nomor_transfer")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("nomor_transfer")?.setFilterValue(event.target.value)
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
                        <AlertDialogTitle>Hapus Transfer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Transfer yang sudah dihapus tidak dapat dikembalikan.
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
