import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { Plus } from "lucide-react";
import ReturPenjualanStats from "./partials/retur-penjualan-stats";
import ReturPenjualanTable from "./partials/retur-penjualan-table";

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

interface Stats {
    total: number;
    pending: number;
    disetujui: number;
    ditolak: number;
}

interface Props {
    returs: ReturPenjualan[];
    stats: Stats;
}

export default function ReturPenjualanIndex({ returs, stats }: Props) {
    return (
        <AppLayout>
            <Head title="Retur Penjualan" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Retur Penjualan</h1>
                        <p className="text-muted-foreground">
                            Kelola retur penjualan dan pengembalian barang
                        </p>
                    </div>
                    <Link href="/retur-penjualan/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Retur Baru
                        </Button>
                    </Link>
                </div>

                <ReturPenjualanStats stats={stats} />

                <ReturPenjualanTable returs={returs} />
            </div>
        </AppLayout>
    );
}
