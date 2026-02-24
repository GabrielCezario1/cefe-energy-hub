# Relatório — Frontend do Módulo de Usuários

> **Projeto:** CEFE Energy Hub
>
> **Frontend:** Angular 21 + TypeScript 5.x + Tailwind CSS 3.x
>
> **Padrões de Desenvolvimento:** `regras-projeto-angular.md`
>
> **Backend (referência):** `RELATORIO_Backend_Usuarios.md`
>
> **Data:** Fevereiro/2026
>
> **⚠️ Este é o PRIMEIRO módulo a ser implementado no frontend.** Todos os artefatos transversais de autenticação são criados aqui: `environment.ts`, `app.config.ts`, `TokenService`, `AuthService`, `AuthGuard`, `authInterceptor`. Os módulos seguintes (Gerenciamento de Energia, Monitoramento & Geração, etc.) **reutilizarão** (✅) esses artefatos.

---

## 1. Visão Geral do Módulo

O módulo de **Usuários** gerencia toda a experiência de autenticação e perfil do usuário no frontend. Inclui telas de login, registro, confirmação de e-mail, recuperação/redefinição de senha e edição de perfil.

| Tela | Rota | Descrição |
| --- | --- | --- |
| **Login** | `/login` | Formulário de e-mail e senha. Redireciona para `/select-unit` após sucesso. |
| **Registro** | `/registrar` | Formulário de cadastro (nome, e-mail, senha, celular). Exibe mensagem de confirmação de e-mail. |
| **Confirmar E-mail** | `/confirmar-email` | Recebe token via query param `?t={token}`. Chama API e exibe resultado. |
| **Esqueci Minha Senha** | `/esqueci-senha` | Formulário com campo de e-mail. Envia link de redefinição. |
| **Redefinir Senha** | `/redefinir-senha` | Recebe token via query param `?t={token}`. Formulário de nova senha. |
| **Perfil do Usuário** | `/dashboard/perfil` | Edição de nome, celular, foto. Alteração de senha. Protegida por `AuthGuard`. |

### Restrições de Acesso

- Telas de autenticação (`/login`, `/registrar`, `/confirmar-email`, `/esqueci-senha`, `/redefinir-senha`) são **públicas** — acessíveis sem JWT.
- A tela de perfil (`/dashboard/perfil`) requer **JWT válido**, verificado via `TokenService.isTokenValido()`.
- Rotas protegidas usam `AuthGuard` (`CanActivateFn`) — redireciona para `/login` se JWT inválido ou ausente.
- Requisições HTTP autenticadas automaticamente pelo `authInterceptor` (`HttpInterceptorFn`) que injeta `Bearer token` no header `Authorization`.
- Se o JWT expirar durante a sessão, o interceptor detecta o 401 e redireciona para `/login`.

---

## 2. Stack Frontend

| Tecnologia | Versão | Uso |
| --- | --- | --- |
| Angular | 21 | Framework principal (componentes standalone) |
| TypeScript | 5.x | Linguagem |
| Tailwind CSS | 3.x | Estilização (utility-first) |
| RxJS | 7.x | Programação reativa (Observables, BehaviorSubject) |

### Padrões Angular Adotados

- **Componentes standalone** (`standalone: true`) — sem NgModules.
- **Injeção de dependência** via `inject()` (não usar `constructor`).
- **Services** com `@Injectable({ providedIn: 'root' })`.
- **Estado reativo** com `BehaviorSubject` + `asObservable()`.
- **Reactive Forms** para formulários (centralizados em `formularios/`).
- **Interfaces** com prefixo `I` (ex: `IUsuarioLogado`).
- **Request classes** com sufixo `Request` e propriedades `PascalCase`.
- **Response interfaces** com propriedades `camelCase`.
- Referência completa: `regras-projeto-angular.md`.

---

## 3. Funcionalidades Visuais da Tela

### 3.1 — Tela: Login (`/login`)

#### 3.1.1 — Formulário de Login

| Campo | Tipo | Validação | Estilização Tailwind |
| --- | --- | --- | --- |
| **E-mail** | `input[type=email]` | Required, formato e-mail | `w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:ring-primary` |
| **Senha** | `input[type=password]` | Required | Mesma estilização do e-mail |
| **Botão "Entrar"** | `button[type=submit]` | Disabled enquanto `enviando = true` | `w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50` |

- **Link "Esqueci minha senha"** — Redireciona para `/esqueci-senha`. Estilização: `text-sm text-primary hover:underline`.
- **Link "Criar conta"** — Redireciona para `/registrar`. Estilização: `text-sm text-primary hover:underline`.
- **Logo CEFE** — Centralizado acima do formulário.
- **Container:** `min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-primary/10 p-4`.
- **Card:** `w-full max-w-md shadow-xl rounded-2xl bg-white p-8`.

> **Fonte dos dados:** Endpoint `POST api/auth/login`.

#### Exemplo de Dados (protótipo React atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Formulário Login | E-mail + Senha → navega para `/select-unit` sem API | Hardcoded (`Login.tsx`) |
| Logo | `cefe-logo.png` | Asset local |
| Título | "CEFE — Central de Eficiência Energética da Thor" | Hardcoded |

### 3.2 — Tela: Registro (`/registrar`)

#### 3.2.1 — Formulário de Registro

| Campo | Tipo | Validação | Estilização Tailwind |
| --- | --- | --- | --- |
| **Nome** | `input[type=text]` | Required, min 3 caracteres | `w-full rounded-md border border-gray-300 px-3 py-2` |
| **E-mail** | `input[type=email]` | Required, formato e-mail | Mesma estilização |
| **Senha** | `input[type=password]` | Required, min 6 caracteres | Mesma estilização |
| **Confirmar Senha** | `input[type=password]` | Required, deve coincidir com Senha | Mesma estilização |
| **Celular** | `input[type=tel]` | Opcional, máscara `(XX) XXXXX-XXXX` | Mesma estilização |
| **Botão "Criar Conta"** | `button[type=submit]` | Disabled enquanto `enviando = true` | `w-full bg-primary text-white py-2 px-4 rounded-md` |

- **Após sucesso:** Exibir mensagem: "Cadastro realizado! Verifique seu e-mail para confirmar a conta." com ícone de check verde.
- **Link "Já tem conta? Faça login"** — Redireciona para `/login`.
- **Container e Card:** Mesma estilização da tela de Login.

> **Fonte dos dados:** Endpoint `POST api/auth/registrar`.

#### Exemplo de Dados (protótipo React atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Tela de Registro | Não existe no protótipo atual | — |

### 3.3 — Tela: Confirmar E-mail (`/confirmar-email`)

- **Comportamento:** Ao carregar, lê o query param `t` da URL. Chama `POST api/auth/confirmar-email` com o token.
- **Sucesso:** Exibir mensagem: "E-mail confirmado com sucesso! Você já pode fazer login." com link para `/login`.
- **Erro:** Exibir mensagem: "Token inválido ou expirado. Solicite um novo e-mail de confirmação."
- **Loading:** Spinner centralizado enquanto valida o token.
- **Estilização:** Card centralizado com ícone (✓ verde para sucesso, ✗ vermelho para erro).

> **Fonte dos dados:** Endpoint `POST api/auth/confirmar-email`.

### 3.4 — Tela: Esqueci Minha Senha (`/esqueci-senha`)

| Campo | Tipo | Validação | Estilização Tailwind |
| --- | --- | --- | --- |
| **E-mail** | `input[type=email]` | Required, formato e-mail | Mesma estilização padrão |
| **Botão "Enviar Link"** | `button[type=submit]` | Disabled enquanto `enviando = true` | Estilização padrão |

- **Após envio:** Exibir mensagem: "Se o e-mail informado estiver cadastrado, você receberá um link de redefinição." (mensagem genérica por segurança).
- **Link "Voltar ao login"** — Redireciona para `/login`.

> **Fonte dos dados:** Endpoint `POST api/auth/esqueci-senha`.

### 3.5 — Tela: Redefinir Senha (`/redefinir-senha`)

| Campo | Tipo | Validação | Estilização Tailwind |
| --- | --- | --- | --- |
| **Nova Senha** | `input[type=password]` | Required, min 6 caracteres | Mesma estilização padrão |
| **Confirmar Nova Senha** | `input[type=password]` | Required, deve coincidir | Mesma estilização padrão |
| **Botão "Redefinir Senha"** | `button[type=submit]` | Disabled enquanto `enviando = true` | Estilização padrão |

- **Comportamento:** Lê o query param `t` da URL. Inclui o token no body da requisição.
- **Sucesso:** Exibir mensagem: "Senha redefinida com sucesso!" com link para `/login`.
- **Erro (token inválido):** Exibir mensagem: "Token inválido ou expirado."

> **Fonte dos dados:** Endpoint `POST api/auth/redefinir-senha`.

### 3.6 — Tela: Perfil do Usuário (`/dashboard/perfil`)

#### 3.6.1 — Card de Informações do Perfil

| Campo | Tipo | Editável | Estilização Tailwind |
| --- | --- | --- | --- |
| **Foto** | Avatar circular | Sim (URL) | `h-24 w-24 rounded-full object-cover border-2 border-gray-200` |
| **Nome** | `input[type=text]` | Sim | Estilização padrão de input |
| **E-mail** | Texto (readonly) | Não | `text-gray-500` |
| **Perfil** | Badge | Não | Badge: `bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium` |
| **Celular** | `input[type=tel]` | Sim | Estilização padrão de input |
| **Botão "Salvar"** | `button[type=submit]` | — | `bg-primary text-white py-2 px-6 rounded-md` |

> **Fonte dos dados:** Endpoints `GET api/usuarios/perfil` e `PUT api/usuarios/perfil`.

#### 3.6.2 — Seção Alterar Senha

| Campo | Tipo | Validação |
| --- | --- | --- |
| **Senha Atual** | `input[type=password]` | Required |
| **Nova Senha** | `input[type=password]` | Required, min 6 caracteres |
| **Confirmar Nova Senha** | `input[type=password]` | Required, deve coincidir |
| **Botão "Alterar Senha"** | `button[type=submit]` | Disabled enquanto `enviando = true` |

> **Fonte dos dados:** Endpoint `PUT api/usuarios/alterar-senha`.

#### Exemplo de Dados (protótipo React atual)

| Componente | Valor Atual | Origem |
| --- | --- | --- |
| Tela de Perfil | Não existe no protótipo atual | — |

---

## 4. Estrutura de Pastas Angular

> Conforme padrões em `regras-projeto-angular.md`.
>
> **⚠️ Todos os itens são 🆕 (primeira feature do frontend).** Os artefatos de autenticação (`TokenService`, `AuthService`, `AuthGuard`, `authInterceptor`) criados aqui serão reutilizados (✅) por todos os módulos seguintes.

```
src/app/
├── pages/
│   ├── login/
│   │   ├── login.component.ts
│   │   └── login.component.html
│   ├── registrar/
│   │   ├── registrar.component.ts
│   │   └── registrar.component.html
│   ├── confirmar-email/
│   │   ├── confirmar-email.component.ts
│   │   └── confirmar-email.component.html
│   ├── esqueci-senha/
│   │   ├── esqueci-senha.component.ts
│   │   └── esqueci-senha.component.html
│   ├── redefinir-senha/
│   │   ├── redefinir-senha.component.ts
│   │   └── redefinir-senha.component.html
│   └── dashboard/
│       └── perfil/
│           ├── perfil.component.ts
│           └── perfil.component.html
├── components/
│   └── auth/
│       ├── auth-card/
│       │   ├── auth-card.component.ts         ← card reutilizável (logo + título + slot)
│       │   └── auth-card.component.html
│       └── mensagem-resultado/
│           ├── mensagem-resultado.component.ts ← ícone + mensagem (sucesso/erro)
│           └── mensagem-resultado.component.html
├── services/
│   ├── auth.service.ts                        ← login, registrar, confirmar, esqueci, redefinir
│   └── usuario.service.ts                     ← perfil (GET/PUT), alterar senha, alterar perfil tipo
├── models/
│   ├── responses/
│   │   ├── auth-login.response.ts             ← IAuthLogin (token, expiracao, usuario)
│   │   ├── auth-usuario.response.ts           ← IAuthUsuario (id, nome, email, perfil)
│   │   ├── auth-registrar.response.ts         ← IAuthRegistrar (mensagem)
│   │   └── usuario-perfil.response.ts         ← IUsuarioPerfil (id, nome, email, perfil, celular, urlFoto, emailConfirmado)
│   └── requests/
│       ├── auth-registrar.request.ts
│       ├── auth-login.request.ts
│       ├── auth-confirmar-email.request.ts
│       ├── auth-esqueci-senha.request.ts
│       ├── auth-redefinir-senha.request.ts
│       ├── usuarios-editar-perfil.request.ts
│       ├── usuarios-alterar-senha.request.ts
│       └── usuarios-alterar-perfil-tipo.request.ts
├── formularios/
│   ├── login.formulario.ts                    ← config do FormGroup de login
│   ├── registrar.formulario.ts
│   ├── esqueci-senha.formulario.ts
│   ├── redefinir-senha.formulario.ts
│   ├── editar-perfil.formulario.ts
│   └── alterar-senha.formulario.ts
├── guards/
│   └── auth.guard.ts                          ← 🆕 CanActivateFn com TokenService
├── interceptors/
│   └── auth.interceptor.ts                    ← 🆕 HttpInterceptorFn com Bearer token
├── core/
│   ├── token.service.ts                       ← 🆕 armazenar/verificar JWT em sessionStorage
│   └── auth-state.service.ts                  ← 🆕 BehaviorSubject<IUsuarioLogado | null>
└── environments/
    ├── environment.ts                          ← 🆕 apiBaseUrl (dev)
    └── environment.prod.ts                     ← 🆕 apiBaseUrl (prod)
```

---

## 5. Serviços Angular

### 5.1 — AuthService

Serviço responsável por consumir os endpoints de autenticação (`api/auth/*`).

```typescript
// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IAuthLogin } from '../models/responses/auth-login.response';
import { IAuthRegistrar } from '../models/responses/auth-registrar.response';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + '/auth';

  registrar(request: AuthRegistrarRequest): Observable<IAuthRegistrar> {
    return this.http.post<IAuthRegistrar>(`${this.baseUrl}/registrar`, request);
  }

  login(request: AuthLoginRequest): Observable<IAuthLogin> {
    return this.http.post<IAuthLogin>(`${this.baseUrl}/login`, request);
  }

  confirmarEmail(token: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/confirmar-email`, { Token: token });
  }

  esqueciSenha(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/esqueci-senha`, { Email: email });
  }

  redefinirSenha(request: AuthRedefinirSenhaRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/redefinir-senha`, request);
  }
}
```

### 5.2 — UsuarioService

Serviço responsável por consumir os endpoints de gestão de perfil (`api/usuarios/*`).

```typescript
// src/app/services/usuario.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUsuarioPerfil } from '../models/responses/usuario-perfil.response';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + '/usuarios';

  recuperarPerfil(): Observable<IUsuarioPerfil> {
    return this.http.get<IUsuarioPerfil>(`${this.baseUrl}/perfil`);
  }

  editarPerfil(request: UsuariosEditarPerfilRequest): Observable<IUsuarioPerfil> {
    return this.http.put<IUsuarioPerfil>(`${this.baseUrl}/perfil`, request);
  }

  alterarSenha(request: UsuariosAlterarSenhaRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/alterar-senha`, request);
  }

  alterarPerfilTipo(id: number, perfil: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/perfil-tipo`, { Perfil: perfil });
  }
}
```

### 5.3 — TokenService — 🆕 (criado neste módulo, reutilizado por todos os seguintes)

Serviço responsável por armazenar, recuperar e validar o JWT em `sessionStorage`.

```typescript
// src/app/core/token.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'cefe_jwt_token';

  salvarToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  obterToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  removerToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  isTokenValido(): boolean {
    const token = this.obterToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiracao = payload.exp * 1000;
      return Date.now() < expiracao;
    } catch {
      return false;
    }
  }

  obterUsuarioDoToken(): { id: number; email: string; perfil: string; nome: string } | null {
    const token = this.obterToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: Number(payload.sub),
        email: payload.email,
        perfil: payload.perfil,
        nome: payload.nome
      };
    } catch {
      return null;
    }
  }
}
```

### 5.4 — AuthStateService — 🆕 (gerenciamento de estado do usuário logado)

Serviço que mantém o estado do usuário logado via `BehaviorSubject`. Componentes que dependem do estado de autenticação assinam `usuarioLogado$`.

```typescript
// src/app/core/auth-state.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { IAuthUsuario } from '../models/responses/auth-usuario.response';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  private usuarioLogadoSubject = new BehaviorSubject<IAuthUsuario | null>(null);
  public usuarioLogado$: Observable<IAuthUsuario | null> = this.usuarioLogadoSubject.asObservable();

  inicializar(): void {
    const dadosToken = this.tokenService.obterUsuarioDoToken();
    if (dadosToken && this.tokenService.isTokenValido()) {
      this.usuarioLogadoSubject.next(dadosToken);
    }
  }

  login(token: string, usuario: IAuthUsuario): void {
    this.tokenService.salvarToken(token);
    this.usuarioLogadoSubject.next(usuario);
  }

  logout(): void {
    this.tokenService.removerToken();
    this.usuarioLogadoSubject.next(null);
    this.router.navigate(['/login']);
  }

  get usuarioLogado(): IAuthUsuario | null {
    return this.usuarioLogadoSubject.getValue();
  }

  get isAutenticado(): boolean {
    return this.tokenService.isTokenValido();
  }
}
```

---

## 6. Models (Interfaces)

### 6.1 — Interfaces de Response

```typescript
// src/app/models/responses/auth-login.response.ts
export interface IAuthLogin {
  token: string;
  expiracao: string;                     // ISO 8601
  usuario: IAuthUsuario;
}

// src/app/models/responses/auth-usuario.response.ts
export interface IAuthUsuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;                        // "Cliente" ou "Admin"
}

// src/app/models/responses/auth-registrar.response.ts
export interface IAuthRegistrar {
  mensagem: string;
}

// src/app/models/responses/usuario-perfil.response.ts
export interface IUsuarioPerfil {
  id: number;
  nome: string;
  email: string;
  perfil: string;                        // "Cliente" ou "Admin"
  celular: string | null;
  urlFoto: string | null;
  emailConfirmado: boolean;
}
```

### 6.2 — Classes de Request

```typescript
// src/app/models/requests/auth-registrar.request.ts
export class AuthRegistrarRequest {
  Nome: string;
  Email: string;
  Senha: string;
  ConfirmarSenha: string;
  Celular?: string;

  constructor(nome: string, email: string, senha: string, confirmarSenha: string, celular?: string) {
    this.Nome = nome;
    this.Email = email;
    this.Senha = senha;
    this.ConfirmarSenha = confirmarSenha;
    this.Celular = celular;
  }
}

// src/app/models/requests/auth-login.request.ts
export class AuthLoginRequest {
  Email: string;
  Senha: string;

  constructor(email: string, senha: string) {
    this.Email = email;
    this.Senha = senha;
  }
}

// src/app/models/requests/auth-confirmar-email.request.ts
export class AuthConfirmarEmailRequest {
  Token: string;

  constructor(token: string) {
    this.Token = token;
  }
}

// src/app/models/requests/auth-esqueci-senha.request.ts
export class AuthEsqueciSenhaRequest {
  Email: string;

  constructor(email: string) {
    this.Email = email;
  }
}

// src/app/models/requests/auth-redefinir-senha.request.ts
export class AuthRedefinirSenhaRequest {
  Token: string;
  NovaSenha: string;
  ConfirmarNovaSenha: string;

  constructor(token: string, novaSenha: string, confirmarNovaSenha: string) {
    this.Token = token;
    this.NovaSenha = novaSenha;
    this.ConfirmarNovaSenha = confirmarNovaSenha;
  }
}

// src/app/models/requests/usuarios-editar-perfil.request.ts
export class UsuariosEditarPerfilRequest {
  Nome: string;
  Celular?: string;
  UrlFoto?: string;

  constructor(nome: string, celular?: string, urlFoto?: string) {
    this.Nome = nome;
    this.Celular = celular;
    this.UrlFoto = urlFoto;
  }
}

// src/app/models/requests/usuarios-alterar-senha.request.ts
export class UsuariosAlterarSenhaRequest {
  SenhaAtual: string;
  NovaSenha: string;
  ConfirmarNovaSenha: string;

  constructor(senhaAtual: string, novaSenha: string, confirmarNovaSenha: string) {
    this.SenhaAtual = senhaAtual;
    this.NovaSenha = novaSenha;
    this.ConfirmarNovaSenha = confirmarNovaSenha;
  }
}

// src/app/models/requests/usuarios-alterar-perfil-tipo.request.ts
export class UsuariosAlterarPerfilTipoRequest {
  Perfil: string;

  constructor(perfil: string) {
    this.Perfil = perfil;
  }
}
```

> **Convenção:** Propriedades de Request usam `PascalCase` (para compatibilidade com DTOs do backend .NET). Propriedades de Response usam `camelCase` (padrão JSON retornado pela API). Referência: `regras-projeto-angular.md`.

---

## 7. Integração com a API

### 7.1 — Endpoints Consumidos

| Endpoint | Método HTTP | Serviço Angular | Response Interface |
| --- | --- | --- | --- |
| `api/auth/registrar` | POST | `AuthService.registrar()` | `IAuthRegistrar` |
| `api/auth/login` | POST | `AuthService.login()` | `IAuthLogin` |
| `api/auth/confirmar-email` | POST | `AuthService.confirmarEmail()` | `void` |
| `api/auth/esqueci-senha` | POST | `AuthService.esqueciSenha()` | `void` |
| `api/auth/redefinir-senha` | POST | `AuthService.redefinirSenha()` | `void` |
| `api/usuarios/perfil` | GET | `UsuarioService.recuperarPerfil()` | `IUsuarioPerfil` |
| `api/usuarios/perfil` | PUT | `UsuarioService.editarPerfil()` | `IUsuarioPerfil` |
| `api/usuarios/alterar-senha` | PUT | `UsuarioService.alterarSenha()` | `void` |
| `api/usuarios/{id}/perfil-tipo` | PUT | `UsuarioService.alterarPerfilTipo()` | `void` |

> **Nota:** Endpoints `api/auth/*` são públicos — `authInterceptor` injeta JWT apenas se existir no `sessionStorage`. Endpoints `api/usuarios/*` requerem JWT (protegidos por `AuthGuard` + `[Authorize]` no backend).

### 7.2 — Integrações Externas

Este módulo **não acessa APIs externas** diretamente. O envio de e-mail (MailKit/SMTP) é responsabilidade exclusiva do backend.

---

## 8. Autenticação e Autorização

> **🆕 TODOS os artefatos desta seção são criados neste módulo.** São a base de autenticação do sistema inteiro. Módulos futuros (GE, Monitoramento, etc.) reutilizarão diretamente sem alterações.

### 8.1 — AuthGuard — 🆕 (criado aqui)

```typescript
// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../core/token.service';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.isTokenValido()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

### 8.2 — AuthInterceptor — 🆕 (criado aqui)

```typescript
// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../core/token.service';
import { AuthStateService } from '../core/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authStateService = inject(AuthStateService);
  const token = tokenService.obterToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStateService.logout();
      }
      return throwError(() => error);
    })
  );
};
```

### 8.3 — Configuração no App — 🆕 (criado aqui)

```typescript
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

### 8.4 — Rotas — 🆕 (criado aqui)

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'registrar', loadComponent: () => import('./pages/registrar/registrar.component').then(m => m.RegistrarComponent) },
  { path: 'confirmar-email', loadComponent: () => import('./pages/confirmar-email/confirmar-email.component').then(m => m.ConfirmarEmailComponent) },
  { path: 'esqueci-senha', loadComponent: () => import('./pages/esqueci-senha/esqueci-senha.component').then(m => m.EsqueciSenhaComponent) },
  { path: 'redefinir-senha', loadComponent: () => import('./pages/redefinir-senha/redefinir-senha.component').then(m => m.RedefinirSenhaComponent) },
  { path: 'select-unit', loadComponent: () => import('./pages/unit-selection/unit-selection.component').then(m => m.UnitSelectionComponent), canActivate: [authGuard] },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      { path: 'perfil', loadComponent: () => import('./pages/dashboard/perfil/perfil.component').then(m => m.PerfilComponent) },
      // ... demais rotas de módulos futuros
    ]
  },
];
```

---

## 9. Fluxo de Dados no Frontend

### 9.1 — Fluxo de Login

```
┌────────────────────────────────────────────────────────────┐
│                    LoginComponent                          │
│  Reactive Form (email, senha) → AuthService.login()       │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ subscribe
                     ▼
┌────────────────────────────────────────────────────────────┐
│                    AuthService                             │
│  POST api/auth/login → IAuthLogin (token, usuario)        │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ response
                     ▼
┌────────────────────────────────────────────────────────────┐
│                 AuthStateService                           │
│  tokenService.salvarToken(token)                           │
│  usuarioLogadoSubject.next(usuario)                        │
│  router.navigate(['/select-unit'])                         │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ sessionStorage
                     ▼
┌────────────────────────────────────────────────────────────┐
│                 sessionStorage                             │
│  cefe_jwt_token = "eyJhbGciOi..."                          │
└────────────────────────────────────────────────────────────┘
```

### 9.2 — Fluxo de Requisição Autenticada

```
┌────────────────────────────────────────────────────────────┐
│              Componente (ex: PerfilComponent)               │
│         UsuarioService.recuperarPerfil()                    │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ HttpClient
                     ▼
┌────────────────────────────────────────────────────────────┐
│                  authInterceptor                           │
│  Injeta: Authorization: Bearer {token}                     │
│  Captura 401 → authStateService.logout()                   │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ HTTP
                     ▼
┌────────────────────────────────────────────────────────────┐
│              .NET 10 Web API                               │
│           api/usuarios/perfil                              │
│        (JWT obrigatório no header)                         │
└────────────────────────────────────────────────────────────┘
```

---

## 10. Checklist de Implementação

### 10.1 — Estrutura Base
- [ ] 🆕 Criar `environment.ts` com `apiBaseUrl` (ex: `http://localhost:5000/api`)
- [ ] 🆕 Criar `environment.prod.ts` com `apiBaseUrl` de produção
- [ ] 🆕 Configurar `app.config.ts` com `provideHttpClient(withInterceptors([authInterceptor]))`
- [ ] 🆕 Configurar `app.routes.ts` com todas as rotas (login, registrar, confirmar-email, esqueci-senha, redefinir-senha, dashboard/perfil)

### 10.2 — Models
- [ ] `IAuthLogin` em `models/responses/auth-login.response.ts`
- [ ] `IAuthUsuario` em `models/responses/auth-usuario.response.ts`
- [ ] `IAuthRegistrar` em `models/responses/auth-registrar.response.ts`
- [ ] `IUsuarioPerfil` em `models/responses/usuario-perfil.response.ts`
- [ ] `AuthRegistrarRequest` em `models/requests/auth-registrar.request.ts`
- [ ] `AuthLoginRequest` em `models/requests/auth-login.request.ts`
- [ ] `AuthConfirmarEmailRequest` em `models/requests/auth-confirmar-email.request.ts`
- [ ] `AuthEsqueciSenhaRequest` em `models/requests/auth-esqueci-senha.request.ts`
- [ ] `AuthRedefinirSenhaRequest` em `models/requests/auth-redefinir-senha.request.ts`
- [ ] `UsuariosEditarPerfilRequest` em `models/requests/usuarios-editar-perfil.request.ts`
- [ ] `UsuariosAlterarSenhaRequest` em `models/requests/usuarios-alterar-senha.request.ts`
- [ ] `UsuariosAlterarPerfilTipoRequest` em `models/requests/usuarios-alterar-perfil-tipo.request.ts`

### 10.3 — Formulários (Reactive Forms)
- [ ] `LOGIN_FORM_CONFIG` em `formularios/login.formulario.ts`
- [ ] `REGISTRAR_FORM_CONFIG` em `formularios/registrar.formulario.ts`
- [ ] `ESQUECI_SENHA_FORM_CONFIG` em `formularios/esqueci-senha.formulario.ts`
- [ ] `REDEFINIR_SENHA_FORM_CONFIG` em `formularios/redefinir-senha.formulario.ts`
- [ ] `EDITAR_PERFIL_FORM_CONFIG` em `formularios/editar-perfil.formulario.ts`
- [ ] `ALTERAR_SENHA_FORM_CONFIG` em `formularios/alterar-senha.formulario.ts`

### 10.4 — Serviços
- [ ] 🆕 `AuthService` em `services/auth.service.ts` (5 métodos)
- [ ] 🆕 `UsuarioService` em `services/usuario.service.ts` (4 métodos)

### 10.5 — Autenticação (Core) — 🆕 TODOS criados neste módulo
- [ ] 🆕 `TokenService` em `core/token.service.ts` — salvar/obter/remover/validar JWT em sessionStorage
- [ ] 🆕 `AuthStateService` em `core/auth-state.service.ts` — BehaviorSubject com estado do usuário logado
- [ ] 🆕 `authGuard` em `guards/auth.guard.ts` — CanActivateFn, redireciona para `/login`
- [ ] 🆕 `authInterceptor` em `interceptors/auth.interceptor.ts` — Bearer token + tratamento 401

### 10.6 — Componentes Reutilizáveis
- [ ] `AuthCardComponent` em `components/auth/auth-card/` — card com logo CEFE, título e slot para conteúdo (reutilizado em login, registrar, esqueci-senha, redefinir-senha)
- [ ] `MensagemResultadoComponent` em `components/auth/mensagem-resultado/` — ícone + mensagem (sucesso verde / erro vermelho)

### 10.7 — Pages
- [ ] `LoginComponent` em `pages/login/` — Reactive Form com e-mail e senha. Chama `AuthService.login()`. Salva token via `AuthStateService.login()`. Redireciona para `/select-unit`.
- [ ] `RegistrarComponent` em `pages/registrar/` — Reactive Form com nome, e-mail, senha, confirmar senha, celular. Chama `AuthService.registrar()`. Exibe mensagem de sucesso.
- [ ] `ConfirmarEmailComponent` em `pages/confirmar-email/` — Lê query param `t`. Chama `AuthService.confirmarEmail()`. Exibe resultado (sucesso/erro).
- [ ] `EsqueciSenhaComponent` em `pages/esqueci-senha/` — Reactive Form com e-mail. Chama `AuthService.esqueciSenha()`. Exibe mensagem genérica.
- [ ] `RedefinirSenhaComponent` em `pages/redefinir-senha/` — Lê query param `t`. Reactive Form com nova senha + confirmar. Chama `AuthService.redefinirSenha()`.
- [ ] `PerfilComponent` em `pages/dashboard/perfil/` — Carrega `UsuarioService.recuperarPerfil()`. Edita nome/celular/foto. Seção separada para alterar senha.

### 10.8 — Tratamento de Erros
- [ ] Implementar `obterMensagemErro()` conforme padrão `regras-projeto-angular.md`
- [ ] Tratar erro de rede / API indisponível com mensagem amigável
- [ ] Tratar 401 (JWT expirado) no `authInterceptor` → `authStateService.logout()`
- [ ] Tratar 400 (validação) com mensagem de erro do backend

---

## 11. Resumo de Responsabilidades

| Camada | Responsabilidade |
| --- | --- |
| **LoginComponent (page)** | Formulário de login. Chama `AuthService.login()`. Salva token + estado via `AuthStateService`. Redireciona para `/select-unit`. |
| **RegistrarComponent (page)** | Formulário de registro. Chama `AuthService.registrar()`. Exibe mensagem de confirmação de e-mail. |
| **ConfirmarEmailComponent (page)** | Recebe token via URL. Chama `AuthService.confirmarEmail()`. Exibe resultado. |
| **EsqueciSenhaComponent (page)** | Formulário de e-mail. Chama `AuthService.esqueciSenha()`. Mensagem genérica (segurança). |
| **RedefinirSenhaComponent (page)** | Recebe token via URL. Formulário de nova senha. Chama `AuthService.redefinirSenha()`. |
| **PerfilComponent (page)** | Exibe e edita dados do perfil. Chama `UsuarioService`. Seção de alteração de senha. |
| **AuthCardComponent** | Card visual reutilizável para telas de autenticação (logo, título, slot). |
| **MensagemResultadoComponent** | Componente de feedback visual (ícone + mensagem sucesso/erro). |
| **AuthService** | Consumir 5 endpoints `api/auth/*` via `HttpClient`. Retornar `Observable<T>` tipados. |
| **UsuarioService** | Consumir 4 endpoints `api/usuarios/*` via `HttpClient`. Retornar `Observable<T>` tipados. |
| **TokenService** | Armazenar, recuperar e validar JWT no `sessionStorage`. Decodificar claims do token. |
| **AuthStateService** | Manter estado do usuário logado via `BehaviorSubject`. Métodos `login()`, `logout()`, `inicializar()`. |
| **AuthGuard** | Proteger rotas verificando JWT válido via `TokenService`. Redirecionar para `/login` se inválido. |
| **authInterceptor** | Injetar `Bearer token` no header `Authorization`. Capturar 401 e forçar logout. |

---

## 12. Funcionalidades Pendentes / Planejadas

- **Tela de Administração de Usuários** — Futura tela para Admin listar, bloquear/desbloquear e alterar perfil de outros usuários. Endpoint `PUT api/usuarios/{id}/perfil-tipo` já existe no backend, mas a tela administrativa completa será implementada em fase posterior.
- **Upload de Foto de Perfil** — O campo `url_foto` aceita URL. O upload de imagens para blob storage (Azure Blob / S3) e geração de URL pré-assinada será implementado quando o serviço de storage for configurado.
- **Autenticação de dois fatores (2FA)** — Não está no escopo atual (v1). Pode ser adicionada futuramente.
- **Login Social (Google, Microsoft)** — Não está no escopo atual. Estrutura de JWT permite extensão futura.
