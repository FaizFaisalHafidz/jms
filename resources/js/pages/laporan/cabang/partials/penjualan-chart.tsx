import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
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
        <Card className="border-0 shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Grafik Penjualan Harian</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="tanggal"
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                formatter={(value: number) =>
                                    `Rp ${value.toLocaleString('id-ID')}`
                                }
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                name="Penjualan"
                                dot={{ r: 4, fill: '#3b82f6' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-16 text-slate-400">
                        <TrendingUp className="h-16 w-16 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Belum ada data penjualan</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
