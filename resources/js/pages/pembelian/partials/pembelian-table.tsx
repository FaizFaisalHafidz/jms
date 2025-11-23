import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { router } from '@inertiajs/react';
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable
} from '@tanstack/react-table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Pembelian {
    id: number;
    nomor_pembelian: string;
    tanggal_pembelian: string;
    total_item: number;
    subtotal: number;
    diskon: number;
    ongkos_kirim: number;
    total_bayar: number;
    status_pembayaran: 'lunas' | 'belum_lunas' | 'cicilan';
    tanggal_jatuh_tempo: string | null;
    keterangan: string | null;
    suplier: {
        id: number;
        nama_suplier: string;
    };
    cabang: {
        id: number;
        nama_cabang: string;
    };
}

interface Props {
    pembelian: Pembelian[];
}

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

export function PembelianTable({ pembelian }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pembelian ini? Stok akan dikembalikan.')) {
            router.delete(`/pembelian/${id}`);
        }
    };

    const columns = [
        {
            accessorKey: 'nomor_pembelian',
            header: 'Nomor Pembelian',
            cell: ({ row }: any) => (
                <div className="font-medium">{row.original.nomor_pembelian}</div>
            ),
        },
        {
            accessorKey: 'tanggal_pembelian',
            header: 'Tanggal',
            cell: ({ row }: any) => formatDate(row.original.tanggal_pembelian),
        },
        {
            accessorKey: 'suplier.nama_suplier',
            header: 'Supplier',
            cell: ({ row }: any) => row.original.suplier.nama_suplier,
        },
        {
            accessorKey: 'cabang.nama_cabang',
            header: 'Cabang',
            cell: ({ row }: any) => row.original.cabang.nama_cabang,
        },
        {
            accessorKey: 'total_item',
            header: 'Total Item',
            cell: ({ row }: any) => (
                <div className="text-center">{row.original.total_item}</div>
            ),
        },
        {
            accessorKey: 'total_bayar',
            header: 'Total Bayar',
            cell: ({ row }: any) => (
                <div className="font-medium">{formatRupiah(row.original.total_bayar)}</div>
            ),
        },
        {
            accessorKey: 'status_pembayaran',
            header: 'Status',
            cell: ({ row }: any) => {
                const status = row.original.status_pembayaran;
                const variants: Record<string, { className: string; label: string }> = {
                    lunas: { className: 'bg-green-100 text-green-700', label: 'Lunas' },
                    belum_lunas: { className: 'bg-red-100 text-red-700', label: 'Belum Lunas' },
                    cicilan: { className: 'bg-orange-100 text-orange-700', label: 'Cicilan' },
                };
                return (
                    <Badge className={variants[status].className}>
                        {variants[status].label}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => handleDelete(row.original.id)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const table = useReactTable({
        data: pembelian,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daftar Pembelian</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Input
                        placeholder="Cari nomor pembelian..."
                        value={(table.getColumn('nomor_pembelian')?.getFilterValue() as string) ?? ''}
                        onChange={(e) =>
                            table.getColumn('nomor_pembelian')?.setFilterValue(e.target.value)
                        }
                        className="max-w-sm"
                    />

                    <div className="overflow-x-auto rounded-md border">
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
                            Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
                            {table.getPageCount()}
                        </div>
                        <div className="flex gap-2">
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
