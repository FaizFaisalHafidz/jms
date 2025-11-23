import { Card, CardContent } from '@/components/ui/card';
import { Box, CheckCircle2, XCircle } from 'lucide-react';

interface KategoriBarangStatsProps {
    stats: {
        total: number;
        aktif: number;
        nonaktif: number;
    };
}

export function KategoriBarangStats({ stats }: KategoriBarangStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/10 rounded-lg">
                            <Box className="h-10 w-10 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Kategori
                            </p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-600/10 rounded-lg">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Kategori Aktif
                            </p>
                            <p className="text-2xl font-bold">{stats.aktif}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600/10 rounded-lg">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Kategori Nonaktif
                            </p>
                            <p className="text-2xl font-bold">
                                {stats.nonaktif}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
