import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { Plus } from "lucide-react";
import TransferStokStats from "./partials/transfer-stok-stats";
import TransferStokTable from "./partials/transfer-stok-table";

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

interface Stats {
    total: number;
    pending: number;
    dikirim: number;
    diterima: number;
}

interface Props {
    transfers: TransferStok[];
    stats: Stats;
}

export default function TransferStokIndex({ transfers, stats }: Props) {
    return (
        <AppLayout>
            <Head title="Transfer Stok" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Transfer Stok</h1>
                        <p className="text-muted-foreground">
                            Kelola transfer stok antar cabang
                        </p>
                    </div>
                    <Link href="/transfer-stok/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Transfer Baru
                        </Button>
                    </Link>
                </div>

                <TransferStokStats stats={stats} />

                <TransferStokTable transfers={transfers} />
            </div>
        </AppLayout>
    );
}
