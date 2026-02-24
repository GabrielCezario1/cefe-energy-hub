# Relatório — Frontend do Módulo de Gestão Financeira

> **Projeto:** CEFE Energy Hub
>
> **Frontend:** Angular 21 + TypeScript 5.x + Tailwind CSS 3.x
>
> **Padrões de Desenvolvimento:** `regras-projeto-angular.md`
>
> **Backend (referência):** `RELATORIO_Backend_GestaoFinanceira.md`
>
> **Data:** Fevereiro/2026
>
> **⚠️ Pré-requisito:** Os módulos de **Gerenciamento de Energia** e **Monitoramento & Geração** são implementados **antes** deste módulo. Artefatos compartilhados como `environment.ts`, `app.config.ts`, `TokenService`, `AuthService`, `AuthGuard`, `authInterceptor`, `UsinaService` e `IUsina` já existirão. Este relatório indica quais itens devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕).

---

## 1. Visão Geral do Módulo

O módulo de **Gestão Financeira** exibe o retorno econômico do investimento solar da usina selecionada. A partir de dados de geração coletados automaticamente e de dados financeiros cadastrados pelo administrador (tarifa de energia e valor do investimento), o frontend exibe KPIs de retorno, gráficos de rentabilidade e projeção de payback, e formulários modais para cadastro e edição dos dados financeiros.

| Tela | Rota | Descrição |
| --- | --- | --- |
| **Gestão Financeira & Econômica** | `/dashboard/financial` | KPIs (economia acumulada, economia do mês, payback restante), gráfico de rentabilidade mensal, gráfico de projeção de payback, painel de dados do investimento com modais de cadastro de tarifa e investimento |

### Restrições de Acesso

- O módulo está disponível para **todas as unidades** com sistema solar ativo.
- O usuário deve estar autenticado (JWT válido verificado via `TokenService.isTokenValido()`).
- O usuário deve ter uma unidade selecionada via `UsinaService` (`usinaSelecionada$`).
- Se nenhuma unidade está selecionada, exibe mensagem: "Selecione uma unidade para visualizar os dados".
- Se dados financeiros não foram cadastrados (`configuracaoPendente: true`), exibe banner de aviso orientando o administrador a cadastrar tarifa e investimento.
- Rotas protegidas via `AuthGuard` (redireciona para `/login` se JWT inválido).
- Requisições HTTP autenticadas automaticamente pelo `authInterceptor` (`HttpInterceptorFn`) com `Bearer token`.
- Todas as requisições incluem `usinaId` como query parameter.

---

## 2. Stack Frontend

| Tecnologia | Versão | Uso |
| --- | --- | --- |
| Angular | 21 | Framework principal (componentes standalone) |
| TypeScript | 5.x | Linguagem |
| Tailwind CSS | 3.x | Estilização (utility-first) |
| RxJS | 7.x | Programação reativa (Observables, BehaviorSubject) |

### Padrões Angular Adotados

- **Componentes standalone** (`standalone: true`) — sem NgModules.
- **Injeção de dependência** via `inject()`.
- **Services** com `@Injectable({ providedIn: 'root' })`.
- **Estado reativo** com `BehaviorSubject` + `asObservable()`.
- **Reactive Forms** para modais de cadastro (centralizados em `formularios/`).
- **Interfaces** com prefixo `I` (ex: `IGestaoFinanceiraKpis`).
- **Request classes** com sufixo `Request` e propriedades `PascalCase`.
- **Response interfaces** com propriedades `camelCase`.
- Referência completa: `regras-projeto-angular.md`.

---

## 3. Funcionalidades Visuais da Tela

### 3.1 — KPIs Primários (3 cards)

| KPI | Dados Exibidos | Estilização Tailwind |
| --- | --- | --- |
| **Economia Acumulada (R$)** | Valor em R$ (ex: "R$ 1.847.250,00") + subtexto "Desde a instalação" | `border-l-4 border-l-primary` |
| **Economia no Mês (R$)** | Valor em R$ + comparativo: `+9,1% vs. mês anterior` | `border-l-4 border-l-chart-1` |
| **Payback Restante** | Valor em meses (ex: "8 meses") + subtexto "Estimativa baseada na média mensal" | `border-l-4 border-l-chart-2` |

> **Comportamento:** Se `configuracaoPendente: true`, os cards exibem `--` no valor e um banner de aviso no topo da página.
> **Fonte dos dados:** Endpoint `GET api/gestao-financeira/kpis?usinaId={usinaId}`.

#### Exemplo de Dados (hardcoded atual — `Financial.tsx`)

| Componente | Valor Atual | Campo API |
| --- | --- | --- |
| Economia Acumulada | R$ 1.847.250 | `economiaAcumuladaBrl` |
| Economia no Mês | R$ 16.200 | `economiaMesAtualBrl` |
| Variação mês anterior | +9,1% | `variacaoMesAnteriorPercent` |
| Payback Restante | 8 meses | `paybackRestanteMeses` |

---

### 3.2 — Gráfico: Rentabilidade Mensal (BarChart)

- **Tipo:** Bar Chart (Recharts / ng2-charts).
- **Eixo X:** Mês/Ano (ex: "Jan/25", "Fev/25").
- **Eixo Y:** Valor em R$.
- **Série:** Economia mensal (R$) — barra única por mês.
- **Cor:** `hsl(var(--primary))`.
- **Tooltip:** Exibe mês, kWh gerado e valor em R$.
- **Comportamento:** Atualiza ao selecionar outra unidade via `UsinaService`.

> **Fonte dos dados:** Endpoint `GET api/gestao-financeira/rentabilidade-mensal?usinaId={usinaId}&ano={ano}`.

#### Exemplo de Dados (hardcoded atual)

| Mês | `economiaKwh` | `economiaBrl` |
| --- | --- | --- |
| Jan | 18.150 | R$ 15.427,50 |
| Fev | 17.460 | R$ 14.841,00 |
| Mar | 19.110 | R$ 16.243,50 |
| Abr | 18.750 | R$ 15.937,50 |
| Mai | 16.800 | R$ 14.280,00 |
| Jun | 16.200 | R$ 13.770,00 |

---

### 3.3 — Gráfico: Projeção de Payback (LineChart)

- **Tipo:** Line Chart com duas linhas.
- **Eixo X:** Meses (0, 12, 24, ...).
- **Eixo Y:** Valor em R$.
- **Linha 1 — Investimento:** `stroke="hsl(var(--destructive))"`, strokeWidth 2, nome "Investimento". Linha horizontal fixa.
- **Linha 2 — Recuperado:** `stroke="hsl(var(--chart-1))"`, strokeWidth 2, nome "Recuperado". Crescente.
- **Comportamento:** Pontos gerados dinamicamente a partir de `valorInvestimento` e `mediaEconomiaMensalBrl`. Ponto de cruzamento das linhas = payback atingido.

> **Fonte dos dados:** Endpoint `GET api/gestao-financeira/projecao-payback?usinaId={usinaId}`.

#### Exemplo de Dados (hardcoded atual)

| `mes` | `investment` | `recovered` |
| --- | --- | --- |
| 0 | 500.000 | 0 |
| 12 | 500.000 | 180.000 |
| 24 | 500.000 | 360.000 |
| 36 | 500.000 | 500.000 |
| 48 | 500.000 | 640.000 |

---

### 3.4 — Painel: Dados do Investimento

| Dado | Dados Exibidos | Estilização Tailwind |
| --- | --- | --- |
| **Valor do Investimento Inicial** | R$ formatado em pt-BR + botão **✏ Editar** | `text-2xl font-bold` |
| **Tarifa de Energia** | R$/kWh formatado (ex: "R$ 0,85/kWh") + botão **✏ Editar** | `text-2xl font-bold` |
| **ROI Anual** | Percentual (ex: "38,2%") — sem botão de edição | `text-2xl font-bold text-chart-1` |

> **Fonte dos dados:** Endpoint `GET api/gestao-financeira/dados-investimento?usinaId={usinaId}`.

---

### 3.5 — Modal: Editar Investimento

- **Abertura:** Botão "✏ Editar" na linha de Valor do Investimento.
- **Campos:**
  - Valor Total (R$) — input numérico, obrigatório, `min=0`
  - Data do Investimento — input date, obrigatório
  - Descrição — input text, opcional, max 500 caracteres
- **Ações:** Cancelar (fecha sem salvar) | Salvar (POST ou PUT + toast de sucesso).
- **Toast de sucesso:** "Investimento atualizado — Os dados foram salvos com sucesso."
- **Toast de erro:** mensagem do backend via `obterMensagemErro()`.
- **Comportamento:** Abre com valores atuais pré-preenchidos (draft). Cancelar não altera o estado.

> **Endpoints:**
> - Primeiro cadastro: `POST api/gestao-financeira/investimentos`
> - Edição: `PUT api/gestao-financeira/investimentos/{id}`

---

### 3.6 — Modal: Editar Tarifa de Energia

- **Abertura:** Botão "✏ Editar" na linha de Tarifa de Energia.
- **Campos:**
  - Valor (R$/kWh) — input numérico com step 0.0001, obrigatório, `min=0`
  - Data de Início da Vigência — input date, obrigatório
  - Observação — input text, opcional, max 500 caracteres (ex: "Reajuste ANEEL 2025")
- **Ações:** Cancelar | Salvar (POST ou PUT + toast de sucesso).
- **Toast de sucesso:** "Tarifa atualizada — Os dados foram salvos com sucesso."
- **Comportamento:** Abre com tarifa vigente pré-preenchida. Ao salvar nova tarifa, o backend encerra a vigência da anterior automaticamente.

> **Endpoints:**
> - Primeiro cadastro: `POST api/gestao-financeira/tarifas`
> - Edição: `PUT api/gestao-financeira/tarifas/{id}`

---

### 3.7 — Banner: Configuração Pendente

- **Condição de exibição:** `configuracaoPendente: true` retornado pelo endpoint de KPIs.
- **Texto:** "⚠️ Dados financeiros não configurados. Cadastre o valor do investimento e a tarifa de energia para visualizar os indicadores financeiros."
- **Estilização:** `bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4`.
- **Posição:** Abaixo do cabeçalho, acima dos cards de KPI.

---

## 4. Estrutura de Pastas Angular

> Conforme padrões em `regras-projeto-angular.md`.
>
> **⚠️ Itens já existentes (criados nos módulos anteriores):**
> - `guards/auth.guard.ts` — ✅ já existe (GE)
> - `interceptors/auth.interceptor.ts` — ✅ já existe (GE)
> - `core/token.service.ts` e `core/auth.service.ts` — ✅ já existem (GE)
> - `services/usina.service.ts` — ✅ já existe (GE)
> - `models/usina.model.ts` (`IUsina`) — ✅ já existe (GE)
> - `environments/environment.ts` e `environment.prod.ts` — ✅ já existem (GE)
> - `app.config.ts` — ✅ já configurado — 🔄 adicionar rota `/dashboard/financial`

```
src/app/
├── pages/
│   └── dashboard/
│       └── financial/
│           └── financial.component.ts        🆕 page standalone (orquestra componentes)
├── components/
│   └── gestao-financeira/
│       ├── kpi-financeiro-card/
│       │   ├── kpi-financeiro-card.component.ts         🆕
│       │   └── kpi-financeiro-card.component.html
│       ├── rentabilidade-mensal-chart/
│       │   ├── rentabilidade-mensal-chart.component.ts  🆕
│       │   └── rentabilidade-mensal-chart.component.html
│       ├── projecao-payback-chart/
│       │   ├── projecao-payback-chart.component.ts      🆕
│       │   └── projecao-payback-chart.component.html
│       ├── dados-investimento-painel/
│       │   ├── dados-investimento-painel.component.ts   🆕
│       │   └── dados-investimento-painel.component.html
│       ├── modal-editar-investimento/
│       │   ├── modal-editar-investimento.component.ts   🆕
│       │   └── modal-editar-investimento.component.html
│       └── modal-editar-tarifa/
│           ├── modal-editar-tarifa.component.ts         🆕
│           └── modal-editar-tarifa.component.html
├── services/
│   ├── gestao-financeira.service.ts          🆕
│   └── usina.service.ts                      ✅ reutilizar
├── formularios/
│   ├── investimento.formulario.ts            🆕
│   └── tarifa-energia.formulario.ts          🆕
├── models/
│   ├── responses/
│   │   ├── gestao-financeira-kpis.response.ts              🆕
│   │   ├── gestao-financeira-rentabilidade.response.ts     🆕
│   │   ├── rentabilidade-mensal-item.response.ts           🆕
│   │   ├── gestao-financeira-projecao-payback.response.ts  🆕
│   │   ├── projecao-payback-ponto.response.ts              🆕
│   │   ├── gestao-financeira-dados-investimento.response.ts 🆕
│   │   ├── investimento-usina.response.ts                  🆕
│   │   └── tarifa-energia.response.ts                      🆕
│   └── requests/
│       ├── gestao-financeira-kpis.request.ts               🆕
│       ├── gestao-financeira-rentabilidade.request.ts      🆕
│       ├── gestao-financeira-projecao-payback.request.ts   🆕
│       ├── gestao-financeira-dados-investimento.request.ts 🆕
│       ├── tarifa-inserir.request.ts                       🆕
│       ├── tarifa-editar.request.ts                        🆕
│       ├── investimento-inserir.request.ts                 🆕
│       └── investimento-editar.request.ts                  🆕
├── guards/
│   └── auth.guard.ts                         ✅ reutilizar
├── interceptors/
│   └── auth.interceptor.ts                   ✅ reutilizar
├── core/
│   ├── token.service.ts                      ✅ reutilizar
│   └── auth.service.ts                       ✅ reutilizar
└── environments/
    ├── environment.ts                         ✅ reutilizar
    └── environment.prod.ts                    ✅ reutilizar
```

---

## 5. Serviços Angular

### `GestaoFinanceiraService`

```typescript
// src/app/services/gestao-financeira.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IGestaoFinanceiraKpis } from '../models/responses/gestao-financeira-kpis.response';
import { IGestaoFinanceiraRentabilidade } from '../models/responses/gestao-financeira-rentabilidade.response';
import { IGestaoFinanceiraProjecaoPayback } from '../models/responses/gestao-financeira-projecao-payback.response';
import { IGestaoFinanceiraDadosInvestimento } from '../models/responses/gestao-financeira-dados-investimento.response';
import { GestaoFinanceiraKpisRequest } from '../models/requests/gestao-financeira-kpis.request';
import { GestaoFinanceiraRentabilidadeRequest } from '../models/requests/gestao-financeira-rentabilidade.request';
import { GestaoFinanceiraProjecaoPaybackRequest } from '../models/requests/gestao-financeira-projecao-payback.request';
import { GestaoFinanceiraDadosInvestimentoRequest } from '../models/requests/gestao-financeira-dados-investimento.request';
import { TarifaInserirRequest } from '../models/requests/tarifa-inserir.request';
import { TarifaEditarRequest } from '../models/requests/tarifa-editar.request';
import { InvestimentoInserirRequest } from '../models/requests/investimento-inserir.request';
import { InvestimentoEditarRequest } from '../models/requests/investimento-editar.request';
import { ITarifaEnergia } from '../models/responses/tarifa-energia.response';
import { IInvestimentoUsina } from '../models/responses/investimento-usina.response';

@Injectable({ providedIn: 'root' })
export class GestaoFinanceiraService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + '/gestao-financeira';

  recuperarKpis(req: GestaoFinanceiraKpisRequest): Observable<IGestaoFinanceiraKpis> {
    return this.http.get<IGestaoFinanceiraKpis>(`${this.baseUrl}/kpis`, {
      params: req as any
    });
  }

  recuperarRentabilidadeMensal(req: GestaoFinanceiraRentabilidadeRequest): Observable<IGestaoFinanceiraRentabilidade> {
    return this.http.get<IGestaoFinanceiraRentabilidade>(`${this.baseUrl}/rentabilidade-mensal`, {
      params: req as any
    });
  }

  recuperarProjecaoPayback(req: GestaoFinanceiraProjecaoPaybackRequest): Observable<IGestaoFinanceiraProjecaoPayback> {
    return this.http.get<IGestaoFinanceiraProjecaoPayback>(`${this.baseUrl}/projecao-payback`, {
      params: req as any
    });
  }

  recuperarDadosInvestimento(req: GestaoFinanceiraDadosInvestimentoRequest): Observable<IGestaoFinanceiraDadosInvestimento> {
    return this.http.get<IGestaoFinanceiraDadosInvestimento>(`${this.baseUrl}/dados-investimento`, {
      params: req as any
    });
  }

  inserirTarifa(req: TarifaInserirRequest): Observable<ITarifaEnergia> {
    return this.http.post<ITarifaEnergia>(`${this.baseUrl}/tarifas`, req);
  }

  editarTarifa(id: number, req: TarifaEditarRequest): Observable<ITarifaEnergia> {
    return this.http.put<ITarifaEnergia>(`${this.baseUrl}/tarifas/${id}`, req);
  }

  inserirInvestimento(req: InvestimentoInserirRequest): Observable<IInvestimentoUsina> {
    return this.http.post<IInvestimentoUsina>(`${this.baseUrl}/investimentos`, req);
  }

  editarInvestimento(id: number, req: InvestimentoEditarRequest): Observable<IInvestimentoUsina> {
    return this.http.put<IInvestimentoUsina>(`${this.baseUrl}/investimentos/${id}`, req);
  }
}
```

---

## 6. Models (Interfaces e Classes)

### Interfaces de Response

```typescript
// src/app/models/responses/gestao-financeira-kpis.response.ts
export interface IGestaoFinanceiraKpis {
  economiaAcumuladaBrl: number;
  economiaMesAtualBrl: number;
  variacaoMesAnteriorPercent: number;
  paybackRestanteMeses: number;
  paybackTotalMeses: number;
  paybackAtingido: boolean;
  configuracaoPendente: boolean;  // true se tarifa ou investimento não cadastrados
}

// src/app/models/responses/rentabilidade-mensal-item.response.ts
export interface IRentabilidadeMensalItem {
  mes: string;           // "Jan/25"
  economiaKwh: number;
  economiaBrl: number;
}

// src/app/models/responses/gestao-financeira-rentabilidade.response.ts
import { IRentabilidadeMensalItem } from './rentabilidade-mensal-item.response';
export interface IGestaoFinanceiraRentabilidade {
  meses: IRentabilidadeMensalItem[];
}

// src/app/models/responses/projecao-payback-ponto.response.ts
export interface IProjecaoPaybackPonto {
  mes: number;
  investimento: number;
  recuperado: number;
}

// src/app/models/responses/gestao-financeira-projecao-payback.response.ts
import { IProjecaoPaybackPonto } from './projecao-payback-ponto.response';
export interface IGestaoFinanceiraProjecaoPayback {
  valorInvestimento: number;
  mediaEconomiaMensalBrl: number;
  paybackTotalMeses: number;
  pontos: IProjecaoPaybackPonto[];
}

// src/app/models/responses/investimento-usina.response.ts
export interface IInvestimentoUsina {
  id: number;
  valorTotal: number;
  dataInvestimento: string;   // "2023-01-01"
  descricao: string | null;
}

// src/app/models/responses/tarifa-energia.response.ts
export interface ITarifaEnergia {
  id: number;
  valorKwh: number;
  dataVigenciaInicio: string;  // "2024-01-01"
  dataVigenciaFim: string | null;
  observacao: string | null;
}

// src/app/models/responses/gestao-financeira-dados-investimento.response.ts
import { IInvestimentoUsina } from './investimento-usina.response';
import { ITarifaEnergia } from './tarifa-energia.response';
export interface IGestaoFinanceiraDadosInvestimento {
  investimento: IInvestimentoUsina | null;
  tarifaVigente: ITarifaEnergia | null;
  roiAnualPercent: number;
  configuracaoPendente: boolean;
}
```

### Classes de Request

```typescript
// src/app/models/requests/gestao-financeira-kpis.request.ts
export class GestaoFinanceiraKpisRequest {
  UsinaId: number;
  constructor(params: GestaoFinanceiraKpisRequest) {
    this.UsinaId = params.UsinaId;
  }
}

// src/app/models/requests/gestao-financeira-rentabilidade.request.ts
export class GestaoFinanceiraRentabilidadeRequest {
  UsinaId: number;
  Ano?: number;
  constructor(params: GestaoFinanceiraRentabilidadeRequest) {
    this.UsinaId = params.UsinaId;
    this.Ano = params.Ano;
  }
}

// src/app/models/requests/gestao-financeira-projecao-payback.request.ts
export class GestaoFinanceiraProjecaoPaybackRequest {
  UsinaId: number;
  constructor(params: GestaoFinanceiraProjecaoPaybackRequest) {
    this.UsinaId = params.UsinaId;
  }
}

// src/app/models/requests/gestao-financeira-dados-investimento.request.ts
export class GestaoFinanceiraDadosInvestimentoRequest {
  UsinaId: number;
  constructor(params: GestaoFinanceiraDadosInvestimentoRequest) {
    this.UsinaId = params.UsinaId;
  }
}

// src/app/models/requests/tarifa-inserir.request.ts
export class TarifaInserirRequest {
  UsinaId: number;
  ValorKwh: number;
  DataVigenciaInicio: string;
  Observacao?: string;
  constructor(params: TarifaInserirRequest) {
    this.UsinaId = params.UsinaId;
    this.ValorKwh = params.ValorKwh;
    this.DataVigenciaInicio = params.DataVigenciaInicio;
    this.Observacao = params.Observacao;
  }
}

// src/app/models/requests/tarifa-editar.request.ts
export class TarifaEditarRequest {
  Id: number;
  ValorKwh: number;
  DataVigenciaInicio: string;
  Observacao?: string;
  constructor(params: TarifaEditarRequest) {
    this.Id = params.Id;
    this.ValorKwh = params.ValorKwh;
    this.DataVigenciaInicio = params.DataVigenciaInicio;
    this.Observacao = params.Observacao;
  }
}

// src/app/models/requests/investimento-inserir.request.ts
export class InvestimentoInserirRequest {
  UsinaId: number;
  ValorTotal: number;
  DataInvestimento: string;
  Descricao?: string;
  constructor(params: InvestimentoInserirRequest) {
    this.UsinaId = params.UsinaId;
    this.ValorTotal = params.ValorTotal;
    this.DataInvestimento = params.DataInvestimento;
    this.Descricao = params.Descricao;
  }
}

// src/app/models/requests/investimento-editar.request.ts
export class InvestimentoEditarRequest {
  Id: number;
  ValorTotal: number;
  DataInvestimento: string;
  Descricao?: string;
  constructor(params: InvestimentoEditarRequest) {
    this.Id = params.Id;
    this.ValorTotal = params.ValorTotal;
    this.DataInvestimento = params.DataInvestimento;
    this.Descricao = params.Descricao;
  }
}
```

### Formulários (Reactive Forms)

```typescript
// src/app/formularios/investimento.formulario.ts
import { Validators } from '@angular/forms';
export const INVESTIMENTO_FORM_CONFIG = {
  valorTotal: [null, [Validators.required, Validators.min(0.01)]],
  dataInvestimento: ['', [Validators.required]],
  descricao: ['', [Validators.maxLength(500)]]
};

// src/app/formularios/tarifa-energia.formulario.ts
import { Validators } from '@angular/forms';
export const TARIFA_ENERGIA_FORM_CONFIG = {
  valorKwh: [null, [Validators.required, Validators.min(0.0001)]],
  dataVigenciaInicio: ['', [Validators.required]],
  observacao: ['', [Validators.maxLength(500)]]
};
```

---

## 7. Integração com a API

| Endpoint | Método | Serviço Angular | Response Interface |
| --- | --- | --- | --- |
| `api/gestao-financeira/kpis?usinaId=` | GET | `GestaoFinanceiraService.recuperarKpis()` | `IGestaoFinanceiraKpis` |
| `api/gestao-financeira/rentabilidade-mensal?usinaId=&ano=` | GET | `GestaoFinanceiraService.recuperarRentabilidadeMensal()` | `IGestaoFinanceiraRentabilidade` |
| `api/gestao-financeira/projecao-payback?usinaId=` | GET | `GestaoFinanceiraService.recuperarProjecaoPayback()` | `IGestaoFinanceiraProjecaoPayback` |
| `api/gestao-financeira/dados-investimento?usinaId=` | GET | `GestaoFinanceiraService.recuperarDadosInvestimento()` | `IGestaoFinanceiraDadosInvestimento` |
| `api/gestao-financeira/tarifas` | POST | `GestaoFinanceiraService.inserirTarifa()` | `ITarifaEnergia` |
| `api/gestao-financeira/tarifas/{id}` | PUT | `GestaoFinanceiraService.editarTarifa()` | `ITarifaEnergia` |
| `api/gestao-financeira/investimentos` | POST | `GestaoFinanceiraService.inserirInvestimento()` | `IInvestimentoUsina` |
| `api/gestao-financeira/investimentos/{id}` | PUT | `GestaoFinanceiraService.editarInvestimento()` | `IInvestimentoUsina` |

> **Autenticação:** Todas as requisições são automaticamente autenticadas pelo `authInterceptor` com `Bearer token` no header `Authorization`.
> **Integrações externas:** A API ProjectSwitch (Nortebox) é consumida exclusivamente pelo backend (.NET). O frontend não acessa APIs externas diretamente.

---

## 8. Autenticação e Autorização

> Todos os artefatos de autenticação foram criados no módulo de Gerenciamento de Energia. Reutilizar integralmente.

```typescript
// ✅ REUTILIZAR — src/app/core/token.service.ts
// Responsável pelo armazenamento e validação do JWT no sessionStorage.
// Método principal: isTokenValido(margemSegundos = 30): boolean

// ✅ REUTILIZAR — src/app/core/auth.service.ts
// BehaviorSubject com usuarioLogado$. Métodos: entrar(), sair(), estaLogado()

// ✅ REUTILIZAR — src/app/guards/auth.guard.ts
// CanActivateFn. Redireciona para /login se JWT inválido.

// ✅ REUTILIZAR — src/app/interceptors/auth.interceptor.ts
// HttpInterceptorFn. Injeta Bearer token. Faz logout automático em erro 401.
```

---

## 9. Fluxo de Dados no Frontend

```
┌──────────────────────────────────────────────────────────────────┐
│              Seleção de Unidade                                  │
│         UsinaService.usinaSelecionada$ (BehaviorSubject)         │
└─────────────────────────┬────────────────────────────────────────┘
                          │ subscribe (usinaId)
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│              FinancialComponent (Page)                           │
│  ngOnInit → subscribe(usinaSelecionada$) → carregarTodosDados()  │
│  Chama 4 métodos do service em paralelo (forkJoin)               │
└──────────────────────────┬───────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────────┐
           ▼               ▼                   ▼
   recuperarKpis()  recuperarRentabilidade()  recuperarProjecao()
   recuperarDadosInvestimento()
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              GestaoFinanceiraService                            │
│  HttpClient → GET / POST / PUT → (com authInterceptor)         │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              .NET 10 Web API                                    │
│  api/gestao-financeira/* (JWT validado, usinaId filtrado)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Checklist de Implementação

### Estrutura Base
- [ ] Criar pasta `src/app/pages/dashboard/financial/`
- [ ] Criar pasta `src/app/components/gestao-financeira/`
- [ ] Criar pasta `src/app/formularios/` (se não existir)
- [ ] 🔄 Adicionar rota `/dashboard/financial` no `app.routes.ts`

### Models — Responses
- [ ] `gestao-financeira-kpis.response.ts` — `IGestaoFinanceiraKpis`
- [ ] `rentabilidade-mensal-item.response.ts` — `IRentabilidadeMensalItem`
- [ ] `gestao-financeira-rentabilidade.response.ts` — `IGestaoFinanceiraRentabilidade`
- [ ] `projecao-payback-ponto.response.ts` — `IProjecaoPaybackPonto`
- [ ] `gestao-financeira-projecao-payback.response.ts` — `IGestaoFinanceiraProjecaoPayback`
- [ ] `investimento-usina.response.ts` — `IInvestimentoUsina`
- [ ] `tarifa-energia.response.ts` — `ITarifaEnergia`
- [ ] `gestao-financeira-dados-investimento.response.ts` — `IGestaoFinanceiraDadosInvestimento`

### Models — Requests
- [ ] `gestao-financeira-kpis.request.ts`
- [ ] `gestao-financeira-rentabilidade.request.ts`
- [ ] `gestao-financeira-projecao-payback.request.ts`
- [ ] `gestao-financeira-dados-investimento.request.ts`
- [ ] `tarifa-inserir.request.ts`
- [ ] `tarifa-editar.request.ts`
- [ ] `investimento-inserir.request.ts`
- [ ] `investimento-editar.request.ts`

### Formulários
- [ ] `investimento.formulario.ts` — validações de valor e data
- [ ] `tarifa-energia.formulario.ts` — validações de R$/kWh e data

### Serviços
- [ ] `gestao-financeira.service.ts` — 8 métodos HTTP
- [ ] ✅ `usina.service.ts` — reutilizar

### Autenticação
- [ ] ✅ `auth.guard.ts` — reutilizar
- [ ] ✅ `auth.interceptor.ts` — reutilizar
- [ ] ✅ `token.service.ts` — reutilizar
- [ ] ✅ `auth.service.ts` — reutilizar

### Componentes
- [ ] `financial.component.ts` — page (orquestra, subscreve `usinaSelecionada$`, carrega dados via `forkJoin`)
- [ ] `kpi-financeiro-card.component.ts` — `@Input() label`, `valor`, `subtexto`, `bordaClasse`
- [ ] `rentabilidade-mensal-chart.component.ts` — `@Input() dados: IRentabilidadeMensalItem[]`
- [ ] `projecao-payback-chart.component.ts` — `@Input() dados: IProjecaoPaybackPonto[]`, `valorInvestimento`
- [ ] `dados-investimento-painel.component.ts` — exibe investimento, tarifa, ROI; emite `@Output()` para abrir modais
- [ ] `modal-editar-investimento.component.ts` — Reactive Form com `INVESTIMENTO_FORM_CONFIG`; emite `@Output() salvo`
- [ ] `modal-editar-tarifa.component.ts` — Reactive Form com `TARIFA_ENERGIA_FORM_CONFIG`; emite `@Output() salvo`

### Tratamento de Erros
- [ ] Implementar `obterMensagemErro(err)` em todos os subscribes
- [ ] Exibir banner `configuracaoPendente` quando `IGestaoFinanceiraKpis.configuracaoPendente === true`
- [ ] Toast de sucesso após salvar (ngx-toastr ou equivalente)
- [ ] Flags `carregando` em cada componente com indicador visual de loading

---

## 11. Resumo de Responsabilidades

| Componente / Serviço | Responsabilidade |
| --- | --- |
| `FinancialComponent` (page) | Orquestrar componentes, subscrever `usinaSelecionada$`, disparar carregamento via `forkJoin`, gerenciar estado de loading e erros globais |
| `KpiFinanceiroCardComponent` | Exibir um KPI com label, valor formatado, subtexto e borda colorida |
| `RentabilidadeMensalChartComponent` | Renderizar BarChart com dados mensais de economia |
| `ProjecaoPaybackChartComponent` | Renderizar LineChart com linhas de investimento e recuperado |
| `DadosInvestimentoPainelComponent` | Exibir dados do investimento, tarifa e ROI; abrir modais de edição |
| `ModalEditarInvestimentoComponent` | Formulário reativo para cadastro/edição de investimento; validação e envio |
| `ModalEditarTarifaComponent` | Formulário reativo para cadastro/edição de tarifa; validação e envio |
| `GestaoFinanceiraService` | Comunicação HTTP com `api/gestao-financeira/*`; 8 métodos tipados |
| `UsinaService` | Fornecer `usinaSelecionada$` (BehaviorSubject) para filtrar dados por usina |
| `authInterceptor` | Injetar `Bearer token` em todas as requisições; logout automático em 401 |
| `AuthGuard` | Proteger rota `/dashboard/financial`; redirecionar para `/login` se não autenticado |
