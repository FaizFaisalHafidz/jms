import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Barcode from 'react-barcode';
import { toast } from 'sonner';

interface KategoriBarang {
    id: number;
    nama_kategori: string;
}

interface Suplier {
    id: number;
    nama_suplier: string;
}

interface StokCabang {
    id: number;
    barang_id: number;
    cabang_id: number;
    jumlah_stok: number;
}

interface Barang {
    id: number;
    kategori_id: number;
    suplier_id: number;
    kode_barang: string;
    nama_barang: string;
    barcode?: string;
    merk?: string;
    tipe?: string;
    satuan: string;
    harga_asal: number;
    harga_konsumen: number;
    harga_konter: number;
    harga_partai: number;
    stok_minimal: number;
    deskripsi?: string;
    foto_barang?: string;
    status_aktif: boolean;
    kategori: KategoriBarang;
    suplier: Suplier;
    stok_cabang: StokCabang[];
}

interface BarangTableProps {
    barang: Barang[];
    kategori: KategoriBarang[];
    onEdit: (barang: Barang) => void;
}

export function BarangTable({ barang, kategori, onEdit }: BarangTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editingStok, setEditingStok] = useState<number | null>(null);
    const [stokValue, setStokValue] = useState<number>(0);

    const handleDelete = (barang: Barang) => {
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus barang ${barang.nama_barang}?`
            )
        ) {
            router.delete(`/barang/${barang.id}`);
        }
    };

    const handleUpdateStok = async (barangId: number, jumlahStok: number) => {
        try {
            await axios.post('/barang/update-stok', {
                barang_id: barangId,
                jumlah_stok: jumlahStok,
            });
            toast.success('Stok berhasil diperbarui');
            router.reload({ only: ['barang'] });
            setEditingStok(null);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Gagal memperbarui stok'
            );
        }
    };

    const getStok = (barang: Barang) => {
        // Ambil stok pertama karena sudah difilter by cabang user di backend
        return barang.stok_cabang?.[0]?.jumlah_stok || 0;
    };

    const handleEditStok = (barangId: number, currentStok: number) => {
        setEditingStok(barangId);
        setStokValue(currentStok);
    };

    const handleSaveStok = (barangId: number) => {
        handleUpdateStok(barangId, stokValue);
    };

    const handleCancelEdit = () => {
        setEditingStok(null);
        setStokValue(0);
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const columns: ColumnDef<Barang>[] = [
        {
            accessorKey: 'kode_barang',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Kode
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'nama_barang',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === 'asc')
                        }
                    >
                        Nama Barang
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'barcode',
            header: 'Barcode',
            cell: ({ row }) => {
                const barcode = row.original.barcode;
                if (!barcode) return '-';
                return (
                    <div className="flex justify-center">
                        <Barcode 
                            value={barcode} 
                            height={40}
                            width={1.5}
                            fontSize={10}
                            margin={2}
                            displayValue={false}
                        />
                    </div>
                );
            },
        },
        {
            id: 'kategori',
            accessorKey: 'kategori.nama_kategori',
            header: 'Kategori',
        },
        {
            accessorKey: 'suplier.nama_suplier',
            header: 'Supplier',
        },
        {
            accessorKey: 'harga_konsumen',
            header: 'Harga Konsumen',
            cell: ({ row }) => formatRupiah(row.original.harga_konsumen),
        },
        {
            accessorKey: 'harga_konter',
            header: 'Harga Konter',
            cell: ({ row }) => formatRupiah(row.original.harga_konter),
        },
        {
            accessorKey: 'harga_partai',
            header: 'Harga Partai',
            cell: ({ row }) => formatRupiah(row.original.harga_partai),
        },
        {
            accessorKey: 'satuan',
            header: 'Satuan',
        },
        {
            accessorKey: 'status_aktif',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status_aktif;
                return (
                    <Badge
                        variant={status ? 'default' : 'destructive'}
                        className={status ? 'bg-green-600' : ''}
                    >
                        {status ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                );
            },
        },
        {
            id: 'stok',
            header: 'Stok',
            cell: ({ row }) => {
                const barang = row.original;
                const currentStok = getStok(barang);
                const isEditing = editingStok === barang.id;

                return (
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Input
                                    type="number"
                                    value={stokValue}
                                    onChange={(e) =>
                                        setStokValue(parseInt(e.target.value) || 0)
                                    }
                                    className="w-20 h-8 text-sm"
                                    min={0}
                                    autoFocus
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-green-600 hover:text-green-700"
                                    onClick={() => handleSaveStok(barang.id)}
                                >
                                    ✓
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-red-600 hover:text-red-700"
                                    onClick={handleCancelEdit}
                                >
                                    ✕
                                </Button>
                            </>
                        ) : (
                            <button
                                onClick={() =>
                                    handleEditStok(barang.id, currentStok)
                                }
                                className="text-sm font-medium hover:underline px-2 py-1 rounded hover:bg-gray-100"
                            >
                                {currentStok}
                            </button>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const barang = row.original;
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
                            <DropdownMenuItem onClick={() => onEdit(barang)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(barang)}
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
        data: barang,
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
            <CardHeader>
                <CardTitle>Daftar Barang</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Cari barang..."
                            value={
                                (table
                                    .getColumn('nama_barang')
                                    ?.getFilterValue() as string) ?? ''
                            }
                            onChange={(event) =>
                                table
                                    .getColumn('nama_barang')
                                    ?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                        <Select
                            value={
                                (table
                                    .getColumn('kategori')
                                    ?.getFilterValue() as string) ?? 'all'
                            }
                            onValueChange={(value) =>
                                table
                                    .getColumn('kategori')
                                    ?.setFilterValue(value === 'all' ? '' : value)
                            }
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {kategori.map((k) => (
                                    <SelectItem key={k.id} value={k.nama_kategori}>
                                        {k.nama_kategori}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
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
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() &&
                                                'selected'
                                            }
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
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
                                            Tidak ada data barang.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
