import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Warehouse } from "@/lib/energyMockData";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: Warehouse[];
}

export function SendInvoiceModal({ open, onOpenChange, warehouses }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});

  const toggle = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSend = () => {
    const count = Object.values(selected).filter(Boolean).length;
    if (count === 0) {
      toast.error("Selecione ao menos um galpão.");
      return;
    }
    toast.success(`Faturas enviadas para ${count} galpão(ões) com sucesso!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar Faturas por E-mail</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {warehouses.map((w) => (
            <div key={w.id} className="flex items-center gap-3">
              <Checkbox checked={!!selected[w.id]} onCheckedChange={() => toggle(w.id)} />
              <Label className="min-w-[120px]">{w.name}</Label>
              {selected[w.id] && (
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={emails[w.id] || ""}
                  onChange={(e) => setEmails((prev) => ({ ...prev, [w.id]: e.target.value }))}
                  className="flex-1"
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSend}>Enviar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
