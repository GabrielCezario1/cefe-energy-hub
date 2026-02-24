# Relatório — Backend do Módulo de Comunicação e Gerência de Parcerias

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
> **⚠️ Pré-requisito:** Os módulos de **Gerenciamento de Energia** e **Monitoramento & Geração** são implementados **antes** deste módulo. Artefatos compartilhados como a entidade `Usina`, `RepositorioBase`, `AppDbContext`, IoC base, autenticação JWT e infraestrutura Azure já existirão. Este relatório indica explicitamente quais itens devem ser **reutilizados** (✅), **estendidos** (🔄) ou **criados do zero** (🆕).

---

## 1. Visão Geral do Módulo

O módulo de **Comunicação e Gerência de Parcerias** centraliza as informações de contato dos stakeholders do CEFE Energy Hub — fornecedores, integradores, fabricantes de equipamentos, concessionárias de energia e prestadores de serviços. Permite o cadastro, edição, consulta e remoção de contatos, organizados por função/papel no ecossistema.

| Tela | Descrição |
| --- | --- |
| **Comunicação e Gerência de Parcerias** | Listagem de stakeholders em grid de cards com nome, função, e-mail e telefone. CRUD completo: adicionar novo contato, editar contato existente, remover contato com confirmação. Botão "Ver Detalhes" para expansão futura. |

### Restrições de Acesso

- O módulo está disponível para **todas as unidades** cadastradas no sistema.
- O usuário deve estar autenticado (JWT) e ter uma unidade selecionada.
- Os contatos são **globais** — não filtrados por `usinaId`. Todos os usuários autenticados visualizam os mesmos stakeholders.
- Operações de escrita (inserir, editar, excluir) requerem JWT válido. Futuramente, pode-se restringir por perfil (ex: apenas administradores podem remover).

---

## 2. Funcionalidades Exibidas ao Usuário

### 2.1 — Tela: Comunicação e Gerência de Parcerias (`/dashboard/communication`)

#### 2.1.1 — Grid de Stakeholders (cards)

| Dado | Fonte do Dado | Cálculo |
| --- | --- | --- |
| **Nome** | Cadastro do contato (`Contato.Nome`) | Valor direto |
| **Função / Papel** | Cadastro do contato (`Contato.Funcao`) | Valor direto. Exibido como badge. Ex: "Fornecedor de Inversores", "Concessionária - CE" |
| **E-mail** | Cadastro do contato (`Contato.Email`) | Valor direto. Link `mailto:` clicável |
| **Telefone** | Cadastro do contato (`Contato.Telefone`) | Valor direto |
| **Quantidade Total** | Contagem de registros ativos | `COUNT(*)` de contatos ativos |

#### 2.1.2 — Formulário de Cadastro / Edição (Dialog)

| Campo | Obrigatoriedade | Validação |
| --- | --- | --- |
| **Nome** | Obrigatório | Não pode ser vazio. Máximo 255 caracteres |
| **Função / Papel** | Obrigatório | Não pode ser vazio. Máximo 255 caracteres |
| **E-mail** | Obrigatório | Não pode ser vazio. Formato de e-mail válido. Máximo 255 caracteres |
| **Telefone** | Obrigatório | Não pode ser vazio. Máximo 50 caracteres |

- **Inserção:** Abre dialog com campos vazios. Ao confirmar, persiste novo contato no banco.
- **Edição:** Abre dialog preenchido com dados do contato selecionado. Ao confirmar, atualiza o registro.

#### 2.1.3 — Remoção de Contato (AlertDialog)

- Ao clicar no botão de lixeira, exibe confirmação: "Tem certeza que deseja remover este contato? Esta ação não pode ser desfeita."
- **Comportamento:** Exclusão lógica (soft delete via campo `Ativo = false`) ou exclusão física, conforme decisão do projeto. Este relatório assume **exclusão física** para simplicidade, mas recomenda-se soft delete para auditoria.

#### 2.1.4 — Botão "Ver Detalhes" (planejado)

- Presente nos cards mas **sem funcionalidade** no momento.
- Futuramente poderá abrir uma tela de detalhes com histórico de interações, documentos anexos, notas e anotações.

---

## 3. Endpoints da API

> **Padrão de rotas:** `api/contatos` (conforme `PADROES_DE_DESENVOLVIMENTO-API.md`).
> Todos os endpoints usam `[Authorize]`. Contatos são globais (sem filtro por `usinaId`).

### 3.1 — Listar Contatos

```
GET api/contatos
```

**Request DTO:** `ContatosListarRequest` (herda `PaginacaoFiltro`)
```csharp
public class ContatosListarRequest : PaginacaoFiltro
{
    public string? Nome { get; set; }
    public string? Funcao { get; set; }
}
```

**Response DTO:** `ContatoResponse`

```json
{
  "registros": [
    {
      "id": 1,
      "nome": "Deif",
      "funcao": "Fornecedor de Inversores",
      "email": "contato@deif.com",
      "telefone": "+55 11 3456-7890",
      "dataCriacao": "2026-01-15T10:30:00"
    },
    {
      "id": 2,
      "nome": "Ynova",
      "funcao": "Integrador",
      "email": "suporte@ynova.com.br",
      "telefone": "+55 21 98765-4321",
      "dataCriacao": "2026-01-15T10:30:00"
    },
    {
      "id": 3,
      "nome": "Sungrow",
      "funcao": "Fabricante de Equipamentos",
      "email": "brasil@sungrow.com",
      "telefone": "+55 11 2345-6789",
      "dataCriacao": "2026-01-20T14:15:00"
    },
    {
      "id": 4,
      "nome": "Fortlev Solar",
      "funcao": "Estruturas",
      "email": "comercial@fortlevsolar.com.br",
      "telefone": "+55 48 3333-4444",
      "dataCriacao": "2026-01-22T09:00:00"
    },
    {
      "id": 5,
      "nome": "Gabriel - TI",
      "funcao": "Empresa de TI",
      "email": "gabriel@empresa.com",
      "telefone": "+55 21 99999-8888",
      "dataCriacao": "2026-01-25T16:45:00"
    },
    {
      "id": 6,
      "nome": "Enel Ceará",
      "funcao": "Concessionária - CE",
      "email": "atendimento@enel.com.br",
      "telefone": "0800 123 4567",
      "dataCriacao": "2026-02-01T08:00:00"
    },
    {
      "id": 7,
      "nome": "EDP Espírito Santo",
      "funcao": "Concessionária - ES",
      "email": "contato@edp.com.br",
      "telefone": "0800 765 4321",
      "dataCriacao": "2026-02-01T08:00:00"
    },
    {
      "id": 8,
      "nome": "Light Rio",
      "funcao": "Concessionária - RJ",
      "email": "suporte@light.com.br",
      "telefone": "0800 999 8888",
      "dataCriacao": "2026-02-01T08:00:00"
    }
  ],
  "total": 8
}
```

---

### 3.2 — Recuperar Contato por ID

```
GET api/contatos/{id}
```

**Response DTO:** `ContatoResponse`

```json
{
  "id": 1,
  "nome": "Deif",
  "funcao": "Fornecedor de Inversores",
  "email": "contato@deif.com",
  "telefone": "+55 11 3456-7890",
  "dataCriacao": "2026-01-15T10:30:00"
}
```

---

### 3.3 — Inserir Contato

```
POST api/contatos
```

**Request DTO:** `ContatosInserirRequest`
```csharp
public class ContatosInserirRequest
{
    public string Nome { get; set; }
    public string Funcao { get; set; }
    public string Email { get; set; }
    public string Telefone { get; set; }
}
```

**Response DTO:** `ContatoResponse`

```json
{
  "id": 9,
  "nome": "Nova Empresa Solar",
  "funcao": "Fornecedor de Painéis",
  "email": "contato@novaempresa.com.br",
  "telefone": "+55 11 9876-5432",
  "dataCriacao": "2026-02-24T14:00:00"
}
```

---

### 3.4 — Editar Contato

```
PUT api/contatos
```

**Request DTO:** `ContatosEditarRequest`
```csharp
public class ContatosEditarRequest
{
    public int Id { get; set; }
    public string? Nome { get; set; }
    public string? Funcao { get; set; }
    public string? Email { get; set; }
    public string? Telefone { get; set; }
}
```

**Response DTO:** `ContatoResponse`

```json
{
  "id": 1,
  "nome": "Deif Brasil",
  "funcao": "Fornecedor de Inversores",
  "email": "contato@deif.com.br",
  "telefone": "+55 11 3456-7890",
  "dataCriacao": "2026-01-15T10:30:00"
}
```

---

### 3.5 — Excluir Contato

```
DELETE api/contatos/{id}
```

**Response:** `200 OK` (sem corpo)

---

## 4. Responsabilidades do Backend

### 4.1 — Coleta de Dados (Jobs)

| Job | Frequência | Descrição |
| --- | --- | --- |
| — | — | Este módulo **não possui jobs de coleta**. Os dados são inseridos manualmente pelos usuários via interface web. |

> **Nota:** Diferente dos módulos de Monitoramento e Telemetria, o módulo de Comunicação é puramente CRUD sem integrações externas ou processos automáticos.

### 4.2 — Cálculos no Backend

| Cálculo | Fórmula | Quando Executar |
| --- | --- | --- |
| **Quantidade de Contatos** | `COUNT(*)` de registros na tabela `Contato` | Ao retornar listagem (campo `total` da paginação) |

### 4.3 — Regras de Negócio

| Regra | Descrição |
| --- | --- |
| **Nome obrigatório** | O campo `Nome` não pode ser vazio ou nulo. Validado no método `SetNome()` da entidade. |
| **Função obrigatória** | O campo `Funcao` não pode ser vazio ou nulo. Validado no método `SetFuncao()` da entidade. |
| **E-mail obrigatório** | O campo `Email` não pode ser vazio ou nulo. Validado no método `SetEmail()` da entidade. |
| **Telefone obrigatório** | O campo `Telefone` não pode ser vazio ou nulo. Validado no método `SetTelefone()` da entidade. |
| **Tamanho máximo de campos** | Nome: 255. Funcao: 255. Email: 255. Telefone: 50. Validados nos métodos `Set`. |
| **Edição parcial** | Na edição, apenas os campos não-nulos são atualizados (os demais mantêm o valor atual). |
| **Exclusão do contato** | A exclusão remove fisicamente o registro. Valida se o contato existe antes de excluir (lança `ValidarRegistroNaoFoiEncontrado`). |
| **Validação do usuário autenticado na exclusão** | O endpoint de exclusão valida as claims JWT para garantir que o usuário está autenticado. |

---

## 5. Diagrama de Entidades

> Todas as entidades seguem o padrão do Domínio: propriedades `virtual`, setters `protected set`, construtor vazio `protected` (EF Core), métodos `Set<Propriedade>` com validação via `RegraDeNegocioExcecao`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`

```
┌──────────────────────────────────────────┐
│               Contato                    │
├──────────────────────────────────────────┤
│ virtual int Id { get; protected set; }               │
│ virtual string Nome { get; protected set; }          │
│ virtual string Funcao { get; protected set; }        │
│ virtual string Email { get; protected set; }         │
│ virtual string Telefone { get; protected set; }      │
│ virtual DateTime DataCriacao { get; protected set; }  │
├──────────────────────────────────────────┤
│ protected Contato() { }                  │
│ Contato(string nome, string funcao,      │
│         string email, string telefone)   │
│ SetNome(string)                          │
│ SetFuncao(string)                        │
│ SetEmail(string)                         │
│ SetTelefone(string)                      │
└──────────────────────────────────────────┘
```

### Comandos

```
┌────────────────────────────────────────┐
│      ContatosInserirComando            │
├────────────────────────────────────────┤
│ string Nome                            │
│ string Funcao                          │
│ string Email                           │
│ string Telefone                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      ContatosEditarComando             │
├────────────────────────────────────────┤
│ int Id                                 │
│ string? Nome                           │
│ string? Funcao                         │
│ string? Email                          │
│ string? Telefone                       │
└────────────────────────────────────────┘
```

---

## 6. Estrutura de Pastas por Feature

> Conforme padrões em `padroes-desenvolvimento-back-end/copilot-instructions.md`.
>
> **⚠️ Itens já existentes (criados nos módulos anteriores):**
> - `Infra/Comum/RepositorioBase.cs` → ✅ **reutilizar**
> - `Infra/Contexto/AppDbContext.cs` → 🔄 **estender** (adicionar `DbSet<Contato>`)
> - `Ioc/` (`ConfiguracoesDbContext`, `ConfiguracoesInjecoesDependencia`, `ConfiguracoesAutoMapper`) → 🔄 **estender** (adicionar novos registros)

```
<Projeto>.Api/
└── Controllers/
    └── Contatos/
        └── ContatosController.cs

<Projeto>.Aplicacao/
└── Contatos/
    ├── Profiles/
    │   └── ContatosProfile.cs
    └── Servicos/
        ├── Interfaces/
        │   └── IContatosAppServico.cs
        └── ContatosAppServico.cs

<Projeto>.DataTransfer/
└── Contatos/
    ├── Request/
    │   ├── ContatosInserirRequest.cs
    │   ├── ContatosEditarRequest.cs
    │   └── ContatosListarRequest.cs
    └── Response/
        └── ContatoResponse.cs

<Projeto>.Dominio/
└── Contatos/
    ├── Entidades/
    │   └── Contato.cs
    ├── Repositorios/
    │   └── IContatosRepositorio.cs
    └── Servicos/
        ├── Comandos/
        │   ├── ContatosInserirComando.cs
        │   └── ContatosEditarComando.cs
        ├── Interfaces/
        │   └── IContatosServicos.cs
        └── ContatosServicos.cs

<Projeto>.Infra/
├── Comum/
│   └── Repositorios/
│       └── RepositorioBase.cs           ← ✅ já existe
├── Contexto/
│   └── AppDbContext.cs                  ← 🔄 adicionar DbSet<Contato>
├── Migrations/
│   └── <DataHora>_AdicionarTabelaContatos.cs
└── Contatos/
    ├── Mapeamentos/
    │   └── ContatoConfiguration.cs
    └── Repositorios/
        └── ContatosRepositorio.cs

<Projeto>.Ioc/
├── ConfiguracoesDbContext.cs             ← ✅ já existe e configurado
├── ConfiguracoesInjecoesDependencia.cs   ← 🔄 adicionar registros Contatos
└── ConfiguracoesAutoMapper.cs            ← 🔄 adicionar ContatosProfile
```

---

## 7. Fluxo de Dados Resumido

```
┌──────────────────────────────────────────────────────────────┐
│                     Usuário Autenticado                      │
│                (via Interface Web / Frontend)                │
│                                                              │
│  Ações: Listar, Inserir, Editar, Excluir contatos           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ HTTP (JWT no header)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    .NET 10 Web API (6 camadas)               │
│                                                              │
│  Controller ─► AppServico ─► Servico Domínio ─► Repositório  │
│       ▲              │              │                │       │
│       │         AutoMapper    Validações        EF Core      │
│       │              │         (Set methods)        │        │
│       └──── Response ◄── Entidade ◄── Comando ◄────┘        │
│                                                              │
│  Endpoints:                                                  │
│    GET    api/contatos           (Listar com paginação)      │
│    GET    api/contatos/{id}      (Recuperar por ID)          │
│    POST   api/contatos           (Inserir novo contato)      │
│    PUT    api/contatos           (Editar contato)            │
│    DELETE api/contatos/{id}      (Excluir contato)           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ EF Core
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                       SQL Server                             │
│                                                              │
│  Tabela: contatos                                            │
│  (id, nome, funcao, email, telefone, data_criacao)           │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Volume de Dados Estimado

| Entidade | Registros Iniciais | Crescimento Estimado | Observação |
| --- | --- | --- | --- |
| **Contato** | 8 (stakeholders pré-cadastrados) | ~2-5 por mês | Volume muito baixo. Sem necessidade de índices adicionais ou particionamento. |

> **Nota:** Este módulo tem volume de dados significativamente menor que os módulos de Monitoramento e Gerenciamento de Energia. A tabela `contatos` raramente ultrapassará centenas de registros.

---

## 9. Checklist de Implementação

> Seguir o checklist "Nova Feature" de `padroes-desenvolvimento-back-end/copilot-instructions.md`.
> Ordem: DataTransfer → Domínio → Infra → Aplicação → API → IoC.

### 9.1 — DataTransfer
- [ ] `ContatosInserirRequest.cs` em `Contatos/Request/`
- [ ] `ContatosEditarRequest.cs` em `Contatos/Request/`
- [ ] `ContatosListarRequest.cs` em `Contatos/Request/` (herda `PaginacaoFiltro`)
- [ ] `ContatoResponse.cs` em `Contatos/Response/`

### 9.2 — Domínio

#### Entidade
- [ ] 🆕 `Contato.cs` em `Contatos/Entidades/` — campos: `Id`, `Nome`, `Funcao`, `Email`, `Telefone`, `DataCriacao`. Métodos: `SetNome(string)`, `SetFuncao(string)`, `SetEmail(string)`, `SetTelefone(string)`.

#### Repositório (interface)
- [ ] 🆕 `IContatosRepositorio.cs` em `Contatos/Repositorios/`

#### Comandos
- [ ] 🆕 `ContatosInserirComando.cs` em `Contatos/Servicos/Comandos/`
- [ ] 🆕 `ContatosEditarComando.cs` em `Contatos/Servicos/Comandos/`

#### Serviço
- [ ] 🆕 `IContatosServicos.cs` em `Contatos/Servicos/Interfaces/`
- [ ] 🆕 `ContatosServicos.cs` em `Contatos/Servicos/`

### 9.3 — Infraestrutura

#### Mapeamento EF Core
- [ ] 🆕 `ContatoConfiguration.cs` em `Contatos/Mapeamentos/`

#### AppDbContext
- [ ] 🔄 Adicionar `DbSet<Contato> Contatos { get; set; }` ao `AppDbContext` existente

#### Repositório (implementação)
- [ ] 🆕 `ContatosRepositorio.cs` em `Contatos/Repositorios/` (herda `RepositorioBase<Contato>`)

#### Migration
- [ ] 🆕 Criar migration: `dotnet ef migrations add AdicionarTabelaContatos --project <Projeto>.Infra --startup-project <Projeto>.Api`

### 9.4 — Aplicação
- [ ] 🆕 `IContatosAppServico.cs` em `Contatos/Servicos/Interfaces/`
- [ ] 🆕 `ContatosAppServico.cs` em `Contatos/Servicos/`
- [ ] 🆕 `ContatosProfile.cs` em `Contatos/Profiles/`

### 9.5 — API
- [ ] 🆕 `ContatosController.cs` em `Controllers/Contatos/`
  - `[Route("api/contatos")]`
  - `[ApiController]`
  - `[Authorize]`
  - Métodos: `Listar`, `Recuperar`, `Inserir`, `Editar`, `Excluir`

### 9.6 — IoC
- [ ] 🔄 Adicionar ao `ConfiguracoesInjecoesDependencia.AddInjecoesDependencia` existente:
  ```
  services.AddScoped<IContatosRepositorio, ContatosRepositorio>();
  services.AddScoped<IContatosServicos, ContatosServicos>();
  services.AddScoped<IContatosAppServico, ContatosAppServico>();
  ```
- [ ] 🔄 Registrar `ContatosProfile` em `ConfiguracoesAutoMapper.cs`

---

## 10. Resumo de Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| **API — Controller** | Expor 5 endpoints CRUD (`api/contatos`). Validar JWT. Delegar para AppServico. Retornar DTOs Response. |
| **API — AppServico** | Orquestrar chamadas ao domínio. Mapear Request → Comando e Entidade → Response via AutoMapper. UnitOfWork para escrita. |
| **API — Domínio (Servicos)** | Validar regras de negócio (campos obrigatórios, tamanhos máximos). Manipular entidades via Comandos. |
| **API — Domínio (Entidades)** | Encapsular dados com validação via métodos `Set`. `RegraDeNegocioExcecao` para erros de negócio. `ValidarRegistroNaoFoiEncontrado` para exclusão/edição. |
| **API — Infra (Repositório)** | Persistir/consultar dados no SQL Server via Entity Framework Core. Herda `RepositorioBase<Contato>`. |
| **API — Infra (Mapeamento)** | Mapear entidade `Contato` para tabela `contatos` via `IEntityTypeConfiguration<Contato>` (EF Core Fluent API). |
| **API — Infra (AppDbContext)** | Centralizar `DbSet<Contato>`. Gerenciar schema via Migrations do EF Core. |
| **API — IoC** | Registrar `IContatosRepositorio`, `IContatosServicos`, `IContatosAppServico` em `ConfiguracoesInjecoesDependencia`. Registrar `ContatosProfile` em `ConfiguracoesAutoMapper`. |

---

## Apêndice A — Mapeamentos EF Core (Exemplos)

> Os mapeamentos usam `IEntityTypeConfiguration<T>` (Fluent API) e são descobertos automaticamente via `modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)` no `AppDbContext`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-INFRA.md`

### ContatoConfiguration.cs

```csharp
public class ContatoConfiguration : IEntityTypeConfiguration<Contato>
{
    public void Configure(EntityTypeBuilder<Contato> builder)
    {
        builder.ToTable("contatos");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Nome)
            .HasColumnName("nome")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Funcao)
            .HasColumnName("funcao")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Telefone)
            .HasColumnName("telefone")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.DataCriacao)
            .HasColumnName("data_criacao")
            .IsRequired();
    }
}
```
