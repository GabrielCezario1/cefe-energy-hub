# Relatório — Backend do Módulo de Gestão Financeira

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
> **⚠️ Pré-requisito:** Os módulos de **Gerenciamento de Energia** e **Monitoramento & Geração** devem ser implementados **antes** deste módulo. As entidades `Usina`, `LeituraInversor` e `GeracaoDiaria` já existirão quando este módulo for iniciado. Este relatório indica explicitamente quais itens devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕).

---

## 1. Visão Geral do Módulo

O módulo de **Gestão Financeira** exibe o retorno econômico do investimento em energia solar fotovoltaica. A partir dos dados de geração coletados automaticamente (via jobs do módulo de Monitoramento & Geração) e de dados financeiros cadastrados manualmente pelo administrador (tarifa de energia e valor do investimento), o backend calcula e expõe KPIs financeiros, rentabilidade mensal e projeção de payback.

| Tela | Descrição |
| --- | --- |
| **Gestão Financeira & Econômica** | KPIs de retorno (economia acumulada, economia do mês, payback restante), gráfico de rentabilidade mensal, gráfico de projeção de payback, painel de dados do investimento com cadastro de tarifa e investimento |

### Restrições de Acesso

- O módulo está disponível para **todas as unidades** cadastradas com sistema solar ativo.
- O usuário deve estar autenticado (JWT) e ter uma unidade selecionada.
- Todas as requisições devem incluir o `usinaId` para filtrar os dados.
- Os endpoints de cadastro de tarifa e investimento requerem perfil de **administrador**.

---

## 2. Funcionalidades Exibidas ao Usuário

### 2.1 — Tela: Gestão Financeira & Econômica

#### 2.1.1 — KPIs Primários (3 cards)

| KPI | Fonte do Dado | Cálculo |
| --- | --- | --- |
| **Economia Acumulada (R$)** | `GeracaoDiaria` (agregado por mês) + `TarifaEnergia` (vigente por mês) | `Σ (GeracaoTotalKwh_mês × TarifaVigente_mês)` desde `Usina.DataInstalacao` |
| **Economia no Mês (R$)** | `GeracaoDiaria` do mês corrente + `TarifaEnergia` vigente | `SUM(GeracaoDiaria.GeracaoTotalKwh)` do mês × `TarifaEnergia.ValorKwh` vigente |
| **Payback Restante (meses)** | `InvestimentoUsina` + Economia Acumulada + Média Mensal | `CEIL((ValorTotal - EconomiaAcumulada) / MediaEconomiaMensal)`. Se `EconomiaAcumulada ≥ ValorTotal` → retorna `0` (payback atingido) |

> **Regra de retroatividade:** O cálculo considera apenas dados a partir de `Usina.DataInstalacao`. Não há importação de histórico anterior à data de ativação no sistema.

#### 2.1.2 — Gráfico: Rentabilidade Mensal (BarChart)

- **Tipo:** Bar Chart.
- **Eixo X:** Mês/Ano (ex: "Jan/25", "Fev/25").
- **Eixo Y:** Valor em R$.
- **Série:** Economia mensal (R$) — `GeracaoTotalKwh_mês × TarifaVigente_mês`.
- **Período:** Últimos 12 meses ou desde `Usina.DataInstalacao` (o que for menor).
- **Fonte:** `GeracaoDiaria` agregado por mês + `TarifaEnergia`.

#### 2.1.3 — Gráfico: Projeção de Payback (LineChart)

- **Tipo:** Line Chart com duas linhas.
- **Eixo X:** Meses (0, 12, 24, ...).
- **Eixo Y:** Valor em R$.
- **Linha 1 — Investimento:** Linha horizontal fixa em `InvestimentoUsina.ValorTotal`.
- **Linha 2 — Recuperado:** Para meses passados = economia acumulada real. Para meses futuros = projeção baseada na média mensal de economia.
- **Cálculo dos pontos futuros:** `EconomiaAcumuladaAtual + (MesesFuturos × MediaEconomiaMensal)`.
- **Número de pontos:** De 0 até `PaybackTotalMeses + 12` (para mostrar o cruzamento das linhas), em intervalos de 12.

#### 2.1.4 — Painel: Dados do Investimento

| Dado | Fonte | Cálculo |
| --- | --- | --- |
| **Valor do Investimento Inicial (R$)** | `InvestimentoUsina.ValorTotal` | Valor direto do cadastro |
| **Tarifa de Energia (R$/kWh)** | `TarifaEnergia` vigente hoje | Registro com `DataVigenciaFim IS NULL` ou `DataVigenciaFim >= GETDATE()` |
| **ROI Anual (%)** | `GeracaoDiaria` últimos 12 meses + `TarifaEnergia` + `InvestimentoUsina` | `(Σ EconomiaMensal_últimos12meses / InvestimentoUsina.ValorTotal) × 100` |

---

## 3. Endpoints da API

> **Padrão de rotas:** `api/gestao-financeira` (conforme `PADROES_DE_DESENVOLVIMENTO-API.md`).
> Todos os endpoints usam `[Authorize]`. O `usinaId` é passado como query parameter.

### 3.1 — KPIs Financeiros

```
GET api/gestao-financeira/kpis?usinaId={usinaId}
```

**Request DTO:** `GestaoFinanceiraKpisRequest`
```csharp
public class GestaoFinanceiraKpisRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `GestaoFinanceiraKpisResponse`

```json
{
  "economiaAcumuladaBrl": 1847250.00,
  "economiaMesAtualBrl": 16200.00,
  "variacaoMesAnteriorPercent": 9.1,
  "paybackRestanteMeses": 8,
  "paybackTotalMeses": 33,
  "paybackAtingido": false
}
```

---

### 3.2 — Rentabilidade Mensal

```
GET api/gestao-financeira/rentabilidade-mensal?usinaId={usinaId}&ano={ano}
```

**Request DTO:** `GestaoFinanceiraRentabilidadeMensalRequest`
```csharp
public class GestaoFinanceiraRentabilidadeMensalRequest
{
    public int UsinaId { get; set; }
    public int? Ano { get; set; }  // null = últimos 12 meses
}
```

**Response DTO:** `GestaoFinanceiraRentabilidadeMensalResponse`

```json
{
  "meses": [
    { "mes": "Jan/25", "economiaKwh": 18150.0, "economiaBrl": 15427.50 },
    { "mes": "Fev/25", "economiaKwh": 17460.0, "economiaBrl": 14841.00 },
    { "mes": "Mar/25", "economiaKwh": 19110.0, "economiaBrl": 16243.50 },
    { "mes": "Abr/25", "economiaKwh": 18750.0, "economiaBrl": 15937.50 },
    { "mes": "Mai/25", "economiaKwh": 16800.0, "economiaBrl": 14280.00 },
    { "mes": "Jun/25", "economiaKwh": 16200.0, "economiaBrl": 13770.00 }
  ]
}
```

**Response DTO aninhado:** `RentabilidadeMensalItemResponse`
```csharp
public class RentabilidadeMensalItemResponse
{
    public string Mes { get; set; }         // "Jan/25"
    public decimal EconomiaKwh { get; set; }
    public decimal EconomiaBrl { get; set; }
}
```

---

### 3.3 — Projeção de Payback

```
GET api/gestao-financeira/projecao-payback?usinaId={usinaId}
```

**Request DTO:** `GestaoFinanceiraProjecaoPaybackRequest`
```csharp
public class GestaoFinanceiraProjecaoPaybackRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `GestaoFinanceiraProjecaoPaybackResponse`

```json
{
  "valorInvestimento": 500000.00,
  "mediaEconomiaMensalBrl": 15083.00,
  "paybackTotalMeses": 33,
  "pontos": [
    { "mes": 0,  "investimento": 500000.00, "recuperado": 0.00 },
    { "mes": 12, "investimento": 500000.00, "recuperado": 180996.00 },
    { "mes": 24, "investimento": 500000.00, "recuperado": 361992.00 },
    { "mes": 36, "investimento": 500000.00, "recuperado": 542988.00 },
    { "mes": 48, "investimento": 500000.00, "recuperado": 723984.00 }
  ]
}
```

> **Lógica dos pontos:** Para `mes ≤ meses decorridos desde DataInstalacao`, `recuperado` = economia acumulada real. Para `mes > meses decorridos`, `recuperado` = `EconomiaAcumuladaReal + (mes - mesesDecorridos) × mediaEconomiaMensal`.

**Response DTO aninhado:** `ProjecaoPaybackPontoResponse`
```csharp
public class ProjecaoPaybackPontoResponse
{
    public int Mes { get; set; }
    public decimal Investimento { get; set; }
    public decimal Recuperado { get; set; }
}
```

---

### 3.4 — Dados do Investimento

```
GET api/gestao-financeira/dados-investimento?usinaId={usinaId}
```

**Request DTO:** `GestaoFinanceiraDadosInvestimentoRequest`
```csharp
public class GestaoFinanceiraDadosInvestimentoRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `GestaoFinanceiraDadosInvestimentoResponse`

```json
{
  "investimento": {
    "id": 1,
    "valorTotal": 500000.00,
    "dataInvestimento": "2023-01-01",
    "descricao": "Sistema solar 120kWp"
  },
  "tarifaVigente": {
    "id": 3,
    "valorKwh": 0.85,
    "dataVigenciaInicio": "2025-01-01",
    "dataVigenciaFim": null,
    "observacao": "Reajuste ANEEL 2025"
  },
  "roiAnualPercent": 38.2
}
```

**Response DTOs aninhados:**
```csharp
public class InvestimentoUsinaResponse
{
    public int Id { get; set; }
    public decimal ValorTotal { get; set; }
    public string DataInvestimento { get; set; }
    public string? Descricao { get; set; }
}

public class TarifaEnergiaResponse
{
    public int Id { get; set; }
    public decimal ValorKwh { get; set; }
    public string DataVigenciaInicio { get; set; }
    public string? DataVigenciaFim { get; set; }
    public string? Observacao { get; set; }
}
```

---

### 3.5 — Cadastrar Tarifa de Energia

```
POST api/gestao-financeira/tarifas
```

> Ao inserir uma nova tarifa, o backend deve automaticamente definir `DataVigenciaFim` da tarifa anterior como `novaDataVigenciaInicio - 1 dia`.

**Request DTO:** `GestaoFinanceiraTarifaInserirRequest`
```csharp
public class GestaoFinanceiraTarifaInserirRequest
{
    public int UsinaId { get; set; }
    public decimal ValorKwh { get; set; }
    public DateTime DataVigenciaInicio { get; set; }
    public string? Observacao { get; set; }
}
```

**Response:** `TarifaEnergiaResponse` (ver 3.4)

---

### 3.6 — Editar Tarifa de Energia

```
PUT api/gestao-financeira/tarifas/{id}
```

**Request DTO:** `GestaoFinanceiraTarifaEditarRequest`
```csharp
public class GestaoFinanceiraTarifaEditarRequest
{
    public int Id { get; set; }
    public decimal ValorKwh { get; set; }
    public DateTime DataVigenciaInicio { get; set; }
    public string? Observacao { get; set; }
}
```

**Response:** `TarifaEnergiaResponse` (ver 3.4)

---

### 3.7 — Cadastrar Investimento

```
POST api/gestao-financeira/investimentos
```

> Cada usina pode ter apenas **um** registro de `InvestimentoUsina` ativo. Se já existir, retornar erro de regra de negócio indicando que deve usar o endpoint de edição.

**Request DTO:** `GestaoFinanceiraInvestimentoInserirRequest`
```csharp
public class GestaoFinanceiraInvestimentoInserirRequest
{
    public int UsinaId { get; set; }
    public decimal ValorTotal { get; set; }
    public DateTime DataInvestimento { get; set; }
    public string? Descricao { get; set; }
}
```

**Response:** `InvestimentoUsinaResponse` (ver 3.4)

---

### 3.8 — Editar Investimento

```
PUT api/gestao-financeira/investimentos/{id}
```

**Request DTO:** `GestaoFinanceiraInvestimentoEditarRequest`
```csharp
public class GestaoFinanceiraInvestimentoEditarRequest
{
    public int Id { get; set; }
    public decimal ValorTotal { get; set; }
    public DateTime DataInvestimento { get; set; }
    public string? Descricao { get; set; }
}
```

**Response:** `InvestimentoUsinaResponse` (ver 3.4)

---

## 4. Responsabilidades do Backend

### 4.1 — Coleta de Dados (Jobs)

> Este módulo **não possui jobs próprios**. Toda a geração de energia é coletada pelos jobs já definidos no módulo de **Monitoramento & Geração** (`GeracaoDiaria`, `LeituraInversor`). Este módulo apenas **consome** esses dados para os cálculos financeiros.

| Job | Status | Descrição |
| --- | --- | --- |
| **Consolidação Diária de Geração** | ✅ Reutilizar (Monitoramento & Geração) | Agrega `LeituraInversor` do dia em `GeracaoDiaria`. Base de todo cálculo financeiro mensal. |

### 4.2 — Cálculos no Backend

| Cálculo | Fórmula | Quando Executar |
| --- | --- | --- |
| **Tarifa Vigente no Mês** | `TarifaEnergia` onde `DataVigenciaInicio <= ultimoDiaMes AND (DataVigenciaFim IS NULL OR DataVigenciaFim >= primeiroDiaMes)` | Ao calcular economia de cada mês |
| **Economia Mensal (R$)** | `SUM(GeracaoDiaria.GeracaoTotalKwh) × TarifaVigente_mês` | Ao retornar KPIs e rentabilidade |
| **Economia Acumulada (R$)** | `Σ EconomiaMensal` desde `Usina.DataInstalacao` | Ao retornar KPIs |
| **Variação vs. Mês Anterior (%)** | `((EconomiaMesAtual - EconomiaMesAnterior) / EconomiaMesAnterior) × 100` | Ao retornar KPIs |
| **Média Economia Mensal (R$)** | `EconomiaAcumulada / QuantidadeMesesComDados` | Base para payback |
| **Payback Total (meses)** | `CEIL(InvestimentoUsina.ValorTotal / MediaEconomiaMensal)` | Ao retornar KPIs e projeção |
| **Payback Restante (meses)** | `CEIL((InvestimentoUsina.ValorTotal - EconomiaAcumulada) / MediaEconomiaMensal)`. Se `≤ 0` → retorna `0` | Ao retornar KPIs |
| **ROI Anual (%)** | `(Σ EconomiaMensal_últimos12meses / InvestimentoUsina.ValorTotal) × 100` | Ao retornar dados do investimento |
| **Pontos Projeção Payback** | Passados: economia acumulada real. Futuros: `EconomiaAcumulada + (MesFuturo - MesesDecorridos) × MediaMensal`. Intervalos de 12 meses. | Ao retornar projeção |

### 4.3 — Regras de Negócio Especiais

| Regra | Descrição |
| --- | --- |
| **Vigência de Tarifa** | Ao inserir nova tarifa, o backend encerra a tarifa anterior definindo `DataVigenciaFim = novaDataVigenciaInicio - 1 dia`. Garante que não haja sobreposição de vigências para a mesma usina. |
| **Unicidade de Investimento** | Cada usina possui apenas um registro de `InvestimentoUsina`. Tentativa de inserir segundo registro gera `RegraDeNegocioExcecao`. |
| **Ausência de Dados** | Se não houver `InvestimentoUsina` ou `TarifaEnergia` cadastrados, os endpoints retornam os dados disponíveis com os campos financeiros zerados e um campo `configuracaoPendente: true`, indicando ao frontend que o cadastro ainda não foi realizado. |
| **Retroatividade** | O cálculo de economia começa em `Usina.DataInstalacao`. Meses anteriores a essa data não geram registros financeiros. Não há importação de histórico retroativo. |
| **Meses sem geração** | Se `GeracaoDiaria` não possuir registros para um determinado mês (ex: usina offline), o mês retorna `economiaKwh = 0` e `economiaBrl = 0` na rentabilidade mensal. Não é excluído da lista. |
| **Tarifa histórica** | O cálculo de economia de meses passados usa a tarifa que estava vigente naquele mês (baseada em `DataVigenciaInicio` e `DataVigenciaFim`), não a tarifa atual. Isso garante precisão histórica mesmo com reajustes tarifários. |

---

## 5. Diagrama de Entidades

> Todas as entidades seguem o padrão do Domínio: propriedades `virtual`, setters `protected set`, construtor vazio `protected` (EF Core), métodos `Set<Propriedade>` com validação via `RegraDeNegocioExcecao`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`

### Entidades Reutilizadas (sem alteração)

| Entidade | Status | Módulo de Origem |
| --- | --- | --- |
| `Usina` | ✅ Reutilizar | Gerenciamento de Energia + Monitoramento & Geração |
| `LeituraInversor` | ✅ Reutilizar | Gerenciamento de Energia |
| `GeracaoDiaria` | ✅ Reutilizar | Monitoramento & Geração |

> **Nota sobre `Usina`:** O campo `DataInstalacao` já foi adicionado no módulo de Monitoramento & Geração. É utilizado aqui como ponto de início dos cálculos financeiros. Nenhum campo novo precisa ser adicionado à `Usina`.

### Entidades Novas (criadas neste módulo)

```
┌──────────────────────────────────────────────┐
│              Usina (✅ existente)             │
├──────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }                │
│ virtual string Nome { get; protected set; }           │
│ virtual string Localizacao { get; protected set; }    │
│ virtual string Estado { get; protected set; }         │
│ virtual decimal PotenciaInstaladaKwp { get; prot. }   │
│ virtual string PotenciaInstaladaDescricao { get; p. } │
│ virtual DateTime DataInstalacao { get; prot. set; }   │  ← base para cálculo financeiro
│ virtual decimal DemandaContratadaKw { get; prot. }    │
│ virtual bool Ativo { get; protected set; }            │
└──────────┬───────────────────────────────────────────┘
           │ 1
           ├──────────────────────────────────── N ──────┐
           │                                             │
           │ 1 (no máximo)                               │
┌──────────▼───────────────────────────────────┐        │
│         InvestimentoUsina  🆕                │        │
├──────────────────────────────────────────────┤        │
│ virtual int Id { get; protected set; }                │        │
│ virtual int UsinaId { get; protected set; }           │        │
│ virtual Usina Usina { get; protected set; }           │        │
│ virtual decimal ValorTotal { get; prot. set; }        │        │
│ virtual DateTime DataInvestimento { get; prot. set; } │        │
│ virtual string? Descricao { get; protected set; }     │        │
├──────────────────────────────────────────────┤        │
│ protected InvestimentoUsina() { }            │        │
│ SetValorTotal(decimal)                        │        │
│ SetDataInvestimento(DateTime)                 │        │
│ SetDescricao(string?)                         │        │
└──────────────────────────────────────────────┘        │
                                                        │
┌───────────────────────────────────────────────────────▼┐
│          TarifaEnergia  🆕                             │
├────────────────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }                 │
│ virtual int UsinaId { get; protected set; }            │
│ virtual Usina Usina { get; protected set; }            │
│ virtual decimal ValorKwh { get; protected set; }       │  ← R$/kWh (já com impostos)
│ virtual DateTime DataVigenciaInicio { get; prot. }     │
│ virtual DateTime? DataVigenciaFim { get; prot. set; }  │  ← null = vigente até hoje
│ virtual string? Observacao { get; protected set; }     │
├────────────────────────────────────────────────────────┤
│ protected TarifaEnergia() { }                          │
│ SetValorKwh(decimal)                                   │
│ SetDataVigenciaInicio(DateTime)                        │
│ EncerrarVigencia(DateTime dataFim)                     │  ← define DataVigenciaFim
│ SetObservacao(string?)                                 │
└────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│         GeracaoDiaria (✅ existente)          │
├──────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }                │
│ virtual int UsinaId { get; protected set; }           │
│ virtual Usina Usina { get; protected set; }           │
│ virtual DateTime Data { get; protected set; }         │
│ virtual decimal GeracaoTotalKwh { get; prot. set; }   │  ← base para cálculo financeiro
│ virtual decimal PotenciaMaximaKw { get; prot. set; }  │
│ virtual decimal PerformanceRatioPercent { get; p. }   │
│ virtual decimal HspDia { get; protected set; }        │
│ virtual decimal IrradiacaoMediaWm2 { get; prot. }     │
└──────────────────────────────────────────────┘
```

### Diagrama de Relacionamentos

```
Usina (1) ──── (1) InvestimentoUsina       ← no máximo um por usina
Usina (1) ──── (N) TarifaEnergia           ← histórico de tarifas com vigência
Usina (1) ──── (N) GeracaoDiaria           ← já existente (Monitoramento & Geração)
```

### Comandos

```
┌────────────────────────────────────────────┐
│   InvestimentoUsinaInserirComando  🆕      │
├────────────────────────────────────────────┤
│ int UsinaId                                │
│ decimal ValorTotal                         │
│ DateTime DataInvestimento                  │
│ string? Descricao                          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│   InvestimentoUsinaEditarComando  🆕       │
├────────────────────────────────────────────┤
│ int Id                                     │
│ decimal ValorTotal                         │
│ DateTime DataInvestimento                  │
│ string? Descricao                          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│   TarifaEnergiaInserirComando  🆕          │
├────────────────────────────────────────────┤
│ int UsinaId                                │
│ decimal ValorKwh                           │
│ DateTime DataVigenciaInicio                │
│ string? Observacao                         │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│   TarifaEnergiaEditarComando  🆕           │
├────────────────────────────────────────────┤
│ int Id                                     │
│ decimal ValorKwh                           │
│ DateTime DataVigenciaInicio                │
│ string? Observacao                         │
└────────────────────────────────────────────┘
```

---

## 6. Estrutura de Pastas por Feature

> Conforme padrões em `padroes-desenvolvimento-back-end/copilot-instructions.md`.

```
<Projeto>.Api/
└── Controllers/
    └── GestaoFinanceira/
        └── GestaoFinanceiraController.cs

<Projeto>.Aplicacao/
└── GestaoFinanceira/
    ├── Profiles/
    │   └── GestaoFinanceiraProfile.cs
    └── Servicos/
        ├── Interfaces/
        │   └── IGestaoFinanceiraAppServico.cs
        └── GestaoFinanceiraAppServico.cs

<Projeto>.DataTransfer/
└── GestaoFinanceira/
    ├── Request/
    │   ├── GestaoFinanceiraKpisRequest.cs
    │   ├── GestaoFinanceiraRentabilidadeMensalRequest.cs
    │   ├── GestaoFinanceiraProjecaoPaybackRequest.cs
    │   ├── GestaoFinanceiraDadosInvestimentoRequest.cs
    │   ├── GestaoFinanceiraTarifaInserirRequest.cs
    │   ├── GestaoFinanceiraTarifaEditarRequest.cs
    │   ├── GestaoFinanceiraInvestimentoInserirRequest.cs
    │   └── GestaoFinanceiraInvestimentoEditarRequest.cs
    └── Response/
        ├── GestaoFinanceiraKpisResponse.cs
        ├── GestaoFinanceiraRentabilidadeMensalResponse.cs
        ├── RentabilidadeMensalItemResponse.cs
        ├── GestaoFinanceiraProjecaoPaybackResponse.cs
        ├── ProjecaoPaybackPontoResponse.cs
        ├── GestaoFinanceiraDadosInvestimentoResponse.cs
        ├── InvestimentoUsinaResponse.cs
        └── TarifaEnergiaResponse.cs

<Projeto>.Dominio/
└── GestaoFinanceira/
    ├── Entidades/
    │   ├── InvestimentoUsina.cs
    │   └── TarifaEnergia.cs
    ├── Repositorios/
    │   ├── IInvestimentoUsinaRepositorio.cs
    │   └── ITarifaEnergiaRepositorio.cs
    └── Servicos/
        ├── Comandos/
        │   ├── InvestimentoUsinaInserirComando.cs
        │   ├── InvestimentoUsinaEditarComando.cs
        │   ├── TarifaEnergiaInserirComando.cs
        │   └── TarifaEnergiaEditarComando.cs
        ├── Interfaces/
        │   ├── IInvestimentoUsinaServicos.cs
        │   └── ITarifaEnergiaServicos.cs
        ├── InvestimentoUsinaServicos.cs
        └── TarifaEnergiaServicos.cs

<Projeto>.Infra/
└── GestaoFinanceira/
    ├── Mapeamentos/
    │   ├── InvestimentoUsinaConfiguration.cs
    │   └── TarifaEnergiaConfiguration.cs
    └── Repositorios/
        ├── InvestimentoUsinaRepositorio.cs
        └── TarifaEnergiaRepositorio.cs

<Projeto>.Ioc/
└── (registros em ConfiguracoesInjecoesDependencia.cs e ConfiguracoesAutoMapper.cs)
```

---

## 7. Fluxo de Dados Resumido

```
┌──────────────────────────────────────────────────────────────┐
│               FONTES DE DADOS                                │
├───────────────────────────┬──────────────────────────────────┤
│   API ProjectSwitch       │   Administrador (manual)         │
│   (Módulo Monitoramento)  │   via endpoints POST/PUT         │
└───────────────────────────┴──────────────────────────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────┐     ┌────────────────────────────────┐
│  Job Consolidação     │     │  GestaoFinanceiraController    │
│  Diária de Geração    │     │  POST /tarifas                 │
│  (Monitoramento &     │     │  POST /investimentos           │
│   Geração)            │     │  PUT  /tarifas/{id}            │
└───────────┬───────────┘     │  PUT  /investimentos/{id}      │
            │                 └────────────┬───────────────────┘
            ▼                              ▼
┌───────────────────────────────────────────────────────────────┐
│                     SQL Server                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ GeracaoDiaria (✅ existente — Monitoramento & Geração)  │  │
│  │ TarifaEnergia (🆕 — cadastro manual com vigência)       │  │
│  │ InvestimentoUsina (🆕 — cadastro manual, 1 por usina)   │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│                 GestaoFinanceiraAppServico                    │
│  • Cruza GeracaoDiaria × TarifaEnergia por mês               │
│  • Calcula EconomiaMensal, EconomiaAcumulada, Payback, ROI   │
│  • Gera pontos históricos (real) + futuros (projeção)        │
└───────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│            GestaoFinanceiraController (.NET 10 Web API)       │
│  GET /kpis                    → GestaoFinanceiraKpisResponse  │
│  GET /rentabilidade-mensal    → GestaoFinanceiraRentMensResp  │
│  GET /projecao-payback        → GestaoFinancProjecaoResp      │
│  GET /dados-investimento      → GestaoFinancDadosInvResp      │
└───────────────────────────────────────────────────────────────┘
```

---

## 8. Volume de Dados Estimado

| Entidade | Registros/Dia | Registros/Mês | Registros/Ano | Observações |
| --- | --- | --- | --- | --- |
| `TarifaEnergia` | ~0 | ~0–1 | ~1–2 | Atualizada apenas em reajustes tarifários |
| `InvestimentoUsina` | 0 | 0 | 0 | Registro único por usina. Criado uma única vez. |
| `GeracaoDiaria` | 1 por usina | ~30 por usina | ~365 por usina | Já existente. Criada pelo job de Monitoramento. |

> **Impacto no banco:** Este módulo cria apenas 2 tabelas com volume mínimo de registros. O maior processamento é feito **em tempo de consulta** (agregação de `GeracaoDiaria` por mês com join em `TarifaEnergia`). Para usinas com mais de 3 anos de operação, considerar índice em `GeracaoDiaria.Data` e `GeracaoDiaria.UsinaId`.

---

## 9. Checklist de Implementação

> Seguir o checklist "Nova Feature" do `copilot-instructions.md`.

### Fase 1 — DataTransfer
- [ ] `GestaoFinanceiraKpisRequest.cs`
- [ ] `GestaoFinanceiraRentabilidadeMensalRequest.cs`
- [ ] `GestaoFinanceiraProjecaoPaybackRequest.cs`
- [ ] `GestaoFinanceiraDadosInvestimentoRequest.cs`
- [ ] `GestaoFinanceiraTarifaInserirRequest.cs`
- [ ] `GestaoFinanceiraTarifaEditarRequest.cs`
- [ ] `GestaoFinanceiraInvestimentoInserirRequest.cs`
- [ ] `GestaoFinanceiraInvestimentoEditarRequest.cs`
- [ ] `GestaoFinanceiraKpisResponse.cs`
- [ ] `GestaoFinanceiraRentabilidadeMensalResponse.cs` + `RentabilidadeMensalItemResponse.cs`
- [ ] `GestaoFinanceiraProjecaoPaybackResponse.cs` + `ProjecaoPaybackPontoResponse.cs`
- [ ] `GestaoFinanceiraDadosInvestimentoResponse.cs` + `InvestimentoUsinaResponse.cs` + `TarifaEnergiaResponse.cs`

### Fase 2 — Domínio
- [ ] `InvestimentoUsina.cs` em `Entidades/` — campos, protected set, métodos Set, validações
- [ ] `TarifaEnergia.cs` em `Entidades/` — campos, protected set, método `EncerrarVigencia()`
- [ ] `IInvestimentoUsinaRepositorio.cs` em `Repositorios/`
- [ ] `ITarifaEnergiaRepositorio.cs` em `Repositorios/`
- [ ] `InvestimentoUsinaInserirComando.cs`, `InvestimentoUsinaEditarComando.cs`
- [ ] `TarifaEnergiaInserirComando.cs`, `TarifaEnergiaEditarComando.cs`
- [ ] `IInvestimentoUsinaServicos.cs`, `InvestimentoUsinaServicos.cs`
- [ ] `ITarifaEnergiaServicos.cs`, `TarifaEnergiaServicos.cs`

### Fase 3 — Infraestrutura
- [ ] `InvestimentoUsinaConfiguration.cs` — mapeamento EF Core, índice único em `UsinaId`
- [ ] `TarifaEnergiaConfiguration.cs` — mapeamento EF Core, índice em `(UsinaId, DataVigenciaInicio)`
- [ ] `InvestimentoUsinaRepositorio.cs` — herda `RepositorioBase<InvestimentoUsina>`
- [ ] `TarifaEnergiaRepositorio.cs` — herda `RepositorioBase<TarifaEnergia>`, método `RecuperarVigenteAsync(int usinaId, DateTime referencia)`
- [ ] Adicionar `DbSet<InvestimentoUsina>` e `DbSet<TarifaEnergia>` no `AppDbContext`
- [ ] Migration: `dotnet ef migrations add AdicionarGestaoFinanceira`

### Fase 4 — Aplicação
- [ ] `IGestaoFinanceiraAppServico.cs`
- [ ] `GestaoFinanceiraAppServico.cs` — orquestração de cálculos financeiros
- [ ] `GestaoFinanceiraProfile.cs` — mapeamentos AutoMapper
- [ ] `GestaoFinanceiraTarifaInserirValidador.cs` — `ValorKwh > 0`, `DataVigenciaInicio` não nula
- [ ] `GestaoFinanceiraTarifaEditarValidador.cs`
- [ ] `GestaoFinanceiraInvestimentoInserirValidador.cs` — `ValorTotal > 0`, `DataInvestimento` não nula, unicidade por usina
- [ ] `GestaoFinanceiraInvestimentoEditarValidador.cs`

### Fase 5 — API
- [ ] `GestaoFinanceiraController.cs` — 8 endpoints (4 GET + 2 POST + 2 PUT)

### Fase 6 — IoC
- [ ] Registrar `IInvestimentoUsinaRepositorio` / `InvestimentoUsinaRepositorio`
- [ ] Registrar `ITarifaEnergiaRepositorio` / `TarifaEnergiaRepositorio`
- [ ] Registrar `IInvestimentoUsinaServicos` / `InvestimentoUsinaServicos`
- [ ] Registrar `ITarifaEnergiaServicos` / `TarifaEnergiaServicos`
- [ ] Registrar `IGestaoFinanceiraAppServico` / `GestaoFinanceiraAppServico`
- [ ] Registrar `GestaoFinanceiraProfile` em `ConfiguracoesAutoMapper`

---

## 10. Resumo de Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| **Jobs (Monitoramento & Geração)** | Coletar e consolidar `GeracaoDiaria` via API ProjectSwitch. Não há jobs neste módulo. |
| **Controller** | Receber requisições HTTP, validar JWT, extrair `usinaId`, delegar ao AppServico, retornar Response DTOs. |
| **AppServico** | Orquestrar repositórios de `GeracaoDiaria`, `TarifaEnergia` e `InvestimentoUsina`. Executar todos os cálculos financeiros (economia, payback, ROI). Montar Response DTOs via AutoMapper. |
| **Serviços de Domínio** | Encapsular regras de negócio: encerrar vigência de tarifa ao inserir nova, validar unicidade de investimento por usina, validar campos obrigatórios. |
| **Repositórios (Domínio)** | Definir interfaces de acesso a dados: `RecuperarVigenteAsync`, `ListarPorUsinaAsync`, `RecuperarPorUsinaAsync`. |
| **Repositórios (Infra)** | Implementar interfaces com EF Core. `TarifaEnergiaRepositorio` implementa `RecuperarVigenteAsync` com filtro de datas. |
| **Mapeamentos EF Core** | `InvestimentoUsinaConfiguration` com índice único em `UsinaId`. `TarifaEnergiaConfiguration` com índice composto em `(UsinaId, DataVigenciaInicio)`. |
| **IoC** | Registrar todos os pares interface/implementação e o `GestaoFinanceiraProfile` no AutoMapper. |

---

## 11. Apêndice A — Mapeamentos EF Core (Exemplos)

> Seguindo os padrões de `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-INFRA.md`.

### `InvestimentoUsinaConfiguration`

```csharp
public class InvestimentoUsinaConfiguration : IEntityTypeConfiguration<InvestimentoUsina>
{
    public void Configure(EntityTypeBuilder<InvestimentoUsina> builder)
    {
        builder.ToTable("InvestimentoUsinas");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ValorTotal)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(x => x.DataInvestimento)
            .IsRequired();

        builder.Property(x => x.Descricao)
            .HasMaxLength(500);

        // Índice único: cada usina tem no máximo um investimento
        builder.HasIndex(x => x.UsinaId)
            .IsUnique();

        builder.HasOne(x => x.Usina)
            .WithMany()
            .HasForeignKey(x => x.UsinaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### `TarifaEnergiaConfiguration`

```csharp
public class TarifaEnergiaConfiguration : IEntityTypeConfiguration<TarifaEnergia>
{
    public void Configure(EntityTypeBuilder<TarifaEnergia> builder)
    {
        builder.ToTable("TarifasEnergia");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ValorKwh)
            .HasColumnType("decimal(10,4)")
            .IsRequired();

        builder.Property(x => x.DataVigenciaInicio)
            .IsRequired();

        builder.Property(x => x.DataVigenciaFim)
            .IsRequired(false);

        builder.Property(x => x.Observacao)
            .HasMaxLength(500);

        // Índice para otimizar consultas de tarifa vigente por usina e data
        builder.HasIndex(x => new { x.UsinaId, x.DataVigenciaInicio });

        builder.HasOne(x => x.Usina)
            .WithMany()
            .HasForeignKey(x => x.UsinaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

### Exemplo — `RecuperarVigenteAsync` no Repositório

```csharp
public async Task<TarifaEnergia?> RecuperarVigenteAsync(int usinaId, DateTime referencia, CancellationToken ct = default)
{
    return await Query()
        .Where(t => t.UsinaId == usinaId
                 && t.DataVigenciaInicio <= referencia
                 && (t.DataVigenciaFim == null || t.DataVigenciaFim >= referencia))
        .OrderByDescending(t => t.DataVigenciaInicio)
        .FirstOrDefaultAsync(ct);
}
```

### Exemplo — Cálculo de Economia Acumulada no AppServico

```csharp
// Para cada mês desde DataInstalacao até hoje:
var economiaMensal = new List<(string Mes, decimal Kwh, decimal Brl)>();

foreach (var mes in mesesNoIntervalo)
{
    var primeiroDia = new DateTime(mes.Ano, mes.Numero, 1);
    var ultimoDia = primeiroDia.AddMonths(1).AddDays(-1);

    var geracaoKwh = await _geracaoDiariaRepositorio.Query()
        .Where(g => g.UsinaId == usinaId && g.Data >= primeiroDia && g.Data <= ultimoDia)
        .SumAsync(g => g.GeracaoTotalKwh, ct);

    var tarifa = await _tarifaEnergiaRepositorio
        .RecuperarVigenteAsync(usinaId, primeiroDia, ct);

    var valorKwh = tarifa?.ValorKwh ?? 0m;
    economiaMensal.Add((mes.Label, geracaoKwh, geracaoKwh * valorKwh));
}

var economiaAcumulada = economiaMensal.Sum(m => m.Brl);
```
