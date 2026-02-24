# Proposta de Desenvolvimento — Módulo de Comunicação e Gerência de Parcerias

**Projeto:** CEFE Energy Hub  
**Data:** 24/02/2026

---

## 📌 Sobre o Módulo

O Módulo de Comunicação e Gerência de Parcerias permite centralizar todas as informações de contato dos parceiros e fornecedores do CEFE Energy Hub em um único painel. O sistema possibilita cadastrar novos contatos, editar informações existentes e remover parceiros que não fazem mais parte do ecossistema — tudo de forma organizada e acessível para toda a equipe autorizada.

---

## 🔵 Fase 1 — Estruturação do Banco de Dados

**O que será feito:**  
Será criada toda a estrutura de armazenamento para os dados de contato dos parceiros e fornecedores. Isso inclui a definição dos campos necessários (nome, função, e-mail, telefone) e as regras para garantir que nenhuma informação obrigatória fique em branco.

**Resultado esperado:**  
O banco de dados estará pronto para receber e armazenar todos os contatos de parceiros do sistema, com as validações necessárias para garantir a qualidade dos dados.

**Horas estimadas:** 5,75h (~0,75 dia)

---

## 🟢 Fase 2 — Regras e Lógica do Sistema

**O que será feito:**  
Serão desenvolvidas as regras de funcionamento do cadastro de contatos: criação de novos registros com validação de campos obrigatórios, edição de informações existentes (permitindo alterar apenas os campos desejados), remoção de contatos e consulta com possibilidade de busca por nome ou função.

**Resultado esperado:**  
O sistema será capaz de gerenciar completamente os contatos — cadastrar, consultar, editar e remover — com todas as validações necessárias para garantir que os dados estejam corretos.

**Horas estimadas:** 5,75h (~0,75 dia)

---

## 🟡 Fase 3 — Coleta Automática de Dados

**O que será feito:**  
Esta fase não se aplica a este módulo. Os dados de contato são inseridos manualmente pelos usuários do sistema — não há processos automáticos de coleta.

**Resultado esperado:**  
Não aplicável.

**Horas estimadas:** 0h

---

## 🔴 Fase 4 — Serviços de Consulta (API)

**O que será feito:**  
Serão criados os serviços que permitem que as telas do sistema interajam com o banco de dados de contatos. São 5 operações: listar todos os contatos (com busca e paginação), consultar um contato específico, cadastrar um novo contato, editar informações de um contato existente e remover um contato. Todas as operações incluem controle de acesso para garantir que apenas usuários autorizados possam realizar alterações.

**Resultado esperado:**  
As telas do sistema poderão realizar todas as operações de gerenciamento de contatos de forma segura e organizada.

**Horas estimadas:** 3h (~0,5 dia)

---

## 🟣 Fase 5 — Infraestrutura em Nuvem (Azure)

**O que será feito:**  
Será aplicada a atualização do banco de dados no ambiente de produção para incluir a nova estrutura de contatos. Opcionalmente, os 8 contatos iniciais dos parceiros atuais serão pré-cadastrados no sistema.

**Resultado esperado:**  
O ambiente de produção estará atualizado e pronto para uso, com a estrutura de contatos disponível e os parceiros iniciais já cadastrados.

**Horas estimadas:** 1h (~0,125 dia)

---

## ⚪ Fase 6 — Telas do Sistema (Interface Visual)

**O que será feito:**  
Será desenvolvida toda a interface visual do módulo: painel principal com cartões organizados em grade para cada parceiro (exibindo nome, função, e-mail e telefone), botão para adicionar novo contato, formulário de cadastro e edição em janela modal, botões de edição e remoção em cada cartão, e confirmação antes de remover um contato. A interface será responsiva — funcionando em computador (3 colunas), tablet (2 colunas) e celular (1 coluna) — com mensagens de sucesso e erro para cada ação realizada.

**Resultado esperado:**  
O usuário terá acesso a um painel visual completo para gerenciar todos os contatos de parceiros e fornecedores — podendo cadastrar, editar e remover contatos de forma intuitiva, acessível de qualquer dispositivo.

**Horas estimadas:** 16h (~2 dias)

---

## 📊 Resumo Total de Esforço

| Fase | Descrição | Horas | Dias Úteis |
|------|-----------|-------|------------|
| 🔵 Fase 1 | Estruturação do Banco de Dados | 5,75h | ~0,75 dia |
| 🟢 Fase 2 | Regras e Lógica do Sistema | 5,75h | ~0,75 dia |
| 🟡 Fase 3 | Coleta Automática de Dados | 0h | — |
| 🔴 Fase 4 | Serviços de Consulta (API) | 3h | ~0,5 dia |
| 🟣 Fase 5 | Infraestrutura em Nuvem | 1h | ~0,125 dia |
| ⚪ Fase 6 | Telas do Sistema (Interface Visual) | 16h | ~2 dias |
| **TOTAL** | | **31,5h** | **~4 dias úteis (~1 semana)** |

---

## 📋 Considerações

- Dias úteis calculados com base em jornada de **8 horas/dia**.
- A **Fase 5** (Infraestrutura em Nuvem) pode ser executada em paralelo com as Fases 1 e 2, sem impactar o prazo final.
- A **Fase 6** (Telas do Sistema) pode ser iniciada antes da conclusão da API, utilizando dados simulados durante o desenvolvimento.
- Este é um módulo de **baixo risco** — não depende de sistemas externos ou processos automáticos de coleta de dados. Toda a informação é inserida e gerenciada manualmente pelos usuários.
- O módulo é significativamente mais simples que os módulos de Monitoramento e Telemetria, resultando em um prazo de entrega curto (aproximadamente 1 semana).
- Após a conclusão do desenvolvimento, é recomendável um período de **homologação e testes** com a equipe para validar o fluxo de cadastro, edição e remoção de contatos.
