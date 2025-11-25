import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data: {
    tanggal: string;
    pendapatan: number;
    pengeluaran: number;
    laba: number;
  }[];
}

export default function GrafikLaba({ data }: Props) {
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
        <CardTitle className="text-lg md:text-xl">Grafik Laba Rugi</CardTitle>
        <CardDescription className="text-sm">Tren laba rugi harian</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: '600px', width: '100%', padding: '16px' }}>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLaba" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="tanggal" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tickFormatter={formatCurrency} 
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Area type="monotone" dataKey="pendapatan" stroke="#10b981" fillOpacity={1} fill="url(#colorPendapatan)" name="Pendapatan" />
            <Area type="monotone" dataKey="pengeluaran" stroke="#ef4444" fillOpacity={1} fill="url(#colorPengeluaran)" name="Pengeluaran" />
            <Area type="monotone" dataKey="laba" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLaba)" name="Laba" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
