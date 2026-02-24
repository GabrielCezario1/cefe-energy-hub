****# Relatório — Frontend do Módulo de Monitoramento & Geração

> **Projeto:** CEFE Energy Hub
>
> **Frontend:** Angular 21 + TypeScript 5.x + Tailwind CSS 3.x
>
> **Padrões de Desenvolvimento:** `regras-projeto-angular.md`
>
> **Backend (referência):** `RELATORIO_Backend_MonitoramentoGeracao.md`
>
> **Data:** Fevereiro/2026
>
> **⚠️ Pré-requisito:** O módulo de **Gerenciamento de Energia** é implementado **antes** deste módulo. Artefatos compartilhados como `environment.ts`, `app.config.ts`, `TokenService`, `AuthService`, `AuthGuard`, `authInterceptor`, `UsinaService` e `IUsina` já existirão. Este relatório indica quais itens devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕).

---

## 1. Visão Geral do Módulo

O módulo de **Monitoramento & Geração** é a tela principal do dashboard. Exibe, em tempo real, os indicadores de geração de energia fotovoltaica da usina selecionada, a curva de geração das últimas 24 horas, alertas proativos e informações técnicas da unidade.

| Tela | Rota | Descrição |
| --- | --- | --- |
| **Monitoramento & Geração** | `/dashboard` | KPIs de geração (atual, diária, Performance Ratio, status), curva de geração 24h, alertas proativos, informações técnicas e dados ambientais (irradiação, temperatura) |

### Restrições de Acesso

- O módulo está disponível para **todas as unidades** (8 usinas cadastradas).
- O usuário deve estar autenticado (JWT válido verificado via `TokenService.isTokenValido()`).
- O usuário deve ter uma unidade selecionada via `UsinaService` (`usinaSelecionada$`).
- Se nenhuma unidade está selecionada, exibe mensagem: "Selecione uma unidade para visualizar os dados".
- Rotas protegidas via `AuthGuard` (redireciona para `/login` se JWT inválido).
- Requisições HTTP autenticadas automaticamente pelo `authInterceptor` (`HttpInterceptorFn`) que injeta `Bearer token` no header `Authorization`.
- Todas as requisições devem incluir o `usinaId` (id da unidade/usina) para filtrar os dados.

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
- **Interfaces** com prefixo `I` (ex: `IMonitoramentoResumo`).
- **Request classes** com sufixo `Request` e propriedades `PascalCase`.
- **Response interfaces** com propriedades `camelCase`.
- Referência completa: `regras-projeto-angular.md`.

---

## 3. Funcionalidades Visuais da Tela

### 3.1 — KPIs Primários (4 cards)

| KPI | Dados Exibidos | Alerta Visual |
| --- | --- | --- |
| **Geração Atual (kW)** | Valor em kW + `% da capacidade` (ex: "87% da capacidade") | Borda lateral colorida conforme faixa de capacidade |
| **Geração Diária (kWh)** | Valor em kWh + comparativo com dia anterior: `+X% vs. ontem` | Borda lateral colorida conforme variação |
| **Performance Ratio (%)** | Percentual + texto qualitativo: "Ótimo" (≥80%), "Bom" (≥65%), "Baixo" (<65%) | Borda lateral colorida conforme classificação |
| **Status do Sistema** | Badge com texto: "OK", "Atenção" ou "Crítico" | Badge colorido via Tailwind: `bg-green-500 text-white` (OK), `bg-yellow-500 text-white` (Atenção), `bg-red-500 text-white` (Crítico). Borda lateral colorida |

> **Fonte dos dados:** Endpoint `GET api/monitoramento/resumo?usinaId={usinaId}`.

#### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| KPI "Geração Atual" | 1.847 kW, 87% da capacidade | Hardcoded |
| KPI "Geração Diária" | 12.458 kWh, +15% vs. ontem | Hardcoded |
| KPI "Performance Ratio" | 85.3%, "Performance ótimo" | Hardcoded |
| KPI "Status do Sistema" | Badge "OK" | Hardcoded |

### 3.2 — Gráfico: Curva de Geração (últimas 24h)

- **Tipo:** Line Chart.
- **Eixo X:** Horário (HH:mm) — intervalos de 15 minutos ou agrupados por hora.
- **Eixo Y:** Potência (kW).
- **Comportamento:** Atualiza ao selecionar outra unidade via `UsinaService` (`usinaSelecionada$`). Assina o Observable e faz nova requisição com `usinaId` diferente.

> **Fonte dos dados:** Endpoint `GET api/monitoramento/curva-geracao?usinaId={usinaId}`.

#### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Gráfico Curva de Geração | 11 pontos (00:00 a 22:00) × potência (kW) | Array `generationData` inline |

### 3.3 — Alertas Proativos (lista)

| Campo | Descrição | Estilização Tailwind |
| --- | --- | --- |
| **Título** | Nome do alerta (ex: "Alta Temperatura - Inversor 1") | — |
| **Descrição** | Detalhe (ex: "Temperatura acima de 65°C detectada") | — |
| **Severidade** | Alto / Médio / Info | Badge: `bg-red-500 text-white` (Alto), `bg-yellow-500 text-white` (Médio), `bg-gray-400 text-white` (Info) |
| **Background do Card** | — | Card com fundo vermelho (Alto), amarelo/laranja (Médio), cinza (Info) |

- **Comportamento:** Filtrados por `usinaId` e `status = Ativo`. Ordenação: mais recentes primeiro, priorizando severidade.
- **Origem:** Tabela `AlertaMonitoramento` no backend, alimentada exclusivamente pelo Job de Coleta de Alertas da API ProjectSwitch.

> **Fonte dos dados:** Endpoint `GET api/monitoramento/alertas?usinaId={usinaId}`.

#### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Alertas Proativos | 3 alertas fixos (Alto, Médio, Info) | Template inline |

### 3.4 — Informações Técnicas (card lateral)

| Dado | Fonte |
| --- | --- |
| **Potência Instalada** | Cadastro da usina (`potenciaInstalada` / `potenciaInstaladaKwp`) |
| **Localização** | Cadastro da usina (`localizacao + estado`) |
| **Data de Instalação** | Cadastro da usina (`dataInstalacao`) |
| **Irradiação Atual (W/m²)** | Última leitura do sensor de irradiação |
| **Temperatura Ambiente (°C)** | Última leitura do sensor de temperatura |

> **Fonte dos dados:** Endpoints `GET api/monitoramento/informacoes-tecnicas?usinaId={usinaId}` e `GET api/monitoramento/dados-ambientais?usinaId={usinaId}`.

#### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Informações Técnicas | Potência Instalada, Localização, Data Instalação | `usinaService.usinaSelecionada$` |
| Irradiação Atual | 847 W/m² | Hardcoded |
| Temperatura Ambiente | 28°C | Hardcoded |

---

## 4. Estrutura de Pastas Angular

> Conforme padrões em `regras-projeto-angular.md`.
>
> **⚠️ Itens já existentes (criados no módulo Gerenciamento de Energia):**
> - `guards/auth.guard.ts` — ✅ já existe (GE)
> - `interceptors/auth.interceptor.ts` — ✅ já existe (GE)
> - `core/token.service.ts` e `core/auth.service.ts` — ✅ já existem (GE)
> - `services/usina.service.ts` — ✅ já existe (GE)
> - `models/usina.model.ts` (`IUsina`) — ✅ já existe (GE) com campos idênticos
> - `environments/environment.ts` e `environment.prod.ts` — ✅ já existem (GE)
> - `app.config.ts` (com `provideHttpClient`, `withInterceptors`, `provideRouter`) — ✅ já configurado (GE) — 🔄 adicionar rota `/dashboard`
>
> A árvore abaixo mostra a estrutura completa. Criar apenas os itens novos (pasta `monitoramento/`, `MonitoramentoService`, models de Monitoramento).

```
src/app/
├── pages/
│   └── dashboard/
│       └── dashboard.component.ts      ← page standalone (orquestra componentes)
├── components/
│   └── monitoramento/
│       ├── kpi-card/
│       │   ├── kpi-card.component.ts
│       │   └── kpi-card.component.html
│       ├── curva-geracao-chart/
│       │   ├── curva-geracao-chart.component.ts
│       │   └── curva-geracao-chart.component.html
│       ├── alertas-lista/
│       │   ├── alertas-lista.component.ts
│       │   └── alertas-lista.component.html
│       └── informacoes-tecnicas/
│           ├── informacoes-tecnicas.component.ts
│           └── informacoes-tecnicas.component.html
├── services/
│   ├── monitoramento.service.ts        ← HttpClient para api/monitoramento/*
│   └── usina.service.ts                ← BehaviorSubject com usina selecionada
├── models/
│   ├── responses/
│   │   ├── monitoramento-resumo.response.ts
│   │   ├── curva-geracao.response.ts
│   │   ├── curva-geracao-ponto.response.ts
│   │   ├── monitoramento-alerta.response.ts
│   │   ├── informacoes-tecnicas.response.ts
│   │   └── dados-ambientais.response.ts
│   └── requests/
│       ├── monitoramento-resumo.request.ts
│       ├── monitoramento-curva-geracao.request.ts
│       └── monitoramento-alertas-listar.request.ts
├── guards/
│   └── auth.guard.ts                   ← CanActivateFn com TokenService
├── interceptors/
│   └── auth.interceptor.ts             ← HttpInterceptorFn com Bearer token
├── core/
│   ├── token.service.ts                ← armazenar/verificar JWT
│   └── auth.service.ts                 ← login/logout
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

---

## 5. Serviços Angular

### 5.1 — MonitoramentoService

Serviço responsável por consumir todos os endpoints da API de Monitoramento.

```typescript
// src/app/services/monitoramento.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MonitoramentoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + '/monitoramento';

  recuperarResumo(usinaId: number): Observable<IMonitoramentoResumo> {
    return this.http.get<IMonitoramentoResumo>(`${this.baseUrl}/resumo`, {
      params: { usinaId }
    });
  }

  recuperarCurvaGeracao(usinaId: number): Observable<ICurvaGeracao> {
    return this.http.get<ICurvaGeracao>(`${this.baseUrl}/curva-geracao`, {
      params: { usinaId }
    });
  }

  listarAlertas(usinaId: number): Observable<PaginacaoResponse<IAlertaMonitoramento>> {
    return this.http.get<PaginacaoResponse<IAlertaMonitoramento>>(`${this.baseUrl}/alertas`, {
      params: { usinaId }
    });
  }

  recuperarInformacoesTecnicas(usinaId: number): Observable<IInformacoesTecnicas> {
    return this.http.get<IInformacoesTecnicas>(`${this.baseUrl}/informacoes-tecnicas`, {
      params: { usinaId }
    });
  }

  recuperarDadosAmbientais(usinaId: number): Observable<IDadosAmbientais> {
    return this.http.get<IDadosAmbientais>(`${this.baseUrl}/dados-ambientais`, {
      params: { usinaId }
    });
  }
}
```

### 5.2 — UsinaService (Gerenciamento de Estado) — ✅ JÁ EXISTE (GE)

> Este serviço **já existe** (criado no módulo Gerenciamento de Energia). **Reutilizar diretamente** — não recriar. O código abaixo é mantido apenas para referência.

Serviço responsável por manter a usina selecionada em memória via `BehaviorSubject`. Todos os componentes que dependem da usina assinam `usinaSelecionada$` e reagem a mudanças.

```typescript
// src/app/services/usina.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

> **Padrão:** O `DashboardComponent` (page) assina `usinaSelecionada$` e, a cada mudança, chama os métodos do `MonitoramentoService` passando o novo `usinaId`.

---

## 6. Models (Interfaces)

### 6.1 — Interfaces de Response

```typescript
// src/app/models/responses/monitoramento-resumo.response.ts
export interface IMonitoramentoResumo {
  geracaoAtualKw: number;
  percentualCapacidade: number;
  geracaoDiariaKwh: number;
  variacaoDiaAnteriorPercent: number;
  performanceRatioPercent: number;
  performanceRatioClassificacao: string;   // "Otimo", "Bom", "Baixo"
  statusSistema: string;                   // "OK", "Atencao", "Critico"
  quantidadeAlertasCriticos: number;
  quantidadeAlertasMedios: number;
}

// src/app/models/responses/curva-geracao.response.ts
export interface ICurvaGeracao {
  pontos: ICurvaGeracaoPonto[];
}

// src/app/models/responses/curva-geracao-ponto.response.ts
export interface ICurvaGeracaoPonto {
  horario: string;        // "HH:mm"
  potenciaKw: number;
}

// src/app/models/responses/monitoramento-alerta.response.ts
export interface IAlertaMonitoramento {
  id: number;
  idExternoProjectSwitch: string;
  titulo: string;
  descricao: string;
  severidade: string;                    // "Alto", "Medio", "Info"
  equipamento: string;
  idEquipamentoProjectSwitch: number;
  status: string;                        // "Ativo", "Resolvido"
  visto: boolean;
  dataOcorrencia: string;
  dataResolucao: string | null;
  dataSincronizacao: string;
}

// src/app/models/responses/informacoes-tecnicas.response.ts
export interface IInformacoesTecnicas {
  potenciaInstalada: string;             // "2.5 MWp"
  potenciaInstaladaKwp: number;
  localizacao: string;
  estado: string;
  dataInstalacao: string;
  irradiacaoAtualWm2: number;
  temperaturaAmbienteC: number;
}

// src/app/models/responses/dados-ambientais.response.ts
export interface IDadosAmbientais {
  irradiacaoWm2: number;
  temperaturaAmbienteC: number;
  temperaturaInversorC: number;
  dataLeitura: string;
}
```

### 6.2 — Interfaces Auxiliares

> **Nota de reuso:** A interface `IUsina` **já existe** (criada no GE em `models/usina.model.ts`) com campos idênticos. **Reutilizar diretamente.** A interface `PaginacaoResponse<T>` é **nova** (🆕) — criar para suportar endpoints paginados de alertas.

```typescript
// src/app/models/responses/paginacao.response.ts
export interface PaginacaoResponse<T> {
  registros: T[];
  total: number;
}

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
// src/app/models/requests/monitoramento-resumo.request.ts
export class MonitoramentoResumoRequest {
  UsinaId: number;

  constructor(usinaId: number) {
    this.UsinaId = usinaId;
  }
}

// src/app/models/requests/monitoramento-alertas-listar.request.ts
export class MonitoramentoAlertasListarRequest {
  UsinaId: number;
  Severidade?: string;
  ApenasAtivos?: boolean;
  Pagina?: number;
  TamanhoPagina?: number;

  constructor(usinaId: number) {
    this.UsinaId = usinaId;
  }
}
```

> **Convenção:** Propriedades de Request usam `PascalCase` (para compatibilidade com DTOs do backend .NET). Propriedades de Response usam `camelCase` (padrão JSON retornado pela API). Referência: `regras-projeto-angular.md`.

---

## 7. Integração com a API

### 7.1 — Endpoints Consumidos

| Endpoint | Método HTTP | Serviço Angular | Response Interface |
| --- | --- | --- | --- |
| `api/monitoramento/resumo?usinaId={id}` | GET | `recuperarResumo()` | `IMonitoramentoResumo` |
| `api/monitoramento/curva-geracao?usinaId={id}` | GET | `recuperarCurvaGeracao()` | `ICurvaGeracao` |
| `api/monitoramento/alertas?usinaId={id}` | GET | `listarAlertas()` | `PaginacaoResponse<IAlertaMonitoramento>` |
| `api/monitoramento/informacoes-tecnicas?usinaId={id}` | GET | `recuperarInformacoesTecnicas()` | `IInformacoesTecnicas` |
| `api/monitoramento/dados-ambientais?usinaId={id}` | GET | `recuperarDadosAmbientais()` | `IDadosAmbientais` |

> **Nota:** Todos os endpoints requerem JWT no header `Authorization`. O `authInterceptor` injeta automaticamente.
> Alertas são **somente leitura** — não há endpoints de inserção ou edição manual.

### 7.2 — Integração Externa (ProjectSwitch)

A API ProjectSwitch (Nortebox) é consumida exclusivamente pelo **backend** via Jobs. O frontend **não** acessa a API ProjectSwitch diretamente.

| Integração | Tipo | Descrição |
| --- | --- | --- |
| **API ProjectSwitch (Nortebox)** | REST API (Bearer Token) | Fonte única para leituras e alarmes de equipamentos. Consumida pelo backend. |

---

## 8. Autenticação e Autorização

> **✅ TODA ESTA SEÇÃO JÁ EXISTE (criada no módulo Gerenciamento de Energia).** Os artefatos `AuthGuard`, `authInterceptor` e a configuração do `app.config.ts` com `provideHttpClient(withInterceptors([authInterceptor]))` já foram implementados. O código abaixo é mantido apenas como **referência** — **não recriar nenhum destes artefatos.** Apenas 🔄 **adicionar** a rota `/dashboard` ao `app.routes.ts` existente.

### 8.1 — AuthGuard — ✅ JÁ EXISTE (GE)

```typescript
// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../core/token.service';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isTokenValido()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

### 8.2 — AuthInterceptor — ✅ JÁ EXISTE (GE)

```typescript
// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../core/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.obterToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
```

### 8.3 — Configuração no App — ✅ JÁ EXISTE (GE) — 🔄 apenas adicionar rota `/dashboard`

```typescript
// src/app/app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};
```

---

## 9. Fluxo de Dados no Frontend

```
┌────────────────────────────────────────────────────────────┐
│                  Seleção de Unidade                        │
│              UsinaService.selecionarUsina()                │
│         usinaSelecionada$ (BehaviorSubject)                │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ subscribe (DashboardComponent)
                     ▼
┌────────────────────────────────────────────────────────────┐
│              MonitoramentoService                          │
│                                                            │
│  recuperarResumo(usinaId) ───────────→ KPI Cards           │
│  recuperarCurvaGeracao(usinaId) ─────→ Gráfico Linha       │
│  listarAlertas(usinaId) ────────────→ Lista Alertas        │
│  recuperarInformacoesTecnicas(usinaId) → Card Info Técnica  │
│  recuperarDadosAmbientais(usinaId) ──→ Card Info Técnica   │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ HttpClient (com authInterceptor)
                     ▼
┌────────────────────────────────────────────────────────────┐
│              .NET 10 Web API                               │
│           api/monitoramento/*                              │
│        (JWT obrigatório no header)                         │
└────────────────────────────────────────────────────────────┘
```

---

## 10. Checklist de Implementação

### 10.1 — Estrutura Base
- [x] ✅ ~~Criar `environment.ts` e `environment.prod.ts` com `apiBaseUrl`~~ — já existem (GE)
- [x] ✅ ~~Configurar `provideHttpClient(withInterceptors([authInterceptor]))` em `app.config.ts`~~ — já configurado (GE)
- [ ] 🔄 **Adicionar** rota `/dashboard` apontando para `DashboardComponent` com `authGuard` ao `app.routes.ts` existente

### 10.2 — Models
- [ ] `IMonitoramentoResumo` em `models/responses/monitoramento-resumo.response.ts`
- [ ] `ICurvaGeracao` em `models/responses/curva-geracao.response.ts`
- [ ] `ICurvaGeracaoPonto` em `models/responses/curva-geracao-ponto.response.ts`
- [ ] `IAlertaMonitoramento` em `models/responses/monitoramento-alerta.response.ts`
- [ ] `IInformacoesTecnicas` em `models/responses/informacoes-tecnicas.response.ts`
- [ ] `IDadosAmbientais` em `models/responses/dados-ambientais.response.ts`
- [ ] 🆕 `PaginacaoResponse<T>` em `models/responses/paginacao.response.ts`
- [x] ✅ ~~`IUsina` em `models/usina.model.ts`~~ — já existe (GE) com campos idênticos. **Reutilizar.**
- [ ] `MonitoramentoResumoRequest` em `models/requests/monitoramento-resumo.request.ts`
- [ ] `MonitoramentoAlertasListarRequest` em `models/requests/monitoramento-alertas-listar.request.ts`

### 10.3 — Serviços
- [ ] 🆕 `MonitoramentoService` em `services/monitoramento.service.ts` (5 métodos)
- [x] ✅ ~~`UsinaService` em `services/usina.service.ts`~~ — já existe (GE). **Reutilizar diretamente.**

### 10.4 — Autenticação — ✅ TODOS JÁ EXISTEM (GE)

> Todos os artefatos de autenticação foram criados no módulo Gerenciamento de Energia. **Reutilizar diretamente.**

- [x] ✅ ~~`TokenService` em `core/token.service.ts`~~ — já existe (GE)
- [x] ✅ ~~`AuthService` em `core/auth.service.ts`~~ — já existe (GE)
- [x] ✅ ~~`authGuard` em `guards/auth.guard.ts`~~ — já existe (GE)
- [x] ✅ ~~`authInterceptor` em `interceptors/auth.interceptor.ts`~~ — já existe (GE)

### 10.5 — Componentes
- [ ] `DashboardComponent` (page standalone) em `pages/dashboard/`
  - Assina `usinaSelecionada$`
  - Orquestra chamadas ao `MonitoramentoService`
  - Distribui dados para componentes filhos via `@Input()`
- [ ] `KpiCardComponent` em `components/monitoramento/kpi-card/`
  - Recebe: título, valor, descrição, cor da borda
  - Estilização: Tailwind utility classes, borda lateral colorida
- [ ] `CurvaGeracaoChartComponent` em `components/monitoramento/curva-geracao-chart/`
  - Recebe: array de pontos (`ICurvaGeracaoPonto[]`)
  - Renderiza: Line Chart (eixo X = horário, eixo Y = potência kW)
- [ ] `AlertasListaComponent` em `components/monitoramento/alertas-lista/`
  - Recebe: array de alertas (`IAlertaMonitoramento[]`)
  - Estilização: badges Tailwind por severidade, cards com fundo colorido
- [ ] `InformacoesTecnicasComponent` em `components/monitoramento/informacoes-tecnicas/`
  - Recebe: dados técnicos (`IInformacoesTecnicas`) + dados ambientais (`IDadosAmbientais`)
  - Exibe: Potência Instalada, Localização, Data Instalação, Irradiação, Temperatura

### 10.6 — Tratamento de Erros
- [ ] Implementar `obterMensagemErro()` conforme padrão `regras-projeto-angular.md`
- [ ] Tratar erro de rede / API indisponível com mensagem amigável
- [ ] Tratar JWT expirado (redirecionar para `/login` via interceptor)

---

## 11. Resumo de Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| **DashboardComponent (page)** | Orquestrar a tela. Assinar `usinaSelecionada$`. Chamar `MonitoramentoService` para cada dado. Distribuir dados para componentes filhos. |
| **KpiCardComponent** | Exibir um card de KPI com título, valor, descrição e borda lateral colorida. Componente reutilizável. |
| **CurvaGeracaoChartComponent** | Renderizar o Line Chart com a curva de geração das últimas 24h. |
| **AlertasListaComponent** | Renderizar a lista de alertas com badges coloridos por severidade e cards com fundo colorido. |
| **InformacoesTecnicasComponent** | Exibir card lateral com dados técnicos da usina e dados ambientais em tempo real. |
| **MonitoramentoService** | Consumir os 5 endpoints da API via `HttpClient`. Retornar `Observable<T>` tipados. |
| **UsinaService** | Manter a usina selecionada em `BehaviorSubject`. Expor `usinaSelecionada$` para os componentes. |
| **AuthGuard** | Proteger rotas verificando JWT válido via `TokenService`. Redirecionar para `/login` se inválido. |
| **authInterceptor** | Injetar `Bearer token` no header `Authorization` de todas as requisições HTTP. |
| **TokenService** | Armazenar, recuperar e validar o JWT no `localStorage` / `sessionStorage`. |

---

## 12. Funcionalidades Pendentes / Planejadas

Os dados da tela de **Telemetria & Diagnóstico** (`/dashboard/telemetry`) complementam este módulo e exibem dados de rede (tensão, frequência) e log de eventos que podem ser integrados futuramente. A tela de **Gestão Zero Grid** (`/dashboard/zero-grid`) exibe dados de bateria e distribuição de energia por fonte que representam uma expansão natural deste módulo.
