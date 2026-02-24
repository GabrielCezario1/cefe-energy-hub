# 🗓️ Linha do Tempo — CEFE Energy Hub

> **Início:** 02 de Março de 2026 (segunda-feira)
>
> **Previsão de entrega:** 21 de Maio de 2026 (quinta-feira)
>
> **Desenvolvedor:** 1 (jornada de 8h/dia, dias úteis)
>
> **Esforço total:** 427 horas → 56 dias úteis → ~12 semanas

---

## Resumo por Módulo

| # | Módulo | Horas | Dias úteis | Início | Entrega |
|---|--------|------:|----------:|--------|---------|
| 0 | 🔐 Usuários | 43.25h | 6 | 02/Mar | 09/Mar |
| 1 | ⚡ Gerenciamento de Energia | 169h | 22 | 10/Mar | 09/Abr |
| 2 | ☀️ Monitoramento & Geração | 118.75h | 15 | 10/Abr | 04/Mai |
| 3 | 💰 Gestão Financeira | 22h | 3 | 05/Mai | 07/Mai |
| 4 | 📡 Telemetria | 42.5h | 6 | 08/Mai | 15/Mai |
| 5 | 📇 Comunicação | 31.5h | 4 | 18/Mai | 21/Mai |
| | **TOTAL** | **427h** | **56** | **02/Mar** | **21/Mai** |

> ⚠️ **Feriados descontados:** Sexta-feira Santa (03/Abr), Tiradentes (21/Abr) e Dia do Trabalho (01/Mai).

---

## Visão Semanal

| Semana | Período | O que acontece |
|--------|---------|----------------|
| 1 | 02/Mar – 06/Mar | 🔐 Usuários — banco de dados, entidade, repositório, JWT |
| 2 | 09/Mar – 13/Mar | 🔐 Usuários (finaliza) · ⚡ Ger. Energia (inicia fundação) |
| 3 | 16/Mar – 20/Mar | ⚡ Ger. Energia — entidades, mapeamentos, migrations |
| 4 | 23/Mar – 27/Mar | ⚡ Ger. Energia — regras de negócio, jobs de coleta |
| 5 | 30/Mar – 03/Abr | ⚡ Ger. Energia — jobs MD50, ProjectSwitch, Enel |
| 6 | 06/Abr – 10/Abr | ⚡ Ger. Energia (finaliza) · ☀️ Monitoramento (inicia) |
| 7 | 13/Abr – 17/Abr | ☀️ Monitoramento — entidades, jobs, alertas |
| 8 | 20/Abr – 24/Abr | ☀️ Monitoramento — controllers, regras, cálculos |
| 9 | 27/Abr – 01/Mai | ☀️ Monitoramento — frontend (telas de geração e alertas) |
| 10 | 04/Mai – 08/Mai | ☀️ Monitoramento (finaliza) · 💰 Gestão Financeira (completo) · 📡 Telemetria (inicia) |
| 11 | 11/Mai – 15/Mai | 📡 Telemetria (finaliza) |
| 12 | 18/Mai – 21/Mai | 📇 Comunicação (completo) · ✅ **Entrega final** |

---

## O que cada módulo entrega

### 🔐 Usuários — Semanas 1–2
> **Toda a base do sistema.** Sem esse módulo nada mais funciona.

- Login e cadastro de usuários
- Dois perfis de acesso: Admin e Cliente
- Confirmação de e-mail e recuperação de senha
- Infraestrutura base reutilizada por todos os módulos seguintes

### ⚡ Gerenciamento de Energia — Semanas 2–6
> **Módulo mais extenso.** Envolve 3 integrações externas com coleta automática de dados.

- Consumo dos galpões a cada 15 minutos (medidor MD50)
- Geração solar por inversor (API ProjectSwitch)
- Faturas da concessionária (Enel)
- Dashboard com gráficos diários e mensais, KPIs de consumo
- Demonstrativo detalhado de fatura

### ☀️ Monitoramento & Geração — Semanas 6–10
> **Módulo analítico.** Transforma dados brutos em indicadores de performance.

- Performance Ratio e Horas de Sol Pleno
- Painel de alertas vindos da usina (severidade, status)
- Geração diária consolidada com gráficos
- Dados ambientais (irradiação, temperatura)

### 💰 Gestão Financeira — Semana 10
> **Módulo enxuto.** Cadastro manual + cálculos automáticos.

- Retorno sobre investimento (ROI) e payback
- Economia acumulada mensal
- Cadastro de tarifas com vigência automática

### 📡 Telemetria — Semanas 10–11
> **Módulo de diagnóstico.** Dados da rede elétrica e strings fotovoltaicas.

- Tensão, frequência e fator de potência da rede
- Monitoramento de baterias
- Potência individual de cada string FV
- Detecção de faltas de energia

### 📇 Comunicação — Semana 12
> **Módulo simples.** CRUD de contatos e parceiros.

- Agenda de contatos do projeto
- Cadastro, edição e exclusão
- Busca e listagem

---

## Distribuição de Esforço por Tipo de Atividade

| Fase | O que é | Horas | % |
|------|---------|------:|--:|
| Fundação (banco + entidades) | Criar tabelas, campos, relacionamentos | 87h | 20% |
| Regras de Negócio | Lógica do sistema, validações, cálculos | 50.25h | 12% |
| Jobs / Serviços | Coleta automática de dados, JWT, e-mail | 89.5h | 21% |
| API (endpoints) | Portas de acesso para o frontend | 24.5h | 6% |
| Infraestrutura | Servidor, banco, hospedagem | 29.5h | 7% |
| Frontend (telas) | Interface visual do usuário | 146.25h | 34% |
| **Total** | | **427h** | **100%** |

---

## Marcos de Entrega

| Data | Marco |
|------|-------|
| **09/Mar** | ✅ Sistema de login funcionando. Base do projeto criada. |
| **09/Abr** | ✅ Dashboard de energia completo com dados reais dos galpões. |
| **04/Mai** | ✅ Painel de monitoramento solar e alertas operacional. |
| **07/Mai** | ✅ Módulo financeiro com ROI e economia calculados. |
| **15/Mai** | ✅ Telemetria da rede elétrica e strings FV funcionando. |
| **21/Mai** | 🏁 **Entrega final.** Todos os módulos operacionais. |

---

## Considerações

- **Jornada:** 8 horas/dia, segunda a sexta.
- **Feriados:** 3 feriados nacionais no período (03/Abr, 21/Abr, 01/Mai) já estão descontados.
- **Sem buffer:** As datas acima não incluem margem para imprevistos. Recomenda-se reservar **1 semana adicional** (até 29/Mai) para testes finais e ajustes.
- **Sequência obrigatória:** Usuários → Ger. Energia → Monitoramento (dependem uns dos outros). Os 3 últimos módulos são independentes entre si.
- **Homologação:** Ideal que o cliente valide cada módulo conforme entregue, sem acumular para o final.
