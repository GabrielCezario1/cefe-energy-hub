import { Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUnit } from "@/contexts/UnitContext";
import { units } from "@/lib/units";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import logo from "@/assets/cefe-logo.png";

export function DashboardNavbar() {
  const { selectedUnit, setSelectedUnit } = useUnit();
  const navigate = useNavigate();

  const handleUnitChange = (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (unit) {
      setSelectedUnit(unit);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-50">
      <SidebarTrigger />
      
      <div className="flex items-center gap-2">
        <img src={logo} alt="CEFE" className="h-10 w-30" />
        <span className="font-bold text-lg hidden sm:inline">CEFE - THOR</span>
      </div>

      <div className="flex-1 flex justify-center">
        <Select value={selectedUnit?.id} onValueChange={handleUnitChange}>
          <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder="Selecione uma unidade" />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name} - {unit.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-2">
              <p className="font-semibold mb-2">Notificações</p>
              <div className="space-y-2">
                <div className="text-sm p-2 rounded bg-destructive/10">
                  Alta temperatura no Inversor 1
                </div>
                <div className="text-sm p-2 rounded bg-muted">
                  Manutenção programada para amanhã
                </div>
                <div className="text-sm p-2 rounded bg-muted">
                  Relatório mensal disponível
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <span className="hidden sm:inline">Menu</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
