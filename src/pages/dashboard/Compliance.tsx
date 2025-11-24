import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, Upload, Calendar, AlertCircle } from "lucide-react";

const Compliance = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Compliance & Auditoria</h1>
        <p className="text-muted-foreground">Gestão regulatória e verificação de contas</p>
      </div>

      {/* Monthly Account Audit */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Auditoria Mensal de Contas
          </CardTitle>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload de Conta
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">Mês/Ano</th>
                  <th className="text-left py-3 px-2">Geração Real</th>
                  <th className="text-left py-3 px-2">Créditos Recebidos</th>
                  <th className="text-left py-3 px-2">Diferença</th>
                  <th className="text-left py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">Out/2024</td>
                  <td className="py-3 px-2 text-sm">18,547 kWh</td>
                  <td className="py-3 px-2 text-sm">18,420 kWh</td>
                  <td className="py-3 px-2 text-sm font-semibold text-destructive">-127 kWh</td>
                  <td className="py-3 px-2"><Badge variant="destructive">Discrepância</Badge></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">Set/2024</td>
                  <td className="py-3 px-2 text-sm">17,892 kWh</td>
                  <td className="py-3 px-2 text-sm">17,892 kWh</td>
                  <td className="py-3 px-2 text-sm font-semibold text-chart-1">0 kWh</td>
                  <td className="py-3 px-2"><Badge variant="default">OK</Badge></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">Ago/2024</td>
                  <td className="py-3 px-2 text-sm">19,234 kWh</td>
                  <td className="py-3 px-2 text-sm">19,234 kWh</td>
                  <td className="py-3 px-2 text-sm font-semibold text-chart-1">0 kWh</td>
                  <td className="py-3 px-2"><Badge variant="default">OK</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Indemnity Processes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Gestão de Processos Indenizatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">Protocolo #2024-1047</p>
                  <p className="text-sm text-muted-foreground">Falha de Entrega - Concessionária</p>
                </div>
                <Badge variant="outline">Em Análise</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div>
                  <span className="text-muted-foreground">Data:</span> 15/10/2024
                </div>
                <div>
                  <span className="text-muted-foreground">Valor:</span> R$ 3,247
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                Ver Documentos
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">Protocolo #2024-0923</p>
                  <p className="text-sm text-muted-foreground">Créditos não contabilizados</p>
                </div>
                <Badge variant="default">Finalizado</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div>
                  <span className="text-muted-foreground">Data:</span> 05/09/2024
                </div>
                <div>
                  <span className="text-muted-foreground">Valor:</span> R$ 1,850
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                Ver Documentos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Acompanhamento Regulatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="font-semibold">Vencimento ART</p>
                <p className="text-sm text-muted-foreground">Prazo de renovação se aproximando</p>
              </div>
              <Badge variant="outline">30 dias</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="font-semibold">Parecer de Acesso - ANEEL</p>
                <p className="text-sm text-muted-foreground">Documentação em dia</p>
              </div>
              <Badge variant="default">OK</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <p className="font-semibold">Registro de Micro/Minigeração</p>
                <p className="text-sm text-muted-foreground">Atualizado recentemente</p>
              </div>
              <Badge variant="default">OK</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Compliance;
