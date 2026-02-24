# Relatório — Frontend do Módulo de Telemetria & Diagnóstico Proativo

> **Projeto:** CEFE Energy Hub
>
> **Frontend:** Angular 21 + TypeScript 5.x + Tailwind CSS 3.x
>
> **Padrões de Desenvolvimento:** `regras-projeto-angular.md`
>
> **Backend (referência):** `RELATORIO_Backend_Telemetria.md`
>
> **Data:** Fevereiro/2026
>
> **⚠️ Pré-requisito:** Os módulos de **Gerenciamento de Energia** e **Monitoramento & Geração** são implementados antes deste módulo. Artefatos como `environment.ts`, `app.config.ts`, `TokenService`, `AuthService`, `AuthGuard`, `authInterceptor` e `UsinaService` já existem. Este relatório indica quais itens devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕).

---

## 1. Visão Geral do Módulo

O módulo de **Telemetria & Diagnóstico Proativo** apresenta os dados elétricos detalhados e o log de falhas da usina selecionada. O arquivo `Telemetry.tsx` (React/hardcoded) serve como protótipo visual — o objetivo é recriar essa tela em Angular conectada ao backend real, com dados dinâmicos por usina.

| Tela | Rota | Descrição |
| --- | --- | --- |
| **Telemetria & Diagnóstico Proativo** | `/dashboard/telemetria` | KPIs elétricos em tempo real, status do sistema, leituras das strings FV e log de alertas e falhas |

### Restrições de Acesso

- O módulo está disponível para todas as unidades cadastradas.
- O usuário deve estar autenticado (JWT válido verificado via `TokenService.isTokenValido()`).
- O usuário deve ter uma unidade selecionada via `UsinaService` (`usinaSelecionada$`).
- Se nenhuma unidade está selecionada, exibir mensagem: "Selecione uma unidade para visualizar os dados".
- Rotas protegidas via `AuthGuard`. Requisições autenticadas via `authInterceptor`.

---

## 2. Stack Frontend

| Tecnologia | Versão | Uso |
| --- | --- | --- |
| Angular | 21 | Framework principal (componentes standalone) |
| TypeScript | 5.x | Linguagem |
| Tailwind CSS | 3.x | Estilização (utility-first) |
| RxJS | 7.x | Programação reativa (`BehaviorSubject`, `switchMap`, `forkJoin`) |

### Padrões Angular Adotados

- **Componentes standalone** (`standalone: true`) — sem NgModules.
- **Injeção de dependência** via `inject()` (não usar `constructor`).
- **Services** com `@Injectable({ providedIn: 'root' })`.
- **Estado reativo** com `BehaviorSubject` + `asObservable()`.
- **Reactive Forms** para formulários (centralizados em `formularios/`).
- **Interfaces** com prefixo `I` (ex: `ITelemetriaTempoReal`).
- **Request classes** com sufixo `Request` e propriedades `PascalCase`.
- **Response interfaces** com propriedades `camelCase`.
- Referência completa: `regras-projeto-angular.md`.

---

## 3. Funcionalidades Visuais da Tela

### 3.1 — KPIs em Tempo Real (4 cards)

| KPI | Dado Exibido | Badge Visual |
| --- | --- | --- |
| **Tensão da Rede L1-L2** | `tensaoL1L2V` em V | Normal (verde, 370–400V), Alerta (amarelo), Crítico (vermelho) |
| **Frequência** | `frequenciaHz` em Hz | Normal (verde, 59,5–60,5Hz), Alerta (amarelo) |
| **Irradiação** | `irradiacaoWm2` em W/m² | Ótimo (verde, ≥600), Moderado (amarelo, 300–600), Baixo (cinza, <300) |
| **Temperatura Cabine** | `temperaturaCabineC` em °C | Normal (verde, <60°C), Alto (amarelo, 60–70°C), Crítico (vermelho, >70°C) |

> **Fonte:** `GET api/telemetria/tempo-real?usinaId={usinaId}`

#### Exemplo de Dados (hardcoded atual no protótipo)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Tensão da Rede | 380,5 V — Badge "Normal" | Hardcoded |
| Frequência | 59,98 Hz — Badge "Normal" | Hardcoded |
| Irradiação | 847 W/m² — Badge "Ótimo" | Hardcoded |
| Temp. Inversor | 68°C — Badge "Alto" | Hardcoded |

### 3.2 — Status do Sistema

| Indicador | Dado | Visual |
| --- | --- | --- |
| **Falta de Energia** | `faltaDeEnergia: boolean` | `false` → badge verde "Sem Falha"; `true` → badge vermelho "Falta de Energia" |
| **Disjuntor** | `disjuntorFechado: boolean` | `true` → badge verde "Fechado"; `false` → badge amarelo "Aberto" |
| **AMF** | `amfAtivo: boolean` | `true` → badge vermelho "Ativo"; `false` → badge cinza "Inativo" |
| **Tensão Bateria** | `tensaoBateriaV: number` | Valor em V |
| **Modo Peak Shaving** | `modoPeakShaving: boolean` | `true` → badge azul "Ativo"; `false` → badge cinza "Inativo" |

> **Fonte:** mesmo endpoint `GET api/telemetria/tempo-real?usinaId={usinaId}`

### 3.3 — Leituras das Strings FV (tabela)

| Coluna | Dado | Observação |
| --- | --- | --- |
| String | `numeroString` | 1, 2, 3, 4 |
| Tensão DC (V) | `tensaoDcV` | |
| Potência DC (kW) | `potenciaDcKw` | |
| Status | — | Badge "Gerando" se `potenciaDcKw > 0`, "Sem Geração" se `= 0` |

> **Fonte:** `GET api/telemetria/strings-fv?usinaId={usinaId}`

### 3.4 — Log de Alertas e Falhas (tabela paginada)

| Coluna | Dado | Estilização Tailwind |
| --- | --- | --- |
| Timestamp | `dataOcorrencia` formatado (dd/MM/yyyy HH:mm) | — |
| Evento | `titulo` | — |
| Equipamento | `equipamento` | — |
| Duração | `duracaoMinutos` formatado (ex: "2 min") ou "Ativo" se `null` | — |
| Status | `status` + `severidade` | Alto Ativo: `bg-red-500 text-white`; Médio: `bg-yellow-500 text-white`; Info: `bg-gray-400 text-white`; Resolvido: `border border-gray-300 text-gray-600` |

> **Fonte:** `GET api/telemetria/log-alertas?usinaId={usinaId}&pagina=1&tamanhoPagina=50`

#### Exemplo de Dados (hardcoded atual no protótipo)

| Linha | Evento | Equipamento | Status |
| --- | --- | --- | --- |
| 1 | Alta Temperatura | Inversor 1 | Ativo — Badge Crítico |
| 2 | Falha de Comunicação | String 3 | Resolvido (5 min) |
| 3 | Grid Down | Sistema | Resolvido (2 min) |

---

## 4. Estrutura de Pastas Angular

> Conforme padrões em `regras-projeto-angular.md`.
>
> **⚠️ Itens já existentes (criados em módulos anteriores):**
> - `guards/auth.guard.ts` — ✅ já existe (GE)
> - `interceptors/auth.interceptor.ts` — ✅ já existe (GE)
> - `core/token.service.ts` e `core/auth.service.ts` — ✅ já existem (GE)
> - `services/usina.service.ts` — ✅ já existe (GE)
> - `environments/environment.ts` — ✅ já existe (GE)
> - `app.config.ts` — ✅ já configurado (GE) — 🔄 adicionar rota `/dashboard/telemetria`

```
src/
└── app/
    ├── features/
    │   └── telemetria/                                       🆕
    │       ├── telemetria.component.ts                       🆕
    │       ├── telemetria.component.html                     🆕
    │       ├── components/
    │       │   ├── kpis-telemetria/
    │       │   │   ├── kpis-telemetria.component.ts          🆕
    │       │   │   └── kpis-telemetria.component.html        🆕
    │       │   ├── status-sistema/
    │       │   │   ├── status-sistema.component.ts           🆕
    │       │   │   └── status-sistema.component.html         🆕
    │       │   ├── strings-fv/
    │       │   │   ├── strings-fv.component.ts               🆕
    │       │   │   └── strings-fv.component.html             🆕
    │       │   └── log-alertas-telemetria/
    │       │       ├── log-alertas-telemetria.component.ts   🆕
    │       │       └── log-alertas-telemetria.component.html 🆕
    │       └── formularios/
    │           └── filtro-alertas.form.ts                    🆕
    ├── services/
    │   └── telemetria.service.ts                             🆕
    └── models/
        └── telemetria/
            ├── telemetria-tempo-real.model.ts                🆕
            ├── telemetria-alerta.model.ts                    🆕
            └── telemetria-string-fv.model.ts                 🆕
```

---

## 5. Service Angular

### `TelemetriaService`

> Arquivo: `services/telemetria.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class TelemetriaService {
  private readonly http = inject(HttpClient);
  private readonly env = environment.apiUrl;

  obterTempoReal(request: TelemetriaTempoRealRequest): Observable<ITelemetriaTempoReal> {
    return this.http.get<ITelemetriaTempoReal>(`${this.env}/telemetria/tempo-real`, {
      params: { usinaId: request.UsinaId }
    });
  }

  listarAlertas(request: TelemetriaLogAlertasRequest): Observable<IPaginacao<ITelemetriaAlerta>> {
    return this.http.get<IPaginacao<ITelemetriaAlerta>>(`${this.env}/telemetria/log-alertas`, {
      params: { ...request }
    });
  }

  obterStringsFv(request: TelemetriaStringsFvRequest): Observable<ITelemetriaStringsFv> {
    return this.http.get<ITelemetriaStringsFv>(`${this.env}/telemetria/strings-fv`, {
      params: { usinaId: request.UsinaId }
    });
  }
}
```

---

## 6. Models (Interfaces e Request Classes)

### Interfaces (Response)

**`ITelemetriaTempoReal`** — `models/telemetria/telemetria-tempo-real.model.ts`

```typescript
export interface ITelemetriaTempoReal {
  frequenciaHz: number;
  tensaoL1L2V: number;
  tensaoL2L3V: number;
  tensaoL3L1V: number;
  fatorPotencia: number;
  potenciaReativaKvar: number;
  potenciaAparenteKva: number;
  tensaoBateriaV: number;
  faltaDeEnergia: boolean;
  disjuntorFechado: boolean;
  amfAtivo: boolean;
  modoPeakShaving: boolean;
  irradiacaoWm2: number;
  temperaturaAmbienteC: number;
  temperaturaCabineC: number;
  dataLeitura: string;
}
```

**`ITelemetriaAlerta`** — `models/telemetria/telemetria-alerta.model.ts`

```typescript
export interface ITelemetriaAlerta {
  id: number;
  titulo: string;
  descricao: string;
  severidade: 'Alto' | 'Medio' | 'Info';
  equipamento: string;
  status: 'Ativo' | 'Resolvido';
  visto: boolean;
  dataOcorrencia: string;
  dataResolucao: string | null;
  duracaoMinutos: number | null;
}
```

**`IStringFVLeitura`** e **`ITelemetriaStringsFv`** — `models/telemetria/telemetria-string-fv.model.ts`

```typescript
export interface IStringFVLeitura {
  numeroString: number;
  tensaoDcV: number;
  potenciaDcKw: number;
}

export interface ITelemetriaStringsFv {
  strings: IStringFVLeitura[];
  dataLeitura: string;
}
```

### Request Classes

```typescript
export class TelemetriaTempoRealRequest {
  UsinaId!: number;
}

export class TelemetriaLogAlertasRequest {
  UsinaId!: number;
  Pagina: number = 1;
  TamanhoPagina: number = 50;
  Severidade?: string;
  ApenasAtivos?: boolean;
  DataInicio?: string;
  DataFim?: string;
}

export class TelemetriaStringsFvRequest {
  UsinaId!: number;
}
```

---

## 7. Componentes Angular

### 7.1 — `TelemetriaComponent` (página principal)

- **Responsável por:** orquestrar todos os sub-componentes, assinar `UsinaService.usinaSelecionada$`, disparar as chamadas HTTP ao `TelemetriaService`, gerenciar estados de carregamento (`isLoading`) e erro.
- **Estratégia de carregamento:** `forkJoin([obterTempoReal(), obterStringsFv()])` para dados do topo + `listarAlertas()` separado (paginado).
- **Reage à troca de usina:** via `switchMap` sobre `usinaSelecionada$` — nova usina cancela requisições anteriores e dispara novas.
- **Rota:** `/dashboard/telemetria` — registrada em `app.config.ts`.

### 7.2 — `KpisTelemetriaComponent`

- **Input:** `@Input() dados: ITelemetriaTempoReal | null`
- **Responsável por:** renderizar 4 cards (Tensão L1-L2, Frequência, Irradiação, Temperatura Cabine).
- **Lógica de badge:** implementada via método puro ou `computed` no componente. Cada KPI tem sua própria faixa de classificação (ver seção 3.1).
- **Sem dados:** exibir skeleton/placeholder quando `dados = null`.

### 7.3 — `StatusSistemaComponent`

- **Input:** `@Input() dados: ITelemetriaTempoReal | null`
- **Responsável por:** renderizar grid de 5 indicadores operacionais: Falta de Energia, Disjuntor, AMF, Tensão Bateria, Modo Peak Shaving.
- **Visual:** cada indicador com ícone (Lucide Angular) + badge colorido conforme estado boolean ou valor numérico.

### 7.4 — `StringsFvComponent`

- **Input:** `@Input() dados: ITelemetriaStringsFv | null`
- **Responsável por:** renderizar tabela com 4 linhas (strings 1–4): Número da String, Tensão DC (V), Potência DC (kW), badge de status ("Gerando" se `potenciaDcKw > 0`, "Sem Geração" se `= 0`).
- **Visual:** strings sem geração recebem destaque visual diferenciado (texto opaco ou ícone de aviso).

### 7.5 — `LogAlertasTelemetriaComponent`

- **Input:** `@Input() alertas: ITelemetriaAlerta[]`
- **Output:** `@Output() filtroAlterado: EventEmitter<TelemetriaLogAlertasRequest>`
- **Responsável por:** renderizar tabela de log com colunas Timestamp, Evento, Equipamento, Duração, Badge de Status.
- **Formatações:**
  - `dataOcorrencia`: `dd/MM/yyyy HH:mm`
  - `duracaoMinutos`: `"2 min"` se resolvido; `"Ativo"` se `null`
- **Filtros (ReactiveForm):** Severidade (select), Data Início/Fim (date inputs), Apenas Ativos (checkbox) — via `FiltroAlertasForm`.

### 7.6 — `FiltroAlertasForm`

- **Arquivo:** `formularios/filtro-alertas.form.ts`
- **Tipo:** `FormGroup` (ReactiveForm)
- **Campos:** `severidade` (string | null), `dataInicio` (string | null), `dataFim` (string | null), `apenasAtivos` (boolean)
- **Uso:** instanciado no `LogAlertasTelemetriaComponent`, emite mudanças para o componente pai via `@Output()`.

---

## 8. Checklist de Implementação

### Service e Models
- [ ] Criar `TelemetriaService` com 3 métodos tipados
- [ ] Criar `ITelemetriaTempoReal` (16 campos)
- [ ] Criar `ITelemetriaAlerta` (10 campos)
- [ ] Criar `IStringFVLeitura` + `ITelemetriaStringsFv`
- [ ] Criar `TelemetriaTempoRealRequest`, `TelemetriaLogAlertasRequest`, `TelemetriaStringsFvRequest`

### Componentes
- [ ] Criar `TelemetriaComponent` com `forkJoin` + `switchMap` sobre `UsinaService`
- [ ] Criar `KpisTelemetriaComponent` com lógica de classificação de badges
- [ ] Criar `StatusSistemaComponent` com 5 indicadores operacionais
- [ ] Criar `StringsFvComponent` com tabela de 4 strings FV
- [ ] Criar `LogAlertasTelemetriaComponent` com filtros e formatação de duração
- [ ] Criar `FiltroAlertasForm` (ReactiveForm)

### Roteamento e Integração
- [ ] 🔄 Adicionar rota `/dashboard/telemetria` em `app.config.ts`
- [ ] 🔄 Registrar link "Telemetria" no menu lateral (`DashboardSidebar`)
- [ ] Testar troca de unidade via `UsinaService.usinaSelecionada$` — todos os dados devem atualizar
- [ ] Testar estados de loading (skeleton) em todos os componentes
- [ ] Testar estado de erro com mensagem amigável
- [ ] Testar responsividade (mobile, tablet, desktop)
