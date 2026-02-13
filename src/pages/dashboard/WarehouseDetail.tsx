import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUnit } from "@/contexts/UnitContext";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthSelector } from "@/components/energy/MonthSelector";
import { WarehouseKpiCards } from "@/components/energy/WarehouseKpiCards";
import { WarehouseDailyChart } from "@/components/energy/WarehouseDailyChart";
import { WarehouseMonthlyChart } from "@/components/energy/WarehouseMonthlyChart";
import { WarehouseDailyTable } from "@/components/energy/WarehouseDailyTable";
import { WarehouseRegistersTable } from "@/components/energy/WarehouseRegistersTable";
import {
  warehouses,
  availableMonths,
  getWarehouseMonthlyData,
  getWarehouseDailyData,
} from "@/lib/energyMockData";

const WarehouseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedUnit } = useUnit();
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[availableMonths.length - 1]);

  const warehouse = warehouses.find((w) => w.id === id);
  const dailyData = useMemo(() => (id ? getWarehouseDailyData(id, selectedMonth) : []), [id, selectedMonth]);
  const availableDays = useMemo(() => dailyData.map((d) => d.date), [dailyData]);
  const [selectedDay, setSelectedDay] = useState(() => availableDays[0] || `${selectedMonth}-01`);

  // Update selectedDay when month changes
  const currentDay = availableDays.includes(selectedDay) ? selectedDay : availableDays[0] || `${selectedMonth}-01`;

  if (selectedUnit?.id !== "th01") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Módulo disponível apenas para a unidade TH01.</h2>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <h2 className="text-xl font-semibold">Galpão não encontrado</h2>
        <Button variant="outline" onClick={() => navigate("/dashboard/energy-management")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      </div>
    );
  }

  const monthlyData = getWarehouseMonthlyData(id!);
  const currentMonthData = monthlyData.find((m) => m.month === selectedMonth) || {
    totalConsumptionKwh: warehouse.totalConsumptionKwh,
    totalCostBrl: warehouse.totalCostBrl,
    availablePower: warehouse.availablePower,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/energy-management")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{warehouse.name}</h1>
          <p className="text-muted-foreground">Dados do módulo Embrasul MD50</p>
        </div>
      </div>

      <MonthSelector value={selectedMonth} onChange={setSelectedMonth} availableMonths={availableMonths} />

      <WarehouseKpiCards
        consumption={currentMonthData.totalConsumptionKwh}
        cost={currentMonthData.totalCostBrl}
        power={currentMonthData.availablePower}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WarehouseDailyChart
          warehouseId={id!}
          selectedDay={currentDay}
          onDayChange={setSelectedDay}
          availableDays={availableDays}
        />
        <WarehouseMonthlyChart dailyData={dailyData} />
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Dados Diários</TabsTrigger>
          <TabsTrigger value="md50">Registros MD50 (15 min)</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <WarehouseDailyTable data={dailyData} />
        </TabsContent>
        <TabsContent value="md50">
          <WarehouseRegistersTable
            warehouseId={id!}
            selectedDay={currentDay}
            onDayChange={setSelectedDay}
            availableDays={availableDays}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WarehouseDetail;
