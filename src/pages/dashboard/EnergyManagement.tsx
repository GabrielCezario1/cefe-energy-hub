import { useState } from "react";
import { useUnit } from "@/contexts/UnitContext";
import { Building2, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthSelector } from "@/components/energy/MonthSelector";
import { CondominiumKpiCards } from "@/components/energy/CondominiumKpiCards";
import { InvoiceDemoTable } from "@/components/energy/InvoiceDemoTable";
import { WarehouseCardList } from "@/components/energy/WarehouseCardList";
import { InvoiceEditModal } from "@/components/energy/InvoiceEditModal";
import { SendInvoiceModal } from "@/components/energy/SendInvoiceModal";
import {
  condominiumInvoices,
  availableMonths,
  warehouses,
} from "@/lib/energyMockData";

const EnergyManagement = () => {
  const { selectedUnit } = useUnit();
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[availableMonths.length - 1]);
  const [editOpen, setEditOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [invoiceOverrides, setInvoiceOverrides] = useState<Record<string, Partial<typeof condominiumInvoices[0]>>>({});

  if (selectedUnit?.id !== "th01") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Módulo não disponível</h2>
        <p className="text-muted-foreground text-center max-w-md">
          O módulo de Gerenciamento de Energia está disponível apenas para a unidade
          <strong> TH01</strong>. Selecione essa unidade na barra superior para acessar.
        </p>
      </div>
    );
  }

  const baseInvoice = condominiumInvoices.find((i) => i.month === selectedMonth) || condominiumInvoices[0];
  const overrides = invoiceOverrides[selectedMonth] || {};
  const invoice = { ...baseInvoice, ...overrides };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Gerenciamento de Energia — Condomínio TH01</h1>
        <p className="text-muted-foreground">Dados da fatura mensal Enel</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} availableMonths={availableMonths} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Editar Fatura
          </Button>
          <Button variant="outline" onClick={() => setSendOpen(true)}>
            <Send className="h-4 w-4 mr-1" /> Enviar Faturas
          </Button>
        </div>
      </div>

      <CondominiumKpiCards
        totalValue={invoice.totalValue}
        totalConsumption={invoice.totalConsumptionKwh}
        availablePower={invoice.availablePower}
      />

      <InvoiceDemoTable items={invoice.demoItems} />

      <WarehouseCardList warehouses={warehouses} />

      <InvoiceEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        invoice={invoice}
        onSave={(data) => {
          setInvoiceOverrides((prev) => ({
            ...prev,
            [selectedMonth]: data,
          }));
        }}
      />

      <SendInvoiceModal open={sendOpen} onOpenChange={setSendOpen} warehouses={warehouses} />
    </div>
  );
};

export default EnergyManagement;
