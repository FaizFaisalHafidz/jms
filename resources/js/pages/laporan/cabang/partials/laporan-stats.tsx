import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    DollarSign,
    RotateCcw,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Wallet,
    Wrench,
} from 'lucide-react';
import React from 'react';

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
    const formatCurrency = (value: number) => {
        return `Rp ${value.toLocaleString('id-ID')}`;
    };

    const cards = [
        {
            title: 'Total Penjualan',
            value: stats.total_penjualan,
            icon: TrendingUp,
            iconColor: 'text-emerald-600',
            iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
        },
        {
            title: 'Total Pembelian',
            value: stats.total_pembelian,
            icon: ShoppingCart,
            iconColor: 'text-violet-600',
            iconBg: 'bg-violet-50 dark:bg-violet-950/50',
        },
        {
            title: 'Total Service HP',
            value: stats.total_service,
            icon: Wrench,
            iconColor: 'text-cyan-600',
            iconBg: 'bg-cyan-50 dark:bg-cyan-950/50',
        },
        {
            title: 'Total Pengeluaran',
            value: stats.total_pengeluaran,
            icon: Wallet,
            iconColor: 'text-rose-600',
            iconBg: 'bg-rose-50 dark:bg-rose-950/50',
        },
        {
            title: 'Total Retur',
            value: stats.total_retur,
            icon: RotateCcw,
            iconColor: 'text-amber-600',
            iconBg: 'bg-amber-50 dark:bg-amber-950/50',
        },
        {
            title: 'Total Pendapatan',
            value: stats.total_pendapatan,
            icon: TrendingDown,
            iconColor: 'text-indigo-600',
            iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
        },
        {
            title: 'Laba Bersih',
            value: stats.laba_bersih,
            icon: DollarSign,
            iconColor: stats.laba_bersih >= 0 ? 'text-emerald-600' : 'text-rose-600',
            iconBg: stats.laba_bersih >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-rose-50 dark:bg-rose-950/50',
        },
    ];

    return (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card
                        key={index}
                        className="group relative overflow-hidden border-0 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                            <div className="space-y-1 flex-1">
                                <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    {card.title}
                                </CardTitle>
                            </div>
                            <div className={cn(
                                "p-2.5 rounded-xl transition-transform group-hover:scale-110",
                                card.iconBg,
                                card.iconColor
                            )}>
                                {React.isValidElement(<Icon />) ? React.cloneElement(<Icon /> as React.ReactElement<any>, {
                                    className: "h-5 w-5",
                                    strokeWidth: 2
                                }) : <Icon className="h-5 w-5" strokeWidth={2} />}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {formatCurrency(card.value)}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
