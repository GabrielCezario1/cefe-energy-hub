import { useParams, useNavigate } from "react-router-dom";
import { useUnit } from "@/contexts/UnitContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Zap, DollarSign, Gauge, PieChart, Building2 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  warehouses, defaultFaturaParams, calcImpostos, formatCurrency, formatNumber,
  monthlyConsumptionMock, monthlyValueMock,
} from "@/lib/energy-management-data";

const ALLOWED_UNITS = ["serra", "manilha-niteroi"];

const EnergyManagementWarehouse = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const { selectedUnit } = useUnit();
  const navigate = useNavigate();

  if (!selectedUnit) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Selecione uma unidade para visualizar os dados</p>
      </div>
    );
  }

  if (!ALLOWED_UNITS.includes(selectedUnit.id)) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Módulo não disponível</h2>
        <p className="text-muted-foreground text-center max-w-md">
          O módulo de Gerenciamento de Energia está disponível apenas para as unidades
          <strong> Serra</strong> e <strong>Manilha Niterói</strong>.
        </p>
      </div>
    );
  }

  const warehouse = warehouses.find((w) => w.id === warehouseId);
  if (!warehouse) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
        <h2 className="text-xl font-semibold">Galpão não encontrado</h2>
        <Button onClick={() => navigate("/dashboard/energy-management")}>Voltar</Button>
      </div>
    );
  }

  const params = defaultFaturaParams;
  const imp = 1 + calcImpostos(params);
  const consumoTotal = warehouse.consumoPonta + warehouse.consumoFPonta;
  const totalGDE = 61770; // gde4000 total

  const cPontaR = warehouse.consumoPonta * params.tarifaPonta * imp;
  const cFPontaR = warehouse.consumoFPonta * params.tarifaFPonta * imp;
  const demandaR = warehouse.demandaMax * params.tarifaDemanda;
  const perdasPercent = 0.047;
  const perdasR = perdasPercent * (cPontaR + cFPontaR);
  const totalMD = 58860;
  const proporcao = consumoTotal / totalMD;
  const cipR = params.cip * proporcao;
  const totalPagar = cPontaR + cFPontaR + demandaR + perdasR + cipR;
  const pctCondominio = (consumoTotal / totalGDE) * 100;

  const faturaItems = [
    { item: "Consumo Ponta", qtd: `${formatNumber(warehouse.consumoPonta)} kWh`, tarifa: `R$ ${params.tarifaPonta.toFixed(2)}/kWh`, impostos: `${(calcImpostos(params) * 100).toFixed(2)}%`, valor: cPontaR },
    { item: "Consumo Fora Ponta", qtd: `${formatNumber(warehouse.consumoFPonta)} kWh`, tarifa: `R$ ${params.tarifaFPonta.toFixed(2)}/kWh`, impostos: `${(calcImpostos(params) * 100).toFixed(2)}%`, valor: cFPontaR },
    { item: "Parcela Demanda", qtd: `${warehouse.demandaMax} kW`, tarifa: `R$ ${params.tarifaDemanda.toFixed(2)}/kW`, impostos: "—", valor: demandaR },
    { item: "Rateio Perdas Técnicas", qtd: `${(perdasPercent * 100).toFixed(1)}%`, tarifa: "—", impostos: "—", valor: perdasR },
    { item: "Rateio CIP", qtd: "proporcional", tarifa: "—", impostos: "—", valor: cipR },
    { item: "Rateio Bandeira", qtd: "—", tarifa: "—", impostos: "—", valor: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Button variant="ghost" className="w-fit gap-2" onClick={() => navigate("/dashboard/energy-management")}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{warehouse.name} — {warehouse.tenant}</h1>
          <Badge style={{ backgroundColor: warehouse.color, color: "#fff" }}>{warehouse.tenant}</Badge>
        </div>
        <p className="text-muted-foreground">Competência: Janeiro/2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Consumo Total (kWh)</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">{formatNumber(consumoTotal)}</span>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total a Pagar (R$)</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold">R$ {formatCurrency(totalPagar)}</span>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[hsl(var(--chart-2))]">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Demanda Máxima (kW)</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <Gauge className="h-8 w-8 text-[hsl(var(--chart-2))]" />
            <span className="text-2xl font-bold">{warehouse.demandaMax}</span>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[hsl(var(--chart-3))]">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">% do Consumo do Condomínio</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <PieChart className="h-8 w-8 text-[hsl(var(--chart-3))]" />
            <span className="text-2xl font-bold">{pctCondominio.toFixed(1)}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Financial Breakdown */}
      <Card>
        <CardHeader><CardTitle>Composição da Fatura</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Tarifa</TableHead>
                <TableHead className="text-right">Impostos</TableHead>
                <TableHead className="text-right">Valor (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faturaItems.map((fi) => (
                <TableRow key={fi.item}>
                  <TableCell className="font-medium">{fi.item}</TableCell>
                  <TableCell className="text-right">{fi.qtd}</TableCell>
                  <TableCell className="text-right">{fi.tarifa}</TableCell>
                  <TableCell className="text-right">{fi.impostos}</TableCell>
                  <TableCell className="text-right">{formatCurrency(fi.valor)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell colSpan={3} />
                <TableCell className="text-right font-bold">R$ {formatCurrency(totalPagar)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Evolução de Consumo — Últimos 6 Meses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyConsumptionMock}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => `${formatNumber(v)} kWh`} />
                <Legend />
                <Bar dataKey="ponta" name="Ponta" fill="hsl(var(--chart-1))" />
                <Bar dataKey="fPonta" name="Fora Ponta" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Evolução do Valor a Pagar — Últimos 6 Meses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyValueMock}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => `R$ ${formatCurrency(v)}`} />
                <Line type="monotone" dataKey="valor" name="Valor (R$)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Meter Info */}
      <Card>
        <CardHeader><CardTitle>Medidor Setorial — MD4040</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">ID do Medidor</span><span className="font-semibold">{warehouse.medidorId}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Status</span><Badge className="bg-green-500/10 text-green-600 border-green-500/20">🟢 Online</Badge></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Última Leitura</span><span className="font-semibold">11/02/2026 08:15</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Fator de Potência</span><span className="font-semibold">0,96</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Demanda Máx. Registrada</span><span className="font-semibold">{warehouse.demandaMax} kW</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyManagementWarehouse;
