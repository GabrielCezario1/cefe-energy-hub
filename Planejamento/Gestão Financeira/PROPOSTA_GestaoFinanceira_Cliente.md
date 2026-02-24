# Proposta de Desenvolvimento — Módulo de Gestão Financeira

**Projeto:** CEFE Energy Hub  
**Data:** 23/02/2026

---

## 📌 Sobre o Módulo

O Módulo de Gestão Financeira & Econômica transforma os dados de geração de energia solar em informação financeira clara e prática. O sistema calcula automaticamente quanto a usina está economizando por mês, quanto já foi recuperado do investimento inicial e em quanto tempo o investimento será quitado — tudo com base nos dados de geração já coletados pelos módulos anteriores e na tarifa de energia informada pelo administrador. O resultado é exibido em um painel visual com indicadores financeiros, gráficos de rentabilidade e projeção de payback.

---

## 🔵 Fase 1 — Estruturação do Banco de Dados

**O que será feito:**  
Serão criadas as estruturas de armazenamento para os dados financeiros do módulo. Isso inclui a tabela para registrar o valor do investimento inicial da usina e a tabela para armazenar o histórico de tarifas de energia com controle de vigência — permitindo que reajustes futuros sejam registrados sem perder o histórico anterior. Ambas as estruturas se integram às tabelas já existentes dos módulos anteriores.

**Resultado esperado:**  
O banco de dados estará pronto para receber e armazenar o investimento da usina e o histórico completo de tarifas de energia com datas de vigência.

**Horas estimadas:** 4h (~0,5 dia)

---

## 🟢 Fase 2 — Regras de Cálculo e Lógica do Sistema

**O que será feito:**  
Serão desenvolvidas todas as regras de cálculo financeiro do módulo: economia mensal (energia gerada no mês multiplicada pela tarifa vigente no período), economia acumulada desde a instalação da usina, comparativo percentual com o mês anterior, payback total estimado (investimento dividido pela média de economia mensal), payback restante em meses e retorno sobre o investimento anual (ROI). Também será implementada a regra de vigência de tarifas: ao cadastrar uma nova tarifa, o sistema encerra automaticamente a anterior, mantendo o histórico para cálculos retroativos com a tarifa correta de cada período.

**Resultado esperado:**  
O sistema será capaz de calcular todos os indicadores financeiros da usina, aplicando a tarifa histórica correta para cada mês e gerando os pontos de projeção do gráfico de payback.

**Horas estimadas:** 6h (~1 dia)

---

## 🟡 Fase 3 — Coleta Automática de Dados

**O que será feito:**  
♻️ **Nenhum processo novo necessário.** Os dados de geração de energia (kWh por dia) já são coletados automaticamente pelos processos implementados no Módulo de Monitoramento & Geração. O módulo financeiro reutiliza esses dados diretamente, sem precisar de novos coletores ou integrações com sistemas externos.

**Resultado esperado:**  
O módulo consumirá os dados de geração já disponíveis no banco de dados, sem custo adicional de desenvolvimento de coleta.

**Horas estimadas:** 0h (♻️ reutilização do Módulo de Monitoramento & Geração)

---

## 🔴 Fase 4 — Serviços de Consulta (API)

**O que será feito:**  
Serão criados os serviços que fornecem os dados financeiros calculados para as telas do sistema. São 8 serviços: indicadores financeiros principais (KPIs), rentabilidade mensal com dados de economia em R$ para cada mês, projeção de payback com os pontos do gráfico, painel com dados do investimento e tarifa vigente, e 4 serviços de cadastro e edição de tarifa e investimento. Todos os serviços incluem controle de acesso por autenticação.

**Resultado esperado:**  
As telas do sistema poderão consultar todos os dados financeiros calculados e o administrador poderá cadastrar e editar a tarifa de energia e o valor do investimento diretamente pelo painel.

**Horas estimadas:** 3h (~0,5 dia)

---

## 🟣 Fase 5 — Infraestrutura em Nuvem (Azure)

**O que será feito:**  
Serão aplicadas as configurações mínimas de infraestrutura necessárias para suportar o módulo: publicação das novas tabelas do banco de dados no ambiente de produção, verificação das permissões de acesso e validação de todos os serviços em ambiente de homologação antes da publicação final. Nenhum novo serviço em nuvem é necessário, pois o módulo reutiliza a infraestrutura já provisionada nos módulos anteriores.

**Resultado esperado:**  
O ambiente de produção estará atualizado com as novas estruturas de dados e os serviços validados, prontos para uso.

**Horas estimadas:** 1h (~0,5 dia)

---

## ⚪ Fase 6 — Telas do Sistema (Interface Visual)

**O que será feito:**  
Será desenvolvida toda a interface visual do módulo financeiro. A tela apresentará: três cartões de indicadores financeiros (economia acumulada desde a instalação, economia do mês com comparativo percentual e estimativa de payback restante), gráfico de barras com a rentabilidade mensal em R$ mês a mês, gráfico de linhas com a projeção de payback mostrando o cruzamento entre o valor investido e o valor recuperado, e um painel com os dados do investimento (valor total, tarifa vigente e ROI anual) com botões para cadastrar ou editar cada informação diretamente na tela. Quando os dados financeiros ainda não foram configurados, um aviso orientará o administrador a cadastrá-los. A interface atualiza automaticamente ao trocar de unidade no seletor.

**Resultado esperado:**  
O usuário terá acesso a um painel visual completo para acompanhar o retorno financeiro da usina solar — com indicadores de economia, gráficos de rentabilidade e projeção de payback — e o administrador poderá configurar tarifa e investimento sem necessidade de suporte técnico.

**Horas estimadas:** 8h (~1 dia)

---

## 📊 Resumo Total de Esforço

| Fase | Descrição | Horas | Dias Úteis |
|------|-----------|-------|------------|
| 🔵 Fase 1 | Estruturação do Banco de Dados | 4h | ~0,5 dia |
| 🟢 Fase 2 | Regras de Cálculo e Lógica | 6h | ~1 dia |
| 🟡 Fase 3 | Coleta Automática de Dados | 0h | ♻️ Reutilizado |
| 🔴 Fase 4 | Serviços de Consulta (API) | 3h | ~0,5 dia |
| 🟣 Fase 5 | Infraestrutura em Nuvem | 1h | ~0,5 dia |
| ⚪ Fase 6 | Telas do Sistema (Interface Visual) | 8h | ~1 dia |
| **TOTAL** | | **22h** | **~3,5 dias úteis (~1 semana)** |

---

## 📋 Considerações

- Dias úteis calculados com base em jornada de **8 horas/dia**.
- A **Fase 5** (Infraestrutura em Nuvem) pode ser executada em paralelo com as Fases 1 e 2, sem impactar o prazo final.
- A **Fase 6** (Telas do Sistema) pode ser iniciada antes da conclusão da API, utilizando dados simulados durante o desenvolvimento — o protótipo React com dados hardcoded já existe e serve como referência visual.
- A **Fase 3** não possui custo de desenvolvimento neste módulo: os dados de geração são 100% reutilizados do Módulo de Monitoramento & Geração, que deve estar implementado antes deste módulo.
- Os dados de **tarifa de energia** e **valor do investimento** são informados manualmente pelo administrador. O sistema não consulta automaticamente tarifas de concessionárias — qualquer reajuste deve ser cadastrado manualmente no painel.
- A atividade de **maior risco** é a regra de vigência histórica de tarifas: o sistema precisa aplicar a tarifa correta para cada mês passado, o que requer testes com cenários de múltiplos reajustes ao longo do tempo.
- Após a conclusão do desenvolvimento, é recomendável um período de **homologação e validação dos cálculos** com dados reais de geração e uma tarifa conhecida, comparando o resultado com o cálculo manual.
