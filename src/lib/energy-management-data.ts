export interface Warehouse {
  id: string;
  name: string;
  tenant: string;
  color: string;
  consumoPonta: number;
  consumoFPonta: number;
  demandaMax: number;
  medidorId: string;
}

export interface FaturaParams {
  tarifaPonta: number;
  tarifaFPonta: number;
  tarifaDemanda: number;
  demandaContratada: number;
  icms: number;
  pis: number;
  cofins: number;
  bandeira: "Verde" | "Amarela" | "Vermelha 1" | "Vermelha 2";
  adicionalBandeira: number;
  cip: number;
  valorRealFatura: number;
}

export const defaultFaturaParams: FaturaParams = {
  tarifaPonta: 1.24,
  tarifaFPonta: 0.58,
  tarifaDemanda: 38.5,
  demandaContratada: 376,
  icms: 18,
  pis: 0.76,
  cofins: 3.5,
  bandeira: "Verde",
  adicionalBandeira: 0,
  cip: 420,
  valorRealFatura: 86220,
};

export const bandeiraValues: Record<string, number> = {
  Verde: 0,
  Amarela: 0.01885,
  "Vermelha 1": 0.04463,
  "Vermelha 2": 0.07877,
};

export const warehouses: Warehouse[] = [
  { id: "galpao-a1", name: "Galpão A1", tenant: "Shopee", color: "#f97316", consumoPonta: 1250, consumoFPonta: 7290, demandaMax: 45, medidorId: "MD4040-A1" },
  { id: "galpao-a2", name: "Galpão A2", tenant: "Mercado Livre", color: "#eab308", consumoPonta: 1580, consumoFPonta: 8450, demandaMax: 52, medidorId: "MD4040-A2" },
  { id: "galpao-b1", name: "Galpão B1", tenant: "MRO Supply", color: "#3b82f6", consumoPonta: 980, consumoFPonta: 5670, demandaMax: 38, medidorId: "MD4040-B1" },
  { id: "galpao-b2", name: "Galpão B2", tenant: "FastLog Transportes", color: "#22c55e", consumoPonta: 1100, consumoFPonta: 6340, demandaMax: 41, medidorId: "MD4040-B2" },
  { id: "galpao-c1", name: "Galpão C1", tenant: "TechParts Componentes", color: "#a855f7", consumoPonta: 1420, consumoFPonta: 7890, demandaMax: 48, medidorId: "MD4040-C1" },
  { id: "galpao-c2", name: "Galpão C2", tenant: "AgroStock Armazéns", color: "#a16207", consumoPonta: 870, consumoFPonta: 4920, demandaMax: 33, medidorId: "MD4040-C2" },
  { id: "galpao-d1", name: "Galpão D1", tenant: "NovaPack Embalagens", color: "#ef4444", consumoPonta: 1350, consumoFPonta: 7200, demandaMax: 46, medidorId: "MD4040-D1" },
  { id: "galpao-d2", name: "Galpão D2", tenant: "Área Comum / Administração", color: "#6b7280", consumoPonta: 450, consumoFPonta: 2100, demandaMax: 15, medidorId: "MD4040-D2" },
];

// GDE4000 totals (larger than sum of MD4040 to generate losses)
export const gde4000 = {
  consumoPonta: 9450,
  consumoFPonta: 52320,
  demandaMedida: 312,
  energiaReativa: 4850,
  fatorPotencia: 0.94,
  geracaoSolar: 8200,
  creditoSolar: 4756,
};

export const totalMD4040 = {
  consumoPonta: warehouses.reduce((s, w) => s + w.consumoPonta, 0),
  consumoFPonta: warehouses.reduce((s, w) => s + w.consumoFPonta, 0),
};

export function calcImpostos(params: FaturaParams): number {
  return (params.icms + params.pis + params.cofins) / 100;
}

export function calcWarehouseTotal(w: Warehouse, params: FaturaParams): number {
  const impostos = 1 + calcImpostos(params);
  const totalConsumoMD = totalMD4040.consumoPonta + totalMD4040.consumoFPonta;
  const wTotal = w.consumoPonta + w.consumoFPonta;
  const proporcao = wTotal / totalConsumoMD;

  const custoPonta = w.consumoPonta * params.tarifaPonta * impostos;
  const custoFPonta = w.consumoFPonta * params.tarifaFPonta * impostos;
  const parcelaDemanda = w.demandaMax * params.tarifaDemanda;

  const totalGDE = gde4000.consumoPonta + gde4000.consumoFPonta;
  const perdas = totalGDE - totalConsumoMD;
  const perdasPercent = perdas / totalGDE;
  const rateioPerdas = perdasPercent * (custoPonta + custoFPonta);

  const rateioCIP = params.cip * proporcao;
  const rateioBandeira = (w.consumoPonta + w.consumoFPonta) * params.adicionalBandeira;

  return custoPonta + custoFPonta + parcelaDemanda + rateioPerdas + rateioCIP + rateioBandeira;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

// Monthly mock data per warehouse (for detail charts)
export const monthlyConsumptionMock = [
  { month: "Ago", ponta: 1100, fPonta: 6800 },
  { month: "Set", ponta: 1050, fPonta: 7100 },
  { month: "Out", ponta: 1200, fPonta: 7300 },
  { month: "Nov", ponta: 1180, fPonta: 6950 },
  { month: "Dez", ponta: 1300, fPonta: 7500 },
  { month: "Jan", ponta: 1250, fPonta: 7290 },
];

export const monthlyValueMock = [
  { month: "Ago", valor: 8900 },
  { month: "Set", valor: 9200 },
  { month: "Out", valor: 9600 },
  { month: "Nov", valor: 9100 },
  { month: "Dez", valor: 10100 },
  { month: "Jan", valor: 9553 },
];
