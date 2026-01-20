import { formatRupiah } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DollarSign,
    RotateCcw,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Wallet,
    Wrench,
} from 'lucide-react';

interface LaporanStatsProps {
    stats: {
        total_penjualan: number;
        total_pembelian: number;
        total_service: number;
        total_pengeluaran: number;
        total_retur: number;
        total_pendapatan: number;
        laba_bersih: number;
    };
}

export function LaporanStats({ stats }: LaporanStatsProps) {
    const cards = [
        {
            title: 'Total Penjualan',
            value: stats.total_penjualan,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Total Pembelian',
            value: stats.total_pembelian,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Total Service HP',
            value: stats.total_service,
            icon: Wrench,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Total Pengeluaran',
            value: stats.total_pengeluaran,
            icon: Wallet,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
        {
            title: 'Total Retur',
            value: stats.total_retur,
            icon: RotateCcw,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
        {
            title: 'Total Pendapatan',
            value: stats.total_pendapatan,
            icon: TrendingDown,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
        },
        {
            title: 'Laba Bersih',
            value: stats.laba_bersih,
            icon: DollarSign,
            color: stats.laba_bersih >= 0 ? 'text-green-600' : 'text-red-600',
            bgColor: stats.laba_bersih >= 0 ? 'bg-green-100' : 'bg-red-100',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <div className={`${card.bgColor} rounded-full p-2`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatRupiah(card.value)}</div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
