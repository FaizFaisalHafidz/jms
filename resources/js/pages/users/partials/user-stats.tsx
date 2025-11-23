import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Users, XCircle } from 'lucide-react';

interface UserStatsProps {
    stats: {
        total: number;
        aktif: number;
        nonaktif: number;
    };
}

export function UserStats({ stats }: UserStatsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Pengguna</p>
                            <p className="text-xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Pengguna Aktif</p>
                            <p className="text-xl font-bold">{stats.aktif}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Pengguna Nonaktif</p>
                            <p className="text-xl font-bold">{stats.nonaktif}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
