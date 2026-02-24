# Prompts Padrão — Geração de Documentação por Módulo

> Use estes prompts como base para solicitar a criação dos **4 documentos** de cada novo módulo do CEFE Energy Hub.  
> Substitua os trechos entre `{{colchetes}}` pelas informações específicas do módulo.  
> A ordem de criação é: **Relatório Backend → Relatório Frontend → Cards de Desenvolvimento → Proposta para o Cliente.**

---

## 📄 Documento 1 — Relatório Backend (técnico, arquitetura)

> É o **primeiro documento a ser criado**. Serve como documento de descoberta e definição da arquitetura backend do módulo.  
> **NÃO** deve conter referências a frontend (Angular, Tailwind, componentes visuais, serviços Angular, etc.).  
> Arquivo de saída: `RELATORIO_Backend_{{NomeModulo}}.md`

```
Crie um Relatório de Backend para o módulo "{{Nome do Módulo}}" do projeto CEFE Energy Hub.

O projeto segue uma arquitetura em 6 camadas com padrões definidos na pasta `padroes-desenvolvimento-back-end/`. Leia TODOS os arquivos dessa pasta antes de começar:
- `copilot-instructions.md` — Visão geral da arquitetura, nomenclatura, fluxo de dados e checklist de nova feature.
- `PADROES_DE_DESENVOLVIMENTO-API.md` — Controllers, verbos HTTP, rotas, retornos.
- `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md` — AppServicos, AutoMapper Profiles, UnitOfWork.
- `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` — DTOs (Request/Response), paginação, PROIBIÇÃO de DataAnnotations.
- `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` — Entidades (virtual, protected set, Set methods), Serviços, Comandos, Repositórios (interfaces), exceções.
- `PADROES_DE_DESENVOLVIMENTO-INFRA.md` — Repositórios (Entity Framework Core), Mapeamentos (IEntityTypeConfiguration<T>), RepositorioBase<T>, AppDbContext, Migrations.
- `PADROES_DE_DESENVOLVIMENTO-IOC.md` — Injeção de dependências, ConfiguracoesInjecoesDependencia, ConfiguracoesDbContext, ConfiguracoesAutoMapper.

Siga TODOS os padrões descritos nos arquivos da pasta `padroes-desenvolvimento-back-end/`. Não invente padrões — use exclusivamente o que está documentado nesses arquivos. Toda nomenclatura, estrutura de camadas, fluxo de dados, padrões de entidade, repositório, DTOs, IoC e paginação devem vir desses documentos.

REGRAS DE ESCOPO (IMPORTANTE):
- Este relatório é EXCLUSIVAMENTE sobre o backend (.NET 10, EF Core, SQL Server).
- NÃO incluir: referências a Angular, Tailwind CSS, componentes visuais, rotas do frontend, services Angular, BehaviorSubject, HttpClient Angular, authInterceptor Angular, etc.
- NÃO incluir: colunas de "Alerta Visual" com classes CSS, bordas coloridas, badges Tailwind, estilização de UI.
- NÃO incluir: apêndice ou seção sobre "Contexto do Frontend".
- Para funcionalidades visuais, descrever apenas A FONTE DO DADO e O CÁLCULO no backend — não a apresentação visual.
- O fluxo de dados deve terminar na API (endpoints), sem descer ao frontend.
- A tabela de Visão Geral NÃO deve incluir coluna "Rota Frontend".

O documento deve conter as seguintes seções:

1. **Visão Geral do Módulo** — Tabela com as telas e descrição (sem rota frontend). Restrições de acesso (JWT, usinaId).
2. **Funcionalidades Exibidas ao Usuário** — Para cada tela: listar cada componente (KPIs, gráficos, tabelas) com **fonte do dado** e **cálculo no backend**. SEM coluna de alerta visual ou estilização.
3. **Endpoints da API** — Cada endpoint com verbo HTTP, rota (`api/<feature>`), Request/Response DTOs nomeados conforme padrão, exemplo de retorno em JSON. Request DTOs com classes C#. Response DTOs com JSON de exemplo.
4. **Responsabilidades do Backend** — Tabela de Jobs (frequência + descrição), tabela de Cálculos (fórmula + quando executar), regras de negócio especiais.
5. **Diagrama de Entidades** — Diagrama ASCII com todas as entidades seguindo os padrões de `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`. Incluir Comandos e Enums.
6. **Estrutura de Pastas por Feature** — Mostrar como as pastas ficam em cada camada, conforme a estrutura definida em cada arquivo da pasta `padroes-desenvolvimento-back-end/`.
7. **Fluxo de Dados Resumido** — Diagrama ASCII: fontes de dados → jobs → banco (SQL Server) → API (6 camadas). O diagrama deve terminar na API, SEM caixa de "Frontend".
8. **Volume de Dados Estimado** — Tabela com registros/dia, registros/mês por entidade.
9. **Checklist de Implementação** — Seguir o checklist "Nova Feature" do `copilot-instructions.md`. Cada camada deve seguir os padrões descritos em seu respectivo arquivo na pasta `padroes-desenvolvimento-back-end/`.
10. **Resumo de Responsabilidades** — Tabela camada × responsabilidade. Incluir apenas camadas do backend (Jobs, Controller, AppServico, Domínio, Infra, IoC). SEM linha de "Frontend".
11. **Apêndice A — Mapeamentos EF Core (Exemplos)** — Exemplos de mapeamentos para as principais entidades do módulo, seguindo os padrões de `PADROES_DE_DESENVOLVIMENTO-INFRA.md`.

Regras:
- Nomes de entidades em português.
- Rotas da API seguindo o padrão `api/<feature>` (plural, minúsculo).
- Incluir exemplos de JSON de retorno para cada endpoint.
- Referenciar os padrões da pasta `padroes-desenvolvimento-back-end/` quando aplicável.

Referência de formato: Use como modelo a estrutura do arquivo `Planejamento/Monitoramento e Geracao/RELATORIO_Backend_MonitoramentoGeracao.md` (seções, nível de detalhe, formato das tabelas e diagramas ASCII).

Contexto do módulo:
Extraia o contexto automaticamente a partir dos arquivos do projeto `cefe-energy-hub`. Leia os seguintes arquivos e pastas, na ordem, para montar o contexto completo do módulo:

1. **Rotas (telas existentes):** Leia `src/App.tsx` para identificar todas as rotas do módulo e quais páginas estão mapeadas.
2. **Páginas:** Leia todos os arquivos em `src/pages/dashboard/` que correspondam ao módulo (identifique pelo nome da rota/feature). Extraia: componentes utilizados, estados, parâmetros de URL.
3. **Componentes visuais:** Leia todos os arquivos em `src/components/{{pasta-do-modulo}}/` (ex: `src/components/energy/`). Para cada componente, extraia: dados exibidos (KPIs, gráficos, tabelas), cálculos e formatações.
4. **Tipos e dados mock:** Leia `src/lib/{{moduloMockData}}.ts` (ex: `src/lib/energyMockData.ts`). Extraia: todas as interfaces/tipos (campos, tipos de dados). Esses tipos representam a **estrutura de dados esperada** e devem guiar a modelagem das entidades e DTOs do backend.
5. **Dados compartilhados:** Leia `src/lib/units.ts` para entender as unidades disponíveis e quais têm acesso ao módulo.
6. **Contexto de estado:** Leia `src/contexts/UnitContext.tsx` para entender o estado global que afeta o módulo.
7. **Documentação existente do módulo (se houver):** Verifique se já existe uma pasta em `Planejamento/{{Nome do Módulo}}/` com documentos anteriores. Se existir, leia para manter consistência.

Com base nessa leitura, identifique:
- **Dados que o backend deve fornecer:** liste cada dado exibido na UI e sua fonte (cálculo, job, banco de dados).
- **Modelo de dados:** liste todas as interfaces/tipos encontrados nos mocks — estes serão a base para as entidades.
- **Regras de acesso:** descreva quais unidades/perfis têm acesso ao módulo.
- **Integrações e fontes de dados:** identifique integrações externas (ex: API ProjectSwitch, concessionária) e sugira jobs de coleta.
- **Funcionalidades pendentes:** identifique componentes desabilitados que indicam funcionalidades planejadas.
```

---

## 📄 Documento 2 — Relatório Frontend (técnico, componentes Angular)

> É o **segundo documento a ser criado**, APÓS o Relatório Backend. Define a arquitetura frontend do módulo.  
> Deve referenciar os endpoints definidos no Relatório Backend, sem redefinir entidades, jobs ou regras de negócio.  
> Arquivo de saída: `RELATORIO_Frontend_{{NomeModulo}}.md`

```
Crie um Relatório de Frontend para o módulo "{{Nome do Módulo}}" do projeto CEFE Energy Hub.

O projeto frontend segue padrões definidos no arquivo `regras-projeto-angular.md`. Leia este arquivo INTEGRALMENTE antes de começar. Leia também o Relatório Backend do módulo (arquivo: `Planejamento/{{Nome do Módulo}}/RELATORIO_Backend_{{NomeModulo}}.md`) para conhecer os endpoints da API que serão consumidos.

Siga TODOS os padrões descritos no arquivo `regras-projeto-angular.md`. Não invente padrões — use exclusivamente o que está documentado nesse arquivo. Toda nomenclatura, estrutura de pastas, componentes, services, models, formulários, autenticação e tratamento de erros devem vir desse documento.

REGRAS DE ESCOPO (IMPORTANTE):
- Este relatório é EXCLUSIVAMENTE sobre o frontend (Angular 21, Tailwind CSS).
- NÃO incluir: entidades do Domínio C#, mapeamentos EF Core, repositórios, jobs, AppServicos, IoC, SQL Server.
- NÃO incluir: diagramas de entidades, comandos do Domínio, estrutura de pastas do backend .NET.
- Os endpoints da API são REFERENCIADOS (tabela de integração) mas NÃO REDEFINIDOS com DTOs C# ou JSON de exemplo.
- A API ProjectSwitch (Nortebox) é consumida pelo backend. O frontend NÃO acessa APIs externas diretamente.

O documento deve conter as seguintes seções:

1. **Visão Geral do Módulo** — Descrição, tabela com telas + rotas Angular + descrição. Restrições de acesso (JWT, UsinaService, AuthGuard, authInterceptor).
2. **Stack Frontend** — Tabela de tecnologias e padrões Angular adotados, conforme documentado em `regras-projeto-angular.md`.
3. **Funcionalidades Visuais da Tela** — Para cada tela/componente visual: dados exibidos, estilização Tailwind (classes CSS exatas para badges, bordas, backgrounds), comportamento reativo, endpoint fonte dos dados. Incluir subseção "Exemplo de Dados (hardcoded atual)" com tabela mostrando os valores hardcoded atuais e sua origem.
4. **Estrutura de Pastas Angular** — Árvore completa com: `pages/`, `components/<feature>/`, `services/`, `models/responses/`, `models/requests/`, `guards/`, `interceptors/`, `core/`, `environments/`.
5. **Serviços Angular** — Código TypeScript completo de cada service, seguindo os padrões de services definidos em `regras-projeto-angular.md`.
6. **Models (Interfaces)** — Código TypeScript completo: interfaces de Response (`I*`), interfaces auxiliares (`PaginacaoResponse<T>`, `IUsina`), classes de Request (`*Request` com PascalCase). Comentários com tipo/formato esperado.
7. **Integração com a API** — Tabela: Endpoint × Método HTTP × Serviço Angular × Response Interface. Nota sobre JWT e authInterceptor. Nota sobre integrações externas (consumidas pelo backend, não pelo frontend).
8. **Autenticação e Autorização** — Código TypeScript completo dos mecanismos de autenticação, seguindo os padrões definidos em `regras-projeto-angular.md`.
9. **Fluxo de Dados no Frontend** — Diagrama ASCII: Seleção de Unidade (UsinaService) → subscribe (Component) → Service → HttpClient (com authInterceptor) → .NET API.
10. **Checklist de Implementação** — Organizado por: Estrutura Base, Models, Serviços, Autenticação, Componentes, Tratamento de Erros. Cada item com `[ ]` e caminho do arquivo.
11. **Resumo de Responsabilidades** — Tabela: cada componente/service × sua responsabilidade.
12. **Funcionalidades Pendentes / Planejadas** — Telas complementares que podem ser integradas futuramente.

Regras:
- Todos os exemplos de código em TypeScript devem seguir os padrões do `regras-projeto-angular.md`.
- Nomenclatura de métodos, interfaces e classes conforme `regras-projeto-angular.md`.
- Incluir estilização Tailwind exata (classes CSS) para elementos visuais como badges, bordas e backgrounds.
- Referenciar `regras-projeto-angular.md` e o Relatório Backend quando aplicável.

Referência de formato: Use como modelo a estrutura do arquivo `Planejamento/Monitoramento e Geracao/RELATORIO_Frontend_MonitoramentoGeracao.md` (seções, nível de detalhe, código TypeScript, diagramas ASCII).

Contexto do módulo:
Extraia o contexto da mesma forma que o Relatório Backend (leia App.tsx, pages, components, mocks, units, contexts). Adicionalmente:
- Leia o `RELATORIO_Backend_{{NomeModulo}}.md` já gerado para conhecer os endpoints, DTOs e campos retornados pela API.
- Mapeie cada endpoint para um método do service Angular.
- Mapeie cada Response DTO para uma interface TypeScript com propriedades `camelCase`.
- Mapeie cada Request DTO para uma classe TypeScript com propriedades `PascalCase`.
- Identifique dados hardcoded nos componentes que serão substituídos por chamadas à API.
```

---

## 📄 Documento 3 — Cards de Desenvolvimento (técnico, para o dev)

> Derivado dos Relatórios Backend E Frontend. Transforma a arquitetura em tarefas ordenadas para execução.  
> Arquivo de saída: `CARDS_Desenvolvimento_{{NomeModulo}}.md`

```
Com base nos Relatórios Backend e Frontend do módulo "{{Nome do Módulo}}" (arquivos: RELATORIO_Backend_{{NomeModulo}}.md e RELATORIO_Frontend_{{NomeModulo}}.md), crie um documento de Cards de Desenvolvimento.

Leia os padrões definidos em:
- Pasta `padroes-desenvolvimento-back-end/` — arquitetura .NET em 6 camadas, EF Core, SQL Server.
- Arquivo `regras-projeto-angular.md` — padrões Angular 21 + Tailwind CSS.

As tasks devem referenciar esses padrões e seguir ambas as arquiteturas.

O documento deve seguir exatamente a estrutura abaixo, organizado em 6 fases ordenadas por dependência:

- **Fase 1 — Fundação (Banco de Dados + Entidades):**
  Todas as entidades do Domínio com campos detalhados. Seguir os padrões de cada camada conforme definido na pasta `padroes-desenvolvimento-back-end/`: Domínio (`PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`), Infra (`PADROES_DE_DESENVOLVIMENTO-INFRA.md`), DataTransfer (`PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md`).

- **Fase 2 — Regras de Negócio (Services / Domain):**
  Serviços de Domínio e de Aplicação conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` e `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md`. Registro no IoC conforme `PADROES_DE_DESENVOLVIMENTO-IOC.md`.

- **Fase 3 — Jobs de Coleta (WebJobs / Webhooks):**
  Processos automáticos com CRON expression, fluxo passo a passo e dependências de services.

- **Fase 4 — API Endpoints (Controllers):**
  Cada controller seguindo os padrões de `PADROES_DE_DESENVOLVIMENTO-API.md`. Retorno via DTOs conforme `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md`.

- **Fase 5 — Infraestrutura Azure:**
  Provisionamento de recursos (SQL Server, Blob Storage, App Service, WebJobs, Power Automate se aplicável).

- **Fase 6 — Frontend Angular:**
  Seguir integralmente os padrões do arquivo `regras-projeto-angular.md` e as definições do `RELATORIO_Frontend_{{NomeModulo}}.md`. Todas as tasks de models, services, autenticação, componentes e tratamento de erros devem seguir os padrões documentados no `regras-projeto-angular.md`.

Regras do documento:
- Cada task deve ter: número, título, emoji ⏱️ com estimativa de tempo para um desenvolvedor e descrição técnica detalhada.
- Incluir subtotal de horas por fase e tabela de resumo total no final.
- Todas as entidades devem usar nomes em português.
- Referenciar os padrões da pasta `padroes-desenvolvimento-back-end/` e do `regras-projeto-angular.md`.
- Cada task de entidade deve explicitar: campos, tipos, FKs, validações — seguindo `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` e `PADROES_DE_DESENVOLVIMENTO-INFRA.md`.
- Cada task de service (backend) deve explicitar: interface, implementação, registro — seguindo `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`, `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md` e `PADROES_DE_DESENVOLVIMENTO-IOC.md`.
- Cada task de service (frontend) deve explicitar: métodos, endpoint consumido — seguindo `regras-projeto-angular.md`.
- Cada task de componente Angular deve explicitar: inputs, dados exibidos, comportamento — seguindo `regras-projeto-angular.md`.

Contexto adicional (se houver):
{{Adicione aqui qualquer decisão nova ou ajuste que tenha surgido após os relatórios. Se não houver, remova esta seção.}}
```

---

## 📄 Documento 4 — Proposta para o Cliente (não-técnico)

> Derivado dos Cards de Desenvolvimento. Simplifica para linguagem de negócio.  
> Arquivo de saída: `PROPOSTA_{{NomeModulo}}_Cliente.md`

```
Com base no documento de Cards de Desenvolvimento do módulo "{{Nome do Módulo}}" (arquivo: CARDS_Desenvolvimento_{{NomeModulo}}.md), crie um novo documento voltado para o cliente final — uma pessoa que não entende de programação. Use as mesmas fases e estimativas totais de horas dos Cards.

Estrutura esperada:
- Título: "Proposta de Desenvolvimento — Módulo de {{Nome do Módulo}}"
- Cabeçalho com Projeto e Data.
- Seção "Sobre o Módulo" com 2-3 frases explicando o que o módulo faz em linguagem simples.
- Uma seção por fase (mesmas 6 fases), cada uma com:
  - Título da fase em linguagem não-técnica.
  - **O que será feito** — parágrafo curto (2-4 frases) descrevendo o escopo da fase em linguagem de negócio.
  - **Resultado esperado** — o que o cliente terá de concreto ao final da fase (ex: "Os dados de geração já estarão sendo coletados automaticamente").
  - **Horas estimadas** — subtotal de horas da fase.
- Tabela de Resumo Total de Esforço no final (Fase | Descrição | Horas | Dias Úteis).
- Seção de Considerações (jornada 8h/dia, paralelismo possível, atividades de maior risco, recomendação de homologação).

IMPORTANTE — Granularidade por FASE, não por Card:
- NÃO listar cada card/atividade individual em tabelas detalhadas.
- Cada fase deve ser apresentada como um bloco único com: o que será feito, resultado esperado e horas.
- O objetivo é dar ao cliente uma visão de alto nível do progresso por etapa, sem entrar em detalhes técnicos ou lista de tarefas.

Regras:
- Linguagem 100% não-técnica. Sem mencionar frameworks, linguagens, entidades, endpoints, banco de dados, etc.
- Não mencionar nível do desenvolvedor (jr, pleno, sênior).
- Descrições concisas — explicar O QUE será feito e QUAL O RESULTADO do ponto de vista do negócio.
- Usar as mesmas estimativas totais de horas por fase do documento técnico.
```

---

## 💡 Ordem Recomendada de Criação

A ordem ideal, validada no módulo de Monitoramento & Geração, é:

1. **Relatório Backend** — Documento de **descoberta e arquitetura backend**. Define entidades, jobs, endpoints, cálculos e regras de negócio. Foco exclusivo na API e camadas .NET. Sem referências ao frontend.
2. **Relatório Frontend** — Documento de **arquitetura frontend**. Define componentes, serviços Angular, models, autenticação e estilização. Referencia os endpoints do Relatório Backend sem redefini-los.
3. **Cards de Desenvolvimento** — Documento de **execução**. Transforma ambos os relatórios em tarefas ordenadas por dependência, com estimativas de tempo.
4. **Proposta para o Cliente** — Documento de **comunicação**. Simplifica os Cards em linguagem não-técnica para aprovação do cliente.

Sempre crie o Relatório Backend primeiro — ele define os contratos da API. O Relatório Frontend depende desses contratos. Os Cards e a Proposta são derivações de ambos.

---

## 🏗️ Arquitetura — Referência

Para consultar a arquitetura completa, diagramas e fluxos de dados, leia os arquivos de padrões:

- **Backend:** pasta `padroes-desenvolvimento-back-end/` (especialmente `copilot-instructions.md` para visão geral da arquitetura e fluxo de dados)
- **Frontend:** arquivo `regras-projeto-angular.md` (stack, estrutura de pastas, componentes, services, models, autenticação)

---

## 📂 Estrutura de Pastas

```
Planejamento/
├── PROMPTS_Padrao_Documentacao.md          ← este arquivo
├── Gerenciamento de energia/
│   ├── RELATORIO_Backend_GerenciamentoEnergia.md
│   ├── RELATORIO_Frontend_GerenciamentoEnergia.md
│   ├── CARDS_Desenvolvimento_GerenciamentoEnergia.md
│   └── PROPOSTA_GerenciamentoEnergia_Cliente.md
├── Monitoramento e Geracao/
│   ├── RELATORIO_Backend_MonitoramentoGeracao.md
│   ├── RELATORIO_Frontend_MonitoramentoGeracao.md
│   ├── CARDS_Desenvolvimento_MonitoramentoGeracao.md
│   └── PROPOSTA_MonitoramentoGeracao_Cliente.md
├── {{Próximo módulo}}/
│   ├── RELATORIO_Backend_{{NomeModulo}}.md
│   ├── RELATORIO_Frontend_{{NomeModulo}}.md
│   ├── CARDS_Desenvolvimento_{{NomeModulo}}.md
│   └── PROPOSTA_{{NomeModulo}}_Cliente.md
└── ...

padroes-desenvolvimento-back-end/           ← padrões backend obrigatórios
├── copilot-instructions.md
├── PADROES_DE_DESENVOLVIMENTO-API.md
├── PADROES_DE_DESENVOLVIMENTO-APLICACAO.md
├── PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md
├── PADROES_DE_DESENVOLVIMENTO-DOMINIO.md
├── PADROES_DE_DESENVOLVIMENTO-INFRA.md
└── PADROES_DE_DESENVOLVIMENTO-IOC.md

regras-projeto-angular.md                   ← padrões frontend obrigatórios
```
