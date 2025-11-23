import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface PengeluaranChartProps {
    data: Array<{
        kategori_pengeluaran: string;
        total: number;
    }>;
}

const kategoriLabels: Record<string, string> = {
    gaji: 'Gaji',
    listrik: 'Listrik',
    air: 'Air',
    internet: 'Internet',
    sewa: 'Sewa',
    transport: 'Transport',
    perlengkapan: 'Perlengkapan',
    lainnya: 'Lainnya',
};

export function PengeluaranChart({ data }: PengeluaranChartProps) {
    const chartData = data.map((item) => ({
        kategori: kategoriLabels[item.kategori_pengeluaran] || item.kategori_pengeluaran,
        total: Number(item.total),
    }));

    const formatCurrency = (value: number) => {
        return `Rp ${(value / 1000).toFixed(0)}k`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grafik Pengeluaran per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="kategori"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
                            <Tooltip
                                formatter={(value: number) =>
                                    `Rp ${value.toLocaleString('id-ID')}`
                                }
                            />
                            <Legend />
                            <Bar
                                dataKey="total"
                                fill="#ef4444"
                                name="Pengeluaran"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-muted-foreground py-8">
                        Belum ada data pengeluaran
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
