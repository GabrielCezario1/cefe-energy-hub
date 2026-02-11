import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUnit } from "@/contexts/UnitContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Receipt, TrendingUp, AlertTriangle, Gauge, Settings, Building2, Download,
} from "lucide-react";
import {
  warehouses, gde4000, totalMD4040, defaultFaturaParams, bandeiraValues,
  calcImpostos, calcWarehouseTotal, formatCurrency, formatNumber,
  type FaturaParams,
} from "@/lib/energy-management-data";

const ALLOWED_UNITS = ["serra", "manilha-niteroi"];

const EnergyManagement = () => {
  const { selectedUnit } = useUnit();
  const navigate = useNavigate();
  const [params, setParams] = useState<FaturaParams>(defaultFaturaParams);
  const [configOpen, setConfigOpen] = useState(false);
  const [tempParams, setTempParams] = useState<FaturaParams>(defaultFaturaParams);
  const [demandaFaturavel, setDemandaFaturavel] = useState(defaultFaturaParams.demandaContratada);

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
          Selecione uma dessas unidades na barra superior para acessar.
        </p>
      </div>
    );
  }

  const totalGDE = gde4000.consumoPonta + gde4000.consumoFPonta;
  const totalMD = totalMD4040.consumoPonta + totalMD4040.consumoFPonta;
  const perdas = totalGDE - totalMD;
  const perdasPercent = (perdas / totalGDE) * 100;

  const impostos = calcImpostos(params);
  const warehouseTotals = warehouses.map((w) => ({
    ...w,
    total: calcWarehouseTotal(w, params),
    consumoTotal: w.consumoPonta + w.consumoFPonta,
  }));
  const somaRateio = warehouseTotals.reduce((s, w) => s + w.total, 0);
  const resultadoRateio = somaRateio - params.valorRealFatura;

  const demandaStatus = gde4000.demandaMedida > params.demandaContratada;
  const fpStatus = gde4000.fatorPotencia >= 0.92;

  function openConfig() {
    setTempParams({ ...params });
    setConfigOpen(true);
  }

  function saveConfig() {
    setParams({ ...tempParams });
    setConfigOpen(false);
  }

  function handleBandeiraChange(val: string) {
    const add = bandeiraValues[val] || 0;
    setTempParams((p) => ({ ...p, bandeira: val as FaturaParams["bandeira"], adicionalBandeira: add }));
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Gerenciamento de Energia</h1>
          <p className="text-muted-foreground">
            Unidade {selectedUnit.name} — Competência: Janeiro/2026
          </p>
        </div>
        <Button onClick={openConfig} variant="outline" className="gap-2">
          <Settings className="h-4 w-4" /> Configurar Parâmetros da Fatura
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Valor Total da Fatura (Simulado)</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">R$ {formatCurrency(somaRateio)}</span>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${resultadoRateio >= 0 ? "border-l-green-500" : "border-l-destructive"}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Resultado do Rateio</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <TrendingUp className={`h-8 w-8 ${resultadoRateio >= 0 ? "text-green-500" : "text-destructive"}`} />
            <span className="text-2xl font-bold">{resultadoRateio >= 0 ? "+" : ""}R$ {formatCurrency(resultadoRateio)}</span>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${perdasPercent > 8 ? "border-l-yellow-500" : "border-l-[hsl(var(--chart-3))]"}`}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Perda Técnica Atual</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <AlertTriangle className={`h-8 w-8 ${perdasPercent > 8 ? "text-yellow-500" : "text-muted-foreground"}`} />
            <span className="text-2xl font-bold">{perdasPercent.toFixed(1)}%</span>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[hsl(var(--chart-2))]">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Demanda Medida vs Contratada</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <Gauge className="h-8 w-8 text-[hsl(var(--chart-2))]" />
            <span className="text-2xl font-bold">{gde4000.demandaMedida} / {params.demandaContratada} kW</span>
          </CardContent>
        </Card>
      </div>

      {/* GDE4000 */}
      <Card>
        <CardHeader><CardTitle>Medidor Principal — GDE4000 (Entrada do Condomínio)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Consumo Ativo Ponta (kWh)</span><span className="font-semibold">{formatNumber(gde4000.consumoPonta)}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Consumo Ativo Fora Ponta (kWh)</span><span className="font-semibold">{formatNumber(gde4000.consumoFPonta)}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Demanda Medida Máxima (kW)</span><span className="font-semibold">{gde4000.demandaMedida}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Demanda Contratada (kW)</span><span className="font-semibold">{params.demandaContratada}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Status Demanda</span>{demandaStatus ? <Badge variant="destructive">🔴 ULTRAPASSAGEM</Badge> : <Badge className="bg-green-500/10 text-green-600 border-green-500/20">✅ Dentro do limite</Badge>}</div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Energia Reativa (kVArh)</span><span className="font-semibold">{formatNumber(gde4000.energiaReativa)}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Fator de Potência</span><span className="font-semibold">{gde4000.fatorPotencia}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Status FP</span>{fpStatus ? <Badge className="bg-green-500/10 text-green-600 border-green-500/20">✅ Adequado</Badge> : <Badge variant="destructive">🔴 Multa</Badge>}</div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Geração Solar Injetada (kWh)</span><span className="font-semibold">{formatNumber(gde4000.geracaoSolar)}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Crédito Solar Estimado (R$)</span><span className="font-semibold">R$ {formatCurrency(gde4000.creditoSolar)}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Warehouse Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Galpões do Condomínio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {warehouseTotals.map((w) => {
            const pct = (w.consumoTotal / totalGDE) * 100;
            return (
              <Card
                key={w.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                style={{ borderLeft: `4px solid ${w.color}` }}
                onClick={() => navigate(`/dashboard/energy-management/warehouse/${w.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{w.name}</CardTitle>
                    <Badge variant="outline" style={{ borderColor: w.color, color: w.color }}>{w.tenant}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Consumo</span>
                    <span className="font-semibold">{formatNumber(w.consumoTotal)} kWh</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor est.</span>
                    <span className="font-semibold">R$ {formatCurrency(w.total)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>% do total</span><span>{pct.toFixed(1)}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Rateio Table */}
      <Card>
        <CardHeader><CardTitle>Tabela de Rateio — Resumo Financeiro</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Galpão</TableHead>
                  <TableHead>Inquilino</TableHead>
                  <TableHead className="text-right">C. Ponta (kWh)</TableHead>
                  <TableHead className="text-right">C. Ponta (R$)</TableHead>
                  <TableHead className="text-right">C. F.Ponta (kWh)</TableHead>
                  <TableHead className="text-right">C. F.Ponta (R$)</TableHead>
                  <TableHead className="text-right">Demanda (R$)</TableHead>
                  <TableHead className="text-right">Perdas (R$)</TableHead>
                  <TableHead className="text-right">CIP (R$)</TableHead>
                  <TableHead className="text-right font-bold">Total (R$)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseTotals.map((w) => {
                  const imp = 1 + impostos;
                  const cPontaR = w.consumoPonta * params.tarifaPonta * imp;
                  const cFPontaR = w.consumoFPonta * params.tarifaFPonta * imp;
                  const demandaR = w.demandaMax * params.tarifaDemanda;
                  const perdasR = (perdas / totalGDE) * (cPontaR + cFPontaR);
                  const proporcao = w.consumoTotal / totalMD;
                  const cipR = params.cip * proporcao;
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.name}</TableCell>
                      <TableCell>{w.tenant}</TableCell>
                      <TableCell className="text-right">{formatNumber(w.consumoPonta)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cPontaR)}</TableCell>
                      <TableCell className="text-right">{formatNumber(w.consumoFPonta)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cFPontaR)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(demandaR)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(perdasR)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cipR)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(w.total)}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>TOTAL GERAL</TableCell>
                  <TableCell className="text-right">{formatNumber(totalMD4040.consumoPonta)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(warehouseTotals.reduce((s, w) => s + w.consumoPonta * params.tarifaPonta * (1 + impostos), 0))}</TableCell>
                  <TableCell className="text-right">{formatNumber(totalMD4040.consumoFPonta)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(warehouseTotals.reduce((s, w) => s + w.consumoFPonta * params.tarifaFPonta * (1 + impostos), 0))}</TableCell>
                  <TableCell className="text-right">{formatCurrency(warehouseTotals.reduce((s, w) => s + w.demandaMax * params.tarifaDemanda, 0))}</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">{formatCurrency(params.cip)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(somaRateio)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Perdas info */}
          <div className={`mt-4 p-3 rounded-md text-sm ${perdasPercent > 8 ? "bg-yellow-500/10 text-yellow-700" : "bg-muted"}`}>
            <strong>Cálculo de Perdas:</strong> GDE4000 ({formatNumber(totalGDE)} kWh) − Soma MD4040 ({formatNumber(totalMD)} kWh) = {formatNumber(perdas)} kWh ({perdasPercent.toFixed(1)}%)
            {perdasPercent > 8 && <span className="ml-2 font-bold">⚠️ Perda acima de 8%!</span>}
          </div>

          <div className="mt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" disabled className="gap-2">
                  <Download className="h-4 w-4" /> Exportar PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>Em breve</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {/* Demand Simulation */}
      <Card>
        <CardHeader><CardTitle>Simulação de Demanda (Break-Even)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ajuste a demanda faturável para garantir que o rateio cubra o custo fixo da demanda contratada, mesmo em meses de baixo consumo.
          </p>
          <div className="flex items-center gap-4">
            <Label>Demanda Faturável (kW)</Label>
            <Input
              type="number"
              value={demandaFaturavel}
              onChange={(e) => setDemandaFaturavel(Number(e.target.value))}
              className="w-32"
            />
          </div>
          {gde4000.demandaMedida < demandaFaturavel && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <strong>Sugestão:</strong> A demanda medida ({gde4000.demandaMedida} kW) está abaixo da faturável ({demandaFaturavel} kW).
              O custo fixo de R$ {formatCurrency(demandaFaturavel * params.tarifaDemanda)} será distribuído proporcionalmente entre os galpões.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Config Modal */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Parâmetros da Fatura</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <Label>Tarifa Ponta (R$/kWh)</Label>
              <Input type="number" step="0.01" value={tempParams.tarifaPonta} onChange={(e) => setTempParams((p) => ({ ...p, tarifaPonta: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>Tarifa F. Ponta (R$/kWh)</Label>
              <Input type="number" step="0.01" value={tempParams.tarifaFPonta} onChange={(e) => setTempParams((p) => ({ ...p, tarifaFPonta: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>Tarifa Demanda (R$/kW)</Label>
              <Input type="number" step="0.01" value={tempParams.tarifaDemanda} onChange={(e) => setTempParams((p) => ({ ...p, tarifaDemanda: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>Demanda Contratada (kW)</Label>
              <Input type="number" value={tempParams.demandaContratada} onChange={(e) => setTempParams((p) => ({ ...p, demandaContratada: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>ICMS (%)</Label>
              <Input type="number" step="0.01" value={tempParams.icms} onChange={(e) => setTempParams((p) => ({ ...p, icms: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>PIS (%)</Label>
              <Input type="number" step="0.01" value={tempParams.pis} onChange={(e) => setTempParams((p) => ({ ...p, pis: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>COFINS (%)</Label>
              <Input type="number" step="0.01" value={tempParams.cofins} onChange={(e) => setTempParams((p) => ({ ...p, cofins: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>Bandeira Tarifária</Label>
              <Select value={tempParams.bandeira} onValueChange={handleBandeiraChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verde">Verde</SelectItem>
                  <SelectItem value="Amarela">Amarela</SelectItem>
                  <SelectItem value="Vermelha 1">Vermelha 1</SelectItem>
                  <SelectItem value="Vermelha 2">Vermelha 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Adicional Bandeira (R$/kWh)</Label>
              <Input type="number" step="0.001" value={tempParams.adicionalBandeira} disabled={tempParams.bandeira === "Verde"} onChange={(e) => setTempParams((p) => ({ ...p, adicionalBandeira: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1">
              <Label>CIP (R$)</Label>
              <Input type="number" step="0.01" value={tempParams.cip} onChange={(e) => setTempParams((p) => ({ ...p, cip: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Valor Real da Fatura (R$)</Label>
              <Input type="number" step="0.01" value={tempParams.valorRealFatura} onChange={(e) => setTempParams((p) => ({ ...p, valorRealFatura: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>Cancelar</Button>
            <Button onClick={saveConfig}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnergyManagement;
