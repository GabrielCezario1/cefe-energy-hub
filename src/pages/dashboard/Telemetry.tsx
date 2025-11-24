import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, AlertCircle, Activity, Download } from "lucide-react";

const Telemetry = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Telemetria & Diagnóstico Proativo</h1>
        <p className="text-muted-foreground">Dados brutos, alarmes e ferramentas de diagnóstico</p>
      </div>

      {/* Real-time Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tensão da Rede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">380.5 V</div>
            <Badge variant="default" className="mt-2">Normal</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Frequência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">59.98 Hz</div>
            <Badge variant="default" className="mt-2">Normal</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Irradiação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847 W/m²</div>
            <Badge variant="default" className="mt-2">Ótimo</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Temp. Inversor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68°C</div>
            <Badge variant="destructive" className="mt-2">Alto</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Event Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Log de Eventos e Falhas
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">Timestamp</th>
                  <th className="text-left py-3 px-2">Evento</th>
                  <th className="text-left py-3 px-2">Equipamento</th>
                  <th className="text-left py-3 px-2">Duração</th>
                  <th className="text-left py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">2024-11-24 14:32:15</td>
                  <td className="py-3 px-2 text-sm">Alta Temperatura</td>
                  <td className="py-3 px-2 text-sm">Inversor 1</td>
                  <td className="py-3 px-2 text-sm">Ativo</td>
                  <td className="py-3 px-2"><Badge variant="destructive">Crítico</Badge></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">2024-11-24 12:18:42</td>
                  <td className="py-3 px-2 text-sm">Falha de Comunicação</td>
                  <td className="py-3 px-2 text-sm">String 3</td>
                  <td className="py-3 px-2 text-sm">5 min</td>
                  <td className="py-3 px-2"><Badge variant="outline">Resolvido</Badge></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">2024-11-24 08:05:12</td>
                  <td className="py-3 px-2 text-sm">Grid Down</td>
                  <td className="py-3 px-2 text-sm">Sistema</td>
                  <td className="py-3 px-2 text-sm">2 min</td>
                  <td className="py-3 px-2"><Badge variant="outline">Resolvido</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ferramenta de Relatório Flexível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
                <select className="w-full p-2 border border-border rounded-md bg-background">
                  <option>Diário</option>
                  <option>Semanal</option>
                  <option>Mensal</option>
                  <option>Personalizado</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Início</label>
                <input type="date" className="w-full p-2 border border-border rounded-md bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Fim</label>
                <input type="date" className="w-full p-2 border border-border rounded-md bg-background" />
              </div>
            </div>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Reading Guide */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle>Guia de Leitura do Equipamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Acesse o guia completo para realizar a leitura correta dos equipamentos e entender os parâmetros do sistema.
          </p>
          <Button variant="outline">
            <Radio className="h-4 w-4 mr-2" />
            Acessar Manual
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Telemetry;
