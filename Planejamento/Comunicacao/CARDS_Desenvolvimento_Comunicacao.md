# Cards de Desenvolvimento — Módulo Comunicação e Gerência de Parcerias

> **Projeto:** CEFE Energy Hub
>
> **Fontes:** `RELATORIO_Backend_Comunicacao.md` e `RELATORIO_Frontend_Comunicacao.md`
>
> **Padrões Backend:** pasta `padroes-desenvolvimento-back-end/`
>
> **Padrões Frontend:** arquivo `regras-projeto-angular.md`
>
> **Data:** Fevereiro/2026
>
> **⚠️ Pré-requisito:** Os módulos de **Gerenciamento de Energia** e **Monitoramento & Geração** são implementados **antes** deste módulo. Muitos artefatos compartilhados (RepositorioBase, AppDbContext, IoC, autenticação, environments, etc.) já existirão. Este documento indica quais cards devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕). O tempo estimado já reflete o reuso.

---

## 🔵 Fase 1 — Fundação (Banco de Dados + Entidades)

> Criar toda a base de dados antes de qualquer lógica. Sem banco, nada funciona.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` (entidades, comandos, interfaces de repositório), `PADROES_DE_DESENVOLVIMENTO-INFRA.md` (mapeamentos EF Core, RepositorioBase, AppDbContext, Migrations), `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (DTOs Request/Response).

### 1.1 — Entidade do Domínio

- [ ] **1.1.1 — 🆕 Criar entidade `Contato`** ⏱️ `1.5h` — Campos: `Id` (int, PK, auto-increment), `Nome` (string, max 255, required), `Funcao` (string, max 255, required), `Email` (string, max 255, required), `Telefone` (string, max 50, required), `DataCriacao` (DateTime, required, default = DateTime.UtcNow). Construtor público: `Contato(string nome, string funcao, string email, string telefone)` — chama todos os métodos Set e define `DataCriacao = DateTime.UtcNow`. Construtor vazio protegido: `protected Contato() { }` (obrigatório para EF Core). Métodos: `SetNome(string)` — valida vazio e max 255; `SetFuncao(string)` — valida vazio e max 255; `SetEmail(string)` — valida vazio e max 255; `SetTelefone(string)` — valida vazio e max 50. Todas as validações com `RegraDeNegocioExcecao`.

### 1.2 — Interface de Repositório (Domínio)

- [ ] **1.2.1 — 🆕 Criar interface `IContatosRepositorio`** ⏱️ `0.5h` — Em `Contatos/Repositorios/`. Herda de `IRepositorioNHibernate<Contato>`. Sem métodos adicionais (os métodos CRUD vêm do `RepositorioBase`). Seguir `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`.

### 1.3 — Comandos do Domínio

- [ ] **1.3.1 — 🆕 Criar comandos** ⏱️ `0.5h` — Seguir padrão de comandos conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`:
  - `ContatosInserirComando` — campos: Nome (string), Funcao (string), Email (string), Telefone (string)
  - `ContatosEditarComando` — campos: Id (int), Nome (string?), Funcao (string?), Email (string?), Telefone (string?)

### 1.4 — DTOs (DataTransfer)

- [ ] **1.4.1 — 🆕 Criar Request DTOs** ⏱️ `0.5h` — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (SEM DataAnnotations):
  - `ContatosInserirRequest` — campos: Nome (string), Funcao (string), Email (string), Telefone (string)
  - `ContatosEditarRequest` — campos: Id (int), Nome (string?), Funcao (string?), Email (string?), Telefone (string?)
  - `ContatosListarRequest` herda `PaginacaoFiltro` — campos adicionais: Nome (string?), Funcao (string?)

- [ ] **1.4.2 — 🆕 Criar Response DTO** ⏱️ `0.5h` — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md`:
  - `ContatoResponse` — campos: Id (int), Nome (string), Funcao (string), Email (string), Telefone (string), DataCriacao (DateTime)

### 1.5 — Infraestrutura (EF Core)

- [ ] **1.5.1 — 🆕 Criar mapeamento EF Core** ⏱️ `1h` — Implementar `IEntityTypeConfiguration<Contato>` conforme `PADROES_DE_DESENVOLVIMENTO-INFRA.md`. Arquivo `ContatoConfiguration.cs` em `Contatos/Mapeamentos/`. Tabela `contatos`. Mapeamentos: `id` (PK, auto-increment), `nome` (max 255, required), `funcao` (max 255, required), `email` (max 255, required), `telefone` (max 50, required), `data_criacao` (required). Sem índices adicionais (volume baixo).

- [ ] **1.5.2 — 🔄 Registrar DbSet no AppDbContext** ⏱️ `0.25h` — Adicionar ao `AppDbContext` **existente**: `DbSet<Contato> Contatos { get; set; }`. O `OnModelCreating` já usa `ApplyConfigurationsFromAssembly` (configurado nos módulos anteriores).

- [ ] **1.5.3 — 🆕 Implementar repositório** ⏱️ `0.5h` — `ContatosRepositorio : RepositorioBase<Contato>, IContatosRepositorio` em `Contatos/Repositorios/`. Herda todos os métodos do `RepositorioBase`. Sem métodos adicionais para este módulo.

- [ ] **1.5.4 — 🆕 Criar Migration** ⏱️ `0.5h` — `dotnet ef migrations add AdicionarTabelaContatos --project <Projeto>.Infra --startup-project <Projeto>.Api`. Migration **incremental** (banco já existe dos módulos anteriores). Criar tabela `contatos` com colunas mapeadas. Revisar SQL gerado, aplicar com `dotnet ef database update`.

> **Subtotal Fase 1: ⏱️ 5.75h (~0.75 dia)**

---

## 🟢 Fase 2 — Regras de Negócio (Services / Domain)

> Criar a lógica de CRUD isolada antes de expor em APIs.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` (serviços e interfaces), `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md` (AppServicos, AutoMapper Profiles), `PADROES_DE_DESENVOLVIMENTO-IOC.md` (registro no IoC).

### 2.1 — Serviço de Domínio

- [ ] **2.1.1 — 🆕 Criar `IContatosServicos` e `ContatosServicos`** ⏱️ `3h` — Interface em `Contatos/Servicos/Interfaces/`, implementação em `Contatos/Servicos/`. Injetar `IContatosRepositorio`. Métodos:
  - `Inserir(ContatosInserirComando comando)` → cria nova entidade `Contato` via construtor público, chama `_contatosRepositorio.Inserir(entidade)`, retorna entidade.
  - `Editar(ContatosEditarComando comando)` → valida existência via `Validar(id)`, chama `SetNome/SetFuncao/SetEmail/SetTelefone` apenas para campos não-nulos, chama `_contatosRepositorio.Editar(entidade)`, retorna entidade.
  - `Excluir(int id)` → valida existência via `Validar(id)`, chama `_contatosRepositorio.Excluir(entidade)`.
  - `Recuperar(int id)` → valida existência via `Validar(id)`, retorna entidade.
  - `Listar(ContatosListarRequest request)` → consulta via `Query()`, aplica filtros (Nome, Funcao) e paginação, retorna `PaginacaoConsulta<Contato>`.
  - Método privado `Validar(int id)` → recupera entidade, chama `ValidarRegistroNaoFoiEncontrado("Contato não encontrado")`.

### 2.2 — Serviço de Aplicação

- [ ] **2.2.1 — 🆕 Criar `IContatosAppServico` e `ContatosAppServico`** ⏱️ `2h` — Seguir `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md`. Injetar `IContatosServicos`, `IMapper`, `IUnitOfWork`. Métodos:
  - `InserirAsync(ContatosInserirRequest request)` → mapeia Request → Comando via AutoMapper, chama `_contatosServicos.Inserir(comando)`, mapeia Entidade → Response, retorna `ContatoResponse`. Usa UnitOfWork (Begin/Commit/Rollback).
  - `EditarAsync(ContatosEditarRequest request)` → idem com `Editar`. Usa UnitOfWork.
  - `ExcluirAsync(int id, int usuarioId)` → chama `_contatosServicos.Excluir(id)`. Usa UnitOfWork.
  - `Recuperar(int id)` → chama `_contatosServicos.Recuperar(id)`, retorna `ContatoResponse`.
  - `Listar(ContatosListarRequest request)` → chama `_contatosServicos.Listar(request)`, retorna `PaginacaoConsulta<ContatoResponse>`.

- [ ] **2.2.2 — 🆕 Criar `ContatosProfile` (AutoMapper)** ⏱️ `0.5h` — Profile em `Aplicacao/Contatos/Profiles/`. Mapeamentos:
  - `ContatosInserirRequest → ContatosInserirComando`
  - `ContatosEditarRequest → ContatosEditarComando`
  - `Contato → ContatoResponse`

### 2.3 — Registro no IoC

- [ ] **2.3.1 — 🔄 Adicionar registros ao IoC existente** ⏱️ `0.25h` — Arquivos de IoC **já existem** (criados nos módulos anteriores). Apenas adicionar novos registros:
  - `ConfiguracoesInjecoesDependencia.cs`: **adicionar** `IContatosRepositorio → ContatosRepositorio`, `IContatosServicos → ContatosServicos`, `IContatosAppServico → ContatosAppServico`
  - `ConfiguracoesAutoMapper.cs`: **adicionar** `ContatosProfile`

> **Subtotal Fase 2: ⏱️ 5.75h (~0.75 dia)**

---

## 🟡 Fase 3 — Jobs de Coleta (WebJobs / Webhooks)

> **Este módulo NÃO possui jobs de coleta.** Os dados são inseridos manualmente pelos usuários.
> Diferente dos módulos de Monitoramento e Telemetria, não há integrações externas ou processos automáticos.

- Nenhuma task nesta fase.

> **Subtotal Fase 3: ⏱️ 0h**

---

## 🔴 Fase 4 — API Endpoints (Controllers)

> As APIs expõem o CRUD de contatos. Dependem das Fases 1 e 2.
> Seguir `PADROES_DE_DESENVOLVIMENTO-API.md` (rotas, verbos, retornos) e `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (DTOs).

- [ ] **4.1 — 🆕 Criar `ContatosController`** ⏱️ `3h` — Em `Controllers/Contatos/ContatosController.cs`. Atributos: `[Route("api/contatos")]`, `[ApiController]`, `[Authorize]`. Injetar `IContatosAppServico`. Endpoints:

  - `[HttpGet]` → `Listar([FromQuery] ContatosListarRequest request)` → retorna `PaginacaoConsulta<ContatoResponse>` com listagem paginada. Filtros opcionais: Nome, Funcao.
  
  - `[HttpGet("{id}")]` → `Recuperar(int id)` → retorna `ContatoResponse` com dados de um contato específico.
  
  - `[HttpPost]` → `Inserir([FromBody] ContatosInserirRequest request)` → retorna `ContatoResponse` com o novo contato criado.
  
  - `[HttpPut]` → `Editar([FromBody] ContatosEditarRequest request)` → retorna `ContatoResponse` com o contato atualizado.
  
  - `[HttpDelete("{id}")]` → `Excluir(int id)` → valida claims JWT (`ClaimTypes.NameIdentifier`), chama `ExcluirAsync(id, userId)`, retorna `Ok()`.

  Todos os endpoints validam JWT. Delegar toda lógica para `IContatosAppServico`. Nunca retornar entidades diretamente — sempre DTOs Response.

> **Subtotal Fase 4: ⏱️ 3h (~0.5 dia)**

---

## 🟣 Fase 5 — Infraestrutura Azure

> A infraestrutura Azure (App Service, SQL Server) já existe dos módulos anteriores. Este módulo apenas adiciona uma migration incremental.

- [ ] **5.1 — 🔄 Aplicar Migration no Azure SQL Database** ⏱️ `0.5h` — `dotnet ef database update` apontando para o banco Azure. Verificar que a tabela `contatos` foi criada corretamente. Nenhum recurso Azure adicional é necessário (sem jobs, sem blob storage).

- [ ] **5.2 — 🔄 Seed de Dados Iniciais** ⏱️ `0.5h` — (Opcional) Inserir os 8 stakeholders iniciais via script SQL ou seed no EF Core. Dados: Deif, Ynova, Sungrow, Fortlev Solar, Gabriel - TI, Enel Ceará, EDP Espírito Santo, Light Rio.

> **Subtotal Fase 5: ⏱️ 1h (~0.125 dia)**

---

## ⚪ Fase 6 — Frontend Angular

> Frontend em Angular 21 com Tailwind CSS. Seguir integralmente os padrões de `regras-projeto-angular.md` e as definições do `RELATORIO_Frontend_Comunicacao.md`.

### 6.1 — Scaffold e Configuração

- [x] ✅ ~~**6.1.1 — Configurar environment**~~ ⏱️ `0h` — **Já existe** (criado nos módulos anteriores).

- [ ] **6.1.2 — 🔄 Verificar rota `/dashboard/communication`** ⏱️ `0.25h` — Verificar que a rota já está no `app.routes.ts` apontando para `ComunicacaoComponent` com `canActivate: [authGuard]`.

### 6.2 — Models (Tipagem)

- [ ] **6.2.1 — 🆕 Criar interface de Response** ⏱️ `0.25h` — Seguir `regras-projeto-angular.md` (interfaces com prefixo `I`, propriedades `camelCase`). Em `models/responses/`:
  - `IContato` (id: number, nome: string, funcao: string, email: string, telefone: string, dataCriacao: string)

- [ ] **6.2.2 — 🆕 Criar classes de Request** ⏱️ `0.5h` — Seguir `regras-projeto-angular.md` (classes com sufixo `Request`, propriedades `PascalCase`). Em `models/requests/`:
  - `ContatosInserirRequest` (Nome: string, Funcao: string, Email: string, Telefone: string)
  - `ContatosEditarRequest` (Id: number, Nome?: string, Funcao?: string, Email?: string, Telefone?: string)
  - `ContatosListarRequest` (Nome?: string, Funcao?: string, Pg?: number, Qt?: number)

### 6.3 — Serviços

- [ ] **6.3.1 — 🆕 Criar `ContatoService`** ⏱️ `1.5h` — Em `services/contato.service.ts`. Seguir `regras-projeto-angular.md` (`inject(HttpClient)`, `providedIn: 'root'`, URL via `environment.apiBaseUrl`). 5 métodos:
  - `listar(req?: ContatosListarRequest): Observable<PaginacaoResponse<IContato>>`
  - `recuperar(id: number): Observable<IContato>`
  - `inserir(req: ContatosInserirRequest): Observable<IContato>`
  - `editar(req: ContatosEditarRequest): Observable<IContato>`
  - `excluir(id: number): Observable<void>`

### 6.4 — Formulários

- [ ] **6.4.1 — 🆕 Criar configuração de formulário** ⏱️ `0.5h` — Em `formularios/contato.formulario.ts`. `CONTATO_FORM_CONFIG` com campos: `nome` (required), `funcao` (required), `email` (required, Validators.email), `telefone` (required). Seguir padrão centralizado de formulários conforme `regras-projeto-angular.md`.

### 6.5 — Componentes

- [ ] **6.5.1 — 🆕 Criar `ComunicacaoComponent` (page)** ⏱️ `4h` — Em `pages/comunicacao/comunicacao.component.ts`. Standalone. Page que orquestra todo o CRUD. Responsabilidades:
  - `ngOnInit()`: chamar `ContatoService.listar()` para carregar lista de contatos
  - Gerenciar estados: `contatos: IContato[]`, `carregando: boolean`, `erro: string | null`, `dialogAberto: boolean`, `editandoContato: IContato | null`, `excluindoId: number | null`, `confirmacaoAberta: boolean`
  - `criarContato()`: abre dialog vazio. Ao salvar: `ContatoService.inserir()` → toast de sucesso → recarregar lista
  - `editarContato(contato)`: abre dialog preenchido. Ao salvar: `ContatoService.editar()` → toast de sucesso → recarregar lista
  - `excluirContato(id)`: abre AlertDialog de confirmação. Ao confirmar: `ContatoService.excluir()` → toast de sucesso → recarregar lista
  - Tratamento de erros com `obterMensagemErro()` + ngx-toastr
  - Layout: header com título + botão "Novo Contato", grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

- [ ] **6.5.2 — 🆕 Criar `ContatoCardComponent`** ⏱️ `2h` — Em `components/comunicacao/contato-card/`. Standalone, reutilizável. Input: `contato: IContato`. Outputs: `editar: EventEmitter<IContato>`, `excluir: EventEmitter<number>`. Template: card com `hover:shadow-lg transition-shadow`. Header com nome + botões editar (ícone `Pencil`, `h-7 w-7 text-muted-foreground hover:text-primary`) e remover (ícone `Trash2`, `h-7 w-7 text-muted-foreground hover:text-destructive`). Badge de função (`variant="outline"`, `w-fit mt-1`). E-mail com ícone `Mail` + link `mailto:`. Telefone com ícone `Phone`. Botão "Ver Detalhes" (`variant="outline" size="sm"`, `w-full mt-2`, desabilitado/sem ação).

- [ ] **6.5.3 — 🆕 Criar `ContatoFormDialogComponent`** ⏱️ `3h` — Em `components/comunicacao/contato-form-dialog/`. Standalone. Inputs: `aberto: boolean`, `contato?: IContato` (para edição). Outputs: `salvar: EventEmitter`, `cancelar: EventEmitter`. Reactive Form usando `FormService.construirFormulario(CONTATO_FORM_CONFIG)`. Dialog com `sm:max-w-md`. Título dinâmico: "Novo Contato" ou "Editar Contato". 4 campos com labels, inputs e mensagens de erro (`text-xs text-destructive`). Footer: botão "Cancelar" (`variant="outline"`) + botão "Adicionar Contato" / "Salvar Alterações". Validação no `enviar()` com `markAllAsTouched()`.

### 6.6 — Qualidade e Finalização

- [ ] **6.6.1 — Implementar tratamento de erros** ⏱️ `1h` — Implementar `obterMensagemErro()` seguindo padrão `regras-projeto-angular.md`. Toasts de sucesso (inserir/editar/excluir) e erro (API indisponível, validação backend). Tratar JWT expirado (redirecionar para `/login`).

- [ ] **6.6.2 — Implementar loading states** ⏱️ `0.5h` — Flag `carregando: boolean` no `ComunicacaoComponent`. Enquanto `carregando = true`, exibir skeleton/spinner no grid. Flag `enviando: boolean` no `ContatoFormDialogComponent` para desabilitar botão de salvar.

- [ ] **6.6.3 — Responsividade** ⏱️ `0.5h` — Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`. Dialog responsivo: `sm:max-w-md`. Testar em desktop, tablet e mobile.

- [ ] **6.6.4 — Testes unitários** ⏱️ `2h` — Testar:
  - `ContatoService` (mock `HttpClient`, validar URLs e params para cada endpoint)
  - `ContatoCardComponent` (inputs renderizam nome, função, e-mail e telefone. Outputs emitem eventos corretos)
  - `ContatoFormDialogComponent` (validação de campos obrigatórios, submit com dados válidos)
  - `ComunicacaoComponent` (chama `ContatoService.listar()` no init, gerencia CRUD)

> **Subtotal Fase 6: ⏱️ 16h (~2 dias)**

---

## 📊 Resumo Total de Esforço

| Fase | Horas | Dias (úteis, 8h/dia) | Observação |
|---|---|---|---|
| 🔵 Fase 1 — Banco de Dados + Entidades | 5.75h | ~0.75 dia | Módulo simples — 1 entidade, CRUD básico |
| 🟢 Fase 2 — Regras de Negócio | 5.75h | ~0.75 dia | CRUD + paginação + validações |
| 🟡 Fase 3 — Jobs de Coleta | 0h | — | Sem jobs (dados manuais) |
| 🔴 Fase 4 — API Endpoints | 3h | ~0.5 dia | 1 controller com 5 endpoints CRUD |
| 🟣 Fase 5 — Infraestrutura Azure | 1h | ~0.125 dia | Apenas migration + seed opcional |
| ⚪ Fase 6 — Frontend Angular | 16h | ~2 dias | 3 componentes + service + models + testes |
| **TOTAL** | **31.5h** | **~4 dias úteis (~1 semana)** | |

### Observações

- **Paralelismo possível:** Fase 5 (Azure) pode ser executada em paralelo com Fases 1–2. Fase 6 (Frontend) pode iniciar após Fase 4 (API pronta) — ou antes, usando dados mock (como no estado atual da aplicação React).
- **Menor risco:** Este módulo é puramente CRUD, sem integrações externas, jobs de coleta ou cálculos complexos. O risco principal é a migração do estado local (React) para persistência em banco de dados.
- **Sem dependência externa:** Diferente dos módulos de Monitoramento e Telemetria, este módulo não depende da API ProjectSwitch ou qualquer serviço externo.
- **Volume de dados:** Tabela `contatos` com baixíssimo volume (~8 registros iniciais, crescimento estimado de 2-5 por mês). Sem necessidade de índices adicionais ou particionamento.
- **Economia com reuso:** A infraestrutura base (RepositorioBase, AppDbContext, IoC, autenticação JWT, environment, guards, interceptors) já existe dos módulos anteriores. O esforço é focado na feature específica de contatos.
