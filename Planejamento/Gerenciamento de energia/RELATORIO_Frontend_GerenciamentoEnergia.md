# Relatório — Frontend do Módulo de Gerenciamento de Energia

> **Projeto:** CEFE Energy Hub
>
> **Frontend:** Angular 21 + TypeScript 5.x + Tailwind CSS 3.x
>
> **Padrões de Desenvolvimento:** `regras-projeto-angular.md`
>
> **Backend (referência):** `RELATORIO_Backend_GerenciamentoEnergia.md`
>
> **Data:** Fevereiro/2026

---

## 1. Visão Geral do Módulo

O módulo de **Gerenciamento de Energia** possui duas telas que exibem dados de consumo energético, medições MD50 e geração solar do condomínio logístico TH01. A tela principal apresenta KPIs consolidados do condomínio e um grid de galpões. Ao clicar em um galpão, o usuário navega para a tela de detalhe com gráficos, tabelas diárias e registros MD50 de 15 minutos.

| Tela | Rota | Descrição |
| --- | --- | --- |
| **Visão Geral do Condomínio** | `/dashboard/gerenciamento-energia` | Seletor de mês, KPIs do condomínio (consumo solar, concessionária, total, demanda contratada), grid de galpões com consumo mensal |
| **Detalhe do Galpão** | `/dashboard/gerenciamento-energia/galpao/:id` | Seletor de mês, KPIs do galpão (consumo acumulado, demanda contratada), gráfico consumo diário 15 min, gráfico mensal por dia, tabela dados diários, tabela registros MD50 |

### Restrições de Acesso

- O módulo está disponível apenas para a usina **TH01** (`usinaId` correspondente).
- O usuário deve estar autenticado (JWT válido verificado via `TokenService.isTokenValido()`).
- O usuário deve ter uma usina selecionada via `UsinaService` (`usinaSelecionada$`).
- Se a usina selecionada não é TH01, exibe mensagem: "Módulo não disponível — O módulo de Gerenciamento de Energia está disponível apenas para a unidade TH01."
- Rotas protegidas via `AuthGuard` (redireciona para `/login` se JWT inválido).
- Requisições HTTP autenticadas automaticamente pelo `authInterceptor` (`HttpInterceptorFn`) que injeta `Bearer token` no header `Authorization`.
- Todas as requisições devem incluir o `usinaId` (id da usina selecionada) para filtrar os dados.

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
- **Injeção de dependência** via `inject()` (não usar `constructor`).
- **Services** com `@Injectable({ providedIn: 'root' })`.
- **Estado reativo** com `BehaviorSubject` + `asObservable()`.
- **Reactive Forms** para formulários (centralizados em `formularios/`).
- **Interfaces** com prefixo `I` (ex: `IGerenciamentoEnergiaResumo`).
- **Request classes** com sufixo `Request` e propriedades `PascalCase`.
- **Response interfaces** com propriedades `camelCase`.
- **Tratamento de erros** via `obterMensagemErro()` padronizado.
- **Flags de estado**: `carregando`, `enviando`, `tentouEnviar`.
- Referência completa: `regras-projeto-angular.md`.

---

## 3. Funcionalidades Visuais da Tela

### 3.1 — Tela: Visão Geral do Condomínio

#### 3.1.1 — Seletor de Mês

| Elemento | Descrição | Estilização Tailwind |
| --- | --- | --- |
| **Select** | Dropdown com meses disponíveis (ex: "Janeiro 2026", "Fevereiro 2026") | `w-[200px]` — componente `<select>` estilizado com Tailwind |
| **Label do mês** | Formato "Mês AAAA" (ex: "Janeiro 2026") | — |

- **Comportamento:** Ao selecionar um mês, todos os dados da tela (KPIs e grid de galpões) são recarregados para o mês selecionado.
- **Estado inicial:** Último mês disponível (mais recente).

> **Fonte dos dados:** Endpoint `GET api/gerenciamento-energia/meses?usinaId={usinaId}`.

##### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Meses disponíveis | "2026-01", "2026-02", "2026-03" | Array `availableMonths` inline |

#### 3.1.2 — KPIs do Condomínio (4 cards)

| KPI | Dados Exibidos | Alerta Visual |
| --- | --- | --- |
| **Consumo Zero Grid** | Valor em kWh (ex: "12.200 kWh") | Borda lateral colorida: `border-l-4 border-l-[hsl(var(--chart-3))]`. Ícone: `Sun` |
| **Consumo Concessionária** | Valor em kWh (ex: "21.743 kWh") | Borda lateral colorida: `border-l-4 border-l-[hsl(var(--chart-2))]`. Ícone: `Building2` |
| **Consumo Total** | Valor em kWh (ex: "33.943 kWh"). Calculado: `Consumo Solar + Consumo Concessionária` | Borda lateral colorida: `border-l-4 border-l-[hsl(var(--chart-1))]`. Ícone: `Zap` |
| **Demanda Contratada** | Valor em kW (ex: "150 kW") | Borda lateral colorida: `border-l-4 border-l-[hsl(var(--chart-4))]`. Ícone: `Gauge` |

- **Layout:** Grid responsivo `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`.
- **Estrutura do card:** `CardHeader` com título (`text-sm font-medium text-muted-foreground`) + ícone (`h-5 w-5 text-muted-foreground`), `CardContent` com valor (`text-2xl font-bold`).
- **Formatação:** Números formatados com `Intl.NumberFormat("pt-BR")`.

> **Fonte dos dados:** Endpoint `GET api/gerenciamento-energia/resumo?usinaId={usinaId}&mes={mes}`.

##### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| KPI "Consumo Zero Grid" | 12.200 kWh | `condominiumInvoices[].solarConsumptionKwh` |
| KPI "Consumo Concessionária" | 21.743 kWh | `condominiumInvoices[].gridConsumptionKwh` |
| KPI "Consumo Total" | 33.943 kWh | Calculado: `solarConsumption + gridConsumption` |
| KPI "Demanda Contratada" | 150 kW | `condominiumInvoices[].availablePower` |

#### 3.1.3 — Grid de Galpões (8 cards clicáveis)

| Campo | Dados Exibidos | Estilização Tailwind |
| --- | --- | --- |
| **Nome** | Nome do galpão (ex: "Mercado Livre") | `CardTitle text-base` |
| **Consumo** | Badge com consumo total em kWh (ex: "4.521 kWh") | `Badge text-sm font-semibold` com cor de fundo e texto dinâmicos |
| **Ícone** | Ícone `Zap` | Cor dinâmica por índice do card |

- **Layout:** Grid responsivo `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`.
- **Cores dos cards:** Rotação de 8 cores por índice. Cada cor define borda lateral, fundo e ícone:
  - Índice 0: `border-l-blue-500`, `bg-blue-50 dark:bg-blue-950/30`, `text-blue-500`
  - Índice 1: `border-l-orange-500`, `bg-orange-50 dark:bg-orange-950/30`, `text-orange-500`
  - Índice 2: `border-l-emerald-500`, `bg-emerald-50 dark:bg-emerald-950/30`, `text-emerald-500`
  - Índice 3: `border-l-purple-500`, `bg-purple-50 dark:bg-purple-950/30`, `text-purple-500`
  - Índice 4: `border-l-rose-500`, `bg-rose-50 dark:bg-rose-950/30`, `text-rose-500`
  - Índice 5: `border-l-amber-500`, `bg-amber-50 dark:bg-amber-950/30`, `text-amber-500`
  - Índice 6: `border-l-cyan-500`, `bg-cyan-50 dark:bg-cyan-950/30`, `text-cyan-500`
  - Índice 7: `border-l-indigo-500`, `bg-indigo-50 dark:bg-indigo-950/30`, `text-indigo-500`
- **Interação:** `cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]`.
- **Comportamento:** Ao clicar, navega para `/dashboard/gerenciamento-energia/galpao/{id}`.

> **Fonte dos dados:** Endpoint `GET api/gerenciamento-energia/galpoes?usinaId={usinaId}&mes={mes}`.

##### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| 8 cards de galpões | Mercado Livre (4.521 kWh), Shopee (3.890 kWh), MRO (5.102 kWh), Galpão Alpha (2.330 kWh), Galpão Beta (3.100 kWh), Galpão Gamma (2.800 kWh), Galpão Delta (4.200 kWh), Galpão Epsilon (3.000 kWh) | Array `warehouses` inline |

---

### 3.2 — Tela: Detalhe do Galpão

#### 3.2.1 — Cabeçalho com Navegação

| Elemento | Descrição | Estilização Tailwind |
| --- | --- | --- |
| **Botão Voltar** | Ícone `ArrowLeft`, navega para `/dashboard/gerenciamento-energia` | `variant="ghost" size="icon"` |
| **Título** | Nome do galpão (ex: "Mercado Livre") | `text-2xl font-bold` |
| **Subtítulo** | "Dados do módulo Embrasul MD50" | `text-muted-foreground` |
| **Seletor de Mês** | Mesmo componente da tela anterior | `w-[200px]` |

#### 3.2.2 — KPIs do Galpão (2 cards)

| KPI | Dados Exibidos | Alerta Visual |
| --- | --- | --- |
| **Consumo Acumulado** | Valor em kWh (ex: "4.521 kWh") | Borda lateral: `border-l-4 border-l-primary`. Ícone: `Zap` |
| **Demanda Contratada** | Valor em kW (ex: "75 kW") | Borda lateral: `border-l-4 border-l-[hsl(var(--chart-2))]`. Ícone: `Gauge` |

- **Layout:** Grid responsivo `grid grid-cols-1 md:grid-cols-2 gap-4`.
- **Estrutura do card:** Mesmo padrão dos KPIs do condomínio (CardHeader + CardContent).

> **Fonte dos dados:** Endpoint `GET api/gerenciamento-energia/galpoes/{galpaoId}/mensal?usinaId={usinaId}` (consumo do mês selecionado) + cadastro do galpão via endpoint `GET api/gerenciamento-energia/galpoes?usinaId={usinaId}&mes={mes}` (demanda contratada).

##### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| KPI "Consumo Acumulado" | 4.521 kWh (Mercado Livre) | `getWarehouseMonthlyData(id)[mes].totalConsumptionKwh` |
| KPI "Demanda Contratada" | 75 kW (Mercado Livre) | `warehouses[].availablePower` |

#### 3.2.3 — Gráfico: Consumo Diário (Barras 15 min)

| Elemento | Descrição |
| --- | --- |
| **Tipo** | Stacked Bar Chart |
| **Eixo X** | Horário (HH:mm) — intervalos de 15 min (96 pontos por dia), labels a cada 2 horas |
| **Eixo Y** | Consumo (kWh) |
| **Séries** | **Ponta** (`fill: hsl(var(--primary))`) e **Fora Ponta** (`fill: hsl(var(--chart-2))`) |
| **Seletor de Dia** | Dropdown com dias disponíveis no mês (ex: "Dia 01", "Dia 02", ...) |

- **Comportamento:** Ao mudar o dia, o gráfico recarrega com os registros MD50 do dia selecionado. Compartilha o seletor de dia com a tabela de Registros MD50.
- **Layout:** Ocupa metade da largura em telas grandes: `grid grid-cols-1 lg:grid-cols-2 gap-4` (coluna esquerda).

> **Fonte dos dados:** Endpoint `GET api/gerenciamento-energia/galpoes/{galpaoId}/registros?usinaId={usinaId}&data={data}` — campos `consumoPonta15min` e `consumoForaPonta15min`.

##### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Gráfico Consumo Diário | 96 pontos × (ponta + foraPonta) por dia | `getMD50Registers(warehouseId, date)` |

#### 3.2.4 — Gráfico: Consumo Acumulado Mensal (Barras diárias)

| Elemento | Descrição |
| --- | --- |
| **Tipo** | Stacked Bar Chart |
| **Eixo X** | Dia do mês ("01", "02", ..., "30") |
| **Eixo Y** | Consumo (kWh) |
| **Séries** | **Ponta** (`fill: hsl(var(--primary))`) e **Fora Ponta** (`fill: hsl(var(--chart-2))`) |

- **Comportamento:** Atualiza ao mudar o mês no seletor.
- **Layout:** Coluna direita do grid `lg:grid-cols-2`.

> **Fonte dos dados:** Endpoint `GET api/gerenciamento-energia/galpoes/{galpaoId}/diario?usinaId={usinaId}&mes={mes}` — campos `consumoPontaKwh` e `consumoForaPontaKwh`.

##### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Gráfico Consumo Mensal | 30 barras × (ponta + foraPonta) | `getWarehouseDailyData(warehouseId, month)` |

#### 3.2.5 — Tabs: Dados Diários / Registros MD50

A seção de tabelas é organizada em duas abas (Tabs):

| Aba | Trigger | Conteúdo |
| --- | --- | --- |
| **Dados Diários** | "Dados Diários" (default) | Tabela com resumos diários do mês |
| **Registros MD50** | "Registros MD50 (15 min)" | Tabela com 96 registros do dia selecionado |

#### 3.2.6 — Tabela: Dados Diários

| Coluna | Formato | Alerta Visual |
| --- | --- | --- |
| **Data** | dd/mm | — |
| **Cons. Ponta (kWh)** | Número com 1 decimal, alinhado à direita | — |
| **Cons. F. Ponta (kWh)** | Número com 1 decimal, alinhado à direita | — |
| **Cons. Total (kWh)** | Número com 1 decimal, alinhado à direita | — |
| **Demanda Máx (kW)** | Número com 1 decimal, alinhado à direita | — |
| **Fat. Potência Médio** | Número com 2 decimais, alinhado à direita | Se `< 0.92`: `Badge variant="destructive"` com texto "Baixo" (`ml-2 text-xs`) |
| **Custo Estimado (R$)** | Moeda BRL formatada (`Intl.NumberFormat pt-BR currency`) | — |

> **Fonte dos dados:** Endpoint `GET api/gerenciamento-energia/galpoes/{galpaoId}/diario?usinaId={usinaId}&mes={mes}`.
> **Regra visual:** Campo `fatPotMedioBaixo` do response indica se o badge de alerta deve ser exibido.

##### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Tabela Dados Diários | 30 linhas com consumo ponta/fora ponta, demanda, fator potência, custo | `getWarehouseDailyData(warehouseId, month)` |

#### 3.2.7 — Tabela: Registros MD50 (15 min)

| Coluna | Formato | Alerta Visual |
| --- | --- | --- |
| **Horário** | HH:mm (ex: "00:00", "00:15") | — |
| **C. Ponta (kWh)** | Número com 2 decimais, alinhado à direita | — |
| **C. F. Ponta (kWh)** | Número com 2 decimais, alinhado à direita | — |
| **E. Ind. Ponta** | Número com 2 decimais, alinhado à direita | — |
| **E. Ind. F.P.** | Número com 2 decimais, alinhado à direita | — |
| **E. Cap. Ponta** | Número com 2 decimais, alinhado à direita | — |
| **E. Cap. F.P.** | Número com 2 decimais, alinhado à direita | — |
| **Pot. Ativa (kW)** | Número com 1 decimal, alinhado à direita | — |
| **Fat. Potência** | Número com 2 decimais, alinhado à direita | Se `< 0.92`: `Badge variant="destructive"` com `"!"` (`ml-1 text-xs`) |

- **Seletor de Dia:** Dropdown compartilhado com o gráfico de consumo diário.
- **Scroll:** `ScrollArea` com `h-[400px]` para conter as 96 linhas.

> **Fonte dos dados:** Endpoint `GET api/gerenciamento-energia/galpoes/{galpaoId}/registros?usinaId={usinaId}&data={data}`.
> **Regra visual:** Campo `fatPotAlerta` do response indica se o badge de alerta deve ser exibido.

##### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Tabela Registros MD50 | 96 linhas (15 min) com consumo ponta/fora ponta, energias, potência, fator | `getMD50Registers(warehouseId, date)` |

---

## 4. Estrutura de Pastas Angular

> Conforme padrões em `regras-projeto-angular.md`.

```
src/app/
├── pages/
│   └── dashboard/
│       ├── gerenciamento-energia/
│       │   ├── gerenciamento-energia.component.ts
│       │   └── gerenciamento-energia.component.html
│       └── galpao-detalhe/
│           ├── galpao-detalhe.component.ts
│           └── galpao-detalhe.component.html
├── components/
│   └── gerenciamento-energia/
│       ├── seletor-mes/
│       │   ├── seletor-mes.component.ts
│       │   └── seletor-mes.component.html
│       ├── condominio-kpi-cards/
│       │   ├── condominio-kpi-cards.component.ts
│       │   └── condominio-kpi-cards.component.html
│       ├── galpao-card/
│       │   ├── galpao-card.component.ts
│       │   └── galpao-card.component.html
│       ├── galpao-card-list/
│       │   ├── galpao-card-list.component.ts
│       │   └── galpao-card-list.component.html
│       ├── galpao-kpi-cards/
│       │   ├── galpao-kpi-cards.component.ts
│       │   └── galpao-kpi-cards.component.html
│       ├── consumo-diario-chart/
│       │   ├── consumo-diario-chart.component.ts
│       │   └── consumo-diario-chart.component.html
│       ├── consumo-mensal-chart/
│       │   ├── consumo-mensal-chart.component.ts
│       │   └── consumo-mensal-chart.component.html
│       ├── dados-diarios-table/
│       │   ├── dados-diarios-table.component.ts
│       │   └── dados-diarios-table.component.html
│       └── registros-md50-table/
│           ├── registros-md50-table.component.ts
│           └── registros-md50-table.component.html
├── services/
│   ├── gerenciamento-energia.service.ts    ← HttpClient para api/gerenciamento-energia/*
│   └── usina.service.ts                    ← BehaviorSubject com usina selecionada
├── models/
│   ├── responses/
│   │   ├── gerenciamento-energia-meses.response.ts
│   │   ├── gerenciamento-energia-resumo.response.ts
│   │   ├── gerenciamento-energia-galpao.response.ts
│   │   ├── gerenciamento-energia-galpao-mensal.response.ts
│   │   ├── gerenciamento-energia-resumo-diario.response.ts
│   │   └── gerenciamento-energia-registro-md50.response.ts
│   └── requests/
│       ├── gerenciamento-energia-meses-listar.request.ts
│       ├── gerenciamento-energia-resumo.request.ts
│       ├── gerenciamento-energia-galpoes-listar.request.ts
│       ├── gerenciamento-energia-galpao-mensal.request.ts
│       ├── gerenciamento-energia-galpao-diario-listar.request.ts
│       └── gerenciamento-energia-registros-listar.request.ts
├── guards/
│   └── auth.guard.ts                       ← CanActivateFn com TokenService
├── interceptors/
│   └── auth.interceptor.ts                 ← HttpInterceptorFn com Bearer token
├── core/
│   ├── token.service.ts                    ← armazenar/verificar JWT
│   └── auth.service.ts                     ← login/logout
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

---

## 5. Serviços Angular

### 5.1 — GerenciamentoEnergiaService

Serviço responsável por consumir todos os endpoints da API de Gerenciamento de Energia.

```typescript
// src/app/services/gerenciamento-energia.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IGerenciamentoEnergiaMesesResponse } from '../models/responses/gerenciamento-energia-meses.response';
import { IGerenciamentoEnergiaResumoResponse } from '../models/responses/gerenciamento-energia-resumo.response';
import { IGerenciamentoEnergiaGalpaoListaResponse } from '../models/responses/gerenciamento-energia-galpao.response';
import { IGerenciamentoEnergiaGalpaoMensalResponse } from '../models/responses/gerenciamento-energia-galpao-mensal.response';
import { IGerenciamentoEnergiaResumoDiarioResponse } from '../models/responses/gerenciamento-energia-resumo-diario.response';
import { IGerenciamentoEnergiaRegistroMD50Response } from '../models/responses/gerenciamento-energia-registro-md50.response';

@Injectable({ providedIn: 'root' })
export class GerenciamentoEnergiaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + '/gerenciamento-energia';

  listarMeses(usinaId: number): Observable<IGerenciamentoEnergiaMesesResponse> {
    return this.http.get<IGerenciamentoEnergiaMesesResponse>(`${this.baseUrl}/meses`, {
      params: { usinaId }
    });
  }

  recuperarResumo(usinaId: number, mes: string): Observable<IGerenciamentoEnergiaResumoResponse> {
    return this.http.get<IGerenciamentoEnergiaResumoResponse>(`${this.baseUrl}/resumo`, {
      params: { usinaId, mes }
    });
  }

  listarGalpoes(usinaId: number, mes: string): Observable<IGerenciamentoEnergiaGalpaoListaResponse> {
    return this.http.get<IGerenciamentoEnergiaGalpaoListaResponse>(`${this.baseUrl}/galpoes`, {
      params: { usinaId, mes }
    });
  }

  recuperarGalpaoMensal(galpaoId: number, usinaId: number): Observable<IGerenciamentoEnergiaGalpaoMensalResponse> {
    return this.http.get<IGerenciamentoEnergiaGalpaoMensalResponse>(
      `${this.baseUrl}/galpoes/${galpaoId}/mensal`, {
        params: { usinaId }
      }
    );
  }

  listarGalpaoDiario(galpaoId: number, usinaId: number, mes: string): Observable<IGerenciamentoEnergiaResumoDiarioResponse> {
    return this.http.get<IGerenciamentoEnergiaResumoDiarioResponse>(
      `${this.baseUrl}/galpoes/${galpaoId}/diario`, {
        params: { usinaId, mes }
      }
    );
  }

  listarRegistrosMD50(galpaoId: number, usinaId: number, data: string): Observable<IGerenciamentoEnergiaRegistroMD50Response> {
    return this.http.get<IGerenciamentoEnergiaRegistroMD50Response>(
      `${this.baseUrl}/galpoes/${galpaoId}/registros`, {
        params: { usinaId, data }
      }
    );
  }
}
```

### 5.2 — UsinaService (Gerenciamento de Estado)

Serviço responsável por manter a usina selecionada em memória via `BehaviorSubject`. Todos os componentes que dependem da usina assinam `usinaSelecionada$` e reagem a mudanças.

```typescript
// src/app/services/usina.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUsina } from '../models/usina.model';

@Injectable({ providedIn: 'root' })
export class UsinaService {
  private usinaSelecionadaSubject = new BehaviorSubject<IUsina | null>(null);
  public usinaSelecionada$ = this.usinaSelecionadaSubject.asObservable();

  selecionarUsina(usina: IUsina): void {
    this.usinaSelecionadaSubject.next(usina);
  }

  get usinaSelecionada(): IUsina | null {
    return this.usinaSelecionadaSubject.getValue();
  }
}
```

> **Padrão:** O `GerenciamentoEnergiaComponent` (page) assina `usinaSelecionada$` e, a cada mudança, chama os métodos do `GerenciamentoEnergiaService` passando o novo `usinaId`. O `GalpaoDetalheComponent` faz o mesmo, adicionando o `galpaoId` da rota.

---

## 6. Models (Interfaces)

### 6.1 — Interfaces de Response

```typescript
// src/app/models/responses/gerenciamento-energia-meses.response.ts
export interface IGerenciamentoEnergiaMesesResponse {
  meses: string[];                      // ["2026-01", "2026-02", "2026-03"]
}

// src/app/models/responses/gerenciamento-energia-resumo.response.ts
export interface IGerenciamentoEnergiaResumoResponse {
  mes: string;                          // "2026-01"
  consumoSolarKwh: number;
  consumoConcessonariaKwh: number;
  consumoTotalKwh: number;
  demandaContratadaKw: number;
  valorTotalBrl: number;
}

// src/app/models/responses/gerenciamento-energia-galpao.response.ts
export interface IGerenciamentoEnergiaGalpaoListaResponse {
  galpoes: IGerenciamentoEnergiaGalpao[];
}

export interface IGerenciamentoEnergiaGalpao {
  id: number;
  nome: string;
  consumoTotalKwh: number;
  demandaContratadaKw: number;
}

// src/app/models/responses/gerenciamento-energia-galpao-mensal.response.ts
export interface IGerenciamentoEnergiaGalpaoMensalResponse {
  meses: IGalpaoResumoMensal[];
}

export interface IGalpaoResumoMensal {
  mes: string;                          // "2026-01"
  consumoTotalKwh: number;
  demandaContratadaKw: number;
}

// src/app/models/responses/gerenciamento-energia-resumo-diario.response.ts
export interface IGerenciamentoEnergiaResumoDiarioResponse {
  dias: IResumoDiarioGalpao[];
}

export interface IResumoDiarioGalpao {
  data: string;                         // "2026-01-01"
  consumoPontaKwh: number;
  consumoForaPontaKwh: number;
  consumoTotalKwh: number;
  demandaMaxKw: number;
  fatPotMedio: number;
  fatPotMedioBaixo: boolean;            // true se fatPotMedio < 0.92
}

// src/app/models/responses/gerenciamento-energia-registro-md50.response.ts
export interface IGerenciamentoEnergiaRegistroMD50Response {
  registros: IRegistroMD50Detalhe[];
}

export interface IRegistroMD50Detalhe {
  dataHora: string;                     // "2026-01-01T00:00:00"
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
  fatPotAlerta: boolean;                // true se fatPotT < 0.92
}
```

### 6.2 — Interfaces Auxiliares

```typescript
// src/app/models/usina.model.ts
export interface IUsina {
  id: number;
  nome: string;
  localizacao: string;
  estado: string;
  potenciaInstaladaKwp: number;
  potenciaInstaladaDescricao: string;
  dataInstalacao: string;
  ativo: boolean;
}
```

### 6.3 — Classes de Request

```typescript
// src/app/models/requests/gerenciamento-energia-meses-listar.request.ts
export class GerenciamentoEnergiaMesesListarRequest {
  UsinaId: number;

  constructor(usinaId: number) {
    this.UsinaId = usinaId;
  }
}

// src/app/models/requests/gerenciamento-energia-resumo.request.ts
export class GerenciamentoEnergiaResumoRequest {
  UsinaId: number;
  Mes: string;

  constructor(usinaId: number, mes: string) {
    this.UsinaId = usinaId;
    this.Mes = mes;
  }
}

// src/app/models/requests/gerenciamento-energia-galpoes-listar.request.ts
export class GerenciamentoEnergiaGalpoesListarRequest {
  UsinaId: number;
  Mes: string;

  constructor(usinaId: number, mes: string) {
    this.UsinaId = usinaId;
    this.Mes = mes;
  }
}

// src/app/models/requests/gerenciamento-energia-galpao-mensal.request.ts
export class GerenciamentoEnergiaGalpaoMensalRequest {
  UsinaId: number;
  GalpaoId: number;

  constructor(usinaId: number, galpaoId: number) {
    this.UsinaId = usinaId;
    this.GalpaoId = galpaoId;
  }
}

// src/app/models/requests/gerenciamento-energia-galpao-diario-listar.request.ts
export class GerenciamentoEnergiaGalpaoDiarioListarRequest {
  UsinaId: number;
  GalpaoId: number;
  Mes: string;

  constructor(usinaId: number, galpaoId: number, mes: string) {
    this.UsinaId = usinaId;
    this.GalpaoId = galpaoId;
    this.Mes = mes;
  }
}

// src/app/models/requests/gerenciamento-energia-registros-listar.request.ts
export class GerenciamentoEnergiaRegistrosListarRequest {
  UsinaId: number;
  GalpaoId: number;
  Data: string;

  constructor(usinaId: number, galpaoId: number, data: string) {
    this.UsinaId = usinaId;
    this.GalpaoId = galpaoId;
    this.Data = data;
  }
}
```

> **Convenção:** Propriedades de Request usam `PascalCase` (para compatibilidade com DTOs do backend .NET). Propriedades de Response usam `camelCase` (padrão JSON retornado pela API). Referência: `regras-projeto-angular.md`.

---

## 7. Integração com a API

### 7.1 — Endpoints Consumidos

| Endpoint | Método HTTP | Serviço Angular | Response Interface |
| --- | --- | --- | --- |
| `api/gerenciamento-energia/meses?usinaId={id}` | GET | `listarMeses()` | `IGerenciamentoEnergiaMesesResponse` |
| `api/gerenciamento-energia/resumo?usinaId={id}&mes={mes}` | GET | `recuperarResumo()` | `IGerenciamentoEnergiaResumoResponse` |
| `api/gerenciamento-energia/galpoes?usinaId={id}&mes={mes}` | GET | `listarGalpoes()` | `IGerenciamentoEnergiaGalpaoListaResponse` |
| `api/gerenciamento-energia/galpoes/{galpaoId}/mensal?usinaId={id}` | GET | `recuperarGalpaoMensal()` | `IGerenciamentoEnergiaGalpaoMensalResponse` |
| `api/gerenciamento-energia/galpoes/{galpaoId}/diario?usinaId={id}&mes={mes}` | GET | `listarGalpaoDiario()` | `IGerenciamentoEnergiaResumoDiarioResponse` |
| `api/gerenciamento-energia/galpoes/{galpaoId}/registros?usinaId={id}&data={data}` | GET | `listarRegistrosMD50()` | `IGerenciamentoEnergiaRegistroMD50Response` |

> **Nota:** Todos os endpoints requerem JWT no header `Authorization`. O `authInterceptor` injeta automaticamente.
> Os dados de leitura do inversor solar e do medidor MD50 são coletados pelo **backend** via Jobs. O frontend **não** acessa dispositivos ou APIs externas diretamente.

### 7.2 — Integração Externa (ProjectSwitch / Embrasul)

A API ProjectSwitch (Nortebox) e os medidores Embrasul MD50 são consumidos exclusivamente pelo **backend** via Jobs. O frontend **não** acessa APIs externas ou dispositivos diretamente.

| Integração | Tipo | Descrição |
| --- | --- | --- |
| **API ProjectSwitch (Nortebox)** | REST API (Bearer Token) | Leituras do inversor solar. Consumida pelo backend via Job de Coleta Solar. |
| **Medidores Embrasul MD50** | Coleta direta (por galpão) | Registros de consumo 15 min. Consumidos pelo backend via Job de Coleta MD50. |
| **Fatura Enel** | Processamento mensal | Dados da concessionária. Processada pelo backend via Job de Fatura Enel. |

---

## 8. Autenticação e Autorização

### 8.1 — AuthGuard

```typescript
// src/app/guards/auth.guard.ts
import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { TokenService } from '../core/token.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.usuarioLogado$.pipe(
      map(usuario => {
        const tokenValido = this.tokenService.isTokenValido();

        if (usuario && tokenValido) {
          return true;
        }

        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
```

### 8.2 — AuthInterceptor

```typescript
// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../core/token.service';
import { AuthService } from '../core/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const auth = inject(AuthService);

  const token = tokenService.getToken();

  const reqComAuth = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(reqComAuth).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.sair();
      }
      return throwError(() => err);
    })
  );
};
```

### 8.3 — Configuração no App

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { authInterceptor } from './interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};
```

### 8.4 — Rotas do Módulo

```typescript
// src/app/app.routes.ts (trecho relevante)
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ... outras rotas ...

  // Rotas protegidas — Dashboard
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    children: [
      // ... rota de monitoramento ...
      {
        path: 'gerenciamento-energia',
        component: GerenciamentoEnergiaComponent
      },
      {
        path: 'gerenciamento-energia/galpao/:id',
        component: GalpaoDetalheComponent
      },
    ]
  },

  { path: '**', redirectTo: '' }
];
```

---

## 9. Fluxo de Dados no Frontend

### 9.1 — Tela: Visão Geral do Condomínio

```
┌────────────────────────────────────────────────────────────┐
│                  Seleção de Unidade                        │
│              UsinaService.selecionarUsina()                │
│         usinaSelecionada$ (BehaviorSubject)                │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ subscribe (GerenciamentoEnergiaComponent)
                     ▼
┌────────────────────────────────────────────────────────────┐
│         GerenciamentoEnergiaService                        │
│                                                            │
│  listarMeses(usinaId) ──────────────→ Seletor de Mês      │
│  recuperarResumo(usinaId, mes) ─────→ Condomínio KPI Cards │
│  listarGalpoes(usinaId, mes) ───────→ Galpão Card List    │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ HttpClient (com authInterceptor)
                     ▼
┌────────────────────────────────────────────────────────────┐
│              .NET 10 Web API                               │
│           api/gerenciamento-energia/*                      │
│        (JWT obrigatório no header)                         │
└────────────────────────────────────────────────────────────┘
```

### 9.2 — Tela: Detalhe do Galpão

```
┌────────────────────────────────────────────────────────────┐
│      Seleção de Unidade + Parâmetro de Rota (:id)         │
│   UsinaService.usinaSelecionada$ + ActivatedRoute.params   │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ subscribe (GalpaoDetalheComponent)
                     ▼
┌────────────────────────────────────────────────────────────┐
│         GerenciamentoEnergiaService                        │
│                                                            │
│  recuperarGalpaoMensal(galpaoId, usinaId) → KPI Cards      │
│  listarGalpaoDiario(galpaoId, usinaId, mes) → Gráfico     │
│                                              Mensal +      │
│                                              Tabela Diária │
│  listarRegistrosMD50(galpaoId, usinaId, data) → Gráfico   │
│                                                Diário +    │
│                                                Tabela MD50 │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ HttpClient (com authInterceptor)
                     ▼
┌────────────────────────────────────────────────────────────┐
│              .NET 10 Web API                               │
│     api/gerenciamento-energia/galpoes/{id}/*               │
│        (JWT obrigatório no header)                         │
└────────────────────────────────────────────────────────────┘
```

---

## 10. Checklist de Implementação

### 10.1 — Estrutura Base
- [ ] Criar `environment.ts` e `environment.prod.ts` com `apiBaseUrl`
- [ ] Configurar `provideHttpClient(withInterceptors([authInterceptor]))` em `app.config.ts`
- [ ] Configurar rota `/dashboard/gerenciamento-energia` apontando para `GerenciamentoEnergiaComponent` com `AuthGuard`
- [ ] Configurar rota `/dashboard/gerenciamento-energia/galpao/:id` apontando para `GalpaoDetalheComponent` com `AuthGuard`

### 10.2 — Models
- [ ] `IGerenciamentoEnergiaMesesResponse` em `models/responses/gerenciamento-energia-meses.response.ts`
- [ ] `IGerenciamentoEnergiaResumoResponse` em `models/responses/gerenciamento-energia-resumo.response.ts`
- [ ] `IGerenciamentoEnergiaGalpaoListaResponse` + `IGerenciamentoEnergiaGalpao` em `models/responses/gerenciamento-energia-galpao.response.ts`
- [ ] `IGerenciamentoEnergiaGalpaoMensalResponse` + `IGalpaoResumoMensal` em `models/responses/gerenciamento-energia-galpao-mensal.response.ts`
- [ ] `IGerenciamentoEnergiaResumoDiarioResponse` + `IResumoDiarioGalpao` em `models/responses/gerenciamento-energia-resumo-diario.response.ts`
- [ ] `IGerenciamentoEnergiaRegistroMD50Response` + `IRegistroMD50Detalhe` em `models/responses/gerenciamento-energia-registro-md50.response.ts`
- [ ] `IUsina` em `models/usina.model.ts`
- [ ] `GerenciamentoEnergiaMesesListarRequest` em `models/requests/gerenciamento-energia-meses-listar.request.ts`
- [ ] `GerenciamentoEnergiaResumoRequest` em `models/requests/gerenciamento-energia-resumo.request.ts`
- [ ] `GerenciamentoEnergiaGalpoesListarRequest` em `models/requests/gerenciamento-energia-galpoes-listar.request.ts`
- [ ] `GerenciamentoEnergiaGalpaoMensalRequest` em `models/requests/gerenciamento-energia-galpao-mensal.request.ts`
- [ ] `GerenciamentoEnergiaGalpaoDiarioListarRequest` em `models/requests/gerenciamento-energia-galpao-diario-listar.request.ts`
- [ ] `GerenciamentoEnergiaRegistrosListarRequest` em `models/requests/gerenciamento-energia-registros-listar.request.ts`

### 10.3 — Serviços
- [ ] `GerenciamentoEnergiaService` em `services/gerenciamento-energia.service.ts` (6 métodos)
- [ ] `UsinaService` em `services/usina.service.ts` (BehaviorSubject + selecionarUsina)

### 10.4 — Autenticação
- [ ] `TokenService` em `core/token.service.ts` (getToken, isTokenValido, salvar, limpar)
- [ ] `AuthService` em `core/auth.service.ts` (entrar, sair, estaLogado, usuarioLogado$)
- [ ] `AuthGuard` em `guards/auth.guard.ts` (CanActivate com TokenService + AuthService)
- [ ] `authInterceptor` em `interceptors/auth.interceptor.ts` (HttpInterceptorFn com Bearer token + logout em 401)

### 10.5 — Componentes

#### Tela: Visão Geral do Condomínio
- [ ] `GerenciamentoEnergiaComponent` (page standalone) em `pages/dashboard/gerenciamento-energia/`
  - Assina `usinaSelecionada$` — se não é TH01, exibe mensagem "Módulo não disponível"
  - Ao iniciar: chama `listarMeses()`, seleciona o último mês
  - Ao mudar mês: chama `recuperarResumo()` e `listarGalpoes()`
  - Distribui dados para componentes filhos via `@Input()`
- [ ] `SeletorMesComponent` em `components/gerenciamento-energia/seletor-mes/`
  - Recebe: `meses: string[]`, `mesSelecionado: string`
  - Emite: `@Output() mesMudou: EventEmitter<string>`
  - Exibe: select com labels formatados ("Janeiro 2026")
- [ ] `CondominioKpiCardsComponent` em `components/gerenciamento-energia/condominio-kpi-cards/`
  - Recebe: `consumoSolarKwh`, `consumoConcessonariaKwh`, `demandaContratadaKw`
  - Calcula: `consumoTotalKwh = consumoSolarKwh + consumoConcessonariaKwh`
  - Exibe: 4 cards com bordas laterais coloridas e ícones
- [ ] `GalpaoCardListComponent` em `components/gerenciamento-energia/galpao-card-list/`
  - Recebe: `galpoes: IGerenciamentoEnergiaGalpao[]`
  - Exibe: título "Galpões do Condomínio" + grid de `GalpaoCardComponent`
- [ ] `GalpaoCardComponent` em `components/gerenciamento-energia/galpao-card/`
  - Recebe: `galpao: IGerenciamentoEnergiaGalpao`, `indice: number`
  - Exibe: card clicável com nome, badge de consumo, ícone Zap
  - Navega para: `/dashboard/gerenciamento-energia/galpao/{id}` ao clicar

#### Tela: Detalhe do Galpão
- [ ] `GalpaoDetalheComponent` (page standalone) em `pages/dashboard/galpao-detalhe/`
  - Obtém `galpaoId` de `ActivatedRoute.params`
  - Assina `usinaSelecionada$` — se não é TH01, exibe mensagem
  - Ao iniciar: chama `recuperarGalpaoMensal()`, `listarGalpaoDiario()`, `listarRegistrosMD50()`
  - Gerencia estado de `mesSelecionado` e `diaSelecionado`
  - Distribui dados para componentes filhos via `@Input()`
- [ ] `GalpaoKpiCardsComponent` em `components/gerenciamento-energia/galpao-kpi-cards/`
  - Recebe: `consumoAcumuladoKwh`, `demandaContratadaKw`
  - Exibe: 2 cards com bordas laterais coloridas e ícones
- [ ] `ConsumoDiarioChartComponent` em `components/gerenciamento-energia/consumo-diario-chart/`
  - Recebe: `registros: IRegistroMD50Detalhe[]`, `diasDisponiveis: string[]`, `diaSelecionado: string`
  - Emite: `@Output() diaMudou: EventEmitter<string>`
  - Exibe: Stacked Bar Chart (Ponta + Fora Ponta) com seletor de dia
- [ ] `ConsumoMensalChartComponent` em `components/gerenciamento-energia/consumo-mensal-chart/`
  - Recebe: `dadosDiarios: IResumoDiarioGalpao[]`
  - Exibe: Stacked Bar Chart (Ponta + Fora Ponta) por dia do mês
- [ ] `DadosDiariosTableComponent` em `components/gerenciamento-energia/dados-diarios-table/`
  - Recebe: `dados: IResumoDiarioGalpao[]`
  - Exibe: tabela com colunas de consumo, demanda, fator de potência, custo
  - Badge de alerta: se `fatPotMedioBaixo === true`, exibe `Badge destructive "Baixo"`
- [ ] `RegistrosMD50TableComponent` em `components/gerenciamento-energia/registros-md50-table/`
  - Recebe: `registros: IRegistroMD50Detalhe[]`, `diasDisponiveis: string[]`, `diaSelecionado: string`
  - Emite: `@Output() diaMudou: EventEmitter<string>`
  - Exibe: tabela com 96 linhas, seletor de dia, ScrollArea com `h-[400px]`
  - Badge de alerta: se `fatPotAlerta === true`, exibe `Badge destructive "!"`

### 10.6 — Tratamento de Erros
- [ ] Implementar `obterMensagemErro()` conforme padrão `regras-projeto-angular.md`
- [ ] Tratar erro de rede / API indisponível com mensagem amigável ao usuário
- [ ] Tratar JWT expirado (redirecionar para `/login` via interceptor — logout automático em 401)
- [ ] Exibir estado de `carregando` enquanto aguarda resposta da API

---

## 11. Resumo de Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| **GerenciamentoEnergiaComponent (page)** | Orquestrar a tela de Visão Geral. Assinar `usinaSelecionada$`. Verificar se é TH01. Chamar `GerenciamentoEnergiaService` para meses, resumo e galpões. Distribuir dados para componentes filhos. |
| **GalpaoDetalheComponent (page)** | Orquestrar a tela de Detalhe. Obter `galpaoId` da rota. Chamar `GerenciamentoEnergiaService` para dados mensais, diários e registros MD50. Gerenciar mês e dia selecionados. |
| **SeletorMesComponent** | Exibir dropdown de meses disponíveis. Emitir evento ao mudar mês. Componente reutilizável entre as duas telas. |
| **CondominioKpiCardsComponent** | Exibir 4 cards de KPI com dados do condomínio: consumo solar, concessionária, total e demanda contratada. |
| **GalpaoCardListComponent** | Exibir título + grid de cards de galpões. Delegar renderização para `GalpaoCardComponent`. |
| **GalpaoCardComponent** | Exibir card clicável com nome do galpão, badge de consumo e navegação para detalhe. |
| **GalpaoKpiCardsComponent** | Exibir 2 cards de KPI com dados do galpão: consumo acumulado e demanda contratada. |
| **ConsumoDiarioChartComponent** | Renderizar Stacked Bar Chart com consumo de 15 min (Ponta + Fora Ponta) e seletor de dia. |
| **ConsumoMensalChartComponent** | Renderizar Stacked Bar Chart com consumo diário acumulado (Ponta + Fora Ponta) por dia do mês. |
| **DadosDiariosTableComponent** | Renderizar tabela com resumos diários. Exibir badge de alerta para fator de potência baixo. |
| **RegistrosMD50TableComponent** | Renderizar tabela com 96 registros MD50 do dia. Seletor de dia. ScrollArea. Badge de alerta. |
| **GerenciamentoEnergiaService** | Consumir os 6 endpoints da API via `HttpClient`. Retornar `Observable<T>` tipados. |
| **UsinaService** | Manter a usina selecionada em `BehaviorSubject`. Expor `usinaSelecionada$` para os componentes. |
| **AuthGuard** | Proteger rotas verificando JWT válido via `TokenService`. Redirecionar para `/login` se inválido. |
| **authInterceptor** | Injetar `Bearer token` no header `Authorization` de todas as requisições HTTP. Logout automático em 401. |
| **TokenService** | Armazenar, recuperar e validar o JWT no `sessionStorage`. |

---
