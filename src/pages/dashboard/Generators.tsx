import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUnit } from "@/contexts/UnitContext";
import { Fuel, Clock, Zap, DollarSign } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const generatorData = [
  { day: "Seg", consumo: 120, geracao: 480 },
  { day: "Ter", consumo: 95, geracao: 420 },
  { day: "Qua", consumo: 150, geracao: 520 },
  { day: "Qui", consumo: 80, geracao: 350 },
  { day: "Sex", consumo: 180, geracao: 580 },
  { day: "Sáb", consumo: 60, geracao: 240 },
  { day: "Dom", consumo: 45, geracao: 180 },
];

const refuelingData = [
  { id: 1, date: "2024-01-15", liters: 500, horimetroInicial: 12450, horimetroFinal: 12520, cost: 2750.00 },
  { id: 2, date: "2024-01-22", liters: 450, horimetroInicial: 12520, horimetroFinal: 12585, cost: 2475.00 },
  { id: 3, date: "2024-01-29", liters: 480, horimetroInicial: 12585, horimetroFinal: 12655, cost: 2640.00 },
  { id: 4, date: "2024-02-05", liters: 520, horimetroInicial: 12655, horimetroFinal: 12730, cost: 2860.00 },
  { id: 5, date: "2024-02-12", liters: 400, horimetroInicial: 12730, horimetroFinal: 12790, cost: 2200.00 },
];

const Generators = () => {
  const { selectedUnit } = useUnit();

  const totalConsumption = 2350;
  const operatingHours = 340;
  const efficiency = 3.8;
  const averageCost = 1.45;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão de Geradores</h1>
        <p className="text-muted-foreground">
          Monitoramento de consumo de diesel e eficiência - {selectedUnit?.name}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Total</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsumption.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground">Acumulado do mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Operação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operatingHours}h</div>
            <p className="text-xs text-muted-foreground">Tempo total ligado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiency} kWh/L</div>
            <p className="text-xs text-muted-foreground">Geração por litro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {averageCost.toFixed(2)}/kWh</div>
            <p className="text-xs text-muted-foreground">Baseado no preço do diesel</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo vs Geração</CardTitle>
          <CardDescription>
            Comparativo de consumo de combustível e energia gerada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generatorData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  className="text-xs"
                  label={{ value: 'Litros', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  className="text-xs"
                  label={{ value: 'kWh', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="consumo" 
                  name="Consumo (L)" 
                  fill="hsl(var(--destructive))" 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="geracao" 
                  name="Geração (kWh)" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Refueling Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Abastecimentos</CardTitle>
          <CardDescription>Registro de abastecimentos de combustível</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Horímetro Inicial</TableHead>
                <TableHead>Horímetro Final</TableHead>
                <TableHead className="text-right">Custo Total (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refuelingData.map((refuel) => (
                <TableRow key={refuel.id}>
                  <TableCell>{new Date(refuel.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{refuel.liters} L</TableCell>
                  <TableCell>{refuel.horimetroInicial.toLocaleString()}</TableCell>
                  <TableCell>{refuel.horimetroFinal.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {refuel.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Generators;
