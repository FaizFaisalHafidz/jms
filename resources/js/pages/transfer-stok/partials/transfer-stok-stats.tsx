import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Package, Truck } from "lucide-react";

interface Stats {
    total: number;
    pending: number;
    dikirim: number;
    diterima: number;
}

interface Props {
    stats: Stats;
}

export default function TransferStokStats({ stats }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Transfer</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                        Semua transfer stok
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
                    <CardTitle className="text-sm font-medium">Dikirim</CardTitle>
                    <Truck className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.dikirim}</div>
                    <p className="text-xs text-muted-foreground">
                        Dalam perjalanan
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Diterima</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.diterima}</div>
                    <p className="text-xs text-muted-foreground">
                        Transfer selesai
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
