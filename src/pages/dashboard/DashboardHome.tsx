import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUnit } from "@/contexts/UnitContext";
import { Activity, Zap, TrendingUp, AlertTriangle, Sun, Thermometer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for the chart
const generationData = [
  { time: "00:00", power: 0 },
  { time: "04:00", power: 0 },
  { time: "06:00", power: 150 },
  { time: "08:00", power: 580 },
  { time: "10:00", power: 1250 },
  { time: "12:00", power: 2100 },
  { time: "14:00", power: 1950 },
  { time: "16:00", power: 1100 },
  { time: "18:00", power: 320 },
  { time: "20:00", power: 0 },
  { time: "22:00", power: 0 },
];

const DashboardHome = () => {
  const { selectedUnit } = useUnit();

  if (!selectedUnit) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Selecione uma unidade para visualizar os dados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Monitoramento & Geração</h1>
        <p className="text-muted-foreground">
          Unidade {selectedUnit.name} - {selectedUnit.location}
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geração Atual</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,847 kW</div>
            <p className="text-xs text-muted-foreground mt-1">
              87% da capacidade
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geração Diária</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,458 kWh</div>
            <p className="text-xs text-muted-foreground mt-1">
              +15% vs. ontem
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Ratio</CardTitle>
            <Activity className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85.3%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Performance ótimo
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <AlertTriangle className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-base">OK</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Sistema operando normalmente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generation Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Curva de Geração (últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={generationData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs" />
              <YAxis className="text-xs" label={{ value: 'Potência (kW)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="power" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Proactive Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Proativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">Alta Temperatura - Inversor 1</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Temperatura acima de 65°C detectada
                    </p>
                  </div>
                  <Badge variant="destructive">Alto</Badge>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">Queda de Comunicação</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      String 3 sem resposta há 5 minutos
                    </p>
                  </div>
                  <Badge variant="outline">Médio</Badge>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">Manutenção Programada</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Limpeza de painéis agendada para amanhã
                    </p>
                  </div>
                  <Badge variant="secondary">Info</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Potência Instalada</p>
                <p className="text-lg font-semibold">{selectedUnit.installedCapacity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="text-lg font-semibold">
                  {selectedUnit.location} - {selectedUnit.state}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Instalação</p>
                <p className="text-lg font-semibold">
                  {new Date(selectedUnit.installDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Irradiação Atual</span>
                </div>
                <p className="text-2xl font-bold">847 W/m²</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-chart-2" />
                  <span className="text-sm font-medium">Temperatura Ambiente</span>
                </div>
                <p className="text-2xl font-bold">28°C</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
