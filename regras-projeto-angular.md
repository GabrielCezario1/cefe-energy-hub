# Guia Completo de Desenvolvimento — Angular + Tailwind CSS

## Visão Geral

Este documento compila todas as regras e padrões de desenvolvimento para projetos **Angular 18+** com **Tailwind CSS**. O projeto segue padrões modernos de desenvolvimento Angular, utilizando componentes standalone, Reactive Forms e injeção de dependências com `inject()`.

---

## Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Angular | 18.2.x | Framework principal |
| TypeScript | 5.x | Linguagem |
| Tailwind CSS | 3.x | Estilização |
| RxJS | 7.x | Programação reativa |
| ngx-toastr | - | Notificações |

---

## Princípios de Desenvolvimento

1. **Componentes Standalone** — Todos os componentes devem ser standalone (sem NgModule).
2. **Reactive Forms** — Sempre utilize Reactive Forms com configurações centralizadas em `src/app/formularios/`.
3. **Injeção com `inject()`** — Prefira a função `inject()` para injeção de dependências em serviços.
4. **Tipagem Forte** — Sempre defina interfaces para responses da API e classes para requests.
5. **Tratamento de Erros** — Utilize o padrão `obterMensagemErro()` para tratamento consistente de erros.
6. **Estilização com Tailwind** — Use classes Tailwind para estilização, com fonte customizada quando aplicável.

---

# 1. Arquitetura do Projeto

## Estrutura de Pastas

```
src/
├── app/
│   ├── components/          # Componentes reutilizáveis de UI
│   ├── pages/               # Páginas (rotas) da aplicação
│   ├── services/            # Serviços de negócio e HTTP
│   ├── formularios/         # Configurações de formulários
│   ├── models/              # Interfaces e classes de dados
│   │   ├── paginacao/       # Models de paginação
│   │   ├── requests/        # DTOs de requisição
│   │   └── responses/       # DTOs de resposta
│   ├── interceptors/        # HTTP Interceptors
│   ├── shared/              # Componentes compartilhados
│   └── utils/               # Funções utilitárias
│
├── assets/                  # Recursos estáticos
│   ├── fonts/
│   ├── logos/
│   └── visuais/
│
└── environments/            # Configurações de ambiente
    └── environment.ts
```

---

## Fluxo de Dados

### Padrão Componente → Serviço → API

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Componente │────▶│   Service   │────▶│   API HTTP  │
│   (View)    │◀────│  (Lógica)   │◀────│  (Backend)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       └───────────▶│   Models    │
                    │ (Tipagem)   │
                    └─────────────┘
```

### Exemplo Prático

```typescript
// 1. Componente chama o serviço
this.produtosService.pesquisar(req).subscribe({
  next: (res) => this.produtos = res.itens,
  error: (err) => this.erro = this.obterMensagemErro(err)
});

// 2. Serviço faz a requisição HTTP
pesquisar(req: RecuperarProdutosRequest): Observable<PaginacaoResponse<IProduto>> {
  return this.http.get<PaginacaoResponse<IProduto>>(this.baseUrl, { params: req as any });
}

// 3. Response é tipada com interfaces
export interface IProduto {
  id: number;
  nome: string;
  // ...
}
```

---

## Gerenciamento de Estado

### Estado de Autenticação

O `AuthService` gerencia o estado do usuário logado usando `BehaviorSubject`:

```typescript
private usuarioSubject: BehaviorSubject<IUsuarioLogado | null>;
public usuarioLogado$: Observable<IUsuarioLogado | null>;
```

### Fluxo de Estado

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Login    │────▶│ AuthService │────▶│  Components │
│  Component  │     │   Subject   │     │ (subscribe) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ sessionStorage │
                    └─────────────┘
```

---

## Separação de Responsabilidades

### Components vs Pages

| Tipo | Localização | Responsabilidade |
|------|-------------|------------------|
| **Pages** | `src/app/pages/` | Páginas roteáveis, orquestram components |
| **Components** | `src/app/components/` | UI reutilizável, sem lógica de negócio |

### Exemplo

```typescript
// pages/home/home.component.ts - Orquestra componentes
@Component({
  selector: 'app-home',
  imports: [HeaderComponent, CatalogoSliderComponent, FooterComponent],
  template: `
    <app-header />
    <app-catalogo-slider />
    <app-footer />
  `
})
export class HomeComponent { }

// components/header/header.component.ts - UI reutilizável
@Component({
  selector: 'app-header',
  // Apenas apresentação
})
export class HeaderComponent { }
```

---

## Configuração da Aplicação

### app.config.ts

```typescript
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

### Pontos Importantes

1. **Zone Change Detection** com event coalescing para performance
2. **Scroll Position Restoration** automática
3. **Animações** habilitadas globalmente
4. **HTTP Interceptor** para autenticação automática

---

# 2. Padrões para Componentes

## Regra Fundamental

Todos os componentes **DEVEM** ser **standalone** (Angular 18+).

---

## Template de Componente

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nome-componente',
  standalone: true,
  templateUrl: './nome-componente.component.html',
  styleUrls: ['./nome-componente.component.css'],
  imports: [CommonModule]
})
export class NomeComponenteComponent implements OnInit {
  
  constructor() { }

  ngOnInit(): void {
    // Inicialização
  }
}
```

---

## Convenções de Nomenclatura de Componentes

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| **Arquivo** | `kebab-case.component.{ts,html,css}` | `catalogo-slider.component.ts` |
| **Classe** | `PascalCaseComponent` | `CatalogoSliderComponent` |
| **Seletor** | `app-kebab-case` | `app-catalogo-slider` |

---

## Estrutura de Arquivos de Componente

Cada componente deve ter sua própria pasta:

```
components/
└── nome-componente/
    ├── nome-componente.component.ts
    ├── nome-componente.component.html
    └── nome-componente.component.css
```

---

## Imports Padrão

```typescript
imports: [
  CommonModule,           // *ngIf, *ngFor, async pipe, etc.
  ReactiveFormsModule,    // Formulários reativos
  RouterLink,             // Links de navegação
]
```

---

## Exemplo: Componente com Dados da API

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICatalogoSliderItem } from '../../models/catalogo-slider.model';
import { CatalogoSliderService } from '../../services/catalogo-slider.service';

@Component({
  selector: 'app-catalogo-slider-oficial',
  standalone: true,
  templateUrl: './catalogo-slider-oficial.component.html',
  styleUrls: ['./catalogo-slider-oficial.component.css'],
  imports: [CommonModule]
})
export class CatalogoSliderOficialComponent implements OnInit {

  itens: ICatalogoSliderItem[] = [];
  carregando = false;

  constructor(private readonly catalogoSliderService: CatalogoSliderService) { }

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    if (this.carregando) return;
    this.carregando = true;
    
    this.catalogoSliderService.recuperarOficial().subscribe({
      next: (res) => {
        this.itens = Array.isArray(res) ? res : [];
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.itens = [];
        this.carregando = false;
      }
    });
  }
}
```

---

## Exemplo: Componente com Formulário

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormService } from '../../services/forms.service';
import { EXEMPLO_FORM_CONFIG } from '../../formularios/exemplo.formulario';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  templateUrl: './exemplo.component.html',
  styleUrls: ['./exemplo.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ExemploComponent implements OnInit {

  formulario!: FormGroup;
  enviando = false;
  tentouEnviar = false;

  constructor(private readonly formService: FormService) { }

  ngOnInit(): void {
    this.formulario = this.formService.construirFormulario(EXEMPLO_FORM_CONFIG);
  }

  campoInvalido(nome: string): boolean {
    const c = this.formulario.get(nome);
    return !!c && c.invalid && (this.tentouEnviar || c.touched);
  }

  campoErro(nome: string, erro: string): boolean {
    const c = this.formulario.get(nome);
    return !!c && (this.tentouEnviar || c.touched) && c.hasError(erro);
  }

  enviar(): void {
    this.tentouEnviar = true;
    if (this.formulario.invalid || this.enviando) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando = true;
    // ... lógica de envio
  }
}
```

---

## Componentes Compartilhados

Componentes genéricos ficam em `src/app/shared/`:

```typescript
// shared/loading.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visivel" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
      <div class="flex flex-col items-center gap-3">
        <div class="h-12 w-12 rounded-full animate-pulse"></div>
        <span class="text-sm font-semibold text-white">Carregando...</span>
      </div>
    </div>
  `
})
export class LoadingComponent {
  @Input() visivel = false;
}
```

---

## Uso de @Input e @Output

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item-lista',
  standalone: true,
  template: `
    <div (click)="aoSelecionar.emit(item)">
      {{ item.nome }}
    </div>
  `
})
export class ItemListaComponent {
  @Input() item!: { id: number; nome: string };
  @Output() aoSelecionar = new EventEmitter<{ id: number; nome: string }>();
}
```

---

## Custom Elements Schema

Para uso de Web Components externos (como Swiper):

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-slider',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <swiper-container>
      <!-- slides -->
    </swiper-container>
  `
})
export class SliderComponent { }
```

---

## Boas Práticas de Componentes

1. **readonly** em injeções: `private readonly service = inject(Service)`
2. **Inicialização** de variáveis: `items: Item[] = []` ao invés de `items!: Item[]`
3. **Flags de estado**: `carregando`, `enviando`, `tentouEnviar`
4. **Tratamento de erros**: Sempre implementar handler de erro em subscribes
5. **Cleanup**: Usar `takeUntilDestroyed()` ou `finalize()` para limpeza

---

# 3. Padrões para Serviços

## Regra Fundamental

Serviços devem ser **injetáveis globalmente** com `providedIn: 'root'`.

---

## Template de Serviço

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NomeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + '/recurso';

  metodo(dados: Request): Observable<Response> {
    return this.http.post<Response>(this.baseUrl, dados);
  }
}
```

---

## Convenções de Nomenclatura de Serviços

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| **Arquivo** | `kebab-case.service.ts` | `produtos.service.ts` |
| **Classe** | `PascalCaseService` | `ProdutosService` |

---

## Injeção de Dependências

### ✅ Preferido (Angular 16+)

```typescript
@Injectable({ providedIn: 'root' })
export class MeuService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
}
```

### ⚠️ Aceitável (constructor injection)

```typescript
@Injectable({ providedIn: 'root' })
export class MeuService {
  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService
  ) { }
}
```

---

## Padrão de URL

```typescript
private readonly baseUrl = environment.apiBaseUrl + '/recurso';

// GET simples
listar(): Observable<Item[]> {
  return this.http.get<Item[]>(this.baseUrl);
}

// GET com parâmetros
buscar(id: number): Observable<Item> {
  return this.http.get<Item>(`${this.baseUrl}/${id}`);
}

// GET com query params
pesquisar(filtro: Filtro): Observable<PaginacaoResponse<Item>> {
  return this.http.get<PaginacaoResponse<Item>>(this.baseUrl, {
    params: filtro as any
  });
}

// POST
criar(dados: CriarRequest): Observable<Item> {
  return this.http.post<Item>(this.baseUrl, dados);
}

// PUT
atualizar(id: number, dados: AtualizarRequest): Observable<Item> {
  return this.http.put<Item>(`${this.baseUrl}/${id}`, dados);
}

// DELETE
remover(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}
```

---

## Exemplo Completo: ProdutosService

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginacaoResponse } from '../models/paginacao/paginacao.response';
import { RecuperarProdutosRequest } from '../models/requests/recuperar-produtos.request';
import { IProduto } from '../models/produtos.model';
import { ProdutosFiltro } from '../models/ProdutosFiltro';

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + '/produtos';

  preencherFiltros(): Observable<ProdutosFiltro> {
    return this.http.get<ProdutosFiltro>(`${this.baseUrl}/filtros`);
  }

  pesquisar(req: RecuperarProdutosRequest): Observable<PaginacaoResponse<IProduto>> {
    return this.http.get<PaginacaoResponse<IProduto>>(this.baseUrl, { params: req as any });
  }
}
```

---

## Gerenciamento de Estado com BehaviorSubject

Para estado compartilhado entre componentes:

```typescript
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioSubject = new BehaviorSubject<IUsuarioLogado | null>(null);
  public usuarioLogado$: Observable<IUsuarioLogado | null> = this.usuarioSubject.asObservable();

  constructor() {
    const usuario = sessionStorage.getItem('usuarioLogado');
    if (usuario) {
      this.usuarioSubject.next(JSON.parse(usuario));
    }
  }

  atualizarUsuario(usuario: IUsuarioLogado): void {
    this.usuarioSubject.next(usuario);
    sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  }

  limparUsuario(): void {
    this.usuarioSubject.next(null);
    sessionStorage.removeItem('usuarioLogado');
  }
}
```

---

## Uso de Operators RxJS

### tap — Efeitos colaterais

```typescript
entrar(dados: LoginRequest): Observable<IUsuarioLogado> {
  return this.http.get<LoginResponse>(url, { params }).pipe(
    tap(res => {
      this.tokenService.salvar(res.token, res.expiraEm);
    }),
    map(res => this.mapearUsuario(res.usuario)),
    tap(usuario => {
      this.usuarioSubject.next(usuario);
      sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    })
  );
}
```

### map — Transformação

```typescript
buscar(id: number): Observable<Produto> {
  return this.http.get<ApiProduto>(`${this.baseUrl}/${id}`).pipe(
    map(api => this.transformarParaModel(api))
  );
}
```

### catchError — Tratamento de erros

```typescript
import { catchError, throwError } from 'rxjs';

buscar(id: number): Observable<Produto> {
  return this.http.get<Produto>(`${this.baseUrl}/${id}`).pipe(
    catchError(err => {
      console.error('Erro ao buscar produto:', err);
      return throwError(() => err);
    })
  );
}
```

---

## Environment Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:5249/api'
};
```

Uso no serviço:

```typescript
import { environment } from '../../environments/environment';

private readonly baseUrl = environment.apiBaseUrl + '/recurso';
```

---

## Boas Práticas de Serviços

1. **readonly** em todas as injeções e URLs base
2. **Tipagem forte** em todos os métodos HTTP
3. **Separar responsabilidades**: um serviço por domínio/recurso
4. **Não fazer subscribe** dentro de serviços (deixe para o componente)
5. **Centralizar** mapeamentos de dados no serviço
6. **Usar environment** para URLs base

---

# 4. Padrões para Formulários

## Regra Fundamental

Sempre utilizar **Reactive Forms** com configurações centralizadas na pasta `src/app/formularios/`.

---

## Arquitetura de Formulários

```
src/app/
├── formularios/                    # Configurações de formulários
│   ├── login.formulario.ts
│   ├── cadastro.formulario.ts
│   ├── fale-conosco.formulario.ts
│   └── ...
├── services/
│   └── forms.service.ts            # Serviço para construir formulários
└── utils/
    └── funcoes-utilitarias.utils.ts # Validators customizados
```

---

## Configuração de Formulário

### Arquivo de Configuração

```typescript
// src/app/formularios/login.formulario.ts
import { Validators } from '@angular/forms';

export const LOGIN_FORM_CONFIG = {
  usuario: ['', [Validators.required]],
  senha: ['', [Validators.required]]
};
```

### Exemplo Completo (Cadastro)

```typescript
// src/app/formularios/cadastro.formulario.ts
import { Validators } from '@angular/forms';

export const CADASTRO_FORM_CONFIG = {
  nome: ['', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(60)
  ]],
  sobrenome: ['', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(60)
  ]],
  usuario: ['', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(30),
    Validators.pattern(/^[a-zA-Z0-9._-]+$/)
  ]],
  email: ['', [
    Validators.required,
    Validators.email,
    Validators.maxLength(254)
  ]],
  senha: ['', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(128),
    Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  ]],
  confirmarSenha: ['', [Validators.required]]
};
```

---

## FormService

Serviço centralizado para construção de formulários:

```typescript
// src/app/services/forms.service.ts
import { Injectable } from "@angular/core";
import { FormGroup, UntypedFormBuilder } from "@angular/forms";

@Injectable({ providedIn: "root" })
export class FormService {
  constructor(private builder: UntypedFormBuilder) { }

  construirFormulario(constante: any): FormGroup {
    const config = Object.assign({}, constante);

    for (let chave of Object.keys(config)) {
      if (!Array.isArray(config[chave])) {
        config[chave] = this.construirFormulario(config[chave]);
      }
    }

    return this.builder.group(config);
  }
}
```

---

## Uso no Componente

```typescript
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormService } from '../../services/forms.service';
import { LOGIN_FORM_CONFIG } from '../../formularios/login.formulario';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  // ...
})
export class LoginComponent implements OnInit {
  formulario!: FormGroup;
  enviando = false;
  tentouEnviar = false;

  constructor(private readonly formService: FormService) { }

  ngOnInit(): void {
    this.formulario = this.formService.construirFormulario(LOGIN_FORM_CONFIG);
  }
}
```

---

## Métodos de Validação

### Padrão para todos os componentes

```typescript
campoInvalido(nome: string): boolean {
  const c = this.formulario.get(nome);
  return !!c && c.invalid && (this.tentouEnviar || c.touched);
}

campoErro(nome: string, erro: string): boolean {
  const c = this.formulario.get(nome);
  return !!c && (this.tentouEnviar || c.touched) && c.hasError(erro);
}
```

### Uso no Template

```html
<input formControlName="email" 
       [class.border-red-500]="campoInvalido('email')">

<span *ngIf="campoErro('email', 'required')" class="text-red-500 text-xs">
  E-mail é obrigatório
</span>
<span *ngIf="campoErro('email', 'email')" class="text-red-500 text-xs">
  E-mail inválido
</span>
```

---

## Validators Customizados

### Exemplo: Validar Senhas Iguais

```typescript
// src/app/utils/funcoes-utilitarias.utils.ts
import { AbstractControl, ValidatorFn } from "@angular/forms";

export function validarSenhasIguais(
  campoSenha: string, 
  campoConfirmacao: string
): ValidatorFn {
  return (grupo: AbstractControl) => {
    const senha = grupo.get(campoSenha)?.value ?? '';
    const confirmacao = grupo.get(campoConfirmacao)?.value ?? '';
    if (!senha || !confirmacao) return null;
    return senha === confirmacao ? null : { senhasDiferentes: true };
  };
}
```

### Uso no Componente

```typescript
ngOnInit(): void {
  this.formulario = this.formService.construirFormulario(CADASTRO_FORM_CONFIG);
  this.formulario.setValidators(validarSenhasIguais('senha', 'confirmarSenha'));
}

erroSenhasDiferentes(): boolean {
  const c = this.formulario.get('confirmarSenha');
  return (this.tentouEnviar || c?.touched) && this.formulario.hasError('senhasDiferentes');
}
```

---

## Padrão de Submit

```typescript
enviar(): void {
  this.tentouEnviar = true;
  
  if (this.formulario.invalid || this.enviando) {
    this.formulario.markAllAsTouched();
    return;
  }
  
  this.enviando = true;
  this.erroMsg = null;

  const req = new ExemploRequest({
    Campo: String(this.formulario.get('campo')?.value ?? '').trim()
  });

  this.service
    .enviar(req)
    .pipe(finalize(() => (this.enviando = false)))
    .subscribe({
      next: () => {
        this.formulario.reset();
        this.tentouEnviar = false;
        this.sucessoMsg = 'Operação realizada com sucesso!';
      },
      error: (erro) => {
        this.erroMsg = this.obterMensagemErro(erro);
      }
    });
}
```

---

## Validators Disponíveis

| Validator | Uso | Exemplo |
|-----------|-----|---------|
| `required` | Campo obrigatório | `Validators.required` |
| `email` | Formato de e-mail | `Validators.email` |
| `minLength` | Mínimo de caracteres | `Validators.minLength(3)` |
| `maxLength` | Máximo de caracteres | `Validators.maxLength(60)` |
| `pattern` | Regex | `Validators.pattern(/^[a-z]+$/)` |
| `min` | Valor mínimo (número) | `Validators.min(0)` |
| `max` | Valor máximo (número) | `Validators.max(100)` |

---

## Template HTML Padrão para Formulários

```html
<form [formGroup]="formulario" (ngSubmit)="enviar()">
  
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700">Nome</label>
    <input 
      type="text" 
      formControlName="nome"
      class="w-full rounded-xl border px-3 py-2"
      [class.border-red-500]="campoInvalido('nome')"
    >
    <span *ngIf="campoErro('nome', 'required')" class="text-red-500 text-xs">
      Nome é obrigatório
    </span>
    <span *ngIf="campoErro('nome', 'minlength')" class="text-red-500 text-xs">
      Nome deve ter pelo menos 2 caracteres
    </span>
  </div>

  <button 
    type="submit" 
    [disabled]="enviando"
    class="w-full rounded-full bg-gradient-to-br from-[#A839F7] to-[#52A2F7] py-3 text-white"
  >
    {{ enviando ? 'Enviando...' : 'Enviar' }}
  </button>

  <p *ngIf="erroMsg" class="mt-2 text-center text-red-500 text-sm">
    {{ erroMsg }}
  </p>

</form>
```

---

## Boas Práticas de Formulários

1. **Centralizar** configurações em arquivos separados
2. **Usar FormService** para construir formulários
3. **Trim** em valores de texto antes de enviar
4. **finalize()** para garantir que `enviando = false`
5. **markAllAsTouched()** para mostrar todos os erros
6. **Reset** do formulário após sucesso
7. **Mensagens de erro** claras e específicas

---

# 5. Padrões para Models

## Estrutura de Pastas

```
src/app/models/
├── usuario-logado.model.ts    # Interfaces de domínio
├── produtos.model.ts
├── paginacao/                 # Models de paginação
│   └── paginacao.response.ts
└── requests/                  # DTOs de requisição
    ├── login.request.ts
    ├── cadastro.request.ts
    └── recuperar-produtos.request.ts
```

---

## Interfaces vs Classes

| Tipo | Quando usar | Prefixo/Sufixo |
|------|-------------|----------------|
| **Interface** | Responses da API, models de domínio | `I` prefix |
| **Classe** | Requests (DTOs) com constructor | `Request` suffix |

---

## Padrão para Interfaces

```typescript
// src/app/models/usuario-logado.model.ts
export interface IUsuarioLogado {
  id: number;
  login: string;
  nome: string;
  email: string;
  plano?: {
    id: number;
    nome: string;
    vencimento: Date;
  };
  urlFoto?: string;
}
```

### Outro Exemplo

```typescript
// src/app/models/produtos.model.ts
export interface IProduto {
  id: number;
  nome: string;
  fabricante: string;
  linha: string;
  categoria: string;
  acabamento: string;
  cor: string;
  miniatura: string;
  imagemKey: string;
}
```

---

## Padrão para Classes de Request

```typescript
// src/app/models/requests/login.request.ts
export class LoginRequest {
  Usuario: string;
  Senha: string;

  constructor(params: LoginRequest) {
    this.Usuario = params.Usuario;
    this.Senha = params.Senha;
  }
}
```

### Exemplo Completo

```typescript
// src/app/models/requests/cadastro.request.ts
export class CadastroRequest {
  Nome: string;
  Sobrenome: string;
  Login: string;
  Email: string;
  Senha: string;

  constructor(params: CadastroRequest) {
    this.Nome = params.Nome;
    this.Sobrenome = params.Sobrenome;
    this.Login = params.Login;
    this.Email = params.Email;
    this.Senha = params.Senha;
  }
}
```

---

## Padrão para Responses da API

```typescript
// src/app/models/LoginResponse.ts
export interface LoginResponse {
  token: string;
  expiraEm: string;
  usuario: {
    id: number;
    nome: string;
    login: string;
    email: string;
    perfil: string;
    urlFoto: string;
  };
}
```

---

## Paginação

### Response de Paginação

```typescript
// src/app/models/paginacao/paginacao.response.ts
export interface PaginacaoResponse<T> {
  itens: T[];
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
}
```

### Uso no Serviço

```typescript
pesquisar(req: RecuperarProdutosRequest): Observable<PaginacaoResponse<IProduto>> {
  return this.http.get<PaginacaoResponse<IProduto>>(this.baseUrl, { params: req as any });
}
```

---

## Filtros

```typescript
// src/app/models/ProdutosFiltro.ts
export interface ProdutosFiltro {
  fabricantes: string[];
  linhas: string[];
  categorias: string[];
  acabamentos: string[];
  cores: string[];
}
```

---

## Convenções de Nomenclatura de Models

### Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Interface de domínio | `kebab-case.model.ts` | `usuario-logado.model.ts` |
| Request DTO | `kebab-case.request.ts` | `login.request.ts` |
| Response DTO | `kebab-case.response.ts` | `paginacao.response.ts` |
| Filtro | `PascalCase.ts` | `ProdutosFiltro.ts` |

### Classes e Interfaces

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Interface | `IPascalCase` | `IUsuarioLogado` |
| Classe Request | `PascalCaseRequest` | `LoginRequest` |
| Interface Response | `PascalCaseResponse` | `LoginResponse` |

---

## Propriedades Opcionais

Use `?` para propriedades opcionais:

```typescript
export interface IUsuarioLogado {
  id: number;           // Obrigatório
  nome: string;         // Obrigatório
  urlFoto?: string;     // Opcional
  plano?: {             // Opcional
    id: number;
    nome: string;
  };
}
```

---

## Tipos Aninhados

Para objetos aninhados simples, defina inline:

```typescript
export interface IUsuarioLogado {
  plano?: {
    id: number;
    nome: string;
    vencimento: Date;
  };
}
```

Para objetos reutilizáveis, crie interface separada:

```typescript
export interface IPlano {
  id: number;
  nome: string;
  vencimento: Date;
}

export interface IUsuarioLogado {
  id: number;
  nome: string;
  plano?: IPlano;
}
```

---

## Boas Práticas de Models

1. **Prefixo `I`** para interfaces de domínio
2. **Sufixo `Request`** para classes de DTO
3. **Sufixo `Response`** para interfaces de resposta da API
4. **Properties em PascalCase** para requests (compatibilidade com C#/.NET)
5. **Properties em camelCase** para interfaces de domínio
6. **Generics** para respostas paginadas
7. **Separar** requests em pasta própria

---

# 6. Autenticação e Autorização

## Visão Geral

O sistema de autenticação utiliza **JWT (JSON Web Tokens)** com armazenamento em `sessionStorage`.

---

## Arquitetura

```
src/app/
├── services/
│   ├── auth.service.ts      # Gerenciamento de autenticação
│   ├── token.service.ts     # Gerenciamento de tokens
│   └── auth.guard.ts        # Proteção de rotas
└── interceptors/
    └── auth.interceptor.ts  # Injeção automática de token
```

---

## TokenService

Responsável pelo gerenciamento de tokens JWT:

```typescript
// src/app/services/token.service.ts
import { Injectable } from '@angular/core';

const TOKEN_KEY = 'accessToken';
const EXP_KEY = 'tokenExpiraEm';

@Injectable({ providedIn: 'root' })
export class TokenService {
  
  salvar(token: string, expiraEmISO: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(EXP_KEY, expiraEmISO);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  getExpiraEm(): string | null {
    return sessionStorage.getItem(EXP_KEY);
  }

  isTokenValido(margemSegundos = 30): boolean {
    const token = this.getToken();
    const exp = this.getExpiraEm();
    if (!token || !exp) return false;
    
    const agora = Date.now();
    const expMs = Date.parse(exp);
    if (isNaN(expMs)) return false;
    
    return expMs - agora > margemSegundos * 1000;
  }

  limpar(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXP_KEY);
  }
}
```

---

## AuthService

Gerenciamento do estado de autenticação:

```typescript
// src/app/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly urlBase = environment.apiBaseUrl + "/usuarios";
  private readonly tokenService = inject(TokenService);
  
  private usuarioSubject: BehaviorSubject<IUsuarioLogado | null>;
  public usuarioLogado$: Observable<IUsuarioLogado | null>;

  constructor() {
    const usuario = sessionStorage.getItem('usuarioLogado');
    
    if (usuario && !this.tokenService.isTokenValido()) {
      sessionStorage.removeItem('usuarioLogado');
      this.tokenService.limpar();
    }
    
    this.usuarioSubject = new BehaviorSubject<IUsuarioLogado | null>(
      this.tokenService.isTokenValido() && usuario ? JSON.parse(usuario) : null
    );
    this.usuarioLogado$ = this.usuarioSubject.asObservable();
  }

  entrar(dados: LoginRequest): Observable<IUsuarioLogado> {
    const url = `${this.urlBase}/login`;
    const params = new HttpParams({ 
      fromObject: { Usuario: dados.Usuario, Senha: dados.Senha } 
    });
    
    return this.http.get<LoginResponse>(url, { params }).pipe(
      tap(res => {
        this.tokenService.salvar(res.token, res.expiraEm);
      }),
      map(res => this.mapearUsuario(res.usuario)),
      tap(usuario => {
        this.usuarioSubject.next(usuario);
        sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
      })
    );
  }

  sair(): void {
    this.usuarioSubject.next(null);
    sessionStorage.removeItem('usuarioLogado');
    this.tokenService.limpar();
  }

  estaLogado(): boolean {
    return this.tokenService.isTokenValido() && !!this.usuarioSubject.value;
  }

  atualizarUsuarioLocal(usuario: IUsuarioLogado): void {
    this.usuarioSubject.next(usuario);
    sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  }
}
```

---

## AuthGuard

Proteção de rotas que requerem autenticação:

```typescript
// src/app/services/auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.usuarioLogado$.pipe(
      map(usuario => {
        const tokenValido = this.tokenService.isTokenValido();
        
        if (usuario && tokenValido) {
          return true;
        }
        
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
```

---

## Auth Interceptor

Injeção automática de token em requisições HTTP:

```typescript
// src/app/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const auth = inject(AuthService);

  const token = tokenService.getToken();

  const reqComAuth = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(reqComAuth).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.sair();
      }
      return throwError(() => err);
    })
  );
};
```

---

## Fluxo de Login

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ LoginComponent │──▶│ AuthService │──▶│   API       │
│   (form)      │    │  entrar()   │    │  /login     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │TokenService │
                    │ salvar()    │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │sessionStorage│
                    │ token +     │
                    │ usuario     │
                    └─────────────┘
```

---

## Fluxo de Requisição Autenticada

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Component  │──▶│ HttpClient  │──▶│ Interceptor │
│   request   │    │             │    │ add Bearer  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │    API      │
                                       │ (autenticada)│
                                       └─────────────┘
```

---

## Uso no Componente

### Verificar se está logado

```typescript
export class MeuComponent {
  private readonly authService = inject(AuthService);
  
  usuario$ = this.authService.usuarioLogado$;
  
  get estaLogado(): boolean {
    return this.authService.estaLogado();
  }
}
```

### No Template

```html
<ng-container *ngIf="usuario$ | async as usuario; else naoLogado">
  <span>Olá, {{ usuario.nome }}</span>
  <button (click)="sair()">Sair</button>
</ng-container>

<ng-template #naoLogado>
  <a routerLink="/login">Entrar</a>
</ng-template>
```

---

## Boas Práticas de Autenticação

1. **sessionStorage** ao invés de localStorage (mais seguro)
2. **Margem de segurança** na validação de expiração do token
3. **Logout automático** em erro 401
4. **BehaviorSubject** para estado reativo
5. **Guard baseado em Observable** para sincronização
6. **Limpar tudo** no logout (token + usuário)

---

# 7. Roteamento e Navegação

## Configuração de Rotas

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  // Rotas públicas
  { path: '', component: HomeComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'redefinir-senha', component: RedefinirSenhaComponent },
  { path: 'termos-de-uso', component: TermosComponent },
  { path: 'politica-privacidade', component: PoliticaComponent },

  // Rotas protegidas
  { path: 'conta', component: AreaUsuarioComponent, canActivate: [AuthGuard] },

  // Fallback (404)
  { path: '**', redirectTo: '' }
];
```

---

## Configuração do Router

```typescript
// src/app/app.config.ts
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
  ],
};
```

---

## Tipos de Rotas

### Rota Simples

```typescript
{ path: 'login', component: LoginComponent }
```

### Rota com Parâmetros

```typescript
{ path: 'produto/:id', component: ProdutoDetalheComponent }

// No componente:
export class ProdutoDetalheComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // ou reativo:
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
    });
  }
}
```

### Rota Protegida

```typescript
{ 
  path: 'conta', 
  component: AreaUsuarioComponent, 
  canActivate: [AuthGuard] 
}
```

### Rota com Query Params

```typescript
// URL: /produtos?categoria=moveis&cor=azul

ngOnInit() {
  this.route.queryParamMap.subscribe(params => {
    const categoria = params.get('categoria');
    const cor = params.get('cor');
  });
}
```

### Rota de Redirecionamento

```typescript
{ path: 'home', redirectTo: '', pathMatch: 'full' }
```

### Rota Wildcard (404)

```typescript
{ path: '**', redirectTo: '' }
// ou
{ path: '**', component: NotFoundComponent }
```

---

## Navegação

### RouterLink (Template)

```html
<a routerLink="/login">Entrar</a>

<a [routerLink]="['/produto', produto.id]">Ver Produto</a>

<a [routerLink]="['/produtos']" [queryParams]="{ categoria: 'moveis' }">Móveis</a>

<a routerLink="/catalogo" 
   routerLinkActive="text-[#711EAA] font-bold"
   [routerLinkActiveOptions]="{ exact: true }">
  Catálogo
</a>
```

### Router (Programático)

```typescript
export class LoginComponent {
  private readonly router = inject(Router);

  irParaHome() {
    this.router.navigate(['/']);
  }

  irParaProduto(id: number) {
    this.router.navigate(['/produto', id]);
  }

  pesquisar(termo: string) {
    this.router.navigate(['/produtos'], { 
      queryParams: { busca: termo } 
    });
  }

  fazerLogin() {
    this.authService.entrar(dados).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => { /* ... */ }
    });
  }
}
```

---

## Guards

### CanActivate

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.usuarioLogado$.pipe(
      map(usuario => {
        if (usuario) return true;
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
```

### Functional Guard (Angular 16+)

```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogado()) return true;
  return router.createUrlTree(['/login']);
};

// Uso:
{ path: 'conta', component: AreaUsuarioComponent, canActivate: [authGuard] }
```

---

## Boas Práticas de Roteamento

1. **RouterLink** ao invés de `href` para navegação interna
2. **routerLinkActive** para indicar página atual
3. **Guards** para proteger rotas autenticadas
4. **scrollPositionRestoration** para UX
5. **Fallback `**`** sempre no final do array de rotas
6. **pathMatch: 'full'** para redirecionamentos exatos
7. **Query params** para filtros, **path params** para identificadores

---

# 8. Estilização com Tailwind CSS

## Configuração

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        glacial: ['"Glacial Indifference"', 'sans-serif']
      }
    },
  },
  plugins: [],
}
```

### styles.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import 'ngx-toastr/toastr';

@layer utilities {
  .min-h-screen-minus-footer {
    min-height: calc(100svh - var(--footer-h, 0px));
  }
}
```

---

## Gradientes

```html
<!-- Gradiente principal (roxo → azul) -->
<div class="bg-gradient-to-br from-[#A839F7] via-[#7D63F9] to-[#52A2F7]">

<!-- Gradiente para botões -->
<button class="bg-gradient-to-br from-[#A839F7] via-[#7D63F9] to-[#52A2F7]">

<!-- Gradiente para textos -->
<span class="bg-gradient-to-br from-[#A839F7] via-[#7D63F9] to-[#52A2F7] bg-clip-text text-transparent">
```

---

## Componentes Comuns

### Botões

```html
<!-- Botão primário (gradiente) -->
<button class="rounded-full bg-gradient-to-br from-[#A839F7] via-[#7D63F9] to-[#52A2F7] px-6 py-3 text-white font-semibold transition hover:opacity-90 disabled:opacity-50">
  Enviar
</button>

<!-- Botão secundário (outline) -->
<button class="rounded-full border-2 border-[#711EAA] px-6 py-3 text-[#711EAA] font-semibold transition hover:bg-[#711EAA] hover:text-white">
  Cancelar
</button>

<!-- Botão com loading -->
<button [disabled]="enviando" class="rounded-full bg-gradient-to-br from-[#A839F7] to-[#52A2F7] px-6 py-3 text-white disabled:opacity-50">
  {{ enviando ? 'Enviando...' : 'Enviar' }}
</button>
```

### Inputs

```html
<!-- Input padrão -->
<input 
  type="text" 
  class="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 focus:border-[#711EAA] focus:outline-none focus:ring-1 focus:ring-[#711EAA]"
  [class.border-red-500]="campoInvalido('campo')"
>

<!-- Input com ícone -->
<div class="relative">
  <input type="email" class="w-full rounded-xl border bg-gray-100 pl-10 pr-4 py-3">
  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
    <i class="fas fa-envelope"></i>
  </span>
</div>
```

### Cards

```html
<div class="rounded-2xl bg-white p-6 shadow-lg">
  <h3 class="text-xl font-bold text-gray-800">Título</h3>
  <p class="mt-2 text-gray-600">Conteúdo do card</p>
</div>
```

### Mensagens de Erro

```html
<span *ngIf="campoErro('email', 'required')" class="text-xs text-red-500">
  E-mail é obrigatório
</span>

<p *ngIf="erroMsg" class="mt-4 text-center text-sm text-red-500">
  {{ erroMsg }}
</p>
```

### Mensagens de Sucesso

```html
<p *ngIf="sucessoMsg" class="mt-4 text-center text-sm text-green-600">
  {{ sucessoMsg }}
</p>
```

---

## Responsividade

### Breakpoints do Tailwind

| Prefixo | Largura mínima | Descrição |
|---------|----------------|-----------|
| `sm` | 640px | Celular grande |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop grande |
| `2xl` | 1536px | Tela muito grande |

### Exemplos

```html
<div class="px-4 md:px-6 lg:px-8">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<h1 class="text-2xl md:text-3xl lg:text-4xl">
<div class="hidden md:block">Visível apenas em desktop</div>
<div class="md:hidden">Visível apenas em mobile</div>
<div class="flex flex-col md:flex-row items-center gap-4">
```

---

## Animações

### Classes de Animação do Tailwind

```html
<div class="animate-pulse">
<div class="animate-spin">
<div class="animate-bounce">
<div class="opacity-0 transition-opacity duration-300" [class.opacity-100]="visivel">
```

### Transições

```html
<button class="transition duration-200 hover:opacity-90">
<a class="text-gray-600 transition-colors hover:text-[#711EAA]">
<div class="transition-transform hover:scale-105">
```

---

## Padrões de Layout

### Container centralizado

```html
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
```

### Seção com espaçamento

```html
<section class="py-16 md:py-24">
  <div class="mx-auto max-w-7xl px-4">
    <!-- conteúdo -->
  </div>
</section>
```

### Centralizar vertical e horizontal

```html
<div class="flex min-h-screen items-center justify-center">
```

---

## Boas Práticas de Estilização

1. **rounded-full** para botões, **rounded-xl** para inputs/cards
2. **Gradiente da marca** para CTAs principais
3. **Cores em hex** usando `[]` notation: `text-[#711EAA]`
4. **Mobile-first**: escreva classes base e adicione prefixos responsivos
5. **Transições** em elementos interativos
6. **focus:outline-none focus:ring** para acessibilidade

---

# 9. Convenções de Código

## Nomenclatura

### Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente | `kebab-case.component.ts` | `catalogo-slider.component.ts` |
| Serviço | `kebab-case.service.ts` | `produtos.service.ts` |
| Guard | `kebab-case.guard.ts` | `auth.guard.ts` |
| Interceptor | `kebab-case.interceptor.ts` | `auth.interceptor.ts` |
| Interface | `kebab-case.model.ts` | `usuario-logado.model.ts` |
| Request | `kebab-case.request.ts` | `login.request.ts` |
| Formulário | `kebab-case.formulario.ts` | `cadastro.formulario.ts` |
| Utils | `kebab-case.utils.ts` | `funcoes-utilitarias.utils.ts` |

### Classes e Interfaces

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Classe | `PascalCase` | `LoginComponent` |
| Interface | `IPascalCase` | `IUsuarioLogado` |
| Request DTO | `PascalCaseRequest` | `LoginRequest` |
| Response DTO | `PascalCaseResponse` | `LoginResponse` |
| Service | `PascalCaseService` | `AuthService` |
| Guard | `PascalCaseGuard` | `AuthGuard` |

### Variáveis e Métodos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Variável | `camelCase` | `usuarioLogado` |
| Método | `camelCase` | `fazerLogin()` |
| Constante | `UPPER_SNAKE_CASE` | `LOGIN_FORM_CONFIG` |
| Observable | `camelCase$` | `usuarioLogado$` |
| Subject | `camelCaseSubject` | `usuarioSubject` |

---

## Modificadores de Acesso

### Ordem de Declaração

```typescript
export class ExemploComponent {
  // 1. Propriedades estáticas
  static readonly VERSION = '1.0.0';

  // 2. Injeções (readonly)
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // 3. Propriedades públicas
  formulario!: FormGroup;
  itens: Item[] = [];

  // 4. Propriedades privadas
  private carregando = false;

  // 5. Constructor
  constructor() { }

  // 6. Lifecycle hooks
  ngOnInit(): void { }
  ngOnDestroy(): void { }

  // 7. Métodos públicos
  enviar(): void { }

  // 8. Métodos privados
  private validar(): boolean { }
}
```

### Uso de readonly

```typescript
// ✅ Correto - injeções sempre readonly
private readonly http = inject(HttpClient);
private readonly authService = inject(AuthService);

// ✅ Correto - constantes
private readonly urlBase = environment.apiBaseUrl;

// ❌ Evitar
private http = inject(HttpClient);
```

---

## Imports

### Ordem de Imports

```typescript
// 1. Angular core
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// 2. Angular modules
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// 3. RxJS
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, finalize, catchError } from 'rxjs/operators';

// 4. Bibliotecas externas
import { ToastrService } from 'ngx-toastr';

// 5. Imports locais - Services
import { AuthService } from '../../services/auth.service';
import { FormService } from '../../services/forms.service';

// 6. Imports locais - Models
import { IUsuarioLogado } from '../../models/usuario-logado.model';
import { LoginRequest } from '../../models/requests/login.request';

// 7. Imports locais - Formulários
import { LOGIN_FORM_CONFIG } from '../../formularios/login.formulario';

// 8. Imports locais - Utils
import { validarSenhasIguais } from '../../utils/funcoes-utilitarias.utils';
```

---

## Tipagem

### Sempre Tipar

```typescript
// ✅ Correto
itens: IProduto[] = [];
usuario: IUsuarioLogado | null = null;
carregando: boolean = false;

// ❌ Evitar
itens = [];
usuario = null;
carregando = false;
```

### Retornos de Métodos

```typescript
// ✅ Correto
campoInvalido(nome: string): boolean {
  return !!this.formulario.get(nome)?.invalid;
}

pesquisar(): Observable<IProduto[]> {
  return this.http.get<IProduto[]>(this.url);
}

// ❌ Evitar (retorno implícito)
campoInvalido(nome: string) {
  return !!this.formulario.get(nome)?.invalid;
}
```

---

## Operadores de Null Safety

### Optional Chaining (?.)

```typescript
// ✅ Correto
const nome = usuario?.nome;
const id = this.formulario.get('id')?.value;

// ❌ Evitar
const nome = usuario && usuario.nome;
```

### Nullish Coalescing (??)

```typescript
// ✅ Correto
const nome = usuario?.nome ?? 'Anônimo';
const valor = this.formulario.get('campo')?.value ?? '';

// ❌ Evitar
const nome = usuario?.nome || 'Anônimo'; // Problema com string vazia
```

### Non-null Assertion (!)

```typescript
// ✅ Usar com cautela - quando você TEM CERTEZA que não é null
formulario!: FormGroup; // Será inicializado no ngOnInit

// ❌ Evitar uso excessivo
const nome = usuario!.nome; // Pode causar erro runtime
```

---

## Strings

### Template Literals

```typescript
// ✅ Correto
const url = `${this.baseUrl}/produtos/${id}`;
const mensagem = `Olá, ${usuario.nome}!`;

// ❌ Evitar
const url = this.baseUrl + '/produtos/' + id;
```

### Trim em Inputs

```typescript
// ✅ Sempre fazer trim em valores de formulário
const nome = String(this.formulario.get('nome')?.value ?? '').trim();
const email = String(this.formulario.get('email')?.value ?? '').trim();
```

---

## Funções

### Arrow Functions para Callbacks

```typescript
// ✅ Correto
this.service.buscar().subscribe({
  next: (res) => this.itens = res,
  error: (err) => this.erro = err
});

this.itens.filter(item => item.ativo);
this.itens.map(item => item.nome);

// ❌ Evitar
this.itens.filter(function(item) { return item.ativo; });
```

### Métodos de Classe para Lógica Complexa

```typescript
// ✅ Correto - extrair para método
private obterMensagemErro(erro: any): string {
  if (erro?.error?.mensagem) return String(erro.error.mensagem);
  return 'Erro desconhecido';
}

// ❌ Evitar - lógica inline complexa
.subscribe({
  error: (erro) => {
    if (erro?.error?.mensagem) this.erroMsg = erro.error.mensagem;
    else if (erro?.error) this.erroMsg = erro.error;
  }
});
```

---

## Observables

### Padrão de Subscribe

```typescript
// ✅ Correto
this.service.buscar().subscribe({
  next: (res) => {
    this.itens = res;
    this.carregando = false;
  },
  error: (err) => {
    this.erro = this.obterMensagemErro(err);
    this.carregando = false;
  }
});

// ✅ Com finalize para cleanup
this.service.buscar()
  .pipe(finalize(() => this.carregando = false))
  .subscribe({
    next: (res) => this.itens = res,
    error: (err) => this.erro = this.obterMensagemErro(err)
  });
```

### Naming de Observables

```typescript
// ✅ Correto - sufixo $
public usuarioLogado$: Observable<IUsuarioLogado | null>;
public itens$: Observable<IProduto[]>;

// Subject sem sufixo
private usuarioSubject = new BehaviorSubject<IUsuarioLogado | null>(null);
```

---

## Comentários

### Quando Comentar

```typescript
// ✅ Comentar decisões não óbvias
// Margem de 30 segundos para evitar token expirar durante requisição
isTokenValido(margemSegundos = 30): boolean { }

// ✅ TODO para pendências
// TODO: Implementar refresh token

// ❌ Evitar comentários óbvios
// Retorna true se o usuário está logado
estaLogado(): boolean { }
```

### JSDoc para APIs Públicas

```typescript
/**
 * Faz login do usuário e armazena token.
 * @param dados Credenciais de login
 * @returns Observable com dados do usuário logado
 */
entrar(dados: LoginRequest): Observable<IUsuarioLogado> { }
```

---

## Boas Práticas Gerais de Código

1. **const** por padrão, **let** quando necessário, **nunca var**
2. **readonly** em injeções e constantes
3. **Tipagem explícita** em parâmetros e retornos
4. **Early return** para reduzir aninhamento
5. **Métodos pequenos** com responsabilidade única
6. **Nomes descritivos** que expliquem o propósito
7. **Evitar magic numbers** — usar constantes nomeadas
8. **finalize()** para garantir cleanup em requisições

---

# 10. Tratamento de Erros

## Padrão de Tratamento

Todos os componentes que fazem requisições HTTP devem implementar o método `obterMensagemErro()`.

---

## Método Padrão

```typescript
private obterMensagemErro(erro: any): string {
  // 1. Mensagem estruturada da API
  if (erro?.error?.mensagem) {
    return String(erro.error.mensagem);
  }

  // 2. Erro como string (parse de stack trace)
  if (erro?.error && typeof erro.error === 'string') {
    const msg = erro.error.split(' at ')[0];
    const afterColon = msg.split(':').pop()?.trim();
    return afterColon || msg.trim();
  }

  // 3. Array de erros de validação
  if (Array.isArray(erro?.error?.errors) && erro.error.errors.length) {
    return String(erro.error.errors[0]);
  }

  // 4. Outras estruturas de erro
  if (erro?.error?.message) return String(erro.error.message);
  if (erro?.message) return String(erro.message);

  // 5. Mensagem padrão
  return 'Não foi possível concluir a operação. Tente novamente.';
}
```

---

## Variações por Contexto

### Login

```typescript
private obterMensagemErro(erro: any): string {
  if (erro?.error && typeof erro.error === 'string') {
    const msg = erro.error.split(' at ')[0];
    const afterColon = msg.split(':').pop()?.trim();
    return afterColon || msg.trim();
  }
  return 'Não foi possível realizar o login. Tente novamente.';
}
```

### Cadastro

```typescript
private obterMensagemErro(erro: any): string {
  if (erro?.error?.mensagem) return String(erro.error.mensagem);

  if (erro?.error && typeof erro.error === 'string') {
    const msg = erro.error.split(' at ')[0];
    const afterColon = msg.split(':').pop()?.trim();
    return afterColon || msg.trim();
  }

  if (Array.isArray(erro?.error?.errors) && erro.error.errors.length) {
    return String(erro.error.errors[0]);
  }

  if (erro?.error?.message) return String(erro.error.message);
  if (erro?.message) return String(erro.message);

  return 'Não foi possível concluir o cadastro. Tente novamente.';
}
```

### Fale Conosco

```typescript
private obterMensagemErro(erro: any): string {
  if (erro && typeof erro === 'object') {
    if (erro.error) {
      if (typeof erro.error === 'string') return erro.error;
      if (erro.error.erro) return String(erro.error.erro);
      if (erro.error.mensagem) return String(erro.error.mensagem);
      if (erro.error.message) return String(erro.error.message);
      if (Array.isArray(erro.error.errors) && erro.error.errors.length) {
        return String(erro.error.errors[0]);
      }
    }
    if ((erro as any).message) return String((erro as any).message);
  }
  return 'Não foi possível enviar sua mensagem. Tente novamente.';
}
```

---

## Estruturas de Erro da API

### Erro com mensagem

```json
{
  "mensagem": "E-mail já cadastrado"
}
```

### Erro com array de validação

```json
{
  "errors": [
    "O campo nome é obrigatório",
    "O campo e-mail é inválido"
  ]
}
```

### Erro como string

```
"Error: Usuário não encontrado at Function.execute..."
```

### Erro padrão

```json
{
  "message": "Internal Server Error"
}
```

---

## Uso no Componente

### Estado de Erro

```typescript
export class MeuComponent {
  erroMsg: string | null = null;
  sucessoMsg: string | null = null;
  enviando = false;

  enviar(): void {
    this.erroMsg = null;
    this.sucessoMsg = null;
    this.enviando = true;

    this.service.enviar(dados)
      .pipe(finalize(() => this.enviando = false))
      .subscribe({
        next: () => {
          this.sucessoMsg = 'Operação realizada com sucesso!';
        },
        error: (erro) => {
          this.erroMsg = this.obterMensagemErro(erro);
        }
      });
  }
}
```

### Template

```html
<p *ngIf="erroMsg" class="mt-4 text-center text-sm text-red-500">
  {{ erroMsg }}
</p>

<p *ngIf="sucessoMsg" class="mt-4 text-center text-sm text-green-600">
  {{ sucessoMsg }}
</p>
```

---

## Erros de Validação de Formulário

### No Componente

```typescript
campoInvalido(nome: string): boolean {
  const c = this.formulario.get(nome);
  return !!c && c.invalid && (this.tentouEnviar || c.touched);
}

campoErro(nome: string, erro: string): boolean {
  const c = this.formulario.get(nome);
  return !!c && (this.tentouEnviar || c.touched) && c.hasError(erro);
}
```

### No Template

```html
<input 
  formControlName="email"
  [class.border-red-500]="campoInvalido('email')"
>

<span *ngIf="campoErro('email', 'required')" class="text-xs text-red-500">
  E-mail é obrigatório
</span>

<span *ngIf="campoErro('email', 'email')" class="text-xs text-red-500">
  Formato de e-mail inválido
</span>

<span *ngIf="campoErro('email', 'maxlength')" class="text-xs text-red-500">
  E-mail muito longo
</span>
```

---

## Mensagens de Erro Comuns

| Validator | Mensagem |
|-----------|----------|
| `required` | Campo é obrigatório |
| `email` | Formato de e-mail inválido |
| `minlength` | Mínimo de X caracteres |
| `maxlength` | Máximo de X caracteres |
| `pattern` | Formato inválido |
| `senhasDiferentes` | As senhas não coincidem |

---

## Tratamento Global no Interceptor

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.sair();
      }
      console.error('HTTP Error:', err);
      return throwError(() => err);
    })
  );
};
```

---

## Boas Práticas de Tratamento de Erros

1. **Sempre limpar** `erroMsg` antes de nova requisição
2. **finalize()** para garantir que `enviando = false`
3. **Mensagens amigáveis** ao usuário (não técnicas)
4. **Log de erros** apenas em desenvolvimento
5. **Tratamento específico** por tipo de operação
6. **Prioridade** de fontes de erro (mensagem > error > default)
7. **Internacionalização** futura: usar constantes para mensagens

---

# Comandos Úteis

```bash
# Instalar dependências
npm install

# Desenvolvimento
ng serve

# Build de produção
ng build

# Gerar componente standalone
ng generate component components/nome-componente --standalone

# Gerar serviço
ng generate service services/nome-servico

# Testes
ng test
```
