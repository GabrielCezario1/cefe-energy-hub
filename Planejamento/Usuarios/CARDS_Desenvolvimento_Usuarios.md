# Cards de Desenvolvimento — Módulo Usuários

> **Projeto:** CEFE Energy Hub
>
> **Fontes:** `RELATORIO_Backend_Usuarios.md` e `RELATORIO_Frontend_Usuarios.md`
>
> **Padrões Backend:** pasta `padroes-desenvolvimento-back-end/`
>
> **Padrões Frontend:** arquivo `regras-projeto-angular.md`
>
> **Data:** Fevereiro/2026
>
> **⚠️ Este é o PRIMEIRO módulo a ser implementado.** Todos os artefatos são 🆕 (criados do zero). A infraestrutura base criada aqui (AppDbContext, RepositorioBase, JWT, IoC, Program.cs, TokenService, AuthGuard, authInterceptor) será reutilizada por todos os módulos seguintes.

---

## 🔵 Fase 1 — Fundação (Banco de Dados + Entidade)

> Criar toda a base de dados e a entidade antes de qualquer lógica. Sem banco, nada funciona.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` (entidades, comandos, interfaces de repositório), `PADROES_DE_DESENVOLVIMENTO-INFRA.md` (mapeamentos EF Core, RepositorioBase, AppDbContext, Migrations), `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (DTOs Request/Response).

### 1.1 — Entidade do Domínio

- [ ] **1.1.1 — 🆕 Criar entidade `Usuario`** ⏱️ `1.5h` — Campos: `Id` (int, PK, auto-increment), `Nome` (string, max 200, required), `Perfil` (string, max 50, default `'Cliente'`, required), `Email` (string, max 255, required, unique), `SenhaHash` (string, max 500, required), `EmailConfirmado` (bool, default false, required), `UrlFoto` (string?, max 500), `Bloqueado` (bool, default false, required), `Celular` (string?, max 20). Propriedades `virtual` com `protected set`. Construtor `protected Usuario() { }` (EF Core). Métodos: `SetNome(string)` com validação min 3 caracteres, `SetEmail(string)` com validação formato, `SetSenhaHash(string)`, `SetPerfil(string)` com validação valores válidos (`"Cliente"`, `"Admin"`), `SetUrlFoto(string?)`, `SetCelular(string?)`, `ConfirmarEmail()` → `EmailConfirmado = true`, `Bloquear()` → `Bloqueado = true`, `Desbloquear()` → `Bloqueado = false`. Validações via `RegraDeNegocioExcecao`.

### 1.2 — Interface de Repositório (Domínio)

- [ ] **1.2.1 — 🆕 Criar `IUsuariosRepositorio`** ⏱️ `0.25h` — Interface em `Usuarios/Repositorios/`. Herda comportamentos do `RepositorioBase<T>` (métodos `Query()`, `Recuperar`, `Inserir`, `Editar`, `Excluir`). Método adicional específico: `RecuperarPorEmailAsync(string email, CancellationToken ct)` → retorna `Usuario?` para validação de login e unicidade de e-mail.

### 1.3 — Comandos do Domínio

- [ ] **1.3.1 — 🆕 Criar comandos** ⏱️ `0.75h` — Seguir padrão de comandos conforme `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`:
  - `UsuariosRegistrarComando` — campos: Nome (string), Email (string), SenhaHash (string, já hashada pelo AppServico), Celular (string?)
  - `UsuariosEditarPerfilComando` — campos: Id (int), Nome (string), Celular (string?), UrlFoto (string?)
  - `UsuariosAlterarSenhaComando` — campos: Id (int), NovaSenhaHash (string, já hashada pelo AppServico)
  - `UsuariosAlterarPerfilTipoComando` — campos: Id (int, usuário alvo), Perfil (string), AdminId (int, quem executa)
  - `UsuariosConfirmarEmailComando` — campos: Id (int, extraído do token de propósito)

### 1.4 — DTOs (DataTransfer)

- [ ] **1.4.1 — 🆕 Criar Request DTOs** ⏱️ `0.75h` — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (SEM DataAnnotations):
  - `AuthRegistrarRequest` (Nome, Email, Senha, ConfirmarSenha, Celular?)
  - `AuthLoginRequest` (Email, Senha)
  - `AuthConfirmarEmailRequest` (Token)
  - `AuthEsqueciSenhaRequest` (Email)
  - `AuthRedefinirSenhaRequest` (Token, NovaSenha, ConfirmarNovaSenha)
  - `UsuariosEditarPerfilRequest` (Nome, Celular?, UrlFoto?)
  - `UsuariosAlterarSenhaRequest` (SenhaAtual, NovaSenha, ConfirmarNovaSenha)
  - `UsuariosAlterarPerfilTipoRequest` (Perfil)

- [ ] **1.4.2 — 🆕 Criar Response DTOs** ⏱️ `0.5h` — Seguir `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md`:
  - `AuthRegistrarResponse` (Mensagem: string)
  - `AuthLoginResponse` (Token: string, Expiracao: DateTime, Usuario: AuthUsuarioResponse)
  - `AuthUsuarioResponse` (Id, Nome, Email, Perfil)
  - `UsuarioPerfilResponse` (Id, Nome, Email, Perfil, Celular, UrlFoto, EmailConfirmado)

### 1.5 — Infraestrutura (EF Core)

- [ ] **1.5.1 — 🆕 Criar `RepositorioBase<T>`** ⏱️ `1h` — Base genérica reutilizável em `Comum/Repositorios/`. Primeira implementação do sistema — todos os módulos futuros herdarão. Métodos síncronos: `Inserir(T)`, `Editar(T)`, `Excluir(T)`, `Recuperar(long id)`, `Recuperar(Expression<Func<T, bool>>)`, `Query()`. Métodos assíncronos: `InserirAsync`, `EditarAsync`, `ExcluirAsync`, `RecuperarAsync`. Injetar `AppDbContext` via construtor. Chamar `_context.SaveChangesAsync(ct)` em cada operação de escrita.

- [ ] **1.5.2 — 🆕 Criar `AppDbContext`** ⏱️ `0.5h` — Primeiro `DbContext` do sistema em `Contexto/`. Registrar: `DbSet<Usuario> Usuarios { get; set; }`. `OnModelCreating` com `modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)` para auto-descoberta de mapeamentos. Módulos futuros apenas adicionarão novos `DbSet`.

- [ ] **1.5.3 — 🆕 Criar `UsuarioConfiguration`** ⏱️ `0.5h` — Implementar `IEntityTypeConfiguration<Usuario>` conforme `PADROES_DE_DESENVOLVIMENTO-INFRA.md`. Tabela `usuarios`. Mapeamentos: `id` (PK, auto-increment), `nome` (max 200, required), `perfil` (max 50, default `'Cliente'`, required), `email` (max 255, required), `senha_hash` (max 500, required), `email_confirmado` (default false, required), `url_foto` (max 500, nullable), `bloqueado` (default false, required), `celular` (max 20, nullable). Índice UNIQUE: `IX_Usuario_Email` em `(Email)`.

- [ ] **1.5.4 — 🆕 Criar `UsuariosRepositorio`** ⏱️ `0.5h` — Implementação em `Usuarios/Repositorios/`. Herda `RepositorioBase<Usuario>`. Implementa método `RecuperarPorEmailAsync(string email, CancellationToken ct)` usando `Query().FirstOrDefaultAsync(u => u.Email == email, ct)`.

- [ ] **1.5.5 — 🆕 Criar primeira Migration** ⏱️ `0.5h` — `dotnet ef migrations add CriarTabelaUsuarios --project <Projeto>.Infra --startup-project <Projeto>.Api`. Primeira migration do sistema — cria tabela `usuarios` com 9 colunas e índice UNIQUE em `email`. Revisar SQL gerado, confirmar tipos e defaults. Aplicar com `dotnet ef database update`.

> **Subtotal Fase 1: ⏱️ 6.75h (~1 dia)**

---

## 🟢 Fase 2 — Regras de Negócio (Serviços de Domínio + Aplicação)

> Criar a lógica de autenticação e gestão de usuários antes de expor em APIs. Permite testar unitariamente sem dependência de controllers.
> Seguir padrões de: `PADROES_DE_DESENVOLVIMENTO-DOMINIO.md` (serviços e interfaces), `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md` (AppServicos, AutoMapper Profiles), `PADROES_DE_DESENVOLVIMENTO-IOC.md` (registro no IoC).

### 2.1 — Serviço de Domínio

- [ ] **2.1.1 — 🆕 Criar `IUsuariosServicos` e `UsuariosServicos`** ⏱️ `3h` — Interface em `Usuarios/Servicos/Interfaces/`, implementação em `Usuarios/Servicos/`. Injetar `IUsuariosRepositorio`. Métodos:
  - `RegistrarAsync(UsuariosRegistrarComando comando)` → valida e-mail único via `RecuperarPorEmailAsync`, cria entidade `Usuario` com perfil `'Cliente'` e `email_confirmado = false`, chama `InserirAsync`. Retorna `Usuario`. **Não conhece hash nem JWT** — recebe `SenhaHash` já processada.
  - `ValidarCredenciaisAsync(string email)` → busca `Usuario` por e-mail. Valida: existe? `bloqueado == false`? `email_confirmado == true`? Retorna `Usuario` ou lança `RegraDeNegocioExcecao` com mensagem específica.
  - `ConfirmarEmailAsync(UsuariosConfirmarEmailComando comando)` → busca `Usuario` por `Id`, chama `ConfirmarEmail()`. Se já confirmado, ignora (idempotente).
  - `EditarPerfilAsync(UsuariosEditarPerfilComando comando)` → busca `Usuario` por `Id`, chama `SetNome`, `SetCelular`, `SetUrlFoto`. Retorna `Usuario`.
  - `AlterarSenhaAsync(UsuariosAlterarSenhaComando comando)` → busca `Usuario` por `Id`, chama `SetSenhaHash(NovaSenhaHash)`. **Não verifica senha atual** — essa responsabilidade é do AppServico (que tem acesso ao `PasswordHasher`).
  - `AlterarPerfilTipoAsync(UsuariosAlterarPerfilTipoComando comando)` → valida: `AdminId != Id` (Admin não pode se rebaixar), valida `Perfil` é valor válido (`"Cliente"` ou `"Admin"`), busca `Usuario` por `Id`, chama `SetPerfil(Perfil)`.
  - `RecuperarPorIdAsync(int id)` → busca `Usuario` por `Id`. Retorna ou lança exceção se não encontrado.

### 2.2 — Serviço de Aplicação (Auth)

- [ ] **2.2.1 — 🆕 Criar `IAuthAppServico` e `AuthAppServico`** ⏱️ `3h` — Seguir `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md`. Injetar `IUsuariosServicos`, `IJwtServico`, `IEmailServico`, `PasswordHasher<Usuario>`, `IMapper` (AutoMapper). Orquestra os fluxos de autenticação:
  - `RegistrarAsync(AuthRegistrarRequest request)` → valida `Senha == ConfirmarSenha`, hash senha via `PasswordHasher.HashPassword(null, request.Senha)`, monta `UsuariosRegistrarComando`, chama `UsuariosServicos.RegistrarAsync`, gera token de confirmação via `JwtServico.GerarTokenConfirmacaoEmail(usuario)`, envia e-mail via `EmailServico.EnviarEmailConfirmacaoAsync`. Retorna `AuthRegistrarResponse`.
  - `LoginAsync(AuthLoginRequest request)` → chama `UsuariosServicos.ValidarCredenciaisAsync(email)`, verifica senha via `PasswordHasher.VerifyHashedPassword(usuario, usuario.SenhaHash, request.Senha)`, se `Failed` → erro, gera JWT via `JwtServico.GerarTokenAutenticacao(usuario)`, mapeia `usuario → AuthUsuarioResponse`. Retorna `AuthLoginResponse`.
  - `ConfirmarEmailAsync(AuthConfirmarEmailRequest request)` → chama `JwtServico.ValidarTokenPurpose(token, "confirm-email")`, se `null` → erro 400, monta `UsuariosConfirmarEmailComando`, chama `UsuariosServicos.ConfirmarEmailAsync`.
  - `EsqueciSenhaAsync(AuthEsqueciSenhaRequest request)` → busca usuario por e-mail. Se existe: gera token via `JwtServico.GerarTokenRedefinicaoSenha(usuario)`, envia e-mail via `EmailServico.EnviarEmailRedefinicaoSenhaAsync`. Se não existe: **não faz nada** (retorna 200 normalmente por segurança).
  - `RedefinirSenhaAsync(AuthRedefinirSenhaRequest request)` → valida `NovaSenha == ConfirmarNovaSenha`, chama `JwtServico.ValidarTokenPurpose(token, "reset-password")`, se `null` → erro 400, hash nova senha, monta `UsuariosAlterarSenhaComando`, chama `UsuariosServicos.AlterarSenhaAsync`.

### 2.3 — Serviço de Aplicação (Usuarios)

- [ ] **2.3.1 — 🆕 Criar `IUsuariosAppServico` e `UsuariosAppServico`** ⏱️ `1.5h` — Seguir `PADROES_DE_DESENVOLVIMENTO-APLICACAO.md`. Injetar `IUsuariosServicos`, `PasswordHasher<Usuario>`, `IMapper`. Métodos:
  - `RecuperarPerfilAsync(int userId)` → chama `UsuariosServicos.RecuperarPorIdAsync(userId)`, mapeia → `UsuarioPerfilResponse`.
  - `EditarPerfilAsync(int userId, UsuariosEditarPerfilRequest request)` → monta `UsuariosEditarPerfilComando`, chama `UsuariosServicos.EditarPerfilAsync`, mapeia → `UsuarioPerfilResponse`.
  - `AlterarSenhaAsync(int userId, UsuariosAlterarSenhaRequest request)` → valida `NovaSenha == ConfirmarNovaSenha`, recupera usuario, verifica senha atual via `PasswordHasher.VerifyHashedPassword`, se `Failed` → erro, hash nova senha, monta `UsuariosAlterarSenhaComando`, chama `UsuariosServicos.AlterarSenhaAsync`.
  - `AlterarPerfilTipoAsync(int adminId, int userId, UsuariosAlterarPerfilTipoRequest request)` → monta `UsuariosAlterarPerfilTipoComando` com `AdminId`, chama `UsuariosServicos.AlterarPerfilTipoAsync`.

### 2.4 — AutoMapper Profiles

- [ ] **2.4.1 — 🆕 Criar `AuthProfile` e `UsuariosProfile`** ⏱️ `0.5h` — Profiles em `Aplicacao/Auth/Profiles/` e `Aplicacao/Usuarios/Profiles/`. Mapeamentos:
  - `AuthProfile`: `Usuario → AuthUsuarioResponse`
  - `UsuariosProfile`: `Usuario → UsuarioPerfilResponse`
  
  Mapeamentos manuais para `AuthLoginResponse` e `AuthRegistrarResponse` (dados calculados no AppServico, não 1:1 com entidade).

> **Subtotal Fase 2: ⏱️ 8h (~1 dia)**

---

## 🟡 Fase 3 — Serviços Transversais (JWT + Email + Configuração)

> Os serviços transversais (JWT e Email) são utilizados pelos AppServicos e dependem da configuração do `Program.cs`. Devem existir antes dos Controllers.
> **⚠️ Nota:** Este módulo **NÃO possui Jobs** de coleta de dados. A Fase 3 substitui "Jobs de Coleta" por "Serviços Transversais", que cumprem papel análogo de infraestrutura necessária antes da exposição via API.

### 3.1 — Serviço JWT

- [ ] **3.1.1 — 🆕 Criar `IJwtServico` e `JwtServico`** ⏱️ `2h` — Interface em `Dominio/Servicos/Interfaces/IJwtServico.cs`. Implementação em `Infra/Servicos/JwtServico.cs`. Injetar `IOptions<JwtSettings>`. Usa `System.IdentityModel.Tokens.Jwt` e `Microsoft.IdentityModel.Tokens`. 4 métodos:
  - `GerarTokenAutenticacao(Usuario usuario)` → JWT de 8h. Claims: `sub` (userId), `email`, `perfil`, `nome`. Sem claim `purpose`. Assinado com `HmacSha256` usando `JwtSettings.Secret`.
  - `GerarTokenConfirmacaoEmail(Usuario usuario)` → JWT de 24h. Claims: `sub` (userId), `email`, `purpose=confirm-email`. Mesma Secret key.
  - `GerarTokenRedefinicaoSenha(Usuario usuario)` → JWT de 1h. Claims: `sub` (userId), `email`, `purpose=reset-password`. Mesma Secret key.
  - `ValidarTokenPurpose(string token, string purposeEsperado)` → Valida assinatura, verifica `exp` não expirado, verifica claim `purpose == purposeEsperado`. Retorna `int? userId` (`sub` do token) se válido, `null` se inválido/expirado/purpose diferente. Usa `TokenValidationParameters` com `ValidateLifetime = true`.

### 3.2 — Serviço de Email

- [ ] **3.2.1 — 🆕 Criar `IEmailServico` e `EmailServico`** ⏱️ `1.5h` — Interface em `Dominio/Servicos/Interfaces/IEmailServico.cs`. Implementação em `Infra/Servicos/EmailServico.cs`. Injetar `IOptions<SmtpSettings>`, `IOptions<AppSettings>`. Pacote NuGet: `MailKit`. 2 métodos:
  - `EnviarEmailConfirmacaoAsync(string email, string nome, string token)` → Monta link: `{AppSettings.FrontendUrl}/confirmar-email?t={token}`. Template HTML com saudação personalizada, botão com link. Envia via `SmtpClient` do MailKit com `SecureSocketOptions.StartTls`.
  - `EnviarEmailRedefinicaoSenhaAsync(string email, string nome, string token)` → Monta link: `{AppSettings.FrontendUrl}/redefinir-senha?t={token}`. Template HTML com instrução de redefinição, botão com link. Mesmo padrão de envio.
  
  Tratamento de erro: logar falha de envio, lançar exceção para que o controller retorne erro.

### 3.3 — Configuração do Program.cs

- [ ] **3.3.1 — 🆕 Configurar `Program.cs`** ⏱️ `1.5h` — Primeira configuração do pipeline da aplicação. Inclui:
  - `builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"))` — bind das settings JWT
  - `builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"))` — bind das settings SMTP
  - `builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"))` — bind da FrontendUrl
  - `builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => ...)` — validar JWT com `IssuerSigningKey`, `ValidIssuer`, `ValidAudience`, `ValidateLifetime`
  - `builder.Services.AddAuthorization()`
  - `builder.Services.AddCors(options => ...)` — liberar frontends implantados
  - `builder.Services.AddEndpointsApiExplorer()` + `builder.Services.AddSwaggerGen(c => ...)` — Swagger com suporte a `Authorization: Bearer`
  - `app.UseAuthentication()` + `app.UseAuthorization()` — middlewares na ordem correta
  - `AddDbContext()` via `ConfiguracoesDbContext`
  - `AddInjecoesDependencia()` via `ConfiguracoesInjecoesDependencia`
  - `AddAutoMapper()` via `ConfiguracoesAutoMapper`

### 3.4 — Registro no IoC

- [ ] **3.4.1 — 🆕 Criar arquivos de IoC** ⏱️ `0.5h` — Seguir `PADROES_DE_DESENVOLVIMENTO-IOC.md`:
  - `ConfiguracoesDbContext.cs` — `services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString))`
  - `ConfiguracoesInjecoesDependencia.cs` — registrar:
    ```
    services.AddScoped<IUsuariosRepositorio, UsuariosRepositorio>();
    services.AddScoped<IUsuariosServicos, UsuariosServicos>();
    services.AddScoped<IAuthAppServico, AuthAppServico>();
    services.AddScoped<IUsuariosAppServico, UsuariosAppServico>();
    services.AddScoped<IJwtServico, JwtServico>();
    services.AddScoped<IEmailServico, EmailServico>();
    services.AddSingleton<PasswordHasher<Usuario>>();
    ```
  - `ConfiguracoesAutoMapper.cs` — registrar `AuthProfile` e `UsuariosProfile`

> **Subtotal Fase 3: ⏱️ 5.5h (~0.75 dia)**

---

## 🔴 Fase 4 — API Endpoints (Controllers)

> Os Controllers expõem a lógica criada nas fases anteriores. Dependem de todos os serviços.
> Seguir `PADROES_DE_DESENVOLVIMENTO-API.md` (rotas, verbos, retornos) e `PADROES_DE_DESENVOLVIMENTO-DATATRANSFER.md` (DTOs).

- [ ] **4.1 — 🆕 Criar `AuthController`** ⏱️ `2h` — Em `Controllers/Auth/AuthController.cs`. Atributos: `[Route("api/auth")]`, `[ApiController]`, `[AllowAnonymous]`. Injetar `IAuthAppServico`. 5 endpoints:

  - `[HttpPost("registrar")]` → `Registrar([FromBody] AuthRegistrarRequest request)` → retorna `AuthRegistrarResponse` com mensagem de confirmação

  - `[HttpPost("login")]` → `Login([FromBody] AuthLoginRequest request)` → retorna `AuthLoginResponse` com token JWT (8h), data de expiração e dados do usuário

  - `[HttpPost("confirmar-email")]` → `ConfirmarEmail([FromBody] AuthConfirmarEmailRequest request)` → retorna 200 OK (sem corpo). Erro 400 se token inválido/expirado

  - `[HttpPost("esqueci-senha")]` → `EsqueciSenha([FromBody] AuthEsqueciSenhaRequest request)` → retorna **sempre 200 OK** (mesmo se e-mail não existir — prevenção de enumeração)

  - `[HttpPost("redefinir-senha")]` → `RedefinirSenha([FromBody] AuthRedefinirSenhaRequest request)` → retorna 200 OK (sem corpo). Erro 400 se token inválido/expirado

- [ ] **4.2 — 🆕 Criar `UsuariosController`** ⏱️ `2h` — Em `Controllers/Usuarios/UsuariosController.cs`. Atributos: `[Route("api/usuarios")]`, `[ApiController]`, `[Authorize]`. Injetar `IUsuariosAppServico`. 4 endpoints:

  - `[HttpGet("perfil")]` → `RecuperarPerfil()` → extrai `userId` do JWT via `User.FindFirstValue(ClaimTypes.NameIdentifier)`. Retorna `UsuarioPerfilResponse`

  - `[HttpPut("perfil")]` → `EditarPerfil([FromBody] UsuariosEditarPerfilRequest request)` → extrai `userId` do JWT. Retorna `UsuarioPerfilResponse` atualizado

  - `[HttpPut("alterar-senha")]` → `AlterarSenha([FromBody] UsuariosAlterarSenhaRequest request)` → extrai `userId` do JWT. Retorna 200 OK. Erro 400 se senha atual incorreta

  - `[HttpPut("{id}/perfil-tipo")]` → `AlterarPerfilTipo(int id, [FromBody] UsuariosAlterarPerfilTipoRequest request)` → extrai `adminId` do JWT. Verifica claim `perfil == "Admin"`, se não → 403 Forbidden. Retorna 200 OK. Erro 400 se Admin tentar alterar próprio perfil

> **Subtotal Fase 4: ⏱️ 4h (~0.5 dia)**

---

## 🟣 Fase 5 — Infraestrutura Azure

> Pode ser paralelizada com as Fases 1–3, mas só é necessária para deploy em produção.

- [ ] **5.1 — 🆕 Configurar Azure SQL Database** ⏱️ `1h` — Se já existir instância compartilhada (outros projetos), apenas criar o banco de dados. Se nova: criar instância Azure SQL (Standard S0), configurar firewall, gerar connection string. Aplicar migration: `dotnet ef database update` apontando para o banco Azure. Verificar tabela `usuarios` + índice UNIQUE em `email`.

- [ ] **5.2 — 🆕 Configurar Azure App Service** ⏱️ `1.5h` — Criar App Service Plan (.NET 10). Configurar variáveis de ambiente: `ConnectionStrings:DefaultConnection` (SQL Server), `JwtSettings:Secret` (chave JWT 256-bit), `SmtpSettings:*` (credenciais SMTP), `AppSettings:FrontendUrl`. Configurar deploy (CI/CD ou manual). Habilitar HTTPS only.

> **Subtotal Fase 5: ⏱️ 2.5h (~0.25 dia)** _(mínima — não há Jobs, Blob Storage ou WebJobs neste módulo)_

---

## ⚪ Fase 6 — Frontend Angular

> Frontend em Angular 21 com Tailwind CSS. Seguir integralmente os padrões de `regras-projeto-angular.md` e as definições do `RELATORIO_Frontend_Usuarios.md`.
>
> **⚠️ Todos os artefatos de autenticação (TokenService, AuthStateService, AuthGuard, authInterceptor, environment, app.config.ts) são criados aqui pela primeira vez.** Módulos futuros reutilizarão diretamente.

### 6.1 — Scaffold e Configuração

- [ ] **6.1.1 — 🆕 Configurar `environment.ts` e `environment.prod.ts`** ⏱️ `0.25h` — Primeira configuração de ambiente do frontend. `apiBaseUrl` para dev (`http://localhost:5000/api`) e prod.

- [ ] **6.1.2 — 🆕 Configurar `app.config.ts`** ⏱️ `0.25h` — Primeira configuração da aplicação Angular: `provideZoneChangeDetection`, `provideRouter(routes)`, `provideAnimations`, `provideHttpClient(withInterceptors([authInterceptor]))`.

- [ ] **6.1.3 — 🆕 Configurar `app.routes.ts`** ⏱️ `0.5h` — Criar todas as rotas do módulo: `/login`, `/registrar`, `/confirmar-email`, `/esqueci-senha`, `/redefinir-senha`, `/select-unit` (com `authGuard`), `/dashboard/perfil` (com `authGuard`). Usar `loadComponent` para lazy loading.

### 6.2 — Core (Autenticação)

- [ ] **6.2.1 — 🆕 Criar `TokenService`** ⏱️ `1h` — Em `core/token.service.ts`. Primeiro serviço de autenticação do sistema. Responsabilidades: salvar/obter/remover JWT em `sessionStorage`. Validar expiração (`exp` claim). Decodificar claims (`sub`, `email`, `perfil`, `nome`). Método `isTokenValido()` verificado pelo `AuthGuard`.

- [ ] **6.2.2 — 🆕 Criar `AuthStateService`** ⏱️ `0.75h` — Em `core/auth-state.service.ts`. `BehaviorSubject<IAuthUsuario | null>`. Métodos: `login(token, usuario)` → salva token + emite estado, `logout()` → remove token + emite `null` + redireciona `/login`, `inicializar()` → restaura estado do `sessionStorage` ao carregar app.

- [ ] **6.2.3 — 🆕 Criar `authGuard`** ⏱️ `0.5h` — Em `guards/auth.guard.ts`. `CanActivateFn`. Verifica `TokenService.isTokenValido()`. Se válido → `true`. Se inválido → `router.navigate(['/login'])` → `false`.

- [ ] **6.2.4 — 🆕 Criar `authInterceptor`** ⏱️ `0.75h` — Em `interceptors/auth.interceptor.ts`. `HttpInterceptorFn`. Injeta `Bearer {token}` no header `Authorization` se token existir. Captura `HttpErrorResponse` com `status === 401` → chama `authStateService.logout()`.

### 6.3 — Models (Tipagem)

- [ ] **6.3.1 — 🆕 Criar interfaces de Response** ⏱️ `0.5h` — Seguir `regras-projeto-angular.md` (interfaces com prefixo `I`, propriedades `camelCase`). Em `models/responses/`:
  - `IAuthLogin` (token, expiracao, usuario: IAuthUsuario)
  - `IAuthUsuario` (id, nome, email, perfil)
  - `IAuthRegistrar` (mensagem)
  - `IUsuarioPerfil` (id, nome, email, perfil, celular, urlFoto, emailConfirmado)

- [ ] **6.3.2 — 🆕 Criar classes de Request** ⏱️ `0.5h` — Seguir `regras-projeto-angular.md` (classes com sufixo `Request`, propriedades `PascalCase`). Em `models/requests/`:
  - `AuthRegistrarRequest`, `AuthLoginRequest`, `AuthConfirmarEmailRequest`, `AuthEsqueciSenhaRequest`, `AuthRedefinirSenhaRequest`, `UsuariosEditarPerfilRequest`, `UsuariosAlterarSenhaRequest`, `UsuariosAlterarPerfilTipoRequest`

### 6.4 — Serviços

- [ ] **6.4.1 — 🆕 Criar `AuthService`** ⏱️ `0.75h` — Em `services/auth.service.ts`. `inject(HttpClient)`, `providedIn: 'root'`. URL via `environment.apiBaseUrl + '/auth'`. 5 métodos: `registrar()`, `login()`, `confirmarEmail()`, `esqueciSenha()`, `redefinirSenha()`.

- [ ] **6.4.2 — 🆕 Criar `UsuarioService`** ⏱️ `0.5h` — Em `services/usuario.service.ts`. URL via `environment.apiBaseUrl + '/usuarios'`. 4 métodos: `recuperarPerfil()`, `editarPerfil()`, `alterarSenha()`, `alterarPerfilTipo()`.

### 6.5 — Formulários (Reactive Forms)

- [ ] **6.5.1 — 🆕 Criar configurações de formulários** ⏱️ `1h` — Em `formularios/`. Seguir `regras-projeto-angular.md` (seção Reactive Forms). 6 formulários:
  - `login.formulario.ts` — campos: email (required, email), senha (required)
  - `registrar.formulario.ts` — campos: nome (required, minLength 3), email (required, email), senha (required, minLength 6), confirmarSenha (required, custom validator igualdade), celular (optional)
  - `esqueci-senha.formulario.ts` — campos: email (required, email)
  - `redefinir-senha.formulario.ts` — campos: novaSenha (required, minLength 6), confirmarNovaSenha (required, custom validator)
  - `editar-perfil.formulario.ts` — campos: nome (required, minLength 3), celular (optional), urlFoto (optional)
  - `alterar-senha.formulario.ts` — campos: senhaAtual (required), novaSenha (required, minLength 6), confirmarNovaSenha (required, custom validator)

### 6.6 — Componentes Reutilizáveis

- [ ] **6.6.1 — 🆕 Criar `AuthCardComponent`** ⏱️ `0.5h` — Em `components/auth/auth-card/`. Standalone. Card com: logo CEFE centralizado, título customizável via `@Input()`, slot via `<ng-content>` para conteúdo do formulário. Estilização: `w-full max-w-md shadow-xl rounded-2xl bg-white p-8`. Reutilizado em todas as telas de autenticação (login, registrar, esqueci-senha, redefinir-senha).

- [ ] **6.6.2 — 🆕 Criar `MensagemResultadoComponent`** ⏱️ `0.25h` — Em `components/auth/mensagem-resultado/`. Standalone. Inputs: `tipo: 'sucesso' | 'erro'`, `mensagem: string`, `linkTexto?: string`, `linkUrl?: string`. Ícone: `✓` verde para sucesso, `✗` vermelho para erro. Reutilizado em confirmar-email e redefinir-senha.

### 6.7 — Pages

- [ ] **6.7.1 — 🆕 Criar `LoginComponent`** ⏱️ `1.5h` — Em `pages/login/`. Page standalone. Reactive Form (email, senha). Chama `AuthService.login()`. No sucesso: `AuthStateService.login(token, usuario)` → `router.navigate(['/select-unit'])`. Tratamento de erro: `obterMensagemErro()`. Links para "Esqueci senha" e "Criar conta". Usa `AuthCardComponent`.

- [ ] **6.7.2 — 🆕 Criar `RegistrarComponent`** ⏱️ `1.5h` — Em `pages/registrar/`. Reactive Form (nome, email, senha, confirmarSenha, celular). Validação cross-field (senha == confirmarSenha). Chama `AuthService.registrar()`. No sucesso: exibe `MensagemResultadoComponent` com mensagem de verificar e-mail. Usa `AuthCardComponent`.

- [ ] **6.7.3 — 🆕 Criar `ConfirmarEmailComponent`** ⏱️ `0.75h` — Em `pages/confirmar-email/`. Lê query param `t` via `ActivatedRoute.queryParamMap`. Chama `AuthService.confirmarEmail(token)` no `ngOnInit`. Exibe spinner enquanto carrega. Sucesso/erro via `MensagemResultadoComponent`.

- [ ] **6.7.4 — 🆕 Criar `EsqueciSenhaComponent`** ⏱️ `0.75h` — Em `pages/esqueci-senha/`. Reactive Form (email). Chama `AuthService.esqueciSenha()`. No sucesso: exibe mensagem genérica (segurança). Usa `AuthCardComponent`.

- [ ] **6.7.5 — 🆕 Criar `RedefinirSenhaComponent`** ⏱️ `1h` — Em `pages/redefinir-senha/`. Lê query param `t` via `ActivatedRoute`. Reactive Form (novaSenha, confirmarNovaSenha). Chama `AuthService.redefinirSenha()`. Sucesso/erro via `MensagemResultadoComponent`. Usa `AuthCardComponent`.

- [ ] **6.7.6 — 🆕 Criar `PerfilComponent`** ⏱️ `2h` — Em `pages/dashboard/perfil/`. Page standalone protegida por `AuthGuard`. Carrega `UsuarioService.recuperarPerfil()` no `ngOnInit`. Exibe dados em card. Seção 1: editar nome, celular, foto (Reactive Form). Seção 2: alterar senha (Reactive Form separado com senha atual + nova + confirmar). Flags: `carregando`, `salvando`, `alterandoSenha`. Tratamento de erros com `obterMensagemErro()`. Responsivo via Tailwind (`grid-cols-1 md:grid-cols-2`).

### 6.8 — Qualidade e Finalização

- [ ] **6.8.1 — 🆕 Implementar tratamento de erros** ⏱️ `0.5h` — Implementar `obterMensagemErro()` em cada page conforme `regras-projeto-angular.md`. Prioridade: `erro?.error?.mensagem` → `erro?.error` (string) → `erro?.message` → mensagem padrão. Tratar 401 no interceptor. Tratar 400 (validação) com mensagem do backend.

- [ ] **6.8.2 — 🆕 Responsividade** ⏱️ `0.75h` — Testar em desktop (1920px), tablet (768px) e mobile (375px). Telas de auth: card centralizado responsivo (`max-w-md`). Tela de perfil: `grid-cols-1 md:grid-cols-2`. Formulários: `w-full` em todos os breakpoints.

> **Subtotal Fase 6: ⏱️ 16.5h (~2 dias)**

---

## 📊 Resumo Total de Esforço

| Fase | Horas | Dias (úteis, 8h/dia) |
|---|---|---|
| 🔵 Fase 1 — Banco de Dados + Entidade | 6.75h | ~1 dia |
| 🟢 Fase 2 — Regras de Negócio (Serviços) | 8h | ~1 dia |
| 🟡 Fase 3 — Serviços Transversais (JWT + Email + Config) | 5.5h | ~0.75 dia |
| 🔴 Fase 4 — API Endpoints (Controllers) | 4h | ~0.5 dia |
| 🟣 Fase 5 — Infraestrutura Azure | 2.5h | ~0.25 dia |
| ⚪ Fase 6 — Frontend Angular | 16.5h | ~2 dias |
| **TOTAL** | **43.25h** | **~5.5 dias úteis (~1 semana)** |

### Observações

- **Paralelismo possível:** Fase 5 (Azure) pode ser executada em paralelo com Fases 1–3. Fase 6 (Frontend) pode iniciar após Fase 4 (API pronta) — ou antes, usando dados mock e login simulado.
- **Sem Jobs:** Este módulo não possui processos automáticos (WebJobs). A Fase 3 cobre os serviços transversais (JWT + Email) que substituem essa necessidade.
- **Módulo fundacional:** Este é o primeiro módulo do sistema. O tempo inclui a criação de infraestrutura base (AppDbContext, RepositorioBase, Program.cs, IoC, environment, AuthGuard, authInterceptor) que será reutilizada por todos os módulos seguintes. Módulos subsequentes serão mais rápidos.
- **Maior risco:** Configuração do SMTP (MailKit) — depende de credenciais válidas e configuração de servidor de e-mail. Testar envio em ambiente de desenvolvimento antes de deploy.
- **Dependência externa:** Servidor SMTP para envio de e-mails (confirmação de conta e recuperação de senha). Se indisponível, registro e recuperação de senha ficam comprometidos.
- **Segurança:** A Secret key JWT e as credenciais SMTP devem ser armazenadas via `dotnet user-secrets` (dev) ou variáveis de ambiente (prod). Nunca commitar no repositório.
