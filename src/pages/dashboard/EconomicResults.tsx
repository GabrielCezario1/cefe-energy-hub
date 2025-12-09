import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUnit } from "@/contexts/UnitContext";
import { TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const comparisonData = [
  { month: "Jan", antes: 85000, atual: 52000 },
  { month: "Fev", antes: 92000, atual: 48000 },
  { month: "Mar", antes: 78000, atual: 45000 },
  { month: "Abr", antes: 88000, atual: 51000 },
  { month: "Mai", antes: 95000, atual: 49000 },
  { month: "Jun", antes: 82000, atual: 46000 },
];

const savingsBreakdown = [
  { name: "Geração Solar", value: 40, color: "hsl(var(--primary))" },
  { name: "Otimização de Geradores", value: 20, color: "hsl(var(--chart-2))" },
  { name: "Climatização/HVAC", value: 25, color: "hsl(var(--chart-3))" },
  { name: "Correção de Faturas", value: 15, color: "hsl(var(--chart-4))" },
];

const indicatorsData = [
  { indicator: "Consumo Diesel", before: "5.000 L", after: "3.200 L", variation: "-36%" },
  { indicator: "Custo Energia", before: "R$ 520.000", after: "R$ 291.000", variation: "-44%" },
  { indicator: "Downtime", before: "48h/mês", after: "8h/mês", variation: "-83%" },
  { indicator: "Eficiência Geral", before: "68%", after: "92%", variation: "+35%" },
  { indicator: "CO₂ Evitado", before: "0 ton", after: "45 ton", variation: "+100%" },
];

const EconomicResults = () => {
  const { selectedUnit } = useUnit();

  const totalSavings = 1847532.00;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Resultado Econômico Consolidado</h1>
        <p className="text-muted-foreground">
          Prova de valor: Antes vs. Depois da implementação CEFE - {selectedUnit?.name}
        </p>
      </div>

      {/* Hero Banner */}
      <Card className="bg-gradient-to-r from-green-500/10 to-green-600/20 border-green-500/30">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-lg text-muted-foreground mb-2">Resultado Financeiro Efetivo Total</p>
            <div className="text-5xl md:text-6xl font-bold text-green-500 mb-2">
              R$ {totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-muted-foreground">
              Soma das economias operacionais + Geração Solar + Correção de Geradores
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Cenários: Antes vs. Atual</CardTitle>
          <CardDescription>
            Custo projetado sem a CEFE vs. Custo real atual otimizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis 
                  className="text-xs"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                />
                <Legend />
                <Bar 
                  dataKey="antes" 
                  name="Antes (Ineficiência)" 
                  fill="hsl(var(--muted-foreground))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="atual" 
                  name="Atual (Otimizado)" 
                  fill="hsl(142, 71%, 45%)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown and Table Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Savings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento da Economia</CardTitle>
            <CardDescription>Origem do dinheiro economizado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={savingsBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                  >
                    {savingsBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {savingsBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia Mensal Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">R$ 38.166,67</div>
              <p className="text-xs text-muted-foreground">Redução de custos operacionais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI Anual</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">287%</div>
              <p className="text-xs text-muted-foreground">Retorno sobre o investimento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payback Alcançado</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">4.2 meses</div>
              <p className="text-xs text-muted-foreground">Investimento recuperado</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
          <CardDescription>Comparativo direto de indicadores-chave</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead>Antes da CEFE</TableHead>
                <TableHead>Com a CEFE</TableHead>
                <TableHead className="text-right">Variação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicatorsData.map((item, index) => {
                const isPositive = item.variation.startsWith('+') || item.variation.startsWith('-') && parseFloat(item.variation) < 0;
                const variationColor = item.indicator === "Eficiência Geral" || item.indicator === "CO₂ Evitado" 
                  ? "text-green-500" 
                  : item.variation.startsWith('-') ? "text-green-500" : "text-destructive";
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.indicator}</TableCell>
                    <TableCell className="text-muted-foreground">{item.before}</TableCell>
                    <TableCell>{item.after}</TableCell>
                    <TableCell className={`text-right font-bold ${variationColor}`}>
                      <div className="flex items-center justify-end gap-1">
                        {item.variation.startsWith('-') || item.indicator === "Eficiência Geral" || item.indicator === "CO₂ Evitado" ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                        {item.variation}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EconomicResults;
