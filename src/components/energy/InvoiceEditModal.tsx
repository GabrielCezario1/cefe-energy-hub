import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CondominiumInvoice } from "@/lib/energyMockData";

const itemSchema = z.object({
  quantity: z.coerce.number().nullable(),
  tariff: z.coerce.number().nullable(),
  value: z.coerce.number(),
  icmsRate: z.coerce.number().min(0).max(1),
});

const schema = z.object({
  totalValue: z.coerce.number().min(0),
  totalConsumptionKwh: z.coerce.number().min(0),
  availablePower: z.coerce.number().min(0),
  consumoReativoExcedenteFp: itemSchema,
  beneficioTarifarioBruto: itemSchema,
  tusdForaPonta: itemSchema,
  tusdPonta: itemSchema,
  dicMensal: itemSchema,
  cipIlumPub: itemSchema,
  beneficioTarifarioLiquido: itemSchema,
});

export type InvoiceEditFormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: CondominiumInvoice;
  onSave: (data: InvoiceEditFormData) => void;
}

const indicatorKeys = [
  { key: "consumoReativoExcedenteFp" as const, label: "Consumo Reativo Excedente Fp", hasQtyTariff: true },
  { key: "beneficioTarifarioBruto" as const, label: "Benefício Tarifário Bruto", hasQtyTariff: false },
  { key: "tusdForaPonta" as const, label: "TUSD Fora Ponta", hasQtyTariff: true },
  { key: "tusdPonta" as const, label: "TUSD Ponta", hasQtyTariff: true },
  { key: "dicMensal" as const, label: "DIC Mensal", hasQtyTariff: false },
  { key: "cipIlumPub" as const, label: "CIP - ILUM PUB", hasQtyTariff: false },
  { key: "beneficioTarifarioLiquido" as const, label: "Benefício Tarifário Líquido", hasQtyTariff: false },
];

function mapItemsToDefaults(invoice: CondominiumInvoice) {
  const items = invoice.demoItems;
  return {
    consumoReativoExcedenteFp: { quantity: items[0]?.quantity ?? 0, tariff: items[0]?.tariff ?? 0, value: items[0]?.value ?? 0, icmsRate: items[0]?.icmsRate ?? 0 },
    beneficioTarifarioBruto: { quantity: items[1]?.quantity ?? 0, tariff: items[1]?.tariff ?? 0, value: items[1]?.value ?? 0, icmsRate: items[1]?.icmsRate ?? 0 },
    tusdForaPonta: { quantity: items[2]?.quantity ?? 0, tariff: items[2]?.tariff ?? 0, value: items[2]?.value ?? 0, icmsRate: items[2]?.icmsRate ?? 0 },
    tusdPonta: { quantity: items[3]?.quantity ?? 0, tariff: items[3]?.tariff ?? 0, value: items[3]?.value ?? 0, icmsRate: items[3]?.icmsRate ?? 0 },
    dicMensal: { quantity: items[4]?.quantity ?? 0, tariff: items[4]?.tariff ?? 0, value: items[4]?.value ?? 0, icmsRate: items[4]?.icmsRate ?? 0 },
    cipIlumPub: { quantity: items[5]?.quantity ?? 0, tariff: items[5]?.tariff ?? 0, value: items[5]?.value ?? 0, icmsRate: items[5]?.icmsRate ?? 0 },
    beneficioTarifarioLiquido: { quantity: items[6]?.quantity ?? 0, tariff: items[6]?.tariff ?? 0, value: items[6]?.value ?? 0, icmsRate: items[6]?.icmsRate ?? 0 },
  };
}

export function InvoiceEditModal({ open, onOpenChange, invoice, onSave }: Props) {
  const defaults = mapItemsToDefaults(invoice);

  const { register, handleSubmit, formState: { errors } } = useForm<InvoiceEditFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      totalValue: invoice.totalValue,
      totalConsumptionKwh: invoice.totalConsumptionKwh,
      availablePower: invoice.availablePower,
      ...defaults,
    },
  });

  const submit = (data: InvoiceEditFormData) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Fatura</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-3">
          <form onSubmit={handleSubmit(submit)} className="space-y-5 p-1">
            {/* Campos gerais */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Dados Gerais</h3>
              <Separator />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Valor Total da Conta (R$)</Label>
                <Input type="number" step="0.01" {...register("totalValue")} />
                {errors.totalValue && <p className="text-sm text-destructive">{errors.totalValue.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Consumo Total (kWh)</Label>
                <Input type="number" {...register("totalConsumptionKwh")} />
                {errors.totalConsumptionKwh && <p className="text-sm text-destructive">{errors.totalConsumptionKwh.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Potência Disponibilizada (kW)</Label>
                <Input type="number" {...register("availablePower")} />
                {errors.availablePower && <p className="text-sm text-destructive">{errors.availablePower.message}</p>}
              </div>
            </div>

            {/* Indicadores */}
            <div className="space-y-1 pt-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Indicadores do Demonstrativo</h3>
              <Separator />
            </div>

            {indicatorKeys.map(({ key, label, hasQtyTariff }) => (
              <div key={key} className="space-y-2 rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">{label}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {hasQtyTariff && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">Quantidade</Label>
                        <Input type="number" step="1" {...register(`${key}.quantity`)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tarifa (R$)</Label>
                        <Input type="number" step="0.00001" {...register(`${key}.tariff`)} />
                      </div>
                    </>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Valor (R$)</Label>
                    <Input type="number" step="0.01" {...register(`${key}.value`)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Alíquota ICMS</Label>
                    <Input type="number" step="0.01" min="0" max="1" placeholder="ex: 0.24" {...register(`${key}.icmsRate`)} />
                  </div>
                </div>
              </div>
            ))}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
