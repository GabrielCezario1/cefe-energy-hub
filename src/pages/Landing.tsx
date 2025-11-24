import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/cefe-logo.png";
import { Activity, DollarSign, Radio, Battery, FileCheck, Wrench, Users, Headphones } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const modules = [
    {
      icon: Activity,
      title: "Monitoramento e Análise de Geração",
      description: "Dashboard em tempo real com análise de desempenho, verificação da saúde dos equipamentos e relatórios mensais detalhados."
    },
    {
      icon: DollarSign,
      title: "Gestão Financeira e Econômica",
      description: "Acompanhamento do payback, economia gerada e rentabilidade mensal do seu investimento fotovoltaico."
    },
    {
      icon: Radio,
      title: "Telemetria e Diagnóstico Proativo",
      description: "Detecção proativa de problemas, monitoramento da qualidade da rede e relatórios flexíveis em tempo real."
    },
    {
      icon: Battery,
      title: "Gestão Zero Grid",
      description: "Controle completo de sistemas off-grid com monitoramento de baterias, geradores e paralelismo inteligente."
    },
    {
      icon: FileCheck,
      title: "Compliance & Auditoria",
      description: "Auditoria de contas, gestão de processos indenizatórios e acompanhamento regulatório com ANEEL."
    },
    {
      icon: Wrench,
      title: "Manutenção e Treinamento",
      description: "Agendamento integrado com Google Calendar, checklists digitais e plataforma EAD para capacitação de equipes."
    },
    {
      icon: Users,
      title: "Comunicação e Parcerias",
      description: "Centralização da comunicação com todas as empresas envolvidas no projeto fotovoltaico."
    },
    {
      icon: Headphones,
      title: "Suporte Técnico e Engenharia",
      description: "Consultoria remota, análise de orçamentos e desenvolvimento de soluções customizadas."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CEFE Logo" className="h-10 w-10" />
            <span className="text-xl font-bold text-foreground">CEFE</span>
          </div>
          <Button onClick={() => navigate("/login")} variant="default">
            Acessar Sistema
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-background via-accent/20 to-primary/10">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="CEFE Logo" className="h-24 w-24" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            CEFE
          </h1>
          <p className="text-2xl text-muted-foreground mb-8">
            Central de Fluxo de Energia
          </p>
          <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
            Gestão inteligente e completa das suas unidades fotovoltaicas. 
            Monitore, analise e otimize a performance do seu investimento em energia solar 
            com nossa plataforma integrada.
          </p>
          <Button onClick={() => navigate("/login")} size="lg" className="text-lg px-8">
            Começar Agora
          </Button>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Módulos de Serviços
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa com 8 módulos especializados para gestão 
              total do seu sistema fotovoltaico
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-accent/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Por que escolher o CEFE?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-foreground font-semibold mb-2">Visibilidade</p>
              <p className="text-sm text-muted-foreground">
                Monitoramento em tempo real de todas as suas unidades
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-foreground font-semibold mb-2">Disponibilidade</p>
              <p className="text-sm text-muted-foreground">
                Acesso contínuo aos dados e alertas proativos
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">8</div>
              <p className="text-foreground font-semibold mb-2">Módulos</p>
              <p className="text-sm text-muted-foreground">
                Plataforma completa para gestão integrada
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para otimizar sua gestão energética?
          </h2>
          <p className="text-muted-foreground mb-8">
            Acesse o sistema agora e comece a monitorar suas unidades fotovoltaicas 
            com inteligência e eficiência.
          </p>
          <Button onClick={() => navigate("/login")} size="lg" className="text-lg px-8">
            Acessar o Sistema
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-card/50">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 CEFE - Central de Fluxo de Energia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
