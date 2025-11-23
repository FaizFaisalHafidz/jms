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
        <CardTitle>Breakdown Pengeluaran</CardTitle>
        <CardDescription>Pengeluaran berdasarkan kategori</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis dataKey="kategori_pengeluaran" type="category" tickFormatter={formatKategori} width={100} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="total" name="Total Pengeluaran">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
