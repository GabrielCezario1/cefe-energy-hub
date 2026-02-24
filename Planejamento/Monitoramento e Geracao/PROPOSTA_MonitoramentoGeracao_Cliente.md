# Proposta de Desenvolvimento — Módulo de Monitoramento & Geração

**Projeto:** CEFE Energy Hub  
**Data:** 23/02/2026

---

## 📌 Sobre o Módulo

O Módulo de Monitoramento & Geração permite acompanhar, em tempo real, o desempenho das usinas solares do CEFE Energy Hub. O sistema coleta automaticamente os dados dos inversores e sensores ambientais, calcula indicadores de performance e exibe tudo em um painel visual com gráficos, alertas e informações técnicas. Quando um equipamento apresenta problema, o sistema identifica e notifica automaticamente.

---

## 🔵 Fase 1 — Estruturação do Banco de Dados

**O que será feito:**  
Toda a base de armazenamento de informações do módulo será criada. Isso inclui a estrutura para guardar os dados de cada usina, as leituras dos inversores e sensores ambientais, os resumos diários de geração e os alertas de equipamentos. Também serão criados mecanismos de otimização para garantir consultas rápidas mesmo com grande volume de dados.

**Resultado esperado:**  
O banco de dados estará pronto para receber e armazenar todas as informações do módulo — leituras de equipamentos, alertas, dados ambientais e resumos de geração.

**Horas estimadas:** 20,5h (~2,5 dias)

---

## 🟢 Fase 2 — Regras de Cálculo e Lógica do Sistema

**O que será feito:**  
Serão desenvolvidas todas as regras de cálculo do módulo: geração atual em kW, geração acumulada do dia, variação comparativa com o dia anterior, índice de performance (Performance Ratio), classificação do desempenho da usina (Ótimo, Bom, Baixo) e detecção automática do status do sistema com base nos alertas ativos.

**Resultado esperado:**  
O sistema será capaz de calcular e classificar todos os indicadores de desempenho das usinas, prontos para serem exibidos nas telas e consultados pela API.

**Horas estimadas:** 12h (~1,5 dias)

---

## 🟡 Fase 3 — Coleta Automática de Dados

**O que será feito:**  
Serão desenvolvidos 5 processos automáticos que rodam continuamente sem intervenção humana: coleta das leituras dos inversores (a cada 15 minutos), coleta de dados ambientais como irradiação solar e temperatura (a cada 15 minutos), monitoramento de alertas de equipamentos (a cada 5 minutos), sincronização do histórico de alertas (diariamente) e consolidação dos resumos diários de geração (diariamente). Também será criado o componente de comunicação com o sistema externo de monitoramento (ProjectSwitch/Nortebox).

**Resultado esperado:**  
O sistema estará coletando dados automaticamente das usinas, identificando alertas de equipamentos em tempo real e consolidando resumos diários — tudo sem necessidade de ação manual.

**Horas estimadas:** 36h (~4,5 dias)

---

## 🔴 Fase 4 — Serviços de Consulta (API)

**O que será feito:**  
Serão criados os serviços que fornecem os dados para as telas do sistema. São 5 consultas: resumo geral da usina (indicadores e KPIs), curva de geração das últimas 24 horas, lista de alertas com filtros, informações técnicas da usina e dados ambientais atuais. Todos os serviços incluem controle de acesso por usina.

**Resultado esperado:**  
As telas do sistema poderão consultar todos os dados necessários de forma segura e organizada, prontos para serem exibidos ao usuário.

**Horas estimadas:** 6h (~1 dia)

---

## 🟣 Fase 5 — Infraestrutura em Nuvem (Azure)

**O que será feito:**  
Serão configurados os serviços na nuvem necessários para o funcionamento em produção: banco de dados, servidor da aplicação e os 5 processos automáticos de coleta. Também será feita a publicação da estrutura do banco de dados no ambiente de produção.

**Resultado esperado:**  
O ambiente de produção estará configurado e pronto para receber a publicação do sistema, com todos os processos automáticos programados e monitorados.

**Horas estimadas:** 11h (~1,5 dias)

---

## ⚪ Fase 6 — Telas do Sistema (Interface Visual)

**O que será feito:**  
Será desenvolvida toda a interface visual do módulo: tela principal (dashboard) com cartões de indicadores (geração atual, geração diária, performance e status), gráfico da curva de geração em tempo real, painel de alertas com indicação visual de severidade (crítico, médio, informativo) e seção de informações técnicas da usina com dados ambientais. A interface será responsiva, funcionando em computador, tablet e celular, com tratamento de erros e estados de carregamento.

**Resultado esperado:**  
O usuário terá acesso a um painel visual completo para monitorar suas usinas em tempo real — com indicadores, gráficos, alertas e informações técnicas — acessível de qualquer dispositivo.

**Horas estimadas:** 33,25h (~4 dias)

---

## 📊 Resumo Total de Esforço

| Fase | Descrição | Horas | Dias Úteis |
|------|-----------|-------|------------|
| 🔵 Fase 1 | Estruturação do Banco de Dados | 20,5h | ~2,5 dias |
| 🟢 Fase 2 | Regras de Cálculo e Lógica | 12h | ~1,5 dias |
| 🟡 Fase 3 | Coleta Automática de Dados | 36h | ~4,5 dias |
| 🔴 Fase 4 | Serviços de Consulta (API) | 6h | ~1 dia |
| 🟣 Fase 5 | Infraestrutura em Nuvem | 11h | ~1,5 dias |
| ⚪ Fase 6 | Telas do Sistema (Interface Visual) | 33,25h | ~4 dias |
| **TOTAL** | | **118,75h** | **~15 dias úteis (~3 semanas)** |

---

## 📋 Considerações

- Dias úteis calculados com base em jornada de **8 horas/dia**.
- A **Fase 5** (Infraestrutura em Nuvem) pode ser executada em paralelo com as Fases 1 a 3, sem impactar o prazo final.
- A **Fase 6** (Telas do Sistema) pode ser iniciada antes da conclusão da API, utilizando dados simulados durante o desenvolvimento.
- A atividade de **maior risco** é a Fase 3 (Coleta Automática de Dados), pois depende da estabilidade e disponibilidade do sistema externo de monitoramento (ProjectSwitch/Nortebox). O processo de alertas é o mais complexo, envolvendo identificação de duplicidades e resolução automática.
- A **dependência externa** principal é o sistema ProjectSwitch (Nortebox), que é a única fonte de dados para leituras de equipamentos e alertas. Indisponibilidade desse sistema impacta diretamente o módulo.
- Após a conclusão do desenvolvimento, é recomendável um período de **homologação e testes integrados** com o ambiente real de coleta de dados.
