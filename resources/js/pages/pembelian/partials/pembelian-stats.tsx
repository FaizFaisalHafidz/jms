import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, ShoppingCart, Wallet } from 'lucide-react';

interface PembelianStatsData {
    total: number;
    total_nilai: number;
    lunas: number;
    belum_lunas: number;
}

interface Props {
    stats: PembelianStatsData;
}

const formatRupiah = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

export function PembelianStats({ stats }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Pembelian
                            </p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/10">
                            <Wallet className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Nilai
                            </p>
                            <p className="text-xl font-bold">{formatRupiah(stats.total_nilai)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/10">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Lunas
                            </p>
                            <p className="text-2xl font-bold">{stats.lunas}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600/10">
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Belum Lunas
                            </p>
                            <p className="text-2xl font-bold">{stats.belum_lunas}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
