import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Warehouse, formatBRL, formatNumber } from "@/lib/energyMockData";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

const cardColors = [
  { border: "border-l-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-500" },
  { border: "border-l-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-500" },
  { border: "border-l-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "text-emerald-500" },
  { border: "border-l-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", icon: "text-purple-500" },
  { border: "border-l-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", icon: "text-rose-500" },
  { border: "border-l-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", icon: "text-amber-500" },
  { border: "border-l-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30", icon: "text-cyan-500" },
  { border: "border-l-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", icon: "text-indigo-500" },
];

interface Props {
  warehouse: Warehouse;
  colorIndex?: number;
}

export function WarehouseCard({ warehouse, colorIndex = 0 }: Props) {
  const navigate = useNavigate();
  const colors = cardColors[colorIndex % cardColors.length];

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4 ${colors.border} ${colors.bg}`}
      onClick={() => navigate(`/dashboard/energy-management/warehouse/${warehouse.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{warehouse.name}</CardTitle>
          <Zap className={`h-4 w-4 ${colors.icon}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs font-normal">
            {formatNumber(warehouse.totalConsumptionKwh)} kWh
          </Badge>
        </div>
        <p className="text-lg font-semibold">{formatBRL(warehouse.totalCostBrl)}</p>
      </CardContent>
    </Card>
  );
}
