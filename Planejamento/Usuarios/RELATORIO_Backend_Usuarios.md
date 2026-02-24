# Relatório — Backend do Módulo de Usuários

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
> **⚠️ Este é o PRIMEIRO módulo a ser implementado.** Todos os demais módulos (Gerenciamento de Energia, Monitoramento & Geração, Telemetria, Gestão Financeira, Comunicação) dependem dos artefatos criados aqui: entidade `Usuario`, autenticação JWT, `PasswordHasher`, `AuthController`, configuração do `AppDbContext`, `RepositorioBase<T>`, IoC base e `Program.cs`. Artefatos transversais criados neste módulo serão **reutilizados** (✅) pelos módulos seguintes.

---

## 1. Visão Geral do Módulo

O módulo de **Usuários** é transversal a todo o sistema. Responsável pelo cadastro de usuários, autenticação (login), confirmação de e-mail, recuperação de senha, gestão de perfil e controle de acesso por perfil (`Cliente` / `Admin`). Todos os endpoints protegidos dos demais módulos dependem do JWT emitido por este módulo.

| Funcionalidade | Descrição |
| --- | --- |
| **Registro** | Cadastro de novo usuário com perfil padrão `Cliente`. Envia e-mail de confirmação. |
| **Login** | Autenticação via e-mail + senha. Retorna JWT (8h) com claims `userId`, `email`, `perfil`, `nome`. |
| **Confirmação de E-mail** | Valida token de propósito (`purpose=confirm-email`, 24h) e marca `email_confirmado = true`. |
| **Esqueci Minha Senha** | Envia e-mail com link de redefinição (token `purpose=reset-password`, 1h). Retorna 200 OK mesmo se e-mail não existir (segurança). |
| **Redefinição de Senha** | Valida token de propósito e atualiza `senha_hash`. |
| **Consulta de Perfil** | Retorna dados do usuário logado (JWT). |
| **Edição de Perfil** | Atualiza `nome`, `celular`, `url_foto` do usuário logado. |
| **Alteração de Senha** | Requer senha atual para definir nova senha. |
| **Alteração de Perfil (Admin)** | Admin pode alterar o `perfil` de outro usuário. Admin não pode rebaixar a si mesmo. |

### Restrições de Acesso

- Endpoints de autenticação (`api/auth/*`) são **públicos** (`[AllowAnonymous]`).
- Endpoints de usuário (`api/usuarios/*`) requerem **JWT válido** (`[Authorize]`).
- Endpoint de alteração de perfil (`PUT api/usuarios/{id}/perfil-tipo`) requer **perfil Admin**.
- Não há filtro por `usinaId` neste módulo — os dados de usuário são globais.

---

## 2. Funcionalidades do Backend

### 2.1 — Registro de Usuário

| Dado | Fonte / Cálculo |
| --- | --- |
| **Nome** | Informado pelo usuário no cadastro |
| **E-mail** | Informado pelo usuário. Deve ser **único** (validação no domínio). |
| **Senha** | Informada pelo usuário. Hashada com `PasswordHasher<Usuario>` nativo do .NET (`Microsoft.AspNetCore.Identity`). |
| **Perfil** | Sempre `'Cliente'` no registro. Somente Admin pode alterar. |
| **E-mail Confirmado** | `false` ao registrar. Torna-se `true` ao confirmar via token. |
| **Token de Confirmação** | JWT assinado com `purpose=confirm-email` (24h). Enviado por e-mail via MailKit. **Sem persistência no banco.** |

### 2.2 — Login

| Dado | Fonte / Cálculo |
| --- | --- |
| **Validação de E-mail** | Busca `Usuario` por e-mail no banco. Se não encontrado → erro. |
| **Validação de Bloqueio** | Se `bloqueado = true` → erro "Conta bloqueada". |
| **Validação de Confirmação** | Se `email_confirmado = false` → erro "E-mail não confirmado". |
| **Validação de Senha** | `PasswordHasher<Usuario>.VerifyHashedPassword()`. Se falhar → erro "Credenciais inválidas". |
| **Token JWT** | Gerado pelo `IJwtServico.GerarTokenAutenticacao(usuario)`. Duração: 8h. Claims: `userId`, `email`, `perfil`, `nome`. |

### 2.3 — Confirmação de E-mail

| Dado | Fonte / Cálculo |
| --- | --- |
| **Token** | JWT com `purpose=confirm-email` recebido via body. |
| **Validação** | `IJwtServico.ValidarTokenPurpose(token, "confirm-email")` → retorna `userId` ou `null`. |
| **Ação** | Se válido: busca `Usuario` por `userId`, seta `email_confirmado = true`. Se inválido: erro 400. |

### 2.4 — Esqueci Minha Senha

| Dado | Fonte / Cálculo |
| --- | --- |
| **E-mail** | Informado pelo usuário. |
| **Busca** | Verifica se existe `Usuario` com o e-mail informado. |
| **Token** | Se existe: gera JWT com `purpose=reset-password` (1h) via `IJwtServico.GerarTokenRedefinicaoSenha(usuario)`. |
| **E-mail enviado** | Se existe: envia link de redefinição via `IEmailServico.EnviarEmailRedefinicaoSenhaAsync()`. |
| **Resposta** | **Sempre 200 OK**, independente de o e-mail existir ou não (prevenção de enumeração de contas). |

### 2.5 — Redefinição de Senha

| Dado | Fonte / Cálculo |
| --- | --- |
| **Token** | JWT com `purpose=reset-password` recebido via body. |
| **Validação** | `IJwtServico.ValidarTokenPurpose(token, "reset-password")` → retorna `userId` ou `null`. |
| **Nova Senha** | Hashada com `PasswordHasher<Usuario>.HashPassword()`. |
| **Ação** | Se válido: atualiza `senha_hash` do `Usuario`. Se inválido: erro 400. |

### 2.6 — Consulta / Edição de Perfil

| Dado | Fonte / Cálculo |
| --- | --- |
| **userId** | Extraído do claim `ClaimTypes.NameIdentifier` do JWT. |
| **Campos editáveis** | `nome`, `celular`, `url_foto`. E-mail e perfil **não** são editáveis pelo próprio usuário. |

### 2.7 — Alteração de Senha (usuário logado)

| Dado | Fonte / Cálculo |
| --- | --- |
| **Senha Atual** | Validada via `PasswordHasher<Usuario>.VerifyHashedPassword()`. |
| **Nova Senha** | Hashada com `PasswordHasher<Usuario>.HashPassword()`. |

### 2.8 — Alteração de Perfil por Admin

| Dado | Fonte / Cálculo |
| --- | --- |
| **Validação de Admin** | Verifica se o claim `perfil` do JWT é `'Admin'`. Se não → 403 Forbidden. |
| **Validação de Auto-Rebaixamento** | Se `userId` do JWT == `id` do parâmetro → erro "Admin não pode alterar o próprio perfil". |
| **Ação** | Atualiza `perfil` do usuário alvo. |

---

## 3. Endpoints da API

> **Padrão de rotas:** `api/auth` para autenticação e `api/usuarios` para gestão de perfil (conforme `PADROES_DE_DESENVOLVIMENTO-API.md`).
> Endpoints de autenticação usam `[AllowAnonymous]`. Endpoints de usuário usam `[Authorize]`.

### 3.1 — Registrar

```
POST api/auth/registrar
```

**Request DTO:** `AuthRegistrarRequest`
```csharp
public class AuthRegistrarRequest
{
    public string Nome { get; set; }
    public string Email { get; set; }
    public string Senha { get; set; }
    public string ConfirmarSenha { get; set; }
    public string? Celular { get; set; }
}
```

**Response DTO:** `AuthRegistrarResponse`

```json
{
  "mensagem": "Cadastro realizado com sucesso. Verifique seu e-mail para confirmar a conta."
}
```

---

### 3.2 — Login

```
POST api/auth/login
```

**Request DTO:** `AuthLoginRequest`
```csharp
public class AuthLoginRequest
{
    public string Email { get; set; }
    public string Senha { get; set; }
}
```

**Response DTO:** `AuthLoginResponse`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiracao": "2026-02-23T06:00:00Z",
  "usuario": {
    "id": 1,
    "nome": "Gabriel Silva",
    "email": "gabriel@cefe.com.br",
    "perfil": "Admin"
  }
}
```

**Response DTO aninhado:** `AuthUsuarioResponse`
```csharp
public class AuthUsuarioResponse
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }
    public string Perfil { get; set; }
}
```

---

### 3.3 — Confirmar E-mail

```
POST api/auth/confirmar-email
```

**Request DTO:** `AuthConfirmarEmailRequest`
```csharp
public class AuthConfirmarEmailRequest
{
    public string Token { get; set; }
}
```

**Response:** `200 OK` (sem corpo)

---

### 3.4 — Esqueci Minha Senha

```
POST api/auth/esqueci-senha
```

**Request DTO:** `AuthEsqueciSenhaRequest`
```csharp
public class AuthEsqueciSenhaRequest
{
    public string Email { get; set; }
}
```

**Response:** `200 OK` (sem corpo — sempre, mesmo se e-mail não existir)

---

### 3.5 — Redefinir Senha

```
POST api/auth/redefinir-senha
```

**Request DTO:** `AuthRedefinirSenhaRequest`
```csharp
public class AuthRedefinirSenhaRequest
{
    public string Token { get; set; }
    public string NovaSenha { get; set; }
    public string ConfirmarNovaSenha { get; set; }
}
```

**Response:** `200 OK` (sem corpo)

---

### 3.6 — Consultar Perfil

```
GET api/usuarios/perfil
```

**Request:** Sem parâmetros (userId extraído do JWT via `ClaimTypes.NameIdentifier`).

**Response DTO:** `UsuarioPerfilResponse`

```json
{
  "id": 1,
  "nome": "Gabriel Silva",
  "email": "gabriel@cefe.com.br",
  "perfil": "Admin",
  "celular": "(85) 99999-0000",
  "urlFoto": "https://storage.blob.core.windows.net/fotos/gabriel.jpg",
  "emailConfirmado": true
}
```

---

### 3.7 — Editar Perfil

```
PUT api/usuarios/perfil
```

**Request DTO:** `UsuariosEditarPerfilRequest`
```csharp
public class UsuariosEditarPerfilRequest
{
    public string Nome { get; set; }
    public string? Celular { get; set; }
    public string? UrlFoto { get; set; }
}
```

**Response DTO:** `UsuarioPerfilResponse` (mesmo da seção 3.6, com dados atualizados)

---

### 3.8 — Alterar Senha

```
PUT api/usuarios/alterar-senha
```

**Request DTO:** `UsuariosAlterarSenhaRequest`
```csharp
public class UsuariosAlterarSenhaRequest
{
    public string SenhaAtual { get; set; }
    public string NovaSenha { get; set; }
    public string ConfirmarNovaSenha { get; set; }
}
```

**Response:** `200 OK` (sem corpo)

---

### 3.9 — Alterar Perfil de Usuário (Admin)

```
PUT api/usuarios/{id}/perfil-tipo
```

**Request DTO:** `UsuariosAlterarPerfilTipoRequest`
```csharp
public class UsuariosAlterarPerfilTipoRequest
{
    public string Perfil { get; set; }
}
```

**Response:** `200 OK` (sem corpo)

> **Regras:** Apenas Admin pode acessar. Admin não pode alterar o próprio perfil. Valores válidos de `Perfil`: `"Cliente"`, `"Admin"`.

---

## 4. Responsabilidades do Backend

### 4.1 — Serviços Transversais

> Este módulo **não possui Jobs** de coleta de dados. Os dados são inseridos diretamente via endpoints. Os serviços abaixo são transversais e serão reutilizados por outros módulos.

| Serviço | Responsabilidade |
| --- | --- |
| **IJwtServico / JwtServico** | Geração e validação de tokens JWT. 4 métodos: `GerarTokenAutenticacao` (8h), `GerarTokenConfirmacaoEmail` (24h, purpose=confirm-email), `GerarTokenRedefinicaoSenha` (1h, purpose=reset-password), `ValidarTokenPurpose` (valida token + purpose → userId ou null). Usa mesma `Secret` key para todos os tokens. Configuração via `JwtSettings` em `appsettings.json`. |
| **IEmailServico / EmailServico** | Envio de e-mails via **MailKit** (SMTP). 2 métodos: `EnviarEmailConfirmacaoAsync` (link com token de confirmação), `EnviarEmailRedefinicaoSenhaAsync` (link com token de redefinição). Configuração via `SmtpSettings` em `appsettings.json`. Templates de e-mail em HTML inline. |
| **PasswordHasher\<Usuario\>** | Hashing nativo do .NET (`Microsoft.AspNetCore.Identity`). Registrado como `Singleton` no IoC. Métodos: `HashPassword()` e `VerifyHashedPassword()`. **Sem BCrypt, sem dependência externa.** |

### 4.2 — Configuração JWT

```json
// appsettings.json
{
  "JwtSettings": {
    "Secret": "<chave-secreta-256-bits>",
    "Issuer": "CEFE.EnergyHub",
    "Audience": "CEFE.EnergyHub.Users",
    "ExpiracaoHoras": 8
  }
}
```

> **Segurança:** A `Secret` deve ser armazenada em `dotnet user-secrets` ou variáveis de ambiente em produção. Nunca commitar no repositório.

### 4.3 — Configuração SMTP (MailKit)

```json
// appsettings.json
{
  "SmtpSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "UseSsl": true,
    "Username": "<email-remetente>",
    "Password": "<senha-app>",
    "FromEmail": "noreply@cefe.com.br",
    "FromName": "CEFE Energy Hub"
  },
  "AppSettings": {
    "FrontendUrl": "https://cefe.com.br"
  }
}
```

### 4.4 — Tokens JWT por Propósito

> Todos os tokens (autenticação, confirmação de e-mail, redefinição de senha) são JWTs assinados com a **mesma Secret key**. A diferenciação é feita pelo claim `purpose`. **Nenhum token é persistido no banco de dados.**

| Token | Purpose Claim | Duração | Claims |
| --- | --- | --- | --- |
| **Autenticação** | _(sem purpose)_ | 8h | `sub` (userId), `email`, `perfil`, `nome` |
| **Confirmação de E-mail** | `confirm-email` | 24h | `sub` (userId), `email`, `purpose` |
| **Redefinição de Senha** | `reset-password` | 1h | `sub` (userId), `email`, `purpose` |

### 4.5 — IJwtServico — Métodos

```csharp
public interface IJwtServico
{
    string GerarTokenAutenticacao(Usuario usuario);
    string GerarTokenConfirmacaoEmail(Usuario usuario);
    string GerarTokenRedefinicaoSenha(Usuario usuario);
    int? ValidarTokenPurpose(string token, string purposeEsperado);
}
```

| Método | Comportamento |
| --- | --- |
| `GerarTokenAutenticacao` | Gera JWT de 8h com claims `sub`, `email`, `perfil`, `nome`. Sem claim `purpose`. |
| `GerarTokenConfirmacaoEmail` | Gera JWT de 24h com claims `sub`, `email`, `purpose=confirm-email`. |
| `GerarTokenRedefinicaoSenha` | Gera JWT de 1h com claims `sub`, `email`, `purpose=reset-password`. |
| `ValidarTokenPurpose` | Valida assinatura JWT, verifica expiração, verifica que `purpose` == `purposeEsperado`. Retorna `userId` (int) se válido, `null` se inválido/expirado/purpose diferente. |

### 4.6 — Regras de Negócio

| Regra | Descrição |
| --- | --- |
| **E-mail único** | Não pode existir dois usuários com o mesmo e-mail. Validação no domínio + índice UNIQUE no banco. |
| **Perfil padrão** | Todo novo usuário recebe `perfil = 'Cliente'`. Somente Admin pode alterar. |
| **Admin não pode se rebaixar** | `PUT api/usuarios/{id}/perfil-tipo` rejeita se o `userId` do JWT == `id` do parâmetro. |
| **Login bloqueado** | Se `bloqueado = true` → erro 401 "Conta bloqueada". Se `email_confirmado = false` → erro 401 "Confirme seu e-mail antes de fazer login". |
| **Esqueci senha seguro** | Endpoint sempre retorna 200 OK, mesmo se e-mail não existir. Prevenção de enumeração de contas. |
| **Senha atual obrigatória** | Para alterar senha (usuário logado), deve informar a senha atual. Validada via `PasswordHasher.VerifyHashedPassword()`. |
| **Confirmação de senha** | Campos `ConfirmarSenha` / `ConfirmarNovaSenha` devem coincidir com `Senha` / `NovaSenha`. Validação no domínio. |
| **Token de propósito single-use conceitual** | Embora o token JWT não seja invalidado após uso (sem persistência), a ação é idempotente: confirmar e-mail 2× não causa erro (já está `true`); redefinir senha 2× com mesmo token dentro de 1h funciona mas é inofensivo. |

---

## 5. Diagrama de Entidades

> A entidade segue o padrão do Domínio: propriedades `virtual`, setters `protected set`, construtor vazio `protected` (EF Core), métodos `Set<Propriedade>` com validação via `RegraDeNegocioExcecao`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-DOMINIO.md`
>
> **⚠️ Este módulo cria os artefatos base do sistema (primeira migration, AppDbContext, RepositorioBase).** Módulos futuros como Gerenciamento de Energia e Monitoramento reutilizarão esses artefatos.

### Entidade `Usuario`

```
┌──────────────────────────────────────────────┐
│                  Usuario                     │
├──────────────────────────────────────────────┤
│ virtual int Id { get; protected set; }       │  PK, auto-increment
│ virtual string Nome { get; protected set; }  │  max 200, required
│ virtual string Perfil { get; protected set; }│  max 50, default 'Cliente'
│ virtual string Email { get; protected set; } │  max 255, required, unique
│ virtual string SenhaHash { get; prot. set; } │  max 500, required
│ virtual bool EmailConfirmado { get; p. set; }│  default false
│ virtual string? UrlFoto { get; prot. set; }  │  max 500, nullable
│ virtual bool Bloqueado { get; prot. set; }   │  default false
│ virtual string? Celular { get; prot. set; }  │  max 20, nullable
├──────────────────────────────────────────────┤
│ protected Usuario() { }                      │
│ SetNome(string nome)                         │
│ SetEmail(string email)                       │
│ SetSenhaHash(string senhaHash)               │
│ SetPerfil(string perfil)                     │
│ SetUrlFoto(string? urlFoto)                  │
│ SetCelular(string? celular)                  │
│ ConfirmarEmail()                             │  → EmailConfirmado = true
│ Bloquear()                                   │  → Bloqueado = true
│ Desbloquear()                                │  → Bloqueado = false
└──────────────────────────────────────────────┘
```

### Comandos

```
┌────────────────────────────────────────────┐
│       UsuariosRegistrarComando             │
├────────────────────────────────────────────┤
│ string Nome                                │
│ string Email                               │
│ string SenhaHash                           │  ← já hashada pelo AppServico
│ string? Celular                            │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│       UsuariosEditarPerfilComando          │
├────────────────────────────────────────────┤
│ int Id                                     │
│ string Nome                                │
│ string? Celular                            │
│ string? UrlFoto                            │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│       UsuariosAlterarSenhaComando          │
├────────────────────────────────────────────┤
│ int Id                                     │
│ string NovaSenhaHash                       │  ← já hashada pelo AppServico
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│    UsuariosAlterarPerfilTipoComando        │
├────────────────────────────────────────────┤
│ int Id                                     │
│ string Perfil                              │  ← "Cliente" ou "Admin"
│ int AdminId                                │  ← userId do admin que executa
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│       UsuariosConfirmarEmailComando        │
├────────────────────────────────────────────┤
│ int Id                                     │  ← userId extraído do token
└────────────────────────────────────────────┘
```

### Diagrama de Relacionamentos

```
Usuario ──── (sem relacionamentos neste módulo)

Módulos futuros referenciarão Usuario.Id como FK
(ex: auditorias, logs de atividade, etc.)
```

---

## 6. Estrutura de Pastas por Feature

> Conforme padrões em `padroes-desenvolvimento-back-end/copilot-instructions.md`.
>
> **⚠️ Este módulo cria a estrutura base da solução.** Todos os itens são 🆕 (criados do zero). O `RepositorioBase<T>`, `AppDbContext`, IoC e `Program.cs` são criados aqui e reutilizados por todos os módulos seguintes.

```
<Projeto>.Api/
├── Controllers/
│   ├── Auth/
│   │   └── AuthController.cs              ← [AllowAnonymous] 5 endpoints
│   └── Usuarios/
│       └── UsuariosController.cs          ← [Authorize] 4 endpoints
└── Program.cs                              ← JWT Auth, CORS, Swagger, IoC

<Projeto>.Aplicacao/
├── Auth/
│   ├── Profiles/
│   │   └── AuthProfile.cs
│   └── Servicos/
│       ├── Interfaces/
│       │   └── IAuthAppServico.cs
│       └── AuthAppServico.cs
└── Usuarios/
    ├── Profiles/
    │   └── UsuariosProfile.cs
    └── Servicos/
        ├── Interfaces/
        │   └── IUsuariosAppServico.cs
        └── UsuariosAppServico.cs

<Projeto>.DataTransfer/
├── Auth/
│   ├── Request/
│   │   ├── AuthRegistrarRequest.cs
│   │   ├── AuthLoginRequest.cs
│   │   ├── AuthConfirmarEmailRequest.cs
│   │   ├── AuthEsqueciSenhaRequest.cs
│   │   └── AuthRedefinirSenhaRequest.cs
│   └── Response/
│       ├── AuthRegistrarResponse.cs
│       ├── AuthLoginResponse.cs
│       └── AuthUsuarioResponse.cs
└── Usuarios/
    ├── Request/
    │   ├── UsuariosEditarPerfilRequest.cs
    │   ├── UsuariosAlterarSenhaRequest.cs
    │   └── UsuariosAlterarPerfilTipoRequest.cs
    └── Response/
        └── UsuarioPerfilResponse.cs

<Projeto>.Dominio/
├── Usuarios/
│   ├── Entidades/
│   │   └── Usuario.cs
│   ├── Repositorios/
│   │   └── IUsuariosRepositorio.cs
│   └── Servicos/
│       ├── Comandos/
│       │   ├── UsuariosRegistrarComando.cs
│       │   ├── UsuariosEditarPerfilComando.cs
│       │   ├── UsuariosAlterarSenhaComando.cs
│       │   ├── UsuariosAlterarPerfilTipoComando.cs
│       │   └── UsuariosConfirmarEmailComando.cs
│       ├── Interfaces/
│       │   └── IUsuariosServicos.cs
│       └── UsuariosServicos.cs
└── Servicos/
    └── Interfaces/
        ├── IJwtServico.cs                  ← transversal (reutilizado por outros módulos)
        └── IEmailServico.cs                ← transversal

<Projeto>.Infra/
├── Comum/
│   └── Repositorios/
│       └── RepositorioBase.cs              ← 🆕 base para TODOS os repositórios do sistema
├── Contexto/
│   └── AppDbContext.cs                     ← 🆕 primeiro DbContext do sistema
├── Migrations/
│   └── <DataHora>_CriarTabelaUsuarios.cs   ← 🆕 primeira migration do sistema
├── Servicos/
│   ├── JwtServico.cs                       ← implementação do IJwtServico
│   └── EmailServico.cs                     ← implementação do IEmailServico (MailKit)
└── Usuarios/
    ├── Mapeamentos/
    │   └── UsuarioConfiguration.cs
    └── Repositorios/
        └── UsuariosRepositorio.cs

<Projeto>.Ioc/
├── ConfiguracoesDbContext.cs                ← 🆕 configuração EF Core + SQL Server
├── ConfiguracoesInjecoesDependencia.cs      ← 🆕 registro de todas as interfaces
└── ConfiguracoesAutoMapper.cs               ← 🆕 registro de Profiles
```

---

## 7. Fluxo de Dados Resumido

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Usuário / Frontend                            │
│                                                                      │
│  POST api/auth/registrar          → Registro (nome, email, senha)   │
│  POST api/auth/login              → Login (email, senha)            │
│  POST api/auth/confirmar-email    → Token via e-mail                │
│  POST api/auth/esqueci-senha      → Solicita link por e-mail        │
│  POST api/auth/redefinir-senha    → Token + nova senha              │
│  GET  api/usuarios/perfil         → JWT no header                   │
│  PUT  api/usuarios/perfil         → Edição de dados                 │
│  PUT  api/usuarios/alterar-senha  → Senha atual + nova              │
│  PUT  api/usuarios/{id}/perfil-tipo → Admin altera perfil           │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    .NET 10 Web API (6 camadas)                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Api (Controllers)                                             │  │
│  │  AuthController [AllowAnonymous] + UsuariosController [Auth]   │  │
│  └──────────────────────┬─────────────────────────────────────────┘  │
│                         │                                            │
│  ┌──────────────────────▼─────────────────────────────────────────┐  │
│  │  Aplicacao (AppServicos)                                       │  │
│  │  AuthAppServico + UsuariosAppServico + AutoMapper              │  │
│  │  PasswordHasher<Usuario>.HashPassword / VerifyHashedPassword   │  │
│  └────────┬─────────────────────────────────────┬─────────────────┘  │
│           │                                     │                    │
│  ┌────────▼────────────┐           ┌────────────▼─────────────────┐  │
│  │  Dominio            │           │  Serviços Transversais       │  │
│  │  UsuariosServicos   │           │  JwtServico (geração JWT)    │  │
│  │  (regras de negócio)│           │  EmailServico (MailKit SMTP) │  │
│  └────────┬────────────┘           └──────────────────────────────┘  │
│           │                                                          │
│  ┌────────▼────────────────────────────────────────────────────────┐ │
│  │  Infra (Repositórios + EF Core)                                │ │
│  │  UsuariosRepositorio → AppDbContext → SQL Server                │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           SQL Server                                 │
│                                                                      │
│  Tabela: usuarios                                                    │
│  ┌─────┬──────┬─────────┬─────────┬───────────┬─────────────────┐   │
│  │ id  │ nome │  perfil │  email  │ senha_hash│ email_confirmado│   │
│  │     │      │         │ (UNIQUE)│           │                 │   │
│  ├─────┼──────┼─────────┼─────────┼───────────┼─────────────────┤   │
│  │ url_foto   │ bloqueado        │ celular                     │   │
│  └────────────┴──────────────────┴─────────────────────────────┘   │
│                                                                      │
│  Sem tabela de tokens (JWT sem persistência)                         │
└──────────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         MailKit (SMTP)                                │
│                                                                      │
│  E-mail de confirmação → link: {FrontendUrl}/confirmar-email?t={jwt} │
│  E-mail de redefinição → link: {FrontendUrl}/redefinir-senha?t={jwt} │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 8. Volume de Dados Estimado

| Entidade | Registros/mês | Total estimado (1 ano) | Observações |
| --- | --- | --- | --- |
| **Usuario** | ~5–10 novos | ~60–120 | Volume muito baixo. Cadastro sob demanda. |

> **Nota:** Este módulo possui volume de dados extremamente baixo. A tabela `usuarios` nunca terá mais do que algumas centenas de registros. Não há necessidade de índices compostos além do UNIQUE em `email`. Não há necessidade de particionamento ou política de retenção.

---

## 9. Checklist de Implementação

> Seguir o checklist "Nova Feature" de `padroes-desenvolvimento-back-end/copilot-instructions.md`.
> Ordem: DataTransfer → Domínio → Infra → Aplicação → API → IoC.
> **⚠️ Todos os itens são 🆕 (primeira feature do sistema).**

### 9.1 — DataTransfer

#### Request DTOs (SEM DataAnnotations — validações no Domínio)
- [ ] `AuthRegistrarRequest.cs` em `Auth/Request/`
- [ ] `AuthLoginRequest.cs` em `Auth/Request/`
- [ ] `AuthConfirmarEmailRequest.cs` em `Auth/Request/`
- [ ] `AuthEsqueciSenhaRequest.cs` em `Auth/Request/`
- [ ] `AuthRedefinirSenhaRequest.cs` em `Auth/Request/`
- [ ] `UsuariosEditarPerfilRequest.cs` em `Usuarios/Request/`
- [ ] `UsuariosAlterarSenhaRequest.cs` em `Usuarios/Request/`
- [ ] `UsuariosAlterarPerfilTipoRequest.cs` em `Usuarios/Request/`

#### Response DTOs
- [ ] `AuthRegistrarResponse.cs` em `Auth/Response/`
- [ ] `AuthLoginResponse.cs` em `Auth/Response/`
- [ ] `AuthUsuarioResponse.cs` em `Auth/Response/`
- [ ] `UsuarioPerfilResponse.cs` em `Usuarios/Response/`

### 9.2 — Domínio

#### Entidade
- [ ] 🆕 `Usuario.cs` em `Usuarios/Entidades/` — 9 campos, métodos `Set`, `ConfirmarEmail()`, `Bloquear()`, `Desbloquear()`

#### Repositório (interface)
- [ ] 🆕 `IUsuariosRepositorio.cs` em `Usuarios/Repositorios/` — herda `IRepositorioBase<Usuario>`. Método adicional: `RecuperarPorEmailAsync(string email)`

#### Comandos
- [ ] 🆕 `UsuariosRegistrarComando.cs` em `Usuarios/Servicos/Comandos/`
- [ ] 🆕 `UsuariosEditarPerfilComando.cs` em `Usuarios/Servicos/Comandos/`
- [ ] 🆕 `UsuariosAlterarSenhaComando.cs` em `Usuarios/Servicos/Comandos/`
- [ ] 🆕 `UsuariosAlterarPerfilTipoComando.cs` em `Usuarios/Servicos/Comandos/`
- [ ] 🆕 `UsuariosConfirmarEmailComando.cs` em `Usuarios/Servicos/Comandos/`

#### Serviço de Domínio
- [ ] 🆕 `IUsuariosServicos.cs` em `Usuarios/Servicos/Interfaces/`
- [ ] 🆕 `UsuariosServicos.cs` em `Usuarios/Servicos/`

#### Interfaces Transversais
- [ ] 🆕 `IJwtServico.cs` em `Servicos/Interfaces/` — 4 métodos (gerar 3 tipos de token + validar purpose)
- [ ] 🆕 `IEmailServico.cs` em `Servicos/Interfaces/` — 2 métodos (enviar confirmação + enviar redefinição)

### 9.3 — Infraestrutura

#### Base do Sistema (primeira feature — criar do zero)
- [ ] 🆕 `RepositorioBase.cs` em `Comum/Repositorios/` — base reutilizável com `Query()`, `Recuperar`, `Inserir`, `Editar`, `Excluir` (sync + async)
- [ ] 🆕 `AppDbContext.cs` em `Contexto/` — primeiro `DbContext` do sistema. `DbSet<Usuario> Usuarios`. `OnModelCreating` com `ApplyConfigurationsFromAssembly`

#### Mapeamento EF Core
- [ ] 🆕 `UsuarioConfiguration.cs` em `Usuarios/Mapeamentos/` — tabela `usuarios`, índice UNIQUE em `email`

#### Repositório (implementação)
- [ ] 🆕 `UsuariosRepositorio.cs` em `Usuarios/Repositorios/` — herda `RepositorioBase<Usuario>`. Implementa `RecuperarPorEmailAsync`

#### Serviços Transversais (implementação)
- [ ] 🆕 `JwtServico.cs` em `Servicos/` — implementa `IJwtServico`. Usa `JwtSettings` do `appsettings.json`. `System.IdentityModel.Tokens.Jwt` para geração
- [ ] 🆕 `EmailServico.cs` em `Servicos/` — implementa `IEmailServico`. Usa `SmtpSettings` do `appsettings.json`. Pacote NuGet: `MailKit`

#### Migration
- [ ] 🆕 Criar **primeira migration**: `dotnet ef migrations add CriarTabelaUsuarios --project <Projeto>.Infra --startup-project <Projeto>.Api`

### 9.4 — Aplicação
- [ ] 🆕 `IAuthAppServico.cs` em `Auth/Servicos/Interfaces/`
- [ ] 🆕 `AuthAppServico.cs` em `Auth/Servicos/` — orquestra `IUsuariosServicos`, `IJwtServico`, `IEmailServico`, `PasswordHasher<Usuario>`
- [ ] 🆕 `AuthProfile.cs` em `Auth/Profiles/`
- [ ] 🆕 `IUsuariosAppServico.cs` em `Usuarios/Servicos/Interfaces/`
- [ ] 🆕 `UsuariosAppServico.cs` em `Usuarios/Servicos/` — orquestra `IUsuariosServicos`, `PasswordHasher<Usuario>`
- [ ] 🆕 `UsuariosProfile.cs` em `Usuarios/Profiles/`

### 9.5 — API
- [ ] 🆕 `AuthController.cs` em `Controllers/Auth/` — `[Route("api/auth")]`, `[AllowAnonymous]`, 5 endpoints
- [ ] 🆕 `UsuariosController.cs` em `Controllers/Usuarios/` — `[Route("api/usuarios")]`, `[Authorize]`, 4 endpoints
- [ ] 🆕 `Program.cs` — configurar:
  - `AddAuthentication().AddJwtBearer()` com `JwtSettings`
  - `AddAuthorization()`
  - CORS (liberar frontends)
  - Swagger com suporte a `Authorization: Bearer`
  - `app.UseAuthentication()` + `app.UseAuthorization()`
  - Registro de IoC via `AddInjecoesDependencia()`

### 9.6 — IoC
- [ ] 🆕 `ConfiguracoesDbContext.cs` — configurar `AppDbContext` com SQL Server
- [ ] 🆕 `ConfiguracoesInjecoesDependencia.cs` — registrar:
  ```
  services.AddScoped<IUsuariosRepositorio, UsuariosRepositorio>();
  services.AddScoped<IUsuariosServicos, UsuariosServicos>();
  services.AddScoped<IAuthAppServico, AuthAppServico>();
  services.AddScoped<IUsuariosAppServico, UsuariosAppServico>();
  services.AddScoped<IJwtServico, JwtServico>();
  services.AddScoped<IEmailServico, EmailServico>();
  services.AddSingleton<PasswordHasher<Usuario>>();
  ```
- [ ] 🆕 `ConfiguracoesAutoMapper.cs` — registrar `AuthProfile` e `UsuariosProfile`

---

## 10. Resumo de Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| **API — AuthController** | Expor 5 endpoints públicos (`api/auth/*`): registrar, login, confirmar-email, esqueci-senha, redefinir-senha. `[AllowAnonymous]`. Delegar para `IAuthAppServico`. |
| **API — UsuariosController** | Expor 4 endpoints protegidos (`api/usuarios/*`): perfil (GET/PUT), alterar-senha, perfil-tipo (Admin). `[Authorize]`. Extrair `userId` do JWT. Delegar para `IUsuariosAppServico`. |
| **API — Program.cs** | Configurar JWT Bearer Authentication, CORS, Swagger, IoC, middlewares de autenticação e autorização. Primeira configuração do pipeline da aplicação. |
| **Aplicação — AuthAppServico** | Orquestrar fluxos de registro (hash + criar + enviar e-mail), login (validar + gerar JWT), confirmação de e-mail (validar token + confirmar), esqueci-senha (gerar token + enviar e-mail), redefinição (validar token + hash + atualizar). Usa `PasswordHasher<Usuario>`. |
| **Aplicação — UsuariosAppServico** | Orquestrar consulta/edição de perfil, alteração de senha (verificar atual + hash nova), alteração de perfil por Admin. Usar AutoMapper para entidade → Response. |
| **Domínio — UsuariosServicos** | Validar regras de negócio: e-mail único, bloqueio, confirmação, Admin não se rebaixa. Manipular entidade `Usuario` via métodos `Set`. Não conhece JWT, e-mail ou hash. |
| **Domínio — Entidade Usuario** | Encapsular dados com validação via métodos `Set`. `ConfirmarEmail()`, `Bloquear()`, `Desbloquear()`. `RegraDeNegocioExcecao` para erros de validação. |
| **Infra — UsuariosRepositorio** | Persistir/consultar `Usuario` no SQL Server via EF Core. Herda `RepositorioBase<Usuario>`. Método adicional: `RecuperarPorEmailAsync`. |
| **Infra — JwtServico** | Gerar e validar tokens JWT (autenticação 8h, confirmação 24h, redefinição 1h). Mesma Secret key, diferenciação por claim `purpose`. |
| **Infra — EmailServico** | Enviar e-mails via MailKit (SMTP). Templates HTML para confirmação e redefinição de senha. Usa `SmtpSettings` + `AppSettings.FrontendUrl`. |
| **Infra — AppDbContext** | Centralizar `DbSet<Usuario>`. Gerenciar schema via Migrations do EF Core. `ApplyConfigurationsFromAssembly` para auto-descoberta de mapeamentos. |
| **Infra — RepositorioBase\<T\>** | Base genérica reutilizável: `Query()`, `Recuperar`, `Inserir`, `Editar`, `Excluir` (sync + async). Usado por TODOS os repositórios do sistema. |
| **IoC** | `ConfiguracoesDbContext` (EF Core + SQL Server), `ConfiguracoesInjecoesDependencia` (todas as interfaces), `ConfiguracoesAutoMapper` (Profiles), `PasswordHasher<Usuario>` (Singleton). |

---

## Apêndice A — Mapeamento EF Core (Exemplo)

> O mapeamento usa `IEntityTypeConfiguration<T>` (Fluent API) e é descoberto automaticamente via `modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly)` no `AppDbContext`.
> Referência: `padroes-desenvolvimento-back-end/PADROES_DE_DESENVOLVIMENTO-INFRA.md`

### UsuarioConfiguration.cs

```csharp
public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Nome)
            .HasColumnName("nome")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Perfil)
            .HasColumnName("perfil")
            .HasMaxLength(50)
            .HasDefaultValue("Cliente")
            .IsRequired();

        builder.Property(x => x.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.SenhaHash)
            .HasColumnName("senha_hash")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.EmailConfirmado)
            .HasColumnName("email_confirmado")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.UrlFoto)
            .HasColumnName("url_foto")
            .HasMaxLength(500);

        builder.Property(x => x.Bloqueado)
            .HasColumnName("bloqueado")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(x => x.Celular)
            .HasColumnName("celular")
            .HasMaxLength(20);

        // Índice UNIQUE para garantir e-mail único
        builder.HasIndex(x => x.Email)
            .IsUnique()
            .HasDatabaseName("IX_Usuario_Email");
    }
}
```
