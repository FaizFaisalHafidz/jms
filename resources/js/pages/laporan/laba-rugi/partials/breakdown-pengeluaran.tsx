import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data: {
    kategori_pengeluaran: string;
    total: number;
  }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function BreakdownPengeluaran({ data }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatKategori = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Breakdown Pengeluaran</CardTitle>
        <CardDescription className="text-sm">Pengeluaran berdasarkan kategori</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: '600px', width: '100%', padding: '16px' }}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              tickFormatter={formatCurrency} 
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              dataKey="kategori_pengeluaran" 
              type="category" 
              tickFormatter={formatKategori} 
              width={120}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="total" name="Total Pengeluaran">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
