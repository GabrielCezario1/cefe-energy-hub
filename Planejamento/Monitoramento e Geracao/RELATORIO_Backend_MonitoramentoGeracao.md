# Relatório — Backend do Módulo de Monitoramento & Geração

> **Projeto:** CEFE Energy Hub
>
> **Backend:** .NET 10 (Web API) — Arquitetura em 6 camadas
>
> **ORM:** Entity Framework Core (IEntityTypeConfiguration\<T\>)
>
> **Banco de Dados:** SQL Server (compartilhado entre todas as unidades)
>
> **Data:** Fevereiro/2026
>
> **⚠️ Pré-requisito:** O módulo de **Gerenciamento de Energia** é implementado **antes** deste módulo. Muitos artefatos compartilhados (entidade `Usina`, `LeituraInversor`, repositórios, `RepositorioBase`, `AppDbContext`, IoC base, autenticação JWT, etc.) já existirão quando este módulo for iniciado. Este relatório indica explicitamente quais itens devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕).

---

## 1. Visão Geral do Módulo

O módulo de **Monitoramento & Geração** é a tela principal do dashboard. Exibe, em tempo real, os indicadores de geração de energia fotovoltaica da usina selecionada, a curva de geração das últimas 24 horas, alertas proativos e informações técnicas da unidade.

| Tela | Descrição |
| --- | --- |
| **Monitoramento & Geração** | KPIs de geração (atual, diária, Performance Ratio, status), curva de geração 24h, alertas proativos, informações técnicas e dados ambientais (irradiação, temperatura) |

### Restrições de Acesso

- O módulo está disponível para **todas as unidades** cadastradas no sistema.
- O usuário deve estar autenticado (JWT) e ter uma unidade selecionada.
- Todas as requisições devem incluir o `usinaId` (id da unidade/usina) para filtrar os dados.

---

## 2. Funcionalidades Exibidas ao Usuário

### 2.1 — Tela: Monitoramento & Geração (`/dashboard`)

#### 2.1.1 — KPIs Primários (4 cards)

| KPI | Fonte do Dado | Cálculo |
| --- | --- | --- |
| **Geração Atual (kW)** | Última leitura do inversor (potência instantânea) | Valor direto da leitura mais recente |
| **Geração Diária (kWh)** | Soma acumulada das leituras do dia | `SUM(geracaoKwh)` das leituras do dia corrente |
| **Performance Ratio (%)** | Calculado no backend | `(Geração Real / Geração Teórica) × 100`. Geração Teórica = `Potência Instalada × HSP × Fator de Perdas`. Classificação: "Ótimo" (≥80%), "Bom" (≥65%), "Baixo" (<65%) |
| **Status do Sistema** | Derivado dos alertas ProjectSwitch ativos | Se há alertas com severidade alta (origem ProjectSwitch) e `Status = Ativo` → "Crítico". Se há alertas médios → "Atenção". Senão → "OK" |

#### 2.1.2 — Gráfico: Curva de Geração (últimas 24h)

- **Tipo:** Line Chart.
- **Eixo X:** Horário (HH:mm) — intervalos de 15 minutos ou agrupados por hora.
- **Eixo Y:** Potência (kW).
- **Fonte:** Registros de leitura do inversor das últimas 24 horas.
- **Comportamento:** Atualiza ao selecionar outra unidade (nova requisição com `usinaId` diferente).

#### 2.1.3 — Alertas Proativos (lista)

| Campo | Descrição |
| --- | --- |
| **Título** | Nome do alerta (ex: "Alta Temperatura - Inversor 1") |
| **Descrição** | Detalhe (ex: "Temperatura acima de 65°C detectada") |
| **Severidade** | Alto / Médio / Info |

- Fonte: Tabela `AlertaMonitoramento`, alimentada exclusivamente pelo **Job de Coleta de Alertas da API ProjectSwitch** (`target=realtime&mode=alarms`). Filtrados por `usinaId` e `status = Ativo`.
- Ordenação: Mais recentes primeiro, priorizando severidade.
- **Origem única:** ProjectSwitch (Nortebox). O backend não gera alertas internamente.

#### 2.1.4 — Informações Técnicas (card lateral)

| Dado | Fonte |
| --- | --- |
| **Potência Instalada** | Cadastro da usina (`Usina.PotenciaInstaladaKwp`) |
| **Localização** | Cadastro da usina (`Usina.Localizacao + Usina.Estado`) |
| **Data de Instalação** | Cadastro da usina (`Usina.DataInstalacao`) |
| **Irradiação Atual (W/m²)** | Última leitura do sensor de irradiação (ou API meteorológica) |
| **Temperatura Ambiente (°C)** | Última leitura do sensor de temperatura (ou API meteorológica) |

---

## 3. Endpoints da API

> **Padrão de rotas:** `api/monitoramento` (conforme `PADROES_DE_DESENVOLVIMENTO-API.md`).
> Todos os endpoints usam `[Authorize]`. O `usinaId` é passado como parâmetro de rota ou query.

### 3.1 — Resumo do Monitoramento (KPIs)

```
GET api/monitoramento/resumo?usinaId={usinaId}
```

**Request DTO:** `MonitoramentoResumoRequest`
```csharp
public class MonitoramentoResumoRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `MonitoramentoResumoResponse`

```json
{
  "geracaoAtualKw": 1847.0,
  "percentualCapacidade": 87.0,
  "geracaoDiariaKwh": 12458.0,
  "variacaoDiaAnteriorPercent": 15.0,
  "performanceRatioPercent": 85.3,
  "performanceRatioClassificacao": "Otimo",
  "statusSistema": "OK",
  "quantidadeAlertasCriticos": 1,
  "quantidadeAlertasMedios": 1
}
```

---

### 3.2 — Curva de Geração (últimas 24h)

```
GET api/monitoramento/curva-geracao?usinaId={usinaId}
```

**Request DTO:** `MonitoramentoCurvaGeracaoRequest`
```csharp
public class MonitoramentoCurvaGeracaoRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `MonitoramentoCurvaGeracaoResponse`

```json
{
  "pontos": [
    { "horario": "00:00", "potenciaKw": 0.0 },
    { "horario": "04:00", "potenciaKw": 0.0 },
    { "horario": "06:00", "potenciaKw": 150.0 },
    { "horario": "08:00", "potenciaKw": 580.0 },
    { "horario": "10:00", "potenciaKw": 1250.0 },
    { "horario": "12:00", "potenciaKw": 2100.0 },
    { "horario": "14:00", "potenciaKw": 1950.0 },
    { "horario": "16:00", "potenciaKw": 1100.0 },
    { "horario": "18:00", "potenciaKw": 320.0 },
    { "horario": "20:00", "potenciaKw": 0.0 },
    { "horario": "22:00", "potenciaKw": 0.0 }
  ]
}
```

**Response DTO aninhado:** `CurvaGeracaoPontoResponse`
```csharp
public class CurvaGeracaoPontoResponse
{
    public string Horario { get; set; }
    public decimal PotenciaKw { get; set; }
}
```

---

### 3.3 — Listar Alertas (origem: ProjectSwitch)

> **Importante:** Os alertas são alimentados exclusivamente pelo Job de Coleta que consome a API ProjectSwitch (`target=realtime&mode=alarms`). Não há endpoints de inserção ou edição manual de alertas.

```
GET api/monitoramento/alertas?usinaId={usinaId}
```

**Request DTO:** `MonitoramentoAlertasListarRequest` (herda `PaginacaoFiltro`)
```csharp
public class MonitoramentoAlertasListarRequest : PaginacaoFiltro
{
    public int UsinaId { get; set; }
    public string? Severidade { get; set; }  // "Alto", "Medio", "Info"
    public bool? ApenasAtivos { get; set; }
}
```

**Response DTO:** `MonitoramentoAlertaResponse`

```json
{
  "registros": [
    {
      "id": 1,
      "idExternoProjectSwitch": "alarm-001",
      "titulo": "Alta Temperatura - Inversor 1",
      "descricao": "Temperatura acima de 65°C detectada",
      "severidade": "Alto",
      "equipamento": "Inversor 1",
      "idEquipamentoProjectSwitch": 1042,
      "status": "Ativo",
      "visto": false,
      "dataOcorrencia": "2026-02-22T14:32:15",
      "dataResolucao": null,
      "dataSincronizacao": "2026-02-22T14:35:00"
    },
    {
      "id": 2,
      "idExternoProjectSwitch": "alarm-002",
      "titulo": "Queda de Comunicação",
      "descricao": "String 3 sem resposta há 5 minutos",
      "severidade": "Medio",
      "equipamento": "String 3",
      "idEquipamentoProjectSwitch": 1043,
      "status": "Resolvido",
      "visto": true,
      "dataOcorrencia": "2026-02-22T12:18:42",
      "dataResolucao": "2026-02-22T12:23:42",
      "dataSincronizacao": "2026-02-22T12:25:00"
    }
  ],
  "total": 2
}
```

> **Nota:** Os campos `idExternoProjectSwitch` e `idEquipamentoProjectSwitch` permitem rastreabilidade com o sistema de origem. O campo `visto` reflete o `visto` retornado pela API ProjectSwitch.

---

### 3.4 — Informações Técnicas da Usina

```
GET api/monitoramento/informacoes-tecnicas?usinaId={usinaId}
```

**Request DTO:** `MonitoramentoInformacoesTecnicasRequest`
```csharp
public class MonitoramentoInformacoesTecnicasRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `MonitoramentoInformacoesTecnicasResponse`

```json
{
  "potenciaInstalada": "2.5 MWp",
  "potenciaInstaladaKwp": 2500.0,
  "localizacao": "Ceará",
  "estado": "CE",
  "dataInstalacao": "2022-03-15",
  "irradiacaoAtualWm2": 847.0,
  "temperaturaAmbienteC": 28.0
}
```

---

### 3.5 — Dados Ambientais em Tempo Real

```
GET api/monitoramento/dados-ambientais?usinaId={usinaId}
```

**Request DTO:** `MonitoramentoDadosAmbientaisRequest`
```csharp
public class MonitoramentoDadosAmbientaisRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `MonitoramentoDadosAmbientaisResponse`

```json
{
  "irradiacaoWm2": 847.0,
  "temperaturaAmbienteC": 28.0,
  "temperaturaInversorC": 68.0,
  "dataLeitura": "2026-02-22T14:30:00"
}
```

---

## 4. Responsabilidades do Backend

### 4.1 — Coleta de Dados (Jobs)

| Job | Frequência | Fonte | Descrição |
| --- | --- | --- | --- |
| **Coleta de Leitura do Inversor** | A cada 15 min | API ProjectSwitch (`target=realtime&mode=readings`) | Lê os dados do inversor fotovoltaico (potência, energia gerada, temperatura do inversor) via API ProjectSwitch e persiste na tabela `LeituraInversor`. |
| **Coleta de Dados Ambientais** | A cada 15 min | API ProjectSwitch (`target=realtime&mode=readings`) ou API meteorológica | Lê os sensores de irradiação solar (W/m²) e temperatura ambiente (°C) e persiste na tabela `LeituraAmbiental`. |
| **Coleta de Alertas ProjectSwitch** | A cada 5 min | API ProjectSwitch (`target=realtime&mode=alarms`) | Consulta os alarmes ativos de todos os equipamentos da planta via `target=realtime&mode=alarms`. Para cada alarme retornado: insere novo `AlertaMonitoramento` se `idExternoProjectSwitch` não existe no banco, ou atualiza status/visto se já existe. Alertas que deixaram de aparecer na resposta são marcados como "Resolvido" com `DataResolucao = agora`. |
| **Sincronização Histórico de Alertas** | Diária (meia-noite) | API ProjectSwitch (`target=previousAlarms`) | Consulta `target=previousAlarms` das últimas 24h para cada equipamento. Preenche `DataResolucao` de alertas já persistidos usando o campo `data_saida` do ProjectSwitch. Garante consistência entre alertas em tempo real e histórico. |
| **Consolidação Diária de Geração** | Diária (meia-noite) | Dados internos (SQL Server) | Agrega as leituras do inversor do dia em um resumo diário (`GeracaoDiaria`): total kWh gerado, máxima potência, Performance Ratio. |

### 4.2 — Cálculos no Backend

| Cálculo | Fórmula | Quando Executar |
| --- | --- | --- |
| **Geração Atual (kW)** | Última leitura de `LeituraInversor.PotenciaAtualKw` | Ao retornar resumo |
| **Percentual da Capacidade** | `(GeracaoAtualKw / PotenciaInstaladaKwp) × 100` | Ao retornar resumo |
| **Geração Diária (kWh)** | `SUM(LeituraInversor.GeracaoKwh)` do dia corrente | Ao retornar resumo |
| **Variação vs. Dia Anterior** | `((GeracaoHoje - GeracaoOntem) / GeracaoOntem) × 100` | Ao retornar resumo |
| **Performance Ratio (%)** | `(GeracaoReal / GeracaoTeorica) × 100`, onde `GeracaoTeorica = PotenciaInstaladaKwp × HSP × (1 - FatorPerdas)` | Job de consolidação diária + ao retornar resumo |
| **Status do Sistema** | Se existem `AlertaMonitoramento` (origem ProjectSwitch) com `Severidade = "Alto"` e `Status = "Ativo"` → "Critico"; se existem `Severidade = "Medio"` → "Atencao"; senão → "OK" | Ao retornar resumo |
| **HSP (Horas de Sol Pleno)** | `SUM(IrradiacaoWm2 × IntervaloHoras) / 1000` do dia | Job de consolidação diária |

### 4.3 — Regras de Negócio Especiais (Alertas via ProjectSwitch)

> **Fonte única de alertas:** API ProjectSwitch (`target=realtime&mode=alarms`). O backend **NÃO** gera alertas internamente. Toda a detecção de falhas (temperatura alta, queda de comunicação, etc.) é responsabilidade do sistema ProjectSwitch/Nortebox.

| Regra | Descrição |
| --- | --- |
| **Inserção de Alertas (Job)** | O job consulta `target=realtime&mode=alarms&equipaments={ids}` a cada 5 min. Para cada alarme retornado, verifica se já existe `AlertaMonitoramento` com o mesmo `IdExternoProjectSwitch`. Se não existe, insere novo registro. Se existe, atualiza campo `Visto` conforme retorno da API. |
| **Resolução de Alertas (Job)** | Alarmes que constavam na coleta anterior mas **não aparecem mais** na resposta do `realtime&mode=alarms` são marcados como `Status = Resolvido` e `DataResolucao = DateTime.UtcNow`. Adicionalmente, o job diário `target=previousAlarms` preenche `DataResolucao` com o campo `data_saida` do ProjectSwitch para precisão. |
| **Mapeamento de Severidade** | O campo `nome` do alarme ProjectSwitch é usado como `Titulo`. O campo `descricao` é usado como `Descricao`. A severidade é mapeada pelo tipo do alarme conforme tabela de configuração (ex: alarmes com "temperatura" → Alto, alarmes com "comunicação" → Medio, demais → Info). |
| **Deduplicação** | O campo `IdExternoProjectSwitch` (composto por `equipamentId + nome + data_cadastro`) garante que o mesmo alarme não seja inserido duplicado entre coletas. |
| **Priorização de Alertas** | Alertas "Alto" aparecem primeiro, depois "Medio", depois "Info". Dentro da mesma severidade, mais recentes primeiro. |
| **Renovação do Token ProjectSwitch** | O backend deve monitorar a validade do token (`target=tokenValidity`) e renovar automaticamente antes do vencimento via `operation=renoveToken`. Falha na renovação deve gerar log de erro e notificação ao administrador. |

---

## 5. Diagrama de Entidades

> Todas as entidades seguem o padrão do Domínio: propriedades `virtual`, setters `protected set`, construtor vazio `protected` (EF Core), métodos `Set<Propriedade>` com validação via `RegraDeNegocioExcecao`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`
>
> **⚠️ Itens já existentes (criados no módulo Gerenciamento de Energia):**
> - `Usina` — 🔄 **ESTENDER**: entidade já existe com campos base (`Id`, `Nome`, `Localizacao`, `Estado`, `DemandaContratadaKw`, `Ativo`). Este módulo deve **adicionar**: `PotenciaInstaladaKwp` (decimal 18,2), `PotenciaInstaladaDescricao` (string, max 50), `DataInstalacao` (DateTime) e método `SetPotenciaInstaladaKwp(decimal)`.
> - `LeituraInversor` — ✅ **REUTILIZAR**: entidade idêntica já existe em `GerenciamentoEnergia/Entidades/`. Não recriar.
> - `LeituraInversorInserirComando` — ✅ **REUTILIZAR**: comando idêntico já existe em `GerenciamentoEnergia/Servicos/Comandos/`. Não recriar.
>
> Os diagramas abaixo mostram a versão **final completa** de cada entidade (incluindo campos existentes + novos). Criar apenas as entidades novas: `LeituraAmbiental`, `GeracaoDiaria`, `AlertaMonitoramento` e os enums `SeveridadeEnum`, `StatusAlertaEnum`.

```
┌──────────────────────────────────────┐
│              Usina                   │
├──────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual string Nome { get; protected set; }         │
│ virtual string Localizacao { get; protected set; }  │
│ virtual string Estado { get; protected set; }       │
│ virtual decimal PotenciaInstaladaKwp { get; prot. } │
│ virtual string PotenciaInstaladaDescricao { get; p. }│
│ virtual DateTime DataInstalacao { get; protected set; }│
│ virtual bool Ativo { get; protected set; }          │
├──────────────────────────────────────┤
│ protected Usina() { }               │
│ SetNome(string), SetLocalizacao(...) │
│ SetPotenciaInstaladaKwp(decimal)     │
│ Ativar(), Desativar()                │
└──────────┬───────────────────────────┘
           │ 1
           │
           │ N
┌──────────▼───────────────────────────┐
│         LeituraInversor              │
├──────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual int UsinaId { get; protected set; }         │
│ virtual Usina Usina { get; protected set; }         │
│ virtual DateTime DataHora { get; protected set; }   │
│ virtual decimal PotenciaAtualKw { get; prot. set; } │
│ virtual decimal GeracaoKwh { get; protected set; }  │
│ virtual decimal TemperaturaInversorC { get; prot. } │
│ virtual int NumeroInversor { get; protected set; }  │
├──────────────────────────────────────┤
│ protected LeituraInversor() { }      │
│ SetPotenciaAtualKw(decimal)          │
│ SetGeracaoKwh(decimal)               │
│ SetTemperaturaInversorC(decimal)     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│         LeituraAmbiental             │
├──────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual int UsinaId { get; protected set; }         │
│ virtual Usina Usina { get; protected set; }         │
│ virtual DateTime DataHora { get; protected set; }   │
│ virtual decimal IrradiacaoWm2 { get; prot. set; }   │
│ virtual decimal TemperaturaAmbienteC { get; prot. } │
├──────────────────────────────────────┤
│ protected LeituraAmbiental() { }     │
│ SetIrradiacaoWm2(decimal)            │
│ SetTemperaturaAmbienteC(decimal)     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│         GeracaoDiaria                │
├──────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual int UsinaId { get; protected set; }         │
│ virtual Usina Usina { get; protected set; }         │
│ virtual DateTime Data { get; protected set; }       │
│ virtual decimal GeracaoTotalKwh { get; prot. set; } │
│ virtual decimal PotenciaMaximaKw { get; prot. set; }│
│ virtual decimal PerformanceRatioPercent { get; p. }  │
│ virtual decimal HspDia { get; protected set; }      │
│ virtual decimal IrradiacaoMediaWm2 { get; prot. }   │
├──────────────────────────────────────┤
│ protected GeracaoDiaria() { }        │
│ SetGeracaoTotalKwh(decimal)          │
│ SetPerformanceRatioPercent(decimal)  │
│ SetHspDia(decimal)                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          AlertaMonitoramento                 │
├──────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }                │
│ virtual int UsinaId { get; protected set; }           │
│ virtual Usina Usina { get; protected set; }           │
│ virtual string IdExternoProjectSwitch { get; prot. }  │  ← chave de deduplicação
│ virtual int IdEquipamentoProjectSwitch { get; prot. } │  ← ID do equipamento no ProjectSwitch
│ virtual string Titulo { get; protected set; }         │  ← campo "nome" do alarme PS
│ virtual string Descricao { get; protected set; }      │  ← campo "descricao" do alarme PS
│ virtual SeveridadeEnum Severidade { get; prot. }      │  ← mapeada por regra de config
│ virtual string Equipamento { get; protected set; }    │  ← nome do equipamento PS
│ virtual StatusAlertaEnum Status { get; prot. set; }   │
│ virtual bool Visto { get; protected set; }            │  ← campo "visto" do alarme PS
│ virtual DateTime DataOcorrencia { get; prot. set; }   │  ← campo "data_cadastro" do PS
│ virtual DateTime? DataResolucao { get; prot. set; }   │  ← campo "data_saida" do PS
│ virtual DateTime? DataVisto { get; protected set; }   │  ← campo "data_vista" do PS
│ virtual DateTime DataSincronizacao { get; prot. set; }│  ← quando o job coletou
├──────────────────────────────────────────────┤
│ protected AlertaMonitoramento() { }          │
│ SetTitulo(string), SetDescricao(...)         │
│ SetSeveridade(SeveridadeEnum)                │
│ Resolver(DateTime), MarcarComoVisto(DateTime)│
│ AtualizarSincronizacao(DateTime)             │
└──────────────────────────────────────────────┘
```

### Enums do Domínio

```csharp
public enum SeveridadeEnum
{
    Info = 0,
    Medio = 1,
    Alto = 2
}

public enum StatusAlertaEnum
{
    Ativo = 0,
    Resolvido = 1
}
```

### Comandos

```
┌────────────────────────────────────────────┐
│   AlertaProjectSwitchSincronizarComando    │
├────────────────────────────────────────────┤
│ int UsinaId                                │
│ int IdEquipamentoProjectSwitch             │
│ string IdExternoProjectSwitch              │
│ string Titulo                              │  ← "nome" do alarme PS
│ string Descricao                           │  ← "descricao" do alarme PS
│ string Equipamento                         │  ← "name" do equipamento PS
│ DateTime DataOcorrencia                    │  ← "data_cadastro" do alarme PS
│ bool Visto                                 │  ← "visto" do alarme PS
│ DateTime? DataVisto                        │  ← "data_vista" do alarme PS
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│   AlertaProjectSwitchResolverComando       │
├────────────────────────────────────────────┤
│ string IdExternoProjectSwitch              │
│ DateTime DataResolucao                     │  ← "data_saida" do previousAlarms PS
└────────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   LeituraInversorInserirComando        │
├────────────────────────────────────────┤
│ int UsinaId                            │
│ DateTime DataHora                      │
│ decimal PotenciaAtualKw                │
│ decimal GeracaoKwh                     │
│ decimal TemperaturaInversorC           │
│ int NumeroInversor                     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   LeituraAmbientalInserirComando       │
├────────────────────────────────────────┤
│ int UsinaId                            │
│ DateTime DataHora                      │
│ decimal IrradiacaoWm2                  │
│ decimal TemperaturaAmbienteC           │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   GeracaoDiariaInserirComando          │
├────────────────────────────────────────┤
│ int UsinaId                            │
│ DateTime Data                          │
│ decimal GeracaoTotalKwh                │
│ decimal PotenciaMaximaKw               │
│ decimal PerformanceRatioPercent        │
│ decimal HspDia                         │
│ decimal IrradiacaoMediaWm2             │
└────────────────────────────────────────┘
```

### Diagrama de Relacionamentos

```
Usina (1) ──── (N) LeituraInversor
Usina (1) ──── (N) LeituraAmbiental
Usina (1) ──── (N) GeracaoDiaria
Usina (1) ──── (N) AlertaMonitoramento
```

---

## 6. Estrutura de Pastas por Feature

> Conforme padrões em `padroes-desenvolvimento-back-end/copilot-instructions.md`.
>
> **⚠️ Itens já existentes (criados no Gerenciamento de Energia):**
> - `Usinas/` (toda a pasta: `Usina.cs`, `IUsinasRepositorio.cs`, `UsinasServicos.cs`, `UsinaConfiguration.cs`, `UsinasRepositorio.cs`) → 🔄 **estender** `Usina.cs` e `UsinaConfiguration.cs` com novos campos
> - `GerenciamentoEnergia/Entidades/LeituraInversor.cs` → ✅ **reutilizar** (a entidade já existe)
> - `GerenciamentoEnergia/Repositorios/ILeiturasInversorRepositorio.cs` + `LeiturasInversorRepositorio.cs` → ✅ **reutilizar**
> - `GerenciamentoEnergia/Servicos/Comandos/LeituraInversorInserirComando.cs` → ✅ **reutilizar**
> - `Infra/Comum/RepositorioBase.cs`, `Infra/Contexto/AppDbContext.cs` → ✅ **já existem**
> - `Ioc/` (`ConfiguracoesDbContext`, `ConfiguracoesInjecoesDependencia`, `ConfiguracoesAutoMapper`) → ✅ **já existem** — 🔄 **adicionar** novos registros
>
> A árvore abaixo mostra a estrutura completa. Criar apenas os itens que **não** existem.

```
<Projeto>.Api/
└── Controllers/
    └── Monitoramento/
        └── MonitoramentoController.cs

<Projeto>.Aplicacao/
└── Monitoramento/
    ├── Profiles/
    │   └── MonitoramentoProfile.cs
    └── Servicos/
        ├── Interfaces/
        │   └── IMonitoramentoAppServico.cs
        └── MonitoramentoAppServico.cs

<Projeto>.DataTransfer/
└── Monitoramento/
    ├── Request/
    │   ├── MonitoramentoResumoRequest.cs
    │   ├── MonitoramentoCurvaGeracaoRequest.cs
    │   ├── MonitoramentoAlertasListarRequest.cs
    │   ├── MonitoramentoInformacoesTecnicasRequest.cs
    │   └── MonitoramentoDadosAmbientaisRequest.cs
    └── Response/
        ├── MonitoramentoResumoResponse.cs
        ├── MonitoramentoCurvaGeracaoResponse.cs
        ├── CurvaGeracaoPontoResponse.cs
        ├── MonitoramentoAlertaResponse.cs
        ├── MonitoramentoInformacoesTecnicasResponse.cs
        └── MonitoramentoDadosAmbientaisResponse.cs

<Projeto>.Dominio/
├── Usinas/
│   ├── Entidades/
│   │   └── Usina.cs
│   ├── Repositorios/
│   │   └── IUsinasRepositorio.cs
│   └── Servicos/
│       ├── Comandos/
│       │   ├── UsinasInserirComando.cs
│       │   └── UsinasEditarComando.cs
│       ├── Interfaces/
│       │   └── IUsinasServicos.cs
│       └── UsinasServicos.cs
├── Monitoramento/
│   ├── Entidades/
│   │   ├── LeituraInversor.cs
│   │   ├── LeituraAmbiental.cs
│   │   ├── GeracaoDiaria.cs
│   │   └── AlertaMonitoramento.cs
│   ├── Repositorios/
│   │   ├── ILeiturasInversorRepositorio.cs
│   │   ├── ILeiturasAmbientalRepositorio.cs
│   │   ├── IGeracoesDiariasRepositorio.cs
│   │   └── IAlertasMonitoramentoRepositorio.cs
│   └── Servicos/
│       ├── Comandos/
│       │   ├── AlertaProjectSwitchSincronizarComando.cs
│       │   ├── AlertaProjectSwitchResolverComando.cs
│       │   ├── LeituraInversorInserirComando.cs
│       │   ├── LeituraAmbientalInserirComando.cs
│       │   └── GeracaoDiariaInserirComando.cs
│       ├── Interfaces/
│       │   └── IMonitoramentoServicos.cs
│       └── MonitoramentoServicos.cs
└── libs/
    └── Enums/
        ├── SeveridadeEnum.cs
        └── StatusAlertaEnum.cs

<Projeto>.Infra/
├── Comum/
│   └── Repositorios/
│       └── RepositorioBase.cs
├── Contexto/
│   └── AppDbContext.cs
├── Migrations/
│   └── <DataHora>_<NomeMigration>.cs
├── Usinas/
│   ├── Mapeamentos/
│   │   └── UsinaConfiguration.cs
│   └── Repositorios/
│       └── UsinasRepositorio.cs
└── Monitoramento/
    ├── Mapeamentos/
    │   ├── LeituraInversorConfiguration.cs
    │   ├── LeituraAmbientalConfiguration.cs
    │   ├── GeracaoDiariaConfiguration.cs
    │   └── AlertaMonitoramentoConfiguration.cs
    └── Repositorios/
        ├── LeiturasInversorRepositorio.cs
        ├── LeiturasAmbientalRepositorio.cs
        ├── GeracoesDiariasRepositorio.cs
        └── AlertasMonitoramentoRepositorio.cs

<Projeto>.Ioc/
├── ConfiguracoesDbContext.cs              ← configura EF Core + SQL Server
├── ConfiguracoesInjecoesDependencia.cs    ← registrar todas as interfaces
└── ConfiguracoesAutoMapper.cs             ← registrar Profiles do AutoMapper
```

---

## 7. Fluxo de Dados Resumido

```
┌─────────────────────────────────────────────────────────────────────┐
│                    API ProjectSwitch (Nortebox)                     │
│           https://projectswitch.nortebox.com.br/api.php            │
│                                                                     │
│  target=realtime&mode=readings  → Leituras (inversor, ambiental)    │
│  target=realtime&mode=alarms    → Alarmes ativos (ÚNICA FONTE)     │
│  target=previousAlarms          → Histórico de alarmes             │
│  target=history                 → Histórico de leituras            │
│  target=runHistory              → Histórico de geração             │
└──────────────────┬──────────────────────────┬──────────────────────┘
                   │                          │
          a cada 15 min               a cada 5 min
                   │                          │
                   ▼                          ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│ Job Coleta Leituras      │  │ Job Coleta Alertas           │
│ (Inversor, Ambiental)    │  │ (target=realtime&mode=alarms)│
│ → LeituraInversor        │  │ → AlertaMonitoramento        │
│ → LeituraAmbiental       │  │   (insere/atualiza/resolve)  │
└────────────┬─────────────┘  └──────────────┬───────────────┘
             │                               │
             ▼                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       SQL Server                             │
│                                                              │
│  - Usina                  - AlertaMonitoramento              │
│  - LeituraInversor          (origem = ProjectSwitch)         │
│  - LeituraAmbiental       - GeracaoDiaria                    │
└──────────────────────────────┬───────────────────────────────┘
                               │
          ┌────────────────────┘
          │
          ▼
┌────────────────────────┐   ┌──────────────────────────┐
│  Job Consolidação      │   │  Job Sinc. Histórico     │
│  Diária                │   │  Alertas (diário)        │
│  → GeracaoDiaria       │   │  (target=previousAlarms) │
│  (meia-noite)          │   │  → preenche DataResolucao│
└────────────────────────┘   └──────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    .NET 10 Web API (6 camadas)               │
│                                                              │
│  Api → Aplicacao → DataTransfer + Dominio → Infra → Ioc     │
│                                                              │
│  Endpoints:                                                  │
│    GET api/monitoramento/resumo                              │
│    GET api/monitoramento/curva-geracao                       │
│    GET api/monitoramento/alertas  (somente leitura)          │
│    GET api/monitoramento/informacoes-tecnicas                │
│    GET api/monitoramento/dados-ambientais                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Volume de Dados Estimado

| Entidade | Registros/dia/usina | Registros/mês/usina | Total 8 usinas/mês |
| --- | --- | --- | --- |
| **LeituraInversor** | 96 (a cada 15 min × N inversores) | ~2.880 | ~23.040 |
| **LeituraAmbiental** | 96 (a cada 15 min) | ~2.880 | ~23.040 |
| **GeracaoDiaria** | 1 | ~30 | ~240 |
| **AlertaMonitoramento** | ~5 (variável) | ~150 | ~1.200 |
| **Usina** | — | — | 8 (cadastro) |

> **Nota:** A tabela `LeituraInversor` é a de maior volume. Considerar:
> - Índice composto em `(UsinaId, DataHora)` para consultas de curva de geração.
> - Particionamento por mês para performance em consultas históricas.
> - Política de retenção: manter dados detalhados por 12 meses, depois consolidar em `GeracaoDiaria`.

---

## 9. Checklist de Implementação

> Seguir o checklist "Nova Feature" de `padroes-desenvolvimento-back-end/copilot-instructions.md`.
> Ordem: DataTransfer → Domínio → Infra → Aplicação → API → IoC.

### 9.1 — DataTransfer
- [ ] `MonitoramentoResumoRequest.cs` em `Monitoramento/Request/`
- [ ] `MonitoramentoCurvaGeracaoRequest.cs` em `Monitoramento/Request/`
- [ ] `MonitoramentoAlertasListarRequest.cs` em `Monitoramento/Request/` (herda `PaginacaoFiltro`)
- [ ] `MonitoramentoInformacoesTecnicasRequest.cs` em `Monitoramento/Request/`
- [ ] `MonitoramentoDadosAmbientaisRequest.cs` em `Monitoramento/Request/`
- [ ] `MonitoramentoResumoResponse.cs` em `Monitoramento/Response/`
- [ ] `MonitoramentoCurvaGeracaoResponse.cs` em `Monitoramento/Response/`
- [ ] `CurvaGeracaoPontoResponse.cs` em `Monitoramento/Response/`
- [ ] `MonitoramentoAlertaResponse.cs` em `Monitoramento/Response/`
- [ ] `MonitoramentoInformacoesTecnicasResponse.cs` em `Monitoramento/Response/`
- [ ] `MonitoramentoDadosAmbientaisResponse.cs` em `Monitoramento/Response/`

### 9.2 — Domínio

#### Entidades
- [ ] 🔄 **ESTENDER** `Usina.cs` em `Usinas/Entidades/` — entidade já existe (criada no GE). Adicionar campos: `PotenciaInstaladaKwp` (decimal 18,2), `PotenciaInstaladaDescricao` (string, max 50), `DataInstalacao` (DateTime). Adicionar método `SetPotenciaInstaladaKwp(decimal)`.
- [x] ✅ ~~`LeituraInversor.cs`~~ — já existe idêntica (criada no GE em `GerenciamentoEnergia/Entidades/`). **Reutilizar diretamente.**
- [ ] 🆕 `LeituraAmbiental.cs` em `Monitoramento/Entidades/`
- [ ] 🆕 `GeracaoDiaria.cs` em `Monitoramento/Entidades/`
- [ ] 🆕 `AlertaMonitoramento.cs` em `Monitoramento/Entidades/`
- [ ] 🆕 `SeveridadeEnum.cs` em `libs/Enums/`
- [ ] 🆕 `StatusAlertaEnum.cs` em `libs/Enums/`

#### Repositórios (interfaces)
- [x] ✅ ~~`IUsinasRepositorio.cs`~~ — já existe (criada no GE em `Usinas/Repositorios/`). **Reutilizar.**
- [x] ✅ ~~`ILeiturasInversorRepositorio.cs`~~ — já existe (criada no GE em `GerenciamentoEnergia/Repositorios/`). **Reutilizar.**
- [ ] 🆕 `ILeiturasAmbientalRepositorio.cs` em `Monitoramento/Repositorios/`
- [ ] 🆕 `IGeracoesDiariasRepositorio.cs` em `Monitoramento/Repositorios/`
- [ ] 🆕 `IAlertasMonitoramentoRepositorio.cs` em `Monitoramento/Repositorios/`

#### Comandos
- [ ] 🆕 `AlertaProjectSwitchSincronizarComando.cs` em `Monitoramento/Servicos/Comandos/`
- [ ] 🆕 `AlertaProjectSwitchResolverComando.cs` em `Monitoramento/Servicos/Comandos/`
- [x] ✅ ~~`LeituraInversorInserirComando.cs`~~ — já existe idêntico (criado no GE). **Reutilizar.**
- [ ] 🆕 `LeituraAmbientalInserirComando.cs` em `Monitoramento/Servicos/Comandos/`
- [ ] 🆕 `GeracaoDiariaInserirComando.cs` em `Monitoramento/Servicos/Comandos/`

#### Serviços
- [ ] `IMonitoramentoServicos.cs` em `Monitoramento/Servicos/Interfaces/`
- [ ] `MonitoramentoServicos.cs` em `Monitoramento/Servicos/`

### 9.3 — Infraestrutura

#### Mapeamentos EF Core (IEntityTypeConfiguration\<T\>)
- [ ] 🔄 **ESTENDER** `UsinaConfiguration.cs` em `Usinas/Mapeamentos/` — já existe (GE). Adicionar mapeamentos: `PotenciaInstaladaKwp` (`potencia_instalada_kwp`, HasPrecision(18,2)), `PotenciaInstaladaDescricao` (`potencia_instalada_descricao`, HasMaxLength(50)), `DataInstalacao` (`data_instalacao`, IsRequired).
- [x] ✅ ~~`LeituraInversorConfiguration.cs`~~ — já existe idêntico (GE). Índice `IX_LeituraInversor_UsinaId_DataHora` já definido. **Não recriar.**
- [ ] 🆕 `LeituraAmbientalConfiguration.cs` em `Monitoramento/Mapeamentos/`
- [ ] 🆕 `GeracaoDiariaConfiguration.cs` em `Monitoramento/Mapeamentos/`
- [ ] 🆕 `AlertaMonitoramentoConfiguration.cs` em `Monitoramento/Mapeamentos/`

#### AppDbContext
> O `AppDbContext` já existe e já contém os `DbSet` do módulo Gerenciamento de Energia. Apenas adicionar os novos.

- [x] ✅ ~~`DbSet<Usina> Usinas`~~ — já registrado (GE)
- [x] ✅ ~~`DbSet<LeituraInversor> LeiturasInversor`~~ — já registrado (GE)
- [ ] 🆕 Adicionar `DbSet<LeituraAmbiental> LeiturasAmbiental { get; set; }` no `AppDbContext`
- [ ] 🆕 Adicionar `DbSet<GeracaoDiaria> GeracoesDiarias { get; set; }` no `AppDbContext`
- [ ] 🆕 Adicionar `DbSet<AlertaMonitoramento> AlertasMonitoramento { get; set; }` no `AppDbContext`

#### Repositórios (implementação — herdam `RepositorioBase<T>`)
- [x] ✅ ~~`UsinasRepositorio.cs`~~ — já existe (GE em `Usinas/Repositorios/`). **Reutilizar.**
- [x] ✅ ~~`LeiturasInversorRepositorio.cs`~~ — já existe (GE em `GerenciamentoEnergia/Repositorios/`). **Reutilizar.**
- [ ] 🆕 `LeiturasAmbientalRepositorio.cs` em `Monitoramento/Repositorios/`
- [ ] 🆕 `GeracoesDiariasRepositorio.cs` em `Monitoramento/Repositorios/`
- [ ] 🆕 `AlertasMonitoramentoRepositorio.cs` em `Monitoramento/Repositorios/`

#### Migrations EF Core
> A migration base (`CriarTabelasGerenciamentoEnergia`) já existe. O índice `IX_LeituraInversor_UsinaId_DataHora` já está definido. Criar migration **incremental** com as novas tabelas e alterações.

- [ ] 🔄 Criar migration **incremental**: `dotnet ef migrations add AdicionarTabelasMonitoramentoECamposUsina --project <Projeto>.Infra --startup-project <Projeto>.Api` — adicionar colunas `potencia_instalada_kwp`, `potencia_instalada_descricao`, `data_instalacao` na tabela `usinas` + criar tabelas `leituras_ambiental`, `geracoes_diarias`, `alertas_monitoramento`
- [x] ✅ ~~Índice `IX_LeituraInversor_UsinaId_DataHora`~~ — já definido na migration do GE
- [ ] 🆕 Índice composto `IX_LeituraAmbiental_UsinaId_DataHora` em `(UsinaId, DataHora)`
- [ ] 🆕 Índice composto `IX_AlertaMonitoramento_UsinaId_Status` em `(UsinaId, Status)`

### 9.4 — Aplicação
- [ ] `IMonitoramentoAppServico.cs` em `Monitoramento/Servicos/Interfaces/`
- [ ] `MonitoramentoAppServico.cs` em `Monitoramento/Servicos/` (injetar `IUnitOfWork` para operações de escrita; o `AppDbContext` já implementa Unit of Work via `SaveChangesAsync`)
- [ ] `MonitoramentoProfile.cs` em `Monitoramento/Profiles/`

### 9.5 — API
- [ ] `MonitoramentoController.cs` em `Controllers/Monitoramento/`
  - `[Route("api/monitoramento")]`
  - `[ApiController]`
  - `[Authorize]`
  - Métodos: `Resumo`, `CurvaGeracao`, `ListarAlertas` (somente leitura), `InformacoesTecnicas`, `DadosAmbientais`

### 9.6 — IoC

> ✅ O IoC já existe (criado no GE). Os registros de `IUsinasRepositorio`/`UsinasRepositorio` e `ILeiturasInversorRepositorio`/`LeiturasInversorRepositorio` já estão feitos no `ConfiguracoesInjecoesDependencia`. O `AppDbContext` e `Program.cs` já estão configurados. Apenas **adicionar** os novos registros de Monitoramento.

- [ ] 🔄 **Adicionar** ao `ConfiguracoesInjecoesDependencia.AddInjecoesDependencia` existente (nota: `IUsinasRepositorio` e `ILeiturasInversorRepositorio` já registrados no GE):
  ```
  // Repositórios
  services.AddScoped<IUsinasRepositorio, UsinasRepositorio>();
  services.AddScoped<ILeiturasInversorRepositorio, LeiturasInversorRepositorio>();
  services.AddScoped<ILeiturasAmbientalRepositorio, LeiturasAmbientalRepositorio>();
  services.AddScoped<IGeracoesDiariasRepositorio, GeracoesDiariasRepositorio>();
  services.AddScoped<IAlertasMonitoramentoRepositorio, AlertasMonitoramentoRepositorio>();

  // Serviços de Domínio
  services.AddScoped<IMonitoramentoServicos, MonitoramentoServicos>();

  // Serviços de Aplicação
  services.AddScoped<IMonitoramentoAppServico, MonitoramentoAppServico>();
  ```
- [ ] Registrar `MonitoramentoProfile` em `ConfiguracoesAutoMapper.cs`:
  ```csharp
  config.AddProfile<MonitoramentoProfile>();
  ```
- [x] ✅ ~~Configurar `AppDbContext` em `ConfiguracoesDbContext.cs`~~ — já configurado (GE)
- [x] ✅ ~~Verificar que `Program.cs` chama: `AddDbContext()`, `AddInjecoesDependencia()`, `AddAutoMapper()`~~ — já configurado (GE)

---

## 10. Resumo de Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| **Job Coleta Leituras (ProjectSwitch)** | Consumir `target=realtime&mode=readings` a cada 15 min. Persistir `LeituraInversor`, `LeituraAmbiental` no SQL Server. |
| **Job Coleta Alertas (ProjectSwitch)** | Consumir `target=realtime&mode=alarms` a cada 5 min. Inserir/atualizar/resolver `AlertaMonitoramento`. Única fonte de alertas. |
| **Job Sinc. Histórico Alertas** | Consumir `target=previousAlarms` diariamente. Preencher `DataResolucao` com `data_saida` do ProjectSwitch. |
| **Job Consolidação Diária** | Agregar leituras do dia em `GeracaoDiaria` (total kWh, potência máx., PR, HSP). |
| **API — Controller** | Expor 5 endpoints (`api/monitoramento/*`). Alertas somente leitura. Validar JWT. Delegar para AppServico. |
| **API — AppServico** | Orquestrar chamadas ao domínio. Mapear Request → Comando e Entidade → Response via AutoMapper. UnitOfWork para escrita. |
| **API — Domínio (Servicos)** | Calcular KPIs (Geração Atual, PR, Status). Validar regras de negócio. Manipular entidades. |
| **API — Domínio (Entidades)** | Encapsular dados com validação via métodos `Set`. `RegraDeNegocioExcecao` para erros. |
| **API — Infra (Repositórios)** | Persistir/consultar dados no SQL Server via Entity Framework Core. Queries LINQ com `IQueryable<T>` e paginação. Herdam `RepositorioBase<T>`. |
| **API — Infra (Mapeamentos)** | Mapear entidades para tabelas SQL Server via `IEntityTypeConfiguration<T>` (EF Core Fluent API). Descobertos automaticamente via `ApplyConfigurationsFromAssembly`. |
| **API — Infra (AppDbContext)** | Centralizar `DbSet<T>` de todas as entidades. Gerenciar schema via Migrations do EF Core. |
| **API — IoC** | `ConfiguracoesDbContext` (EF Core + SQL Server), `ConfiguracoesInjecoesDependencia` (interfaces), `ConfiguracoesAutoMapper` (Profiles). |

---

## Apêndice A — Mapeamentos EF Core (Exemplos)

> Os mapeamentos usam `IEntityTypeConfiguration<T>` (Fluent API) e são descobertos automaticamente via `modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)` no `AppDbContext`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-INFRA.md`
>
> **⚠️ Nota de reuso:**
> - `UsinaConfiguration.cs` — 🔄 **já existe** (GE) com campos base (`Id`, `Nome`, `Localizacao`, `Estado`, `DemandaContratadaKw`, `Ativo`). O código abaixo mostra a versão estendida com os novos campos (`PotenciaInstaladaKwp`, `PotenciaInstaladaDescricao`, `DataInstalacao`). Na prática, apenas **adicionar** os 3 novos mapeamentos ao `Configure()` existente.
> - `LeituraInversorConfiguration.cs` — ✅ **já existe idêntico** (GE). Código mantido abaixo apenas para referência. **Não recriar.**
> - `AlertaMonitoramentoConfiguration.cs` — 🆕 **criar do zero**.

### UsinaConfiguration.cs
```csharp
public class UsinaConfiguration : IEntityTypeConfiguration<Usina>
{
    public void Configure(EntityTypeBuilder<Usina> builder)
    {
        builder.ToTable("usinas");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Nome)
            .HasColumnName("nome")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Localizacao)
            .HasColumnName("localizacao")
            .HasMaxLength(255);

        builder.Property(x => x.Estado)
            .HasColumnName("estado")
            .HasMaxLength(2)
            .IsRequired();

        builder.Property(x => x.PotenciaInstaladaKwp)
            .HasColumnName("potencia_instalada_kwp")
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.PotenciaInstaladaDescricao)
            .HasColumnName("potencia_instalada_descricao")
            .HasMaxLength(50);

        builder.Property(x => x.DataInstalacao)
            .HasColumnName("data_instalacao")
            .IsRequired();

        builder.Property(x => x.Ativo)
            .HasColumnName("ativo")
            .IsRequired();
    }
}
```

### LeituraInversorConfiguration.cs
```csharp
public class LeituraInversorConfiguration : IEntityTypeConfiguration<LeituraInversor>
{
    public void Configure(EntityTypeBuilder<LeituraInversor> builder)
    {
        builder.ToTable("leituras_inversor");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.HasOne(x => x.Usina)
            .WithMany()
            .HasForeignKey(x => x.UsinaId);

        builder.Property(x => x.UsinaId)
            .HasColumnName("usina_id")
            .IsRequired();

        builder.Property(x => x.DataHora)
            .HasColumnName("data_hora")
            .IsRequired();

        builder.Property(x => x.PotenciaAtualKw)
            .HasColumnName("potencia_atual_kw")
            .HasPrecision(18, 2);

        builder.Property(x => x.GeracaoKwh)
            .HasColumnName("geracao_kwh")
            .HasPrecision(18, 2);

        builder.Property(x => x.TemperaturaInversorC)
            .HasColumnName("temperatura_inversor_c")
            .HasPrecision(10, 2);

        builder.Property(x => x.NumeroInversor)
            .HasColumnName("numero_inversor");

        // Índice composto para consultas de curva de geração
        builder.HasIndex(x => new { x.UsinaId, x.DataHora })
            .HasDatabaseName("IX_LeituraInversor_UsinaId_DataHora");
    }
}
```

### AlertaMonitoramentoConfiguration.cs
```csharp
public class AlertaMonitoramentoConfiguration : IEntityTypeConfiguration<AlertaMonitoramento>
{
    public void Configure(EntityTypeBuilder<AlertaMonitoramento> builder)
    {
        builder.ToTable("alertas_monitoramento");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.HasOne(x => x.Usina)
            .WithMany()
            .HasForeignKey(x => x.UsinaId);

        builder.Property(x => x.UsinaId)
            .HasColumnName("usina_id")
            .IsRequired();

        builder.Property(x => x.IdExternoProjectSwitch)
            .HasColumnName("id_externo_project_switch")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.IdEquipamentoProjectSwitch)
            .HasColumnName("id_equipamento_project_switch")
            .IsRequired();

        builder.Property(x => x.Titulo)
            .HasColumnName("titulo")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Descricao)
            .HasColumnName("descricao")
            .HasMaxLength(1000);

        builder.Property(x => x.Severidade)
            .HasColumnName("severidade")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.Equipamento)
            .HasColumnName("equipamento")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(x => x.Visto)
            .HasColumnName("visto")
            .IsRequired();

        builder.Property(x => x.DataOcorrencia)
            .HasColumnName("data_ocorrencia")
            .IsRequired();

        builder.Property(x => x.DataResolucao)
            .HasColumnName("data_resolucao");

        builder.Property(x => x.DataVisto)
            .HasColumnName("data_visto");

        builder.Property(x => x.DataSincronizacao)
            .HasColumnName("data_sincronizacao")
            .IsRequired();

        // Índice composto para consultas de alertas por usina e status
        builder.HasIndex(x => new { x.UsinaId, x.Status })
            .HasDatabaseName("IX_AlertaMonitoramento_UsinaId_Status");
    }
}
```
