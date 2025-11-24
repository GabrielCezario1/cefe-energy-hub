import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery, Fuel, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const batteryData = [
  { name: "Carga Atual", value: 75 },
  { name: "Disponível", value: 25 },
];

const energyDistribution = [
  { source: "Solar", value: 65 },
  { source: "Bateria", value: 20 },
  { source: "Gerador", value: 10 },
  { source: "Rede", value: 5 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];
const DIST_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const ZeroGrid = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestão Zero Grid</h1>
        <p className="text-muted-foreground">Monitoramento de armazenamento e geradores</p>
      </div>

      {/* Battery Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-primary" />
              Estado de Carga (SOC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={batteryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {batteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <div className="text-3xl font-bold">75%</div>
              <p className="text-sm text-muted-foreground">Estado de Carga Atual</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-chart-1" />
              Informações da Bateria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Geral (Health)</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-1" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-bold">92%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ciclos de Carga/Descarga</p>
                <p className="text-2xl font-bold mt-1">1,247 ciclos</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacidade Total</p>
                <p className="text-2xl font-bold mt-1">150 kWh</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tensão Atual</p>
                <p className="text-2xl font-bold mt-1">48.2 V</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generator Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-chart-3" />
            Status do Gerador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tempo de Uso Acumulado</p>
              <p className="text-2xl font-bold">847 horas</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Horas até Manutenção</p>
              <p className="text-2xl font-bold text-chart-3">153 horas</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Consumo Estimado</p>
              <p className="text-2xl font-bold">12.5 L/h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Energia (últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={energyDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="source" className="text-xs" />
              <YAxis className="text-xs" label={{ value: 'Percentual (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))">
                {energyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DIST_COLORS[index % DIST_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZeroGrid;
