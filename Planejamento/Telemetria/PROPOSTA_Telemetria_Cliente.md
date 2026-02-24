# Proposta de Desenvolvimento — Módulo de Telemetria & Diagnóstico Proativo

**Projeto:** CEFE Energy Hub  
**Data:** 23/02/2026

---

## 📌 Sobre o Módulo

O Módulo de Telemetria & Diagnóstico Proativo transforma os dados brutos do equipamento **MAINS AGC 150 HÍBRIDO** em informações acionáveis para o gestor da usina. O sistema exibirá, em tempo real, os indicadores elétricos da rede (tensão trifásica, frequência, fator de potência, potências reativa e aparente), o estado operacional do equipamento (modo de operação, status do disjuntor, tensão da bateria), as leituras individuais das quatro strings fotovoltaicas e o histórico completo de alertas e falhas. Toda a coleta de dados é automática e aproveita integralmente a infraestrutura de monitoramento já instalada nos módulos anteriores, sem nenhuma chamada adicional ao sistema externo.

---

## 🔵 Fase 1 — Estruturação do Banco de Dados

**O que será feito:**  
Serão criadas duas novas estruturas de armazenamento específicas do módulo. A primeira guarda os dados elétricos do equipamento em cada ciclo de coleta: frequência da rede, tensões fase-fase (L1-L2, L2-L3, L3-L1), fator de potência, potências reativa e aparente, tensão da bateria e os estados operacionais (falta de energia, disjuntor, AMF, Peak Shaving). A segunda guarda as leituras individuais das quatro strings fotovoltaicas (tensão DC e potência DC por string). Também serão criados os mecanismos de indexação para garantir consultas rápidas mesmo com grande volume de dados históricos.

**Resultado esperado:**  
O banco de dados estará pronto para receber e armazenar os dados elétricos detalhados e as leituras das strings fotovoltaicas de cada usina, com estrutura otimizada para consultas em tempo real.

**Horas estimadas:** 13h (~1,5 dias)

---

## 🟢 Fase 2 — Regras de Classificação e Lógica do Sistema

**O que será feito:**  
Serão desenvolvidas as regras de classificação dos indicadores elétricos: faixas de normalidade para tensão (370–400 V), frequência (59,5–60,5 Hz) e temperatura da cabine (limites em 60°C e 70°C). Também será criada a lógica de agregação que combina, em uma única resposta, os dados elétricos, os dados ambientais (irradiação) e a temperatura do inversor. O cálculo automático da duração de alertas resolvidos (diferença entre data de resolução e data de ocorrência) também faz parte desta fase.

**Resultado esperado:**  
O sistema será capaz de classificar automaticamente cada indicador elétrico como Normal, Alerta ou Crítico, e preparar todos os dados de telemetria de forma agregada e pronta para exibição no frontend.

**Horas estimadas:** 5h (~0,5 dia)

---

## 🟡 Fase 3 — Extensão da Coleta Automática de Dados

**O que será feito:**  
O processo automático de coleta de leituras do inversor — já em funcionamento desde o Módulo de Monitoramento & Geração — será estendido para capturar e armazenar os dados de telemetria. A cada 15 minutos, além dos dados já coletados (potência ativa, energia gerada, temperatura da cabine), o processo passará a registrar: frequência da rede, as três tensões fase-fase, fator de potência, potências reativa e aparente, tensão da bateria, quatro flags de estado operacional e as leituras de tensão DC e potência DC de cada uma das quatro strings fotovoltaicas. Tudo isso é extraído da mesma resposta já recebida da API externa, sem nenhuma chamada adicional.

**Resultado esperado:**  
Os dados de telemetria estarão sendo coletados e armazenados automaticamente a cada 15 minutos, sem custo adicional de chamadas à API externa e sem impacto no processo de coleta já existente.

**Horas estimadas:** 5h (~0,5 dia)

---

## 🔴 Fase 4 — Serviços de Consulta (API)

**O que será feito:**  
Serão criados três serviços de consulta: (1) leitura em tempo real, que agrega em uma única resposta os dados elétricos atuais, os dados ambientais e a temperatura da cabine; (2) log de alertas e falhas com filtros por severidade, período e status, reutilizando os dados já coletados pelo módulo anterior; e (3) leituras individuais das quatro strings fotovoltaicas com o dado mais recente por string. Todos os serviços incluem controle de acesso por usuário autenticado e por unidade selecionada.

**Resultado esperado:**  
As telas do sistema poderão consultar todos os dados de telemetria de forma segura e organizada, prontos para exibição ao usuário.

**Horas estimadas:** 2,5h (~0,5 dia)

---

## 🟣 Fase 5 — Infraestrutura em Nuvem (Azure)

**O que será feito:**  
A estrutura das novas tabelas será aplicada no banco de dados de produção. O processo automático de coleta — já em execução no ambiente em nuvem — será atualizado com os novos mapeamentos de telemetria. Os logs de execução serão verificados para confirmar que os dados elétricos e das strings fotovoltaicas estão sendo registrados corretamente a cada ciclo.

**Resultado esperado:**  
O ambiente de produção estará atualizado com as novas tabelas e o processo de coleta estendido funcionando corretamente, com dados de telemetria chegando automaticamente a cada 15 minutos.

**Horas estimadas:** 3h (~0,5 dia)

---

## ⚪ Fase 6 — Telas do Sistema (Interface Visual)

**O que será feito:**  
Será desenvolvida a interface visual completa do módulo em Angular, substituindo o protótipo estático atual por dados reais. A tela terá: (1) quatro cartões de indicadores em tempo real — Tensão da Rede, Frequência, Irradiação Solar e Temperatura da Cabine — com badges coloridos por faixa de classificação; (2) painel de status operacional com indicadores visuais para falta de energia, disjuntor, modo AMF, tensão da bateria e modo Peak Shaving; (3) tabela das quatro strings fotovoltaicas com tensão DC, potência DC e status de geração por string; e (4) log de alertas e falhas com filtros por severidade, período e status, badge colorido por criticidade e duração calculada automaticamente. A interface será responsiva e funcionará em computador, tablet e celular, com tratamento de estados de carregamento e erro.

**Resultado esperado:**  
O gestor terá acesso a um painel completo de telemetria e diagnóstico com dados elétricos em tempo real, status operacional do equipamento, análise das strings fotovoltaicas e histórico de falhas — tudo atualizado automaticamente ao selecionar a unidade.

**Horas estimadas:** 14h (~1,75 dias)

---

## 📊 Resumo Total de Esforço

| Fase | Descrição | Horas | Dias Úteis |
|------|-----------|-------|------------|
| 🔵 Fase 1 | Estruturação do Banco de Dados | 13h | ~1,5 dias |
| 🟢 Fase 2 | Regras de Classificação e Lógica | 5h | ~0,5 dia |
| 🟡 Fase 3 | Extensão da Coleta Automática | 5h | ~0,5 dia |
| 🔴 Fase 4 | Serviços de Consulta (API) | 2,5h | ~0,5 dia |
| 🟣 Fase 5 | Infraestrutura em Nuvem | 3h | ~0,5 dia |
| ⚪ Fase 6 | Telas do Sistema (Interface Visual) | 14h | ~1,75 dias |
| **TOTAL** | | **42,5h** | **~5,5 dias úteis (~1 semana)** |

---

## 📋 Considerações

- Dias úteis calculados com base em jornada de **8 horas/dia**.
- Este módulo tem o **menor esforço de coleta** entre todos os módulos desenvolvidos, pois estende um processo já existente sem nenhuma chamada adicional à API Nortebox — todos os dados já chegam na resposta atual do processo de 15 minutos.
- O **log de alertas e falhas** reutiliza integralmente os dados coletados pelo Módulo de Monitoramento & Geração. Não há duplicação de infraestrutura, coleta ou armazenamento.
- A **Fase 5** (Infraestrutura) pode ser executada em paralelo com as Fases 1 a 3, sem impactar o prazo final.
- A **Fase 6** (Frontend) pode ser iniciada antes da conclusão do backend, utilizando dados simulados durante o desenvolvimento.
- Os indicadores de tensão e frequência dependem do equipamento estar comunicando. Se o inversor estiver offline, os campos retornarão `null` e a interface exibirá o estado "Sem dado disponível" — comportamento já previsto no design dos componentes.
