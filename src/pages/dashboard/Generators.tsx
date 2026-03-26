import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUnit } from "@/contexts/UnitContext";
import { Fuel, Clock, Zap, DollarSign, Wrench, Camera, Power, CalendarCheck, AlertTriangle } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── Mock: Consumo vs Geração Semanal ────────────────────────────────────────
const generatorData = [
  { day: "Seg", consumo: 120, geracao: 480 },
  { day: "Ter", consumo: 95, geracao: 420 },
  { day: "Qua", consumo: 150, geracao: 520 },
  { day: "Qui", consumo: 80, geracao: 350 },
  { day: "Sex", consumo: 180, geracao: 580 },
  { day: "Sáb", consumo: 60, geracao: 240 },
  { day: "Dom", consumo: 45, geracao: 180 },
];

// ─── Mock: Abastecimentos ────────────────────────────────────────────────────
const refuelingData = [
  { id: 1, date: "2024-01-15", liters: 500, horimetroInicial: 12450, horimetroFinal: 12520, cost: 2750.00 },
  { id: 2, date: "2024-01-22", liters: 450, horimetroInicial: 12520, horimetroFinal: 12585, cost: 2475.00 },
  { id: 3, date: "2024-01-29", liters: 480, horimetroInicial: 12585, horimetroFinal: 12655, cost: 2640.00 },
  { id: 4, date: "2024-02-05", liters: 520, horimetroInicial: 12655, horimetroFinal: 12730, cost: 2860.00 },
  { id: 5, date: "2024-02-12", liters: 400, horimetroInicial: 12730, horimetroFinal: 12790, cost: 2200.00 },
];

// ─── Mock: Status do Gerador ─────────────────────────────────────────────────
const generatorStatus = {
  modelo: "Cummins C350 D5",
  potenciaNominal: "350 kVA",
  status: "Standby" as "Operando" | "Standby" | "Manutenção",
  horimetroAtual: 12790,
  ultimaTrocaOleo: "2025-12-10",
  proximaTrocaOleo: "2026-03-10",
  ultimaTrocaFiltros: "2025-12-10",
  proximaTrocaFiltros: "2026-06-10",
};

// ─── Mock: Registro de Manutenções com Fotos ─────────────────────────────────
const maintenanceLog = [
  {
    id: 1,
    tipo: "Troca de Óleo + Filtros",
    data: "2025-12-10",
    responsavel: "Carlos A. Silva",
    assinatura: true,
    fotos: 3,
    observacao: "Óleo Mobil Delvac 15W40 — 18L. Filtros de óleo, combustível e ar substituídos.",
  },
  {
    id: 2,
    tipo: "Troca de Óleo",
    data: "2025-09-05",
    responsavel: "João P. Santos",
    assinatura: true,
    fotos: 2,
    observacao: "Troca preventiva. Horímetro: 11.820h.",
  },
  {
    id: 3,
    tipo: "Troca de Filtros",
    data: "2025-06-18",
    responsavel: "Carlos A. Silva",
    assinatura: true,
    fotos: 4,
    observacao: "Filtro de ar com acúmulo excessivo. Substituição antecipada.",
  },
];

// ─── Mock: Consumo Mensal de Diesel ──────────────────────────────────────────
const monthlyDieselData = [
  { mes: "Set/2025", consumoL: 1800, precoLitro: 5.89, ativacoes: 8 },
  { mes: "Out/2025", consumoL: 2100, precoLitro: 5.95, ativacoes: 12 },
  { mes: "Nov/2025", consumoL: 1650, precoLitro: 6.02, ativacoes: 6 },
  { mes: "Dez/2025", consumoL: 2350, precoLitro: 6.10, ativacoes: 14 },
  { mes: "Jan/2026", consumoL: 2500, precoLitro: 6.15, ativacoes: 16 },
  { mes: "Fev/2026", consumoL: 1950, precoLitro: 6.20, ativacoes: 10 },
  { mes: "Mar/2026", consumoL: 980, precoLitro: 6.25, ativacoes: 5 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusColor = (s: string) => {
  if (s === "Operando") return "default" as const;
  if (s === "Standby") return "secondary" as const;
  return "outline" as const;
};

const diasRestantes = (dataFutura: string) => {
  const diff = new Date(dataFutura).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const Generators = () => {
  const { selectedUnit } = useUnit();

  const totalConsumption = 2350;
  const operatingHours = 340;
  const efficiency = 3.8;
  const averageCost = 1.45;

  const diasOleo = diasRestantes(generatorStatus.proximaTrocaOleo);
  const diasFiltros = diasRestantes(generatorStatus.proximaTrocaFiltros);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão de Geradores</h1>
        <p className="text-muted-foreground">
          Monitoramento de consumo de diesel e eficiência - {selectedUnit?.name}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Total</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsumption.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground">Acumulado do mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Operação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operatingHours}h</div>
            <p className="text-xs text-muted-foreground">Tempo total ligado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{efficiency} kWh/L</div>
            <p className="text-xs text-muted-foreground">Geração por litro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {averageCost.toFixed(2)}/kWh</div>
            <p className="text-xs text-muted-foreground">Baseado no preço do diesel</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Status do Gerador + Manutenção ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Power className="h-5 w-5" />
              Status do Gerador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Modelo</span>
              <span className="font-semibold">{generatorStatus.modelo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Potência Nominal</span>
              <span className="font-semibold">{generatorStatus.potenciaNominal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusColor(generatorStatus.status)}>{generatorStatus.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Horímetro Atual</span>
              <span className="font-semibold">{generatorStatus.horimetroAtual.toLocaleString()}h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              Manutenção Preventiva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Troca de Óleo
                </span>
                {diasOleo <= 15 ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {diasOleo}d restantes
                  </Badge>
                ) : (
                  <Badge variant="default">{diasOleo}d restantes</Badge>
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Última: {new Date(generatorStatus.ultimaTrocaOleo).toLocaleDateString("pt-BR")}</span>
                <span>Próxima: {new Date(generatorStatus.proximaTrocaOleo).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Troca de Filtros
                </span>
                {diasFiltros <= 30 ? (
                  <Badge variant="secondary">{diasFiltros}d restantes</Badge>
                ) : (
                  <Badge variant="default">{diasFiltros}d restantes</Badge>
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Última: {new Date(generatorStatus.ultimaTrocaFiltros).toLocaleDateString("pt-BR")}</span>
                <span>Próxima: {new Date(generatorStatus.proximaTrocaFiltros).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Registro de Manutenções (Fotos + Assinatura) ───────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Registro de Manutenções
          </CardTitle>
          <CardDescription>Histórico com fotos e assinatura do responsável</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Assinatura</TableHead>
                <TableHead>Fotos</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceLog.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(m.data).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="font-medium">{m.tipo}</TableCell>
                  <TableCell>{m.responsavel}</TableCell>
                  <TableCell>
                    {m.assinatura ? (
                      <Badge variant="default">✓ Assinado</Badge>
                    ) : (
                      <Badge variant="destructive">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Camera className="h-3 w-3" /> {m.fotos} foto{m.fotos > 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">
                    {m.observacao}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Consumo Mensal de Diesel + Custo ───────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Consumo e Custo Mensal de Diesel
          </CardTitle>
          <CardDescription>Valor do diesel × consumo mensal e ativações do gerador</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Consumo (L)</TableHead>
                <TableHead className="text-right">Preço/Litro (R$)</TableHead>
                <TableHead className="text-right">Custo Total (R$)</TableHead>
                <TableHead className="text-center">Ativações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyDieselData.map((row) => {
                const custoTotal = row.consumoL * row.precoLitro;
                return (
                  <TableRow key={row.mes}>
                    <TableCell className="font-medium">{row.mes}</TableCell>
                    <TableCell className="text-right">{row.consumoL.toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      R$ {row.precoLitro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      R$ {custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{row.ativacoes}x</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Totalizador */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right">
                  {monthlyDieselData.reduce((s, r) => s + r.consumoL, 0).toLocaleString("pt-BR")} L
                </TableCell>
                <TableCell className="text-right">—</TableCell>
                <TableCell className="text-right">
                  R$ {monthlyDieselData
                    .reduce((s, r) => s + r.consumoL * r.precoLitro, 0)
                    .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-center">
                  {monthlyDieselData.reduce((s, r) => s + r.ativacoes, 0)}x
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo vs Geração</CardTitle>
          <CardDescription>
            Comparativo de consumo de combustível e energia gerada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generatorData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  className="text-xs"
                  label={{ value: 'Litros', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  className="text-xs"
                  label={{ value: 'kWh', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="consumo" 
                  name="Consumo (L)" 
                  fill="hsl(var(--destructive))" 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="geracao" 
                  name="Geração (kWh)" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Refueling Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Abastecimentos</CardTitle>
          <CardDescription>Registro de abastecimentos de combustível</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Horímetro Inicial</TableHead>
                <TableHead>Horímetro Final</TableHead>
                <TableHead className="text-right">Custo Total (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refuelingData.map((refuel) => (
                <TableRow key={refuel.id}>
                  <TableCell>{new Date(refuel.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{refuel.liters} L</TableCell>
                  <TableCell>{refuel.horimetroInicial.toLocaleString()}</TableCell>
                  <TableCell>{refuel.horimetroFinal.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {refuel.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Generators;
