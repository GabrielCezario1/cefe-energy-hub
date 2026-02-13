import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WarehouseDailyData, formatBRL, formatNumber } from "@/lib/energyMockData";

interface Props {
  data: WarehouseDailyData[];
}

export function WarehouseDailyTable({ data }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead className="text-right">Cons. Ponta (kWh)</TableHead>
          <TableHead className="text-right">Cons. F. Ponta (kWh)</TableHead>
          <TableHead className="text-right">Cons. Total (kWh)</TableHead>
          <TableHead className="text-right">Demanda Máx (kW)</TableHead>
          <TableHead className="text-right">Fat. Potência Médio</TableHead>
          <TableHead className="text-right">Custo Estimado (R$)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.date}>
            <TableCell>{row.date.split("-").reverse().slice(0, 2).join("/")}</TableCell>
            <TableCell className="text-right">{formatNumber(row.consumoPontaKwh, 1)}</TableCell>
            <TableCell className="text-right">{formatNumber(row.consumoForaPontaKwh, 1)}</TableCell>
            <TableCell className="text-right">{formatNumber(row.consumoTotalKwh, 1)}</TableCell>
            <TableCell className="text-right">{formatNumber(row.demandaMaxKw, 1)}</TableCell>
            <TableCell className="text-right">
              {formatNumber(row.fatPotMedio, 2)}
              {row.fatPotMedio < 0.92 && <Badge variant="destructive" className="ml-2 text-xs">Baixo</Badge>}
            </TableCell>
            <TableCell className="text-right">{formatBRL(row.custoEstimadoBrl)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
