import { Card, CardContent } from '@/components/ui/card';
import {
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
} from 'lucide-react';

interface Stats {
    total: number;
    lunas: number;
    belum_lunas: number;
    cicilan: number;
}

interface Props {
    stats: Stats;
}

export default function FakturStats({ stats }: Props) {
    const statItems = [
        {
            title: 'Total Faktur',
            value: stats.total,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Lunas',
            value: stats.lunas,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Belum Lunas',
            value: stats.belum_lunas,
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Cicilan',
            value: stats.cicilan,
            icon: CreditCard,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item) => (
                <Card key={item.title}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {item.title}
                                </p>
                                <p className="text-2xl font-bold">
                                    {item.value}
                                </p>
                            </div>
                            <div
                                className={`rounded-full p-3 ${item.bgColor}`}
                            >
                                <item.icon
                                    className={`h-5 w-5 ${item.color}`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
