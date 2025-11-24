import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, ExternalLink } from "lucide-react";

const stakeholders = [
  { name: "Deif", role: "Fornecedor de Inversores", contact: "contato@deif.com", phone: "+55 11 3456-7890" },
  { name: "Ynova", role: "Integrador", contact: "suporte@ynova.com.br", phone: "+55 21 98765-4321" },
  { name: "Sungrow", role: "Fabricante de Equipamentos", contact: "brasil@sungrow.com", phone: "+55 11 2345-6789" },
  { name: "Fortlev Solar", role: "Estruturas", contact: "comercial@fortlevsolar.com.br", phone: "+55 48 3333-4444" },
  { name: "Gabriel - TI", role: "Empresa de TI", contact: "gabriel@empresa.com", phone: "+55 21 99999-8888" },
  { name: "Enel Ceará", role: "Concessionária - CE", contact: "atendimento@enel.com.br", phone: "0800 123 4567" },
  { name: "EDP Espírito Santo", role: "Concessionária - ES", contact: "contato@edp.com.br", phone: "0800 765 4321" },
  { name: "Light Rio", role: "Concessionária - RJ", contact: "suporte@light.com.br", phone: "0800 999 8888" },
];

const Communication = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Comunicação e Gerência de Parcerias</h1>
        <p className="text-muted-foreground">Centralização de informações dos stakeholders</p>
      </div>

      {/* Stakeholders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stakeholders.map((stakeholder, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="w-fit mt-2">
                {stakeholder.role}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${stakeholder.contact}`} className="hover:text-primary">
                  {stakeholder.contact}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{stakeholder.phone}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Communication Log */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Comunicações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">Reunião Técnica - Ynova</p>
                  <p className="text-sm text-muted-foreground">Discussão sobre melhorias no sistema de monitoramento</p>
                </div>
                <Badge variant="default">Concluído</Badge>
              </div>
              <div className="text-sm text-muted-foreground">24/11/2024 às 14:30</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">Suporte Técnico - Sungrow</p>
                  <p className="text-sm text-muted-foreground">Solicitação de análise de alarmes do inversor</p>
                </div>
                <Badge variant="outline">Em Andamento</Badge>
              </div>
              <div className="text-sm text-muted-foreground">23/11/2024 às 10:15</div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">Atendimento - Enel Ceará</p>
                  <p className="text-sm text-muted-foreground">Esclarecimento sobre faturamento de créditos</p>
                </div>
                <Badge variant="default">Concluído</Badge>
              </div>
              <div className="text-sm text-muted-foreground">20/11/2024 às 16:45</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Communication;
