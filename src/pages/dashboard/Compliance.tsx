import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileCheck, Upload, Calendar, AlertCircle, Scale, DollarSign, Clock } from "lucide-react";

// Mock data for indemnity processes
const indemnityProcesses = [
  { 
    id: "#2024-001", 
    period: "JAN/2024", 
    lostValue: 15000, 
    status: "Concluído e Recebido", 
    recoveredValue: 15000 
  },
  { 
    id: "#2024-002", 
    period: "MAR/2024", 
    lostValue: 22000, 
    status: "Concluído e Recebido", 
    recoveredValue: 22000 
  },
  { 
    id: "#2024-003", 
    period: "MAI/2024", 
    lostValue: 18000, 
    status: "Em Andamento", 
    recoveredValue: 0 
  },
];

// Calculate totals
const totalOpenProcesses = indemnityProcesses
  .filter(p => p.status === "Em Andamento")
  .reduce((sum, p) => sum + p.lostValue, 0);

const totalRecovered = indemnityProcesses
  .filter(p => p.status === "Concluído e Recebido")
  .reduce((sum, p) => sum + p.recoveredValue, 0);

const Compliance = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Compliance & Auditoria</h1>
        <p className="text-muted-foreground">Gestão regulatória, verificação de contas e processos indenizatórios</p>
      </div>

      {/* KPIs for Indemnity Processes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Processos Abertos</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              R$ {totalOpenProcesses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando resolução</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recuperado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              R$ {totalRecovered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Créditos ressarcidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Scale className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {Math.round((indemnityProcesses.filter(p => p.status === "Concluído e Recebido").length / indemnityProcesses.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Processos concluídos com êxito</p>
          </CardContent>
        </Card>
      </div>

      {/* Indemnity Processes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Processos Indenizatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo/ID</TableHead>
                <TableHead>Mês/Período</TableHead>
                <TableHead>Valor Perdido (R$)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Recuperado (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indemnityProcesses.map((process) => (
                <TableRow key={process.id}>
                  <TableCell className="font-medium">{process.id}</TableCell>
                  <TableCell>{process.period}</TableCell>
                  <TableCell className="text-destructive font-semibold">
                    R$ {process.lostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={process.status === "Concluído e Recebido" ? "default" : "outline"}>
                      {process.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${process.recoveredValue > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                    R$ {process.recoveredValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                  <td className="py-3 px-2 text-sm font-semibold text-green-500">0 kWh</td>
                  <td className="py-3 px-2"><Badge variant="default">OK</Badge></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">Ago/2024</td>
                  <td className="py-3 px-2 text-sm">19,234 kWh</td>
                  <td className="py-3 px-2 text-sm">19,234 kWh</td>
                  <td className="py-3 px-2 text-sm font-semibold text-green-500">0 kWh</td>
                  <td className="py-3 px-2"><Badge variant="default">OK</Badge></td>
                </tr>
              </tbody>
            </table>
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
