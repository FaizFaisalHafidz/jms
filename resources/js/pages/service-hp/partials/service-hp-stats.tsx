import { Card, CardContent } from '@/components/ui/card';
import {
    CheckCircle,
    Clock,
    Smartphone,
    Wrench,
} from 'lucide-react';

interface Stats {
    total: number;
    diterima: number;
    dikerjakan: number;
    selesai: number;
}

interface Props {
    stats: Stats;
}

export default function ServiceHpStats({ stats }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Service
                            </p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Diterima
                            </p>
                            <p className="text-2xl font-bold">{stats.diterima}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Dikerjakan
                            </p>
                            <p className="text-2xl font-bold">{stats.dikerjakan}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Selesai
                            </p>
                            <p className="text-2xl font-bold">{stats.selesai}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
