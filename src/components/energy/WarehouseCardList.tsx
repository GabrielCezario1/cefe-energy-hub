import { Warehouse } from "@/lib/energyMockData";
import { WarehouseCard } from "./WarehouseCard";

interface Props {
  warehouses: Warehouse[];
}

export function WarehouseCardList({ warehouses }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Galpões do Condomínio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map((w, index) => (
          <WarehouseCard key={w.id} warehouse={w} colorIndex={index} />
        ))}
      </div>
    </div>
  );
}
