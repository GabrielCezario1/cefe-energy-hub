import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/cefe-logo.png";
import marbleHero from "@/assets/marble-quarry-hero.jpg";

const partners = [
  { name: "Cloud Virtus", id: "cloud-virtus" },
  { name: "META", id: "meta" },
  { name: "Sunfarm", id: "sunfarm" },
  { name: "Seletiva", id: "seletiva" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      {/* Full-screen background image with overlay */}
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

        {/* Hero Section */}
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
    </div>
  );
};

export default Landing;
