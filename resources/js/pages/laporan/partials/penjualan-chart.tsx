import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface PenjualanChartProps {
    data: Array<{
        tanggal: string;
        total: number;
    }>;
}

export function PenjualanChart({ data }: PenjualanChartProps) {
    const chartData = data.map((item) => ({
        tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
        }),
        total: Number(item.total),
    }));

    const formatCurrency = (value: number) => {
        return `Rp ${(value / 1000).toFixed(0)}k`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grafik Penjualan Harian (Semua Cabang)</CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="tanggal"
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
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Penjualan"
                                dot={{ r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-muted-foreground py-8">
                        Belum ada data penjualan
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
