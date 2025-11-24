import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Plus, FileText, CheckCircle, Clock } from "lucide-react";

const Support = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Suporte Técnico e Engenharia</h1>
        <p className="text-muted-foreground">Gestão de tickets e orçamentos</p>
      </div>

      {/* Support Portal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Portal de Suporte (Tickets)
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Abrir Novo Chamado
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">ID</th>
                  <th className="text-left py-3 px-2">Título</th>
                  <th className="text-left py-3 px-2">Data de Abertura</th>
                  <th className="text-left py-3 px-2">SLA Restante</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">#2024-1523</td>
                  <td className="py-3 px-2 text-sm">Falha intermitente no Inversor 2</td>
                  <td className="py-3 px-2 text-sm">24/11/2024</td>
                  <td className="py-3 px-2 text-sm">2h 30min</td>
                  <td className="py-3 px-2"><Badge variant="outline">Novo</Badge></td>
                  <td className="py-3 px-2">
                    <Button variant="ghost" size="sm">Ver</Button>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">#2024-1518</td>
                  <td className="py-3 px-2 text-sm">Análise de Performance do Sistema</td>
                  <td className="py-3 px-2 text-sm">22/11/2024</td>
                  <td className="py-3 px-2 text-sm">-</td>
                  <td className="py-3 px-2"><Badge className="bg-chart-1 text-chart-1-foreground">Em Análise</Badge></td>
                  <td className="py-3 px-2">
                    <Button variant="ghost" size="sm">Ver</Button>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">#2024-1502</td>
                  <td className="py-3 px-2 text-sm">Calibração de Sensores</td>
                  <td className="py-3 px-2 text-sm">18/11/2024</td>
                  <td className="py-3 px-2 text-sm">-</td>
                  <td className="py-3 px-2"><Badge variant="default">Fechado</Badge></td>
                  <td className="py-3 px-2">
                    <Button variant="ghost" size="sm">Ver</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Budget Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Análise e Aprovação de Orçamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-chart-3" />
                    <p className="font-semibold">Expansão do Sistema - Módulo 4</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ampliação da capacidade instalada com 150 novos painéis
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor:</span>{" "}
                      <span className="font-bold text-lg">R$ 285,000</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Enviado em:</span> 20/11/2024
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">Pendente</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Rejeitar
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-chart-3" />
                    <p className="font-semibold">Sistema de Monitoramento Avançado</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upgrade para plataforma com IA e análise preditiva
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor:</span>{" "}
                      <span className="font-bold text-lg">R$ 47,500</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Enviado em:</span> 15/11/2024
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">Pendente</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="default" size="sm" className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Rejeitar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consulting Access */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle>Consultoria e Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Acesse nossa equipe de engenharia e comercial para consultoria técnica remota e desenvolvimento de soluções customizadas.
          </p>
          <div className="flex gap-2">
            <Button className="flex-1">
              <Headphones className="h-4 w-4 mr-2" />
              Contato Comercial
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Solicitar Consultoria
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
