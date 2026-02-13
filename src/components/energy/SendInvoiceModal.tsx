import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Warehouse } from "@/lib/energyMockData";
import { toast } from "sonner";
import { Download, Send } from "lucide-react";

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

  const handleDownload = (warehouseName: string) => {
    toast.success(`Download da fatura de ${warehouseName} iniciado!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar Faturas por E-mail</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {warehouses.map((w) => (
            <div key={w.id} className="flex items-center gap-3 p-2 rounded-lg border border-border">
              <Checkbox checked={!!selected[w.id]} onCheckedChange={() => toggle(w.id)} />
              <Label className="min-w-[120px] font-medium">{w.name}</Label>
              <div className="flex-1 flex items-center gap-2">
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
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(w.name);
                }}
                className="shrink-0"
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSend}>
            <Send className="h-4 w-4 mr-1" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
