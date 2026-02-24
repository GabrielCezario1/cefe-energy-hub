# Instruções do Copilot

## Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                        <Projeto>.Api                            │
│  Controllers, Autenticação JWT, Swagger                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     <Projeto>.Aplicacao                         │
│  AppServicos, AutoMapper Profiles, Orquestração                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│   <Projeto>.DataTransfer│     │       <Projeto>.Dominio         │
│   DTOs (Request/Response)│     │  Entidades, Serviços, Comandos  │
└─────────────────────────┘     └─────────────────────────────────┘
                                              │
                                              ▼
                              ┌─────────────────────────────────┐
                              │        <Projeto>.Infra          │
                              │  Repositórios, Mapeamentos EF   │
                              └─────────────────────────────────┘
                                              │
                                              ▼
                              ┌─────────────────────────────────┐
                              │         <Projeto>.Ioc           │
                              │  Injeção de Dependências        │
                              └─────────────────────────────────┘
```

## Arquitetura e Responsabilidades
- `<Projeto>.Api` hospeda os controllers ASP.NET Core; veja `<Projeto>.Api/Program.cs` para CORS, autenticação JWT, Swagger, registro de perfis AutoMapper, cache em memória e composição dos serviços.
- Os controllers chamam serviços de aplicação em `<Projeto>.Aplicacao` (pasta `Servicos`), que orquestram AutoMapper, serviços de domínio e infraestrutura (e-mail, S3 etc.).
- `<Projeto>.DataTransfer` guarda os DTOs por feature (`Request` herda de `PaginacaoFiltro`, `Response` espelha entidades) trocados com os clientes.
- A lógica de domínio vive em `<Projeto>.Dominio` com entidades, repositórios e comandos/filtros; os setters encapsulam invariantes.
- `<Projeto>.Infra` implementa repositórios e mapeamentos Entity Framework Core (mapeia colunas SQL Server via `IEntityTypeConfiguration<T>`) além da base reutilizável `RepositorioBase<T>`, e contém o `AppDbContext`.
- `<Projeto>.Ioc/ConfiguracoesDbContext.cs` configura o `AppDbContext` com SQL Server e `ConfiguracoesInjecoesDependencia` registra manualmente cada interface—estenda ao criar novos serviços ou repositórios.

## Nomenclatura Geral

### Classes

| Camada | Padrão | Exemplo |
|--------|--------|---------|
| API | `<Feature>Controller` | `DepoimentosController` |
| Aplicação | `<Feature>AppServico` | `DepoimentosAppServico` |
| Aplicação | `<Feature>Profile` | `DepoimentosProfile` |
| DataTransfer | `<Feature><Acao>Request` | `DepoimentosInserirRequest` |
| DataTransfer | `<Feature>Response` | `DepoimentosResponse` |
| Domínio | `<Entidade>` (singular) | `Depoimento` |
| Domínio | `<Feature>Servicos` | `DepoimentosServicos` |
| Domínio | `<Feature><Acao>Comando` | `DepoimentosInserirComando` |
| Infra | `<Feature>Repositorio` | `DepoimentosRepositorio` |
| Infra | `<Entidade>Configuration` | `DepoimentoConfiguration` |

### Variáveis e Campos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Campos privados | `_camelCase` | `_depoimentosRepositorio` |
| Parâmetros | `camelCase` | `comando`, `request` |
| Variáveis locais | `camelCase` | `depoimento`, `usuario` |

### Métodos

| Contexto | Padrão | Exemplo |
|----------|--------|---------|
| CRUD | Verbos em português | `Inserir`, `Editar`, `Excluir`, `Recuperar`, `Listar` |
| Async | Sufixo `Async` | `InserirAsync`, `RecuperarAsync` |
| Validação | Prefixo `Validar` | `ValidarId`, `ValidarUsuario` |

### Namespaces
```
<Projeto>.<Camada>.<Feature>.<Subcategoria>
```
Exemplos:
- `<Projeto>.Api.Controllers.Depoimentos`
- `<Projeto>.Aplicacao.Depoimentos.Servicos`
- `<Projeto>.Dominio.Depoimentos.Entidades`
- `<Projeto>.Infra.Depoimentos.Repositorios`

## Fluxo de Dados

```
HTTP Request
     │
     ▼
Controller ──[FromBody/FromQuery]──► <Feature>InserirRequest
     │
     ▼
AppServico ──[AutoMapper]──► <Feature>InserirComando
     │
     ▼
Servico Domínio ──[new]──► Entidade
     │
     ▼
Repositório ──[EF Core]──► SQL Server
     │
     ▼
AppServico ──[AutoMapper]──► <Feature>Response
     │
     ▼
Controller ──[Ok()]──► HTTP Response
```

## Dados e Persistência
- A persistência usa **Entity Framework Core** com **SQL Server** (`ConnectionStrings:DefaultConnection` em `<Projeto>.Api/appsettings*.json`); alterações de schema são gerenciadas via **Migrations** do EF Core (`dotnet ef migrations add <Nome>` / `dotnet ef database update`).
- Os mapeamentos EF Core (`IEntityTypeConfiguration<T>`) são coletados automaticamente via `modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)` no `AppDbContext`; adicione novos `IEntityTypeConfiguration<T>` na pasta `Mapeamentos` da feature para que sejam descobertos.
- Consultas de repositório usam LINQ via `IQueryable<T>` exposto pelo `RepositorioBase<T>.Query()`; filtros e paginação são aplicados sobre o `IQueryable`.

### Métodos do Repositório Base (`RepositorioBase<T>`)
```csharp
// Síncronos
Inserir(T), Editar(T), Excluir(T)
Recuperar(long id), Recuperar(Expression<Func<T, bool>>)
Query()

// Assíncronos
InserirAsync(T, CancellationToken), EditarAsync(T, CancellationToken), ExcluirAsync(T, CancellationToken)
RecuperarAsync(long id, CancellationToken), RecuperarAsync(Expression<Func<T, bool>>, CancellationToken)
```

## Serviços Transversais
- A emissão JWT (se configurada) deve manter as chaves em secrets ou variáveis de ambiente, nunca em JSON commitado.
- Recuperação de senha usa cache em memória (`PasswordResetService` com tokens de 1 hora) e dispara e-mails pelo `EmailService` usando `EmailSettings` + `AppSettings.FrontendUrl` para montar o link.
- Miniaturas/arquivos são resolvidos em tempo de leitura pelo `S3Service` (AWS SDK) configurado por `AwsSettings`; basta fornecer a key que ele devolve uma URL pré-assinada.

## Gerenciamento de Transações (EF Core)

O `AppDbContext` do Entity Framework Core já implementa o padrão Unit of Work internamente. Cada chamada a `SaveChanges`/`SaveChangesAsync` persiste todas as alterações rastreadas em uma única transação.

### Uso nos Repositórios
O `RepositorioBase<T>` chama `_context.SaveChangesAsync(ct)` ao final de cada operação de escrita.

### Transações Explícitas (múltiplas operações)
Quando necessário agrupar várias operações em uma única transação:

```csharp
using var transaction = await _context.Database.BeginTransactionAsync(ct);
try
{
    // operações de escrita...
    await _context.SaveChangesAsync(ct);
    await transaction.CommitAsync(ct);
}
catch
{
    await transaction.RollbackAsync(ct);
    throw;
}
```

### Quando Usar Transações Explícitas
- ✅ Operações que envolvem múltiplas entidades em repositórios distintos
- ✅ Operações que exigem rollback condicional
- ❌ Operações simples de CRUD (o `SaveChangesAsync` já é transacional)

## Superfície da API e Padrões
- Controllers seguem nomes em português (`Listar`, `Inserir`, `Editar`) e geralmente recebem `[FromQuery]` para filtros GET e `[FromBody]` para POST.
- Swagger fica exposto em `/` somente em Development; aplique `[Authorize]` onde JWT é obrigatório e `[AllowAnonymous]` para login e recuperação de senha.
- A política CORS deve liberar todos os frontends implantados e permitir credenciais—reaproveite para novos endpoints.

### Validação de Usuário Autenticado
```csharp
var claimId = User.FindFirstValue(ClaimTypes.NameIdentifier);
if (string.IsNullOrEmpty(claimId) || !int.TryParse(claimId, out var userId))
    return Unauthorized();
```

## Build, Execução e Deploy
- Restaure/compile a solução com `dotnet restore <Projeto>.sln` e `dotnet build <Projeto>.sln -c Debug` (ou Release); rode a API via `dotnet run --project <Projeto>.Api/<Projeto>.Api.csproj` ou `dotnet watch run` para hot reload.
- Workflows com containers usam o `Dockerfile` (multi-stage .NET) e `docker-compose.yml`; `docker compose up --build` expõe a porta configurada, enquanto `docker-compose.debug.yml` fixa `ASPNETCORE_ENVIRONMENT=Development` para depuração remota.
- Valide alterações chamando os endpoints HTTP (Swagger/Postman) e, se houver persistência, confira em um SQL Server atualizado via Migrations do EF Core.

## Checklist Nova Feature

### 1. DataTransfer
- [ ] `<Feature>InserirRequest.cs` em `Request/`
- [ ] `<Feature>EditarRequest.cs` em `Request/`
- [ ] `<Feature>ListarRequest.cs` em `Request/` (herda `PaginacaoFiltro`)
- [ ] `<Feature>Response.cs` em `Response/`

### 2. Domínio
- [ ] `<Entidade>.cs` em `Entidades/`
- [ ] `I<Feature>Repositorio.cs` em `Repositorios/`
- [ ] `<Feature>InserirComando.cs` em `Servicos/Comandos/`
- [ ] `<Feature>EditarComando.cs` em `Servicos/Comandos/`
- [ ] `I<Feature>Servicos.cs` em `Servicos/Interfaces/`
- [ ] `<Feature>Servicos.cs` em `Servicos/`

### 3. Infraestrutura
- [ ] `<Entidade>Configuration.cs` em `Mapeamentos/` (implementar `IEntityTypeConfiguration<T>`)
- [ ] `<Feature>Repositorio.cs` em `Repositorios/` (herdar `RepositorioBase<T>`)
- [ ] Adicionar `DbSet<T>` no `AppDbContext`
- [ ] Criar Migration EF Core (`dotnet ef migrations add <Nome>`)

### 4. Aplicação
- [ ] `I<Feature>AppServico.cs` em `Servicos/`
- [ ] `<Feature>AppServico.cs` em `Servicos/`
- [ ] `<Feature>Profile.cs` em `Profiles/`
- [ ] `<Feature>InserirValidador.cs` em `Validadores/`
- [ ] `<Feature>EditarValidador.cs` em `Validadores/`

### 5. API
- [ ] `<Feature>Controller.cs` em `Controllers/<Feature>/`

### 6. IoC
- [ ] Registrar em `ConfiguracoesInjecoesDependencia.AddInjecoesDependencia`
- [ ] Registrar Profile em `ConfiguracoesAutoMapper`

## Ao Implementar Mudanças
- Conecte novos DTOs, perfis AutoMapper, comandos/filtros de domínio, repositórios e controllers mantendo o padrão (`<Feature>AppServico`, `<Feature>Repositorio`, `<Feature>Servicos`).
- Depois de criar um `Profile` AutoMapper, registre-o em `ConfiguracoesAutoMapper` para que o mapper singleton o carregue.
- Registre todo novo par interface/classe em `ConfiguracoesInjecoesDependencia.AddInjecoesDependencia`; ausências geram `InvalidOperationException` ao ativar controllers.
- Qualquer entidade ou propriedade nova que persista dados exige: atualizar a entidade de domínio, o `IEntityTypeConfiguration<T>` correspondente, criar Migration EF Core e atualizar os DTOs/mapeamentos AutoMapper.
- Reutilize os métodos de `RepositorioBase<T>` (`Query`, `Recuperar`, `Inserir`, `Editar`, `Excluir` e variantes async) em vez de criar acesso a dados customizado.
- Mantenha segredos (SQL Server, JWT, SMTP, AWS) fora do código usando `dotnet user-secrets`, variáveis de ambiente ou Docker secrets antes de rodar localmente ou em CI.

## Validações

### ⛔ DataAnnotations - PROIBIDO
**É EXPRESSAMENTE PROIBIDO** usar `System.ComponentModel.DataAnnotations` em DTOs.
Todas as validações devem ser feitas na camada de **Domínio**.

### Domínio (Exceções)
```csharp
throw new RegraDeNegocioExcecao("Mensagem");
entidade.ValidarRegistroNaoFoiEncontrado("Mensagem");
```

## Paginação

### Request
```csharp
public class <Feature>ListarRequest : PaginacaoFiltro
{
    // Qt = 10 (padrão), máx 100
    // Pg = 1 (inicia em 1)
    // CpOrd = campo ordenação
    // TpOrd = Asc/Desc
}
```

### Response
```csharp
PaginacaoConsulta<T>
{
    Registros: List<T>,
    Total: int
}
```

## Boas Práticas
- ✅ Seguir SOLID
- ✅ Separação de responsabilidades entre camadas
- ✅ Código limpo e legível
- ✅ Nomes significativos em português
- ✅ Encapsulamento de entidades (setters protected)
- ✅ Validações de negócio no domínio
- ✅ DTOs isolados de entidades
- ❌ NÃO acessar repositório diretamente do controller
- ❌ NÃO colocar lógica de negócio no AppServico
- ❌ NÃO expor entidades diretamente na API
- ❌ NÃO usar DataAnnotations em DTOs (validações no Domínio)

## Documentação por Camada
Para instruções detalhadas de cada camada, consulte:
- `.github/PADROES_DE_DESENVOLVIMENTO-API.md`
- `.github/PADROES_DE_DESENVOLVIMENTO-APLICACAO.md`
- `.github/PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md`
- `.github/PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`
- `.github/PADROES_DE_DESENVOLVIMENTO-INFRA.md`
- `.github/PADROES_DE_DESENVOLVIMENTO-IOC.md`
