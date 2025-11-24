import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, PiggyBank } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const monthlyData = [
  { month: "Jan", economy: 15420, generation: 18500 },
  { month: "Fev", economy: 14850, generation: 17800 },
  { month: "Mar", economy: 16200, generation: 19400 },
  { month: "Abr", economy: 15900, generation: 19000 },
  { month: "Mai", economy: 14200, generation: 17000 },
  { month: "Jun", economy: 13800, generation: 16500 },
];

const paybackData = [
  { month: 0, investment: 500000, recovered: 0 },
  { month: 12, investment: 500000, recovered: 180000 },
  { month: 24, investment: 500000, recovered: 360000 },
  { month: 36, investment: 500000, recovered: 500000 },
  { month: 48, investment: 500000, recovered: 640000 },
];

const Financial = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestão Financeira & Econômica</h1>
        <p className="text-muted-foreground">Análise de retorno e economia do investimento</p>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Acumulada</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 1,847,250</div>
            <p className="text-xs text-muted-foreground mt-1">
              Desde a instalação
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia no Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 16,200</div>
            <p className="text-xs text-muted-foreground mt-1">
              +9.1% vs. mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payback Restante</CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8 meses</div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimativa otimista
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rentabilidade Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="economy" fill="hsl(var(--primary))" name="Economia (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payback Projection */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Payback</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={paybackData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" label={{ value: 'Meses', position: 'insideBottom', offset: -5 }} />
              <YAxis className="text-xs" label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="investment" stroke="hsl(var(--destructive))" strokeWidth={2} name="Investimento" />
              <Line type="monotone" dataKey="recovered" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Recuperado" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Investment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Valor do Investimento Inicial</p>
              <p className="text-2xl font-bold">R$ 500,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tarifa de Energia</p>
              <p className="text-2xl font-bold">R$ 0.85/kWh</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">ROI Anual</p>
              <p className="text-2xl font-bold text-chart-1">38.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financial;
