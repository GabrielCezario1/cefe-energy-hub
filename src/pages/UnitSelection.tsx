import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { units } from "@/lib/units";
import { useUnit } from "@/contexts/UnitContext";
import { MapPin, Zap } from "lucide-react";
import logo from "@/assets/cefe-logo-original.png";

const UnitSelection = () => {
  const navigate = useNavigate();
  const { setSelectedUnit } = useUnit();

  const handleUnitSelect = (unit: typeof units[0]) => {
    setSelectedUnit(unit);
    navigate("/dashboard");
  };

  const groupedUnits = units.reduce((acc, unit) => {
    if (!acc[unit.state]) {
      acc[unit.state] = [];
    }
    acc[unit.state].push(unit);
    return acc;
  }, {} as Record<string, typeof units>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <img src={logo} alt="CEFE Logo" className="h-16 w-16 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Bem-vindo ao CEFE</h1>
            <p className="text-muted-foreground text-lg">Selecione a Unidade para Acesso</p>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedUnits).map(([state, stateUnits]) => (
            <div key={state}>
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-2xl font-semibold">
                  {stateUnits[0].location}
                </h2>
                <Badge variant="secondary" className="ml-3">
                  {stateUnits.length} {stateUnits.length === 1 ? "Unidade" : "Unidades"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stateUnits.map((unit) => (
                  <Card
                    key={unit.id}
                    className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary"
                    onClick={() => handleUnitSelect(unit)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl">{unit.name}</CardTitle>
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Capacidade:</span>
                          <span className="font-semibold">{unit.installedCapacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Instalação:</span>
                          <span className="font-semibold">
                            {new Date(unit.installDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnitSelection;
