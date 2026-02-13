import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse, formatBRL, formatNumber } from "@/lib/energyMockData";
import { useNavigate } from "react-router-dom";

interface Props {
  warehouse: Warehouse;
}

export function WarehouseCard({ warehouse }: Props) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/dashboard/energy-management/warehouse/${warehouse.id}`)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{warehouse.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground">{formatNumber(warehouse.totalConsumptionKwh)} kWh</p>
        <p className="text-lg font-semibold">{formatBRL(warehouse.totalCostBrl)}</p>
      </CardContent>
    </Card>
  );
}
