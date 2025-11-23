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
