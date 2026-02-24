# Cards de Desenvolvimento — Módulo de Telemetria & Diagnóstico Proativo

> **Projeto:** CEFE Energy Hub
>
> **Fontes:** `RELATORIO_Backend_Telemetria.md` e `RELATORIO_Frontend_Telemetria.md`
>
> **Padrões Backend:** pasta `padroes-desenvolvimento-back-end/`
>
> **Padrões Frontend:** arquivo `regras-projeto-angular.md`
>
> **Data:** Fevereiro/2026
>
> **⚠️ Pré-requisito:** Os módulos de **Gerenciamento de Energia** e **Monitoramento & Geração** são implementados antes deste módulo. Este documento indica quais cards devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕). O tempo estimado já reflete o reuso.

---

## 🔵 Fase 1 — Fundação (Banco de Dados + Entidades)

> Criar toda a base de dados antes de qualquer lógica. Sem banco, nada funciona.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` (entidades, comandos, interfaces de repositório), `PADROES_DE_DESENVOLVIMENTO-INFRA.md` (mapeamentos EF Core, RepositorioBase, AppDbContext, Migrations), `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (DTOs Request/Response).

### 1.1 — Entidades do Domínio

- [ ] **1.1.1 — Criar entidade `LeituraTelemetria`** ⏱️ `2h` 🆕 — Campos: `Id` (int, PK), `UsinaId` (int, FK → Usina), `Usina` (navigation), `DataHora` (DateTime, required), `FrequenciaHz` (decimal 10,4), `TensaoL1L2V` (decimal 10,2), `TensaoL2L3V` (decimal 10,2), `TensaoL3L1V` (decimal 10,2), `FatorPotencia` (decimal 10,4), `PotenciaReativaKvar` (decimal 18,2), `PotenciaAparenteKva` (decimal 18,2), `TensaoBateriaV` (decimal 10,2), `FaltaDeEnergia` (bool), `DisjuntorFechado` (bool), `AmfAtivo` (bool), `ModoPeakShaving` (bool). Métodos: `SetFrequenciaHz(decimal)`, `SetTensoes(decimal l1l2, decimal l2l3, decimal l3l1)`, `SetFatorPotencia(decimal)`, `SetPotencias(decimal reativa, decimal aparente)`, `SetTensaoBateriaV(decimal)`, `SetFlags(bool faltaEnergia, bool disjuntor, bool amf, bool peak)`. Validações: frequência não pode ser negativa, tensão não pode ser negativa.

- [ ] **1.1.2 — Criar entidade `LeituraStringFV`** ⏱️ `1.5h` 🆕 — Campos: `Id` (int, PK), `UsinaId` (int, FK → Usina), `Usina` (navigation), `DataHora` (DateTime, required), `NumeroString` (int, required), `TensaoDcV` (decimal 10,2), `PotenciaDcKw` (decimal 18,4). Métodos: `SetTensaoDcV(decimal)`, `SetPotenciaDcKw(decimal)`. Validação: `NumeroString` deve estar entre 1 e 4 (`RegraDeNegocioExcecao` se fora do intervalo).

- [x] ✅ ~~**Demais entidades existentes**~~ ⏱️ `0h` — `Usina` ✅, `LeituraInversor` ✅, `LeituraAmbiental` ✅, `AlertaMonitoramento` ✅ — todos reutilizados de módulos anteriores. Não recriar.

### 1.2 — Interfaces de Repositório (Domínio)

- [ ] **1.2.1 — Criar interfaces de repositório** ⏱️ `0.5h` 🆕 — Criar no Domínio conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`:
  - 🆕 `ILeiturasTelemetriaRepositorio` em `Telemetria/Repositorios/` — método: `RecuperarUltimaLeituraAsync(int usinaId)` retorna a `LeituraTelemetria` mais recente por usina
  - 🆕 `ILeiturasStringFVRepositorio` em `Telemetria/Repositorios/` — método: `RecuperarUltimasPorStringAsync(int usinaId)` retorna lista de 4 itens com o registro mais recente de cada `NumeroString`
  - ✅ ~~`IAlertasMonitoramentoRepositorio`~~ — já existe (M&G). Reutilizar diretamente no `TelemetriaAppServico`.

### 1.3 — Comandos do Domínio

- [ ] **1.3.1 — Criar comandos** ⏱️ `1h` 🆕 — Seguir padrão conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`:
  - 🆕 `LeituraTelemetriaInserirComando` — campos: UsinaId, DataHora, FrequenciaHz, TensaoL1L2V, TensaoL2L3V, TensaoL3L1V, FatorPotencia, PotenciaReativaKvar, PotenciaAparenteKva, TensaoBateriaV, FaltaDeEnergia, DisjuntorFechado, AmfAtivo, ModoPeakShaving
  - 🆕 `LeituraStringFVInserirComando` — campos: UsinaId, DataHora, NumeroString, TensaoDcV, PotenciaDcKw

### 1.4 — DTOs (DataTransfer)

- [ ] **1.4.1 — Criar Request DTOs** ⏱️ `1h` 🆕 — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (SEM DataAnnotations):
  - `TelemetriaTempoRealRequest` (UsinaId: int)
  - `TelemetriaLogAlertasRequest` herda `PaginacaoFiltro` (UsinaId: int, Severidade?: string, ApenasAtivos?: bool, DataInicio?: DateTime, DataFim?: DateTime)
  - `TelemetriaStringsFvRequest` (UsinaId: int)

- [ ] **1.4.2 — Criar Response DTOs** ⏱️ `2h` 🆕 — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md`:
  - `TelemetriaTempoRealResponse` (frequenciaHz, tensaoL1L2V, tensaoL2L3V, tensaoL3L1V, fatorPotencia, potenciaReativaKvar, potenciaAparenteKva, tensaoBateriaV, faltaDeEnergia, disjuntorFechado, amfAtivo, modoPeakShaving, irradiacaoWm2, temperaturaAmbienteC, temperaturaCabineC, dataLeitura)
  - `TelemetriaAlertaResponse` (id, titulo, descricao, severidade, equipamento, status, visto, dataOcorrencia, dataResolucao, duracaoMinutos)
  - `TelemetriaStringsFvResponse` (strings: List\<StringFVLeituraResponse\>, dataLeitura)
  - `StringFVLeituraResponse` (numeroString, tensaoDcV, potenciaDcKw)

### 1.5 — Infraestrutura (EF Core)

- [ ] **1.5.1 — Criar mapeamentos EF Core** ⏱️ `2h` 🆕 — Implementar `IEntityTypeConfiguration<T>` conforme `PADROES_DE_DESENVOLVIMENTO-INFRA.md`. Um arquivo por entidade:
  - 🆕 `LeituraTelemetriaConfiguration.cs` — tabela `leituras_telemetria`, FK para `usinas`, `HasPrecision` para todos os decimais conforme especificado, índice composto `IX_LeituraTelemetria_UsinaId_DataHora`
  - 🆕 `LeituraStringFVConfiguration.cs` — tabela `leituras_string_fv`, FK para `usinas`, índice composto `IX_LeituraStringFV_UsinaId_NumeroString_DataHora` (otimiza `MAX(DataHora) GROUP BY NumeroString`)

- [ ] **1.5.2 — Registrar DbSets no AppDbContext** ⏱️ `0.5h` 🔄 — Adicionar ao `AppDbContext` **existente**:
  - 🆕 `DbSet<LeituraTelemetria> LeiturasTelemetria`
  - 🆕 `DbSet<LeituraStringFV> LeiturasStringFV`

  `OnModelCreating` já usa `ApplyConfigurationsFromAssembly` — sem alteração necessária nesse método.

- [ ] **1.5.3 — Implementar repositórios** ⏱️ `1.5h` 🆕 — Implementações que herdam `RepositorioBase<T>` conforme `PADROES_DE_DESENVOLVIMENTO-INFRA.md`:
  - 🆕 `LeiturasTelemetriaRepositorio : RepositorioBase<LeituraTelemetria>, ILeiturasTelemetriaRepositorio` — `RecuperarUltimaLeituraAsync`: `ORDER BY DataHora DESC LIMIT 1 WHERE UsinaId = X`
  - 🆕 `LeiturasStringFVRepositorio : RepositorioBase<LeituraStringFV>, ILeiturasStringFVRepositorio` — `RecuperarUltimasPorStringAsync`: subconsulta `MAX(DataHora) GROUP BY NumeroString WHERE UsinaId = X`, retorna sempre 4 registros

- [ ] **1.5.4 — Criar Migration incremental** ⏱️ `1h` 🆕 — `dotnet ef migrations add AdicionarTabelasTelemetria --project <Projeto>.Infra --startup-project <Projeto>.Api`. Migration incremental (o banco já existe): adicionar tabelas `leituras_telemetria` e `leituras_string_fv` com todos os campos, FKs e índices compostos. Revisar SQL gerado e aplicar com `dotnet ef database update`.

> **Subtotal Fase 1: ⏱️ 13h (~1,5 dias)**

---

## 🟢 Fase 2 — Regras de Negócio (Services / Domain)

> Criar a lógica de classificação e orquestração antes de expor via API.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`, `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md`, `PADROES_DE_DESENVOLVIMENTO-IOC.md`.

### 2.1 — Serviço de Domínio

- [ ] **2.1.1 — Criar `ITelemetriaServicos` e `TelemetriaServicos`** ⏱️ `2h` 🆕 — Interface em `Telemetria/Servicos/Interfaces/`, implementação em `Telemetria/Servicos/`. Métodos:
  - `InserirLeituraTelemetriaAsync(LeituraTelemetriaInserirComando comando)` → cria `LeituraTelemetria` via comando, aplica validações de domínio, persiste
  - `InserirLeituraStringFVAsync(LeituraStringFVInserirComando comando)` → cria `LeituraStringFV` via comando, valida `NumeroString` entre 1 e 4, persiste
  - `ClassificarTensaoAsync(decimal tensaoV)` → retorna "Normal" (370–400 V), "Alerta" (fora da faixa), "Critico" (<350 ou >420 V)
  - `ClassificarFrequenciaAsync(decimal frequenciaHz)` → retorna "Normal" (59,5–60,5 Hz), "Alerta"
  - `ClassificarTemperaturaAsync(decimal temperaturaC)` → retorna "Normal" (<60°C), "Alto" (60–70°C), "Critico" (>70°C)
  - `ClassificarIrradiacaoAsync(decimal irradiacaoWm2)` → retorna "Otimo" (≥600), "Moderado" (300–600), "Baixo" (<300)

### 2.2 — Serviço de Aplicação

- [ ] **2.2.1 — Criar `ITelemetriaAppServico` e `TelemetriaAppServico`** ⏱️ `2h` 🆕 — Seguir `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md`. Métodos:
  - `RecuperarTempoRealAsync(TelemetriaTempoRealRequest request)` → agrega: última `LeituraTelemetria` via `ILeiturasTelemetriaRepositorio` + última `LeituraAmbiental` via `ILeiturasAmbientalRepositorio` ✅ (reutilizado M&G) + `TemperaturaInversorC` da última `LeituraInversor` ✅ (reutilizado GE). Retorna `TelemetriaTempoRealResponse` montado manualmente (3 fontes distintas).
  - `ListarAlertasAsync(TelemetriaLogAlertasRequest request)` → consulta `IAlertasMonitoramentoRepositorio` ✅ (reutilizado M&G), aplica filtros (severidade, datas, apenas ativos), calcula `duracaoMinutos = (DataResolucao - DataOcorrencia).TotalMinutes`, retorna `PaginacaoConsulta<TelemetriaAlertaResponse>`
  - `RecuperarStringsFvAsync(TelemetriaStringsFvRequest request)` → consulta `ILeiturasStringFVRepositorio.RecuperarUltimasPorStringAsync(usinaId)`, mapeia para `TelemetriaStringsFvResponse`

- [ ] **2.2.2 — Criar `TelemetriaProfile` (AutoMapper)** ⏱️ `0.5h` 🆕 — Profile em `Aplicacao/Telemetria/Profiles/`. Mapeamentos:
  - `AlertaMonitoramento → TelemetriaAlertaResponse` (incluindo resolução de `duracaoMinutos`)
  - `LeituraStringFV → StringFVLeituraResponse`
  
  `TelemetriaTempoRealResponse` montado manualmente no `AppServico` (agrega 3 entidades distintas sem mapeamento 1:1).

### 2.3 — Registro no IoC

- [ ] **2.3.1 — 🔄 Adicionar registros ao IoC existente** ⏱️ `0.5h` — Arquivos de IoC já existem (GE). Apenas adicionar:
  - `ILeiturasTelemetriaRepositorio` → `LeiturasTelemetriaRepositorio`
  - `ILeiturasStringFVRepositorio` → `LeiturasStringFVRepositorio`
  - `ITelemetriaServicos` → `TelemetriaServicos`
  - `ITelemetriaAppServico` → `TelemetriaAppServico`
  - `TelemetriaProfile` em `ConfiguracoesAutoMapper.cs`

> **Subtotal Fase 2: ⏱️ 5h (~0,5 dia)**

---

## 🟡 Fase 3 — Extensão do Job de Coleta

> Estender o job existente para mapear e persistir os dados de telemetria. Sem dados, as APIs retornam vazio.

- [ ] **3.1 — 🔄 Estender `ColetaLeituraInversorJob`** ⏱️ `5h` — O job já chama `target=realtime&mode=readings` e recebe o array `readings[]` completo. Atualmente mapeia apenas `TOTALP`, `KWHD` e `FV_CABINE_TEMP`. Estender com:

  **Passo 1 — Mapear campos elétricos:**
  Após o mapeamento existente de `LeituraInversor`, extrair do mesmo `readings[]`:
  - `FREQ` → `FrequenciaHz` (decimal)
  - `VL1L2`, `VL2L3`, `VL3L1` → tensões fase-fase (decimal)
  - `FP` → `FatorPotencia` (decimal)
  - `TOTALQ` → `PotenciaReativaKvar` (decimal)
  - `TOTALS` → `PotenciaAparenteKva` (decimal)
  - `VBAT` → `TensaoBateriaV` (decimal)
  - `MAINS_FAILURE`, `MB_ON`, `AMF_ACTIVE`, `MODE_PEAK` → flags bool (converter: `campo.valor == "1"` → `true`)

  **Passo 2 — Montar e persistir `LeituraTelemetria`:**
  - Criar `LeituraTelemetriaInserirComando` com os valores extraídos
  - Chamar `ITelemetriaServicos.InserirLeituraTelemetriaAsync(comando)`

  **Passo 3 — Mapear e persistir 4 `LeituraStringFV`:**
  - Para cada string (1 a 4): extrair `FV_DC_VOLTAGE_STR_X` e `FV_DC_POWER_STR_X`
  - Criar `LeituraStringFVInserirComando` para cada string
  - Chamar `ITelemetriaServicos.InserirLeituraStringFVAsync(comando)` × 4

  **Passo 4 — Transação única:**
  - Tudo em um único `SaveChangesAsync` ao final (AppDbContext como Unit of Work)
  - Se campo não encontrado no `readings[]`: persistir `null` nos campos opcionais, logar ausência, continuar sem interromper

  **Critério de aceite:** Após execução do job, `leituras_telemetria` deve ter 1 novo registro e `leituras_string_fv` deve ter 4 novos registros por usina. Campo `MAINS_FAILURE = "1"` deve persistir como `FaltaDeEnergia = true`.

> **Subtotal Fase 3: ⏱️ 5h (~0,5 dia)**

---

## 🔴 Fase 4 — Endpoints da API (Controller)

> Expor os dados de telemetria via API REST. Depende das Fases 1, 2 e 3.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-API.md`.

- [ ] **4.1 — Criar `TelemetriaController`** ⏱️ `2.5h` 🆕 — Controller em `Api/Controllers/TelemetriaController.cs`. Herda do `ControladorBase` do projeto. Atributo `[Authorize]`. 3 endpoints:

  - `GET api/telemetria/tempo-real?usinaId={usinaId}` → chama `TelemetriaAppServico.RecuperarTempoRealAsync()`, retorna `TelemetriaTempoRealResponse`
  - `GET api/telemetria/log-alertas?usinaId={usinaId}&pagina=1&tamanhoPagina=50` → chama `TelemetriaAppServico.ListarAlertasAsync()`, retorna `PaginacaoConsulta<TelemetriaAlertaResponse>`
  - `GET api/telemetria/strings-fv?usinaId={usinaId}` → chama `TelemetriaAppServico.RecuperarStringsFvAsync()`, retorna `TelemetriaStringsFvResponse`

  **Critério de aceite:**
  - `GET api/telemetria/tempo-real?usinaId=1` com JWT válido → `200 OK` com todos os campos preenchidos
  - Sem token → `401 Unauthorized`
  - `usinaId` inexistente → `404 Not Found`

> **Subtotal Fase 4: ⏱️ 2,5h (~0,5 dia)**

---

## 🟣 Fase 5 — Infraestrutura em Nuvem (Azure)

> Configurar o ambiente de produção para as novas tabelas e o job estendido.

- [ ] **5.1 — Aplicar Migration em produção** ⏱️ `1h` — Executar `dotnet ef database update` no Azure SQL. Confirmar criação das tabelas `leituras_telemetria` e `leituras_string_fv` com seus índices compostos via Azure Portal ou SQL Server Management Studio.

- [ ] **5.2 — Verificar publicação do job estendido** ⏱️ `2h` 🔄 — O `ColetaLeituraInversorJob` já está agendado no Azure (WebJob ou Azure Function). Verificar que a nova versão (com mapeamento de telemetria) foi publicada corretamente. Monitorar os logs da primeira execução para confirmar: (a) dados de telemetria sendo inseridos em `leituras_telemetria`, (b) 4 registros inseridos em `leituras_string_fv` por usina por execução.

> **Subtotal Fase 5: ⏱️ 3h (~0,5 dia)**

---

## ⚪ Fase 6 — Frontend Angular

> Desenvolver os componentes Angular da tela de Telemetria. Depende das Fases 4 e 5 para dados reais (pode usar mock durante desenvolvimento).
> Seguir padrões de: `regras-projeto-angular.md`.

### 6.1 — Service e Models

- [ ] **6.1.1 — Criar `TelemetriaService`** ⏱️ `1.5h` 🆕 — `@Injectable({ providedIn: 'root' })`. `inject(HttpClient)` e `environment.apiUrl`. 3 métodos: `obterTempoReal(request)`, `listarAlertas(request)`, `obterStringsFv(request)`. Tipagem completa com generics (`Observable<ITelemetriaTempoReal>`, `Observable<IPaginacao<ITelemetriaAlerta>>`, `Observable<ITelemetriaStringsFv>`).

- [ ] **6.1.2 — Criar interfaces e request classes** ⏱️ `1h` 🆕 — Criar em `models/telemetria/`:
  - `ITelemetriaTempoReal` (16 campos: frequenciaHz, tensões, fatorPotencia, potências, tensaoBateriaV, 4 flags bool, irradiacaoWm2, temperaturaAmbienteC, temperaturaCabineC, dataLeitura)
  - `ITelemetriaAlerta` (10 campos: id, titulo, descricao, severidade, equipamento, status, visto, dataOcorrencia, dataResolucao, duracaoMinutos)
  - `IStringFVLeitura` + `ITelemetriaStringsFv`
  - `TelemetriaTempoRealRequest`, `TelemetriaLogAlertasRequest`, `TelemetriaStringsFvRequest`

### 6.2 — Componentes

- [ ] **6.2.1 — Criar `TelemetriaComponent`** ⏱️ `2h` 🆕 — Componente de página standalone. Assina `UsinaService.usinaSelecionada$` via `switchMap`. Carrega `forkJoin([obterTempoReal(), obterStringsFv()])` em paralelo. Carrega `listarAlertas()` separado. Gerencia propriedades `isLoading: boolean`, `erro: string | null`. Distribui dados para sub-componentes via `@Input()`. Rota: `/dashboard/telemetria`.

- [ ] **6.2.2 — Criar `KpisTelemetriaComponent`** ⏱️ `2h` 🆕 — `@Input() dados: ITelemetriaTempoReal | null`. Renderiza 4 cards: Tensão L1-L2, Frequência, Irradiação, Temperatura Cabine. Badge dinâmico por card: classificação via método puro (ex: `classificarTensao(v: number): 'Normal' | 'Alerta' | 'Critico'`). Estilização dos badges: Normal → `bg-green-500`, Alerta → `bg-yellow-500`, Crítico → `bg-red-500`, Ótimo → `bg-green-500`, Moderado → `bg-yellow-500`, Baixo → `bg-gray-400`.

- [ ] **6.2.3 — Criar `StatusSistemaComponent`** ⏱️ `1.5h` 🆕 — `@Input() dados: ITelemetriaTempoReal | null`. Grid de 5 indicadores: Falta de Energia, Disjuntor, AMF, Tensão Bateria, Peak Shaving. Cada indicador: ícone Lucide + label + badge. Estilização: Sem Falha/Fechado/Inativo → verde; Falta de Energia/AMF Ativo → vermelho; Aberto → amarelo; Peak Shaving Ativo → azul.

- [ ] **6.2.4 — Criar `StringsFvComponent`** ⏱️ `2h` 🆕 — `@Input() dados: ITelemetriaStringsFv | null`. Tabela com 4 linhas fixas (strings 1–4): colunas String, Tensão DC (V), Potência DC (kW), Status. Badge "Gerando" (verde) se `potenciaDcKw > 0`, "Sem Geração" (cinza com texto opaco) se `= 0`.

- [ ] **6.2.5 — Criar `LogAlertasTelemetriaComponent`** ⏱️ `2h` 🆕 — `@Input() alertas: ITelemetriaAlerta[]`. `@Output() filtroAlterado: EventEmitter<TelemetriaLogAlertasRequest>`. Tabela: Timestamp (dd/MM/yyyy HH:mm), Evento, Equipamento, Duração (`duracaoMinutos` formatado em "X min" ou "Ativo" se null), Badge Severidade/Status. Formulário de filtros via `FiltroAlertasForm`. Botão "Exportar" emite `EventEmitter` sem lógica no filho.

- [ ] **6.2.6 — Criar `FiltroAlertasForm`** ⏱️ `0.5h` 🆕 — `FormGroup` em `formularios/filtro-alertas.form.ts`. Campos: `severidade` (string | null, select), `dataInicio` (string | null, date input), `dataFim` (string | null, date input), `apenasAtivos` (boolean, checkbox). Emite `valueChanges` ao componente pai.

### 6.3 — Integração Final

- [ ] **6.3.1 — Roteamento e menu** ⏱️ `1.5h` 🔄 — Adicionar rota `/dashboard/telemetria` em `app.config.ts` (lazy load). Registrar link "Telemetria & Diagnóstico" no menu lateral. Testar navegação completa, troca de usina, estados de loading e erro, responsividade.

> **Subtotal Fase 6: ⏱️ 14h (~1,75 dias)**

---

## 📊 Resumo Total de Esforço

| Fase | Descrição | Horas | Dias Úteis |
|------|-----------|-------|------------|
| 🔵 Fase 1 | Banco de Dados + Entidades | 13h | ~1,5 dias |
| 🟢 Fase 2 | Regras de Negócio | 5h | ~0,5 dia |
| 🟡 Fase 3 | Extensão do Job de Coleta | 5h | ~0,5 dia |
| 🔴 Fase 4 | Endpoints da API | 2,5h | ~0,5 dia |
| 🟣 Fase 5 | Infraestrutura em Nuvem | 3h | ~0,5 dia |
| ⚪ Fase 6 | Frontend Angular | 14h | ~1,75 dias |
| **TOTAL** | | **42,5h** | **~5,5 dias úteis (~1 semana)** |
