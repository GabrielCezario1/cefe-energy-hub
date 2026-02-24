# Relatório — Backend do Módulo de Telemetria & Diagnóstico Proativo

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
> **⚠️ Pré-requisito:** Os módulos de **Gerenciamento de Energia** e **Monitoramento & Geração** são implementados **antes** deste módulo. Muitos artefatos compartilhados (`Usina`, `LeituraInversor`, `LeituraAmbiental`, `AlertaMonitoramento`, repositórios base, jobs de coleta, AppDbContext, IoC, autenticação JWT) já existirão quando este módulo for iniciado. Este relatório indica explicitamente quais itens devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕).

---

## 1. Visão Geral do Módulo

O módulo de **Telemetria & Diagnóstico Proativo** coleta e exibe dados elétricos detalhados do equipamento **MAINS AGC 150 HÍBRIDO** instalado nas usinas do CEFE Energy Hub. Complementa os módulos anteriores com indicadores elétricos de rede (tensão trifásica, frequência, fator de potência, potência reativa/aparente), status operacional (modo AMF, falha de rede, disjuntor, tensão da bateria), leituras individuais das strings fotovoltaicas e o log centralizado de alertas e falhas.

| Tela | Descrição |
| --- | --- |
| **Telemetria & Diagnóstico Proativo** | KPIs elétricos em tempo real (tensão, frequência, irradiação, temperatura), status do sistema (falta de energia, disjuntor, modo ativo), leituras das strings FV (tensão DC e potência DC por string), log de alertas e falhas |

### Restrições de Acesso

- O módulo está disponível para **todas as unidades** cadastradas no sistema.
- O usuário deve estar autenticado (JWT) e ter uma unidade selecionada.
- Todas as requisições devem incluir o `usinaId` para filtrar os dados.

---

## 2. Origem dos Dados — API Nortebox (fieldList)

> O equipamento **330 — MAINS AGC 150 HÍBRIDO** retorna os campos abaixo no endpoint `target=realtime&mode=readings`. O `ColetaLeituraInversorJob` (Módulo M&G) já chama esse endpoint e recebe o array `readings[]` completo, mas mapeia apenas 3 campos. Este módulo estende esse mapeamento.

| `nome_campo` | Descrição | Unidade | Destino no Backend |
| --- | --- | --- | --- |
| `FREQ` | Frequência | Hz | `LeituraTelemetria.FrequenciaHz` |
| `VL1L2` | Tensão L1-L2 | V | `LeituraTelemetria.TensaoL1L2V` |
| `VL2L3` | Tensão L2-L3 | V | `LeituraTelemetria.TensaoL2L3V` |
| `VL3L1` | Tensão L3-L1 | V | `LeituraTelemetria.TensaoL3L1V` |
| `FP` | Fator de potência | — | `LeituraTelemetria.FatorPotencia` |
| `TOTALQ` | Potência reativa | kvar | `LeituraTelemetria.PotenciaReativaKvar` |
| `TOTALS` | Potência aparente | kVA | `LeituraTelemetria.PotenciaAparenteKva` |
| `VBAT` | Tensão da Bateria | V | `LeituraTelemetria.TensaoBateriaV` |
| `MAINS_FAILURE` | Falta de Energia | binário | `LeituraTelemetria.FaltaDeEnergia` |
| `MB_ON` | Mains Breaker Fechado | binário | `LeituraTelemetria.DisjuntorFechado` |
| `AMF_ACTIVE` | AMF ativo (falta de energia) | binário | `LeituraTelemetria.AmfAtivo` |
| `MODE_PEAK` | Modo Peak Shaving | binário | `LeituraTelemetria.ModoPeakShaving` |
| `FV_DC_VOLTAGE_STR_1` | Voltagem DC String 1 | V | `LeituraStringFV.TensaoDcV` (NumeroString=1) |
| `FV_DC_VOLTAGE_STR_2` | Voltagem DC String 2 | V | `LeituraStringFV.TensaoDcV` (NumeroString=2) |
| `FV_DC_VOLTAGE_STR_3` | Voltagem DC String 3 | V | `LeituraStringFV.TensaoDcV` (NumeroString=3) |
| `FV_DC_VOLTAGE_STR_4` | Voltagem DC String 4 | V | `LeituraStringFV.TensaoDcV` (NumeroString=4) |
| `FV_DC_POWER_STR_1` | Potência DC String 1 | kW | `LeituraStringFV.PotenciaDcKw` (NumeroString=1) |
| `FV_DC_POWER_STR_2` | Potência DC String 2 | kW | `LeituraStringFV.PotenciaDcKw` (NumeroString=2) |
| `FV_DC_POWER_STR_3` | Potência DC String 3 | kW | `LeituraStringFV.PotenciaDcKw` (NumeroString=3) |
| `FV_DC_POWER_STR_4` | Potência DC String 4 | kW | `LeituraStringFV.PotenciaDcKw` (NumeroString=4) |

> **Campos já coletados** pelo `ColetaLeituraInversorJob` (Módulo M&G): `TOTALP` → `LeituraInversor.PotenciaAtualKw`, `KWHD` → `LeituraInversor.GeracaoKwh`, `FV_CABINE_TEMP` → `LeituraInversor.TemperaturaInversorC`. Não são recoletados neste módulo — apenas reutilizados na resposta do endpoint `tempo-real`.

> **Conversão de campos binários:** Campos com `binario: "1"` na API Nortebox retornam o valor como string `"0"` ou `"1"` dentro do array `readings[]`. O job deve converter: `valor == "1"` → `true`.

---

## 3. Funcionalidades Exibidas ao Usuário

### 3.1 — KPIs em Tempo Real (4 cards)

| KPI | Campo Nortebox | Entidade | Faixas de Classificação |
| --- | --- | --- | --- |
| **Tensão da Rede L1-L2 (V)** | `VL1L2` | `LeituraTelemetria.TensaoL1L2V` | Normal: 370–400 V; Alerta: <370 ou >400 V; Crítico: <350 ou >420 V |
| **Frequência (Hz)** | `FREQ` | `LeituraTelemetria.FrequenciaHz` | Normal: 59,5–60,5 Hz; Alerta: fora da faixa |
| **Irradiação (W/m²)** | — | `LeituraAmbiental.IrradiacaoWm2` | Ótimo: ≥600; Moderado: 300–600; Baixo: <300 |
| **Temperatura Cabine (°C)** | `FV_CABINE_TEMP` | `LeituraInversor.TemperaturaInversorC` | Normal: <60°C; Alto: 60–70°C; Crítico: >70°C |

### 3.2 — Status do Sistema (flags operacionais)

| Indicador | Campo Nortebox | Tipo | Comportamento Visual |
| --- | --- | --- | --- |
| **Falta de Energia** | `MAINS_FAILURE` | bool | `false` → "Sem Falha" (verde); `true` → "Falta de Energia" (vermelho) |
| **Disjuntor** | `MB_ON` | bool | `true` → "Fechado" (verde); `false` → "Aberto" (amarelo) |
| **AMF Ativo** | `AMF_ACTIVE` | bool | `true` → "Ativo" (vermelho); `false` → "Inativo" (cinza) |
| **Tensão da Bateria (V)** | `VBAT` | decimal | Valor numérico em V |
| **Modo Peak Shaving** | `MODE_PEAK` | bool | `true` → "Ativo" (azul); `false` → "Inativo" (cinza) |

### 3.3 — Leituras das Strings FV (tabela)

| Coluna | Campo | Observação |
| --- | --- | --- |
| **String** | `NumeroString` | 1 a 4 |
| **Tensão DC (V)** | `FV_DC_VOLTAGE_STR_X` | |
| **Potência DC (kW)** | `FV_DC_POWER_STR_X` | `0,0` indica ausência de geração ou falha de string |

### 3.4 — Log de Alertas e Falhas (tabela paginada)

| Campo | Fonte | Observação |
| --- | --- | --- |
| **Timestamp** | `AlertaMonitoramento.DataOcorrencia` | |
| **Evento** | `AlertaMonitoramento.Titulo` | |
| **Equipamento** | `AlertaMonitoramento.Equipamento` | |
| **Duração** | Calculado: `DataResolucao - DataOcorrencia` | `null` para alertas ainda ativos |
| **Status/Badge** | `AlertaMonitoramento.Status` + `Severidade` | |

> ✅ `AlertaMonitoramento` **já existe** (Módulo M&G). O endpoint apenas consulta essa tabela com filtros por `usinaId`. Nenhuma duplicação de dado ou de coleta.

---

## 4. Endpoints da API

> **Padrão de rotas:** `api/telemetria` (conforme `PADROES_DE_DESENVOLVIMENTO-API.md`).
> Todos os endpoints usam `[Authorize]`. O `usinaId` é passado como query parameter.

### 4.1 — Leitura em Tempo Real

```
GET api/telemetria/tempo-real?usinaId={usinaId}
```

**Request DTO:** `TelemetriaTempoRealRequest`
```csharp
public class TelemetriaTempoRealRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `TelemetriaTempoRealResponse`

```json
{
  "frequenciaHz": 59.98,
  "tensaoL1L2V": 380.5,
  "tensaoL2L3V": 381.2,
  "tensaoL3L1V": 379.8,
  "fatorPotencia": 0.97,
  "potenciaReativaKvar": 45.2,
  "potenciaAparenteKva": 1850.5,
  "tensaoBateriaV": 48.2,
  "faltaDeEnergia": false,
  "disjuntorFechado": true,
  "amfAtivo": false,
  "modoPeakShaving": false,
  "irradiacaoWm2": 847.0,
  "temperaturaAmbienteC": 28.0,
  "temperaturaCabineC": 68.0,
  "dataLeitura": "2026-02-23T14:30:00"
}
```

> Agrega dados de três fontes: última `LeituraTelemetria` (dados elétricos + flags), última `LeituraAmbiental` (irradiação + temp. ambiente) e o campo `TemperaturaInversorC` da última `LeituraInversor`. Todos filtrados por `usinaId`.

---

### 4.2 — Log de Alertas e Falhas

```
GET api/telemetria/log-alertas?usinaId={usinaId}&pagina=1&tamanhoPagina=50
```

**Request DTO:** `TelemetriaLogAlertasRequest` (herda `PaginacaoFiltro`)
```csharp
public class TelemetriaLogAlertasRequest : PaginacaoFiltro
{
    public int UsinaId { get; set; }
    public string? Severidade { get; set; }      // "Alto", "Medio", "Info"
    public bool? ApenasAtivos { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
}
```

**Response DTO:** `TelemetriaAlertaResponse`

```json
{
  "registros": [
    {
      "id": 1,
      "titulo": "Alta Temperatura — Cabine",
      "descricao": "Temperatura acima de 70°C detectada na cabine do inversor",
      "severidade": "Alto",
      "equipamento": "MAINS AGC 150",
      "status": "Ativo",
      "visto": false,
      "dataOcorrencia": "2026-02-23T14:32:15",
      "dataResolucao": null,
      "duracaoMinutos": null
    },
    {
      "id": 2,
      "titulo": "Falta de Energia — AMF Ativo",
      "descricao": "Rede elétrica desligada. Sistema operando em modo AMF (falta de energia).",
      "severidade": "Alto",
      "equipamento": "MAINS AGC 150",
      "status": "Resolvido",
      "visto": true,
      "dataOcorrencia": "2026-02-23T08:05:12",
      "dataResolucao": "2026-02-23T08:07:30",
      "duracaoMinutos": 2
    }
  ],
  "total": 2
}
```

> ✅ Fonte: tabela `AlertaMonitoramento` (já existe, alimentada pelo job de alertas do Módulo M&G). O campo `duracaoMinutos` é **calculado no backend**: `(DataResolucao - DataOcorrencia).TotalMinutes` arredondado. Para alertas com `Status = Ativo`, retorna `null`.

---

### 4.3 — Leituras das Strings FV

```
GET api/telemetria/strings-fv?usinaId={usinaId}
```

**Request DTO:** `TelemetriaStringsFvRequest`
```csharp
public class TelemetriaStringsFvRequest
{
    public int UsinaId { get; set; }
}
```

**Response DTO:** `TelemetriaStringsFvResponse`

```json
{
  "strings": [
    { "numeroString": 1, "tensaoDcV": 450.2, "potenciaDcKw": 25.3 },
    { "numeroString": 2, "tensaoDcV": 448.7, "potenciaDcKw": 24.8 },
    { "numeroString": 3, "tensaoDcV": 451.1, "potenciaDcKw": 25.5 },
    { "numeroString": 4, "tensaoDcV": 0.0,   "potenciaDcKw": 0.0  }
  ],
  "dataLeitura": "2026-02-23T14:30:00"
}
```

**Response DTO aninhado:** `StringFVLeituraResponse`
```csharp
public class StringFVLeituraResponse
{
    public int NumeroString { get; set; }
    public decimal TensaoDcV { get; set; }
    public decimal PotenciaDcKw { get; set; }
}
```

> Retorna a leitura mais recente de cada string (1 a 4). Strings com `potenciaDcKw = 0,0` indicam ausência de geração (noturno, falha ou string desconectada). Todos os 4 registros são sempre retornados.

---

## 5. Responsabilidades do Backend

### 5.1 — Coleta de Dados (Jobs)

| Job | Frequência | Fonte | Status |
| --- | --- | --- | --- |
| **ColetaLeituraInversorJob** | A cada 15 min | API Nortebox (`target=realtime&mode=readings`) | 🔄 ESTENDER — adicionar mapeamento dos campos de telemetria |
| **ColetaAlertasJob** | A cada 5 min | API Nortebox (`target=realtime&mode=alarms`) | ✅ REUTILIZAR — já alimenta `AlertaMonitoramento` |

> **Estratégia de coleta — sem chamada adicional à API:**
> O `ColetaLeituraInversorJob` já chama `target=realtime&mode=readings` e já recebe o array `readings[]` completo com todos os campos do equipamento. Atualmente mapeia apenas `TOTALP`, `KWHD` e `FV_CABINE_TEMP`. A extensão adicionará o mapeamento dos 20 campos novos de telemetria do mesmo array de resposta e persistirá nas tabelas `leituras_telemetria` e `leituras_string_fv` na **mesma transação** do job existente. Zero chamadas adicionais à API Nortebox.

### 5.2 — Regras de Negócio

| Regra | Descrição |
| --- | --- |
| **Classificação de Tensão** | Normal: 370–400 V; Alerta: fora da faixa; Crítico: <350 V ou >420 V |
| **Classificação de Frequência** | Normal: 59,5–60,5 Hz; Alerta: fora da faixa |
| **Classificação de Temperatura** | Normal: <60°C; Alto: 60–70°C; Crítico: >70°C |
| **Classificação de Irradiação** | Ótimo: ≥600 W/m²; Moderado: 300–600 W/m²; Baixo: <300 W/m² |
| **Duração do Alerta** | Calculado no backend: `(DataResolucao - DataOcorrencia).TotalMinutes`. Alertas `Ativo` retornam `duracaoMinutos = null` |
| **Seleção de Strings FV** | Query: `MAX(DataHora) GROUP BY NumeroString WHERE UsinaId = X`. Sempre retorna 4 registros (um por string) |
| **Conversão de flags binárias** | Campos `binario: "1"` na API Nortebox retornam string `"0"` ou `"1"`. Converter: `valor == "1"` → `true` |

---

## 6. Diagrama de Entidades

> Todas as entidades seguem o padrão do Domínio: propriedades `virtual`, setters `protected set`, construtor vazio `protected` (EF Core), métodos `Set<Propriedade>` com validação via `RegraDeNegocioExcecao`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`
>
> **⚠️ Itens já existentes (Módulos anteriores):**
> - `Usina` — ✅ REUTILIZAR (GE + M&G)
> - `LeituraInversor` — ✅ REUTILIZAR (GE) — campo `TemperaturaInversorC` já coletado
> - `LeituraAmbiental` — ✅ REUTILIZAR (M&G) — campo `IrradiacaoWm2` já coletado
> - `AlertaMonitoramento`, `SeveridadeEnum`, `StatusAlertaEnum` — ✅ REUTILIZAR (M&G)
> - `ColetaLeituraInversorJob` — 🔄 ESTENDER (adicionar mapeamento de telemetria)
>
> Criar apenas: **`LeituraTelemetria`** e **`LeituraStringFV`**

```
┌─────────────────────────────────────────────────────┐
│                  LeituraTelemetria                  │
├─────────────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual int UsinaId { get; protected set; }         │
│ virtual Usina Usina { get; protected set; }         │
│ virtual DateTime DataHora { get; protected set; }   │
│ virtual decimal FrequenciaHz { get; prot. set; }    │
│ virtual decimal TensaoL1L2V { get; prot. set; }     │
│ virtual decimal TensaoL2L3V { get; prot. set; }     │
│ virtual decimal TensaoL3L1V { get; prot. set; }     │
│ virtual decimal FatorPotencia { get; prot. set; }   │
│ virtual decimal PotenciaReativaKvar { get; prot. }  │
│ virtual decimal PotenciaAparenteKva { get; prot. }  │
│ virtual decimal TensaoBateriaV { get; prot. set; }  │
│ virtual bool FaltaDeEnergia { get; prot. set; }     │
│ virtual bool DisjuntorFechado { get; prot. set; }   │
│ virtual bool AmfAtivo { get; prot. set; }           │
│ virtual bool ModoPeakShaving { get; prot. set; }    │
├─────────────────────────────────────────────────────┤
│ protected LeituraTelemetria() { }                   │
│ SetFrequenciaHz(decimal valor)                      │
│ SetTensoes(decimal l1l2, decimal l2l3, decimal l3l1)│
│ SetFatorPotencia(decimal valor)                     │
│ SetPotencias(decimal reativa, decimal aparente)     │
│ SetTensaoBateriaV(decimal valor)                    │
│ SetFlags(bool faltaEnergia, bool disjuntor,         │
│          bool amf, bool peakShaving)                │
└──────────────────────────┬──────────────────────────┘
                           │ N
                           │
                           │ 1
              ┌────────────▼────────────┐
              │         Usina           │
              │  (já existe — GE + M&G) │
              └────────────┬────────────┘
                           │ 1
                           │
                           │ N
┌──────────────────────────▼──────────────────────────┐
│                   LeituraStringFV                   │
├─────────────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }              │
│ virtual int UsinaId { get; protected set; }         │
│ virtual Usina Usina { get; protected set; }         │
│ virtual DateTime DataHora { get; protected set; }   │
│ virtual int NumeroString { get; prot. set; }        │
│ virtual decimal TensaoDcV { get; prot. set; }       │
│ virtual decimal PotenciaDcKw { get; prot. set; }    │
├─────────────────────────────────────────────────────┤
│ protected LeituraStringFV() { }                     │
│ SetTensaoDcV(decimal valor)                         │
│ SetPotenciaDcKw(decimal valor)                      │
└─────────────────────────────────────────────────────┘
```

---

## 7. Configurações EF Core (Infraestrutura)

> Seguir `PADROES_DE_DESENVOLVIMENTO-INFRA.md`. Um arquivo `IEntityTypeConfiguration<T>` por entidade.

### `LeituraTelemetriaConfiguration`

- **Tabela:** `leituras_telemetria`
- **FK:** `UsinaId` → tabela `usinas`
- **Precisão dos decimais:**
  - `FrequenciaHz` → `decimal(10, 4)`
  - `TensaoL1L2V`, `TensaoL2L3V`, `TensaoL3L1V`, `TensaoBateriaV` → `decimal(10, 2)`
  - `FatorPotencia` → `decimal(10, 4)`
  - `PotenciaReativaKvar`, `PotenciaAparenteKva` → `decimal(18, 2)`
- **Índice composto:** `IX_LeituraTelemetria_UsinaId_DataHora` — otimiza consultas da última leitura por usina

### `LeituraStringFVConfiguration`

- **Tabela:** `leituras_string_fv`
- **FK:** `UsinaId` → tabela `usinas`
- **Precisão dos decimais:**
  - `TensaoDcV` → `decimal(10, 2)`
  - `PotenciaDcKw` → `decimal(18, 4)`
- **Índice composto:** `IX_LeituraStringFV_UsinaId_NumeroString_DataHora` — otimiza a query `MAX(DataHora) GROUP BY NumeroString`

---

## 8. Registro no IoC

> Conforme `PADROES_DE_DESENVOLVIMENTO-IOC.md`. Arquivos de IoC já existem (GE). Apenas adicionar novos registros:

- 🆕 `ILeiturasTelemetriaRepositorio` → `LeiturasTelemetriaRepositorio`
- 🆕 `ILeiturasStringFVRepositorio` → `LeiturasStringFVRepositorio`
- 🆕 `ITelemetriaServicos` → `TelemetriaServicos`
- 🆕 `ITelemetriaAppServico` → `TelemetriaAppServico`
- 🆕 Registrar `TelemetriaProfile` em `ConfiguracoesAutoMapper.cs`

---

## 9. Observações Finais

- **Zero novas chamadas à API:** O módulo de Telemetria **não cria um novo job** e **não faz novas chamadas à API Nortebox**. O `ColetaLeituraInversorJob` é estendido para mapear e persistir campos adicionais do mesmo array `readings[]` já recebido, na mesma janela de 15 minutos.
- **Reutilização total dos alertas:** O endpoint `api/telemetria/log-alertas` consulta a tabela `AlertaMonitoramento` do Módulo M&G. Mesmos dados, nova perspectiva — sem duplicação de coleta ou armazenamento.
- **Strings ausentes:** String com `potenciaDcKw = 0` deve ser persistida mesmo assim. A informação de ausência de geração (seja por período noturno, falha ou desconexão) é dado operacionalmente relevante.
- **Campos `null`:** Se o job não encontrar um campo específico no `readings[]` (ex: equipamento diferente do modelo esperado), persistir `null` nos campos opcionais e logar a ausência. Não interromper o job por ausência de um campo.
