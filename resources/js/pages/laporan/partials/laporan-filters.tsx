import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';

interface LaporanFiltersProps {
    filters: {
        tahun: string;
        bulan: string;
    };
    basePath: string;
}

export function LaporanFilters({ filters, basePath }: LaporanFiltersProps) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const months = [
        { value: '01', label: 'Januari' },
        { value: '02', label: 'Februari' },
        { value: '03', label: 'Maret' },
        { value: '04', label: 'April' },
        { value: '05', label: 'Mei' },
        { value: '06', label: 'Juni' },
        { value: '07', label: 'Juli' },
        { value: '08', label: 'Agustus' },
        { value: '09', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' },
    ];

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            basePath,
            {
                ...filters,
                [key]: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filter Laporan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="tahun">Tahun</Label>
                        <Select
                            value={filters.tahun}
                            onValueChange={(value) => handleFilterChange('tahun', value)}
                        >
                            <SelectTrigger id="tahun">
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bulan">Bulan</Label>
                        <Select
                            value={filters.bulan}
                            onValueChange={(value) => handleFilterChange('bulan', value)}
                        >
                            <SelectTrigger id="bulan">
                                <SelectValue placeholder="Pilih bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
