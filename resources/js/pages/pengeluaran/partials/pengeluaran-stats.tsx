import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Wallet } from "lucide-react";

interface Stats {
    total: number;
    transaksi: number;
    bulan_ini: number;
}

interface Props {
    stats: Stats;
}

export function PengeluaranStats({ stats }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        Rp {stats.total.toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Semua pengeluaran
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.transaksi}</div>
                    <p className="text-xs text-muted-foreground">
                        Jumlah pengeluaran
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        Rp {stats.bulan_ini.toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Pengeluaran bulan ini
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
