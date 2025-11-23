import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data: {
    tanggal: string;
    total: number;
    jumlah_transaksi: number;
  }[];
}

export default function GrafikPembelian({ data }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Pembelian</CardTitle>
        <CardDescription>Tren pembelian harian</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tanggal" />
            <YAxis yAxisId="left" tickFormatter={formatCurrency} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value, name) => {
                if (name === "total") return formatCurrency(Number(value));
                return value;
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="total" stroke="#3b82f6" name="Total Pembelian" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="jumlah_transaksi" stroke="#8b5cf6" name="Jumlah Transaksi" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
