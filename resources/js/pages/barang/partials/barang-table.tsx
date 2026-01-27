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
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import axios from 'axios';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
    pagination?: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
    filters?: {
        search?: string;
        kategori_id?: string;
        status?: string;
    };
}

export function BarangTable({ barang, kategori, onEdit, pagination, filters }: BarangTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [editingStok, setEditingStok] = useState<number | null>(null);
    const [stokValue, setStokValue] = useState<number>(0);
    const [searchInput, setSearchInput] = useState(filters?.search || '');
    const [kategoriFilter, setKategoriFilter] = useState(filters?.kategori_id || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

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

    // Track first render to avoid auto-search on initial load
    const isFirstRender = useRef(true);
    // Track if user is currently typing
    const isTyping = useRef(false);

    // Auto-search dengan debounce (300ms seperti POS)
    useEffect(() => {
        // Skip pada render pertama
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Set typing flag
        isTyping.current = true;

        const delayDebounceFn = setTimeout(() => {
            // Trigger search dengan replace (tidak menambah history)
            router.get('/barang', {
                search: searchInput,
                kategori_id: kategoriFilter,
                status: statusFilter,
            }, {
                preserveScroll: true,
                preserveState: false,
                replace: true, // Tidak menambah history, URL akan berubah tapi tidak bisa back
                onFinish: () => {
                    // Clear typing flag after request completes
                    isTyping.current = false;
                }
            });
        }, 300); // 300ms seperti POS

        return () => {
            clearTimeout(delayDebounceFn);
            isTyping.current = false;
        };
    }, [searchInput, kategoriFilter, statusFilter]);

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
                    <div className="flex justify-center items-center gap-2 font-mono text-xs">
                        {barcode}
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
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daftar Barang</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex gap-4 flex-wrap">
                        <Input
                            placeholder="Cari barang..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="max-w-sm"
                        />
                        <Select
                            value={kategoriFilter || 'all'}
                            onValueChange={(value) => {
                                const newKategori = value === 'all' ? '' : value;
                                setKategoriFilter(newKategori);
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {kategori.map((k) => (
                                    <SelectItem key={k.id} value={k.id.toString()}>
                                        {k.nama_kategori}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={statusFilter || 'all'}
                            onValueChange={(value) => {
                                const newStatus = value === 'all' ? '' : value;
                                setStatusFilter(newStatus);
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="1">Aktif</SelectItem>
                                <SelectItem value="0">Nonaktif</SelectItem>
                            </SelectContent>
                        </Select>
                        {(searchInput || kategoriFilter || statusFilter) && (
                            <Button
                                onClick={() => {
                                    setSearchInput('');
                                    setKategoriFilter('');
                                    setStatusFilter('');
                                }}
                                variant="outline"
                            >
                                Reset Filter
                            </Button>
                        )}
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
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            {pagination ? (
                                <>Menampilkan {pagination.from ?? 0} - {pagination.to ?? 0} dari {pagination.total} barang</>
                            ) : (
                                <>Memuat data...</>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.get('/barang', {
                                        ...filters,
                                        page: pagination ? pagination.current_page - 1 : 1,
                                    }, { preserveScroll: true });
                                }}
                                disabled={!pagination || pagination.current_page === 1}
                            >
                                Sebelumnya
                            </Button>
                            <div className="text-sm">
                                Halaman {pagination?.current_page ?? 1} dari {pagination?.last_page ?? 1}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.get('/barang', {
                                        ...filters,
                                        page: pagination ? pagination.current_page + 1 : 1,
                                    }, { preserveScroll: true });
                                }}
                                disabled={!pagination || pagination.current_page === pagination.last_page}
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
