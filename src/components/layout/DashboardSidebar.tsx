import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Zap,
  DollarSign,
  Building2,
  Radio,
  Battery,
  FileCheck,
  Wrench,
  Users,
  Headphones,
  Fuel,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Monitoramento & Geração",
    url: "/dashboard",
    icon: Zap,
  },
  {
    title: "Gestão Financeira",
    url: "/dashboard/financial",
    icon: DollarSign,
  },
  {
    title: "Telemetria & Diagnóstico",
    url: "/dashboard/telemetry",
    icon: Radio,
  },
  {
    title: "Gestão Zero Grid",
    url: "/dashboard/zero-grid",
    icon: Battery,
  },
  {
    title: "Compliance & Auditoria",
    url: "/dashboard/compliance",
    icon: FileCheck,
  },
  {
    title: "Manutenção",
    url: "/dashboard/maintenance",
    icon: Wrench,
  },
  {
    title: "Comunicação & Parcerias",
    url: "/dashboard/communication",
    icon: Users,
  },
  {
    title: "Suporte Técnico",
    url: "/dashboard/support",
    icon: Headphones,
  },
  {
    title: "Gestão de Geradores",
    url: "/dashboard/generators",
    icon: Fuel,
  },
  {
    title: "Resultado Econômico",
    url: "/dashboard/economic-results",
    icon: TrendingUp,
  },
  {
    title: "Gerenciamento de Energia",
    url: "/dashboard/energy-management",
    icon: Building2,
  },
];

export function DashboardSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos de Serviço</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
