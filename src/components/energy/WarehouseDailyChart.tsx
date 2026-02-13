import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getMD50Registers, formatNumber } from "@/lib/energyMockData";

interface Props {
  warehouseId: string;
  selectedDay: string;
  onDayChange: (day: string) => void;
  availableDays: string[];
}

export function WarehouseDailyChart({ warehouseId, selectedDay, onDayChange, availableDays }: Props) {
  const registers = getMD50Registers(warehouseId, selectedDay);
  const chartData = registers.map((r) => ({
    time: r.timestamp.split("T")[1].substring(0, 5),
    ponta: r.consumoPonta15min,
    foraPonta: r.consumoForaPonta15min,
  }));

  // Show every 8th label (every 2 hours)
  const filtered = chartData.filter((_, i) => i % 8 === 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Consumo Diário (kWh)</CardTitle>
        <Select value={selectedDay} onValueChange={onDayChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableDays.slice(0, 10).map((d) => (
              <SelectItem key={d} value={d}>Dia {d.split("-")[2]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={7} />
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
