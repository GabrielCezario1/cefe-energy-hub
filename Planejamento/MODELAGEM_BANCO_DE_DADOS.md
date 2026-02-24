# Modelagem do Banco de Dados — CEFE Energy Hub

> **Projeto:** CEFE Energy Hub
>
> **Banco de Dados:** SQL Server (instância única, compartilhada entre todas as unidades)
>
> **ORM:** Entity Framework Core — Fluent API (`IEntityTypeConfiguration<T>`)
>
> **Data:** Fevereiro/2026

---

## Sumário

- [Modelagem do Banco de Dados — CEFE Energy Hub](#modelagem-do-banco-de-dados--cefe-energy-hub)
  - [Sumário](#sumário)
  - [1. Visão Geral](#1-visão-geral)
  - [2. Diagrama de Relacionamentos Completo](#2-diagrama-de-relacionamentos-completo)
    - [Relacionamentos Resumidos](#relacionamentos-resumidos)
  - [3. Tabela: `usuarios`](#3-tabela-usuarios)
    - [Comunicação com os Demais Módulos](#comunicação-com-os-demais-módulos)
  - [4. Tabela: `usinas`](#4-tabela-usinas)
  - [5. Tabela: `galpoes`](#5-tabela-galpoes)
  - [6. Tabela: `registros_md50`](#6-tabela-registros_md50)
  - [7. Tabela: `resumos_diarios_galpao`](#7-tabela-resumos_diarios_galpao)
  - [8. Tabela: `faturas_mensais_condominio`](#8-tabela-faturas_mensais_condominio)
  - [9. Tabela: `itens_demonstrativo_fatura`](#9-tabela-itens_demonstrativo_fatura)
  - [10. Tabela: `leituras_inversor`](#10-tabela-leituras_inversor)
  - [11. Tabela: `leituras_ambiental`](#11-tabela-leituras_ambiental)
  - [12. Tabela: `geracoes_diarias`](#12-tabela-geracoes_diarias)
  - [13. Tabela: `alertas_monitoramento`](#13-tabela-alertas_monitoramento)
  - [14. Tabela: `investimento_usinas`](#14-tabela-investimento_usinas)
  - [15. Tabela: `tarifas_energia`](#15-tabela-tarifas_energia)
  - [16. Tabela: `leituras_telemetria`](#16-tabela-leituras_telemetria)
  - [17. Tabela: `leituras_string_fv`](#17-tabela-leituras_string_fv)
  - [18. Tabela: `contatos`](#18-tabela-contatos)
  - [19. Enums do Domínio](#19-enums-do-domínio)
    - [`PerfilUsuarioEnum` (Usuários)](#perfilusuarioenum-usuários)
    - [`ClassificacaoHorarioEnum` (Gerenciamento de Energia)](#classificacaohorarioenum-gerenciamento-de-energia)
    - [`SeveridadeEnum` (Monitoramento \& Geração)](#severidadeenum-monitoramento--geração)
    - [`StatusAlertaEnum` (Monitoramento \& Geração)](#statusalertaenum-monitoramento--geração)
  - [20. Índices](#20-índices)
    - [Índices Compostos](#índices-compostos)
    - [Índices Únicos (Constraints)](#índices-únicos-constraints)
  - [21. Volume de Dados Estimado](#21-volume-de-dados-estimado)
    - [Por Usina/Mês](#por-usinamês)
    - [Projeção Total (8 Usinas × 12 Meses)](#projeção-total-8-usinas--12-meses)
  - [22. Ordem de Criação (Migrations)](#22-ordem-de-criação-migrations)

---

## 1. Visão Geral

O banco de dados do CEFE Energy Hub possui **18 tabelas** distribuídas em **6 módulos** e **1 entidade compartilhada** (`usinas`):

| Módulo | Tabelas | Origem dos Dados |
| --- | --- | --- |
| **Usuários** | `usuarios` | CRUD + registro público. **⚠️ Primeiro módulo implementado — cria AppDbContext, RepositorioBase, Program.cs e IoC base.** |
| **Compartilhado** | `usinas` | Cadastro manual |
| **Gerenciamento de Energia** | `galpoes`, `registros_md50`, `resumos_diarios_galpao`, `faturas_mensais_condominio`, `itens_demonstrativo_fatura`, `leituras_inversor` | Jobs (MD50, ProjectSwitch, Enel) + consolidação |
| **Monitoramento & Geração** | `leituras_ambiental`, `geracoes_diarias`, `alertas_monitoramento` | Jobs (ProjectSwitch) + consolidação |
| **Gestão Financeira** | `investimento_usinas`, `tarifas_energia` | Cadastro manual (admin) |
| **Telemetria & Diagnóstico** | `leituras_telemetria`, `leituras_string_fv` | Job (ProjectSwitch — extensão do existente) |
| **Comunicação** | `contatos` | CRUD manual |

---

## 2. Diagrama de Relacionamentos Completo

```
  ┌──────────────────────┐
  │     usuarios          │   (tabela global — sem FK para usinas)
  │  JWT auth p/ todo o   │   Perfil: 'Cliente' | 'Admin'
  │  sistema [Authorize]  │   Índice UNIQUE em email
  └──────────────────────┘

                         ┌──────────────────────┐
                         │       usinas          │
                         │  (entidade central)   │
                         └──────────┬────────────┘
                                    │ 1
            ┌───────────┬───────────┼───────────┬───────────┬───────────┬───────────┬───────────┐
            │ N         │ N         │ N         │ N         │ N         │ 1         │ N         │
            ▼           ▼           ▼           ▼           ▼           ▼           ▼           │
     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
     │ galpoes  │ │leituras_ │ │leituras_ │ │geracoes_ │ │alertas_  │ │investim_ │ │tarifas_  ││
     │          │ │inversor  │ │ambiental │ │diarias   │ │monitor.  │ │usinas    │ │energia   ││
     └────┬─────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
          │ 1                                                                                   │
     ┌────┼────────────┐                                                                        │
     │ N  │            │ N                                                                      │
     ▼    │            ▼                              ┌──────────────┐ ┌──────────────┐         │
┌─────────┴──┐  ┌──────────────┐                      │ leituras_    │ │ leituras_    │◄────────┘
│registros_  │  │resumos_      │                      │ telemetria   │ │ string_fv    │  N
│md50        │  │diarios_galpao│                      └──────────────┘ └──────────────┘
└────────────┘  └──────────────┘

     ┌──────────────────────┐         ┌──────────────────────┐
     │faturas_mensais_      │ 1 ── N  │itens_demonstrativo_  │
     │condominio             │         │fatura                │
     └──────────────────────┘         └──────────────────────┘
         ▲ N
         │
    usinas (1)


     ┌──────────────────────┐
     │     contatos          │   (tabela global — sem FK para usinas)
     └──────────────────────┘
```

> **Nota sobre `usuarios`:** A tabela `usuarios` **não possui FK** para `usinas`. Os dados de usuário são globais — qualquer usuário autenticado pode acessar qualquer usina. A relação entre o usuário e o restante do sistema ocorre **via JWT**: todo endpoint `[Authorize]` valida o token emitido pelo módulo de Usuários, e o claim `perfil` (`Cliente` / `Admin`) controla o nível de acesso.

### Relacionamentos Resumidos

| Origem | Cardinalidade | Destino | FK | Módulo |
| --- | --- | --- | --- | --- |
| `usinas` | 1 → N | `galpoes` | `galpoes.usina_id` | GE |
| `usinas` | 1 → N | `leituras_inversor` | `leituras_inversor.usina_id` | GE |
| `usinas` | 1 → N | `faturas_mensais_condominio` | `faturas_mensais_condominio.usina_id` | GE |
| `usinas` | 1 → N | `leituras_ambiental` | `leituras_ambiental.usina_id` | M&G |
| `usinas` | 1 → N | `geracoes_diarias` | `geracoes_diarias.usina_id` | M&G |
| `usinas` | 1 → N | `alertas_monitoramento` | `alertas_monitoramento.usina_id` | M&G |
| `usinas` | 1 → 1 | `investimento_usinas` | `investimento_usinas.usina_id` (UNIQUE) | GF |
| `usinas` | 1 → N | `tarifas_energia` | `tarifas_energia.usina_id` | GF |
| `usinas` | 1 → N | `leituras_telemetria` | `leituras_telemetria.usina_id` | TEL |
| `usinas` | 1 → N | `leituras_string_fv` | `leituras_string_fv.usina_id` | TEL |
| `galpoes` | 1 → N | `registros_md50` | `registros_md50.galpao_id` | GE |
| `galpoes` | 1 → N | `resumos_diarios_galpao` | `resumos_diarios_galpao.galpao_id` | GE |
| `faturas_mensais_condominio` | 1 → N | `itens_demonstrativo_fatura` | `itens_demonstrativo_fatura.fatura_id` | GE |
| — | — | `usuarios` | Sem FK (tabela global — auth via JWT) | USU |
| — | — | `contatos` | Sem FK (tabela global) | COM |

---

## 3. Tabela: `usuarios`

> **Módulo:** Usuários (Autenticação & Gestão de Perfil)
>
> **Entidade:** `Usuario`
>
> **Volume:** ~5–10 registros/mês (cadastro sob demanda). Volume muito baixo — nunca ultrapassará centenas de registros.
>
> **⚠️ Primeira tabela do sistema.** A migration que cria esta tabela (`CriarTabelaUsuarios`) é a migration #0 — antes de todas as demais.
>
> **Nota:** Tabela **global** — sem FK para `usinas`. Todos os usuários autenticados acessam todas as usinas. A comunicação com os demais módulos ocorre via **JWT**: o token emitido no login contém claims (`userId`, `email`, `perfil`, `nome`) que são validados em todo endpoint `[Authorize]` do sistema.

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `nome` | `nvarchar(200)` | `string` | NOT NULL | — | Nome completo do usuário |
| `perfil` | `nvarchar(50)` | `string` | NOT NULL | DEFAULT `'Cliente'` | `'Cliente'` ou `'Admin'`. Somente Admin pode alterar. |
| `email` | `nvarchar(255)` | `string` | NOT NULL | UNIQUE (`IX_Usuario_Email`) | E-mail de login — deve ser único no sistema |
| `senha_hash` | `nvarchar(500)` | `string` | NOT NULL | — | Hash gerado por `PasswordHasher<Usuario>` nativo .NET |
| `email_confirmado` | `bit` | `bool` | NOT NULL | DEFAULT `false` | `true` após confirmar via token de propósito (JWT `purpose=confirm-email`, 24h) |
| `url_foto` | `nvarchar(500)` | `string?` | NULL | — | URL da foto de perfil |
| `bloqueado` | `bit` | `bool` | NOT NULL | DEFAULT `false` | `true` impede login. Apenas Admin pode bloquear/desbloquear. |
| `celular` | `nvarchar(20)` | `string?` | NULL | — | Telefone celular do usuário |

### Comunicação com os Demais Módulos

| Integração | Mecanismo | Descrição |
| --- | --- | --- |
| **Todos os endpoints `[Authorize]`** | JWT (claim `sub` / `userId`) | Todo request autenticado carrega o JWT emitido pelo `AuthController`. O middleware de autenticação valida o token e extrai os claims. |
| **Controle de acesso por perfil** | JWT (claim `perfil`) | Endpoints restritos a Admin (ex: `PUT api/usuarios/{id}/perfil-tipo`) verificam o claim `perfil` do token. |
| **Sem FK direta** | — | A tabela `usuarios` não possui FK para `usinas` nem para nenhuma outra tabela. A relação é **lógica/transversal**, não relacional. |
| **Tokens de propósito** | JWT sem persistência | Confirmação de e-mail (`purpose=confirm-email`, 24h) e redefinição de senha (`purpose=reset-password`, 1h) são JWTs assinados com a mesma chave — sem tabela adicional no banco. |

---

## 4. Tabela: `usinas`

> **Módulo de origem:** Gerenciamento de Energia (criação) + Monitoramento & Geração (extensão)
>
> **Entidade:** `Usina`

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `nome` | `nvarchar(255)` | `string` | NOT NULL | — | Nome da usina/unidade |
| `localizacao` | `nvarchar(255)` | `string` | NULL | — | Cidade / Endereço |
| `estado` | `nvarchar(2)` | `string` | NOT NULL | — | UF (CE, ES, RJ) |
| `potencia_instalada_kwp` | `decimal(18,2)` | `decimal` | NOT NULL | — | Potência instalada em kWp. Adicionado no módulo M&G |
| `potencia_instalada_descricao` | `nvarchar(50)` | `string` | NULL | — | Ex: "2.5 MWp". Adicionado no módulo M&G |
| `data_instalacao` | `datetime2` | `DateTime` | NOT NULL | — | Data de instalação do sistema solar. Adicionado no módulo M&G |
| `demanda_contratada_kw` | `decimal(18,2)` | `decimal` | NOT NULL | — | Demanda contratada junto à concessionária |
| `ativo` | `bit` | `bool` | NOT NULL | — | Soft delete / status ativo |

---

## 5. Tabela: `galpoes`

> **Módulo:** Gerenciamento de Energia
>
> **Entidade:** `Galpao`

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id` | Usina a que pertence o galpão |
| `nome` | `nvarchar(255)` | `string` | NOT NULL | — | Nome do galpão (ex: "Mercado Livre") |
| `demanda_contratada_kw` | `decimal(18,2)` | `decimal` | NOT NULL | — | Demanda contratada do galpão |
| `numero_serial_medidor` | `nvarchar(100)` | `string` | NULL | — | Serial do medidor Embrasul MD50 |
| `ativo` | `bit` | `bool` | NOT NULL | — | Status ativo |

---

## 6. Tabela: `registros_md50`

> **Módulo:** Gerenciamento de Energia
>
> **Entidade:** `RegistroMD50`
>
> **Volume:** ~96 registros/dia/galpão (1 a cada 15 min)

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `galpao_id` | `int` | `int` | NOT NULL | FK → `galpoes.id` | Galpão de origem |
| `data_hora` | `datetime2` | `DateTime` | NOT NULL | — | Timestamp do intervalo de 15 min |
| `consumo_ponta` | `decimal(18,4)` | `decimal` | NULL | — | Consumo acumulado ponta (kWh) |
| `consumo_fora_ponta` | `decimal(18,4)` | `decimal` | NULL | — | Consumo acumulado fora ponta (kWh) |
| `consumo_reserv` | `decimal(18,4)` | `decimal` | NULL | — | Consumo acumulado reservado (kWh) |
| `energ_ind_ponta` | `decimal(18,4)` | `decimal` | NULL | — | Energia indutiva ponta (kWh) |
| `energ_ind_fora_ponta` | `decimal(18,4)` | `decimal` | NULL | — | Energia indutiva fora ponta (kWh) |
| `energ_cap_ponta` | `decimal(18,4)` | `decimal` | NULL | — | Energia capacitiva ponta (kWh) |
| `energ_cap_fora_ponta` | `decimal(18,4)` | `decimal` | NULL | — | Energia capacitiva fora ponta (kWh) |
| `max_pot_ativ_ponta` | `decimal(18,4)` | `decimal` | NULL | — | Potência ativa máx. ponta (kW) |
| `max_pot_ativ_fora_ponta` | `decimal(18,4)` | `decimal` | NULL | — | Potência ativa máx. fora ponta (kW) |
| `consumo_ponta_15min` | `decimal(18,4)` | `decimal` | NULL | — | Consumo no intervalo — ponta (kWh) |
| `consumo_fora_ponta_15min` | `decimal(18,4)` | `decimal` | NULL | — | Consumo no intervalo — fora ponta (kWh) |
| `energ_ind_ponta_15min` | `decimal(18,4)` | `decimal` | NULL | — | Energia indutiva ponta no intervalo |
| `energ_ind_fora_ponta_15min` | `decimal(18,4)` | `decimal` | NULL | — | Energia indutiva fora ponta no intervalo |
| `pot_ativ_t` | `decimal(18,4)` | `decimal` | NULL | — | Potência ativa total (kW) |
| `fat_pot_t` | `decimal(10,4)` | `decimal` | NULL | — | Fator de potência total. Alerta se < 0.92 |

---

## 7. Tabela: `resumos_diarios_galpao`

> **Módulo:** Gerenciamento de Energia
>
> **Entidade:** `ResumoDiarioGalpao`
>
> **Volume:** 1 registro/dia/galpão (consolidação diária)

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `galpao_id` | `int` | `int` | NOT NULL | FK → `galpoes.id` | Galpão de origem |
| `data` | `datetime2` | `DateTime` | NOT NULL | — | Data do resumo |
| `consumo_ponta_kwh` | `decimal(18,2)` | `decimal` | NULL | — | `SUM(consumo_ponta_15min)` do dia |
| `consumo_fora_ponta_kwh` | `decimal(18,2)` | `decimal` | NULL | — | `SUM(consumo_fora_ponta_15min)` do dia |
| `consumo_total_kwh` | `decimal(18,2)` | `decimal` | NULL | — | Ponta + Fora Ponta |
| `demanda_max_kw` | `decimal(18,2)` | `decimal` | NULL | — | `MAX(pot_ativ_t)` do dia |
| `fat_pot_medio` | `decimal(10,4)` | `decimal` | NULL | — | `AVG(fat_pot_t)` do dia |
| `custo_estimado_brl` | `decimal(18,2)` | `decimal` | NULL | — | Consumo total × tarifa média |

---

## 8. Tabela: `faturas_mensais_condominio`

> **Módulo:** Gerenciamento de Energia
>
> **Entidade:** `FaturaMensalCondominio`
>
> **Volume:** 1 registro/mês/usina

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id` | Usina/condomínio |
| `mes` | `nvarchar(7)` | `string` | NOT NULL | — | Formato "YYYY-MM" (ex: "2026-01") |
| `valor_total_brl` | `decimal(18,2)` | `decimal` | NULL | — | Valor total da fatura Enel |
| `consumo_total_kwh` | `decimal(18,2)` | `decimal` | NULL | — | Consumo total registrado na fatura |
| `geracao_total_kwh` | `decimal(18,2)` | `decimal` | NULL | — | `Σ LeituraInversor.GeracaoKwh` do mês |
| `energia_injetada_kwh` | `decimal(18,2)` | `decimal` | NULL | — | Energia injetada na rede (fatura Enel) |
| `consumo_solar_kwh` | `decimal(18,2)` | `decimal` | NULL | — | `geracao_total - energia_injetada` |
| `consumo_concessonaria_kwh` | `decimal(18,2)` | `decimal` | NULL | — | Energia fornecida pela rede |
| `demanda_contratada_kw` | `decimal(18,2)` | `decimal` | NULL | — | Demanda contratada no período |

---

## 9. Tabela: `itens_demonstrativo_fatura`

> **Módulo:** Gerenciamento de Energia
>
> **Entidade:** `ItemDemonstrativoFatura`
>
> **Volume:** ~7 registros/fatura

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `fatura_id` | `int` | `int` | NOT NULL | FK → `faturas_mensais_condominio.id` | Fatura pai. `ON DELETE CASCADE` |
| `indicador` | `nvarchar(255)` | `string` | NOT NULL | — | Nome do item do demonstrativo |
| `quantidade` | `decimal(18,4)` | `decimal?` | NULL | — | Quantidade do item |
| `unidade_medida` | `nvarchar(50)` | `string` | NULL | — | Ex: "kWh", "kW" |
| `tarifa` | `decimal(18,6)` | `decimal?` | NULL | — | Tarifa unitária (R$/kWh ou R$/kW) |
| `valor` | `decimal(18,2)` | `decimal` | NOT NULL | — | Valor total do item (R$) |
| `base_icms` | `decimal(18,2)` | `decimal` | NULL | — | Base de cálculo ICMS |
| `aliquota_icms` | `decimal(10,4)` | `decimal` | NULL | — | Alíquota ICMS (%) |
| `valor_icms` | `decimal(18,2)` | `decimal` | NULL | — | Valor ICMS (R$) |

---

## 10. Tabela: `leituras_inversor`

> **Módulo de origem:** Gerenciamento de Energia (criação) — reutilizado em Monitoramento & Geração e Telemetria
>
> **Entidade:** `LeituraInversor`
>
> **Volume:** ~96 registros/dia/usina (a cada 15 min × N inversores)

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id` | Usina de origem |
| `data_hora` | `datetime2` | `DateTime` | NOT NULL | — | Timestamp da leitura |
| `potencia_atual_kw` | `decimal(18,2)` | `decimal` | NULL | — | Potência instantânea (kW). Campo `TOTALP` da API Nortebox |
| `geracao_kwh` | `decimal(18,2)` | `decimal` | NULL | — | Energia gerada no intervalo. Campo `KWHD` |
| `temperatura_inversor_c` | `decimal(10,2)` | `decimal` | NULL | — | Temperatura da cabine (°C). Campo `FV_CABINE_TEMP` |
| `numero_inversor` | `int` | `int` | NULL | — | Identificador do inversor |

---

## 11. Tabela: `leituras_ambiental`

> **Módulo:** Monitoramento & Geração
>
> **Entidade:** `LeituraAmbiental`
>
> **Volume:** ~96 registros/dia/usina

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id` | Usina de origem |
| `data_hora` | `datetime2` | `DateTime` | NOT NULL | — | Timestamp da leitura |
| `irradiacao_wm2` | `decimal(10,2)` | `decimal` | NULL | — | Irradiação solar (W/m²) |
| `temperatura_ambiente_c` | `decimal(10,2)` | `decimal` | NULL | — | Temperatura ambiente (°C) |

---

## 12. Tabela: `geracoes_diarias`

> **Módulo:** Monitoramento & Geração — reutilizado em Gestão Financeira
>
> **Entidade:** `GeracaoDiaria`
>
> **Volume:** 1 registro/dia/usina (consolidação diária)

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id` | Usina de origem |
| `data` | `datetime2` | `DateTime` | NOT NULL | — | Data do consolidado |
| `geracao_total_kwh` | `decimal(18,2)` | `decimal` | NULL | — | `SUM(LeituraInversor.GeracaoKwh)` do dia |
| `potencia_maxima_kw` | `decimal(18,2)` | `decimal` | NULL | — | `MAX(LeituraInversor.PotenciaAtualKw)` do dia |
| `performance_ratio_percent` | `decimal(10,2)` | `decimal` | NULL | — | `(Geração Real / Geração Teórica) × 100` |
| `hsp_dia` | `decimal(10,4)` | `decimal` | NULL | — | Horas de Sol Pleno do dia |
| `irradiacao_media_wm2` | `decimal(10,2)` | `decimal` | NULL | — | Irradiação solar média do dia (W/m²) |

---

## 13. Tabela: `alertas_monitoramento`

> **Módulo:** Monitoramento & Geração — reutilizado em Telemetria & Diagnóstico
>
> **Entidade:** `AlertaMonitoramento`
>
> **Origem:** Exclusivamente API ProjectSwitch (Nortebox). O backend NÃO gera alertas internamente.
>
> **Volume:** ~5 registros/dia/usina (variável)

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id` | Usina de origem |
| `id_externo_project_switch` | `nvarchar(255)` | `string` | NOT NULL | — | Chave de deduplicação. Composto: `equipamentId + nome + data_cadastro` |
| `id_equipamento_project_switch` | `int` | `int` | NOT NULL | — | ID do equipamento no sistema ProjectSwitch |
| `titulo` | `nvarchar(500)` | `string` | NOT NULL | — | Campo `nome` do alarme ProjectSwitch |
| `descricao` | `nvarchar(1000)` | `string` | NULL | — | Campo `descricao` do alarme ProjectSwitch |
| `severidade` | `int` | `SeveridadeEnum` | NOT NULL | — | 0 = Info, 1 = Medio, 2 = Alto |
| `equipamento` | `nvarchar(255)` | `string` | NOT NULL | — | Nome do equipamento no ProjectSwitch |
| `status` | `int` | `StatusAlertaEnum` | NOT NULL | — | 0 = Ativo, 1 = Resolvido |
| `visto` | `bit` | `bool` | NOT NULL | — | Campo `visto` do alarme ProjectSwitch |
| `data_ocorrencia` | `datetime2` | `DateTime` | NOT NULL | — | Campo `data_cadastro` do alarme ProjectSwitch |
| `data_resolucao` | `datetime2` | `DateTime?` | NULL | — | Campo `data_saida` do alarme. `null` se ainda ativo |
| `data_visto` | `datetime2` | `DateTime?` | NULL | — | Campo `data_vista` do alarme ProjectSwitch |
| `data_sincronizacao` | `datetime2` | `DateTime` | NOT NULL | — | Quando o job coletou/atualizou este registro |

---

## 14. Tabela: `investimento_usinas`

> **Módulo:** Gestão Financeira
>
> **Entidade:** `InvestimentoUsina`
>
> **Volume:** 1 registro por usina (registro único)
>
> **Restrição:** Índice UNIQUE em `usina_id` — cada usina possui no máximo 1 investimento

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id`, UNIQUE | Uma usina tem no máximo um investimento |
| `valor_total` | `decimal(18,2)` | `decimal` | NOT NULL | — | Valor do investimento em R$ |
| `data_investimento` | `datetime2` | `DateTime` | NOT NULL | — | Data de realização do investimento |
| `descricao` | `nvarchar(500)` | `string?` | NULL | — | Descrição opcional (ex: "Sistema solar 120kWp") |

---

## 15. Tabela: `tarifas_energia`

> **Módulo:** Gestão Financeira
>
> **Entidade:** `TarifaEnergia`
>
> **Volume:** ~1-2 registros/ano/usina (atualizada em reajustes tarifários)
>
> **Regra de vigência:** Ao inserir nova tarifa, o backend encerra a anterior definindo `data_vigencia_fim = nova.data_vigencia_inicio - 1 dia`

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id` | Usina a que se aplica a tarifa |
| `valor_kwh` | `decimal(10,4)` | `decimal` | NOT NULL | — | Tarifa em R$/kWh (já com impostos) |
| `data_vigencia_inicio` | `datetime2` | `DateTime` | NOT NULL | — | Início da vigência |
| `data_vigencia_fim` | `datetime2` | `DateTime?` | NULL | — | Fim da vigência. `null` = vigente até hoje |
| `observacao` | `nvarchar(500)` | `string?` | NULL | — | Descrição (ex: "Reajuste ANEEL 2025") |

---

## 16. Tabela: `leituras_telemetria`

> **Módulo:** Telemetria & Diagnóstico Proativo
>
> **Entidade:** `LeituraTelemetria`
>
> **Origem:** API Nortebox — equipamento MAINS AGC 150 HÍBRIDO (`target=realtime&mode=readings`)
>
> **Volume:** ~96 registros/dia/usina (mesma frequência do inversor — 15 min)

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id` | Usina de origem |
| `data_hora` | `datetime2` | `DateTime` | NOT NULL | — | Timestamp da leitura |
| `frequencia_hz` | `decimal(10,4)` | `decimal` | NULL | — | Frequência da rede (Hz). Campo `FREQ` |
| `tensao_l1l2_v` | `decimal(10,2)` | `decimal` | NULL | — | Tensão L1-L2 (V). Campo `VL1L2` |
| `tensao_l2l3_v` | `decimal(10,2)` | `decimal` | NULL | — | Tensão L2-L3 (V). Campo `VL2L3` |
| `tensao_l3l1_v` | `decimal(10,2)` | `decimal` | NULL | — | Tensão L3-L1 (V). Campo `VL3L1` |
| `fator_potencia` | `decimal(10,4)` | `decimal` | NULL | — | Fator de potência. Campo `FP` |
| `potencia_reativa_kvar` | `decimal(18,2)` | `decimal` | NULL | — | Potência reativa (kvar). Campo `TOTALQ` |
| `potencia_aparente_kva` | `decimal(18,2)` | `decimal` | NULL | — | Potência aparente (kVA). Campo `TOTALS` |
| `tensao_bateria_v` | `decimal(10,2)` | `decimal` | NULL | — | Tensão da bateria (V). Campo `VBAT` |
| `falta_de_energia` | `bit` | `bool` | NULL | — | Flag: falta de energia. Campo `MAINS_FAILURE` |
| `disjuntor_fechado` | `bit` | `bool` | NULL | — | Flag: Mains Breaker fechado. Campo `MB_ON` |
| `amf_ativo` | `bit` | `bool` | NULL | — | Flag: AMF ativo. Campo `AMF_ACTIVE` |
| `modo_peak_shaving` | `bit` | `bool` | NULL | — | Flag: Peak Shaving. Campo `MODE_PEAK` |

---

## 17. Tabela: `leituras_string_fv`

> **Módulo:** Telemetria & Diagnóstico Proativo
>
> **Entidade:** `LeituraStringFV`
>
> **Volume:** ~96 × 4 = ~384 registros/dia/usina (4 strings × 15 min)

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `usina_id` | `int` | `int` | NOT NULL | FK → `usinas.id` | Usina de origem |
| `data_hora` | `datetime2` | `DateTime` | NOT NULL | — | Timestamp da leitura |
| `numero_string` | `int` | `int` | NOT NULL | — | Número da string FV (1 a 4) |
| `tensao_dc_v` | `decimal(10,2)` | `decimal` | NULL | — | Tensão DC (V). Campo `FV_DC_VOLTAGE_STR_X` |
| `potencia_dc_kw` | `decimal(18,4)` | `decimal` | NULL | — | Potência DC (kW). Campo `FV_DC_POWER_STR_X`. 0.0 indica ausência de geração |

---

## 18. Tabela: `contatos`

> **Módulo:** Comunicação e Gerência de Parcerias
>
> **Entidade:** `Contato`
>
> **Volume:** ~8 registros iniciais, crescimento de ~2-5/mês
>
> **Nota:** Tabela **global** — sem FK para `usinas`. Todos os usuários autenticados visualizam os mesmos contatos.

| Coluna | Tipo SQL | Tipo C# | Nullable | Constraint | Observação |
| --- | --- | --- | --- | --- | --- |
| `id` | `int` | `int` | NOT NULL | PK, Identity | Auto-incremento |
| `nome` | `nvarchar(255)` | `string` | NOT NULL | — | Nome do stakeholder |
| `funcao` | `nvarchar(255)` | `string` | NOT NULL | — | Função/papel (ex: "Fornecedor de Inversores") |
| `email` | `nvarchar(255)` | `string` | NOT NULL | — | E-mail de contato |
| `telefone` | `nvarchar(50)` | `string` | NOT NULL | — | Telefone de contato |
| `data_criacao` | `datetime2` | `DateTime` | NOT NULL | — | Data de cadastro do contato |

---

## 19. Enums do Domínio

### `PerfilUsuarioEnum` (Usuários)

> **Nota:** No banco, `perfil` é armazenado como `nvarchar(50)` com valor `'Cliente'` ou `'Admin'` (sem enum numérico). A validação ocorre no domínio via `SetPerfil(string perfil)`.

| Valor (string) | Descrição |
| --- | --- |
| `Cliente` | Perfil padrão. Acesso a dashboards e dados das usinas. Atribuído automaticamente no registro. |
| `Admin` | Perfil administrativo. Pode alterar perfil de outros usuários, bloquear/desbloquear contas. Somente outro Admin pode conceder este perfil. |

### `ClassificacaoHorarioEnum` (Gerenciamento de Energia)

| Valor | Nome | Descrição |
| --- | --- | --- |
| 0 | `ForaPonta` | Horário fora de ponta |
| 1 | `Ponta` | Horário de ponta (18h–21h) |
| 2 | `Reservado` | Horário reservado |

### `SeveridadeEnum` (Monitoramento & Geração)

| Valor | Nome | Descrição |
| --- | --- | --- |
| 0 | `Info` | Severidade informativa |
| 1 | `Medio` | Severidade média |
| 2 | `Alto` | Severidade alta / crítica |

### `StatusAlertaEnum` (Monitoramento & Geração)

| Valor | Nome | Descrição |
| --- | --- | --- |
| 0 | `Ativo` | Alerta ainda ativo |
| 1 | `Resolvido` | Alerta resolvido |

---

## 20. Índices

### Índices Compostos

| Tabela | Nome do Índice | Colunas | Tipo | Módulo | Justificativa |
| --- | --- | --- | --- | --- | --- |
| `registros_md50` | `IX_RegistroMD50_GalpaoId_DataHora` | `(galpao_id, data_hora)` | Non-unique | GE | Consultas de registros por galpão e dia (96 registros/dia) |
| `resumos_diarios_galpao` | `IX_ResumoDiarioGalpao_GalpaoId_Data` | `(galpao_id, data)` | Non-unique | GE | Consultas de resumos mensais por galpão |
| `faturas_mensais_condominio` | `IX_FaturaMensalCondominio_UsinaId_Mes` | `(usina_id, mes)` | Non-unique | GE | Consultas de fatura por usina e mês |
| `leituras_inversor` | `IX_LeituraInversor_UsinaId_DataHora` | `(usina_id, data_hora)` | Non-unique | GE | Curva de geração 24h e consolidação diária |
| `leituras_ambiental` | `IX_LeituraAmbiental_UsinaId_DataHora` | `(usina_id, data_hora)` | Non-unique | M&G | Última leitura ambiental por usina |
| `alertas_monitoramento` | `IX_AlertaMonitoramento_UsinaId_Status` | `(usina_id, status)` | Non-unique | M&G | Consulta de alertas ativos por usina |
| `tarifas_energia` | `IX_TarifaEnergia_UsinaId_DataVigenciaInicio` | `(usina_id, data_vigencia_inicio)` | Non-unique | GF | Consulta de tarifa vigente por usina e data |
| `leituras_telemetria` | `IX_LeituraTelemetria_UsinaId_DataHora` | `(usina_id, data_hora)` | Non-unique | TEL | Última leitura de telemetria por usina |
| `leituras_string_fv` | `IX_LeituraStringFV_UsinaId_NumeroString_DataHora` | `(usina_id, numero_string, data_hora)` | Non-unique | TEL | `MAX(data_hora) GROUP BY numero_string` |

### Índices Únicos (Constraints)

| Tabela | Coluna(s) | Nome do Índice | Tipo | Justificativa |
| --- | --- | --- | --- | --- |
| `usuarios` | `email` | `IX_Usuario_Email` | UNIQUE | E-mail de login deve ser único no sistema |
| `investimento_usinas` | `usina_id` | — | UNIQUE | Cada usina possui no máximo 1 investimento |

---

## 21. Volume de Dados Estimado

### Por Usina/Mês

| Tabela | Registros/Dia | Registros/Mês | Observação |
| --- | --- | --- | --- |
| `registros_md50` | 96 × 8 galpões = 768 | ~23.040 | Maior volume — tabela de alta frequência |
| `leituras_inversor` | ~96 | ~2.880 | A cada 15 min × N inversores |
| `leituras_ambiental` | ~96 | ~2.880 | A cada 15 min |
| `leituras_telemetria` | ~96 | ~2.880 | A cada 15 min (mesma chamada API) |
| `leituras_string_fv` | ~384 (4 strings × 96) | ~11.520 | 4 strings por leitura |
| `resumos_diarios_galpao` | 8 (1 por galpão) | ~240 | Consolidação diária |
| `geracoes_diarias` | 1 | ~30 | Consolidação diária |
| `alertas_monitoramento` | ~5 (variável) | ~150 | Depende da planta |
| `faturas_mensais_condominio` | — | 1 | Mensal |
| `itens_demonstrativo_fatura` | — | ~7 | Por fatura |
| `tarifas_energia` | — | ~0 | Atualizada apenas em reajustes |
| `investimento_usinas` | — | — | Registro único por usina |
| `usuarios` | — | ~5–10 (crescimento) | Cadastro sob demanda. Volume muito baixo. |
| `contatos` | — | ~2-5 (crescimento) | CRUD manual |

### Projeção Total (8 Usinas × 12 Meses)

| Tabela | Total/Ano (estimado) |
| --- | --- |
| `registros_md50` | ~276.480 |
| `leituras_inversor` | ~276.480 |
| `leituras_ambiental` | ~276.480 |
| `leituras_telemetria` | ~276.480 |
| `leituras_string_fv` | ~1.105.920 |
| `resumos_diarios_galpao` | ~23.040 |
| `geracoes_diarias` | ~2.920 |
| `alertas_monitoramento` | ~14.400 |
| `usuarios` | ~60–120 |
| Demais tabelas | < 1.000 |

> **Recomendações de performance:**
> - Particionamento por mês nas tabelas de leitura (`registros_md50`, `leituras_inversor`, `leituras_ambiental`, `leituras_telemetria`, `leituras_string_fv`)
> - Política de retenção: manter dados detalhados por 12 meses, depois consolidar em resumos diários
> - Todos os índices compostos definidos na seção 19 são essenciais para a performance das consultas
> - A tabela `leituras_string_fv` é a de maior volume absoluto (~1.1M registros/ano)

---

## 22. Ordem de Criação (Migrations)

As migrations devem ser criadas na seguinte ordem, respeitando as dependências entre módulos:

| # | Migration | Módulo | Tabelas Criadas / Alteradas | Pré-requisito |
| --- | --- | --- | --- | --- |
| 0 | `CriarTabelaUsuarios` | USU | `usuarios` (+ `AppDbContext`, `RepositorioBase<T>`, `Program.cs`, IoC base) | — (**⚠️ primeira migration do sistema**) |
| 1 | `CriarTabelasGerenciamentoEnergia` | GE | `usinas`, `galpoes`, `registros_md50`, `resumos_diarios_galpao`, `faturas_mensais_condominio`, `itens_demonstrativo_fatura`, `leituras_inversor` | Migration 0 |
| 2 | `AdicionarTabelasMonitoramentoECamposUsina` | M&G | `leituras_ambiental`, `geracoes_diarias`, `alertas_monitoramento` + ALTER `usinas` (add `potencia_instalada_kwp`, `potencia_instalada_descricao`, `data_instalacao`) | Migration 1 |
| 3 | `AdicionarGestaoFinanceira` | GF | `investimento_usinas`, `tarifas_energia` | Migration 1 |
| 4 | `AdicionarTabelasTelemetria` | TEL | `leituras_telemetria`, `leituras_string_fv` | Migration 1 |
| 5 | `AdicionarTabelaContatos` | COM | `contatos` | — (tabela independente) |

> **Nota:** A migration 0 (`CriarTabelaUsuarios`) é obrigatoriamente a primeira — cria o `AppDbContext`, `RepositorioBase<T>` e toda a infraestrutura base que as demais migrations reutilizam. As migrations 3, 4 e 5 são independentes entre si e podem ser criadas em qualquer ordem após suas respectivas pré-requisições. A migration 5 (`contatos`) não tem dependência de nenhuma outra migration.
