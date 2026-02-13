import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getMD50Registers, formatNumber } from "@/lib/energyMockData";

interface Props {
  warehouseId: string;
  selectedDay: string;
  onDayChange: (day: string) => void;
  availableDays: string[];
}

export function WarehouseRegistersTable({ warehouseId, selectedDay, onDayChange, availableDays }: Props) {
  const registers = getMD50Registers(warehouseId, selectedDay);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Dia:</span>
        <Select value={selectedDay} onValueChange={onDayChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableDays.slice(0, 10).map((d) => (
              <SelectItem key={d} value={d}>Dia {d.split("-")[2]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Horário</TableHead>
              <TableHead className="text-right">C. Ponta (kWh)</TableHead>
              <TableHead className="text-right">C. F. Ponta (kWh)</TableHead>
              <TableHead className="text-right">E. Ind. Ponta</TableHead>
              <TableHead className="text-right">E. Ind. F.P.</TableHead>
              <TableHead className="text-right">E. Cap. Ponta</TableHead>
              <TableHead className="text-right">E. Cap. F.P.</TableHead>
              <TableHead className="text-right">Pot. Ativa (kW)</TableHead>
              <TableHead className="text-right">Fat. Potência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registers.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.timestamp.split("T")[1].substring(0, 5)}</TableCell>
                <TableCell className="text-right">{formatNumber(r.consumoPonta15min, 2)}</TableCell>
                <TableCell className="text-right">{formatNumber(r.consumoForaPonta15min, 2)}</TableCell>
                <TableCell className="text-right">{formatNumber(r.energIndPonta15min, 2)}</TableCell>
                <TableCell className="text-right">{formatNumber(r.energIndForaPonta15min, 2)}</TableCell>
                <TableCell className="text-right">{formatNumber(r.energCapPonta, 2)}</TableCell>
                <TableCell className="text-right">{formatNumber(r.energCapForaPonta, 2)}</TableCell>
                <TableCell className="text-right">{formatNumber(r.potAtivT, 1)}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(r.fatPotT, 2)}
                  {r.fatPotT < 0.92 && <Badge variant="destructive" className="ml-1 text-xs">!</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
