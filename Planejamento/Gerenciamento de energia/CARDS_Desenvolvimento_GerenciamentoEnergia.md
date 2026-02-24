# Cards de Desenvolvimento — Módulo Gerenciamento de Energia

> **Projeto:** CEFE Energy Hub
>
> **Fontes:** `RELATORIO_Backend_GerenciamentoEnergia.md` e `RELATORIO_Frontend_GerenciamentoEnergia.md`
>
> **Padrões Backend:** pasta `padroes-desenvolvimento-back-end/`
>
> **Padrões Frontend:** arquivo `regras-projeto-angular.md`
>
> **Data:** Fevereiro/2026

---

## 🔵 Fase 1 — Fundação (Banco de Dados + Entidades)

> Criar toda a base de dados antes de qualquer lógica. Sem banco, nada funciona.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` (entidades, comandos, interfaces de repositório), `PADROES_DE_DESENVOLVIMENTO-INFRA.md` (mapeamentos EF Core, RepositorioBase, AppDbContext, Migrations), `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (DTOs Request/Response).

### 1.1 — Entidades do Domínio

- [ ] **1.1.1 — Criar entidade `Usina`** ⏱️ `2h` — Criar se não existir previamente. Campos: `Id` (int, PK), `Nome` (string, required, max 255), `Localizacao` (string, max 255), `Estado` (string, required, max 2), `DemandaContratadaKw` (decimal 18,2, required), `Ativo` (bool, required). Métodos: `SetNome(string)`, `SetLocalizacao(string)`, `SetDemandaContratadaKw(decimal)`, `Ativar()`, `Desativar()`. Validação via `RegraDeNegocioExcecao`. Seguir padrão de entidade conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`. Arquivo em `Usinas/Entidades/Usina.cs`.

- [ ] **1.1.2 — Criar entidade `Galpao`** ⏱️ `2h` — Campos: `Id` (int, PK), `UsinaId` (int, FK → Usina), `Usina` (Usina, navigation), `Nome` (string, required, max 255), `DemandaContratadaKw` (decimal 18,2, required), `NumeroSerialMedidor` (string, max 100), `Ativo` (bool, required). Métodos: `SetNome(string)`, `SetDemandaContratadaKw(decimal)`, `SetNumeroSerialMedidor(string)`, `Ativar()`, `Desativar()`. Validações: nome obrigatório, demanda não pode ser negativa. Arquivo em `GerenciamentoEnergia/Entidades/Galpao.cs`.

- [ ] **1.1.3 — Criar entidade `RegistroMD50`** ⏱️ `3h` — Entidade com maior número de campos do módulo (17 propriedades). Campos: `Id` (int, PK), `GalpaoId` (int, FK → Galpao), `Galpao` (Galpao, navigation), `DataHora` (DateTime, required), `ConsumoPonta` (decimal 18,4), `ConsumoForaPonta` (decimal 18,4), `ConsumoReserv` (decimal 18,4), `EnergIndPonta` (decimal 18,4), `EnergIndForaPonta` (decimal 18,4), `EnergCapPonta` (decimal 18,4), `EnergCapForaPonta` (decimal 18,4), `MaxPotAtivPonta` (decimal 18,4), `MaxPotAtivForaPonta` (decimal 18,4), `ConsumoPonta15min` (decimal 18,4), `ConsumoForaPonta15min` (decimal 18,4), `EnergIndPonta15min` (decimal 18,4), `EnergIndForaPonta15min` (decimal 18,4), `PotAtivT` (decimal 18,4), `FatPotT` (decimal 10,4). Métodos: `SetConsumoPonta(decimal)`, `SetConsumoForaPonta(decimal)`, `SetPotAtivT(decimal)`, `SetFatPotT(decimal)`. Arquivo em `GerenciamentoEnergia/Entidades/RegistroMD50.cs`.

- [ ] **1.1.4 — Criar entidade `ResumoDiarioGalpao`** ⏱️ `2h` — Campos: `Id` (int, PK), `GalpaoId` (int, FK → Galpao), `Galpao` (Galpao, navigation), `Data` (DateTime, required), `ConsumoPontaKwh` (decimal 18,2), `ConsumoForaPontaKwh` (decimal 18,2), `ConsumoTotalKwh` (decimal 18,2), `DemandaMaxKw` (decimal 18,2), `FatPotMedio` (decimal 10,4), `CustoEstimadoBrl` (decimal 18,2). Métodos: `SetConsumoPontaKwh(decimal)`, `SetConsumoForaPontaKwh(decimal)`, `SetConsumoTotalKwh(decimal)`, `SetDemandaMaxKw(decimal)`, `SetFatPotMedio(decimal)`, `SetCustoEstimadoBrl(decimal)`. Validações: consumos e demanda não podem ser negativos. Arquivo em `GerenciamentoEnergia/Entidades/ResumoDiarioGalpao.cs`.

- [ ] **1.1.5 — Criar entidade `FaturaMensalCondominio`** ⏱️ `2.5h` — Campos: `Id` (int, PK), `UsinaId` (int, FK → Usina), `Usina` (Usina, navigation), `Mes` (string, required, max 7 — formato "2026-01"), `ValorTotalBrl` (decimal 18,2), `ConsumoTotalKwh` (decimal 18,2), `GeracaoTotalKwh` (decimal 18,2), `EnergiaInjetadaKwh` (decimal 18,2), `ConsumoSolarKwh` (decimal 18,2), `ConsumoConcessonariaKwh` (decimal 18,2), `DemandaContratadaKw` (decimal 18,2). Métodos: `SetMes(string)`, `SetValorTotalBrl(decimal)`, `SetConsumoTotalKwh(decimal)`, `SetGeracaoTotalKwh(decimal)`, `SetEnergiaInjetadaKwh(decimal)`, `SetConsumoSolarKwh(decimal)`, `SetConsumoConcessonariaKwh(decimal)`, `SetDemandaContratadaKw(decimal)`. Regra de negócio: `ConsumoSolarKwh = GeracaoTotalKwh - EnergiaInjetadaKwh` (AutoConsumo). Relacionamento 1:N com `ItemDemonstrativoFatura`. Arquivo em `GerenciamentoEnergia/Entidades/FaturaMensalCondominio.cs`.

- [ ] **1.1.6 — Criar entidade `ItemDemonstrativoFatura`** ⏱️ `2h` — Campos: `Id` (int, PK), `FaturaId` (int, FK → FaturaMensalCondominio), `Fatura` (FaturaMensalCondominio, navigation), `Indicador` (string, required, max 255), `Quantidade` (decimal? 18,4), `UnidadeMedida` (string, max 50), `Tarifa` (decimal? 18,6), `Valor` (decimal 18,2, required), `BaseIcms` (decimal 18,2), `AliquotaIcms` (decimal 10,4), `ValorIcms` (decimal 18,2). Métodos: `SetIndicador(string)`, `SetValor(decimal)`, `SetBaseIcms(decimal)`, `SetAliquotaIcms(decimal)`, `SetValorIcms(decimal)`. Entidade usada internamente — incluída apenas na fatura PDF enviada aos galpões, não exposta diretamente em endpoints. Arquivo em `GerenciamentoEnergia/Entidades/ItemDemonstrativoFatura.cs`.

- [ ] **1.1.7 — Criar entidade `LeituraInversor`** ⏱️ `1.5h` — Campos: `Id` (int, PK), `UsinaId` (int, FK → Usina), `Usina` (Usina, navigation), `DataHora` (DateTime, required), `PotenciaAtualKw` (decimal 18,2), `GeracaoKwh` (decimal 18,2), `TemperaturaInversorC` (decimal 10,2), `NumeroInversor` (int). Métodos: `SetPotenciaAtualKw(decimal)`, `SetGeracaoKwh(decimal)`, `SetTemperaturaInversorC(decimal)`. Validações: potência e geração não podem ser negativos. Dados coletados via API ProjectSwitch (`target=realtime&mode=readings`). Arquivo em `GerenciamentoEnergia/Entidades/LeituraInversor.cs`.

- [ ] **1.1.8 — Criar enum `ClassificacaoHorarioEnum`** ⏱️ `0.5h` — Valores: `ForaPonta = 0`, `Ponta = 1`, `Reservado = 2`. Usado para classificar registros MD50: Ponta = 18h–21h, Fora Ponta = restante. Arquivo em `libs/Enums/ClassificacaoHorarioEnum.cs`.

### 1.2 — Interfaces de Repositório (Domínio)

- [ ] **1.2.1 — Criar interfaces de repositório** ⏱️ `2h` — Criar no Domínio conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`:
  - `IUsinasRepositorio` em `Usinas/Repositorios/` (criar se não existir)
  - `IGalpoesRepositorio` em `GerenciamentoEnergia/Repositorios/` — método `ListarPorUsinaAsync(int usinaId)`
  - `IRegistrosMD50Repositorio` em `GerenciamentoEnergia/Repositorios/` — método `ListarPorGalpaoEDataAsync(int galpaoId, DateTime data)` para retornar os 96 registros do dia
  - `IResumosDiariosGalpaoRepositorio` em `GerenciamentoEnergia/Repositorios/` — método `ListarPorGalpaoEMesAsync(int galpaoId, string mes)` para retornar resumos do mês
  - `IFaturasMensaisCondominioRepositorio` em `GerenciamentoEnergia/Repositorios/` — método `RecuperarPorUsinaEMesAsync(int usinaId, string mes)` para retornar fatura do mês
  - `IItensDemonstrativoFaturaRepositorio` em `GerenciamentoEnergia/Repositorios/` — método `ListarPorFaturaAsync(int faturaId)`
  - `ILeiturasInversorRepositorio` em `GerenciamentoEnergia/Repositorios/` — método `ListarPorUsinaEPeriodoAsync(int usinaId, DateTime inicio, DateTime fim)` para consulta de geração solar do mês

### 1.3 — Comandos do Domínio

- [ ] **1.3.1 — Criar comandos** ⏱️ `2.5h` — Seguir padrão de comandos conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`:
  - `RegistroMD50InserirComando` — campos: GalpaoId, DataHora, ConsumoPonta, ConsumoForaPonta, ConsumoReserv, EnergIndPonta, EnergIndForaPonta, EnergCapPonta, EnergCapForaPonta, MaxPotAtivPonta, MaxPotAtivForaPonta, ConsumoPonta15min, ConsumoForaPonta15min, EnergIndPonta15min, EnergIndForaPonta15min, PotAtivT, FatPotT (17 campos — maior comando do módulo)
  - `ResumoDiarioGalpaoInserirComando` — campos: GalpaoId, Data, ConsumoPontaKwh, ConsumoForaPontaKwh, ConsumoTotalKwh, DemandaMaxKw, FatPotMedio, CustoEstimadoBrl
  - `FaturaMensalCondominioInserirComando` — campos: UsinaId, Mes, ValorTotalBrl, ConsumoTotalKwh, GeracaoTotalKwh, EnergiaInjetadaKwh, ConsumoSolarKwh, ConsumoConcessonariaKwh, DemandaContratadaKw
  - `ItemDemonstrativoFaturaInserirComando` — campos: FaturaId, Indicador, Quantidade, UnidadeMedida, Tarifa, Valor, BaseIcms, AliquotaIcms, ValorIcms
  - `LeituraInversorInserirComando` — campos: UsinaId, DataHora, PotenciaAtualKw, GeracaoKwh, TemperaturaInversorC, NumeroInversor

### 1.4 — DTOs (DataTransfer)

- [ ] **1.4.1 — Criar Request DTOs** ⏱️ `1.5h` — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (SEM DataAnnotations):
  - `GerenciamentoEnergiaMesesListarRequest` (UsinaId: int)
  - `GerenciamentoEnergiaResumoRequest` (UsinaId: int, Mes: string)
  - `GerenciamentoEnergiaGalpoesListarRequest` (UsinaId: int, Mes: string)
  - `GerenciamentoEnergiaGalpaoMensalRequest` (UsinaId: int, GalpaoId: int)
  - `GerenciamentoEnergiaGalpaoDiarioListarRequest` (UsinaId: int, GalpaoId: int, Mes: string)
  - `GerenciamentoEnergiaRegistrosListarRequest` (UsinaId: int, GalpaoId: int, Data: string)

- [ ] **1.4.2 — Criar Response DTOs** ⏱️ `3h` — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md`:
  - `GerenciamentoEnergiaMesesResponse` (meses: List\<string\>)
  - `GerenciamentoEnergiaResumoResponse` (mes, consumoSolarKwh, consumoConcessonariaKwh, consumoTotalKwh, demandaContratadaKw, valorTotalBrl)
  - `GerenciamentoEnergiaGalpaoResponse` (galpoes: List\<GalpaoResumoResponse\>) — onde `GalpaoResumoResponse` contém: id, nome, consumoTotalKwh, demandaContratadaKw
  - `GerenciamentoEnergiaGalpaoMensalResponse` (meses: List\<GalpaoResumoMensalResponse\>)
  - `GalpaoResumoMensalResponse` (mes, consumoTotalKwh, demandaContratadaKw)
  - `GerenciamentoEnergiaResumoDiarioResponse` (dias: List\<ResumoDiarioGalpaoResponse\>)
  - `ResumoDiarioGalpaoResponse` (data, consumoPontaKwh, consumoForaPontaKwh, consumoTotalKwh, demandaMaxKw, fatPotMedio, fatPotMedioBaixo: bool — `true` se `FatPotMedio < 0.92`)
  - `GerenciamentoEnergiaRegistroMD50Response` (registros: List\<RegistroMD50DetalheResponse\>)
  - `RegistroMD50DetalheResponse` (dataHora, consumoPonta, consumoForaPonta, consumoReserv, energIndPonta, energIndForaPonta, energCapPonta, energCapForaPonta, maxPotAtivPonta, maxPotAtivForaPonta, consumoPonta15min, consumoForaPonta15min, energIndPonta15min, energIndForaPonta15min, potAtivT, fatPotT, fatPotAlerta: bool — `true` se `FatPotT < 0.92`)

### 1.5 — Infraestrutura (EF Core)

- [ ] **1.5.1 — Criar mapeamentos EF Core** ⏱️ `6h` — Implementar `IEntityTypeConfiguration<T>` conforme `PADROES_DE_DESENVOLVIMENTO-INFRA.md`. Um arquivo por entidade:
  - `UsinaConfiguration.cs` — tabela `usinas`, mapeamento com `HasColumnName`, `HasMaxLength`, `HasPrecision`, `IsRequired` (criar se não existir)
  - `GalpaoConfiguration.cs` — tabela `galpoes`, FK para Usina via `HasOne/WithMany`, propriedades com `HasColumnName`
  - `RegistroMD50Configuration.cs` — tabela `registros_md50`, FK para Galpao, 17 propriedades com `HasPrecision(18, 4)`, índice composto `IX_RegistroMD50_GalpaoId_DataHora` em `(GalpaoId, DataHora)`. Mapeamento mais extenso do módulo.
  - `ResumoDiarioGalpaoConfiguration.cs` — tabela `resumos_diarios_galpao`, FK para Galpao, índice composto `IX_ResumoDiarioGalpao_GalpaoId_Data` em `(GalpaoId, Data)`
  - `FaturaMensalCondominioConfiguration.cs` — tabela `faturas_mensais_condominio`, FK para Usina, `Mes` com `HasMaxLength(7)`, índice composto `IX_FaturaMensalCondominio_UsinaId_Mes` em `(UsinaId, Mes)`, relacionamento `HasMany<ItemDemonstrativoFatura>` com `OnDelete(DeleteBehavior.Cascade)`
  - `ItemDemonstrativoFaturaConfiguration.cs` — tabela `itens_demonstrativo_fatura`, FK para FaturaMensalCondominio, `Tarifa` com `HasPrecision(18, 6)`, `AliquotaIcms` com `HasPrecision(10, 4)`
  - `LeituraInversorConfiguration.cs` — tabela `leituras_inversor`, FK para Usina, índice composto `IX_LeituraInversor_UsinaId_DataHora` em `(UsinaId, DataHora)`

- [ ] **1.5.2 — Registrar DbSets no AppDbContext** ⏱️ `1h` — Adicionar ao `AppDbContext`: `DbSet<Usina> Usinas`, `DbSet<Galpao> Galpoes`, `DbSet<RegistroMD50> RegistrosMD50`, `DbSet<ResumoDiarioGalpao> ResumosDiariosGalpao`, `DbSet<FaturaMensalCondominio> FaturasMensaisCondominio`, `DbSet<ItemDemonstrativoFatura> ItensDemonstrativoFatura`, `DbSet<LeituraInversor> LeiturasInversor`. Verificar que `OnModelCreating` usa `ApplyConfigurationsFromAssembly` para descoberta automática dos mapeamentos.

- [ ] **1.5.3 — Implementar repositórios** ⏱️ `4h` — Implementações que herdam `RepositorioBase<T>` conforme `PADROES_DE_DESENVOLVIMENTO-INFRA.md`:
  - `UsinasRepositorio : RepositorioBase<Usina>, IUsinasRepositorio` (criar se não existir)
  - `GalpoesRepositorio : RepositorioBase<Galpao>, IGalpoesRepositorio` — método `ListarPorUsinaAsync` com `Where(x => x.UsinaId == usinaId && x.Ativo)`
  - `RegistrosMD50Repositorio : RepositorioBase<RegistroMD50>, IRegistrosMD50Repositorio` — método `ListarPorGalpaoEDataAsync` com `Where(x => x.GalpaoId == galpaoId && x.DataHora.Date == data.Date).OrderBy(x => x.DataHora)` — retorna 96 registros ordenados
  - `ResumosDiariosGalpaoRepositorio : RepositorioBase<ResumoDiarioGalpao>, IResumosDiariosGalpaoRepositorio` — método `ListarPorGalpaoEMesAsync` com filtro por ano/mês via string `mes` ("2026-01")
  - `FaturasMensaisCondominioRepositorio : RepositorioBase<FaturaMensalCondominio>, IFaturasMensaisCondominioRepositorio` — método `RecuperarPorUsinaEMesAsync` com `FirstOrDefaultAsync(x => x.UsinaId == usinaId && x.Mes == mes)`
  - `ItensDemonstrativoFaturaRepositorio : RepositorioBase<ItemDemonstrativoFatura>, IItensDemonstrativoFaturaRepositorio`
  - `LeiturasInversorRepositorio : RepositorioBase<LeituraInversor>, ILeiturasInversorRepositorio` — método `ListarPorUsinaEPeriodoAsync` com `Where(x => x.UsinaId == usinaId && x.DataHora >= inicio && x.DataHora <= fim)`

- [ ] **1.5.4 — Criar Migration inicial** ⏱️ `1.5h` — `dotnet ef migrations add CriarTabelasGerenciamentoEnergia --project <Projeto>.Infra --startup-project <Projeto>.Api`. Revisar SQL gerado, confirmar 4 índices compostos (`IX_RegistroMD50_GalpaoId_DataHora`, `IX_ResumoDiarioGalpao_GalpaoId_Data`, `IX_FaturaMensalCondominio_UsinaId_Mes`, `IX_LeituraInversor_UsinaId_DataHora`), aplicar com `dotnet ef database update`.

> **Subtotal Fase 1: ⏱️ 37h (~4.5 dias)**

---

## 🟢 Fase 2 — Regras de Negócio (Services / Domain)

> Criar a lógica de cálculo isolada antes de expor em APIs ou jobs. Permite testar unitariamente sem dependência externa.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` (serviços e interfaces), `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md` (AppServicos, AutoMapper Profiles), `PADROES_DE_DESENVOLVIMENTO-IOC.md` (registro no IoC).

### 2.1 — Serviço de Domínio

- [ ] **2.1.1 — Criar `IGerenciamentoEnergiaServicos` e `GerenciamentoEnergiaServicos`** ⏱️ `5h` — Interface em `GerenciamentoEnergia/Servicos/Interfaces/`, implementação em `GerenciamentoEnergia/Servicos/`. Métodos:
  - `InserirRegistroMD50Async(RegistroMD50InserirComando comando)` → cria `RegistroMD50` via comando, classifica horário: Ponta (18h–21h), Fora Ponta (restante), Reservado
  - `InserirLeituraInversorAsync(LeituraInversorInserirComando comando)` → cria `LeituraInversor` via comando
  - `ConsolidarResumoDiarioAsync(ResumoDiarioGalpaoInserirComando comando)` → cria `ResumoDiarioGalpao` com dados agregados
  - `ProcessarFaturaEnelAsync(FaturaMensalCondominioInserirComando comando, List<ItemDemonstrativoFaturaInserirComando> itens)` → cria `FaturaMensalCondominio` + `ItemDemonstrativoFatura`. Calcula AutoConsumo: busca `Σ LeituraInversor.GeracaoKwh` do mês via repositório, extrai `EnergiaInjetadaKwh` da fatura, calcula `ConsumoSolarKwh = GeracaoTotalKwh - EnergiaInjetadaKwh`
  - `CalcularResumoCondominioAsync(int usinaId, string mes)` → retorna dados para `GerenciamentoEnergiaResumoResponse`. Lógica:
    - **Consumo Solar (kWh):** `FaturaMensalCondominio.ConsumoSolarKwh`
    - **Consumo Concessionária (kWh):** `FaturaMensalCondominio.ConsumoConcessonariaKwh`
    - **Consumo Total (kWh):** `ConsumoSolarKwh + ConsumoConcessonariaKwh`
    - **Demanda Contratada (kW):** `FaturaMensalCondominio.DemandaContratadaKw`
    - **Valor Total (R$):** `FaturaMensalCondominio.ValorTotalBrl`
  - `CalcularConsumoGalpoesAsync(int usinaId, string mes)` → para cada galpão da usina: `SUM(ResumoDiarioGalpao.ConsumoTotalKwh)` do mês. Retorna lista de galpões com consumo.
  - `CalcularConsumoCondominioAsync(int usinaId, string mes)` → `Consumo Total (Enel) - Σ Consumo de cada galpão (MD50)` — tudo que não foi consumido pelos galpões é atribuído ao condomínio (área comum). Usado no rateio de faturas individuais.

- [ ] **2.1.2 — Criar `IUsinasServicos` e `UsinasServicos`** ⏱️ `1.5h` — Criar se não existir previamente. Métodos: `RecuperarPorIdAsync(int id)`, `ListarAtivasAsync()`. Validações com `RegraDeNegocioExcecao`. Interface em `Usinas/Servicos/Interfaces/`, implementação em `Usinas/Servicos/`.

### 2.2 — Serviço de Aplicação

- [ ] **2.2.1 — Criar `IGerenciamentoEnergiaAppServico` e `GerenciamentoEnergiaAppServico`** ⏱️ `4h` — Seguir `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md`. Orquestra chamadas ao `IGerenciamentoEnergiaServicos` e repositórios. Usa AutoMapper para mapear entidades → Response DTOs. Métodos:
  - `ListarMesesAsync(GerenciamentoEnergiaMesesListarRequest request)` → consulta `IFaturasMensaisCondominioRepositorio` para obter meses distintos com fatura, retorna `GerenciamentoEnergiaMesesResponse`
  - `RecuperarResumoAsync(GerenciamentoEnergiaResumoRequest request)` → chama `GerenciamentoEnergiaServicos.CalcularResumoCondominioAsync`, retorna `GerenciamentoEnergiaResumoResponse`
  - `ListarGalpoesAsync(GerenciamentoEnergiaGalpoesListarRequest request)` → chama `GerenciamentoEnergiaServicos.CalcularConsumoGalpoesAsync`, retorna `GerenciamentoEnergiaGalpaoResponse`
  - `RecuperarGalpaoMensalAsync(GerenciamentoEnergiaGalpaoMensalRequest request)` → consulta `IResumosDiariosGalpaoRepositorio` agrupado por mês, retorna `GerenciamentoEnergiaGalpaoMensalResponse`
  - `ListarGalpaoDiarioAsync(GerenciamentoEnergiaGalpaoDiarioListarRequest request)` → consulta `IResumosDiariosGalpaoRepositorio` com filtro por mês, calcula `fatPotMedioBaixo = FatPotMedio < 0.92`, retorna `GerenciamentoEnergiaResumoDiarioResponse`
  - `ListarRegistrosMD50Async(GerenciamentoEnergiaRegistrosListarRequest request)` → consulta `IRegistrosMD50Repositorio` com filtro por data, calcula `fatPotAlerta = FatPotT < 0.92`, retorna `GerenciamentoEnergiaRegistroMD50Response`

- [ ] **2.2.2 — Criar `GerenciamentoEnergiaProfile` (AutoMapper)** ⏱️ `2h` — Profile em `Aplicacao/GerenciamentoEnergia/Profiles/`. Mapeamentos:
  - `ResumoDiarioGalpao → ResumoDiarioGalpaoResponse` (com projeção `Data → "yyyy-MM-dd"` e cálculo `FatPotMedioBaixo = FatPotMedio < 0.92`)
  - `RegistroMD50 → RegistroMD50DetalheResponse` (com cálculo `FatPotAlerta = FatPotT < 0.92`)
  - `Galpao → GalpaoResumoResponse` (com campo `ConsumoTotalKwh` preenchido manualmente)
  
  Mapeamentos manuais para `GerenciamentoEnergiaResumoResponse` e `GerenciamentoEnergiaGalpaoMensalResponse` (dados calculados, não 1:1 com entidade).

### 2.3 — Registro no IoC

- [ ] **2.3.1 — Registrar no IoC** ⏱️ `1h` — Seguir `PADROES_DE_DESENVOLVIMENTO-IOC.md`:
  - `ConfiguracoesInjecoesDependencia.cs`: registrar todos os repositórios (`AddScoped<IInterface, Implementacao>`) + serviços de domínio + serviços de aplicação:
    ```
    services.AddScoped<IUsinasRepositorio, UsinasRepositorio>();
    services.AddScoped<IGalpoesRepositorio, GalpoesRepositorio>();
    services.AddScoped<IRegistrosMD50Repositorio, RegistrosMD50Repositorio>();
    services.AddScoped<IResumosDiariosGalpaoRepositorio, ResumosDiariosGalpaoRepositorio>();
    services.AddScoped<IFaturasMensaisCondominioRepositorio, FaturasMensaisCondominioRepositorio>();
    services.AddScoped<IItensDemonstrativoFaturaRepositorio, ItensDemonstrativoFaturaRepositorio>();
    services.AddScoped<ILeiturasInversorRepositorio, LeiturasInversorRepositorio>();
    services.AddScoped<IGerenciamentoEnergiaServicos, GerenciamentoEnergiaServicos>();
    services.AddScoped<IGerenciamentoEnergiaAppServico, GerenciamentoEnergiaAppServico>();
    ```
  - `ConfiguracoesAutoMapper.cs`: registrar `GerenciamentoEnergiaProfile`
  - `ConfiguracoesDbContext.cs`: verificar que AppDbContext está configurado com SQL Server

> **Subtotal Fase 2: ⏱️ 13.5h (~2 dias)**

---

## 🟡 Fase 3 — Jobs de Coleta (WebJobs / Webhooks)

> Os jobs alimentam o banco. Sem dados, as APIs não retornam nada. Dependem das entidades (Fase 1) e dos services (Fase 2).

- [ ] **3.1 — Job: Coleta de Registros MD50** ⏱️ `8h` — CRON `0 */15 * * * *` (a cada 15 min). Fluxo:
  1. Para cada galpão ativo da usina: conectar ao medidor Embrasul MD50 identificado por `Galpao.NumeroSerialMedidor`
  2. Ler os registros acumulados desde a última coleta
  3. Para cada registro: classificar horário (Ponta = 18h–21h, Fora Ponta = restante, Reservado conforme `ClassificacaoHorarioEnum`)
  4. Extrair os 17 campos de medição: consumo ponta/fora ponta acumulado e 15min, energia indutiva/capacitiva, potência ativa, fator de potência
  5. Montar `RegistroMD50InserirComando`
  6. Chamar `GerenciamentoEnergiaServicos.InserirRegistroMD50Async(comando)`
  7. `SaveChangesAsync` (AppDbContext = Unit of Work)
  
  Tratamento de erros: log de falha por galpão, continuar processando demais galpões. São 96 registros/dia/galpão × 8 galpões = ~768 registros/dia. Usar `Service de integração Embrasul MD50` (task 3.6) para comunicação com os medidores.

- [ ] **3.2 — Job: Coleta de Leitura do Inversor Solar** ⏱️ `6h` — CRON `0 */15 * * * *` (a cada 15 min). Fluxo:
  1. Para cada usina ativa: chamar API ProjectSwitch (`target=realtime&mode=readings`) para obter leitura do inversor fotovoltaico
  2. Extrair: potência atual (kW), energia gerada (kWh), temperatura do inversor (°C), número do inversor
  3. Montar `LeituraInversorInserirComando`
  4. Chamar `GerenciamentoEnergiaServicos.InserirLeituraInversorAsync(comando)`
  5. `SaveChangesAsync`
  
  Geração solar é centralizada (um ponto por usina, não por galpão). Tratamento de erros: log de falha por usina, continuar processando demais usinas. Usar token ProjectSwitch com renovação automática (`target=tokenValidity` para verificar, `operation=renoveToken` para renovar). Se o módulo de Monitoramento já criou o service de integração ProjectSwitch, reutilizá-lo.

- [ ] **3.3 — Job: Processamento de Fatura Enel** ⏱️ `10h` — Job mensal (executado quando dados da fatura estão disponíveis). Job mais complexo — combina dados externos com cálculo de autoconsumo solar. Fluxo:
  1. Receber/processar dados da fatura da concessionária Enel
  2. Extrair campos: valor total, consumo total, energia injetada, consumo concessionária, demanda contratada
  3. Extrair itens do demonstrativo: indicador, quantidade, unidade de medida, tarifa, valor, base ICMS, alíquota ICMS, valor ICMS
  4. **Calcular AutoConsumo Solar:**
     - Buscar `Σ LeituraInversor.GeracaoKwh` do mês via `ILeiturasInversorRepositorio.ListarPorUsinaEPeriodoAsync`
     - `GeracaoTotalKwh = SUM(GeracaoKwh)` de todas as leituras do mês
     - `ConsumoSolarKwh = GeracaoTotalKwh - EnergiaInjetadaKwh` (da fatura)
  5. Montar `FaturaMensalCondominioInserirComando` + lista de `ItemDemonstrativoFaturaInserirComando`
  6. Chamar `GerenciamentoEnergiaServicos.ProcessarFaturaEnelAsync(comando, itens)`
  7. `SaveChangesAsync`
  
  **Regra crítica:** O cálculo de `ConsumoSolarKwh` depende das leituras do inversor terem sido coletadas ao longo do mês pelo Job 3.2. Se não houver leituras, `GeracaoTotalKwh = 0` e `ConsumoSolarKwh` será negativo — tratar esse cenário.

- [ ] **3.4 — Job: Consolidação Diária** ⏱️ `6h` — CRON diário (meia-noite). Fluxo:
  1. Para cada galpão ativo: buscar todos os `RegistroMD50` do dia anterior via `IRegistrosMD50Repositorio.ListarPorGalpaoEDataAsync`
  2. Calcular:
     - `ConsumoPontaKwh = SUM(ConsumoPonta15min)` dos registros com horário entre 18h–21h
     - `ConsumoForaPontaKwh = SUM(ConsumoForaPonta15min)` dos demais registros
     - `ConsumoTotalKwh = ConsumoPontaKwh + ConsumoForaPontaKwh`
     - `DemandaMaxKw = MAX(PotAtivT)` dos 96 registros do dia
     - `FatPotMedio = AVG(FatPotT)` dos 96 registros do dia
     - `CustoEstimadoBrl = ConsumoTotalKwh × tarifa média`
  3. Montar `ResumoDiarioGalpaoInserirComando`
  4. Chamar `GerenciamentoEnergiaServicos.ConsolidarResumoDiarioAsync(comando)`
  5. `SaveChangesAsync`
  
  Espera-se 96 registros por galpão/dia. Se o dia estiver incompleto (menos de 96), consolidar com os dados disponíveis e logar alerta.

- [ ] **3.5 — Job: Geração de Faturas Individuais** ⏱️ `8h` — Job mensal (quando o mês fecha). Fluxo:
  1. Recuperar `FaturaMensalCondominio` do mês via `IFaturasMensaisCondominioRepositorio`
  2. Para cada galpão ativo: calcular consumo do mês via `SUM(ResumoDiarioGalpao.ConsumoTotalKwh)`
  3. Calcular consumo do condomínio (área comum): `Consumo Total (Enel) - Σ Consumo de cada galpão`
  4. Calcular rateio proporcional por galpão (incluindo fração do condomínio)
  5. Gerar PDF da fatura individual com dados de consumo e rateio
  6. Enviar fatura por e-mail ao responsável do galpão
  7. Logar envio e resultado
  
  **Regra de negócio:** *"Não há fórmula de perdas técnicas. Tudo o que não foi consumido pelos galpões deve ser atribuído ao condomínio."* O demonstrativo da fatura Enel (`ItemDemonstrativoFatura`) é incluído apenas no PDF — não é exposto em endpoints da API.

- [ ] **3.6 — Service de integração Embrasul MD50** ⏱️ `5h` — Service reutilizável para comunicação com os medidores Embrasul MD50. Métodos:
  - `ConectarMedidorAsync(string numeroSerial)` — estabelece conexão com o medidor identificado pelo número serial
  - `LerRegistrosAsync(string numeroSerial, DateTime ultimaColeta)` — lê registros acumulados desde a última coleta
  - `VerificarStatusMedidorAsync(string numeroSerial)` — verifica se o medidor está online e respondendo
  
  Gerenciamento de conexão, retry policy (3 tentativas com backoff exponencial), logging de erros por medidor. Cada galpão tem um medidor identificado pelo `Galpao.NumeroSerialMedidor`.

> **Subtotal Fase 3: ⏱️ 43h (~5.5 dias)**

---

## 🔴 Fase 4 — API Endpoints (Controllers)

> As APIs leem dados que já existem no banco (alimentados pelos jobs). Dependem de tudo acima.
> Seguir `PADROES_DE_DESENVOLVIMENTO-API.md` (rotas, verbos, retornos) e `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (DTOs).

- [ ] **4.1 — Criar `GerenciamentoEnergiaController`** ⏱️ `6h` — Em `Controllers/GerenciamentoEnergia/GerenciamentoEnergiaController.cs`. Atributos: `[Route("api/gerenciamento-energia")]`, `[ApiController]`, `[Authorize]`. Injetar `IGerenciamentoEnergiaAppServico`. Endpoints:

  - `[HttpGet("meses")]` → `ListarMeses([FromQuery] GerenciamentoEnergiaMesesListarRequest request)` → retorna `GerenciamentoEnergiaMesesResponse` com lista de meses disponíveis (meses que possuem fatura processada)

  - `[HttpGet("resumo")]` → `Resumo([FromQuery] GerenciamentoEnergiaResumoRequest request)` → retorna `GerenciamentoEnergiaResumoResponse` com KPIs do condomínio: consumo solar, consumo concessionária, consumo total (`solar + concessionária`), demanda contratada, valor total

  - `[HttpGet("galpoes")]` → `ListarGalpoes([FromQuery] GerenciamentoEnergiaGalpoesListarRequest request)` → retorna `GerenciamentoEnergiaGalpaoResponse` com lista de galpões e consumo total do mês (soma dos `ResumoDiarioGalpao.ConsumoTotalKwh`)

  - `[HttpGet("galpoes/{galpaoId}/mensal")]` → `RecuperarGalpaoMensal(int galpaoId, [FromQuery] GerenciamentoEnergiaGalpaoMensalRequest request)` → retorna `GerenciamentoEnergiaGalpaoMensalResponse` com dados mensais consolidados do galpão (histórico de meses)

  - `[HttpGet("galpoes/{galpaoId}/diario")]` → `ListarGalpaoDiario(int galpaoId, [FromQuery] GerenciamentoEnergiaGalpaoDiarioListarRequest request)` → retorna `GerenciamentoEnergiaResumoDiarioResponse` com resumos diários do mês (consumo ponta/fora ponta, demanda máxima, fator de potência médio, flag `fatPotMedioBaixo`)

  - `[HttpGet("galpoes/{galpaoId}/registros")]` → `ListarRegistrosMD50(int galpaoId, [FromQuery] GerenciamentoEnergiaRegistrosListarRequest request)` → retorna `GerenciamentoEnergiaRegistroMD50Response` com 96 registros MD50 do dia (15 min), incluindo flag `fatPotAlerta` para fator de potência abaixo de 0.92

  Todos os endpoints validam JWT e recebem `usinaId` via query. Delegar toda lógica para `IGerenciamentoEnergiaAppServico`. Nunca retornar entidades diretamente — sempre DTOs Response.

> **Subtotal Fase 4: ⏱️ 6h (~1 dia)**

---

## 🟣 Fase 5 — Infraestrutura Azure

> Pode ser paralelizada com as Fases 1–3, mas só é necessária para deploy.

- [ ] **5.1 — Provisionar Azure SQL Database** ⏱️ `2h` — Criar instância (Standard S0), configurar firewall, gerar connection string, testar conectividade. Considerar particionamento futuro da `RegistroMD50` (tabela de maior volume: ~23.040 registros/mês para 8 galpões). Considerar política de retenção: manter dados detalhados por 12 meses, depois consolidar em `ResumoDiarioGalpao`.

- [ ] **5.2 — Configurar Azure App Service** ⏱️ `3h` — Criar App Service Plan (.NET 10), configurar variáveis de ambiente (connection strings SQL Server, credenciais API ProjectSwitch, configurações de medidores Embrasul), configurar deploy (CI/CD ou manual).

- [ ] **5.3 — Configurar Azure WebJobs** ⏱️ `5h` — Vincular os 5 jobs CRON ao App Service:
  - Job Coleta MD50 (a cada 15 min) — `0 */15 * * * *`
  - Job Coleta Inversor Solar (a cada 15 min) — `0 */15 * * * *`
  - Job Processamento Fatura Enel (mensal) — trigger manual ou mensal
  - Job Consolidação Diária (meia-noite) — `0 0 0 * * *`
  - Job Geração Faturas Individuais (mensal) — trigger após processamento da fatura Enel
  
  Configurar CRON expressions, logs no Application Insights, alertas de falha.

- [ ] **5.4 — Aplicar Migration no Azure SQL Database** ⏱️ `1h` — `dotnet ef database update` apontando para o banco Azure. Verificar que todos os 4 índices compostos foram criados. Testar conectividade da API com o banco.

> **Subtotal Fase 5: ⏱️ 11h (~1.5 dias)**

---

## ⚪ Fase 6 — Frontend Angular

> Frontend em Angular 21 com Tailwind CSS. Seguir integralmente os padrões de `regras-projeto-angular.md` e as definições do `RELATORIO_Frontend_GerenciamentoEnergia.md`.

### 6.1 — Scaffold e Configuração

- [ ] **6.1.1 — Configurar environment** ⏱️ `0.5h` — Criar `src/environments/environment.ts` com `apiBaseUrl: 'http://localhost:5249/api'`. Criar versão de produção com URL real. Seguir padrão de `regras-projeto-angular.md` (seção Environment Configuration).

- [ ] **6.1.2 — Configurar `app.config.ts`** ⏱️ `1h` — `provideHttpClient(withInterceptors([authInterceptor]))`, `provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }))`, `provideAnimations()`, `provideZoneChangeDetection({ eventCoalescing: true })`. Seguir padrão de `regras-projeto-angular.md` (seção Configuração da Aplicação).

- [ ] **6.1.3 — Configurar rotas do módulo** ⏱️ `0.5h` — Em `app.routes.ts`:
  - `{ path: 'dashboard/gerenciamento-energia', component: GerenciamentoEnergiaComponent, canActivate: [AuthGuard] }`
  - `{ path: 'dashboard/gerenciamento-energia/galpao/:id', component: GalpaoDetalheComponent, canActivate: [AuthGuard] }`

### 6.2 — Models (Tipagem)

- [ ] **6.2.1 — Criar interfaces de Response** ⏱️ `2h` — Seguir `regras-projeto-angular.md` (seção Padrões para Models — interfaces com prefixo `I`, propriedades `camelCase`). Em `models/responses/`:
  - `IGerenciamentoEnergiaMesesResponse` (meses: string[])
  - `IGerenciamentoEnergiaResumoResponse` (mes, consumoSolarKwh, consumoConcessonariaKwh, consumoTotalKwh, demandaContratadaKw, valorTotalBrl)
  - `IGerenciamentoEnergiaGalpaoListaResponse` (galpoes: IGerenciamentoEnergiaGalpao[])
  - `IGerenciamentoEnergiaGalpao` (id, nome, consumoTotalKwh, demandaContratadaKw)
  - `IGerenciamentoEnergiaGalpaoMensalResponse` (meses: IGalpaoResumoMensal[])
  - `IGalpaoResumoMensal` (mes, consumoTotalKwh, demandaContratadaKw)
  - `IGerenciamentoEnergiaResumoDiarioResponse` (dias: IResumoDiarioGalpao[])
  - `IResumoDiarioGalpao` (data, consumoPontaKwh, consumoForaPontaKwh, consumoTotalKwh, demandaMaxKw, fatPotMedio, fatPotMedioBaixo: boolean)
  - `IGerenciamentoEnergiaRegistroMD50Response` (registros: IRegistroMD50Detalhe[])
  - `IRegistroMD50Detalhe` (dataHora, consumoPonta, consumoForaPonta, consumoReserv, energIndPonta, energIndForaPonta, energCapPonta, energCapForaPonta, maxPotAtivPonta, maxPotAtivForaPonta, consumoPonta15min, consumoForaPonta15min, energIndPonta15min, energIndForaPonta15min, potAtivT, fatPotT, fatPotAlerta: boolean)

- [ ] **6.2.2 — Criar interfaces auxiliares** ⏱️ `0.5h` — `IUsina` (id, nome, localizacao, estado, potenciaInstaladaKwp, potenciaInstaladaDescricao, dataInstalacao, ativo) em `models/usina.model.ts`. Criar se não existir previamente (compartilhada com módulo de Monitoramento).

- [ ] **6.2.3 — Criar classes de Request** ⏱️ `1h` — Seguir `regras-projeto-angular.md` (classes com sufixo `Request`, propriedades `PascalCase`). Em `models/requests/`:
  - `GerenciamentoEnergiaMesesListarRequest` (UsinaId: number)
  - `GerenciamentoEnergiaResumoRequest` (UsinaId: number, Mes: string)
  - `GerenciamentoEnergiaGalpoesListarRequest` (UsinaId: number, Mes: string)
  - `GerenciamentoEnergiaGalpaoMensalRequest` (UsinaId: number, GalpaoId: number)
  - `GerenciamentoEnergiaGalpaoDiarioListarRequest` (UsinaId: number, GalpaoId: number, Mes: string)
  - `GerenciamentoEnergiaRegistrosListarRequest` (UsinaId: number, GalpaoId: number, Data: string)

### 6.3 — Serviços

- [ ] **6.3.1 — Criar `GerenciamentoEnergiaService`** ⏱️ `2.5h` — Em `services/gerenciamento-energia.service.ts`. Seguir `regras-projeto-angular.md` (seção Padrões para Serviços — `inject(HttpClient)`, `providedIn: 'root'`, URL via `environment.apiBaseUrl`). 6 métodos:
  - `listarMeses(usinaId: number): Observable<IGerenciamentoEnergiaMesesResponse>` → `GET /meses?usinaId={id}`
  - `recuperarResumo(usinaId: number, mes: string): Observable<IGerenciamentoEnergiaResumoResponse>` → `GET /resumo?usinaId={id}&mes={mes}`
  - `listarGalpoes(usinaId: number, mes: string): Observable<IGerenciamentoEnergiaGalpaoListaResponse>` → `GET /galpoes?usinaId={id}&mes={mes}`
  - `recuperarGalpaoMensal(galpaoId: number, usinaId: number): Observable<IGerenciamentoEnergiaGalpaoMensalResponse>` → `GET /galpoes/{galpaoId}/mensal?usinaId={id}`
  - `listarGalpaoDiario(galpaoId: number, usinaId: number, mes: string): Observable<IGerenciamentoEnergiaResumoDiarioResponse>` → `GET /galpoes/{galpaoId}/diario?usinaId={id}&mes={mes}`
  - `listarRegistrosMD50(galpaoId: number, usinaId: number, data: string): Observable<IGerenciamentoEnergiaRegistroMD50Response>` → `GET /galpoes/{galpaoId}/registros?usinaId={id}&data={data}`

- [ ] **6.3.2 — Criar `UsinaService`** ⏱️ `1h` — Criar se não existir previamente (compartilhado com Monitoramento). Em `services/usina.service.ts`. Seguir `regras-projeto-angular.md` (seção Gerenciamento de Estado com BehaviorSubject). Estado reativo: `BehaviorSubject<IUsina | null>`, expor `usinaSelecionada$`. Método `selecionarUsina(usina: IUsina)`. Getter `usinaSelecionada` para acesso síncrono.

### 6.4 — Autenticação

- [ ] **6.4.1 — Criar `TokenService`** ⏱️ `1.5h` — Criar se não existir previamente. Em `core/token.service.ts`. Métodos: `getToken(): string | null`, `salvarToken(token: string)`, `removerToken()`, `isTokenValido(): boolean`. Armazenamento em `sessionStorage`.

- [ ] **6.4.2 — Criar `AuthService`** ⏱️ `2h` — Criar se não existir previamente. Em `core/auth.service.ts`. Seguir `regras-projeto-angular.md` (seção Gerenciamento de Estado com BehaviorSubject). `BehaviorSubject<IUsuarioLogado | null>`, métodos: `entrar(credenciais)`, `sair()`, `estaLogado()`, expor `usuarioLogado$`.

- [ ] **6.4.3 — Criar `AuthGuard`** ⏱️ `1h` — Criar se não existir previamente. Em `guards/auth.guard.ts`. Implementar `CanActivate` que verifica `usuarioLogado$` e `tokenService.isTokenValido()`. Se inválido → `router.createUrlTree(['/login'])`.

- [ ] **6.4.4 — Criar `authInterceptor`** ⏱️ `1.5h` — Criar se não existir previamente. Em `interceptors/auth.interceptor.ts`. `HttpInterceptorFn` que injeta `Bearer token` no header `Authorization` de todas as requisições. Em caso de erro 401 → `auth.sair()` (logout automático). Seguir código do `RELATORIO_Frontend_GerenciamentoEnergia.md` seção 8.2.

### 6.5 — Componentes

#### Tela: Visão Geral do Condomínio

- [ ] **6.5.1 — Criar `GerenciamentoEnergiaComponent` (page)** ⏱️ `5h` — Em `pages/dashboard/gerenciamento-energia/`. Standalone. Page que orquestra toda a tela de visão geral. Responsabilidades:
  - Assinar `usinaSelecionada$` do `UsinaService`
  - Verificar se usina selecionada é TH01 — se não, exibir mensagem "Módulo não disponível — O módulo de Gerenciamento de Energia está disponível apenas para a unidade TH01."
  - Ao iniciar: chamar `listarMeses(usinaId)`, selecionar o último mês disponível
  - Ao mudar mês: chamar `recuperarResumo(usinaId, mes)` e `listarGalpoes(usinaId, mes)`
  - Distribuir dados para componentes filhos via `@Input()`
  - Gerenciar flags: `carregando: boolean`, `erro: string | null`
  - Usar `finalize()` para garantir `carregando = false`
  - Tratamento de erros com `obterMensagemErro()` conforme `regras-projeto-angular.md`

- [ ] **6.5.2 — Criar `SeletorMesComponent`** ⏱️ `2h` — Em `components/gerenciamento-energia/seletor-mes/`. Standalone, reutilizável entre as duas telas. Inputs: `meses: string[]`, `mesSelecionado: string`. Output: `@Output() mesMudou: EventEmitter<string>`. Template: `<select>` com labels formatados ("Janeiro 2026", "Fevereiro 2026"). Estilização: `w-[200px]`. Lógica de formatação: converter "2026-01" para "Janeiro 2026" usando `Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })`.

- [ ] **6.5.3 — Criar `CondominioKpiCardsComponent`** ⏱️ `2.5h` — Em `components/gerenciamento-energia/condominio-kpi-cards/`. Standalone. Inputs: `consumoSolarKwh: number`, `consumoConcessonariaKwh: number`, `demandaContratadaKw: number`. Calcula internamente: `consumoTotalKwh = consumoSolarKwh + consumoConcessonariaKwh`. Exibe 4 cards:
  - **Consumo Zero Grid**: ícone `Sun`, borda `border-l-[hsl(var(--chart-3))]`
  - **Consumo Concessionária**: ícone `Building2`, borda `border-l-[hsl(var(--chart-2))]`
  - **Consumo Total**: ícone `Zap`, borda `border-l-[hsl(var(--chart-1))]`
  - **Demanda Contratada**: ícone `Gauge`, borda `border-l-[hsl(var(--chart-4))]`
  
  Layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`. Cada card: `CardHeader` com título `text-sm font-medium text-muted-foreground` + ícone `h-5 w-5`, `CardContent` com valor `text-2xl font-bold`. Formatação: `Intl.NumberFormat("pt-BR")`.

- [ ] **6.5.4 — Criar `GalpaoCardComponent`** ⏱️ `2h` — Em `components/gerenciamento-energia/galpao-card/`. Standalone. Inputs: `galpao: IGerenciamentoEnergiaGalpao`, `indice: number`. Template: card clicável com nome do galpão (`text-base`), badge de consumo (`text-sm font-semibold`), ícone `Zap`. Cores dinâmicas por índice: rotação de 8 cores (blue, orange, emerald, purple, rose, amber, cyan, indigo) para borda lateral, fundo e ícone. Interação: `cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]`. Navegação: `router.navigate(['/dashboard/gerenciamento-energia/galpao', galpao.id])`.

- [ ] **6.5.5 — Criar `GalpaoCardListComponent`** ⏱️ `1.5h` — Em `components/gerenciamento-energia/galpao-card-list/`. Standalone. Input: `galpoes: IGerenciamentoEnergiaGalpao[]`. Template: título "Galpões do Condomínio" + grid de `GalpaoCardComponent`. Layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`. Iteração com `@for` passando `galpao` e `$index` para cada `GalpaoCardComponent`.

#### Tela: Detalhe do Galpão

- [ ] **6.5.6 — Criar `GalpaoDetalheComponent` (page)** ⏱️ `5h` — Em `pages/dashboard/galpao-detalhe/`. Standalone. Page que orquestra toda a tela de detalhe. Responsabilidades:
  - Obter `galpaoId` de `ActivatedRoute.params`
  - Assinar `usinaSelecionada$` do `UsinaService` — se não é TH01, exibir mensagem
  - Ao iniciar: chamar `recuperarGalpaoMensal(galpaoId, usinaId)`, `listarGalpaoDiario(galpaoId, usinaId, mes)`, `listarRegistrosMD50(galpaoId, usinaId, data)`
  - Gerenciar estado de `mesSelecionado` e `diaSelecionado`
  - Ao mudar mês: recarregar dados diários e registros MD50
  - Ao mudar dia: recarregar gráfico diário e tabela de registros
  - Distribuir dados para componentes filhos via `@Input()`
  - Cabeçalho: botão voltar (ícone `ArrowLeft`, `variant="ghost"`), título (nome do galpão), subtítulo "Dados do módulo Embrasul MD50", seletor de mês
  - Gerenciar flags: `carregando: boolean`, `erro: string | null`

- [ ] **6.5.7 — Criar `GalpaoKpiCardsComponent`** ⏱️ `1.5h` — Em `components/gerenciamento-energia/galpao-kpi-cards/`. Standalone. Inputs: `consumoAcumuladoKwh: number`, `demandaContratadaKw: number`. Exibe 2 cards:
  - **Consumo Acumulado**: ícone `Zap`, borda `border-l-4 border-l-primary`
  - **Demanda Contratada**: ícone `Gauge`, borda `border-l-4 border-l-[hsl(var(--chart-2))]`
  
  Layout: `grid grid-cols-1 md:grid-cols-2 gap-4`. Formatação: `Intl.NumberFormat("pt-BR")`.

- [ ] **6.5.8 — Criar `ConsumoDiarioChartComponent`** ⏱️ `4h` — Em `components/gerenciamento-energia/consumo-diario-chart/`. Standalone. Inputs: `registros: IRegistroMD50Detalhe[]`, `diasDisponiveis: string[]`, `diaSelecionado: string`. Output: `@Output() diaMudou: EventEmitter<string>`. Renderiza Stacked Bar Chart com:
  - Eixo X: horário (HH:mm) — 96 pontos, labels a cada 2 horas
  - Eixo Y: consumo (kWh)
  - Séries: **Ponta** (`fill: hsl(var(--primary))`) e **Fora Ponta** (`fill: hsl(var(--chart-2))`)
  - Seletor de dia (dropdown) no cabeçalho do card — compartilhado com `RegistrosMD50TableComponent`
  
  Layout: coluna esquerda do grid `lg:grid-cols-2`. Container: `rounded-2xl bg-white p-6 shadow-lg`. Atualiza automaticamente quando input muda (via `ngOnChanges` ou `set`).

- [ ] **6.5.9 — Criar `ConsumoMensalChartComponent`** ⏱️ `3h` — Em `components/gerenciamento-energia/consumo-mensal-chart/`. Standalone. Input: `dadosDiarios: IResumoDiarioGalpao[]`. Renderiza Stacked Bar Chart com:
  - Eixo X: dia do mês ("01", "02", ..., "30")
  - Eixo Y: consumo (kWh)
  - Séries: **Ponta** (`fill: hsl(var(--primary))`) e **Fora Ponta** (`fill: hsl(var(--chart-2))`)
  
  Layout: coluna direita do grid `lg:grid-cols-2`. Atualiza ao mudar mês no seletor.

- [ ] **6.5.10 — Criar `DadosDiariosTableComponent`** ⏱️ `3h` — Em `components/gerenciamento-energia/dados-diarios-table/`. Standalone. Input: `dados: IResumoDiarioGalpao[]`. Renderiza tabela com colunas:
  - Data (dd/mm)
  - Consumo Ponta (kWh) — 1 decimal, alinhado à direita
  - Consumo Fora Ponta (kWh) — 1 decimal, alinhado à direita
  - Consumo Total (kWh) — 1 decimal, alinhado à direita
  - Demanda Máx (kW) — 1 decimal, alinhado à direita
  - Fator Potência Médio — 2 decimais, alinhado à direita
  - Custo Estimado (R$) — formatado com `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`
  
  **Badge de alerta:** Se `fatPotMedioBaixo === true`, exibir `Badge variant="destructive"` com texto "Baixo" (`ml-2 text-xs`). Organizada na aba "Dados Diários" do componente de Tabs.

- [ ] **6.5.11 — Criar `RegistrosMD50TableComponent`** ⏱️ `3.5h` — Em `components/gerenciamento-energia/registros-md50-table/`. Standalone. Inputs: `registros: IRegistroMD50Detalhe[]`, `diasDisponiveis: string[]`, `diaSelecionado: string`. Output: `@Output() diaMudou: EventEmitter<string>`. Renderiza tabela com 96 linhas (15 min), colunas:
  - Horário (HH:mm)
  - C. Ponta (kWh) — 2 decimais
  - C. F. Ponta (kWh) — 2 decimais
  - E. Ind. Ponta — 2 decimais
  - E. Ind. F.P. — 2 decimais
  - E. Cap. Ponta — 2 decimais
  - E. Cap. F.P. — 2 decimais
  - Pot. Ativa (kW) — 1 decimal
  - Fat. Potência — 2 decimais
  
  Seletor de dia no cabeçalho (compartilhado com `ConsumoDiarioChartComponent`). `ScrollArea` com `h-[400px]` para conter as 96 linhas. **Badge de alerta:** Se `fatPotAlerta === true`, exibir `Badge variant="destructive"` com `"!"` (`ml-1 text-xs`). Organizada na aba "Registros MD50 (15 min)" do componente de Tabs.

### 6.6 — Qualidade e Finalização

- [ ] **6.6.1 — Implementar tratamento de erros** ⏱️ `2h` — Em cada page/component, implementar `obterMensagemErro()` seguindo padrão de `regras-projeto-angular.md`. Prioridade: `erro?.error?.mensagem` → `erro?.error` (string) → `erro?.error?.errors[]` → `erro?.message` → mensagem padrão. Tratar JWT expirado (redirecionar para `/login`). Tratar API indisponível com mensagem amigável.

- [ ] **6.6.2 — Implementar loading states** ⏱️ `1.5h` — Flag `carregando: boolean` nas duas pages (`GerenciamentoEnergiaComponent` e `GalpaoDetalheComponent`). Enquanto `carregando = true`, exibir skeleton/loading nos locais dos KPIs, gráficos e tabelas. Usar `*ngIf="carregando; else conteudo"` + `<ng-template #conteudo>`. `finalize()` para garantir reset.

- [ ] **6.6.3 — Implementar empty states** ⏱️ `1h` — Quando API retorna lista vazia: mensagem centralizada "Nenhum dado disponível". Aplicar em: grid de galpões (sem galpões), tabela de dados diários (sem resumos), tabela de registros MD50 (sem registros), gráficos (sem dados para o período).

- [ ] **6.6.4 — Responsividade** ⏱️ `2h` — Testar e ajustar em desktop (1920px), tablet (768px) e mobile (375px). KPIs condomínio: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`. KPIs galpão: `grid-cols-1 md:grid-cols-2`. Galpões: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`. Gráficos: `grid-cols-1 lg:grid-cols-2`. Tabelas: largura 100% com scroll horizontal em mobile. Seguir breakpoints Tailwind padrão.

- [ ] **6.6.5 — Testes unitários** ⏱️ `4h` — Testar:
  - `GerenciamentoEnergiaService` (mock `HttpClient`, validar URLs e params para os 6 endpoints)
  - `UsinaService` (BehaviorSubject emite corretamente, getter retorna valor)
  - `CondominioKpiCardsComponent` (inputs renderizam valores formatados, cálculo de consumo total correto)
  - `GalpaoCardComponent` (cores por índice aplicadas corretamente, navegação ao clicar)
  - `DadosDiariosTableComponent` (badge de alerta aparece quando `fatPotMedioBaixo = true`)
  - `RegistrosMD50TableComponent` (badge de alerta aparece quando `fatPotAlerta = true`, 96 linhas renderizadas)
  - `GerenciamentoEnergiaComponent` (subscribe em `usinaSelecionada$` dispara chamadas, verificação TH01 funciona)
  - `GalpaoDetalheComponent` (obtém `galpaoId` da rota, muda mês/dia recarrega dados)

> **Subtotal Fase 6: ⏱️ 58.5h (~7.5 dias)**

---

## 📊 Resumo Total de Esforço

| Fase | Horas | Dias (úteis, 8h/dia) |
|---|---|---|
| 🔵 Fase 1 — Banco de Dados + Entidades | 37h | ~4.5 dias |
| 🟢 Fase 2 — Regras de Negócio | 13.5h | ~2 dias |
| 🟡 Fase 3 — Jobs de Coleta | 43h | ~5.5 dias |
| 🔴 Fase 4 — API Endpoints | 6h | ~1 dia |
| 🟣 Fase 5 — Infraestrutura Azure | 11h | ~1.5 dias |
| ⚪ Fase 6 — Frontend Angular | 58.5h | ~7.5 dias |
| **TOTAL** | **169h** | **~21 dias úteis (~4 semanas)** |

### Observações

- **Paralelismo possível:** Fase 5 (Azure) pode ser executada em paralelo com Fases 1–3. Fase 6 (Frontend) pode iniciar após Fase 4 (API pronta) — ou antes, usando dados mock.
- **Componentes compartilhados:** `Usina` (entidade), `IUsinasRepositorio`, `UsinasRepositorio`, `UsinaService` (Angular), `TokenService`, `AuthService`, `AuthGuard` e `authInterceptor` podem já existir se o módulo de Monitoramento & Geração foi implementado primeiro. Nesse caso, o tempo estimado dessas tasks é reduzido a verificação/integração.
- **Maior risco:** Fase 3 (Jobs de Coleta) — depende da comunicação com medidores Embrasul MD50 (hardware físico) e da estabilidade da API ProjectSwitch. O Job de Processamento de Fatura Enel (3.3) é o mais complexo pela combinação de dados externos com cálculo de autoconsumo solar.
- **Dependência externa:** API ProjectSwitch (Nortebox) é a fonte de dados para leituras do inversor solar. Medidores Embrasul MD50 são a fonte de dados de consumo por galpão. Indisponibilidade de qualquer um impacta a coleta de dados.
- **Volume de dados:** `RegistroMD50` é a tabela de maior volume (~23.040 registros/mês para 8 galpões). Índice composto `(GalpaoId, DataHora)` é essencial para performance das consultas de registros por dia. Considerar política de retenção de 12 meses para dados detalhados.
- **Regra de negócio crítica:** O consumo do condomínio (área comum) é calculado por diferença: `Consumo Total (Enel) - Σ Consumo de cada galpão (MD50)`. Não há fórmula de perdas técnicas — tudo que sobra vai para o condomínio.
