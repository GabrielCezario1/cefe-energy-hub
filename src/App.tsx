import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UnitProvider } from "./contexts/UnitContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import UnitSelection from "./pages/UnitSelection";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Financial from "./pages/dashboard/Financial";
import Telemetry from "./pages/dashboard/Telemetry";
import ZeroGrid from "./pages/dashboard/ZeroGrid";
import Compliance from "./pages/dashboard/Compliance";
import Maintenance from "./pages/dashboard/Maintenance";
import Communication from "./pages/dashboard/Communication";
import Support from "./pages/dashboard/Support";
import Generators from "./pages/dashboard/Generators";
import EconomicResults from "./pages/dashboard/EconomicResults";
import EnergyManagement from "./pages/dashboard/EnergyManagement";
import WarehouseDetail from "./pages/dashboard/WarehouseDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UnitProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/select-unit" element={<UnitSelection />} />
            <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
            <Route path="/dashboard/financial" element={<DashboardLayout><Financial /></DashboardLayout>} />
            <Route path="/dashboard/telemetry" element={<DashboardLayout><Telemetry /></DashboardLayout>} />
            <Route path="/dashboard/zero-grid" element={<DashboardLayout><ZeroGrid /></DashboardLayout>} />
            <Route path="/dashboard/compliance" element={<DashboardLayout><Compliance /></DashboardLayout>} />
            <Route path="/dashboard/maintenance" element={<DashboardLayout><Maintenance /></DashboardLayout>} />
            <Route path="/dashboard/communication" element={<DashboardLayout><Communication /></DashboardLayout>} />
            <Route path="/dashboard/support" element={<DashboardLayout><Support /></DashboardLayout>} />
            <Route path="/dashboard/generators" element={<DashboardLayout><Generators /></DashboardLayout>} />
            <Route path="/dashboard/economic-results" element={<DashboardLayout><EconomicResults /></DashboardLayout>} />
            <Route path="/dashboard/energy-management" element={<DashboardLayout><EnergyManagement /></DashboardLayout>} />
            <Route path="/dashboard/energy-management/warehouse/:id" element={<DashboardLayout><WarehouseDetail /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UnitProvider>
  </QueryClientProvider>
);

export default App;
