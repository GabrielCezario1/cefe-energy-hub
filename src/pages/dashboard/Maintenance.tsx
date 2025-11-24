import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Wrench, BookOpen, Plus } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Manutenção e Treinamento</h1>
        <p className="text-muted-foreground">Gestão de O&M e capacitação da equipe</p>
      </div>

      {/* Maintenance Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendamento de Manutenção
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border-l-4 border-l-primary bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">Manutenção Preventiva - Inversores</p>
                  <p className="text-sm text-muted-foreground">Inspeção visual e limpeza de conexões</p>
                </div>
                <Badge variant="outline">Agendado</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div>
                  <span className="text-muted-foreground">Data:</span> 28/11/2024
                </div>
                <div>
                  <span className="text-muted-foreground">Equipe:</span> Equipe A
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border-l-4 border-l-chart-1 bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">Limpeza de Painéis Fotovoltaicos</p>
                  <p className="text-sm text-muted-foreground">Limpeza completa de todos os módulos</p>
                </div>
                <Badge variant="outline">Agendado</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div>
                  <span className="text-muted-foreground">Data:</span> 02/12/2024
                </div>
                <div>
                  <span className="text-muted-foreground">Equipe:</span> Equipe B
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Ordens de Serviço (OS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">OS #</th>
                  <th className="text-left py-3 px-2">Título</th>
                  <th className="text-left py-3 px-2">Equipe</th>
                  <th className="text-left py-3 px-2">Data</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">OS-2024-147</td>
                  <td className="py-3 px-2 text-sm">Substituição de Fusível</td>
                  <td className="py-3 px-2 text-sm">Equipe A</td>
                  <td className="py-3 px-2 text-sm">25/11/2024</td>
                  <td className="py-3 px-2"><Badge variant="outline">Em Campo</Badge></td>
                  <td className="py-3 px-2">
                    <Button variant="ghost" size="sm">Ver Checklist</Button>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-2 text-sm">OS-2024-146</td>
                  <td className="py-3 px-2 text-sm">Inspeção Termográfica</td>
                  <td className="py-3 px-2 text-sm">Equipe C</td>
                  <td className="py-3 px-2 text-sm">22/11/2024</td>
                  <td className="py-3 px-2"><Badge variant="default">Concluído</Badge></td>
                  <td className="py-3 px-2">
                    <Button variant="ghost" size="sm">Ver Relatório</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Training Module */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Módulos de Treinamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card cursor-pointer hover:shadow-lg transition-shadow">
              <div className="mb-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Segurança em Altura</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Normas e práticas de segurança
              </p>
              <Badge variant="default">Completo</Badge>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card cursor-pointer hover:shadow-lg transition-shadow">
              <div className="mb-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-chart-1" style={{ width: '75%' }}></div>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Leitura de Inversor</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Interpretação de dados e alarmes
              </p>
              <Badge variant="outline">75% Completo</Badge>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card cursor-pointer hover:shadow-lg transition-shadow">
              <div className="mb-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-chart-2" style={{ width: '30%' }}></div>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Troubleshooting Básico</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Diagnóstico e solução de problemas
              </p>
              <Badge variant="secondary">30% Completo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;
