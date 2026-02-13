import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CondominiumInvoice } from "@/lib/energyMockData";

const schema = z.object({
  totalValue: z.coerce.number().min(0),
  totalConsumptionKwh: z.coerce.number().min(0),
  availablePower: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: CondominiumInvoice;
  onSave: (data: FormData) => void;
}

export function InvoiceEditModal({ open, onOpenChange, invoice, onSave }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      totalValue: invoice.totalValue,
      totalConsumptionKwh: invoice.totalConsumptionKwh,
      availablePower: invoice.availablePower,
    },
  });

  const submit = (data: FormData) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Fatura</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <form onSubmit={handleSubmit(submit)} className="space-y-4 p-1">
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
