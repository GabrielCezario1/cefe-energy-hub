import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Zap, Gauge } from "lucide-react";
import { formatBRL, formatNumber } from "@/lib/energyMockData";

interface Props {
  totalValue: number;
  totalConsumption: number;
  availablePower: number;
}

export function CondominiumKpiCards({ totalValue, totalConsumption, availablePower }: Props) {
  const kpis = [
    { title: "Valor Total da Conta", value: formatBRL(totalValue), icon: DollarSign, borderColor: "border-l-primary" },
    { title: "Consumo Total", value: `${formatNumber(totalConsumption)} kWh`, icon: Zap, borderColor: "border-l-[hsl(var(--chart-1))]" },
    { title: "Potência Disponibilizada", value: `${formatNumber(availablePower)} kW`, icon: Gauge, borderColor: "border-l-[hsl(var(--chart-2))]" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
