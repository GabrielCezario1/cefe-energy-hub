# Proposta de Desenvolvimento — Módulo de Usuários

**Projeto:** CEFE Energy Hub  
**Data:** 23/02/2026

---

## 📌 Sobre o Módulo

O Módulo de Usuários é a base de todo o sistema CEFE Energy Hub. Ele permite que cada pessoa tenha sua própria conta, faça login com segurança, recupere a senha caso esqueça e gerencie suas informações pessoais. Também controla quem pode acessar o quê — diferenciando usuários comuns de administradores. Todos os demais módulos do sistema dependem deste para funcionar.

---

## 🔵 Fase 1 — Estruturação do Banco de Dados

**O que será feito:**  
Toda a base de armazenamento de informações dos usuários será criada. Isso inclui a estrutura para guardar nome, e-mail, senha (armazenada de forma segura e criptografada), tipo de perfil, telefone e foto. Também será criada a infraestrutura técnica inicial que servirá como alicerce para todos os módulos futuros do sistema.

**Resultado esperado:**  
O banco de dados estará pronto para armazenar os cadastros de todos os usuários do sistema, com segurança e organização.

**Horas estimadas:** 6,75h (~1 dia)

---

## 🟢 Fase 2 — Regras de Acesso e Lógica do Sistema

**O que será feito:**  
Serão desenvolvidas todas as regras que controlam o funcionamento do sistema de usuários: validação de cadastro (e-mail não pode ser duplicado), verificação de credenciais no login, bloqueio de acesso para contas não confirmadas ou bloqueadas, regras de alteração de perfil (apenas administradores podem alterar o tipo de acesso de outros usuários) e regras de segurança para troca de senha.

**Resultado esperado:**  
O sistema terá todas as regras de segurança e validação implementadas — garantindo que apenas usuários autorizados acessem o sistema e que cada ação siga as regras de negócio definidas.

**Horas estimadas:** 8h (~1 dia)

---

## 🟡 Fase 3 — Serviços de Segurança e Comunicação

**O que será feito:**  
Serão desenvolvidos os serviços que garantem a segurança das sessões dos usuários e a comunicação por e-mail. O primeiro serviço gera credenciais temporárias seguras que identificam o usuário durante sua sessão (com validade de 8 horas). O segundo serviço envia e-mails automáticos para confirmação de conta e recuperação de senha — com links seguros e temporários. Também será feita toda a configuração inicial do servidor da aplicação.

**Resultado esperado:**  
O sistema estará pronto para autenticar usuários com segurança, enviar e-mails automáticos de confirmação e recuperação de senha, e manter as sessões protegidas.

**Horas estimadas:** 5,5h (~0,75 dia)

---

## 🔴 Fase 4 — Serviços de Acesso (API)

**O que será feito:**  
Serão criados os serviços que permitem a comunicação entre as telas do sistema e o servidor. São 9 serviços divididos em dois grupos: **autenticação** (cadastro, login, confirmação de e-mail, esqueci minha senha, redefinição de senha) e **gestão de perfil** (consultar dados pessoais, editar perfil, alterar senha, administrador alterar tipo de acesso de outro usuário). Todos os serviços incluem controle de segurança.

**Resultado esperado:**  
As telas do sistema poderão se comunicar com o servidor de forma segura para realizar todas as operações de cadastro, login e gestão de perfil.

**Horas estimadas:** 4h (~0,5 dia)

---

## 🟣 Fase 5 — Infraestrutura em Nuvem (Azure)

**O que será feito:**  
Serão configurados os serviços na nuvem necessários para o funcionamento em produção: banco de dados e servidor da aplicação. As credenciais de segurança serão configuradas em ambiente protegido. A estrutura do banco de dados será publicada no ambiente de produção.

**Resultado esperado:**  
O ambiente de produção estará configurado e pronto para receber a publicação do sistema, com todas as credenciais protegidas.

**Horas estimadas:** 2,5h (~0,25 dia)

---

## ⚪ Fase 6 — Telas do Sistema (Interface Visual)

**O que será feito:**  
Serão desenvolvidas todas as telas do módulo de usuários: tela de login (e-mail e senha), tela de cadastro (nome, e-mail, senha, telefone), tela de confirmação de e-mail (acessada pelo link enviado por e-mail), tela de "esqueci minha senha" (informa o e-mail para receber o link), tela de redefinição de senha (acessada pelo link do e-mail) e tela de perfil do usuário (editar dados pessoais e alterar senha). Todas as telas terão visual moderno, responsivo (adaptado para computador, tablet e celular) e com mensagens claras de sucesso e erro. Também serão criados os mecanismos de proteção das telas — garantindo que apenas usuários logados acessem áreas restritas.

**Resultado esperado:**  
O usuário terá acesso a um sistema completo de cadastro e login — podendo criar sua conta, confirmar por e-mail, fazer login, recuperar a senha caso esqueça e editar seus dados pessoais — tudo com interface visual intuitiva e acessível de qualquer dispositivo.

**Horas estimadas:** 16,5h (~2 dias)

---

## 📊 Resumo Total de Esforço

| Fase | Descrição | Horas | Dias Úteis |
|------|-----------|-------|------------|
| 🔵 Fase 1 | Estruturação do Banco de Dados | 6,75h | ~1 dia |
| 🟢 Fase 2 | Regras de Acesso e Lógica | 8h | ~1 dia |
| 🟡 Fase 3 | Serviços de Segurança e Comunicação | 5,5h | ~0,75 dia |
| 🔴 Fase 4 | Serviços de Acesso (API) | 4h | ~0,5 dia |
| 🟣 Fase 5 | Infraestrutura em Nuvem | 2,5h | ~0,25 dia |
| ⚪ Fase 6 | Telas do Sistema (Interface Visual) | 16,5h | ~2 dias |
| **TOTAL** | | **43,25h** | **~5,5 dias úteis (~1 semana)** |

---

## 📋 Considerações

- Dias úteis calculados com base em jornada de **8 horas/dia**.
- A **Fase 5** (Infraestrutura em Nuvem) pode ser executada em paralelo com as Fases 1 a 3, sem impactar o prazo final.
- A **Fase 6** (Telas do Sistema) pode ser iniciada antes da conclusão dos serviços, utilizando dados simulados durante o desenvolvimento.
- Este módulo é **fundamental e prioritário** — todos os demais módulos do sistema (Gerenciamento de Energia, Monitoramento, Telemetria, Gestão Financeira, Comunicação) dependem do sistema de login e autenticação criado aqui. Por isso, é o primeiro a ser implementado.
- O tempo estimado inclui a criação de toda a **infraestrutura base do sistema** (configurações iniciais, estrutura de segurança, mecanismos de proteção de telas) que será reaproveitada nos módulos seguintes — tornando-os mais rápidos de implementar.
- A atividade de **maior risco** é a configuração do serviço de envio de e-mails (Fase 3), que depende de um servidor de e-mail funcional. Sem ele, as funcionalidades de confirmação de conta e recuperação de senha ficam comprometidas.
- Após a conclusão do desenvolvimento, é recomendável um período de **testes integrados** para validar todos os fluxos de cadastro, login, confirmação de e-mail e recuperação de senha em ambiente real.
