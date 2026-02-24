import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Gauge, Sun, Building2 } from "lucide-react";
import { formatNumber } from "@/lib/energyMockData";

interface Props {
  solarConsumption: number;
  gridConsumption: number;
  availablePower: number;
}

export function CondominiumKpiCards({ solarConsumption, gridConsumption, availablePower }: Props) {
  const totalConsumption = solarConsumption + gridConsumption;

  const kpis = [
    { title: "Consumo Zero Grid", value: `${formatNumber(solarConsumption)} kWh`, icon: Sun, borderColor: "border-l-[hsl(var(--chart-3))]" },
    { title: "Consumo Concessionária", value: `${formatNumber(gridConsumption)} kWh`, icon: Building2, borderColor: "border-l-[hsl(var(--chart-2))]" },
    { title: "Consumo Total", value: `${formatNumber(totalConsumption)} kWh`, icon: Zap, borderColor: "border-l-[hsl(var(--chart-1))]" },
    { title: "Demanda Contratada", value: `${formatNumber(availablePower)} kW`, icon: Gauge, borderColor: "border-l-[hsl(var(--chart-4))]" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className={`border-l-4 ${kpi.borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            <kpi.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
