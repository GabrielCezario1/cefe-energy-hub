# Relatório — Backend do Módulo de Gerenciamento de Energia

> **Projeto:** CEFE Energy Hub
>
> **Backend:** .NET 10 (Web API) — Arquitetura em 6 camadas
>
> **ORM:** Entity Framework Core (IEntityTypeConfiguration\<T\>)
>
> **Banco de Dados:** SQL Server (compartilhado entre todas as usinas)
>
> **Data:** Fevereiro/2026

---

## 1. Visão Geral do Módulo

O módulo de **Gerenciamento de Energia** possui duas telas que exibem dados de consumo energético, medições MD50 e geração solar do condomínio logístico TH01. Os dados são coletados automaticamente via jobs (MD50, inversor solar, fatura Enel) e expostos por endpoints REST. O demonstrativo da fatura Enel é gerado internamente e incluído apenas na fatura em PDF enviada aos galpões.

| Tela | Descrição |
| --- | --- |
| **Visão Geral do Condomínio** | KPIs consolidados (consumo solar, concessionária, total, demanda contratada), grid de galpões com consumo mensal |
| **Detalhe do Galpão** | KPIs do galpão (consumo acumulado, demanda contratada), gráfico de consumo diário 15 min, gráfico mensal por dia, tabela de dados diários, tabela de registros MD50 |

### Restrições de Acesso

- O módulo está disponível apenas para a usina **TH01** (`usinaId` correspondente).
- O usuário deve estar autenticado (JWT) e ter uma usina selecionada.
- Todas as requisições devem incluir o `usinaId` para filtrar os dados. A API deve validar o `usinaId` em todas as requisições.

---

## 2. Funcionalidades Exibidas ao Usuário

### 2.1 — Tela: Visão Geral do Condomínio

#### 2.1.1 — Seletor de Mês

- O usuário seleciona um mês de competência (ex: `2026-01`, `2026-02`, `2026-03`).
- **Todos os dados da tela mudam conforme o mês selecionado.**
- O backend deve retornar a lista de meses disponíveis.

#### 2.1.2 — KPIs do Condomínio (4 cards)

| KPI | Fonte do Dado | Cálculo |
| --- | --- | --- |
| **Consumo Zero Grid (kWh)** | Fatura processada (`FaturaMensalCondominio.ConsumoSolarKwh`) | `GeracaoTotalKwh - EnergiaInjetadaKwh` — calculado no processamento da fatura Enel |
| **Consumo Concessionária (kWh)** | Fatura Enel (`FaturaMensalCondominio.ConsumoConcessonariaKwh`) | Energia fornecida pela rede, extraída do processamento da fatura |
| **Consumo Total (kWh)** | Calculado no backend | `ConsumoSolarKwh + ConsumoConcessonariaKwh` |
| **Demanda Contratada (kW)** | Fatura Enel (`FaturaMensalCondominio.DemandaContratadaKw`) | Potência contratada junto à concessionária |

> **Regra:** `Consumo Total = Consumo Zero Grid + Consumo Concessionária`. Calculado no endpoint de resumo.

#### 2.1.3 — Grid de Galpões (8 cards clicáveis)

Cada card exibe:

- **Nome** do galpão (`Galpao.Nome`)
- **Consumo total** do mês (kWh) — soma dos `ResumoDiarioGalpao.ConsumoTotalKwh` do mês

O backend deve fornecer a lista de galpões com o consumo consolidado do mês.

---

### 2.2 — Tela: Detalhe do Galpão

#### 2.2.1 — Seletor de Mês

Mesmo comportamento da tela anterior. Filtra todos os dados do galpão.

#### 2.2.2 — KPIs do Galpão (2 cards)

| KPI | Fonte do Dado | Cálculo |
| --- | --- | --- |
| **Consumo Acumulado (kWh)** | `ResumoDiarioGalpao` | `SUM(ConsumoTotalKwh)` dos resumos diários do mês |
| **Demanda Contratada (kW)** | Cadastro do galpão (`Galpao.DemandaContratadaKw`) | Valor direto do cadastro |

#### 2.2.3 — Gráfico: Consumo Diário (Barras 15 min)

- Seletor de **dia** dentro do mês.
- Gráfico de barras empilhadas com dados a cada **15 minutos** (96 pontos por dia).
- Séries: **Ponta** e **Fora Ponta** (kWh).
- Fonte: registros `RegistroMD50` do dia selecionado — campos `ConsumoPonta15min` e `ConsumoForaPonta15min`.

#### 2.2.4 — Gráfico: Consumo Acumulado Mensal (Barras diárias)

- Gráfico de barras empilhadas com 1 barra por dia (~30 pontos).
- Séries: **Consumo Ponta** e **Consumo Fora Ponta** (kWh).
- Fonte: `ResumoDiarioGalpao` — campos `ConsumoPontaKwh` e `ConsumoForaPontaKwh`.

#### 2.2.5 — Tabela: Dados Diários

| Coluna | Unidade | Fonte / Cálculo |
| --- | --- | --- |
| Data | dd/mm | `ResumoDiarioGalpao.Data` |
| Consumo Ponta | kWh | `ResumoDiarioGalpao.ConsumoPontaKwh` |
| Consumo Fora Ponta | kWh | `ResumoDiarioGalpao.ConsumoForaPontaKwh` |
| Consumo Total | kWh | `ConsumoPontaKwh + ConsumoForaPontaKwh` (calculado na consolidação diária) |
| Demanda Máxima | kW | `ResumoDiarioGalpao.DemandaMaxKw` — `MAX(PotAtivT)` dos 96 registros do dia |
| Fator de Potência Médio | adimensional | `ResumoDiarioGalpao.FatPotMedio` — `AVG(FatPotT)` dos 96 registros do dia |

> **Regra de negócio:** Se `FatPotMedio < 0.92`, o campo é marcado como alerta no response (campo `fatPotMedioBaixo: true`).

#### 2.2.6 — Tabela: Registros MD50 (15 min)

- Seletor de **dia**.
- Tabela com **96 linhas** (uma por intervalo de 15 min).

| Coluna | Campo da Entidade `RegistroMD50` | Tipo |
| --- | --- | --- |
| Horário | `DataHora` (formatado HH:mm) | DateTime |
| C. Ponta (kWh) | `ConsumoPonta15min` | decimal |
| C. F. Ponta (kWh) | `ConsumoForaPonta15min` | decimal |
| E. Ind. Ponta | `EnergIndPonta15min` | decimal |
| E. Ind. F.P. | `EnergIndForaPonta15min` | decimal |
| E. Cap. Ponta | `EnergCapPonta` | decimal |
| E. Cap. F.P. | `EnergCapForaPonta` | decimal |
| Pot. Ativa (kW) | `PotAtivT` | decimal |
| Fat. Potência | `FatPotT` | decimal |

> **Regra de negócio:** Se `FatPotT < 0.92`, o campo é marcado como alerta no response (campo `fatPotAlerta: true`).

---

## 3. Endpoints da API

> **Padrão de rotas:** `api/gerenciamento-energia` (conforme `PADROES_DE_DESENVOLVIMENTO-API.md`).
> Todos os endpoints usam `[Authorize]`. O `usinaId` é passado como query parameter.

### 3.1 — Listar Meses Disponíveis

```
GET api/gerenciamento-energia/meses?usinaId={usinaId}
```

**Request DTO:** `GerenciamentoEnergiaMesesListarRequest`
```csharp
public class GerenciamentoEnergiaMesesListarRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `GerenciamentoEnergiaMesesResponse`

```json
{
  "meses": ["2026-01", "2026-02", "2026-03"]
}
```

---

### 3.2 — Resumo do Condomínio (KPIs)

```
GET api/gerenciamento-energia/resumo?usinaId={usinaId}&mes=2026-01
```

**Request DTO:** `GerenciamentoEnergiaResumoRequest`
```csharp
public class GerenciamentoEnergiaResumoRequest
{
    public int UsinaId { get; set; }
    public string Mes { get; set; }
}
```

**Response DTO:** `GerenciamentoEnergiaResumoResponse`

```json
{
  "mes": "2026-01",
  "consumoSolarKwh": 12200.00,
  "consumoConcessonariaKwh": 21743.00,
  "consumoTotalKwh": 33943.00,
  "demandaContratadaKw": 150.00,
  "valorTotalBrl": 25122.45
}
```

---

### 3.3 — Listar Galpões (com consumo mensal)

```
GET api/gerenciamento-energia/galpoes?usinaId={usinaId}&mes=2026-01
```

**Request DTO:** `GerenciamentoEnergiaGalpoesListarRequest`
```csharp
public class GerenciamentoEnergiaGalpoesListarRequest
{
    public int UsinaId { get; set; }
    public string Mes { get; set; }
}
```

**Response DTO:** `GerenciamentoEnergiaGalpaoResponse`

```json
{
  "galpoes": [
    {
      "id": 1,
      "nome": "Mercado Livre",
      "consumoTotalKwh": 4521.00,
      "demandaContratadaKw": 75.00
    }
  ]
}
```

---

### 3.4 — Dados Mensais Consolidados do Galpão

```
GET api/gerenciamento-energia/galpoes/{galpaoId}/mensal?usinaId={usinaId}
```

**Request DTO:** `GerenciamentoEnergiaGalpaoMensalRequest`
```csharp
public class GerenciamentoEnergiaGalpaoMensalRequest
{
    public int UsinaId { get; set; }
    public int GalpaoId { get; set; }
}
```

**Response DTO:** `GerenciamentoEnergiaGalpaoMensalResponse`

```json
{
  "meses": [
    {
      "mes": "2026-01",
      "consumoTotalKwh": 4295.00,
      "demandaContratadaKw": 75.00
    }
  ]
}
```

**Response DTO aninhado:** `GalpaoResumoMensalResponse`
```csharp
public class GalpaoResumoMensalResponse
{
    public string Mes { get; set; }
    public decimal ConsumoTotalKwh { get; set; }
    public decimal DemandaContratadaKw { get; set; }
}
```

---

### 3.5 — Dados Diários do Galpão

```
GET api/gerenciamento-energia/galpoes/{galpaoId}/diario?usinaId={usinaId}&mes=2026-01
```

**Request DTO:** `GerenciamentoEnergiaGalpaoDiarioListarRequest`
```csharp
public class GerenciamentoEnergiaGalpaoDiarioListarRequest
{
    public int UsinaId { get; set; }
    public int GalpaoId { get; set; }
    public string Mes { get; set; }
}
```

**Response DTO:** `GerenciamentoEnergiaResumoDiarioResponse`

```json
{
  "dias": [
    {
      "data": "2026-01-01",
      "consumoPontaKwh": 35.28,
      "consumoForaPontaKwh": 90.72,
      "consumoTotalKwh": 126.00,
      "demandaMaxKw": 52.50,
      "fatPotMedio": 0.94,
      "fatPotMedioBaixo": false
    }
  ]
}
```

**Response DTO aninhado:** `ResumoDiarioGalpaoResponse`
```csharp
public class ResumoDiarioGalpaoResponse
{
    public string Data { get; set; }
    public decimal ConsumoPontaKwh { get; set; }
    public decimal ConsumoForaPontaKwh { get; set; }
    public decimal ConsumoTotalKwh { get; set; }
    public decimal DemandaMaxKw { get; set; }
    public decimal FatPotMedio { get; set; }
    public bool FatPotMedioBaixo { get; set; }
}
```

---

### 3.6 — Registros MD50 (15 min)

```
GET api/gerenciamento-energia/galpoes/{galpaoId}/registros?usinaId={usinaId}&data=2026-01-01
```

**Request DTO:** `GerenciamentoEnergiaRegistrosListarRequest`
```csharp
public class GerenciamentoEnergiaRegistrosListarRequest
{
    public int UsinaId { get; set; }
    public int GalpaoId { get; set; }
    public string Data { get; set; }
}
```

**Response DTO:** `GerenciamentoEnergiaRegistroMD50Response`

```json
{
  "registros": [
    {
      "dataHora": "2026-01-01T00:00:00",
      "consumoPonta": 0.00,
      "consumoForaPonta": 2.34,
      "consumoReserv": 0.00,
      "energIndPonta": 0.00,
      "energIndForaPonta": 0.09,
      "energCapPonta": 0.00,
      "energCapForaPonta": 0.04,
      "maxPotAtivPonta": 0.00,
      "maxPotAtivForaPonta": 18.30,
      "consumoPonta15min": 0.00,
      "consumoForaPonta15min": 2.34,
      "energIndPonta15min": 0.00,
      "energIndForaPonta15min": 0.09,
      "potAtivT": 18.30,
      "fatPotT": 0.95,
      "fatPotAlerta": false
    }
  ]
}
```

---

## 4. Responsabilidades do Backend

### 4.1 — Coleta de Dados (Jobs)

| Job | Frequência | Fonte | Descrição |
| --- | --- | --- | --- |
| **Coleta MD50** | A cada 15 min | Medidor Embrasul MD50 (por galpão) | Lê os registros do módulo Embrasul MD50 de cada galpão e persiste na tabela `RegistroMD50`. São 96 registros/dia/galpão. |
| **Coleta Inversor Solar** | A cada 15 min | API ProjectSwitch (`target=realtime&mode=readings`) | Lê os dados do inversor fotovoltaico (potência, energia gerada, temperatura) via API ProjectSwitch e persiste na tabela `LeituraInversor`. Geração é centralizada (um ponto por usina). |
| **Processamento de Fatura Enel** | Mensal (via job) | Dados da fatura da concessionária Enel | Processa os dados da fatura da Enel e persiste `FaturaMensalCondominio` + `ItemDemonstrativoFatura`. Calcula o autoconsumo solar: busca `Σ GeracaoKwh` das `LeituraInversor` do mês, extrai `EnergiaInjetadaKwh` da fatura, calcula `ConsumoSolarKwh = GeracaoTotalKwh - EnergiaInjetadaKwh`. |
| **Consolidação Diária** | Diária (meia-noite) ou sob demanda | Dados internos (SQL Server) | Agrega os 96 registros `RegistroMD50` do dia em um `ResumoDiarioGalpao` (consumo ponta/fora ponta, demanda máx, fator de potência médio, custo estimado). |
| **Geração de Faturas Individuais** | Mensal (quando mês fecha) | Dados internos (SQL Server) | Calcula o rateio por galpão e envia a fatura individual automaticamente ao responsável via e-mail. |

### 4.2 — Cálculos no Backend

| Cálculo | Fórmula | Quando Executar |
| --- | --- | --- |
| **Consumo Total do Condomínio** | `ConsumoSolarKwh + ConsumoConcessonariaKwh` | Ao retornar o resumo mensal (endpoint 3.2) |
| **Consumo Total do Galpão (diário)** | `SUM(ConsumoPonta15min) + SUM(ConsumoForaPonta15min)` dos 96 registros MD50 do dia | Job de consolidação diária |
| **Demanda Máxima (diária)** | `MAX(PotAtivT)` dos 96 registros do dia | Job de consolidação diária |
| **Fator de Potência Médio (diário)** | `AVG(FatPotT)` dos 96 registros do dia | Job de consolidação diária |
| **Custo Estimado (diário)** | `ConsumoTotalKwh × tarifa média` | Job de consolidação diária |
| **Consumo do Condomínio (perdas)** | `Consumo Total (Enel) - Σ Consumo de cada galpão (MD50)` | Ao gerar fatura individual (mensal) |
| **Classificação Ponta/Fora Ponta** | Horário do registro: Ponta = 18h–21h, Fora Ponta = restante | Na persistência do registro MD50 |
| **AutoConsumo Solar** | `GeracaoTotalKwh(Σ LeituraInversor.GeracaoKwh do mês) - EnergiaInjetadaKwh(fatura Enel)` | Job Processamento de Fatura Enel (mensal). Resultado persistido em `FaturaMensalCondominio.ConsumoSolarKwh`. |
| **Alerta Fator de Potência** | Se `FatPotMedio < 0.92` → `fatPotMedioBaixo = true`. Se `FatPotT < 0.92` → `fatPotAlerta = true`. | Ao retornar dados diários e registros MD50 |

### 4.3 — Regra de Consumo do Condomínio

> *"Não há fórmula de perdas técnicas. Tudo o que não foi consumido pelos galpões deve ser atribuído ao condomínio."*

```
Consumo Condomínio = Consumo Total (Enel) - Σ Consumo de cada galpão (MD50)
```

Esse valor deve ser incluído no rateio como "Área Comum / Condomínio".

---

## 5. Diagrama de Entidades

> Todas as entidades seguem o padrão do Domínio: propriedades `virtual`, setters `protected set`, construtor vazio `protected` (EF Core), métodos `Set<Propriedade>` com validação via `RegraDeNegocioExcecao`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`

```
┌──────────────────────────────────────┐
│              Usina                   │
├──────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual string Nome { get; protected set; }         │
│ virtual string Localizacao { get; protected set; }  │
│ virtual string Estado { get; protected set; }       │
│ virtual decimal DemandaContratadaKw { get; prot. }  │
│ virtual bool Ativo { get; protected set; }          │
├──────────────────────────────────────┤
│ protected Usina() { }               │
│ SetNome(string), SetLocalizacao(...) │
│ SetDemandaContratadaKw(decimal)      │
│ Ativar(), Desativar()                │
└──────────┬───────────────────────────┘
           │ 1
           │
           │ N
┌──────────▼───────────────────────────┐
│              Galpao                  │
├──────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual int UsinaId { get; protected set; }         │
│ virtual Usina Usina { get; protected set; }         │
│ virtual string Nome { get; protected set; }         │
│ virtual decimal DemandaContratadaKw { get; prot. }  │
│ virtual string NumeroSerialMedidor { get; prot. }   │
│ virtual bool Ativo { get; protected set; }          │
├──────────────────────────────────────┤
│ protected Galpao() { }              │
│ SetNome(string)                      │
│ SetDemandaContratadaKw(decimal)      │
│ SetNumeroSerialMedidor(string)       │
│ Ativar(), Desativar()                │
└──────────┬───────────────────────────┘
           │ 1
           │
           │ N
┌──────────▼───────────────────────────┐
│          RegistroMD50                │
├──────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual int GalpaoId { get; protected set; }        │
│ virtual Galpao Galpao { get; protected set; }       │
│ virtual DateTime DataHora { get; protected set; }   │
│ virtual decimal ConsumoPonta { get; prot. set; }    │
│ virtual decimal ConsumoForaPonta { get; prot. set; }│
│ virtual decimal ConsumoReserv { get; prot. set; }   │
│ virtual decimal EnergIndPonta { get; prot. set; }   │
│ virtual decimal EnergIndForaPonta { get; prot. set; }│
│ virtual decimal EnergCapPonta { get; prot. set; }   │
│ virtual decimal EnergCapForaPonta { get; prot. set; }│
│ virtual decimal MaxPotAtivPonta { get; prot. set; } │
│ virtual decimal MaxPotAtivForaPonta { get; prot. }  │
│ virtual decimal ConsumoPonta15min { get; prot. }    │
│ virtual decimal ConsumoForaPonta15min { get; prot. }│
│ virtual decimal EnergIndPonta15min { get; prot. }   │
│ virtual decimal EnergIndForaPonta15min { get; prot. }│
│ virtual decimal PotAtivT { get; protected set; }    │
│ virtual decimal FatPotT { get; protected set; }     │
├──────────────────────────────────────┤
│ protected RegistroMD50() { }         │
│ SetConsumoPonta(decimal)             │
│ SetConsumoForaPonta(decimal)         │
│ SetPotAtivT(decimal)                 │
│ SetFatPotT(decimal)                  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       ResumoDiarioGalpao             │
├──────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual int GalpaoId { get; protected set; }        │
│ virtual Galpao Galpao { get; protected set; }       │
│ virtual DateTime Data { get; protected set; }       │
│ virtual decimal ConsumoPontaKwh { get; prot. set; } │
│ virtual decimal ConsumoForaPontaKwh { get; prot. }  │
│ virtual decimal ConsumoTotalKwh { get; prot. set; } │
│ virtual decimal DemandaMaxKw { get; prot. set; }    │
│ virtual decimal FatPotMedio { get; prot. set; }     │
│ virtual decimal CustoEstimadoBrl { get; prot. set; }│
├──────────────────────────────────────┤
│ protected ResumoDiarioGalpao() { }   │
│ SetConsumoPontaKwh(decimal)          │
│ SetConsumoForaPontaKwh(decimal)      │
│ SetConsumoTotalKwh(decimal)          │
│ SetDemandaMaxKw(decimal)             │
│ SetFatPotMedio(decimal)              │
│ SetCustoEstimadoBrl(decimal)         │
└──────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│       FaturaMensalCondominio                 │
├──────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }                │
│ virtual int UsinaId { get; protected set; }           │
│ virtual Usina Usina { get; protected set; }           │
│ virtual string Mes { get; protected set; }            │  ← "2026-01"
│ virtual decimal ValorTotalBrl { get; prot. set; }     │
│ virtual decimal ConsumoTotalKwh { get; prot. set; }   │
│ virtual decimal GeracaoTotalKwh { get; prot. set; }   │
│ virtual decimal EnergiaInjetadaKwh { get; prot. set; } │
│ virtual decimal ConsumoSolarKwh { get; prot. set; }   │  ← GeracaoTotal - EnergiaInjetada
│ virtual decimal ConsumoConcessonariaKwh { get; prot. }│
│ virtual decimal DemandaContratadaKw { get; prot. }    │
├──────────────────────────────────────────────┤
│ protected FaturaMensalCondominio() { }       │
│ SetMes(string)                               │
│ SetValorTotalBrl(decimal)                    │
│ SetConsumoTotalKwh(decimal)                  │
│ SetGeracaoTotalKwh(decimal)                  │
│ SetEnergiaInjetadaKwh(decimal)               │
│ SetConsumoSolarKwh(decimal)                  │
│ SetConsumoConcessonariaKwh(decimal)          │
│ SetDemandaContratadaKw(decimal)              │
└──────────┬───────────────────────────────────┘
           │ 1
           │
           │ N
┌──────────▼───────────────────────────────────┐
│       ItemDemonstrativoFatura                │
├──────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }                │
│ virtual int FaturaId { get; protected set; }          │
│ virtual FaturaMensalCondominio Fatura { get; prot. }  │
│ virtual string Indicador { get; protected set; }      │
│ virtual decimal? Quantidade { get; protected set; }   │
│ virtual string UnidadeMedida { get; protected set; }  │
│ virtual decimal? Tarifa { get; protected set; }       │
│ virtual decimal Valor { get; protected set; }         │
│ virtual decimal BaseIcms { get; protected set; }      │
│ virtual decimal AliquotaIcms { get; protected set; }  │
│ virtual decimal ValorIcms { get; protected set; }     │
├──────────────────────────────────────────────┤
│ protected ItemDemonstrativoFatura() { }      │
│ SetIndicador(string)                         │
│ SetValor(decimal)                            │
│ SetBaseIcms(decimal)                         │
│ SetAliquotaIcms(decimal)                     │
│ SetValorIcms(decimal)                        │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│       LeituraInversor                        │
├──────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }                │
│ virtual int UsinaId { get; protected set; }           │
│ virtual Usina Usina { get; protected set; }           │
│ virtual DateTime DataHora { get; protected set; }     │
│ virtual decimal PotenciaAtualKw { get; prot. set; }   │
│ virtual decimal GeracaoKwh { get; protected set; }    │
│ virtual decimal TemperaturaInversorC { get; prot. }   │
│ virtual int NumeroInversor { get; protected set; }    │
├──────────────────────────────────────────────┤
│ protected LeituraInversor() { }              │
│ SetPotenciaAtualKw(decimal)                  │
│ SetGeracaoKwh(decimal)                       │
│ SetTemperaturaInversorC(decimal)             │
└──────────────────────────────────────────────┘
```

### Enums do Domínio

```csharp
public enum ClassificacaoHorarioEnum
{
    ForaPonta = 0,
    Ponta = 1,
    Reservado = 2
}
```

### Comandos

```
┌────────────────────────────────────────────┐
│   RegistroMD50InserirComando               │
├────────────────────────────────────────────┤
│ int GalpaoId                               │
│ DateTime DataHora                          │
│ decimal ConsumoPonta                       │
│ decimal ConsumoForaPonta                   │
│ decimal ConsumoReserv                      │
│ decimal EnergIndPonta                      │
│ decimal EnergIndForaPonta                  │
│ decimal EnergCapPonta                      │
│ decimal EnergCapForaPonta                  │
│ decimal MaxPotAtivPonta                    │
│ decimal MaxPotAtivForaPonta                │
│ decimal ConsumoPonta15min                  │
│ decimal ConsumoForaPonta15min              │
│ decimal EnergIndPonta15min                 │
│ decimal EnergIndForaPonta15min             │
│ decimal PotAtivT                           │
│ decimal FatPotT                            │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│   ResumoDiarioGalpaoInserirComando         │
├────────────────────────────────────────────┤
│ int GalpaoId                               │
│ DateTime Data                              │
│ decimal ConsumoPontaKwh                    │
│ decimal ConsumoForaPontaKwh                │
│ decimal ConsumoTotalKwh                    │
│ decimal DemandaMaxKw                       │
│ decimal FatPotMedio                        │
│ decimal CustoEstimadoBrl                   │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│   FaturaMensalCondominioInserirComando     │
├────────────────────────────────────────────┤
│ int UsinaId                                │
│ string Mes                                 │
│ decimal ValorTotalBrl                      │
│ decimal ConsumoTotalKwh                    │
│ decimal GeracaoTotalKwh                    │
│ decimal EnergiaInjetadaKwh                 │
│ decimal ConsumoSolarKwh                    │
│ decimal ConsumoConcessonariaKwh            │
│ decimal DemandaContratadaKw                │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│   ItemDemonstrativoFaturaInserirComando    │
├────────────────────────────────────────────┤
│ int FaturaId                               │
│ string Indicador                           │
│ decimal? Quantidade                        │
│ string UnidadeMedida                       │
│ decimal? Tarifa                            │
│ decimal Valor                              │
│ decimal BaseIcms                           │
│ decimal AliquotaIcms                       │
│ decimal ValorIcms                          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│   LeituraInversorInserirComando            │
├────────────────────────────────────────────┤
│ int UsinaId                                │
│ DateTime DataHora                          │
│ decimal PotenciaAtualKw                    │
│ decimal GeracaoKwh                         │
│ decimal TemperaturaInversorC               │
│ int NumeroInversor                         │
└────────────────────────────────────────────┘
```

### Diagrama de Relacionamentos

```
Usina (1) ──── (N) Galpao
Usina (1) ──── (N) FaturaMensalCondominio
Usina (1) ──── (N) LeituraInversor

Galpao (1) ──── (N) RegistroMD50
Galpao (1) ──── (N) ResumoDiarioGalpao

FaturaMensalCondominio (1) ──── (N) ItemDemonstrativoFatura
```

---

## 6. Estrutura de Pastas por Feature

> Conforme padrões em `padroes-desenvolvimento-back-end/copilot-instructions.md`.

```
<Projeto>.Api/
└── Controllers/
    └── GerenciamentoEnergia/
        └── GerenciamentoEnergiaController.cs

<Projeto>.Aplicacao/
└── GerenciamentoEnergia/
    ├── Profiles/
    │   └── GerenciamentoEnergiaProfile.cs
    └── Servicos/
        ├── Interfaces/
        │   └── IGerenciamentoEnergiaAppServico.cs
        └── GerenciamentoEnergiaAppServico.cs

<Projeto>.DataTransfer/
└── GerenciamentoEnergia/
    ├── Request/
    │   ├── GerenciamentoEnergiaMesesListarRequest.cs
    │   ├── GerenciamentoEnergiaResumoRequest.cs
    │   ├── GerenciamentoEnergiaGalpoesListarRequest.cs
    │   ├── GerenciamentoEnergiaGalpaoMensalRequest.cs
    │   ├── GerenciamentoEnergiaGalpaoDiarioListarRequest.cs
    │   └── GerenciamentoEnergiaRegistrosListarRequest.cs
    └── Response/
        ├── GerenciamentoEnergiaMesesResponse.cs
        ├── GerenciamentoEnergiaResumoResponse.cs
        ├── GerenciamentoEnergiaGalpaoResponse.cs
        ├── GerenciamentoEnergiaGalpaoMensalResponse.cs
        ├── GalpaoResumoMensalResponse.cs
        ├── GerenciamentoEnergiaResumoDiarioResponse.cs
        ├── ResumoDiarioGalpaoResponse.cs
        ├── GerenciamentoEnergiaRegistroMD50Response.cs
        └── RegistroMD50DetalheResponse.cs

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
├── GerenciamentoEnergia/
│   ├── Entidades/
│   │   ├── Galpao.cs
│   │   ├── RegistroMD50.cs
│   │   ├── ResumoDiarioGalpao.cs
│   │   ├── FaturaMensalCondominio.cs
│   │   ├── ItemDemonstrativoFatura.cs
│   │   └── LeituraInversor.cs
│   ├── Repositorios/
│   │   ├── IGalpoesRepositorio.cs
│   │   ├── IRegistrosMD50Repositorio.cs
│   │   ├── IResumosDiariosGalpaoRepositorio.cs
│   │   ├── IFaturasMensaisCondominioRepositorio.cs
│   │   ├── IItensDemonstrativoFaturaRepositorio.cs
│   │   └── ILeiturasInversorRepositorio.cs
│   └── Servicos/
│       ├── Comandos/
│       │   ├── RegistroMD50InserirComando.cs
│       │   ├── ResumoDiarioGalpaoInserirComando.cs
│       │   ├── FaturaMensalCondominioInserirComando.cs
│       │   ├── ItemDemonstrativoFaturaInserirComando.cs
│       │   └── LeituraInversorInserirComando.cs
│       ├── Interfaces/
│       │   └── IGerenciamentoEnergiaServicos.cs
│       └── GerenciamentoEnergiaServicos.cs
└── libs/
    └── Enums/
        └── ClassificacaoHorarioEnum.cs

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
└── GerenciamentoEnergia/
    ├── Mapeamentos/
    │   ├── GalpaoConfiguration.cs
    │   ├── RegistroMD50Configuration.cs
    │   ├── ResumoDiarioGalpaoConfiguration.cs
    │   ├── FaturaMensalCondominioConfiguration.cs
    │   ├── ItemDemonstrativoFaturaConfiguration.cs
    │   └── LeituraInversorConfiguration.cs
    └── Repositorios/
        ├── GalpoesRepositorio.cs
        ├── RegistrosMD50Repositorio.cs
        ├── ResumosDiariosGalpaoRepositorio.cs
        ├── FaturasMensaisCondominioRepositorio.cs
        ├── ItensDemonstrativoFaturaRepositorio.cs
        └── LeiturasInversorRepositorio.cs

<Projeto>.Ioc/
├── ConfiguracoesDbContext.cs              ← configura EF Core + SQL Server
├── ConfiguracoesInjecoesDependencia.cs    ← registrar todas as interfaces
└── ConfiguracoesAutoMapper.cs             ← registrar Profiles do AutoMapper
```

---

## 7. Fluxo de Dados Resumido

```
┌──────────────────────────────────────────────────────────────────┐
│                    Fontes de Dados Externas                      │
│                                                                  │
│  Embrasul MD50 (medidores por galpão)                            │
│  Inversor Solar (geração fotovoltaica centralizada)              │
│  Fatura Enel (dados da concessionária)                           │
└──────┬──────────────────┬──────────────────┬─────────────────────┘
       │                  │                  │
  a cada 15 min     a cada 15 min        mensal (job)
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌───────────────────┐
│ Job Coleta   │  │ Job Coleta   │  │ Job Processamento │
│ MD50         │  │ Solar        │  │ Fatura Enel       │
│ → RegistroMD50│  │ → LeituraInv│  │ → FaturaMensal    │
│              │  │   ersor      │  │ → ItemDemonstr.   │
└──────┬───────┘  └──────┬───────┘  └──────┬────────────┘
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│                       SQL Server                             │
│                                                              │
│  - Usina                      - FaturaMensalCondominio       │
│  - Galpao                     - ItemDemonstrativoFatura      │
│  - RegistroMD50               - LeituraInversor              │
│  - ResumoDiarioGalpao                                        │
└──────────────────────────────┬───────────────────────────────┘
                               │
          ┌────────────────────┤
          │                    │
          ▼                    ▼
┌────────────────────────┐  ┌──────────────────────────┐
│  Job Consolidação      │  │  Job Envio de Faturas    │
│  Diária                │  │  Individuais (email)     │
│  → ResumoDiarioGalpao  │  │  (mensal, quando fecha)  │
│  (meia-noite)          │  │                          │
└────────────────────────┘  └──────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    .NET 10 Web API (6 camadas)               │
│                                                              │
│  Api → Aplicacao → DataTransfer + Dominio → Infra → Ioc     │
│                                                              │
│  Endpoints:                                                  │
│    GET api/gerenciamento-energia/meses                       │
│    GET api/gerenciamento-energia/resumo                      │
│    GET api/gerenciamento-energia/galpoes                     │
│    GET api/gerenciamento-energia/galpoes/{id}/mensal         │
│    GET api/gerenciamento-energia/galpoes/{id}/diario         │
│    GET api/gerenciamento-energia/galpoes/{id}/registros      │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Volume de Dados Estimado

| Entidade | Registros/dia/galpão | Registros/mês/galpão | Total 8 galpões/mês |
| --- | --- | --- | --- |
| **RegistroMD50** | 96 | ~2.880 | ~23.040 |
| **ResumoDiarioGalpao** | 1 | ~30 | ~240 |
| **LeituraInversor** | 96 (por usina) | ~2.880 | ~2.880 |
| **ItemDemonstrativoFatura** | — | ~7 | ~7 |
| **FaturaMensalCondominio** | — | 1 | 1 |
| **Galpao** | — | — | 8 (cadastro) |
| **Usina** | — | — | 1 (cadastro) |

> **Atenção ao crescimento:** ~23.000 registros MD50 por mês por usina. Considerar:
> - Índice composto em `(GalpaoId, DataHora)` para consultas de registros por dia.
> - Índice composto em `(GalpaoId, Data)` em `ResumoDiarioGalpao` para consultas mensais.
> - Particionamento por mês para performance em consultas históricas.
> - Política de retenção: manter dados detalhados por 12 meses, depois consolidar em `ResumoDiarioGalpao`.

---

## 9. Checklist de Implementação

> Seguir o checklist "Nova Feature" de `padroes-desenvolvimento-back-end/copilot-instructions.md`.
> Ordem: DataTransfer → Domínio → Infra → Aplicação → API → IoC.

### 9.1 — DataTransfer
- [ ] `GerenciamentoEnergiaMesesListarRequest.cs` em `GerenciamentoEnergia/Request/`
- [ ] `GerenciamentoEnergiaResumoRequest.cs` em `GerenciamentoEnergia/Request/`
- [ ] `GerenciamentoEnergiaGalpoesListarRequest.cs` em `GerenciamentoEnergia/Request/`
- [ ] `GerenciamentoEnergiaGalpaoMensalRequest.cs` em `GerenciamentoEnergia/Request/`
- [ ] `GerenciamentoEnergiaGalpaoDiarioListarRequest.cs` em `GerenciamentoEnergia/Request/`
- [ ] `GerenciamentoEnergiaRegistrosListarRequest.cs` em `GerenciamentoEnergia/Request/`
- [ ] `GerenciamentoEnergiaMesesResponse.cs` em `GerenciamentoEnergia/Response/`
- [ ] `GerenciamentoEnergiaResumoResponse.cs` em `GerenciamentoEnergia/Response/`
- [ ] `GerenciamentoEnergiaGalpaoResponse.cs` em `GerenciamentoEnergia/Response/`
- [ ] `GerenciamentoEnergiaGalpaoMensalResponse.cs` em `GerenciamentoEnergia/Response/`
- [ ] `GalpaoResumoMensalResponse.cs` em `GerenciamentoEnergia/Response/`
- [ ] `GerenciamentoEnergiaResumoDiarioResponse.cs` em `GerenciamentoEnergia/Response/`
- [ ] `ResumoDiarioGalpaoResponse.cs` em `GerenciamentoEnergia/Response/`
- [ ] `GerenciamentoEnergiaRegistroMD50Response.cs` em `GerenciamentoEnergia/Response/`
- [ ] `RegistroMD50DetalheResponse.cs` em `GerenciamentoEnergia/Response/`

### 9.2 — Domínio

#### Entidades
- [ ] `Usina.cs` em `Usinas/Entidades/` (virtual, protected set, construtor protected, métodos Set)
- [ ] `Galpao.cs` em `GerenciamentoEnergia/Entidades/`
- [ ] `RegistroMD50.cs` em `GerenciamentoEnergia/Entidades/`
- [ ] `ResumoDiarioGalpao.cs` em `GerenciamentoEnergia/Entidades/`
- [ ] `FaturaMensalCondominio.cs` em `GerenciamentoEnergia/Entidades/`
- [ ] `ItemDemonstrativoFatura.cs` em `GerenciamentoEnergia/Entidades/`
- [ ] `LeituraInversor.cs` em `GerenciamentoEnergia/Entidades/`
- [ ] `ClassificacaoHorarioEnum.cs` em `libs/Enums/`

#### Repositórios (interfaces)
- [ ] `IUsinasRepositorio.cs` em `Usinas/Repositorios/`
- [ ] `IGalpoesRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `IRegistrosMD50Repositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `IResumosDiariosGalpaoRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `IFaturasMensaisCondominioRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `IItensDemonstrativoFaturaRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `ILeiturasInversorRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`

#### Comandos
- [ ] `RegistroMD50InserirComando.cs` em `GerenciamentoEnergia/Servicos/Comandos/`
- [ ] `ResumoDiarioGalpaoInserirComando.cs` em `GerenciamentoEnergia/Servicos/Comandos/`
- [ ] `FaturaMensalCondominioInserirComando.cs` em `GerenciamentoEnergia/Servicos/Comandos/`
- [ ] `ItemDemonstrativoFaturaInserirComando.cs` em `GerenciamentoEnergia/Servicos/Comandos/`
- [ ] `LeituraInversorInserirComando.cs` em `GerenciamentoEnergia/Servicos/Comandos/`

#### Serviços
- [ ] `IGerenciamentoEnergiaServicos.cs` em `GerenciamentoEnergia/Servicos/Interfaces/`
- [ ] `GerenciamentoEnergiaServicos.cs` em `GerenciamentoEnergia/Servicos/`

### 9.3 — Infraestrutura

#### Mapeamentos EF Core (IEntityTypeConfiguration\<T\>)
- [ ] `UsinaConfiguration.cs` em `Usinas/Mapeamentos/` (implementar `IEntityTypeConfiguration<Usina>`)
- [ ] `GalpaoConfiguration.cs` em `GerenciamentoEnergia/Mapeamentos/`
- [ ] `RegistroMD50Configuration.cs` em `GerenciamentoEnergia/Mapeamentos/`
- [ ] `ResumoDiarioGalpaoConfiguration.cs` em `GerenciamentoEnergia/Mapeamentos/`
- [ ] `FaturaMensalCondominioConfiguration.cs` em `GerenciamentoEnergia/Mapeamentos/`
- [ ] `ItemDemonstrativoFaturaConfiguration.cs` em `GerenciamentoEnergia/Mapeamentos/`
- [ ] `LeituraInversorConfiguration.cs` em `GerenciamentoEnergia/Mapeamentos/`

#### AppDbContext
- [ ] Adicionar `DbSet<Usina> Usinas { get; set; }` no `AppDbContext`
- [ ] Adicionar `DbSet<Galpao> Galpoes { get; set; }` no `AppDbContext`
- [ ] Adicionar `DbSet<RegistroMD50> RegistrosMD50 { get; set; }` no `AppDbContext`
- [ ] Adicionar `DbSet<ResumoDiarioGalpao> ResumosDiariosGalpao { get; set; }` no `AppDbContext`
- [ ] Adicionar `DbSet<FaturaMensalCondominio> FaturasMensaisCondominio { get; set; }` no `AppDbContext`
- [ ] Adicionar `DbSet<ItemDemonstrativoFatura> ItensDemonstrativoFatura { get; set; }` no `AppDbContext`
- [ ] Adicionar `DbSet<LeituraInversor> LeiturasInversor { get; set; }` no `AppDbContext`

#### Repositórios (implementação — herdam `RepositorioBase<T>`)
- [ ] `UsinasRepositorio.cs` em `Usinas/Repositorios/`
- [ ] `GalpoesRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `RegistrosMD50Repositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `ResumosDiariosGalpaoRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `FaturasMensaisCondominioRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `ItensDemonstrativoFaturaRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`
- [ ] `LeiturasInversorRepositorio.cs` em `GerenciamentoEnergia/Repositorios/`

#### Migrations EF Core
- [ ] Criar migration inicial: `dotnet ef migrations add CriarTabelasGerenciamentoEnergia --project <Projeto>.Infra --startup-project <Projeto>.Api`
- [ ] Índice composto `IX_RegistroMD50_GalpaoId_DataHora` em `(GalpaoId, DataHora)` — definir no `Configure()` do mapeamento via `builder.HasIndex(x => new { x.GalpaoId, x.DataHora })`
- [ ] Índice composto `IX_ResumoDiarioGalpao_GalpaoId_Data` em `(GalpaoId, Data)`
- [ ] Índice composto `IX_FaturaMensalCondominio_UsinaId_Mes` em `(UsinaId, Mes)`
- [ ] Índice composto `IX_LeituraInversor_UsinaId_DataHora` em `(UsinaId, DataHora)`

### 9.4 — Aplicação
- [ ] `IGerenciamentoEnergiaAppServico.cs` em `GerenciamentoEnergia/Servicos/Interfaces/`
- [ ] `GerenciamentoEnergiaAppServico.cs` em `GerenciamentoEnergia/Servicos/` (injetar `IUnitOfWork` para operações de escrita; o `AppDbContext` já implementa Unit of Work via `SaveChangesAsync`)
- [ ] `GerenciamentoEnergiaProfile.cs` em `GerenciamentoEnergia/Profiles/`

### 9.5 — API
- [ ] `GerenciamentoEnergiaController.cs` em `Controllers/GerenciamentoEnergia/`
  - `[Route("api/gerenciamento-energia")]`
  - `[ApiController]`
  - `[Authorize]`
  - Métodos: `ListarMeses`, `Resumo`, `ListarGalpoes`, `RecuperarGalpaoMensal`, `ListarGalpaoDiario`, `ListarRegistrosMD50`

### 9.6 — IoC
- [ ] Registrar em `ConfiguracoesInjecoesDependencia.AddInjecoesDependencia`:
  ```
  // Repositórios
  services.AddScoped<IUsinasRepositorio, UsinasRepositorio>();
  services.AddScoped<IGalpoesRepositorio, GalpoesRepositorio>();
  services.AddScoped<IRegistrosMD50Repositorio, RegistrosMD50Repositorio>();
  services.AddScoped<IResumosDiariosGalpaoRepositorio, ResumosDiariosGalpaoRepositorio>();
  services.AddScoped<IFaturasMensaisCondominioRepositorio, FaturasMensaisCondominioRepositorio>();
  services.AddScoped<IItensDemonstrativoFaturaRepositorio, ItensDemonstrativoFaturaRepositorio>();
  services.AddScoped<ILeiturasInversorRepositorio, LeiturasInversorRepositorio>();

  // Serviços de Domínio
  services.AddScoped<IGerenciamentoEnergiaServicos, GerenciamentoEnergiaServicos>();

  // Serviços de Aplicação
  services.AddScoped<IGerenciamentoEnergiaAppServico, GerenciamentoEnergiaAppServico>();
  ```
- [ ] Registrar `GerenciamentoEnergiaProfile` em `ConfiguracoesAutoMapper.cs`:
  ```csharp
  config.AddProfile<GerenciamentoEnergiaProfile>();
  ```
- [ ] Configurar `AppDbContext` em `ConfiguracoesDbContext.cs` (EF Core + SQL Server)
- [ ] Verificar que `Program.cs` chama: `AddDbContext()`, `AddInjecoesDependencia()`, `AddAutoMapper()`

---

## 10. Resumo de Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| **Job Coleta MD50** | Ler dados do medidor Embrasul a cada 15 min e persistir `RegistroMD50` no SQL Server. |
| **Job Coleta Solar** | Consumir API ProjectSwitch (`target=realtime&mode=readings`) a cada 15 min e persistir `LeituraInversor` no SQL Server. |
| **Job Fatura Enel** | Processar fatura mensal da concessionária e persistir `FaturaMensalCondominio` + `ItemDemonstrativoFatura`. Calcular autoconsumo solar (`ConsumoSolarKwh = GeracaoTotalKwh - EnergiaInjetadaKwh`). |
| **Job Consolidação Diária** | Agregar 96 registros MD50 do dia em `ResumoDiarioGalpao` (consumo ponta/fora ponta, demanda máx, fator de potência médio, custo estimado). |
| **Job Envio Faturas** | Gerar faturas individuais por galpão quando o mês fecha. Calcular rateio incluindo consumo do condomínio e enviar por e-mail. |
| **API — Controller** | Expor 6 endpoints (`api/gerenciamento-energia/*`). Validar JWT. Delegar para AppServico. |
| **API — AppServico** | Orquestrar chamadas ao domínio. Mapear Request → Comando e Entidade → Response via AutoMapper. UnitOfWork para escrita. |
| **API — Domínio (Servicos)** | Calcular KPIs (consumo total, alerta fator de potência). Validar regras de negócio. Manipular entidades. |
| **API — Domínio (Entidades)** | Encapsular dados com validação via métodos `Set`. `RegraDeNegocioExcecao` para erros. |
| **API — Infra (Repositórios)** | Persistir/consultar dados no SQL Server via Entity Framework Core. Queries LINQ com `IQueryable<T>` e paginação. Herdam `RepositorioBase<T>`. |
| **API — Infra (Mapeamentos)** | Mapear entidades para tabelas SQL Server via `IEntityTypeConfiguration<T>` (EF Core Fluent API). Descobertos automaticamente via `ApplyConfigurationsFromAssembly`. |
| **API — Infra (AppDbContext)** | Centralizar `DbSet<T>` de todas as entidades. Gerenciar schema via Migrations do EF Core. |
| **API — IoC** | `ConfiguracoesDbContext` (EF Core + SQL Server), `ConfiguracoesInjecoesDependencia` (interfaces), `ConfiguracoesAutoMapper` (Profiles). |

---

## Apêndice A — Mapeamentos EF Core (Exemplos)

> Os mapeamentos usam `IEntityTypeConfiguration<T>` (Fluent API) e são descobertos automaticamente via `modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)` no `AppDbContext`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-INFRA.md`

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

        builder.Property(x => x.DemandaContratadaKw)
            .HasColumnName("demanda_contratada_kw")
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Ativo)
            .HasColumnName("ativo")
            .IsRequired();
    }
}
```

### GalpaoConfiguration.cs
```csharp
public class GalpaoConfiguration : IEntityTypeConfiguration<Galpao>
{
    public void Configure(EntityTypeBuilder<Galpao> builder)
    {
        builder.ToTable("galpoes");

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

        builder.Property(x => x.Nome)
            .HasColumnName("nome")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.DemandaContratadaKw)
            .HasColumnName("demanda_contratada_kw")
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.NumeroSerialMedidor)
            .HasColumnName("numero_serial_medidor")
            .HasMaxLength(100);

        builder.Property(x => x.Ativo)
            .HasColumnName("ativo")
            .IsRequired();
    }
}
```

### RegistroMD50Configuration.cs
```csharp
public class RegistroMD50Configuration : IEntityTypeConfiguration<RegistroMD50>
{
    public void Configure(EntityTypeBuilder<RegistroMD50> builder)
    {
        builder.ToTable("registros_md50");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.HasOne(x => x.Galpao)
            .WithMany()
            .HasForeignKey(x => x.GalpaoId);

        builder.Property(x => x.GalpaoId)
            .HasColumnName("galpao_id")
            .IsRequired();

        builder.Property(x => x.DataHora)
            .HasColumnName("data_hora")
            .IsRequired();

        builder.Property(x => x.ConsumoPonta)
            .HasColumnName("consumo_ponta")
            .HasPrecision(18, 4);

        builder.Property(x => x.ConsumoForaPonta)
            .HasColumnName("consumo_fora_ponta")
            .HasPrecision(18, 4);

        builder.Property(x => x.ConsumoReserv)
            .HasColumnName("consumo_reserv")
            .HasPrecision(18, 4);

        builder.Property(x => x.EnergIndPonta)
            .HasColumnName("energ_ind_ponta")
            .HasPrecision(18, 4);

        builder.Property(x => x.EnergIndForaPonta)
            .HasColumnName("energ_ind_fora_ponta")
            .HasPrecision(18, 4);

        builder.Property(x => x.EnergCapPonta)
            .HasColumnName("energ_cap_ponta")
            .HasPrecision(18, 4);

        builder.Property(x => x.EnergCapForaPonta)
            .HasColumnName("energ_cap_fora_ponta")
            .HasPrecision(18, 4);

        builder.Property(x => x.MaxPotAtivPonta)
            .HasColumnName("max_pot_ativ_ponta")
            .HasPrecision(18, 4);

        builder.Property(x => x.MaxPotAtivForaPonta)
            .HasColumnName("max_pot_ativ_fora_ponta")
            .HasPrecision(18, 4);

        builder.Property(x => x.ConsumoPonta15min)
            .HasColumnName("consumo_ponta_15min")
            .HasPrecision(18, 4);

        builder.Property(x => x.ConsumoForaPonta15min)
            .HasColumnName("consumo_fora_ponta_15min")
            .HasPrecision(18, 4);

        builder.Property(x => x.EnergIndPonta15min)
            .HasColumnName("energ_ind_ponta_15min")
            .HasPrecision(18, 4);

        builder.Property(x => x.EnergIndForaPonta15min)
            .HasColumnName("energ_ind_fora_ponta_15min")
            .HasPrecision(18, 4);

        builder.Property(x => x.PotAtivT)
            .HasColumnName("pot_ativ_t")
            .HasPrecision(18, 4);

        builder.Property(x => x.FatPotT)
            .HasColumnName("fat_pot_t")
            .HasPrecision(10, 4);

        // Índice composto para consultas de registros por galpão e data
        builder.HasIndex(x => new { x.GalpaoId, x.DataHora })
            .HasDatabaseName("IX_RegistroMD50_GalpaoId_DataHora");
    }
}
```

### FaturaMensalCondominioConfiguration.cs
```csharp
public class FaturaMensalCondominioConfiguration : IEntityTypeConfiguration<FaturaMensalCondominio>
{
    public void Configure(EntityTypeBuilder<FaturaMensalCondominio> builder)
    {
        builder.ToTable("faturas_mensais_condominio");

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

        builder.Property(x => x.Mes)
            .HasColumnName("mes")
            .HasMaxLength(7)
            .IsRequired();

        builder.Property(x => x.ValorTotalBrl)
            .HasColumnName("valor_total_brl")
            .HasPrecision(18, 2);

        builder.Property(x => x.ConsumoTotalKwh)
            .HasColumnName("consumo_total_kwh")
            .HasPrecision(18, 2);

        builder.Property(x => x.GeracaoTotalKwh)
            .HasColumnName("geracao_total_kwh")
            .HasPrecision(18, 2);

        builder.Property(x => x.EnergiaInjetadaKwh)
            .HasColumnName("energia_injetada_kwh")
            .HasPrecision(18, 2);

        builder.Property(x => x.ConsumoSolarKwh)
            .HasColumnName("consumo_solar_kwh")
            .HasPrecision(18, 2);

        builder.Property(x => x.ConsumoConcessonariaKwh)
            .HasColumnName("consumo_concessonaria_kwh")
            .HasPrecision(18, 2);

        builder.Property(x => x.DemandaContratadaKw)
            .HasColumnName("demanda_contratada_kw")
            .HasPrecision(18, 2);

        // Índice composto para consultas por usina e mês
        builder.HasIndex(x => new { x.UsinaId, x.Mes })
            .HasDatabaseName("IX_FaturaMensalCondominio_UsinaId_Mes");

        // Relacionamento One-to-Many com ItemDemonstrativoFatura
        builder.HasMany<ItemDemonstrativoFatura>()
            .WithOne(x => x.Fatura)
            .HasForeignKey(x => x.FaturaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

### ItemDemonstrativoFaturaConfiguration.cs
```csharp
public class ItemDemonstrativoFaturaConfiguration : IEntityTypeConfiguration<ItemDemonstrativoFatura>
{
    public void Configure(EntityTypeBuilder<ItemDemonstrativoFatura> builder)
    {
        builder.ToTable("itens_demonstrativo_fatura");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.FaturaId)
            .HasColumnName("fatura_id")
            .IsRequired();

        builder.Property(x => x.Indicador)
            .HasColumnName("indicador")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Quantidade)
            .HasColumnName("quantidade")
            .HasPrecision(18, 4);

        builder.Property(x => x.UnidadeMedida)
            .HasColumnName("unidade_medida")
            .HasMaxLength(50);

        builder.Property(x => x.Tarifa)
            .HasColumnName("tarifa")
            .HasPrecision(18, 6);

        builder.Property(x => x.Valor)
            .HasColumnName("valor")
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.BaseIcms)
            .HasColumnName("base_icms")
            .HasPrecision(18, 2);

        builder.Property(x => x.AliquotaIcms)
            .HasColumnName("aliquota_icms")
            .HasPrecision(10, 4);

        builder.Property(x => x.ValorIcms)
            .HasColumnName("valor_icms")
            .HasPrecision(18, 2);
    }
}
```
