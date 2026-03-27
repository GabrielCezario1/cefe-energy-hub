# Plano de Implementação — Estilização do Protótipo React no Angular 18+

> **Projeto:** CEFE Energy Hub  
> **Origem:** Protótipo React + Vite + Tailwind CSS 3 + shadcn/ui  
> **Destino:** Angular 18+ (standalone components) + **Tailwind CSS 4+**  
> **Data:** Março 2026

---

## Sumário

1. [Visão Geral da Migração](#1-visão-geral-da-migração)
2. [Tailwind CSS 4 — Mudanças Fundamentais](#2-tailwind-css-4--mudanças-fundamentais)
3. [Design System — styles.css Completo](#3-design-system--stylescss-completo)
4. [Tipografia](#4-tipografia)
5. [Sombras & Espaçamento](#5-sombras--espaçamento)
6. [Tema Claro e Escuro (Dark Mode)](#6-tema-claro-e-escuro-dark-mode)
7. [Biblioteca de Componentes UI (Equivalências)](#7-biblioteca-de-componentes-ui-equivalências)
8. [Ícones](#8-ícones)
9. [Layout Principal (Dashboard Shell)](#9-layout-principal-dashboard-shell)
10. [Páginas e Componentes por Módulo](#10-páginas-e-componentes-por-módulo)
11. [Gráficos (Recharts → ngx-charts / Chart.js)](#11-gráficos-recharts--ngx-charts--chartjs)
12. [Animações & Transições](#12-animações--transições)
13. [Responsividade](#13-responsividade)
14. [Estrutura de Pastas Angular](#14-estrutura-de-pastas-angular)
15. [Checklist de Implementação](#15-checklist-de-implementação)

---

## 1. Visão Geral da Migração

O protótipo React utiliza:

| Tecnologia React           | Equivalente Angular recomendado         |
|----------------------------|-----------------------------------------|
| Tailwind CSS 3.4           | **Tailwind CSS 4+** (CSS-first config)  |
| shadcn/ui (Radix)          | **Angular CDK + componentes próprios** ou **spartan/ui (shadcn para Angular)** |
| Recharts                   | **ngx-echarts**, **ng2-charts (Chart.js)** ou **ngx-charts** |
| Lucide React               | **lucide-angular** ou **@ng-icons/lucide** |
| class-variance-authority   | **cva** (funciona em TS puro)           |
| tailwind-merge + clsx      | **tailwind-merge** (funciona em TS puro)|
| React Router               | **Angular Router**                      |
| React Context (UnitContext)| **Angular Service + Signals/BehaviorSubject** |
| @tanstack/react-query      | **@tanstack/angular-query** ou **RxJS** |

### Abordagem recomendada: **spartan/ui**

[spartan/ui](https://www.spartan.ng/) é o port oficial do conceito shadcn/ui para Angular. Utiliza Angular CDK + Tailwind e gera componentes quase idênticos ao shadcn/ui original, minimizando reescrita de estilos.

> **Atenção:** Verificar se a versão do spartan/ui suporta Tailwind v4 nativamente. Caso contrário, o próprio spartan/ui gera CSS — basta garantir que o `@theme inline` mapeie as variáveis corretamente.

---

## 2. Tailwind CSS 4 — Mudanças Fundamentais

O protótipo React usa Tailwind CSS **v3** com `tailwind.config.ts` + `postcss.config.js`. No Angular usaremos **Tailwind CSS v4+**, que adota uma abordagem radicalmente diferente:

### 2.1 Principais diferenças v3 → v4

| Aspecto                  | Tailwind v3                              | Tailwind v4                              |
|--------------------------|------------------------------------------|------------------------------------------|
| **Configuração**         | `tailwind.config.ts` (JS/TS)            | **CSS-first** com `@theme` no próprio CSS |
| **Importação**           | `@tailwind base; components; utilities;` | `@import "tailwindcss";`                 |
| **Detecção de conteúdo** | `content: [...]` obrigatório no config   | **Automática** (sem config)              |
| **Dark mode**            | `darkMode: ["class"]` no config          | `@custom-variant dark (...)` no CSS      |
| **PostCSS**              | `postcss.config.js` + `autoprefixer`     | **Desnecessário** — usa `@tailwindcss/vite` |
| **Cores**                | HSL triplets sem `hsl()` + wrapper       | **Valores completos** `hsl(...)` diretos |
| **Tokens de tema**       | `theme.extend.colors` no config          | `@theme { --color-*: ... }` no CSS      |
| **Border radius**        | `theme.extend.borderRadius` no config    | `@theme { --radius-*: ... }` no CSS     |
| **Fontes**               | `theme.extend.fontFamily` no config      | `@theme { --font-*: ... }` no CSS       |
| **Sombras**              | `theme.extend.boxShadow` no config       | `@theme { --shadow-*: ... }` no CSS     |
| **Utilitários custom**   | `@layer utilities { ... }`               | `@utility nome { ... }`                 |
| **Plugins**              | `require('plugin')` no config            | `@plugin "plugin"` no CSS               |

### 2.2 Instalação no Angular (Vite)

```bash
npm install tailwindcss @tailwindcss/vite
```

No `angular.json` ou `vite.config.ts` (se usar Angular + Vite builder):

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

> **Angular CLI com Webpack:** Se o projeto usar o builder Webpack padrão (`@angular-devkit/build-angular`), instalar via PostCSS:
> ```bash
> npm install tailwindcss @tailwindcss/postcss postcss
> ```
> E no `postcss.config.js`:
> ```js
> module.exports = { plugins: { '@tailwindcss/postcss': {} } };
> ```

### 2.3 Mudança-chave: Cores com valores completos HSL

**Tailwind v3 (protótipo React):** variáveis CSS guardam triplets HSL sem a função:
```css
/* v3 — ❌ NÃO usar no v4 */
--primary: 37 92% 50%;
/* Usado como: hsl(var(--primary)) no tailwind.config.ts */
```

**Tailwind v4:** variáveis CSS devem conter o **valor completo da cor**:
```css
/* v4 — ✅ Correto */
--primary: hsl(37 92% 50%);
/* Usado diretamente via @theme inline */
```

Isso permite que o Tailwind v4 aplique modificadores de opacidade (ex: `bg-primary/90`) nativamente.

---

## 3. Design System — styles.css Completo

O arquivo `src/styles.css` do projeto Angular substitui tanto o antigo `index.css` quanto o `tailwind.config.ts`. Toda a configuração do design system é feita aqui.

### 3.1 Arquivo `styles.css` — Estrutura Completa

```css
/* ═══════════════════════════════════════════════════════════
   CEFE Energy Hub — Design System (Tailwind CSS v4)
   ═══════════════════════════════════════════════════════════ */

/* ─── 1. Import Tailwind v4 (substitui @tailwind base/components/utilities) ─── */
@import "tailwindcss";

/* ─── 2. Google Fonts ─── */
@import url("https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap");

/* ─── 3. Dark Mode via classe .dark (equivale ao darkMode: ["class"] do v3) ─── */
@custom-variant dark (&:where(.dark, .dark *));

/* ─── 4. Tema — Mapeamento de tokens Tailwind para variáveis CSS ─── */
/*
   @theme inline: mapeia variáveis do Tailwind (--color-*, --radius-*, --font-*)
   para nossas custom properties. O "inline" evita gerar valores estáticos,
   permitindo que :root e .dark alterem dinamicamente.
*/
@theme inline {
  /* ─── Cores Semânticas ─── */
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);

  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);

  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);

  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);

  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);

  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);

  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* ─── Sidebar ─── */
  --color-sidebar: var(--sidebar);
  --color-sidebar-background: var(--sidebar-background);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* ─── Charts ─── */
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  /* ─── Border Radius ─── */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  /* ─── Fontes ─── */
  --font-sans: var(--font-sans);
  --font-serif: var(--font-serif);
  --font-mono: var(--font-mono);
}

/* ─── 5. Variáveis do Tema Claro ─── */
:root {
  /* Cores (valores HSL completos — obrigatório no v4) */
  --background: hsl(60 4% 95%);
  --foreground: hsl(24 9% 10%);

  --card: hsl(60 9% 97%);
  --card-foreground: hsl(24 9% 10%);

  --popover: hsl(20 5% 90%);
  --popover-foreground: hsl(24 9% 10%);

  --primary: hsl(37 92% 50%);
  --primary-foreground: hsl(47 100% 96%);

  --secondary: hsl(24 5% 44%);
  --secondary-foreground: hsl(60 9% 97%);

  --muted: hsl(23 5% 82%);
  --muted-foreground: hsl(24 9% 10%);

  --accent: hsl(47 100% 96%);
  --accent-foreground: hsl(37 92% 50%);

  --destructive: hsl(0 72% 50%);
  --destructive-foreground: hsl(0 85% 97%);

  --border: hsl(23 5% 82%);
  --input: hsl(23 5% 82%);
  --ring: hsl(37 92% 50%);

  --radius: 1rem;

  /* Sidebar */
  --sidebar-background: hsl(0 0% 98%);
  --sidebar-foreground: hsl(24 9% 10%);
  --sidebar-primary: hsl(37 92% 50%);
  --sidebar-primary-foreground: hsl(47 100% 96%);
  --sidebar-accent: hsl(24 5% 44%);
  --sidebar-accent-foreground: hsl(60 9% 97%);
  --sidebar-border: hsl(23 5% 82%);
  --sidebar-ring: hsl(37 92% 50%);
  --sidebar: hsl(60 9% 97%);

  /* Charts */
  --chart-1: hsl(45 96% 64%);
  --chart-2: hsl(47 95% 53%);
  --chart-3: hsl(43 96% 56%);
  --chart-4: hsl(37 92% 50%);
  --chart-5: hsl(24 5% 44%);

  /* Fontes */
  --font-sans: 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system,
               BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
               Arial, 'Noto Sans', sans-serif;
  --font-serif: 'Source Serif Pro', ui-serif, Georgia, Cambria,
                'Times New Roman', Times, serif;
  --font-mono: 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo,
               Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;

  /* Sombras */
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs:  0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow:     0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.1);
  --shadow-lg:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 4px 6px -1px hsl(0 0% 0% / 0.1);
  --shadow-xl:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 8px 10px -1px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);

  /* Espaçamento base */
  --spacing: 0.25rem;
  --tracking-normal: 0em;
}

/* ─── 6. Variáveis do Tema Escuro ─── */
.dark {
  --background: hsl(24 9% 10%);
  --foreground: hsl(60 9% 97%);

  --card: hsl(12 6% 15%);
  --card-foreground: hsl(60 9% 97%);

  --popover: hsl(30 6% 25%);
  --popover-foreground: hsl(60 9% 97%);

  --primary: hsl(43 96% 56%);
  --primary-foreground: hsl(20 91% 14%);

  --secondary: hsl(24 5% 44%);
  --secondary-foreground: hsl(60 9% 97%);

  --muted: hsl(24 5% 44%);
  --muted-foreground: hsl(60 9% 97%);

  --accent: hsl(25 83% 14%);
  --accent-foreground: hsl(47 95% 53%);

  --destructive: hsl(0 84% 60%);
  --destructive-foreground: hsl(0 85% 97%);

  --border: hsl(33 5% 32%);
  --input: hsl(33 5% 32%);
  --ring: hsl(43 96% 56%);

  --sidebar-background: hsl(240 5.9% 10%);
  --sidebar-foreground: hsl(60 9% 97%);
  --sidebar-primary: hsl(43 96% 56%);
  --sidebar-primary-foreground: hsl(20 91% 14%);
  --sidebar-accent: hsl(47 95% 53%);
  --sidebar-accent-foreground: hsl(25 83% 14%);
  --sidebar-border: hsl(33 5% 32%);
  --sidebar-ring: hsl(43 96% 56%);
  --sidebar: hsl(12 6% 15%);

  --chart-1: hsl(45 96% 64%);
  --chart-2: hsl(48 96% 76%);
  --chart-3: hsl(43 96% 56%);
  --chart-4: hsl(37 92% 50%);
  --chart-5: hsl(33 5% 32%);

  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs:  0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow:     0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.1);
  --shadow-lg:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 4px 6px -1px hsl(0 0% 0% / 0.1);
  --shadow-xl:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 8px 10px -1px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}

/* ─── 7. Estilos Base ─── */
*,
::after,
::before,
::backdrop,
::file-selector-button {
  border-color: var(--color-border);
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
}
```

> **⚠ Importante:** No Tailwind v4, **não existe mais** `tailwind.config.ts`, `postcss.config.js` (com Vite), nem diretivas `@tailwind`. Todo o design system vive no CSS.

### 3.2 Mapeamento: Como o `@theme inline` funciona

```
@theme inline {
  --color-primary: var(--primary);    ←── Registra token do Tailwind
}                                         |
                                          ↓
:root {                                Tailwind gera classes:
  --primary: hsl(37 92% 50%);        ←── bg-primary, text-primary, border-primary
}                                         bg-primary/90 (opacidade funciona nativamente)

.dark {
  --primary: hsl(43 96% 56%);        ←── dark:bg-primary muda automaticamente
}
```

### 3.3 Migração de classes Tailwind v3 → v4

A maioria das classes utilitárias **não muda** entre v3 e v4. Principais ajustes:

| Classe v3                        | Classe v4                         | Nota                                    |
|----------------------------------|-----------------------------------|-----------------------------------------|
| `bg-opacity-50`                  | `bg-primary/50`                   | Já era preferido no v3, obrigatório v4  |
| `hsl(var(--primary))`            | `var(--color-primary)`            | Para uso inline/JS                      |
| `text-[hsl(var(--chart-1))]`     | `text-chart-1`                    | Classe nativa via `@theme`              |
| `border-l-[hsl(var(--chart-3))]` | `border-l-chart-3`               | Classe nativa via `@theme`              |
| `ring-offset-background`         | `ring-offset-background`          | Sem mudança                             |
| `stroke-muted`                   | `stroke-muted`                    | Sem mudança                             |

### 3.4 Mapeamento HEX para Referência Visual

| Token             | Light (HSL)             | Light (HEX aprox.) | Descrição                    |
|-------------------|-------------------------|---------------------|------------------------------|
| `--primary`       | `hsl(37 92% 50%)`      | `#F5A00A`           | Âmbar/laranja principal     |
| `--primary-fg`    | `hsl(47 100% 96%)`     | `#FFFBEB`           | Texto sobre primary          |
| `--secondary`     | `hsl(24 5% 44%)`       | `#726E6A`           | Cinza amarronzado            |
| `--accent`        | `hsl(47 100% 96%)`     | `#FFFBEB`           | Creme claro                  |
| `--background`    | `hsl(60 4% 95%)`       | `#F3F3F0`           | Off-white quente             |
| `--foreground`    | `hsl(24 9% 10%)`       | `#1C1B18`           | Texto principal              |
| `--card`          | `hsl(60 9% 97%)`       | `#F8F8F5`           | Fundo de cards               |
| `--muted`         | `hsl(23 5% 82%)`       | `#D4D2D0`           | Cinza suave                  |
| `--destructive`   | `hsl(0 72% 50%)`       | `#DB2424`           | Vermelho erro/alerta         |
| `--border`        | `hsl(23 5% 82%)`       | `#D4D2D0`           | Borda padrão                 |
| `--chart-1`       | `hsl(45 96% 64%)`      | `#F5C842`           | Gráfico amarelo              |
| `--chart-2`       | `hsl(47 95% 53%)`      | `#F0B90B`           | Gráfico dourado              |
| `--chart-3`       | `hsl(43 96% 56%)`      | `#EDB30F`           | Gráfico âmbar                |
| `--chart-4`       | `hsl(37 92% 50%)`      | `#F5A00A`           | Gráfico laranja              |
| `--chart-5`       | `hsl(24 5% 44%)`       | `#726E6A`           | Gráfico cinza                |

---

## 4. Tipografia

### Fontes do Google Fonts

Adicionar ao `index.html` do Angular:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&family=Source+Serif+Pro:wght@400;600;700&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet">
```

### Configuração de Fontes (no `styles.css` — via `@theme inline`)

No Tailwind v4, a configuração de fontes é feita **direto no CSS**, dentro do bloco `@theme inline` já definido na Seção 3:

```css
@theme inline {
  --font-sans: var(--font-sans);   /* → Gera classe font-sans */
  --font-serif: var(--font-serif); /* → Gera classe font-serif */
  --font-mono: var(--font-mono);   /* → Gera classe font-mono */
}
```

E os valores reais são definidos no `:root`:

```css
:root {
  --font-sans: 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system,
               BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
               Arial, 'Noto Sans', sans-serif;
  --font-serif: 'Source Serif Pro', ui-serif, Georgia, Cambria,
                'Times New Roman', Times, serif;
  --font-mono: 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo,
               Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
```

> **Diferença v3 → v4:** Não existe mais `theme.extend.fontFamily` em `tailwind.config.ts`. Tudo fica no CSS.

---

## 5. Sombras & Espaçamento

### Sombras (no `styles.css` via `:root`)

As sombras são definidas como custom properties no `:root` (já incluídas na Seção 3):

```css
:root {
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs:  0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow:     0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1);
  --shadow-md:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.1);
  --shadow-lg:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 4px 6px -1px hsl(0 0% 0% / 0.1);
  --shadow-xl:  0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 8px 10px -1px hsl(0 0% 0% / 0.1);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}
```

Classes geradas automaticamente: `shadow-2xs`, `shadow-xs`, `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`.

### Espaçamento & Border Radius

```css
:root {
  --spacing: 0.25rem;   /* Base do espaçamento (4px) → p-1 = 4px, p-4 = 16px */
  --radius: 1rem;       /* 16px → base para border-radius */
}
```

Border radius registrado no `@theme inline`:

```css
@theme inline {
  --radius-sm: calc(var(--radius) - 4px);   /* ~12px → rounded-sm */
  --radius-md: calc(var(--radius) - 2px);   /* ~14px → rounded-md */
  --radius-lg: var(--radius);               /* 16px  → rounded-lg */
  --radius-xl: calc(var(--radius) + 4px);   /* 20px  → rounded-xl */
}
```

> **Diferença v3 → v4:** Não existe mais `theme.extend.borderRadius` em JS. O `@theme inline` registra os tokens e gera as classes `rounded-sm/md/lg/xl` automaticamente.

---

## 6. Tema Claro e Escuro (Dark Mode)

### Estratégia no Tailwind v4

No Tailwind v4, **não existe mais** `darkMode: ["class"]` no config. A variante dark é registrada no CSS:

```css
/* Já incluído no styles.css (Seção 3) */
@custom-variant dark (&:where(.dark, .dark *));
```

Isso faz com que `dark:bg-background`, `dark:text-foreground` etc. funcionem **quando a classe `.dark` está presente** no `<html>` ou ascendente.

### Implementação Angular

1. Criar um `ThemeService`:

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode = signal(false);
  isDark = this.darkMode.asReadonly();

  toggle(): void {
    this.darkMode.update(v => !v);
    document.documentElement.classList.toggle('dark', this.darkMode());
    localStorage.setItem('theme', this.darkMode() ? 'dark' : 'light');
  }

  init(): void {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    this.darkMode.set(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }
}
```

2. Chamar `themeService.init()` no `APP_INITIALIZER` ou no `AppComponent.ngOnInit()`.

---

## 7. Biblioteca de Componentes UI (Equivalências)

### Opção A — spartan/ui (Recomendada)

| Componente React (shadcn/ui)     | Componente spartan/ui             |
|----------------------------------|-----------------------------------|
| `<Button>`                       | `<hlm-button>` / `hlmBtn`        |
| `<Card>`                         | `<hlm-card>`                      |
| `<Badge>`                        | `<hlm-badge>`                     |
| `<Input>`                        | `<hlm-input>`                     |
| `<Label>`                        | `<hlm-label>`                     |
| `<Select>`                       | `<brn-select>` + `<hlm-select>`  |
| `<Dialog>`                       | `<brn-dialog>` + `<hlm-dialog>`  |
| `<DropdownMenu>`                 | `<brn-menu>` + `<hlm-menu>`      |
| `<Tabs>`                         | `<brn-tabs>` + `<hlm-tabs>`      |
| `<Table>`                        | `<hlm-table>`                     |
| `<Tooltip>`                      | `<brn-tooltip>` + `<hlm-tooltip>`|
| `<Sheet>` (mobile sidebar)       | `<brn-sheet>` + `<hlm-sheet>`    |
| `<Separator>`                    | `<hlm-separator>`                 |
| `<Progress>`                     | `<hlm-progress>`                  |
| `<Sonner>` / `<Toaster>`        | `<hlm-sonner>` ou hot-toast      |
| `<ScrollArea>`                   | `<brn-scroll-area>`              |
| `<Accordion>`                    | `<brn-accordion>` + `<hlm-accordion>` |
| `<Skeleton>`                     | `<hlm-skeleton>`                  |

### Opção B — Construir sobre Angular CDK

Se preferir não usar spartan/ui, criar os componentes manualmente:

- Usar `@angular/cdk/overlay` para dialogs/dropdowns/popovers
- Usar `@angular/cdk/a11y` para focus trap e keyboard navigation
- Aplicar as mesmas classes Tailwind do protótipo diretamente

### Instalação spartan/ui

```bash
npx @spartan-ng/cli@latest init
npx @spartan-ng/cli@latest add button card badge input label select dialog dropdown-menu tabs table tooltip sheet separator progress accordion skeleton scroll-area
```

### Utilitário `cn()` para Angular

Reutilizar a mesma lógica do protótipo:

```typescript
// src/app/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### Variantes de Botão (CVA)

Manter a mesma definição `buttonVariants` usando `class-variance-authority`:

```typescript
import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);
```

---

## 8. Ícones

### Lucide Icons para Angular

```bash
npm install lucide-angular
```

### Uso nos templates

```html
<lucide-icon name="zap" [size]="16"></lucide-icon>
<lucide-icon name="dollar-sign" [size]="16"></lucide-icon>
```

### Ícones utilizados no protótipo

| Contexto                          | Ícones Lucide                                                |
|-----------------------------------|--------------------------------------------------------------|
| Sidebar / Navegação               | `Zap`, `DollarSign`, `Radio`, `Battery`, `FileCheck`, `Wrench`, `Users`, `Headphones`, `Fuel`, `TrendingUp`, `Building2` |
| Navbar                            | `Bell`, `ChevronDown`, `LogOut`, `Settings`, `PanelLeft`     |
| Dashboard Home                    | `Activity`, `AlertTriangle`, `Sun`, `Thermometer`            |
| Financial                         | `PiggyBank`, `Clock`, `Pencil`                               |
| Energy Management                 | `Building2`, `Pencil`, `Send`, `Gauge`                       |
| Warehouse Detail                  | `ArrowLeft`                                                   |
| Landing Page                      | `Zap`, `DollarSign`, `Activity`, `BatteryCharging`, `FileCheck`, `Wrench`, `Users`, `Headset`, `Fuel`, `TrendingUp` |
| Unit Selection                    | `MapPin`, `Zap`                                               |

---

## 9. Layout Principal (Dashboard Shell)

### Estrutura do Layout

```
┌──────────────────────────────────────────────┐
│ Navbar (h-16, sticky, bg-card, border-b)     │
├────────┬─────────────────────────────────────┤
│        │                                     │
│ Side-  │  <main> content (flex-1, p-6,       │
│ bar    │         overflow-auto)               │
│ (16rem │                                     │
│  icon: │                                     │
│  3rem) │                                     │
│        │                                     │
└────────┴─────────────────────────────────────┘
```

### Angular Component Structure

```typescript
// dashboard-layout.component.ts
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  template: `
    <div class="min-h-screen flex w-full bg-background">
      <app-dashboard-sidebar />
      <div class="flex-1 flex flex-col w-full">
        <app-dashboard-navbar />
        <main class="flex-1 p-6 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  imports: [DashboardSidebarComponent, DashboardNavbarComponent, RouterOutlet],
})
export class DashboardLayoutComponent {}
```

### Navbar — Classes Chave

```html
<header class="h-16 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-50">
```

**Elementos:**
- Logo `h-8 w-8` + título `font-bold text-lg`
- Select de unidade centralizado (`flex-1 flex justify-center`, max-w-sm)
- Notificações (dropdown com badge `absolute -top-1 -right-1`)
- Menu do usuário (dropdown)

### Sidebar — Classes Chave

```
Sidebar expandida:  width: 16rem (--sidebar-width)
Sidebar colapsada:  width: 3rem  (--sidebar-width-icon)
Sidebar mobile:     width: 18rem (Sheet overlay)
```

**Cores (Tailwind v4 — via `@theme inline`):**
- Background: `bg-sidebar` → `var(--color-sidebar)`
- Texto: `text-sidebar-foreground` → `var(--color-sidebar-foreground)`
- Item ativo: `bg-sidebar-primary text-sidebar-primary-foreground`
- Hover: `bg-sidebar-accent text-sidebar-accent-foreground`
- Borda: `border-sidebar-border`

**Menu items do sidebar:**

| Título                       | Rota                              | Ícone       |
|------------------------------|-----------------------------------|-------------|
| Monitoramento & Geração      | `/dashboard`                      | Zap         |
| Gestão Financeira             | `/dashboard/financial`            | DollarSign  |
| Telemetria & Diagnóstico      | `/dashboard/telemetry`            | Radio       |
| Gestão Zero Grid              | `/dashboard/zero-grid`            | Battery     |
| Compliance & Auditoria        | `/dashboard/compliance`           | FileCheck   |
| Manutenção                    | `/dashboard/maintenance`          | Wrench      |
| Comunicação & Parcerias       | `/dashboard/communication`        | Users       |
| Suporte Técnico               | `/dashboard/support`              | Headphones  |
| Gestão de Geradores           | `/dashboard/generators`           | Fuel        |
| Resultado Econômico           | `/dashboard/economic-results`     | TrendingUp  |
| Gerenciamento de Energia      | `/dashboard/energy-management`    | Building2   |

---

## 10. Páginas e Componentes por Módulo

### 9.1 Landing Page (`/`)

**Layout:** Full-screen, sem sidebar/navbar

| Seção           | Estilização                                                                       |
|-----------------|-----------------------------------------------------------------------------------|
| Hero            | `min-h-screen relative` + imagem de fundo + overlay `bg-black/60`                |
| Nav (hero)      | `h-16 flex items-center justify-between px-6 md:px-12`                           |
| Botão CTA       | `bg-primary hover:bg-primary/90 text-lg px-10 py-6`                             |
| Título          | `text-4xl md:text-6xl font-bold text-white`                                     |
| Subtítulo       | `text-xl md:text-2xl text-white/90`                                              |
| Features        | Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`           |
| Feature Card    | `bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1`        |
| Footer parceiros| `border-t border-white/10`, textos `text-white/80`                               |

**Cores dos ícones das features:**
- `text-yellow-500`, `text-green-500`, `text-blue-500`, `text-emerald-500`
- `text-orange-500`, `text-slate-500`, `text-purple-500`, `text-cyan-500`
- `text-amber-600`, `text-green-600`

### 9.2 Login Page (`/login`)

**Layout:** Centralizado, gradient de fundo

```
bg-gradient-to-br from-background via-accent/20 to-primary/10
```

- Card central: `max-w-md shadow-xl`
- Logo: `h-20 w-20` centralizado
- Título: `text-3xl font-bold`
- Botão submit: `w-full` variante default

### 9.3 Unit Selection (`/select-unit`)

**Layout:** Gradient de fundo (mesmo do login)

```
bg-gradient-to-br from-background via-accent/20 to-primary/10 p-8
```

- Agrupamento por estado com ícone `MapPin`
- Cards de unidade: `hover:shadow-lg hover:scale-105 hover:border-primary`
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

### 9.4 Dashboard Home (`/dashboard`)

**KPI Cards Pattern:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <card class="border-l-4 border-l-primary">
    <!-- title text-sm font-medium -->
    <!-- value text-3xl font-bold  -->
    <!-- subtitle text-xs text-muted-foreground -->
  </card>
</div>
```

Cores das bordas dos KPIs: `border-l-primary`, `border-l-chart-1`, `border-l-chart-2`, `border-l-chart-3`

**Alertas:**
- Alto: `bg-destructive/10 border border-destructive/20` + Badge `destructive`
- Médio: `bg-chart-3/10 border border-chart-3/20` + Badge `outline`
- Info: `bg-muted border border-border` + Badge `secondary`

### 9.5 Financial (`/dashboard/financial`)

- KPI Cards 3 colunas: `grid-cols-1 md:grid-cols-3`
- Gráficos: BarChart (economia mensal) + LineChart (payback)
- Modais de edição: Dialog com formulários (investimento, tarifa)
- Tooltip dos gráficos: `backgroundColor: var(--color-card)`, `border: 1px solid var(--color-border)`, `borderRadius: 8px`

### 9.6 Energy Management (`/dashboard/energy-management`)

- MonthSelector (Select com meses disponíveis)
- CondominiumKpiCards (4 colunas, border-l com cores de chart)
- WarehouseCardList (grid de cards coloridos por warehouse)

**Cores dos cards de warehouse (Tailwind utilities):**
```
border-l-blue-500,    bg-blue-50    dark:bg-blue-950/30
border-l-orange-500,  bg-orange-50  dark:bg-orange-950/30
border-l-emerald-500, bg-emerald-50 dark:bg-emerald-950/30
border-l-purple-500,  bg-purple-50  dark:bg-purple-950/30
border-l-rose-500,    bg-rose-50    dark:bg-rose-950/30
border-l-amber-500,   bg-amber-50   dark:bg-amber-950/30
border-l-cyan-500,    bg-cyan-50    dark:bg-cyan-950/30
border-l-indigo-500,  bg-indigo-50  dark:bg-indigo-950/30
```

### 9.7 Warehouse Detail (`/dashboard/energy-management/warehouse/:id`)

- Botão voltar: `variant="ghost" size="icon"`
- KPI Cards 2 colunas
- Grid 2 colunas: DailyChart + MonthlyChart
- Tabs: "Dados Diários" / "Registros MD50 (15 min)"
- Tabelas com scroll para dados extensos

---

## 11. Gráficos (Recharts → ngx-charts / Chart.js)

### Estilo dos Gráficos

Todos os gráficos do protótipo usam cores do design system:

```typescript
// Cores padrão para gráficos (Tailwind v4 — valores completos via CSS vars)
const CHART_COLORS = {
  primary:     'var(--color-primary)',      // Barras/linhas principais
  chart1:      'var(--color-chart-1)',      // Série secundária
  chart2:      'var(--color-chart-2)',      // Série terciária
  chart3:      'var(--color-chart-3)',
  chart4:      'var(--color-chart-4)',
  chart5:      'var(--color-chart-5)',
  destructive: 'var(--color-destructive)',  // Linha de investimento (payback)
};
```

> **Diferença v3 → v4:** No v3 usava-se `hsl(var(--primary))` porque as variáveis guardavam triplets HSL sem a função. No v4, as variáveis já contêm o valor completo `hsl(...)`, então basta usar `var(--color-primary)` (mapeado via `@theme inline`).

### Tooltip Customizado

```typescript
// Estilo do tooltip em todos os gráficos (Tailwind v4)
tooltipStyle = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
};
```

### Grid dos Gráficos

```
CartesianGrid: strokeDasharray="3 3", class="stroke-muted"
```

### Gráficos por Página

| Página             | Tipo           | Bibliotecas Angular sugeridas |
|--------------------|----------------|-------------------------------|
| DashboardHome      | LineChart       | ng2-charts (Line)            |
| Financial          | BarChart, Line  | ng2-charts (Bar, Line)       |
| WarehouseDetail    | BarChart (x2)   | ng2-charts (Bar stacked)     |

### Recomendação: `ng2-charts` (wrapper Chart.js)

```bash
npm install ng2-charts chart.js
```

---

## 12. Animações & Transições

### Animações CSS do Protótipo

```css
/* Entrada de página */
.animate-in.fade-in.duration-500 {
  animation: fadeIn 500ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Accordion */
@keyframes accordion-down {
  from { height: 0; }
  to   { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to   { height: 0; }
}
```

### Transições em Componentes

| Componente      | Classe Tailwind                                                |
|-----------------|----------------------------------------------------------------|
| Card hover      | `transition-all duration-300 hover:shadow-lg hover:-translate-y-1` |
| Unit card hover | `transition-all hover:shadow-lg hover:scale-105 hover:border-primary` |
| Warehouse card  | `hover:shadow-lg transition-all hover:scale-[1.02]`           |
| Rota parceiros  | `hover:text-white transition-colors`                           |
| Botão CTA hero  | `hover:bg-white/20` (transição de cor nativa Tailwind)         |

### Implementação Angular

Usar Angular Animations ou apenas classes Tailwind (preferível para simplicidade):

```typescript
// Se necessário Angular Animations para rotas:
trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('500ms ease-out', style({ opacity: 1 })),
  ]),
])
```

---

## 13. Responsividade

### Breakpoints (Tailwind padrão)

| Prefixo  | Min-width | Uso no protótipo                              |
|----------|-----------|-----------------------------------------------|
| `sm:`    | 640px     | Navbar: items visíveis, layout flex-row       |
| `md:`    | 768px     | Sidebar visível, grids 2 colunas              |
| `lg:`    | 1024px    | Grids 3 colunas, layout 2-col side-by-side    |
| `xl:`    | 1280px    | Grid features 4 colunas                       |
| `2xl:`   | 1536px    | Container max-width                           |

### Comportamento Mobile

- **Sidebar:** oculta no mobile, abre como Sheet (overlay)
- **Navbar:** elementos como "Menu" e nome de usuário ficam `hidden sm:inline`
- **KPI Cards:** full width → 2 colunas → 4 colunas
- **Gráficos:** `ResponsiveContainer width="100%"` (Chart.js suporta nativamente)

---

## 14. Estrutura de Pastas Angular

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── theme.service.ts          # Dark mode toggle
│   │   │   ├── unit.service.ts           # UnitContext → Angular Service
│   │   │   └── toast.service.ts          # Notificações
│   │   ├── guards/
│   │   │   └── unit-selected.guard.ts    # Redireciona se sem unidade
│   │   └── interceptors/
│   │       └── api.interceptor.ts
│   │
│   ├── shared/
│   │   ├── ui/                           # Componentes UI base (spartan/ui ou custom)
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   ├── badge/
│   │   │   ├── input/
│   │   │   ├── label/
│   │   │   ├── select/
│   │   │   ├── dialog/
│   │   │   ├── dropdown-menu/
│   │   │   ├── tabs/
│   │   │   ├── table/
│   │   │   ├── tooltip/
│   │   │   ├── sheet/
│   │   │   ├── separator/
│   │   │   ├── progress/
│   │   │   ├── skeleton/
│   │   │   └── scroll-area/
│   │   ├── components/
│   │   │   └── nav-link/
│   │   └── lib/
│   │       ├── utils.ts                  # cn() helper
│   │       ├── units.ts                  # Dados de unidades
│   │       └── energy-mock-data.ts       # Mock data
│   │
│   ├── features/
│   │   ├── landing/
│   │   │   └── landing.component.ts
│   │   ├── login/
│   │   │   └── login.component.ts
│   │   ├── unit-selection/
│   │   │   └── unit-selection.component.ts
│   │   └── dashboard/
│   │       ├── layout/
│   │       │   ├── dashboard-layout.component.ts
│   │       │   ├── dashboard-navbar.component.ts
│   │       │   └── dashboard-sidebar.component.ts
│   │       ├── home/
│   │       │   └── dashboard-home.component.ts
│   │       ├── financial/
│   │       │   └── financial.component.ts
│   │       ├── telemetry/
│   │       ├── zero-grid/
│   │       ├── compliance/
│   │       ├── maintenance/
│   │       ├── communication/
│   │       ├── support/
│   │       ├── generators/
│   │       ├── economic-results/
│   │       └── energy-management/
│   │           ├── energy-management.component.ts
│   │           ├── warehouse-detail.component.ts
│   │           └── components/
│   │               ├── condominium-kpi-cards.component.ts
│   │               ├── warehouse-card.component.ts
│   │               ├── warehouse-card-list.component.ts
│   │               ├── warehouse-kpi-cards.component.ts
│   │               ├── warehouse-daily-chart.component.ts
│   │               ├── warehouse-monthly-chart.component.ts
│   │               ├── warehouse-daily-table.component.ts
│   │               ├── warehouse-registers-table.component.ts
│   │               ├── month-selector.component.ts
│   │               ├── invoice-demo-table.component.ts
│   │               ├── invoice-edit-modal.component.ts
│   │               └── send-invoice-modal.component.ts
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── assets/
│   ├── cefe-logo.png
│   └── marble-quarry-hero.png
│
├── styles.css                             # Variáveis CSS globais + Tailwind directives
├── index.html
└── environments/
```

---

## 15. Checklist de Implementação

### Fase 1 — Setup & Design System
- [ ] Criar projeto Angular 18+ com standalone components (`ng new cefe-energy-hub --standalone`)
- [ ] Instalar e configurar Tailwind CSS 3.4+
- [ ] Copiar variáveis CSS completas para `styles.css` (light + dark)
- [ ] Configurar `tailwind.config.ts` (cores, fontes, border-radius, animações)
- [ ] Importar Google Fonts no `index.html`
- [ ] Instalar `class-variance-authority`, `clsx`, `tailwind-merge`
- [ ] Criar `cn()` utility em `shared/lib/utils.ts`
- [ ] Instalar `lucide-angular`
- [ ] Implementar `ThemeService` (dark mode)

### Fase 2 — Componentes UI Base
- [ ] Instalar spartan/ui **OU** criar componentes UI manualmente
- [ ] Button (com variantes: default, destructive, outline, secondary, ghost, link)
- [ ] Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- [ ] Badge (default, secondary, outline, destructive)
- [ ] Input, Label, Textarea
- [ ] Select (com SelectTrigger, SelectContent, SelectItem)
- [ ] Dialog (com DialogHeader, DialogTitle, DialogFooter)
- [ ] DropdownMenu
- [ ] Tabs (TabsList, TabsTrigger, TabsContent)
- [ ] Table (com header, body, row, cell)
- [ ] Tooltip
- [ ] Sheet (para sidebar mobile)
- [ ] Separator
- [ ] Progress
- [ ] Skeleton

### Fase 3 — Layout & Navegação
- [ ] `DashboardLayoutComponent` (flex container com sidebar + main)
- [ ] `DashboardNavbarComponent` (logo, unit selector, notificações, menu)
- [ ] `DashboardSidebarComponent` (collapsible, 11 menu items, active state)
- [ ] Sidebar mobile (Sheet/overlay em telas < md)
- [ ] Configurar Angular Router com todas as rotas
- [ ] `UnitService` (equivalente ao UnitContext do React)

### Fase 4 — Páginas Públicas
- [ ] Landing Page (hero com imagem, features grid, footer parceiros)
- [ ] Login Page (card centralizado, form fields, gradiente de fundo)
- [ ] Unit Selection (agrupamento por estado, cards clicáveis)

### Fase 5 — Dashboard Pages
- [ ] Dashboard Home (KPI cards, generation chart, alerts, technical info)
- [ ] Financial (KPI cards, bar chart economia, line chart payback, modais edição)
- [ ] Energy Management (month selector, KPI cards, warehouse card list)
- [ ] Warehouse Detail (KPI cards, daily chart, monthly chart, tabs com tabelas)
- [ ] Telemetry (placeholder)
- [ ] Zero Grid (placeholder)
- [ ] Compliance (placeholder)
- [ ] Maintenance (placeholder)
- [ ] Communication (placeholder)
- [ ] Support (placeholder)
- [ ] Generators (placeholder)
- [ ] Economic Results (placeholder)

### Fase 6 — Gráficos
- [ ] Instalar `ng2-charts` + `chart.js`
- [ ] LineChart — Curva de Geração (Dashboard Home)
- [ ] BarChart — Rentabilidade Mensal (Financial)
- [ ] LineChart — Projeção de Payback (Financial)
- [ ] BarChart Stacked — Consumo Diário (Warehouse Detail)
- [ ] BarChart Stacked — Consumo Acumulado Mensal (Warehouse Detail)
- [ ] Aplicar cores do design system em todos os gráficos
- [ ] Tooltip customizado com estilo do design system

### Fase 7 — Polimento
- [ ] Animações de entrada nas páginas (`animate-in fade-in`)
- [ ] Transições hover em cards e botões
- [ ] Teste de responsividade (mobile, tablet, desktop)
- [ ] Validar dark mode em todas as páginas
- [ ] Validar sidebar collapse/expand
- [ ] Revisar espaçamentos e alinhamentos com o protótipo

---

## Dependências NPM Angular

```json
{
  "dependencies": {
    "@angular/animations": "^18.x",
    "@angular/cdk": "^18.x",
    "chart.js": "^4.x",
    "ng2-charts": "^6.x",
    "lucide-angular": "^0.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

> **Nota:** Se optar por spartan/ui, adicionar `@spartan-ng/ui-*` e `@spartan-ng/brain-*` conforme os componentes instalados via CLI.
