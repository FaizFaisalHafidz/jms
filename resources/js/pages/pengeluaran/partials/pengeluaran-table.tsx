import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Pengeluaran {
    id: number;
    nomor_pengeluaran: string;
    tanggal_pengeluaran: string;
    kategori_pengeluaran: string;
    jumlah: number;
    keterangan: string | null;
    user: string;
    created_at: string;
}

interface PengeluaranTableProps {
    data: Pengeluaran[];
    onEdit: (pengeluaran: Pengeluaran) => void;
}

const kategoriLabels: Record<string, string> = {
    gaji: "Gaji",
    listrik: "Listrik",
    air: "Air",
    internet: "Internet",
    sewa: "Sewa",
    transport: "Transport",
    perlengkapan: "Perlengkapan",
    lainnya: "Lainnya",
};

export function PengeluaranTable({ data, onEdit }: PengeluaranTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) {
            router.delete(`/pengeluaran/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Pengeluaran berhasil dihapus");
                },
                onError: (errors) => {
                    toast.error(errors.message || "Gagal menghapus pengeluaran");
                },
            });
        }
    };

    const columns: ColumnDef<Pengeluaran>[] = [
        {
            accessorKey: "nomor_pengeluaran",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Nomor
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: "tanggal_pengeluaran",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Tanggal
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: "kategori_pengeluaran",
            header: "Kategori",
            cell: ({ row }) => {
                const kategori = row.getValue("kategori_pengeluaran") as string;
                return <Badge variant="outline">{kategoriLabels[kategori]}</Badge>;
            },
        },
        {
            accessorKey: "jumlah",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Jumlah
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const amount = row.getValue("jumlah") as number;
                return `Rp ${amount.toLocaleString("id-ID")}`;
            },
        },
        {
            accessorKey: "keterangan",
            header: "Keterangan",
            cell: ({ row }) => {
                const keterangan = row.getValue("keterangan") as string | null;
                return keterangan || "-";
            },
        },
        {
            accessorKey: "user",
            header: "Dibuat Oleh",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const pengeluaran = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(pengeluaran)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(pengeluaran.id)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
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
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Cari nomor pengeluaran..."
                            value={
                                (table
                                    .getColumn("nomor_pengeluaran")
                                    ?.getFilterValue() as string) ?? ""
                            }
                            onChange={(event) =>
                                table
                                    .getColumn("nomor_pengeluaran")
                                    ?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext()
                                                          )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
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
                </div>
            </CardContent>
        </Card>
    );
}
