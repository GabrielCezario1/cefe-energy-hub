# Cards de Desenvolvimento — Módulo de Gestão Financeira

> **Projeto:** CEFE Energy Hub
>
> **Módulo:** Gestão Financeira & Econômica
>
> **Data:** Fevereiro/2026
>
> **Referência:** `RELATORIO_Backend_GestaoFinanceira.md` + `RELATORIO_Frontend_GestaoFinanceira.md`
>
> **Premissas:**
> - Módulos anteriores (Gerenciamento de Energia + Monitoramento & Geração) já implementados.
> - Entidades `Usina`, `LeituraInversor`, `GeracaoDiaria` já existem e são reutilizadas.
> - Jobs de coleta de dados (`GeracaoDiaria`) já funcionam via Monitoramento & Geração.
> - Artefatos compartilhados de autenticação Angular já existem.
> - Sem novos jobs neste módulo — dados de geração vêm de jobs existentes.

---

## Estimativa Total

| Fase | Descrição | ⏱️ Estimativa |
| --- | --- | --- |
| **Fase 1** | Fundação — Entidades + DTOs + EF Core + Migration | 4h |
| **Fase 2** | Regras de Negócio — Serviços de Domínio e Aplicação | 6h |
| **Fase 3** | Jobs de Background | ♻️ 0h (reutiliza `GeracaoDiaria`) |
| **Fase 4** | API — Controller e Endpoints | 3h |
| **Fase 5** | Infraestrutura Azure | 1h |
| **Fase 6** | Frontend Angular | 8h |
| **Total** | | **22h** |

---

## Fase 1 — Fundação

> **Objetivo:** Criar as novas entidades de domínio, DTOs e configurar o EF Core para persistência.
>
> **⏱️ Estimativa total: 4h**

---

### CARD 1.1 — Entidade `TarifaEnergia`

**Tipo:** Backend — Domínio
**⏱️ Estimativa:** 1h

**Descrição:**
Criar a entidade de domínio `TarifaEnergia` que armazena o valor da tarifa de energia elétrica (R$/kWh) e seu período de vigência. Cada tarifa pertence a uma `Usina` e possui data de início obrigatória e data de fim opcional (quando aberta, é a tarifa vigente).

**Arquivo:** `src/Dominio/Entidades/TarifaEnergia.cs`

**Propriedades:**
- `Id` (int, PK, identity)
- `UsinaId` (int, FK → Usina)
- `ValorKwh` (decimal(10,4), required)
- `DataVigenciaInicio` (DateOnly, required)
- `DataVigenciaFim` (DateOnly?, nullable)
- `Observacao` (string?, max 500)
- `DataCriacao` (DateTimeOffset, required)

**Critérios de Aceite:**
- [ ] Entidade criada com todos os campos especificados
- [ ] Propriedade de navegação `Usina` configurada
- [ ] Construtor protegido sem parâmetros (para EF Core)
- [ ] Construtor com parâmetros obrigatórios para criação programática

---

### CARD 1.2 — Entidade `InvestimentoUsina`

**Tipo:** Backend — Domínio
**⏱️ Estimativa:** 1h

**Descrição:**
Criar a entidade de domínio `InvestimentoUsina` que registra o custo total de implantação da usina solar. Cada `Usina` possui no máximo um investimento registrado. O valor é usado para calcular o payback e o ROI.

**Arquivo:** `src/Dominio/Entidades/InvestimentoUsina.cs`

**Propriedades:**
- `Id` (int, PK, identity)
- `UsinaId` (int, FK → Usina, Unique Index)
- `ValorTotal` (decimal(18,2), required)
- `DataInvestimento` (DateOnly, required)
- `Descricao` (string?, max 500)
- `DataCriacao` (DateTimeOffset, required)
- `DataAtualizacao` (DateTimeOffset, required)

**Critérios de Aceite:**
- [ ] Entidade criada com todos os campos especificados
- [ ] Propriedade de navegação `Usina` configurada
- [ ] Construtor protegido sem parâmetros (para EF Core)
- [ ] Índice único em `UsinaId` (máximo 1 investimento por usina)

---

### CARD 1.3 — DTOs de Request e Response

**Tipo:** Backend — DataTransfer
**⏱️ Estimativa:** 1h

**Descrição:**
Criar todos os DTOs do módulo de Gestão Financeira seguindo o padrão da camada `DataTransfer`.

**Arquivo base:** `src/DataTransfer/GestaoFinanceira/`

**DTOs de Response (criar):**
- `GestaoFinanceiraKpisResponse` — economiaAcumuladaBrl, economiaMesAtualBrl, variacaoMesAnteriorPercent, paybackRestanteMeses, paybackTotalMeses, paybackAtingido, configuracaoPendente
- `RentabilidadeMensalItemResponse` — mes (string), economiaKwh, economiaBrl
- `GestaoFinanceiraRentabilidadeResponse` — meses (List)
- `ProjecaoPaybackPontoResponse` — mes (int), investimento, recuperado
- `GestaoFinanceiraProjecaoPaybackResponse` — valorInvestimento, mediaEconomiaMensalBrl, paybackTotalMeses, pontos (List)
- `InvestimentoUsinaResponse` — id, valorTotal, dataInvestimento, descricao
- `TarifaEnergiaResponse` — id, valorKwh, dataVigenciaInicio, dataVigenciaFim, observacao
- `GestaoFinanceiraDadosInvestimentoResponse` — investimento, tarifaVigente, roiAnualPercent, configuracaoPendente

**DTOs de Request (criar):**
- `TarifaInserirRequest` — UsinaId, ValorKwh, DataVigenciaInicio, Observacao?
- `TarifaEditarRequest` — Id, ValorKwh, DataVigenciaInicio, Observacao?
- `InvestimentoInserirRequest` — UsinaId, ValorTotal, DataInvestimento, Descricao?
- `InvestimentoEditarRequest` — Id, ValorTotal, DataInvestimento, Descricao?
- `GestaoFinanceiraKpisRequest` — UsinaId
- `GestaoFinanceiraRentabilidadeRequest` — UsinaId, Ano?
- `GestaoFinanceiraProjecaoPaybackRequest` — UsinaId
- `GestaoFinanceiraDadosInvestimentoRequest` — UsinaId

**Critérios de Aceite:**
- [ ] Todos os DTOs criados na pasta `DataTransfer/GestaoFinanceira/`
- [ ] DTOs de Request com DataAnnotations de validação (`[Required]`, `[Range]`, `[MaxLength]`)
- [ ] DTOs de Response com propriedades `camelCase` compatíveis com JSON serialization
- [ ] Sem lógica de negócio nos DTOs

---

### CARD 1.4 — EF Core: Configurações e Migration

**Tipo:** Backend — Infra
**⏱️ Estimativa:** 1h

**Descrição:**
Criar as configurações do EF Core para as novas entidades e aplicar a migration ao banco de dados.

**Arquivos:**
- `src/Infra/Configuracoes/TarifaEnergiaConfiguracao.cs`
- `src/Infra/Configuracoes/InvestimentoUsinaConfiguracao.cs`

**Configurações `TarifaEnergia`:**
- Tabela: `TarifaEnergia`
- `ValorKwh`: `HasColumnType("decimal(10,4)")`
- `DataVigenciaFim`: opcional (nullable)
- `Observacao`: `HasMaxLength(500)`
- FK → `Usina` com `OnDelete(DeleteBehavior.Restrict)`
- Índice composto: `(UsinaId, DataVigenciaInicio)` para consultas de vigência

**Configurações `InvestimentoUsina`:**
- Tabela: `InvestimentoUsina`
- `ValorTotal`: `HasColumnType("decimal(18,2)")`
- `Descricao`: `HasMaxLength(500)`
- FK → `Usina` com `OnDelete(DeleteBehavior.Restrict)`
- Índice único: `(UsinaId)` — apenas 1 investimento por usina

**Critérios de Aceite:**
- [ ] Configurações registradas no `DbContext`
- [ ] Migration gerada sem erros
- [ ] Migration aplicada em ambiente de desenvolvimento
- [ ] Tabelas criadas corretamente verificadas via SQL Server Management Studio ou `dotnet ef`

---

## Fase 2 — Regras de Negócio

> **Objetivo:** Implementar os serviços de domínio (vigência de tarifas, unicidade de investimento) e o serviço de aplicação com os cálculos financeiros.
>
> **⏱️ Estimativa total: 6h**

---

### CARD 2.1 — Serviço de Domínio: `TarifaEnergiaServico`

**Tipo:** Backend — Domínio
**⏱️ Estimativa:** 2h

**Descrição:**
Implementar as regras de negócio de vigência das tarifas. Ao inserir uma nova tarifa, o serviço deve automaticamente encerrar (definir `DataVigenciaFim`) da tarifa anterior aberta. Deve garantir que nunca haja mais de uma tarifa com `DataVigenciaFim = null` por usina simultaneamente.

**Arquivo:** `src/Dominio/Servicos/TarifaEnergiaServico.cs`

**Métodos:**
- `InserirTarifa(TarifaInserirRequest req)` — cria nova tarifa; fecha a vigente anterior definindo `DataVigenciaFim = req.DataVigenciaInicio - 1 dia`
- `EditarTarifa(TarifaEditarRequest req)` — edita a tarifa pelo Id; valida que existe
- `ObterTarifaVigenteAsync(int usinaId)` — retorna tarifa com `DataVigenciaFim = null`
- `ObterTarifaParaMesAsync(int usinaId, int ano, int mes)` — retorna a tarifa válida para um mês específico (histórico)

**Regra de vigência histórica:**
```
Para o mês (ano, mes), a tarifa válida é aquela onde:
DataVigenciaInicio <= primeiro dia do mês
AND (DataVigenciaFim IS NULL OR DataVigenciaFim >= último dia do mês)
```

**Critérios de Aceite:**
- [ ] Ao inserir nova tarifa, a tarifa anterior tem `DataVigenciaFim` preenchida
- [ ] `ObterTarifaVigenteAsync` retorna null se nenhuma tarifa cadastrada
- [ ] `ObterTarifaParaMesAsync` retorna a tarifa correta para meses históricos
- [ ] Testes unitários para os 3 cenários de vigência (inserir → fecha anterior, busca vigente, busca histórica)

---

### CARD 2.2 — Serviço de Domínio: `InvestimentoUsinaServico`

**Tipo:** Backend — Domínio
**⏱️ Estimativa:** 1h

**Descrição:**
Implementar as regras de negócio para o investimento da usina. Garantir que cada usina possui no máximo um investimento registrado.

**Arquivo:** `src/Dominio/Servicos/InvestimentoUsinaServico.cs`

**Métodos:**
- `InserirInvestimento(InvestimentoInserirRequest req)` — cria investimento; retorna BadRequest se já existir um para a usina
- `EditarInvestimento(InvestimentoEditarRequest req)` — edita investimento pelo Id; valida que existe
- `ObterInvestimentoAsync(int usinaId)` — retorna o investimento da usina ou null

**Critérios de Aceite:**
- [ ] Tentativa de inserir segundo investimento para a mesma usina retorna erro (status 400)
- [ ] `ObterInvestimentoAsync` retorna null se nenhum investimento cadastrado
- [ ] Edição não altera o `UsinaId` do investimento (imutável)

---

### CARD 2.3 — Serviço de Aplicação: `GestaoFinanceiraAppServico`

**Tipo:** Backend — Aplicação
**⏱️ Estimativa:** 3h

**Descrição:**
Implementar o serviço de aplicação central do módulo, responsável pelos cálculos financeiros e composição dos responses para o controller.

**Arquivo:** `src/Aplicacao/Servicos/GestaoFinanceiraAppServico.cs`

**Métodos e Lógica:**

`ObterKpisAsync(GestaoFinanceiraKpisRequest req)` → `GestaoFinanceiraKpisResponse`
- Verifica se tarifa e investimento estão configurados → `configuracaoPendente`
- Busca todos os `GeracaoDiaria` agrupados por mês desde `Usina.DataInstalacao`
- Para cada mês: busca tarifa histórica via `TarifaEnergiaServico.ObterTarifaParaMesAsync()`
- Calcula `economiaBrl = energiaGeradaKwh * valorKwh`
- `economiaAcumuladaBrl` = soma de todos os meses
- `economiaMesAtualBrl` = economia do mês corrente
- `variacaoMesAnteriorPercent` = `((mesAtual - mesAnterior) / mesAnterior) * 100`
- `paybackTotalMeses` = `ceil(valorInvestimento / avgEconomiaMensal)`
- `paybackRestanteMeses` = `max(0, paybackTotalMeses - mesesDecorridos)`

`ObterRentabilidadeMensalAsync(GestaoFinanceiraRentabilidadeRequest req)` → `GestaoFinanceiraRentabilidadeResponse`
- Agrupa `GeracaoDiaria` por mês no ano solicitado (default: ano corrente)
- Aplica tarifa histórica para cada mês
- Retorna lista de `RentabilidadeMensalItemResponse`

`ObterProjecaoPaybackAsync(GestaoFinanceiraProjecaoPaybackRequest req)` → `GestaoFinanceiraProjecaoPaybackResponse`
- Calcula `avgEconomiaMensalBrl` (média dos últimos 12 meses com dados)
- Gera pontos de 12 em 12 meses até `paybackTotalMeses + 12` (para mostrar além do payback)
- Ponto de cruzamento = mês onde recuperado >= investimento

`ObterDadosInvestimentoAsync(GestaoFinanceiraDadosInvestimentoRequest req)` → `GestaoFinanceiraDadosInvestimentoResponse`
- Busca `InvestimentoUsina` e `TarifaEnergia` vigente da usina
- Calcula `roiAnualPercent = (avgEconomiaMensalBrl * 12 / valorTotal) * 100`
- Retorna `configuracaoPendente = true` se qualquer um for null

**Critérios de Aceite:**
- [ ] `ObterKpisAsync` retorna `configuracaoPendente: true` quando tarifa ou investimento ausentes
- [ ] Tarifa histórica correta aplicada para cada mês (usando `ObterTarifaParaMesAsync`)
- [ ] Retroatividade começa em `Usina.DataInstalacao` (não antes)
- [ ] Meses sem geração retornam `economiaKwh = 0` e `economiaBrl = 0` (não omitidos)
- [ ] `paybackRestanteMeses` nunca retorna valor negativo (usa `max(0, ...)`)
- [ ] `roiAnualPercent` calculado com base na economia média dos últimos 12 meses

---

## Fase 3 — Jobs de Background

> **⚠️ Nenhum job novo neste módulo.**
>
> Os dados de geração (`GeracaoDiaria`) já são coletados e persistidos pelos jobs implementados no módulo **Monitoramento & Geração**. O módulo de Gestão Financeira consome `GeracaoDiaria` diretamente via repositório — sem novos Hangfire jobs.
>
> **⏱️ Estimativa: 0h**

| Dado | Origem | Job Responsável |
| --- | --- | --- |
| Energia gerada por dia (kWh) | `GeracaoDiaria` | ♻️ `AtualizarGeracaoDiariaJob` (Monitoramento & Geração) |
| Usina e data de instalação | `Usina` | ♻️ Cadastro manual (Gerenciamento de Energia) |

---

## Fase 4 — API

> **Objetivo:** Implementar o controller com os 8 endpoints do módulo.
>
> **⏱️ Estimativa total: 3h**

---

### CARD 4.1 — Controller: `GestaoFinanceiraController`

**Tipo:** Backend — API
**⏱️ Estimativa:** 3h

**Descrição:**
Implementar o controller REST com os 8 endpoints do módulo de Gestão Financeira. Todos os endpoints requerem autenticação JWT (`[Authorize]`).

**Arquivo:** `src/Api/Controllers/GestaoFinanceiraController.cs`

**Endpoints:**

| Método | Rota | Action | Parâmetros |
| --- | --- | --- | --- |
| GET | `/api/gestao-financeira/kpis` | `ObterKpis` | `[FromQuery] GestaoFinanceiraKpisRequest` |
| GET | `/api/gestao-financeira/rentabilidade-mensal` | `ObterRentabilidadeMensal` | `[FromQuery] GestaoFinanceiraRentabilidadeRequest` |
| GET | `/api/gestao-financeira/projecao-payback` | `ObterProjecaoPayback` | `[FromQuery] GestaoFinanceiraProjecaoPaybackRequest` |
| GET | `/api/gestao-financeira/dados-investimento` | `ObterDadosInvestimento` | `[FromQuery] GestaoFinanceiraDadosInvestimentoRequest` |
| POST | `/api/gestao-financeira/tarifas` | `InserirTarifa` | `[FromBody] TarifaInserirRequest` |
| PUT | `/api/gestao-financeira/tarifas/{id}` | `EditarTarifa` | `id` + `[FromBody] TarifaEditarRequest` |
| POST | `/api/gestao-financeira/investimentos` | `InserirInvestimento` | `[FromBody] InvestimentoInserirRequest` |
| PUT | `/api/gestao-financeira/investimentos/{id}` | `EditarInvestimento` | `id` + `[FromBody] InvestimentoEditarRequest` |

**Critérios de Aceite:**
- [ ] Todos os endpoints retornam `200 OK` com response tipado em sucesso
- [ ] `[Authorize]` aplicado na classe (nível de controller)
- [ ] Validação de `ModelState` com `BadRequest` em falha de validação
- [ ] `InserirTarifa` retorna `201 Created` com `Location` header
- [ ] `InserirInvestimento` retorna `201 Created` com `Location` header
- [ ] `POST /investimentos` retorna `400 Bad Request` se usina já tem investimento
- [ ] Swagger/Scalar documentado com exemplos de request e response
- [ ] Tratamento de exceções via middleware global (nenhum try-catch no controller)

---

## Fase 5 — Infraestrutura Azure

> **Objetivo:** Configurações mínimas de infraestrutura (sem novos serviços Azure necessários).
>
> **⏱️ Estimativa total: 1h**

---

### CARD 5.1 — Configurações Azure / Ambiente

**Tipo:** Infra
**⏱️ Estimativa:** 1h

**Descrição:**
Verificar e ajustar as configurações de ambiente para suportar o módulo de Gestão Financeira. Nenhum novo serviço Azure é necessário (sem novos jobs, sem novo armazenamento).

**Checklist:**
- [ ] Verificar que a connection string do SQL Server está atualizada após a migration
- [ ] Confirmar que o App Service (API) tem permissão de acesso ao banco após a migration
- [ ] Documentar o novo endpoint no portal interno (Postman Collection ou Swagger publicado)
- [ ] Testar os 8 endpoints em ambiente de staging antes de produção

**Observação:** Se o projeto utiliza Azure Key Vault para connection strings, nenhuma nova secret é necessária (banco de dados já configurado nos módulos anteriores).

---

## Fase 6 — Frontend Angular

> **Objetivo:** Implementar a tela de Gestão Financeira no Angular com todos os componentes, serviço e modais.
>
> **⏱️ Estimativa total: 8h**

---

### CARD 6.1 — Models: Interfaces e Classes de Request

**Tipo:** Frontend — Angular
**⏱️ Estimativa:** 1h

**Descrição:**
Criar todas as interfaces de response e classes de request do módulo, seguindo os padrões de nomenclatura do `regras-projeto-angular.md`.

**Arquivos a criar (8 responses + 8 requests = 16 arquivos):**
- Ver seção "Models" do `RELATORIO_Frontend_GestaoFinanceira.md` para tipagens completas.

**Critérios de Aceite:**
- [ ] Interfaces com prefixo `I` e propriedades `camelCase`
- [ ] Request classes com sufixo `Request` e propriedades `PascalCase`
- [ ] Nenhuma lógica de negócio nos models
- [ ] `ITarifaEnergia.dataVigenciaFim` tipado como `string | null`
- [ ] `IGestaoFinanceiraDadosInvestimento.investimento` tipado como `IInvestimentoUsina | null`
- [ ] `IGestaoFinanceiraDadosInvestimento.tarifaVigente` tipado como `ITarifaEnergia | null`

---

### CARD 6.2 — Formulários Reativos

**Tipo:** Frontend — Angular
**⏱️ Estimativa:** 0.5h

**Descrição:**
Criar as configurações de Reactive Forms para os dois modais de cadastro/edição.

**Arquivos:**
- `src/app/formularios/investimento.formulario.ts`
- `src/app/formularios/tarifa-energia.formulario.ts`

**Critérios de Aceite:**
- [ ] `valorTotal` obrigatório com `Validators.min(0.01)`
- [ ] `valorKwh` obrigatório com `Validators.min(0.0001)` e `step="0.0001"` no template
- [ ] Campos de data obrigatórios
- [ ] Campos de texto opcional com `Validators.maxLength(500)`

---

### CARD 6.3 — Serviço: `GestaoFinanceiraService`

**Tipo:** Frontend — Angular
**⏱️ Estimativa:** 1h

**Descrição:**
Implementar o serviço de comunicação HTTP com a API de Gestão Financeira.

**Arquivo:** `src/app/services/gestao-financeira.service.ts`

**Critérios de Aceite:**
- [ ] `@Injectable({ providedIn: 'root' })` e `inject(HttpClient)`
- [ ] `baseUrl = environment.apiBaseUrl + '/gestao-financeira'`
- [ ] 8 métodos tipados com Observable correto
- [ ] Sem tratamento de erro no service (tratado no componente via `obterMensagemErro()`)

---

### CARD 6.4 — Componentes de Apresentação

**Tipo:** Frontend — Angular
**⏱️ Estimativa:** 2.5h

**Descrição:**
Implementar os 4 componentes filhos de apresentação (sem lógica de negócio).

**Componentes:**

1. **`KpiFinanceiroCardComponent`** (0.5h)
   - `@Input() label: string`
   - `@Input() valor: string` (já formatado pelo pai)
   - `@Input() subtexto: string`
   - `@Input() bordaClasse: string` (ex: `'border-l-primary'`)
   - Template: card Tailwind com borda lateral colorida

2. **`RentabilidadeMensalChartComponent`** (0.75h)
   - `@Input() dados: IRentabilidadeMensalItem[]`
   - BarChart com eixo X = mês, eixo Y = economiaBrl (R$)
   - Tooltip com mês, kWh gerado e valor em R$
   - Estado de vazio quando `dados.length === 0`

3. **`ProjecaoPaybackChartComponent`** (0.75h)
   - `@Input() dados: IProjecaoPaybackPonto[]`
   - `@Input() valorInvestimento: number`
   - LineChart com duas séries: `investment` (horizontal) e `recovered` (crescente)
   - Linha de cruzamento visual marcando o payback

4. **`DadosInvestimentoPainelComponent`** (0.5h)
   - `@Input() dados: IGestaoFinanceiraDadosInvestimento | null`
   - `@Output() editarInvestimento = new EventEmitter<void>()`
   - `@Output() editarTarifa = new EventEmitter<void>()`
   - Exibe: Valor do Investimento + ROI Anual + Tarifa Vigente com botões de edição

**Critérios de Aceite:**
- [ ] Todos `standalone: true`
- [ ] Nenhuma lógica de negócio nos componentes de apresentação
- [ ] Estado de loading com spinner quando `@Input()` é null
- [ ] Valores monetários formatados em pt-BR (`R$ 1.234,56`)
- [ ] Percentuais formatados com 1 casa decimal (`38,2%`)

---

### CARD 6.5 — Modais de Cadastro/Edição

**Tipo:** Frontend — Angular
**⏱️ Estimativa:** 2h

**Descrição:**
Implementar os 2 componentes de modal com Reactive Forms para cadastro e edição dos dados financeiros.

**Componentes:**

1. **`ModalEditarInvestimentoComponent`** (1h)
   - Abre com dados pré-preenchidos do investimento atual (draft pattern)
   - FormBuilder com `INVESTIMENTO_FORM_CONFIG`
   - `@Input() investimento: IInvestimentoUsina | null` (null = primeiro cadastro)
   - `@Output() salvo = new EventEmitter<IInvestimentoUsina>()`
   - Ao salvar: POST se `investimento === null`; PUT se `investimento !== null`
   - Toast de sucesso: "Investimento atualizado — Os dados foram salvos com sucesso."
   - Toast de erro: `obterMensagemErro(err)`

2. **`ModalEditarTarifaComponent`** (1h)
   - Abre com dados da tarifa vigente (draft pattern)
   - FormBuilder com `TARIFA_ENERGIA_FORM_CONFIG`
   - `@Input() tarifa: ITarifaEnergia | null` (null = primeiro cadastro)
   - `@Output() salvo = new EventEmitter<ITarifaEnergia>()`
   - Ao salvar: POST se `tarifa === null`; PUT se `tarifa !== null`
   - Toast de sucesso: "Tarifa atualizada — Os dados foram salvos com sucesso."
   - Dica informativa: "Ao salvar uma nova tarifa, a tarifa anterior será encerrada automaticamente."

**Critérios de Aceite:**
- [ ] Cancelar não altera o estado da página (draft descartado)
- [ ] Botão "Salvar" desabilitado se form inválido
- [ ] Loading spinner no botão durante a requisição HTTP
- [ ] Fechar modal após salvar com sucesso (emitir `salvo`)
- [ ] Não fechar modal em caso de erro (manter dados preenchidos para correção)

---

### CARD 6.6 — Page Component: `FinancialComponent`

**Tipo:** Frontend — Angular
**⏱️ Estimativa:** 1h

**Descrição:**
Implementar o componente de página que orquestra todos os componentes filhos, gerencia o estado e dispara os carregamentos via `forkJoin`.

**Arquivo:** `src/app/pages/dashboard/financial/financial.component.ts`

**Responsabilidades:**
- Subscribe em `UsinaService.usinaSelecionada$` no `ngOnInit`
- `carregarTodosDados(usinaId)` via `forkJoin` (4 chamadas em paralelo)
- Flags de loading: `carregandoKpis`, `carregandoRentabilidade`, `carregandoPayback`, `carregandoDados`
- Banner `configuracaoPendente` quando `kpis.configuracaoPendente === true`
- Handlers de abertura de modais: `abrirModalInvestimento()`, `abrirModalTarifa()`
- Handlers de salvamento: `aoSalvarInvestimento(novoInvestimento)`, `aoSalvarTarifa(novaTarifa)` — recarregam apenas os dados necessários

**Critérios de Aceite:**
- [ ] `standalone: true` com todos os componentes filhos importados
- [ ] `AuthGuard` aplicado à rota `/dashboard/financial` no `app.routes.ts`
- [ ] `forkJoin` com 4 observables paralelos no carregamento inicial
- [ ] Ao trocar de unidade (`usinaSelecionada$`), limpa dados anteriores e recarrega
- [ ] Banner de `configuracaoPendente` visível quando necessário
- [ ] Ao salvar investimento/tarifa, chama `carregarTodosDados()` para atualizar todos os dados

---

## Resumo de Arquivos a Criar

### Backend (total: ~22 arquivos)

| Arquivo | Fase |
| --- | --- |
| `Dominio/Entidades/TarifaEnergia.cs` | 1.1 |
| `Dominio/Entidades/InvestimentoUsina.cs` | 1.2 |
| `DataTransfer/GestaoFinanceira/*.cs` (12 DTOs) | 1.3 |
| `Infra/Configuracoes/TarifaEnergiaConfiguracao.cs` | 1.4 |
| `Infra/Configuracoes/InvestimentoUsinaConfiguracao.cs` | 1.4 |
| Migration (`*_GestaoFinanceira.cs`) | 1.4 |
| `Dominio/Servicos/TarifaEnergiaServico.cs` | 2.1 |
| `Dominio/Servicos/InvestimentoUsinaServico.cs` | 2.2 |
| `Aplicacao/Servicos/GestaoFinanceiraAppServico.cs` | 2.3 |
| `Api/Controllers/GestaoFinanceiraController.cs` | 4.1 |

### Frontend Angular (total: ~30 arquivos)

| Arquivo | Fase |
| --- | --- |
| `models/responses/*.ts` (8 arquivos) | 6.1 |
| `models/requests/*.ts` (8 arquivos) | 6.1 |
| `formularios/investimento.formulario.ts` | 6.2 |
| `formularios/tarifa-energia.formulario.ts` | 6.2 |
| `services/gestao-financeira.service.ts` | 6.3 |
| `components/gestao-financeira/**/*.ts` (4 componentes × 2 arquivos) | 6.4 |
| `components/gestao-financeira/modal-*/**/*.ts` (2 modais × 2 arquivos) | 6.5 |
| `pages/dashboard/financial/financial.component.ts` | 6.6 |
| `pages/dashboard/financial/financial.component.html` | 6.6 |
