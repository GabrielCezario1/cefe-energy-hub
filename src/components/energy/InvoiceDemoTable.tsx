import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { InvoiceDemoItem, formatBRL, formatNumber } from "@/lib/energyMockData";

interface Props {
  items: InvoiceDemoItem[];
}

export function InvoiceDemoTable({ items }: Props) {
  const totalValue = items.reduce((s, i) => s + i.value, 0);
  const totalIcms = items.reduce((s, i) => s + i.icmsValue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Demonstrativo da Fatura</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Indicador</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Tarifa (R$)</TableHead>
              <TableHead className="text-right">Valor (R$)</TableHead>
              <TableHead className="text-right">Base ICMS (R$)</TableHead>
              <TableHead className="text-right">Alíq. ICMS</TableHead>
              <TableHead className="text-right">Valor ICMS (R$)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{item.indicator}</TableCell>
                <TableCell className="text-right">{item.quantity != null ? formatNumber(item.quantity) : "—"}</TableCell>
                <TableCell>{item.unit || "—"}</TableCell>
                <TableCell className="text-right">{item.tariff != null ? formatNumber(item.tariff, 5) : "—"}</TableCell>
                <TableCell className={`text-right ${item.value < 0 ? "text-green-600" : ""}`}>
                  {formatBRL(item.value)}
                </TableCell>
                <TableCell className="text-right">{item.icmsBase > 0 ? formatBRL(item.icmsBase) : "—"}</TableCell>
                <TableCell className="text-right">{item.icmsRate > 0 ? `${(item.icmsRate * 100).toFixed(0)}%` : "—"}</TableCell>
                <TableCell className="text-right">{item.icmsValue > 0 ? formatBRL(item.icmsValue) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="font-bold">Total</TableCell>
              <TableCell className="text-right font-bold">{formatBRL(totalValue)}</TableCell>
              <TableCell colSpan={2} />
              <TableCell className="text-right font-bold">{formatBRL(totalIcms)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
