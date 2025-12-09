import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  DollarSign, 
  Activity, 
  BatteryCharging, 
  FileCheck, 
  Wrench, 
  Users, 
  Headset, 
  Fuel, 
  TrendingUp 
} from "lucide-react";
import logo from "@/assets/cefe-logo.png";
import marbleHero from "@/assets/marble-quarry-hero.png";

const partners = [
  { name: "Cloud Virtus", id: "cloud-virtus" },
  { name: "META", id: "meta" },
  { name: "Sunfarm", id: "sunfarm" },
  { name: "Seletiva", id: "seletiva" },
];

const features = [
  {
    icon: Zap,
    title: "Monitoramento & Geração",
    description: "Telemetria em tempo real e análise de KPIs de geração, garantindo visibilidade total da performance da usina.",
    color: "text-yellow-500",
  },
  {
    icon: DollarSign,
    title: "Gestão Financeira",
    description: "Cálculo automático de ROI, Payback e economia gerada, transformando kilowatts em resultados financeiros claros.",
    color: "text-green-500",
  },
  {
    icon: Activity,
    title: "Diagnóstico Proativo",
    description: "Detecção inteligente de falhas na rede e equipamentos, minimizando o downtime e protegendo o ativo.",
    color: "text-blue-500",
  },
  {
    icon: BatteryCharging,
    title: "Gestão Zero Grid",
    description: "Monitoramento avançado de baterias e sistemas híbridos para operações off-grid seguras e eficientes.",
    color: "text-emerald-500",
  },
  {
    icon: FileCheck,
    title: "Compliance & Auditoria",
    description: "Auditoria automatizada de faturas de energia e gestão de processos regulatórios junto à concessionária e ANEEL.",
    color: "text-orange-500",
  },
  {
    icon: Wrench,
    title: "Manutenção & Treinamento",
    description: "Gestão de ordens de serviço, calendário de manutenção e capacitação contínua das equipes operacionais.",
    color: "text-slate-500",
  },
  {
    icon: Users,
    title: "Comunicação Integrada",
    description: "Centralização do relacionamento com todos os stakeholders e fornecedores estratégicos do projeto.",
    color: "text-purple-500",
  },
  {
    icon: Headset,
    title: "Suporte & Engenharia",
    description: "Canal direto para consultoria técnica, aprovação de melhorias e suporte especializado.",
    color: "text-cyan-500",
  },
  {
    icon: Fuel,
    title: "Gestão de Geradores",
    description: "Controle rigoroso de consumo de combustível e análise de eficiência dos grupos geradores a diesel.",
    color: "text-amber-600",
  },
  {
    icon: TrendingUp,
    title: "Resultado Efetivo",
    description: "Consolidação financeira mostrando o 'Antes vs. Depois' e a economia total acumulada com a implementação CEFE.",
    color: "text-green-600",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full-screen background image with overlay */}
      <section className="min-h-screen relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${marbleHero})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Navbar */}
          <nav className="h-16 flex items-center justify-between px-6 md:px-12">
            <div className="flex items-center gap-3">
              <img src={logo} alt="CEFE Logo" className="h-10 w-10" />
              <span className="text-xl font-bold text-white">CEFE</span>
            </div>
            <Button 
              onClick={() => navigate("/login")} 
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              Acessar Plataforma
            </Button>
          </nav>

          {/* Hero Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <img src={logo} alt="CEFE Logo" className="h-28 w-28" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                CEFE
              </h1>
              
              <h2 className="text-xl md:text-2xl text-white/90 mb-6">
                Central de Eficiência Energética da Thor
              </h2>
              
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Uma solução integrada apresentada por parceiros estratégicos
              </p>
              
              <Button 
                onClick={() => navigate("/login")} 
                size="lg" 
                className="text-lg px-10 py-6 bg-primary hover:bg-primary/90"
              >
                Acessar Plataforma
              </Button>
            </div>
          </main>

          {/* Partners Footer */}
          <footer className="py-8 px-6 border-t border-white/10">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-white/60 text-sm mb-6">
                Solução desenvolvida para Thor Natural Stones por:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                {partners.map((partner) => (
                  <div 
                    key={partner.id}
                    className="text-white/80 font-semibold text-lg hover:text-white transition-colors"
                  >
                    {partner.name}
                  </div>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nossas Soluções Integradas
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para eficiência energética completa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className={`mb-4 ${feature.color}`}>
                    <feature.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            <Button 
              onClick={() => navigate("/login")} 
              size="lg"
              className="text-lg px-10 py-6"
            >
              Comece Agora
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="py-8 px-6 bg-background border-t">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 CEFE - Central de Eficiência Energética da Thor. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
