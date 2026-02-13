import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { WarehouseDailyData, formatNumber } from "@/lib/energyMockData";

interface Props {
  dailyData: WarehouseDailyData[];
}

export function WarehouseMonthlyChart({ dailyData }: Props) {
  const chartData = dailyData.map((d) => ({
    day: d.date.split("-")[2],
    ponta: d.consumoPontaKwh,
    foraPonta: d.consumoForaPontaKwh,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consumo Acumulado Mensal (kWh)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => formatNumber(v, 2)} />
            <Legend />
            <Bar dataKey="ponta" name="Ponta" stackId="a" fill="hsl(var(--primary))" />
            <Bar dataKey="foraPonta" name="Fora Ponta" stackId="a" fill="hsl(var(--chart-2))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
