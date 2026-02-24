# Cards de Desenvolvimento — Módulo Monitoramento & Geração

> **Projeto:** CEFE Energy Hub
>
> **Fontes:** `RELATORIO_Backend_MonitoramentoGeracao.md` e `RELATORIO_Frontend_MonitoramentoGeracao.md`
>
> **Padrões Backend:** pasta `padroes-desenvolvimento-back-end/`
>
> **Padrões Frontend:** arquivo `regras-projeto-angular.md`
>
> **Data:** Fevereiro/2026
>
> **⚠️ Pré-requisito:** O módulo de **Gerenciamento de Energia** é implementado **antes** deste módulo. Muitos artefatos (entidades, repositórios, serviços, configurações EF Core, IoC) já existirão. Este documento indica quais cards devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕). O tempo estimado já reflete o reuso.

---

## 🔵 Fase 1 — Fundação (Banco de Dados + Entidades)

> Criar toda a base de dados antes de qualquer lógica. Sem banco, nada funciona.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` (entidades, comandos, interfaces de repositório), `PADROES_DE_DESENVOLVIMENTO-INFRA.md` (mapeamentos EF Core, RepositorioBase, AppDbContext, Migrations), `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (DTOs Request/Response).

### 1.1 — Entidades do Domínio

- [ ] **1.1.1 — 🔄 ESTENDER entidade `Usina`** ⏱️ `1h` — A entidade `Usina` **já existe** (criada no módulo Gerenciamento de Energia com campos `Id`, `Nome`, `Localizacao`, `Estado`, `DemandaContratadaKw`, `DemandaContratadaDescricao`, `Ativo`). **Adicionar** os campos novos: `PotenciaInstaladaKwp` (decimal 18,2, required), `PotenciaInstaladaDescricao` (string, max 50), `DataInstalacao` (DateTime, required). Adicionar métodos Set para novos campos. Manter métodos existentes (`Ativar()`, `Desativar()`).

- [x] ✅ ~~**1.1.2 — Criar entidade `LeituraInversor`**~~ ⏱️ ~~`2h`~~ `0h` — **Já existe** (criada no módulo Gerenciamento de Energia com campos idênticos). Reutilizar diretamente.

- [ ] **1.1.3 — Criar entidade `LeituraAmbiental`** ⏱️ `1.5h` — Campos: `Id` (int, PK), `UsinaId` (int, FK → Usina), `Usina` (Usina, navigation), `DataHora` (DateTime, required), `IrradiacaoWm2` (decimal 18,2), `TemperaturaAmbienteC` (decimal 10,2). Métodos: `SetIrradiacaoWm2(decimal)`, `SetTemperaturaAmbienteC(decimal)`. Validação: irradiação não pode ser negativa.

- [ ] **1.1.4 — Criar entidade `GeracaoDiaria`** ⏱️ `2h` — Campos: `Id` (int, PK), `UsinaId` (int, FK → Usina), `Usina` (Usina, navigation), `Data` (DateTime, required), `GeracaoTotalKwh` (decimal 18,2), `PotenciaMaximaKw` (decimal 18,2), `PerformanceRatioPercent` (decimal 10,2), `HspDia` (decimal 10,4), `IrradiacaoMediaWm2` (decimal 18,2). Métodos: `SetGeracaoTotalKwh(decimal)`, `SetPerformanceRatioPercent(decimal)`, `SetHspDia(decimal)`. Validações: PR entre 0 e 100, geração não negativa.

- [ ] **1.1.5 — Criar entidade `AlertaMonitoramento`** ⏱️ `3h` — Campos: `Id` (int, PK), `UsinaId` (int, FK → Usina), `Usina` (Usina, navigation), `IdExternoProjectSwitch` (string, required, max 255 — chave de deduplicação), `IdEquipamentoProjectSwitch` (int, required), `Titulo` (string, required, max 500), `Descricao` (string, max 1000), `Severidade` (SeveridadeEnum, required), `Equipamento` (string, required, max 255), `Status` (StatusAlertaEnum, required), `Visto` (bool, required), `DataOcorrencia` (DateTime, required), `DataResolucao` (DateTime?), `DataVisto` (DateTime?), `DataSincronizacao` (DateTime, required). Métodos: `SetTitulo(string)`, `SetDescricao(string)`, `SetSeveridade(SeveridadeEnum)`, `Resolver(DateTime)`, `MarcarComoVisto(DateTime)`, `AtualizarSincronizacao(DateTime)`. Entidade mais complexa do módulo — alertas alimentados exclusivamente pelo Job de Coleta ProjectSwitch.

- [ ] **1.1.6 — Criar enums `SeveridadeEnum` e `StatusAlertaEnum`** ⏱️ `0.5h` — `SeveridadeEnum`: Info = 0, Medio = 1, Alto = 2. `StatusAlertaEnum`: Ativo = 0, Resolvido = 1. Arquivos em `libs/Enums/`. Persistidos como `int` no banco via `HasConversion<int>()` no mapeamento EF Core.

### 1.2 — Interfaces de Repositório (Domínio)

- [ ] **1.2.1 — Criar interfaces de repositório** ⏱️ `1h` — Criar no Domínio conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`:
  - ✅ ~~`IUsinasRepositorio` em `Usinas/Repositorios/`~~ — já existe (GE)
  - ✅ ~~`ILeiturasInversorRepositorio` em `Monitoramento/Repositorios/`~~ — já existe (GE). Verificar se precisa de métodos adicionais.
  - 🆕 `ILeiturasAmbientalRepositorio` em `Monitoramento/Repositorios/`
  - 🆕 `IGeracoesDiariasRepositorio` em `Monitoramento/Repositorios/`
  - 🆕 `IAlertasMonitoramentoRepositorio` em `Monitoramento/Repositorios/`
  
  Cada interface **nova** com métodos específicos de consulta. `IAlertasMonitoramentoRepositorio` deve ter `RecuperarPorIdExternoAsync(string idExterno)` para deduplicação.

### 1.3 — Comandos do Domínio

- [ ] **1.3.1 — Criar comandos** ⏱️ `1.5h` — Seguir padrão de comandos conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`:
  - 🆕 `AlertaProjectSwitchSincronizarComando` — campos: UsinaId, IdEquipamentoProjectSwitch, IdExternoProjectSwitch, Titulo, Descricao, Equipamento, DataOcorrencia, Visto, DataVisto
  - 🆕 `AlertaProjectSwitchResolverComando` — campos: IdExternoProjectSwitch, DataResolucao
  - ✅ ~~`LeituraInversorInserirComando`~~ — já existe (GE). Reutilizar.
  - 🆕 `LeituraAmbientalInserirComando` — campos: UsinaId, DataHora, IrradiacaoWm2, TemperaturaAmbienteC
  - 🆕 `GeracaoDiariaInserirComando` — campos: UsinaId, Data, GeracaoTotalKwh, PotenciaMaximaKw, PerformanceRatioPercent, HspDia, IrradiacaoMediaWm2

### 1.4 — DTOs (DataTransfer)

- [ ] **1.4.1 — Criar Request DTOs** ⏱️ `1.5h` — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (SEM DataAnnotations):
  - `MonitoramentoResumoRequest` (UsinaId: int)
  - `MonitoramentoCurvaGeracaoRequest` (UsinaId: int)
  - `MonitoramentoAlertasListarRequest` herda `PaginacaoFiltro` (UsinaId: int, Severidade?: string, ApenasAtivos?: bool)
  - `MonitoramentoInformacoesTecnicasRequest` (UsinaId: int)
  - `MonitoramentoDadosAmbientaisRequest` (UsinaId: int)

- [ ] **1.4.2 — Criar Response DTOs** ⏱️ `2h` — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md`:
  - `MonitoramentoResumoResponse` (geracaoAtualKw, percentualCapacidade, geracaoDiariaKwh, variacaoDiaAnteriorPercent, performanceRatioPercent, performanceRatioClassificacao, statusSistema, quantidadeAlertasCriticos, quantidadeAlertasMedios)
  - `MonitoramentoCurvaGeracaoResponse` (pontos: List<CurvaGeracaoPontoResponse>)
  - `CurvaGeracaoPontoResponse` (horario: string, potenciaKw: decimal)
  - `MonitoramentoAlertaResponse` (id, idExternoProjectSwitch, titulo, descricao, severidade, equipamento, idEquipamentoProjectSwitch, status, visto, dataOcorrencia, dataResolucao, dataSincronizacao)
  - `MonitoramentoInformacoesTecnicasResponse` (potenciaInstalada, potenciaInstaladaKwp, localizacao, estado, dataInstalacao, irradiacaoAtualWm2, temperaturaAmbienteC)
  - `MonitoramentoDadosAmbientaisResponse` (irradiacaoWm2, temperaturaAmbienteC, temperaturaInversorC, dataLeitura)

### 1.5 — Infraestrutura (EF Core)

- [ ] **1.5.1 — Criar/estender mapeamentos EF Core** ⏱️ `2.5h` — Implementar `IEntityTypeConfiguration<T>` conforme `PADROES_DE_DESENVOLVIMENTO-INFRA.md`. Um arquivo por entidade:
  - 🔄 `UsinaConfiguration.cs` — **já existe** (GE). Estender com mapeamento dos novos campos: `PotenciaInstaladaKwp`, `PotenciaInstaladaDescricao`, `DataInstalacao`
  - ✅ ~~`LeituraInversorConfiguration.cs`~~ — **já existe** (GE). Reutilizar diretamente.
  - 🆕 `LeituraAmbientalConfiguration.cs` — tabela `leituras_ambiental`, FK para Usina, índice composto `IX_LeituraAmbiental_UsinaId_DataHora`
  - 🆕 `GeracaoDiariaConfiguration.cs` — tabela `geracoes_diarias`, FK para Usina, `HasPrecision` para decimais
  - 🆕 `AlertaMonitoramentoConfiguration.cs` — tabela `alertas_monitoramento`, FK para Usina, `HasConversion<int>()` para enums Severidade e Status, índice composto `IX_AlertaMonitoramento_UsinaId_Status`

- [ ] **1.5.2 — Registrar DbSets no AppDbContext** ⏱️ `0.5h` — Adicionar ao `AppDbContext` **existente** (já criado no GE):
  - ✅ ~~`DbSet<Usina>`~~ — já existe (GE)
  - ✅ ~~`DbSet<LeituraInversor>`~~ — já existe (GE)
  - 🆕 `DbSet<LeituraAmbiental>`
  - 🆕 `DbSet<GeracaoDiaria>`
  - 🆕 `DbSet<AlertaMonitoramento>`
  
  `OnModelCreating` já usa `ApplyConfigurationsFromAssembly` (configurado no GE).

- [ ] **1.5.3 — Implementar repositórios** ⏱️ `2h` — Implementações que herdam `RepositorioBase<T>` conforme `PADROES_DE_DESENVOLVIMENTO-INFRA.md`:
  - ✅ ~~`UsinasRepositorio : RepositorioBase<Usina>, IUsinasRepositorio`~~ — já existe (GE)
  - ✅ ~~`LeiturasInversorRepositorio : RepositorioBase<LeituraInversor>, ILeiturasInversorRepositorio`~~ — já existe (GE). Verificar se precisa de métodos adicionais.
  - 🆕 `LeiturasAmbientalRepositorio : RepositorioBase<LeituraAmbiental>, ILeiturasAmbientalRepositorio`
  - 🆕 `GeracoesDiariasRepositorio : RepositorioBase<GeracaoDiaria>, IGeracoesDiariasRepositorio`
  - 🆕 `AlertasMonitoramentoRepositorio : RepositorioBase<AlertaMonitoramento>, IAlertasMonitoramentoRepositorio` — método `RecuperarPorIdExternoAsync` para deduplicação de alertas

- [ ] **1.5.4 — Criar Migration incremental** ⏱️ `1.5h` — `dotnet ef migrations add AdicionarTabelasMonitoramentoECamposUsina --project <Projeto>.Infra --startup-project <Projeto>.Api`. Migration **incremental** (não inicial — o banco já existe do GE): adicionar tabelas `leituras_ambiental`, `geracoes_diarias`, `alertas_monitoramento` e novos campos em `usinas` (`PotenciaInstaladaKwp`, `PotenciaInstaladaDescricao`, `DataInstalacao`). Revisar SQL gerado, confirmar índices compostos, aplicar com `dotnet ef database update`.

> **Subtotal Fase 1: ⏱️ 20.5h (~2.5 dias)** _(era 28h — economia de ~7.5h com reuso de artefatos do GE)_

---

## 🟢 Fase 2 — Regras de Negócio (Services / Domain)

> Criar a lógica de cálculo isolada antes de expor em APIs ou jobs. Permite testar unitariamente sem dependência externa.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` (serviços e interfaces), `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md` (AppServicos, AutoMapper Profiles), `PADROES_DE_DESENVOLVIMENTO-IOC.md` (registro no IoC).

### 2.1 — Serviço de Domínio

- [ ] **2.1.1 — Criar `IMonitoramentoServicos` e `MonitoramentoServicos`** ⏱️ `6h` — Interface em `Monitoramento/Servicos/Interfaces/`, implementação em `Monitoramento/Servicos/`. Métodos:
  - `CalcularResumoAsync(int usinaId)` → retorna dados para o `MonitoramentoResumoResponse`. Lógica:
    - **Geração Atual (kW):** última `LeituraInversor.PotenciaAtualKw` da usina
    - **Percentual Capacidade:** `(GeracaoAtualKw / Usina.PotenciaInstaladaKwp) × 100`
    - **Geração Diária (kWh):** `SUM(LeituraInversor.GeracaoKwh)` do dia corrente
    - **Variação vs Dia Anterior:** `((GeracaoHoje - GeracaoOntem) / GeracaoOntem) × 100` (usar `GeracaoDiaria` do dia anterior)
    - **Performance Ratio (%):** `(GeracaoReal / GeracaoTeorica) × 100` onde `GeracaoTeorica = PotenciaInstaladaKwp × HSP × (1 - FatorPerdas)`
    - **Classificação PR:** "Otimo" (≥80%), "Bom" (≥65%), "Baixo" (<65%)
    - **Status do Sistema:** verificar `AlertaMonitoramento` com `Status = Ativo`: se há `Severidade = Alto` → "Critico", se há `Severidade = Medio` → "Atencao", senão → "OK"
    - **Contadores:** quantidadeAlertasCriticos, quantidadeAlertasMedios
  - `SincronizarAlertaProjectSwitchAsync(AlertaProjectSwitchSincronizarComando comando)` → verifica deduplicação via `IdExternoProjectSwitch`, insere novo ou atualiza `Visto`
  - `ResolverAlertaProjectSwitchAsync(AlertaProjectSwitchResolverComando comando)` → marca como `Resolvido` com `DataResolucao`
  - `InserirLeituraInversorAsync(LeituraInversorInserirComando comando)` → cria `LeituraInversor` via comando
  - `InserirLeituraAmbientalAsync(LeituraAmbientalInserirComando comando)` → cria `LeituraAmbiental` via comando
  - `ConsolidarGeracaoDiariaAsync(GeracaoDiariaInserirComando comando)` → cria `GeracaoDiaria` com dados agregados

- [x] ✅ ~~**2.1.2 — Criar `IUsinasServicos` e `UsinasServicos`**~~ ⏱️ ~~`2h`~~ `0h` — **Já existe** (criado no módulo Gerenciamento de Energia). Reutilizar diretamente. Métodos `RecuperarPorIdAsync(int id)` e `ListarAtivasAsync()` já implementados.

### 2.2 — Serviço de Aplicação

- [ ] **2.2.1 — Criar `IMonitoramentoAppServico` e `MonitoramentoAppServico`** ⏱️ `4h` — Seguir `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md`. Orquestra chamadas ao `IMonitoramentoServicos` e repositórios. Usa AutoMapper para mapear entidades → Response DTOs. Métodos:
  - `RecuperarResumoAsync(MonitoramentoResumoRequest request)` → chama `MonitoramentoServicos.CalcularResumoAsync`, retorna `MonitoramentoResumoResponse`
  - `RecuperarCurvaGeracaoAsync(MonitoramentoCurvaGeracaoRequest request)` → consulta `ILeiturasInversorRepositorio` (últimas 24h), agrupa por hora, retorna `MonitoramentoCurvaGeracaoResponse`
  - `ListarAlertasAsync(MonitoramentoAlertasListarRequest request)` → consulta `IAlertasMonitoramentoRepositorio` com paginação, filtra por severidade/status, retorna `PaginacaoConsulta<MonitoramentoAlertaResponse>`
  - `RecuperarInformacoesTecnicasAsync(MonitoramentoInformacoesTecnicasRequest request)` → consulta `IUsinasRepositorio` + última `LeituraAmbiental`, retorna `MonitoramentoInformacoesTecnicasResponse`
  - `RecuperarDadosAmbientaisAsync(MonitoramentoDadosAmbientaisRequest request)` → consulta última `LeituraAmbiental` + última `LeituraInversor` (temperatura), retorna `MonitoramentoDadosAmbientaisResponse`

- [ ] **2.2.2 — Criar `MonitoramentoProfile` (AutoMapper)** ⏱️ `1.5h` — Profile em `Aplicacao/Monitoramento/Profiles/`. Mapeamentos:
  - `LeituraInversor → CurvaGeracaoPontoResponse` (com projeção DataHora → "HH:mm")
  - `AlertaMonitoramento → MonitoramentoAlertaResponse`
  - `Usina → MonitoramentoInformacoesTecnicasResponse`
  
  Mapeamentos manuais para `MonitoramentoResumoResponse` e `MonitoramentoCurvaGeracaoResponse` (dados calculados, não 1:1 com entidade).

### 2.3 — Registro no IoC

- [ ] **2.3.1 — 🔄 Adicionar registros ao IoC existente** ⏱️ `0.5h` — Arquivos de IoC **já existem** (criados no GE). Apenas adicionar novos registros:
  - `ConfiguracoesInjecoesDependencia.cs`: ✅ já existe — **adicionar** repositórios novos (`ILeiturasAmbientalRepositorio`, `IGeracoesDiariasRepositorio`, `IAlertasMonitoramentoRepositorio`) + `IMonitoramentoServicos` + `IMonitoramentoAppServico`
  - `ConfiguracoesAutoMapper.cs`: ✅ já existe — **adicionar** `MonitoramentoProfile`
  - `ConfiguracoesDbContext.cs`: ✅ já existe e configurado — nada a fazer

> **Subtotal Fase 2: ⏱️ 12h (~1.5 dias)** _(era 14.5h — economia de ~2.5h com reuso de artefatos do GE)_

---

## 🟡 Fase 3 — Jobs de Coleta (WebJobs / Webhooks)

> Os jobs alimentam o banco. Sem dados, as APIs não retornam nada. Dependem das entidades (Fase 1) e dos services (Fase 2).

- [ ] **3.1 — Job: Coleta de Leitura do Inversor** ⏱️ `8h` — CRON `0 */15 * * * *` (a cada 15 min). Fluxo:
  1. Para cada usina ativa: chamar API ProjectSwitch (`target=realtime&mode=readings`) para obter leitura do inversor
  2. Extrair: potência atual (kW), energia gerada (kWh), temperatura do inversor (°C), número do inversor
  3. Montar `LeituraInversorInserirComando`
  4. Chamar `MonitoramentoServicos.InserirLeituraInversorAsync(comando)`
  5. `SaveChangesAsync` (AppDbContext = Unit of Work)
  
  Tratamento de erros: log de falha por usina, continuar processando demais usinas. Usar token ProjectSwitch com renovação automática (verificar `target=tokenValidity` antes).

- [ ] **3.2 — Job: Coleta de Dados Ambientais** ⏱️ `5h` — CRON `0 */15 * * * *` (a cada 15 min). Mesma frequência que inversores, pode compartilhar a chamada à API ProjectSwitch. Fluxo:
  1. Para cada usina ativa: chamar API ProjectSwitch (`target=realtime&mode=readings`) para sensores de irradiação e temperatura
  2. Extrair: irradiação solar (W/m²), temperatura ambiente (°C)
  3. Montar `LeituraAmbientalInserirComando`
  4. Chamar `MonitoramentoServicos.InserirLeituraAmbientalAsync(comando)`
  5. `SaveChangesAsync`

- [ ] **3.3 — Job: Coleta de Alertas ProjectSwitch** ⏱️ `10h` — CRON `0 */5 * * * *` (a cada 5 min). Job mais complexo — única fonte de alertas. Fluxo:
  1. Para cada usina ativa: chamar API ProjectSwitch (`target=realtime&mode=alarms&equipaments={ids}`)
  2. Para cada alarme retornado:
     - Montar `IdExternoProjectSwitch` = `equipamentId + nome + data_cadastro` (chave de deduplicação)
     - Verificar se já existe no banco via `IAlertasMonitoramentoRepositorio.RecuperarPorIdExternoAsync`
     - Se **não existe**: montar `AlertaProjectSwitchSincronizarComando`, chamar `SincronizarAlertaProjectSwitchAsync`, mapear severidade (temperatura → Alto, comunicação → Medio, demais → Info)
     - Se **existe**: atualizar campo `Visto` se mudou
  3. Alertas que constavam na coleta anterior mas **não aparecem mais** na resposta: marcar como `Status = Resolvido`, `DataResolucao = DateTime.UtcNow` via `ResolverAlertaProjectSwitchAsync`
  4. `SaveChangesAsync`
  
  **Token management:** verificar validade via `target=tokenValidity`, renovar via `operation=renoveToken`. Log de erro + notificação se falhar.

- [ ] **3.4 — Job: Sincronização Histórico de Alertas** ⏱️ `4h` — CRON diário (meia-noite). Fluxo:
  1. Para cada usina ativa: chamar API ProjectSwitch (`target=previousAlarms`) das últimas 24h
  2. Para cada alarme com `data_saida` preenchido: localizar `AlertaMonitoramento` pelo `IdExternoProjectSwitch`
  3. Preencher `DataResolucao` com `data_saida` do ProjectSwitch (maior precisão que a resolução automática do job de 5 min)
  4. `SaveChangesAsync`

- [ ] **3.5 — Job: Consolidação Diária de Geração** ⏱️ `6h` — CRON diário (meia-noite). Fluxo:
  1. Para cada usina ativa: buscar todas as `LeituraInversor` do dia anterior
  2. Calcular: `GeracaoTotalKwh = SUM(GeracaoKwh)`, `PotenciaMaximaKw = MAX(PotenciaAtualKw)`
  3. Buscar `LeituraAmbiental` do dia: `IrradiacaoMediaWm2 = AVG(IrradiacaoWm2)`, `HSP = SUM(IrradiacaoWm2 × IntervaloHoras) / 1000`
  4. Calcular `PerformanceRatio = (GeracaoReal / (PotenciaInstaladaKwp × HSP × (1 - FatorPerdas))) × 100`
  5. Montar `GeracaoDiariaInserirComando`, chamar `ConsolidarGeracaoDiariaAsync`
  6. `SaveChangesAsync`

- [ ] **3.6 — 🔄 ESTENDER Service de integração com API ProjectSwitch** ⏱️ `3h` — O service de comunicação com a API ProjectSwitch **já existe** (criado no GE) com gerenciamento de token, retry policy e métodos de leitura. **Estender** com métodos de alarmes:
  - ✅ ~~`ObterLeiturasRealtimeAsync(int[] equipamentIds)`~~ — já existe (GE)
  - 🆕 `ObterAlarmesRealtimeAsync(int[] equipamentIds)` — `target=realtime&mode=alarms`
  - 🆕 `ObterAlarmesHistoricoAsync(int equipamentId, DateTime inicio, DateTime fim)` — `target=previousAlarms`
  - ✅ ~~`VerificarValidadeTokenAsync()`~~ — já existe (GE)
  - ✅ ~~`RenovarTokenAsync()`~~ — já existe (GE)
  
  Reutilizar gerenciamento automático de token, retry policy e logging existentes.

> **Subtotal Fase 3: ⏱️ 36h (~4.5 dias)** _(era 39h — economia de ~3h com reuso do service ProjectSwitch do GE)_

---

## 🔴 Fase 4 — API Endpoints (Controllers)

> As APIs leem dados que já existem no banco (alimentados pelos jobs). Dependem de tudo acima.
> Seguir `PADROES_DE_DESENVOLVIMENTO-API.md` (rotas, verbos, retornos) e `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (DTOs).

- [ ] **4.1 — Criar `MonitoramentoController`** ⏱️ `6h` — Em `Controllers/Monitoramento/MonitoramentoController.cs`. Atributos: `[Route("api/monitoramento")]`, `[ApiController]`, `[Authorize]`. Injetar `IMonitoramentoAppServico`. Endpoints:

  - `[HttpGet("resumo")]` → `Resumo([FromQuery] MonitoramentoResumoRequest request)` → retorna `MonitoramentoResumoResponse` com KPIs (geração atual, diária, PR, status, contadores de alertas)
  
  - `[HttpGet("curva-geracao")]` → `CurvaGeracao([FromQuery] MonitoramentoCurvaGeracaoRequest request)` → retorna `MonitoramentoCurvaGeracaoResponse` com array de pontos (horário × potência kW) das últimas 24h
  
  - `[HttpGet("alertas")]` → `ListarAlertas([FromQuery] MonitoramentoAlertasListarRequest request)` → retorna `PaginacaoConsulta<MonitoramentoAlertaResponse>` com alertas filtráveis por severidade e status. **Somente leitura** — não há POST/PUT/DELETE de alertas (alimentados exclusivamente pelo job ProjectSwitch)
  
  - `[HttpGet("informacoes-tecnicas")]` → `InformacoesTecnicas([FromQuery] MonitoramentoInformacoesTecnicasRequest request)` → retorna `MonitoramentoInformacoesTecnicasResponse` com dados cadastrais da usina + irradiação e temperatura
  
  - `[HttpGet("dados-ambientais")]` → `DadosAmbientais([FromQuery] MonitoramentoDadosAmbientaisRequest request)` → retorna `MonitoramentoDadosAmbientaisResponse` com leitura mais recente de irradiação, temperatura ambiente e temperatura do inversor

  Todos os endpoints validam JWT e recebem `usinaId` via query. Delegar toda lógica para `IMonitoramentoAppServico`. Nunca retornar entidades diretamente — sempre DTOs Response.

> **Subtotal Fase 4: ⏱️ 6h (~1 dia)**

---

## 🟣 Fase 5 — Infraestrutura Azure

> Pode ser paralelizada com as Fases 1–3, mas só é necessária para deploy.

- [ ] **5.1 — Provisionar Azure SQL Database** ⏱️ `2h` — Criar instância (Standard S0), configurar firewall, gerar connection string, testar conectividade. Considerar particionamento futuro da `LeituraInversor` (tabela de maior volume: ~23.040 registros/mês para 8 usinas).

- [ ] **5.2 — Configurar Azure App Service** ⏱️ `3h` — Criar App Service Plan (.NET 10), configurar variáveis de ambiente (connection strings SQL Server, credenciais API ProjectSwitch), configurar deploy (CI/CD ou manual).

- [ ] **5.3 — Configurar Azure WebJobs** ⏱️ `5h` — Vincular os 5 jobs CRON ao App Service:
  - Job Coleta Leituras Inversor (a cada 15 min)
  - Job Coleta Dados Ambientais (a cada 15 min)
  - Job Coleta Alertas ProjectSwitch (a cada 5 min)
  - Job Sinc. Histórico Alertas (diário)
  - Job Consolidação Diária (diário)
  
  Configurar CRON expressions, logs no Application Insights, alertas de falha.

- [ ] **5.4 — Aplicar Migration no Azure SQL Database** ⏱️ `1h` — `dotnet ef database update` apontando para o banco Azure. Verificar que todos os índices compostos foram criados.

> **Subtotal Fase 5: ⏱️ 11h (~1.5 dias)**

---

## ⚪ Fase 6 — Frontend Angular

> Frontend em Angular 21 com Tailwind CSS. Seguir integralmente os padrões de `regras-projeto-angular.md` e as definições do `RELATORIO_Frontend_MonitoramentoGeracao.md`.

### 6.1 — Scaffold e Configuração

- [x] ✅ ~~**6.1.1 — Configurar environment**~~ ⏱️ ~~`0.5h`~~ `0h` — **Já existe** (criado no GE). `environment.ts` e `environment.prod.ts` com `apiBaseUrl` já configurados.

- [ ] **6.1.2 — 🔄 Atualizar `app.config.ts`** ⏱️ `0.5h` — **Já existe** (criado no GE) com `provideHttpClient(withInterceptors([authInterceptor]))`, `provideRouter(routes)`, `provideZoneChangeDetection`. Apenas verificar se rota `/dashboard` está incluída no `app.routes.ts`.

- [ ] **6.1.3 — Configurar rota `/dashboard`** ⏱️ `0.5h` — Em `app.routes.ts`: `{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }`. Guard protege rota com JWT.

### 6.2 — Models (Tipagem)

- [ ] **6.2.1 — Criar interfaces de Response** ⏱️ `2h` — Seguir `regras-projeto-angular.md` (seção Padrões para Models — interfaces com prefixo `I`, propriedades `camelCase`). Em `models/responses/`:
  - `IMonitoramentoResumo` (geracaoAtualKw, percentualCapacidade, geracaoDiariaKwh, variacaoDiaAnteriorPercent, performanceRatioPercent, performanceRatioClassificacao, statusSistema, quantidadeAlertasCriticos, quantidadeAlertasMedios)
  - `ICurvaGeracao` (pontos: ICurvaGeracaoPonto[])
  - `ICurvaGeracaoPonto` (horario: string, potenciaKw: number)
  - `IAlertaMonitoramento` (id, idExternoProjectSwitch, titulo, descricao, severidade, equipamento, idEquipamentoProjectSwitch, status, visto, dataOcorrencia, dataResolucao, dataSincronizacao)
  - `IInformacoesTecnicas` (potenciaInstalada, potenciaInstaladaKwp, localizacao, estado, dataInstalacao, irradiacaoAtualWm2, temperaturaAmbienteC)
  - `IDadosAmbientais` (irradiacaoWm2, temperaturaAmbienteC, temperaturaInversorC, dataLeitura)

- [ ] **6.2.2 — Criar interfaces auxiliares** ⏱️ `0.25h` —
  - 🆕 `PaginacaoResponse<T>` (registros: T[], total: number) em `models/responses/paginacao.response.ts`
  - ✅ ~~`IUsina` em `models/usina.model.ts`~~ — **já existe** (GE) com campos idênticos. Reutilizar.

- [ ] **6.2.3 — Criar classes de Request** ⏱️ `1h` — Seguir `regras-projeto-angular.md` (classes com sufixo `Request`, propriedades `PascalCase`). Em `models/requests/`:
  - `MonitoramentoResumoRequest` (UsinaId: number)
  - `MonitoramentoAlertasListarRequest` (UsinaId: number, Severidade?: string, ApenasAtivos?: boolean, Pagina?: number, TamanhoPagina?: number)

### 6.3 — Serviços

- [ ] **6.3.1 — Criar `MonitoramentoService`** ⏱️ `2.5h` — Em `services/monitoramento.service.ts`. Seguir `regras-projeto-angular.md` (seção Padrões para Serviços — `inject(HttpClient)`, `providedIn: 'root'`, URL via `environment.apiBaseUrl`). 5 métodos:
  - `recuperarResumo(usinaId: number): Observable<IMonitoramentoResumo>`
  - `recuperarCurvaGeracao(usinaId: number): Observable<ICurvaGeracao>`
  - `listarAlertas(usinaId: number): Observable<PaginacaoResponse<IAlertaMonitoramento>>`
  - `recuperarInformacoesTecnicas(usinaId: number): Observable<IInformacoesTecnicas>`
  - `recuperarDadosAmbientais(usinaId: number): Observable<IDadosAmbientais>`

- [x] ✅ ~~**6.3.2 — Criar `UsinaService`**~~ ⏱️ ~~`1.5h`~~ `0h` — **Já existe** (criado no GE). `BehaviorSubject<IUsina | null>`, `usinaSelecionada$` e `selecionarUsina()` já implementados. Reutilizar diretamente.

### 6.4 — Autenticação

- [x] ✅ ~~**6.4.1 — Criar `TokenService`**~~ ⏱️ ~~`1.5h`~~ `0h` — **Já existe** (criado no GE). Reutilizar diretamente.

- [x] ✅ ~~**6.4.2 — Criar `AuthService`**~~ ⏱️ ~~`2h`~~ `0h` — **Já existe** (criado no GE). Reutilizar diretamente.

- [x] ✅ ~~**6.4.3 — Criar `authGuard`**~~ ⏱️ ~~`1h`~~ `0h` — **Já existe** (criado no GE). Reutilizar diretamente.

- [x] ✅ ~~**6.4.4 — Criar `authInterceptor`**~~ ⏱️ ~~`1.5h`~~ `0h` — **Já existe** (criado no GE). Reutilizar diretamente.

### 6.5 — Componentes

- [ ] **6.5.1 — Criar `DashboardComponent` (page)** ⏱️ `5h` — Em `pages/dashboard/dashboard.component.ts`. Standalone. Page que orquestra toda a tela. Responsabilidades:
  - Assinar `usinaSelecionada$` do `UsinaService`
  - A cada mudança de usina: chamar `MonitoramentoService` para os 5 endpoints
  - Distribuir dados para componentes filhos via `@Input()`
  - Gerenciar flags: `carregando: boolean`, `erro: string | null`
  - Se nenhuma usina selecionada: exibir mensagem "Selecione uma unidade para visualizar os dados"
  - Usar `finalize()` para garantir `carregando = false`
  - Tratamento de erros com `obterMensagemErro()` conforme `regras-projeto-angular.md`

- [ ] **6.5.2 — Criar `KpiCardComponent`** ⏱️ `2h` — Em `components/monitoramento/kpi-card/`. Standalone, reutilizável. Inputs: `titulo: string`, `valor: string`, `descricao: string`, `corBorda: string`. Template: card com `border-l-4` na cor recebida, título em `text-sm font-medium text-gray-500`, valor em `text-2xl font-bold`. Usado 4× na tela (Geração Atual, Geração Diária, Performance Ratio, Status).

- [ ] **6.5.3 — Criar `CurvaGeracaoChartComponent`** ⏱️ `4h` — Em `components/monitoramento/curva-geracao-chart/`. Standalone. Input: `pontos: ICurvaGeracaoPonto[]`. Renderiza Line Chart com eixo X = horário (HH:mm), eixo Y = potência (kW). Biblioteca: chart.js + ng2-charts. Container com `rounded-2xl bg-white p-6 shadow-lg`. Atualiza automaticamente quando input muda (via `ngOnChanges` ou `set`).

- [ ] **6.5.4 — Criar `AlertasListaComponent`** ⏱️ `3h` — Em `components/monitoramento/alertas-lista/`. Standalone. Input: `alertas: IAlertaMonitoramento[]`. Renderiza lista de alertas com:
  - Badge de severidade: `bg-red-500 text-white` (Alto), `bg-yellow-500 text-white` (Medio), `bg-gray-400 text-white` (Info)
  - Card com fundo colorido conforme severidade
  - Ordenação: mais recentes primeiro, priorizando severidade
  - Empty state se lista vazia

- [ ] **6.5.5 — Criar `InformacoesTecnicasComponent`** ⏱️ `2h` — Em `components/monitoramento/informacoes-tecnicas/`. Standalone. Inputs: `infoTecnicas: IInformacoesTecnicas`, `dadosAmbientais: IDadosAmbientais`. Card lateral exibindo: Potência Instalada, Localização, Data de Instalação, Irradiação Atual (W/m²), Temperatura Ambiente (°C). Dados que hoje são hardcoded serão substituídos pelos inputs recebidos da API.

### 6.6 — Qualidade e Finalização

- [ ] **6.6.1 — Implementar tratamento de erros** ⏱️ `2h` — Em cada page/component, implementar `obterMensagemErro()` seguindo padrão de `regras-projeto-angular.md`. Prioridade: `erro?.error?.mensagem` → `erro?.error` (string) → `erro?.error?.errors[]` → `erro?.message` → mensagem padrão. Tratar JWT expirado (redirecionar para `/login`). Tratar API indisponível com mensagem amigável.

- [ ] **6.6.2 — Implementar loading states** ⏱️ `1.5h` — Flag `carregando: boolean` no `DashboardComponent`. Enquanto `carregando = true`, exibir skeleton/loading nos locais dos KPIs, gráfico e alertas. Usar `*ngIf="carregando; else conteudo"` + `<ng-template #conteudo>`. `finalize()` para garantir reset.

- [ ] **6.6.3 — Implementar empty states** ⏱️ `1h` — Quando API retorna lista vazia: mensagem centralizada "Nenhum dado disponível". Aplicar em: alertas (sem alertas ativos), curva de geração (sem leituras), informações técnicas (sem dados ambientais).

- [ ] **6.6.4 — Responsividade** ⏱️ `2h` — Testar e ajustar em desktop (1920px), tablet (768px) e mobile (375px). KPIs: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`. Gráfico: largura 100% responsiva. Alertas e info técnicas: stack vertical em mobile. Seguir breakpoints Tailwind padrão.

- [ ] **6.6.5 — Testes unitários** ⏱️ `4h` — Testar:
  - `MonitoramentoService` (mock `HttpClient`, validar URLs e params para cada endpoint)
  - `UsinaService` (BehaviorSubject emite corretamente, getter retorna valor)
  - `KpiCardComponent` (inputs renderizam título, valor e borda corretamente)
  - `AlertasListaComponent` (badges de severidade com classes Tailwind corretas)
  - `DashboardComponent` (subscribe em `usinaSelecionada$` dispara chamadas ao service)

> **Subtotal Fase 6: ⏱️ 33.25h (~4 dias)** _(era 42h — economia de ~8.75h com reuso de environment, auth e UsinaService do GE)_

---

## 📊 Resumo Total de Esforço

| Fase | Horas | Dias (úteis, 8h/dia) | Reuso |
|---|---|---|---|
| 🔵 Fase 1 — Banco de Dados + Entidades | 20.5h | ~2.5 dias | _(era 28h)_ |
| 🟢 Fase 2 — Regras de Negócio | 12h | ~1.5 dias | _(era 14.5h)_ |
| 🟡 Fase 3 — Jobs de Coleta | 36h | ~4.5 dias | _(era 39h)_ |
| 🔴 Fase 4 — API Endpoints | 6h | ~1 dia | _(sem alteração)_ |
| 🟣 Fase 5 — Infraestrutura Azure | 11h | ~1.5 dias | _(sem alteração)_ |
| ⚪ Fase 6 — Frontend Angular | 33.25h | ~4 dias | _(era 42h)_ |
| **TOTAL** | **118.75h** | **~15 dias úteis (~3 semanas)** | **_(economia de ~21.75h)_** |

### Observações

- **Paralelismo possível:** Fase 5 (Azure) pode ser executada em paralelo com Fases 1–3. Fase 6 (Frontend) pode iniciar após Fase 4 (API pronta) — ou antes, usando dados mock.
- **Maior risco:** Fase 3 (Jobs de Coleta) — depende da estabilidade e disponibilidade da API ProjectSwitch. O job de alertas (3.3) é o mais complexo pela lógica de deduplicação e resolução automática.
- **Dependência externa:** API ProjectSwitch (Nortebox) é a única fonte de dados para leituras e alertas. Indisponibilidade impacta diretamente o módulo.
- **Volume de dados:** `LeituraInversor` é a tabela de maior volume (~23.040 registros/mês para 8 usinas). Índice composto `(UsinaId, DataHora)` é essencial para performance da curva de geração.
