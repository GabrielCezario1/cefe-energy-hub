import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DollarSign, Clock, PiggyBank, Pencil } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";

const initialMonthlyData = [
  { month: "Jan", economy: 15420, generation: 18500 },
  { month: "Fev", economy: 14850, generation: 17800 },
  { month: "Mar", economy: 16200, generation: 19400 },
  { month: "Abr", economy: 15900, generation: 19000 },
  { month: "Mai", economy: 14200, generation: 17000 },
  { month: "Jun", economy: 13800, generation: 16500 },
];

const Financial = () => {
  const { toast } = useToast();

  // Dados de investimento
  const [investimento, setInvestimento] = useState({
    valorTotal: 500000,
    dataInvestimento: "2023-01-01",
    descricao: "",
  });

  // Dados de tarifa
  const [tarifa, setTarifa] = useState({
    valorKwh: 0.85,
    dataVigenciaInicio: "2024-01-01",
    observacao: "",
  });

  // Controle de modais
  const [modalInvestimento, setModalInvestimento] = useState(false);
  const [modalTarifa, setModalTarifa] = useState(false);

  // Drafts dos formulários
  const [draftInvestimento, setDraftInvestimento] = useState(investimento);
  const [draftTarifa, setDraftTarifa] = useState(tarifa);

  const monthlyData = initialMonthlyData;

  const avgMonthlyEconomy = useMemo(() => {
    const total = monthlyData.reduce((sum, d) => sum + d.economy, 0);
    return total / monthlyData.length;
  }, [monthlyData]);

  const paybackTotalMeses = useMemo(() => {
    if (avgMonthlyEconomy <= 0) return 0;
    return Math.ceil(investimento.valorTotal / avgMonthlyEconomy);
  }, [investimento.valorTotal, avgMonthlyEconomy]);

  const paybackData = useMemo(() => {
    const pontos: { month: number; investment: number; recovered: number }[] = [];
    const intervalo = 12;
    const totalPontos = Math.ceil(paybackTotalMeses / intervalo) + 1;
    for (let i = 0; i <= totalPontos; i++) {
      const mes = i * intervalo;
      pontos.push({
        month: mes,
        investment: investimento.valorTotal,
        recovered: Math.round(mes * avgMonthlyEconomy),
      });
    }
    return pontos;
  }, [investimento.valorTotal, avgMonthlyEconomy, paybackTotalMeses]);

  const openModalInvestimento = () => {
    setDraftInvestimento(investimento);
    setModalInvestimento(true);
  };

  const openModalTarifa = () => {
    setDraftTarifa(tarifa);
    setModalTarifa(true);
  };

  const salvarInvestimento = () => {
    setInvestimento(draftInvestimento);
    setModalInvestimento(false);
    toast({ title: "Investimento atualizado", description: "Os dados foram salvos com sucesso." });
  };

  const salvarTarifa = () => {
    setTarifa(draftTarifa);
    setModalTarifa(false);
    toast({ title: "Tarifa atualizada", description: "Os dados foram salvos com sucesso." });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestão Financeira & Econômica</h1>
        <p className="text-muted-foreground">Análise de retorno e economia do investimento</p>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Acumulada</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 1.847.250</div>
            <p className="text-xs text-muted-foreground mt-1">Desde a instalação</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia no Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 16.200</div>
            <p className="text-xs text-muted-foreground mt-1">+9,1% vs. mês anterior</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payback Restante</CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paybackTotalMeses} meses</div>
            <p className="text-xs text-muted-foreground mt-1">Estimativa baseada na média mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rentabilidade Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="economy" fill="hsl(var(--primary))" name="Economia (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payback Projection */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Payback</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={paybackData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" label={{ value: 'Meses', position: 'insideBottom', offset: -5 }} />
              <YAxis className="text-xs" label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="investment" stroke="hsl(var(--destructive))" strokeWidth={2} name="Investimento" />
              <Line type="monotone" dataKey="recovered" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Recuperado" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Investment Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dados do Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Valor do Investimento Inicial</p>
              <p className="text-2xl font-bold">
                {investimento.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <Button variant="outline" size="sm" onClick={openModalInvestimento}>
                <Pencil className="h-3 w-3 mr-1" /> Editar
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tarifa de Energia</p>
              <p className="text-2xl font-bold">
                R$ {tarifa.valorKwh.toFixed(2).replace(".", ",")}/kWh
              </p>
              <Button variant="outline" size="sm" onClick={openModalTarifa}>
                <Pencil className="h-3 w-3 mr-1" /> Editar
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">ROI Anual</p>
              <p className="text-2xl font-bold text-chart-1">38,2%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog — Editar Investimento */}
      <Dialog open={modalInvestimento} onOpenChange={setModalInvestimento}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Investimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Valor Total (R$)</Label>
              <Input
                type="number"
                value={draftInvestimento.valorTotal}
                onChange={(e) => setDraftInvestimento({ ...draftInvestimento, valorTotal: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label>Data do Investimento</Label>
              <Input
                type="date"
                value={draftInvestimento.dataInvestimento}
                onChange={(e) => setDraftInvestimento({ ...draftInvestimento, dataInvestimento: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Descrição (opcional)</Label>
              <Input
                type="text"
                placeholder="Ex: Sistema solar 120kWp"
                value={draftInvestimento.descricao}
                onChange={(e) => setDraftInvestimento({ ...draftInvestimento, descricao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalInvestimento(false)}>Cancelar</Button>
            <Button onClick={salvarInvestimento}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog — Editar Tarifa */}
      <Dialog open={modalTarifa} onOpenChange={setModalTarifa}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Tarifa de Energia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Valor (R$/kWh)</Label>
              <Input
                type="number"
                step="0.01"
                value={draftTarifa.valorKwh}
                onChange={(e) => setDraftTarifa({ ...draftTarifa, valorKwh: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label>Data de Início da Vigência</Label>
              <Input
                type="date"
                value={draftTarifa.dataVigenciaInicio}
                onChange={(e) => setDraftTarifa({ ...draftTarifa, dataVigenciaInicio: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Observação (opcional)</Label>
              <Input
                type="text"
                placeholder="Ex: Reajuste ANEEL 2025"
                value={draftTarifa.observacao}
                onChange={(e) => setDraftTarifa({ ...draftTarifa, observacao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalTarifa(false)}>Cancelar</Button>
            <Button onClick={salvarTarifa}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Financial;
