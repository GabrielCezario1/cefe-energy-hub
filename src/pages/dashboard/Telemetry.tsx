import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Zap,
  ToggleRight,
  ShieldAlert,
  Battery,
  TrendingDown,
} from "lucide-react";

// ─── Mock: Telemetria Tempo Real ─────────────────────────────────────────────
const telemetriaTempoReal = {
  frequenciaHz: 59.98,
  tensaoL1L2V: 380.5,
  tensaoL2L3V: 381.2,
  tensaoL3L1V: 379.8,
  fatorPotencia: 0.97,
  potenciaReativaKvar: 45.2,
  potenciaAparenteKva: 1850.5,
  tensaoBateriaV: 48.2,
  faltaDeEnergia: false,
  disjuntorFechado: true,
  amfAtivo: false,
  modoPeakShaving: false,
  irradiacaoWm2: 847.0,
  temperaturaAmbienteC: 28.0,
  temperaturaCabineC: 68.0,
  dataLeitura: "2026-02-23T14:30:00",
};

// ─── Mock: Strings FV ────────────────────────────────────────────────────────
const stringsFv = [
  { numeroString: 1, tensaoDcV: 450.2, potenciaDcKw: 25.3 },
  { numeroString: 2, tensaoDcV: 448.7, potenciaDcKw: 24.8 },
  { numeroString: 3, tensaoDcV: 451.1, potenciaDcKw: 25.5 },
  { numeroString: 4, tensaoDcV: 0.0, potenciaDcKw: 0.0 },
];

// ─── Mock: Log de Alertas ────────────────────────────────────────────────────
const logAlertas = [
  {
    id: 1,
    titulo: "Alta Temperatura — Cabine",
    severidade: "Alto",
    equipamento: "MAINS AGC 150",
    status: "Ativo",
    dataOcorrencia: "2026-02-23T14:32:15",
    dataResolucao: null as string | null,
    duracaoMinutos: null as number | null,
  },
  {
    id: 2,
    titulo: "Falta de Energia — AMF Ativo",
    severidade: "Alto",
    equipamento: "MAINS AGC 150",
    status: "Resolvido",
    dataOcorrencia: "2026-02-23T08:05:12",
    dataResolucao: "2026-02-23T08:07:30",
    duracaoMinutos: 2,
  },
  {
    id: 3,
    titulo: "Falha de Comunicação — String 3",
    severidade: "Medio",
    equipamento: "String 3",
    status: "Resolvido",
    dataOcorrencia: "2026-02-23T06:18:42",
    dataResolucao: "2026-02-23T06:23:42",
    duracaoMinutos: 5,
  },
];

// ─── Helpers de Classificação ────────────────────────────────────────────────
const classificarTensao = (v: number) => {
  if (v < 350 || v > 420) return { label: "Crítico", variant: "destructive" as const };
  if (v < 370 || v > 400) return { label: "Alerta", variant: "secondary" as const };
  return { label: "Normal", variant: "default" as const };
};

const classificarFrequencia = (hz: number) => {
  if (hz < 59.5 || hz > 60.5) return { label: "Alerta", variant: "secondary" as const };
  return { label: "Normal", variant: "default" as const };
};

const classificarIrradiacao = (wm2: number) => {
  if (wm2 >= 600) return { label: "Ótimo", variant: "default" as const };
  if (wm2 >= 300) return { label: "Moderado", variant: "secondary" as const };
  return { label: "Baixo", variant: "outline" as const };
};

const classificarTemperatura = (c: number) => {
  if (c > 70) return { label: "Crítico", variant: "destructive" as const };
  if (c >= 60) return { label: "Alto", variant: "destructive" as const };
  return { label: "Normal", variant: "default" as const };
};

const formatarData = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const badgeSeveridade = (severidade: string, status: string) => {
  if (status === "Resolvido") return "outline" as const;
  if (severidade === "Alto") return "destructive" as const;
  if (severidade === "Medio") return "secondary" as const;
  return "outline" as const;
};

// ─── Componente ──────────────────────────────────────────────────────────────
const Telemetry = () => {
  const tensao = classificarTensao(telemetriaTempoReal.tensaoL1L2V);
  const frequencia = classificarFrequencia(telemetriaTempoReal.frequenciaHz);
  const irradiacao = classificarIrradiacao(telemetriaTempoReal.irradiacaoWm2);
  const temperatura = classificarTemperatura(telemetriaTempoReal.temperaturaCabineC);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold mb-2">Telemetria & Diagnóstico Proativo</h1>
        <p className="text-muted-foreground">Dados brutos, alarmes e ferramentas de diagnóstico</p>
      </div>

      {/* ── KPIs em Tempo Real ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tensão da Rede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{telemetriaTempoReal.tensaoL1L2V} V</div>
            <Badge variant={tensao.variant} className="mt-2">{tensao.label}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Frequência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{telemetriaTempoReal.frequenciaHz} Hz</div>
            <Badge variant={frequencia.variant} className="mt-2">{frequencia.label}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Irradiação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{telemetriaTempoReal.irradiacaoWm2} W/m²</div>
            <Badge variant={irradiacao.variant} className="mt-2">{irradiacao.label}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Temperatura Cabine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{telemetriaTempoReal.temperaturaCabineC}°C</div>
            <Badge variant={temperatura.variant} className="mt-2">{temperatura.label}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* ── Status do Sistema ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg border">
              <Zap className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Falta de Energia</span>
              <Badge variant={telemetriaTempoReal.faltaDeEnergia ? "destructive" : "default"}>
                {telemetriaTempoReal.faltaDeEnergia ? "Falta de Energia" : "Sem Falha"}
              </Badge>
            </div>

            <div className="flex flex-col items-center gap-2 p-3 rounded-lg border">
              <ToggleRight className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Disjuntor</span>
              <Badge variant={telemetriaTempoReal.disjuntorFechado ? "default" : "secondary"}>
                {telemetriaTempoReal.disjuntorFechado ? "Fechado" : "Aberto"}
              </Badge>
            </div>

            <div className="flex flex-col items-center gap-2 p-3 rounded-lg border">
              <ShieldAlert className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">AMF</span>
              <Badge variant={telemetriaTempoReal.amfAtivo ? "destructive" : "outline"}>
                {telemetriaTempoReal.amfAtivo ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div className="flex flex-col items-center gap-2 p-3 rounded-lg border">
              <Battery className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Tensão Bateria</span>
              <span className="text-lg font-bold">{telemetriaTempoReal.tensaoBateriaV} V</span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3 rounded-lg border">
              <TrendingDown className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Peak Shaving</span>
              <Badge variant={telemetriaTempoReal.modoPeakShaving ? "default" : "outline"}>
                {telemetriaTempoReal.modoPeakShaving ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Leituras das Strings FV ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Leituras das Strings Fotovoltaicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">String</th>
                  <th className="text-left py-3 px-2">Tensão DC (V)</th>
                  <th className="text-left py-3 px-2">Potência DC (kW)</th>
                  <th className="text-left py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stringsFv.map((s) => (
                  <tr key={s.numeroString} className="border-b border-border">
                    <td className="py-3 px-2 text-sm font-medium">String {s.numeroString}</td>
                    <td className="py-3 px-2 text-sm">{s.tensaoDcV.toFixed(1)}</td>
                    <td className="py-3 px-2 text-sm">{s.potenciaDcKw.toFixed(1)}</td>
                    <td className="py-3 px-2">
                      {s.potenciaDcKw > 0 ? (
                        <Badge variant="default">Gerando</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Sem Geração</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Log de Alertas e Falhas ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Log de Eventos e Falhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Severidade</label>
              <select className="w-full p-2 border border-border rounded-md bg-background text-sm">
                <option value="">Todos</option>
                <option value="Alto">Alto</option>
                <option value="Medio">Médio</option>
                <option value="Info">Info</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data Início</label>
              <input type="date" className="w-full p-2 border border-border rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data Fim</label>
              <input type="date" className="w-full p-2 border border-border rounded-md bg-background text-sm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                Apenas Ativos
              </label>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">Timestamp</th>
                  <th className="text-left py-3 px-2">Evento</th>
                  <th className="text-left py-3 px-2">Equipamento</th>
                  <th className="text-left py-3 px-2">Duração</th>
                  <th className="text-left py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {logAlertas.map((alerta) => (
                  <tr key={alerta.id} className="border-b border-border">
                    <td className="py-3 px-2 text-sm">{formatarData(alerta.dataOcorrencia)}</td>
                    <td className="py-3 px-2 text-sm">{alerta.titulo}</td>
                    <td className="py-3 px-2 text-sm">{alerta.equipamento}</td>
                    <td className="py-3 px-2 text-sm">
                      {alerta.duracaoMinutos != null ? `${alerta.duracaoMinutos} min` : "Ativo"}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={badgeSeveridade(alerta.severidade, alerta.status)}>
                        {alerta.status === "Resolvido" ? "Resolvido" : alerta.severidade === "Alto" ? "Crítico" : "Médio"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Telemetry;
