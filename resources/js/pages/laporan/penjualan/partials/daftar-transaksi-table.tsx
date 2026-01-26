import { useState } from "react";
import { ChevronDown, ChevronRight, Search, ShoppingCart, Calendar, User, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DetailTransaksi {
    id: number;
    nama_barang: string;
    jumlah: number;
    harga_jual: number;
    subtotal: number;
}

interface Transaksi {
    id: number;
    nomor_transaksi: string;
    tanggal_transaksi: string;
    nama_pelanggan: string | null;
    metode_pembayaran: string;
    total_bayar: number;
    status_transaksi: string;
    detail_transaksi: DetailTransaksi[];
}

interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    per_page: number;
    to: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    transaksi: PaginatedResponse<Transaksi>;
}

import SimplePagination from "@/components/simple-pagination";

export default function DaftarTransaksiTable({ transaksi }: Props) {
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [search, setSearch] = useState("");

    const toggleRow = (id: number) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Note: Search functionality on paginated data usually requires server-side search.
    // However, filtering only current page data is confusing. 
    // Ideally, the search input should trigger a server request. 
    // For now, we'll keep client-side filtering on the current page to avoid complexity unless requested.
    // Or we can assume 'transaksi.data' is what we filter.
    const filteredTransaksi = transaksi.data.filter((t) =>
        t.nomor_transaksi.toLowerCase().includes(search.toLowerCase()) ||
        (t.nama_pelanggan && t.nama_pelanggan.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Card className="border-0 shadow-sm mt-0">
            <CardHeader className="pb-3 px-0 sm:px-6">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Riwayat Transaksi
                        </CardTitle>
                    </div>

                    <div className="relative w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari No. Transaksi / Pelanggan"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-9 text-xs bg-gray-50"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
                <div className="space-y-3">
                    {filteredTransaksi.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-xs border border-dashed rounded-lg bg-gray-50">
                            Tidak ada data transaksi ditemukan.
                        </div>
                    ) : (
                        filteredTransaksi.map((row) => (
                            <div
                                key={row.id}
                                className="bg-white rounded-lg border shadow-sm overflow-hidden"
                            >
                                <div
                                    onClick={() => toggleRow(row.id)}
                                    className="p-3 cursor-pointer active:bg-gray-50"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-blue-200 text-blue-700 bg-blue-50">
                                                {row.nomor_transaksi}
                                            </Badge>
                                            <span className="text-[10px] text-gray-400">
                                                {formatDate(row.tanggal_transaksi)}
                                            </span>
                                        </div>
                                        <Badge
                                            className={`text-[10px] h-5 ${row.status_transaksi === 'selesai' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                                                }`}
                                            variant="outline"
                                        >
                                            {row.status_transaksi}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                                <User className="w-3 h-3 text-gray-400" />
                                                {row.nama_pelanggan || "Umum"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 capitalize">
                                                <CreditCard className="w-3 h-3 text-gray-400" />
                                                {row.metode_pembayaran}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-gray-900">{formatRupiah(row.total_bayar)}</p>
                                        </div>
                                    </div>

                                    {/* Dropdown Indicator */}
                                    <div className="flex justify-center mt-2 -mb-1">
                                        {expandedRows[row.id] ? (
                                            <ChevronDown className="h-4 w-4 text-gray-300" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-300" />
                                        )}
                                    </div>
                                </div>

                                {expandedRows[row.id] && (
                                    <div className="bg-gray-50 p-3 border-t animate-in slide-in-from-top-2 duration-200">
                                        <h4 className="mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Detail Item</h4>
                                        <div className="space-y-2">
                                            {row.detail_transaksi.map((detail, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{detail.nama_barang}</p>
                                                        <p className="text-[10px] text-gray-500">
                                                            {detail.jumlah} x {formatRupiah(detail.harga_jual)}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium text-gray-900">{formatRupiah(detail.subtotal)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
            {/* Pagination Controls */}
            <SimplePagination
                links={transaksi.links}
                next_page_url={transaksi.next_page_url}
                prev_page_url={transaksi.prev_page_url}
                current_page={transaksi.current_page}
                last_page={transaksi.last_page}
            />
        </Card>
    );
}
