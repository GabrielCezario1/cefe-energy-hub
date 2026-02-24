# Relatório — Frontend do Módulo de Comunicação e Gerência de Parcerias

> **Projeto:** CEFE Energy Hub
>
> **Frontend:** Angular 21 + TypeScript 5.x + Tailwind CSS 3.x
>
> **Padrões de Desenvolvimento:** `regras-projeto-angular.md`
>
> **Backend (referência):** `RELATORIO_Backend_Comunicacao.md`
>
> **Data:** Fevereiro/2026
>
> **⚠️ Pré-requisito:** Os módulos de **Gerenciamento de Energia** e **Monitoramento & Geração** são implementados **antes** deste módulo. Artefatos compartilhados como `environment.ts`, `app.config.ts`, `TokenService`, `AuthService`, `AuthGuard`, `authInterceptor`, `UsinaService` e `IUsina` já existirão. Este relatório indica quais itens devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕).

---

## 1. Visão Geral do Módulo

O módulo de **Comunicação e Gerência de Parcerias** centraliza as informações de contato dos stakeholders do CEFE Energy Hub. Permite visualização, cadastro, edição e remoção de contatos de fornecedores, integradores, fabricantes, concessionárias e prestadores de serviços, organizados em um grid de cards.

| Tela | Rota | Descrição |
| --- | --- | --- |
| **Comunicação e Gerência de Parcerias** | `/dashboard/communication` | Grid de cards com stakeholders. CRUD completo: botão "Novo Contato", edição e exclusão por card. Dialog modal para formulário. AlertDialog para confirmação de exclusão. |

### Restrições de Acesso

- O módulo está disponível para **todas as unidades** (8 usinas cadastradas).
- O usuário deve estar autenticado (JWT válido verificado via `TokenService.isTokenValido()`).
- Rotas protegidas via `AuthGuard` (redireciona para `/login` se JWT inválido).
- Requisições HTTP autenticadas automaticamente pelo `authInterceptor` (`HttpInterceptorFn`) que injeta `Bearer token` no header `Authorization`.
- Os contatos são **globais** — não filtrados por `usinaId`. Todos os usuários autenticados visualizam os mesmos stakeholders.

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
- **Reactive Forms** para formulários de cadastro/edição (centralizados em `formularios/`).
- **Interfaces** com prefixo `I` (ex: `IContato`).
- **Request classes** com sufixo `Request` e propriedades `PascalCase`.
- **Response interfaces** com propriedades `camelCase`.
- Referência completa: `regras-projeto-angular.md`.

---

## 3. Funcionalidades Visuais da Tela

### 3.1 — Header da Tela

| Elemento | Descrição | Estilização Tailwind |
| --- | --- | --- |
| **Título** | "Comunicação e Gerência de Parcerias" | `text-3xl font-bold mb-2` |
| **Subtítulo** | "Centralização de informações dos stakeholders" | `text-muted-foreground` |
| **Botão "Novo Contato"** | Abre dialog de cadastro. Ícone `Plus` à esquerda | `gap-2` (botão primário padrão) |
| **Layout Header** | Título à esquerda, botão à direita | `flex items-start justify-between` |

### 3.2 — Grid de Stakeholders (Cards)

| Dado | Estilização Tailwind | Comportamento |
| --- | --- | --- |
| **Card** | `hover:shadow-lg transition-shadow` | Efeito hover com sombra |
| **Nome (título do card)** | `text-lg` dentro de `CardTitle` | Texto do nome do stakeholder |
| **Botão Editar** | `variant="ghost" size="icon"` `h-7 w-7 text-muted-foreground hover:text-primary` | Ícone `Pencil` (`h-3.5 w-3.5`). Abre dialog de edição preenchido |
| **Botão Remover** | `variant="ghost" size="icon"` `h-7 w-7 text-muted-foreground hover:text-destructive` | Ícone `Trash2` (`h-3.5 w-3.5`). Abre AlertDialog de confirmação |
| **Badge de Função** | `variant="outline"` `w-fit mt-1` | Ex: "Fornecedor de Inversores", "Concessionária - CE" |
| **E-mail** | `flex items-center gap-2 text-sm` | Ícone `Mail` + link `mailto:` com `hover:text-primary truncate` |
| **Telefone** | `flex items-center gap-2 text-sm` | Ícone `Phone` + texto |
| **Botão "Ver Detalhes"** | `variant="outline" size="sm"` `w-full mt-2` | Ícone `ExternalLink`. Sem funcionalidade ainda (planejado) |

- **Layout do Grid:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- **Responsividade:** 1 coluna em mobile, 2 em tablet, 3 em desktop.

> **Fonte dos dados:** Endpoint `GET api/contatos`.

#### Exemplo de Dados (hardcoded atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Grid de Cards | 8 stakeholders pré-definidos | `initialStakeholders` (array inline no componente) |
| Stakeholder 1 | "Deif" / "Fornecedor de Inversores" / contato@deif.com / +55 11 3456-7890 | Hardcoded |
| Stakeholder 2 | "Ynova" / "Integrador" / suporte@ynova.com.br / +55 21 98765-4321 | Hardcoded |
| Stakeholder 3 | "Sungrow" / "Fabricante de Equipamentos" / brasil@sungrow.com / +55 11 2345-6789 | Hardcoded |
| Stakeholder 4 | "Fortlev Solar" / "Estruturas" / comercial@fortlevsolar.com.br / +55 48 3333-4444 | Hardcoded |
| Stakeholder 5 | "Gabriel - TI" / "Empresa de TI" / gabriel@empresa.com / +55 21 99999-8888 | Hardcoded |
| Stakeholder 6 | "Enel Ceará" / "Concessionária - CE" / atendimento@enel.com.br / 0800 123 4567 | Hardcoded |
| Stakeholder 7 | "EDP Espírito Santo" / "Concessionária - ES" / contato@edp.com.br / 0800 765 4321 | Hardcoded |
| Stakeholder 8 | "Light Rio" / "Concessionária - RJ" / suporte@light.com.br / 0800 999 8888 | Hardcoded |

### 3.3 — Dialog de Cadastro / Edição

| Campo | Elemento | Validação Visual |
| --- | --- | --- |
| **Nome** | `Input` com `placeholder="Ex: Empresa Solar Ltda"` | Texto de erro em `text-xs text-destructive` |
| **Função / Papel** | `Input` com `placeholder="Ex: Fornecedor de Inversores"` | Texto de erro em `text-xs text-destructive` |
| **E-mail** | `Input` type="email" com `placeholder="Ex: contato@empresa.com"` | Texto de erro em `text-xs text-destructive` |
| **Telefone** | `Input` com `placeholder="Ex: +55 11 98765-4321"` | Texto de erro em `text-xs text-destructive` |
| **Botão Cancelar** | `variant="outline"` | Fecha o dialog |
| **Botão Salvar** | Botão primário. Texto: "Adicionar Contato" (inserção) ou "Salvar Alterações" (edição) | Submete o formulário |

- **Dialog:** `sm:max-w-md`
- **Título dinâmico:** "Novo Contato" (inserção) ou "Editar Contato" (edição)
- **Layout de campos:** `grid gap-4 py-2` com cada campo em `grid gap-1.5`
- **Footer:** `gap-2` com Cancelar + Salvar

> **Fonte dos dados (edição):** Dados do contato selecionado preenchem o formulário.
> **Destino dos dados:** Endpoints `POST api/contatos` (inserção) e `PUT api/contatos` (edição).

### 3.4 — AlertDialog de Exclusão

| Elemento | Conteúdo | Estilização Tailwind |
| --- | --- | --- |
| **Título** | "Remover contato" | — |
| **Descrição** | "Tem certeza que deseja remover este contato? Esta ação não pode ser desfeita." | — |
| **Botão Cancelar** | Texto "Cancelar" | Estilo padrão |
| **Botão Remover** | Texto "Remover" | `bg-destructive text-destructive-foreground hover:bg-destructive/90` |

> **Destino dos dados:** Endpoint `DELETE api/contatos/{id}`.

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
> - `models/responses/paginacao.response.ts` (`PaginacaoResponse<T>`) — ✅ já existe (M&G)
> - `environments/environment.ts` e `environment.prod.ts` — ✅ já existem (GE)
> - `app.config.ts` — ✅ já configurado (GE)
> - `formularios/` — ✅ já existe (GE). 🔄 Adicionar configuração para formulário de contato.
>
> A árvore abaixo mostra a estrutura completa. Criar apenas os itens novos.

```
src/app/
├── pages/
│   └── comunicacao/
│       └── comunicacao.component.ts        ← page standalone (orquestra CRUD)
├── components/
│   └── comunicacao/
│       ├── contato-card/
│       │   ├── contato-card.component.ts
│       │   └── contato-card.component.html
│       └── contato-form-dialog/
│           ├── contato-form-dialog.component.ts
│           └── contato-form-dialog.component.html
├── services/
│   ├── contato.service.ts                  ← HttpClient para api/contatos
│   └── usina.service.ts                    ← ✅ já existe (GE)
├── models/
│   ├── responses/
│   │   ├── contato.response.ts             ← IContato
│   │   └── paginacao.response.ts           ← ✅ já existe (M&G)
│   └── requests/
│       ├── contatos-inserir.request.ts
│       ├── contatos-editar.request.ts
│       └── contatos-listar.request.ts
├── formularios/
│   └── contato.formulario.ts               ← config Reactive Form para contato
├── guards/
│   └── auth.guard.ts                       ← ✅ já existe (GE)
├── interceptors/
│   └── auth.interceptor.ts                 ← ✅ já existe (GE)
├── core/
│   ├── token.service.ts                    ← ✅ já existe (GE)
│   └── auth.service.ts                     ← ✅ já existe (GE)
└── environments/
    ├── environment.ts                      ← ✅ já existe (GE)
    └── environment.prod.ts                 ← ✅ já existe (GE)
```

---

## 5. Serviços Angular

### 5.1 — ContatoService

Serviço responsável por consumir todos os endpoints CRUD da API de Contatos.

```typescript
// src/app/services/contato.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IContato } from '../models/responses/contato.response';
import { PaginacaoResponse } from '../models/responses/paginacao.response';
import { ContatosInserirRequest } from '../models/requests/contatos-inserir.request';
import { ContatosEditarRequest } from '../models/requests/contatos-editar.request';
import { ContatosListarRequest } from '../models/requests/contatos-listar.request';

@Injectable({ providedIn: 'root' })
export class ContatoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + '/contatos';

  listar(req?: ContatosListarRequest): Observable<PaginacaoResponse<IContato>> {
    return this.http.get<PaginacaoResponse<IContato>>(this.baseUrl, {
      params: req as any
    });
  }

  recuperar(id: number): Observable<IContato> {
    return this.http.get<IContato>(`${this.baseUrl}/${id}`);
  }

  inserir(req: ContatosInserirRequest): Observable<IContato> {
    return this.http.post<IContato>(this.baseUrl, req);
  }

  editar(req: ContatosEditarRequest): Observable<IContato> {
    return this.http.put<IContato>(this.baseUrl, req);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

## 6. Models (Interfaces)

### 6.1 — Interfaces de Response

```typescript
// src/app/models/responses/contato.response.ts
export interface IContato {
  id: number;
  nome: string;
  funcao: string;
  email: string;
  telefone: string;
  dataCriacao: string;              // ISO 8601
}
```

### 6.2 — Interfaces Auxiliares

> **Nota de reuso:** A interface `PaginacaoResponse<T>` **já existe** (criada no M&G em `models/responses/paginacao.response.ts`). **Reutilizar diretamente.**

```typescript
// src/app/models/responses/paginacao.response.ts — ✅ JÁ EXISTE (M&G)
export interface PaginacaoResponse<T> {
  registros: T[];
  total: number;
}
```

### 6.3 — Classes de Request

```typescript
// src/app/models/requests/contatos-inserir.request.ts
export class ContatosInserirRequest {
  Nome: string;
  Funcao: string;
  Email: string;
  Telefone: string;

  constructor(nome: string, funcao: string, email: string, telefone: string) {
    this.Nome = nome;
    this.Funcao = funcao;
    this.Email = email;
    this.Telefone = telefone;
  }
}

// src/app/models/requests/contatos-editar.request.ts
export class ContatosEditarRequest {
  Id: number;
  Nome?: string;
  Funcao?: string;
  Email?: string;
  Telefone?: string;

  constructor(id: number) {
    this.Id = id;
  }
}

// src/app/models/requests/contatos-listar.request.ts
export class ContatosListarRequest {
  Nome?: string;
  Funcao?: string;
  Pg?: number;
  Qt?: number;
}
```

> **Convenção:** Propriedades de Request usam `PascalCase` (para compatibilidade com DTOs do backend .NET). Propriedades de Response usam `camelCase` (padrão JSON retornado pela API). Referência: `regras-projeto-angular.md`.

---

## 7. Integração com a API

### 7.1 — Endpoints Consumidos

| Endpoint | Método HTTP | Serviço Angular | Response Interface |
| --- | --- | --- | --- |
| `api/contatos` | GET | `listar()` | `PaginacaoResponse<IContato>` |
| `api/contatos/{id}` | GET | `recuperar(id)` | `IContato` |
| `api/contatos` | POST | `inserir(req)` | `IContato` |
| `api/contatos` | PUT | `editar(req)` | `IContato` |
| `api/contatos/{id}` | DELETE | `excluir(id)` | `void` |

> **Nota:** Todos os endpoints requerem JWT no header `Authorization`. O `authInterceptor` injeta automaticamente.

### 7.2 — Integração Externa

Este módulo **não consome APIs externas** diretamente. Todos os dados são gerenciados internamente pelo CEFE Energy Hub.

---

## 8. Autenticação e Autorização

> **✅ TODA ESTA SEÇÃO JÁ EXISTE (criada no módulo Gerenciamento de Energia).** Os artefatos `AuthGuard`, `authInterceptor` e a configuração do `app.config.ts` com `provideHttpClient(withInterceptors([authInterceptor]))` já foram implementados. O código abaixo é mantido apenas como **referência** — **não recriar nenhum destes artefatos.** Apenas verificar se a rota `/dashboard/communication` está no `app.routes.ts`.

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

---

## 9. Fluxo de Dados no Frontend

```
┌────────────────────────────────────────────────────────────┐
│              Tela: Comunicação e Parcerias                 │
│         ComunicacaoComponent (page standalone)             │
│                                                            │
│  ngOnInit() → carregarContatos()                           │
│  criarContato() → ContatoService.inserir()                 │
│  editarContato() → ContatoService.editar()                 │
│  excluirContato() → ContatoService.excluir()               │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ ContatoService (5 métodos CRUD)
                     ▼
┌────────────────────────────────────────────────────────────┐
│              ContatoService                                │
│                                                            │
│  listar() ───────────────────→ Grid de Cards               │
│  recuperar(id) ──────────────→ Detalhes (futuro)           │
│  inserir(req) ───────────────→ Adicionar Card              │
│  editar(req) ────────────────→ Atualizar Card              │
│  excluir(id) ────────────────→ Remover Card                │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ HttpClient (com authInterceptor)
                     ▼
┌────────────────────────────────────────────────────────────┐
│              .NET 10 Web API                               │
│           api/contatos (CRUD)                              │
│        (JWT obrigatório no header)                         │
└────────────────────────────────────────────────────────────┘
```

---

## 10. Checklist de Implementação

### 10.1 — Estrutura Base
- [x] ✅ ~~Criar `environment.ts` e `environment.prod.ts` com `apiBaseUrl`~~ — já existem (GE)
- [x] ✅ ~~Configurar `provideHttpClient(withInterceptors([authInterceptor]))` em `app.config.ts`~~ — já configurado (GE)
- [ ] 🔄 **Verificar** rota `/dashboard/communication` apontando para `ComunicacaoComponent` com `authGuard` no `app.routes.ts`

### 10.2 — Models
- [ ] 🆕 `IContato` em `models/responses/contato.response.ts`
- [x] ✅ ~~`PaginacaoResponse<T>` em `models/responses/paginacao.response.ts`~~ — já existe (M&G)
- [ ] 🆕 `ContatosInserirRequest` em `models/requests/contatos-inserir.request.ts`
- [ ] 🆕 `ContatosEditarRequest` em `models/requests/contatos-editar.request.ts`
- [ ] 🆕 `ContatosListarRequest` em `models/requests/contatos-listar.request.ts`

### 10.3 — Serviços
- [ ] 🆕 `ContatoService` em `services/contato.service.ts` (5 métodos CRUD)
- [x] ✅ ~~`UsinaService` em `services/usina.service.ts`~~ — já existe (GE). Não utilizado diretamente neste módulo (contatos são globais).

### 10.4 — Autenticação — ✅ TODOS JÁ EXISTEM (GE)
- [x] ✅ ~~`TokenService` em `core/token.service.ts`~~ — já existe (GE)
- [x] ✅ ~~`AuthService` em `core/auth.service.ts`~~ — já existe (GE)
- [x] ✅ ~~`authGuard` em `guards/auth.guard.ts`~~ — já existe (GE)
- [x] ✅ ~~`authInterceptor` em `interceptors/auth.interceptor.ts`~~ — já existe (GE)

### 10.5 — Formulários
- [ ] 🆕 `CONTATO_FORM_CONFIG` em `formularios/contato.formulario.ts` — Reactive Form com campos: `nome`, `funcao`, `email`, `telefone`. Validações: required para todos, email válido.

### 10.6 — Componentes
- [ ] 🆕 `ComunicacaoComponent` (page standalone) em `pages/comunicacao/`
  - Carrega lista de contatos via `ContatoService.listar()`
  - Orquestra CRUD (inserir, editar, excluir)
  - Gerencia estados: `carregando`, `erro`, `dialogAberto`, `editandoId`, `excluindoId`
  - Distribui dados para componentes filhos via `@Input()`
- [ ] 🆕 `ContatoCardComponent` em `components/comunicacao/contato-card/`
  - Inputs: `contato: IContato`
  - Outputs: `editar: EventEmitter<IContato>`, `excluir: EventEmitter<number>`
  - Exibe: nome, função (badge), e-mail (link mailto), telefone, botões editar/remover
- [ ] 🆕 `ContatoFormDialogComponent` em `components/comunicacao/contato-form-dialog/`
  - Inputs: `aberto: boolean`, `contato?: IContato` (preenchido se edição)
  - Outputs: `salvar: EventEmitter<ContatosInserirRequest | ContatosEditarRequest>`, `cancelar: EventEmitter<void>`
  - Reactive Form com validação e mensagens de erro

### 10.7 — Tratamento de Erros
- [ ] Implementar `obterMensagemErro()` conforme padrão `regras-projeto-angular.md`
- [ ] Tratar erro de rede / API indisponível com mensagem amigável (ngx-toastr)
- [ ] Tratar JWT expirado (redirecionar para `/login` via interceptor)
- [ ] Feedback visual de sucesso após inserir/editar/excluir (ngx-toastr)

---

## 11. Resumo de Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| **ComunicacaoComponent (page)** | Orquestrar a tela. Carregar lista de contatos. Gerenciar estados do CRUD (inserção, edição, exclusão). Distribuir dados para componentes filhos. |
| **ContatoCardComponent** | Exibir um card de stakeholder com nome, função (badge), e-mail, telefone e botões de ação (editar/remover). Componente reutilizável. Emite eventos para o parent. |
| **ContatoFormDialogComponent** | Renderizar o dialog modal com Reactive Form para cadastro/edição de contato. Validação de campos obrigatórios. Emite evento de salvar/cancelar para o parent. |
| **ContatoService** | Consumir os 5 endpoints CRUD da API via `HttpClient`. Retornar `Observable<T>` tipados. |
| **AuthGuard** | Proteger rotas verificando JWT válido via `TokenService`. Redirecionar para `/login` se inválido. |
| **authInterceptor** | Injetar `Bearer token` no header `Authorization` de todas as requisições HTTP. |
| **TokenService** | Armazenar, recuperar e validar o JWT no `localStorage` / `sessionStorage`. |

---

## 12. Funcionalidades Pendentes / Planejadas

| Funcionalidade | Descrição | Status |
| --- | --- | --- |
| **Detalhes do Contato** | Tela expandida com histórico de interações, documentos anexos e notas. Botão "Ver Detalhes" já existe nos cards. | Planejado |
| **Filtros e Busca** | Campo de busca por nome e filtro por função/papel (dropdown). | Planejado |
| **Categorização** | Agrupamento visual por tipo (Fornecedores, Concessionárias, Integradores). | Planejado |
| **Importação em Lote** | Upload de CSV/Excel com contatos para cadastro em massa. | Planejado |
| **Exportação** | Download de lista de contatos em PDF ou Excel. | Planejado |
| **Permissões de Escrita** | Restringir inserção/edição/exclusão apenas para perfis de administrador. | Planejado |
