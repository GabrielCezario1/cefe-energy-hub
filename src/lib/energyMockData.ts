// Types
export interface InvoiceDemoItem {
  indicator: string;
  quantity: number | null;
  unit: string;
  tariff: number | null;
  value: number;
  icmsBase: number;
  icmsRate: number;
  icmsValue: number;
}

export interface CondominiumInvoice {
  month: string;
  totalValue: number;
  totalConsumptionKwh: number;
  availablePower: number;
  demoItems: InvoiceDemoItem[];
}

export interface Warehouse {
  id: string;
  name: string;
  totalConsumptionKwh: number;
  totalCostBrl: number;
  availablePower: number;
}

export interface WarehouseMonthlyData {
  month: string;
  totalConsumptionKwh: number;
  totalCostBrl: number;
  availablePower: number;
}

export interface WarehouseDailyData {
  date: string;
  consumoPontaKwh: number;
  consumoForaPontaKwh: number;
  consumoTotalKwh: number;
  demandaMaxKw: number;
  fatPotMedio: number;
  custoEstimadoBrl: number;
}

export interface MD50Register {
  timestamp: string;
  consumoPonta: number;
  consumoForaPonta: number;
  consumoReserv: number;
  energIndPonta: number;
  energIndForaPonta: number;
  energCapPonta: number;
  energCapForaPonta: number;
  maxPotAtivPonta: number;
  maxPotAtivForaPonta: number;
  consumoPonta15min: number;
  consumoForaPonta15min: number;
  energIndPonta15min: number;
  energIndForaPonta15min: number;
  potAtivT: number;
  fatPotT: number;
}

// Helper
const fmt = (v: number) => parseFloat(v.toFixed(2));

// Invoice data per month
const baseDemoItems: InvoiceDemoItem[] = [
  { indicator: "Consumo Reativo Excedente Fp", quantity: 1312, unit: "kVA", tariff: 0.41591, value: 545.67, icmsBase: 545.67, icmsRate: 0.24, icmsValue: 130.96 },
  { indicator: "Benefício Tarifário Bruto", quantity: null, unit: "", tariff: null, value: 20899.57, icmsBase: 20899.57, icmsRate: 0.24, icmsValue: 5015.89 },
  { indicator: "TUSD Fora Ponta", quantity: 29818, unit: "kWh", tariff: 0.21263, value: 6340.35, icmsBase: 6340.35, icmsRate: 0.24, icmsValue: 1521.68 },
  { indicator: "TUSD Ponta", quantity: 4125, unit: "kWh", tariff: 0.21263, value: 877.10, icmsBase: 877.10, icmsRate: 0.24, icmsValue: 210.50 },
  { indicator: "DIC Mensal", quantity: null, unit: "", tariff: null, value: -3645.62, icmsBase: 0, icmsRate: 0, icmsValue: 0 },
  { indicator: "CIP - ILUM PUB", quantity: null, unit: "", tariff: null, value: 105.49, icmsBase: 0, icmsRate: 0, icmsValue: 0 },
  { indicator: "Benefício Tarifário Líquido", quantity: null, unit: "", tariff: null, value: -14743.24, icmsBase: 0, icmsRate: 0, icmsValue: 0 },
];

function varyItems(items: InvoiceDemoItem[], factor: number): InvoiceDemoItem[] {
  return items.map(item => ({
    ...item,
    quantity: item.quantity ? Math.round(item.quantity * factor) : null,
    value: fmt(item.value * factor),
    icmsBase: fmt(item.icmsBase * factor),
    icmsValue: fmt(item.icmsValue * factor),
  }));
}

export const condominiumInvoices: CondominiumInvoice[] = [
  { month: "2026-01", totalValue: 25122.45, totalConsumptionKwh: 33943, availablePower: 150, demoItems: varyItems(baseDemoItems, 1.0) },
  { month: "2026-02", totalValue: 23850.10, totalConsumptionKwh: 31200, availablePower: 150, demoItems: varyItems(baseDemoItems, 0.94) },
  { month: "2026-03", totalValue: 26480.78, totalConsumptionKwh: 35100, availablePower: 150, demoItems: varyItems(baseDemoItems, 1.05) },
];

export const availableMonths = ["2026-01", "2026-02", "2026-03"];

// Warehouses
export const warehouses: Warehouse[] = [
  { id: "mercado-livre", name: "Mercado Livre", totalConsumptionKwh: 4521, totalCostBrl: 3200.00, availablePower: 75 },
  { id: "shopee", name: "Shopee", totalConsumptionKwh: 3890, totalCostBrl: 2750.00, availablePower: 60 },
  { id: "mro", name: "MRO", totalConsumptionKwh: 5102, totalCostBrl: 3610.00, availablePower: 80 },
  { id: "galpao-alpha", name: "Galpão Alpha", totalConsumptionKwh: 2330, totalCostBrl: 1650.00, availablePower: 45 },
  { id: "galpao-beta", name: "Galpão Beta", totalConsumptionKwh: 3100, totalCostBrl: 2195.00, availablePower: 55 },
  { id: "galpao-gamma", name: "Galpão Gamma", totalConsumptionKwh: 2800, totalCostBrl: 1984.00, availablePower: 50 },
  { id: "galpao-delta", name: "Galpão Delta", totalConsumptionKwh: 4200, totalCostBrl: 2976.00, availablePower: 70 },
  { id: "galpao-epsilon", name: "Galpão Epsilon", totalConsumptionKwh: 3000, totalCostBrl: 2125.00, availablePower: 55 },
];

// Per-warehouse monthly data
export function getWarehouseMonthlyData(warehouseId: string): WarehouseMonthlyData[] {
  const w = warehouses.find(wh => wh.id === warehouseId);
  if (!w) return [];
  return [
    { month: "2026-01", totalConsumptionKwh: Math.round(w.totalConsumptionKwh * 0.95), totalCostBrl: fmt(w.totalCostBrl * 0.95), availablePower: w.availablePower },
    { month: "2026-02", totalConsumptionKwh: Math.round(w.totalConsumptionKwh * 0.90), totalCostBrl: fmt(w.totalCostBrl * 0.90), availablePower: w.availablePower },
    { month: "2026-03", totalConsumptionKwh: w.totalConsumptionKwh, totalCostBrl: w.totalCostBrl, availablePower: w.availablePower },
  ];
}

// Daily data for a warehouse (30 days)
export function getWarehouseDailyData(warehouseId: string, month: string): WarehouseDailyData[] {
  const w = warehouses.find(wh => wh.id === warehouseId);
  if (!w) return [];
  const seed = warehouseId.length * 7;
  const days = 30;
  const avgDaily = w.totalConsumptionKwh / days;
  const result: WarehouseDailyData[] = [];
  for (let d = 1; d <= days; d++) {
    const variation = 0.8 + (((seed * d * 13) % 40) / 100);
    const ponta = fmt(avgDaily * 0.28 * variation);
    const fPonta = fmt(avgDaily * 0.72 * variation);
    const total = fmt(ponta + fPonta);
    result.push({
      date: `${month}-${String(d).padStart(2, "0")}`,
      consumoPontaKwh: ponta,
      consumoForaPontaKwh: fPonta,
      consumoTotalKwh: total,
      demandaMaxKw: fmt(w.availablePower * (0.6 + (((seed * d * 7) % 35) / 100))),
      fatPotMedio: fmt(0.88 + (((seed * d * 3) % 12) / 100)),
      custoEstimadoBrl: fmt(total * 0.71),
    });
  }
  return result;
}

// MD50 registers (96 per day = every 15 min)
export function getMD50Registers(warehouseId: string, date: string): MD50Register[] {
  const w = warehouses.find(wh => wh.id === warehouseId);
  if (!w) return [];
  const seed = warehouseId.length * 11;
  const registers: MD50Register[] = [];
  let accumPonta = 0;
  let accumFPonta = 0;

  for (let i = 0; i < 96; i++) {
    const hour = Math.floor(i / 4);
    const min = (i % 4) * 15;
    const isPonta = hour >= 17 && hour < 20;
    const variation = 0.5 + (((seed * (i + 1) * 17) % 50) / 100);
    const base = (w.totalConsumptionKwh / 30 / 96) * variation;
    const cPonta15 = isPonta ? fmt(base * 2.5) : fmt(base * 0.3);
    const cFPonta15 = isPonta ? fmt(base * 0.5) : fmt(base * 2.0);
    accumPonta += cPonta15;
    accumFPonta += cFPonta15;
    const potAtiv = fmt(w.availablePower * (0.3 + (((seed * i * 7) % 60) / 100)));

    registers.push({
      timestamp: `${date}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`,
      consumoPonta: fmt(accumPonta),
      consumoForaPonta: fmt(accumFPonta),
      consumoReserv: 0,
      energIndPonta: fmt(accumPonta * 0.05),
      energIndForaPonta: fmt(accumFPonta * 0.04),
      energCapPonta: fmt(accumPonta * 0.02),
      energCapForaPonta: fmt(accumFPonta * 0.015),
      maxPotAtivPonta: isPonta ? potAtiv : fmt(potAtiv * 0.4),
      maxPotAtivForaPonta: isPonta ? fmt(potAtiv * 0.6) : potAtiv,
      consumoPonta15min: cPonta15,
      consumoForaPonta15min: cFPonta15,
      energIndPonta15min: fmt(cPonta15 * 0.05),
      energIndForaPonta15min: fmt(cFPonta15 * 0.04),
      potAtivT: potAtiv,
      fatPotT: fmt(0.88 + (((seed * i * 3) % 12) / 100)),
    });
  }
  return registers;
}

// Formatting helpers
export const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export const formatNumber = (v: number, decimals = 0) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

export const monthLabels: Record<string, string> = {
  "2026-01": "Janeiro 2026",
  "2026-02": "Fevereiro 2026",
  "2026-03": "Março 2026",
};
