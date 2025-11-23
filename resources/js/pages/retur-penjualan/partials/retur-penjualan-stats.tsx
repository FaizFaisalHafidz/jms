import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Package, XCircle } from "lucide-react";

interface Stats {
    total: number;
    pending: number;
    disetujui: number;
    ditolak: number;
}

interface Props {
    stats: Stats;
}

export default function ReturPenjualanStats({ stats }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Retur</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                        Semua retur penjualan
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.pending}</div>
                    <p className="text-xs text-muted-foreground">
                        Menunggu persetujuan
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.disetujui}</div>
                    <p className="text-xs text-muted-foreground">
                        Retur disetujui
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.ditolak}</div>
                    <p className="text-xs text-muted-foreground">
                        Retur ditolak
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
