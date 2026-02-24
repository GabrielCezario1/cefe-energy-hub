# Proposta de Desenvolvimento — Módulo de Gerenciamento de Energia

**Projeto:** CEFE Energy Hub  
**Data:** 23/02/2026

---

## 📌 Sobre o Módulo

O Módulo de Gerenciamento de Energia permite acompanhar e gerenciar o consumo energético do condomínio logístico TH01. O sistema coleta automaticamente os dados dos medidores de cada galpão e do inversor solar, processa a fatura da concessionária e exibe tudo em um painel visual com indicadores de consumo, gráficos detalhados e tabelas de medições a cada 15 minutos. Além disso, calcula automaticamente o autoconsumo solar, gera faturas individuais por galpão e distribui os custos de forma proporcional.

---

## 🔵 Fase 1 — Estruturação do Banco de Dados

**O que será feito:**  
Toda a base de armazenamento de informações do módulo será criada. Isso inclui a estrutura para guardar os dados de cada galpão, as leituras dos medidores de consumo (a cada 15 minutos), os resumos diários, a fatura mensal da concessionária com seu demonstrativo detalhado e as leituras do inversor solar. Também serão criados mecanismos de otimização para garantir consultas rápidas mesmo com o grande volume de dados — são aproximadamente 23.000 registros de medição por mês para os 8 galpões.

**Resultado esperado:**  
O banco de dados estará pronto para receber e armazenar todas as informações do módulo — leituras dos medidores de cada galpão, dados de geração solar, faturas da concessionária e resumos consolidados.

**Horas estimadas:** 37h (~4,5 dias)

---

## 🟢 Fase 2 — Regras de Cálculo e Lógica do Sistema

**O que será feito:**  
Serão desenvolvidas todas as regras de cálculo do módulo: consumo total do condomínio (solar + concessionária), consumo diário de cada galpão separado por horário de ponta e fora de ponta, demanda máxima, fator de potência médio, custo estimado diário, cálculo do autoconsumo solar (geração menos energia injetada na rede) e rateio do consumo da área comum entre os galpões. Também será implementada a regra de alerta para fator de potência abaixo do limite regulatório.

**Resultado esperado:**  
O sistema será capaz de calcular e consolidar todos os indicadores de consumo energético, prontos para serem exibidos nas telas e utilizados na geração automática de faturas.

**Horas estimadas:** 13,5h (~2 dias)

---

## 🟡 Fase 3 — Coleta Automática de Dados

**O que será feito:**  
Serão desenvolvidos 5 processos automáticos que rodam continuamente sem intervenção humana: coleta das leituras dos medidores Embrasul MD50 de cada galpão (a cada 15 minutos — 96 registros por galpão/dia), coleta dos dados do inversor solar via sistema de monitoramento externo (a cada 15 minutos), processamento mensal da fatura da concessionária Enel com cálculo automático do autoconsumo solar, consolidação dos resumos diários de consumo por galpão (diariamente à meia-noite) e geração automática de faturas individuais por galpão com envio por e-mail. Também será criado o componente de comunicação com os medidores físicos.

**Resultado esperado:**  
O sistema estará coletando dados automaticamente dos medidores e do inversor solar, processando faturas, consolidando resumos diários e gerando faturas individuais por galpão — tudo sem necessidade de ação manual.

**Horas estimadas:** 43h (~5,5 dias)

---

## 🔴 Fase 4 — Serviços de Consulta (API)

**O que será feito:**  
Serão criados os serviços que fornecem os dados para as telas do sistema. São 6 consultas: lista de meses disponíveis, resumo do condomínio com indicadores de consumo (solar, concessionária, total e demanda contratada), lista de galpões com consumo mensal, dados mensais consolidados de cada galpão, resumos diários com consumo ponta/fora ponta e alertas de fator de potência, e registros detalhados de medição a cada 15 minutos. Todos os serviços incluem controle de acesso por unidade.

**Resultado esperado:**  
As telas do sistema poderão consultar todos os dados necessários de forma segura e organizada, prontos para serem exibidos ao usuário.

**Horas estimadas:** 6h (~1 dia)

---

## 🟣 Fase 5 — Infraestrutura em Nuvem (Azure)

**O que será feito:**  
Serão configurados os serviços na nuvem necessários para o funcionamento em produção: banco de dados, servidor da aplicação e os 5 processos automáticos de coleta e consolidação. Também será feita a publicação da estrutura do banco de dados no ambiente de produção com todos os mecanismos de otimização.

**Resultado esperado:**  
O ambiente de produção estará configurado e pronto para receber a publicação do sistema, com todos os processos automáticos programados e monitorados.

**Horas estimadas:** 11h (~1,5 dias)

---

## ⚪ Fase 6 — Telas do Sistema (Interface Visual)

**O que será feito:**  
Será desenvolvida toda a interface visual do módulo, composta por duas telas principais. A primeira tela apresenta a **visão geral do condomínio**: seletor de mês, 4 cartões de indicadores (consumo solar, consumo da concessionária, consumo total e demanda contratada) e um painel com os 8 galpões exibindo o consumo mensal de cada um. A segunda tela apresenta o **detalhe de cada galpão**: cartões de indicadores (consumo acumulado e demanda contratada), gráfico de consumo diário a cada 15 minutos separado por ponta e fora de ponta, gráfico de consumo acumulado ao longo do mês, tabela de resumos diários com alerta visual para fator de potência baixo e tabela de registros detalhados do medidor com 96 linhas por dia. A interface será responsiva, funcionando em computador, tablet e celular, com tratamento de erros e estados de carregamento.

**Resultado esperado:**  
O usuário terá acesso a um painel visual completo para gerenciar o consumo energético do condomínio — com indicadores consolidados, gráficos de consumo, tabelas detalhadas e alertas visuais — acessível de qualquer dispositivo.

**Horas estimadas:** 58,5h (~7,5 dias)

---

## 📊 Resumo Total de Esforço

| Fase | Descrição | Horas | Dias Úteis |
|------|-----------|-------|------------|
| 🔵 Fase 1 | Estruturação do Banco de Dados | 37h | ~4,5 dias |
| 🟢 Fase 2 | Regras de Cálculo e Lógica | 13,5h | ~2 dias |
| 🟡 Fase 3 | Coleta Automática de Dados | 43h | ~5,5 dias |
| 🔴 Fase 4 | Serviços de Consulta (API) | 6h | ~1 dia |
| 🟣 Fase 5 | Infraestrutura em Nuvem | 11h | ~1,5 dias |
| ⚪ Fase 6 | Telas do Sistema (Interface Visual) | 58,5h | ~7,5 dias |
| **TOTAL** | | **169h** | **~21 dias úteis (~4 semanas)** |

---

## 📋 Considerações

- Dias úteis calculados com base em jornada de **8 horas/dia**.
- A **Fase 5** (Infraestrutura em Nuvem) pode ser executada em paralelo com as Fases 1 a 3, sem impactar o prazo final.
- A **Fase 6** (Telas do Sistema) pode ser iniciada antes da conclusão dos serviços de consulta, utilizando dados simulados durante o desenvolvimento.
- Componentes compartilhados com o módulo de Monitoramento & Geração (autenticação, seleção de unidade, configuração de acesso) podem já estar prontos se aquele módulo foi implementado primeiro, reduzindo o esforço total.
- A atividade de **maior risco** é a Fase 3 (Coleta Automática de Dados), pois depende da comunicação com os medidores físicos Embrasul MD50 (hardware instalado em cada galpão) e da estabilidade do sistema externo de monitoramento solar (ProjectSwitch/Nortebox). O processamento da fatura da concessionária é o processo mais complexo, combinando dados externos com o cálculo automático de autoconsumo solar.
- As **dependências externas** principais são: os medidores Embrasul MD50 (fonte de dados de consumo por galpão) e o sistema ProjectSwitch/Nortebox (fonte de dados do inversor solar). Indisponibilidade de qualquer um impacta a coleta de dados.
- A **regra de negócio crítica** do módulo é o rateio de consumo: tudo que não foi consumido individualmente pelos galpões é automaticamente atribuído à área comum do condomínio, sem fórmula de perdas técnicas.
- Após a conclusão do desenvolvimento, é recomendável um período de **homologação e testes integrados** com o ambiente real de coleta de dados, incluindo validação dos cálculos com uma fatura real da concessionária.
