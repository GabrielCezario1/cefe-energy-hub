# 🔌 Prompt — Módulo de Gerenciamento de Energia (Condomínio) — Unidade TH01

> **Objetivo:** Adicionar ao dashboard existente da CEFE Energy Hub um módulo completo de **Gerenciamento de Energia de Condomínio**, exclusivo para a unidade **TH01**, com duas páginas interligadas: a visão geral do condomínio e a visão detalhada de cada galpão.

---

## 📌 1. Contexto do Projeto Existente

| Item | Detalhe |
|---|---|
| **Framework** | React 18 + TypeScript + Vite |
| **UI** | shadcn/ui (Radix primitives) + Tailwind CSS |
| **Gráficos** | Recharts |
| **Roteamento** | react-router-dom v6 |
| **Estado global** | Context API (`UnitContext` — `selectedUnit`) |
| **Formulários** | react-hook-form + zod |
| **Ícones** | lucide-react |
| **Pasta de páginas** | `src/pages/dashboard/` |
| **Pasta de componentes** | `src/components/` |
| **Sidebar** | `src/components/layout/DashboardSidebar.tsx` — array `menuItems` |
| **Layout** | `src/components/layout/DashboardLayout.tsx` — wrapper com `<SidebarProvider>` |
| **Rotas** | `src/App.tsx` — pattern: `<Route path="/dashboard/slug" element={<DashboardLayout><Page /></DashboardLayout>} />` |
| **Unidade alvo** | `id: "th01"`, `name: "TH01"`, `location: "Rio de Janeiro"` (definida em `src/lib/units.ts`) |

### Padrões obrigatórios a seguir

1. **Toda nova página** deve ficar em `src/pages/dashboard/`.
2. **Todo novo componente reutilizável** deve ficar em `src/components/` (subpasta permitida, ex: `src/components/energy/`).
3. **Toda nova rota** deve ser registrada em `src/App.tsx` seguindo o pattern existente.
4. **O item no menu lateral** deve ser adicionado ao array `menuItems` em `DashboardSidebar.tsx`.
5. Usar **somente componentes de `@/components/ui/`** (shadcn) para Card, Button, Badge, Dialog, Select, Table, Tabs, Input, Label, Form, etc.
6. Manter animação `animate-in fade-in duration-500` nas páginas.
7. Gráficos devem usar **Recharts** (`BarChart`, `LineChart`, `ResponsiveContainer`, `Tooltip`, `CartesianGrid`, `XAxis`, `YAxis`).
8. Validação de formulários com **zod** + **react-hook-form**.
9. Ícones exclusivamente de **lucide-react**.
10. **Textos e labels em Português (pt-BR).**
11. Moeda formatada em **BRL** (`R$`), separador de milhar `.`, decimal `,`.
12. Este módulo só deve aparecer/funcionar quando `selectedUnit?.id === "th01"`. Para as demais unidades, a rota deve renderizar um placeholder informando que o módulo não está disponível.

---

## 📌 2. Estrutura de Arquivos a Criar

```
src/
  pages/
    dashboard/
      EnergyManagement.tsx          ← Página principal do condomínio
      WarehouseDetail.tsx            ← Página de detalhe de um galpão
  components/
    energy/
      CondominiumKpiCards.tsx        ← Cards: Valor Total, Consumo kWh, Potência
      InvoiceDemoTable.tsx           ← Tabela demonstrativo de fatura
      WarehouseCardList.tsx          ← Lista de cards dos galpões
      WarehouseCard.tsx              ← Card individual de galpão
      MonthSelector.tsx              ← Seletor de mês/ano reutilizável
      InvoiceEditModal.tsx           ← Modal de edição dos valores da fatura
      SendInvoiceModal.tsx           ← Modal de envio de faturas por e-mail
      WarehouseKpiCards.tsx          ← Cards de KPI do galpão
      WarehouseDailyChart.tsx        ← Gráfico diário (barras 15 min)
      WarehouseMonthlyChart.tsx      ← Gráfico acumulado mensal (barras por dia)
      WarehouseDailyTable.tsx        ← Tabela de dados diários
      WarehouseRegistersTable.tsx    ← Tabela de registros 15 em 15 min (MD50)
  lib/
    energyMockData.ts               ← Todos os dados mock centralizados
```

---

## 📌 3. Rotas

Adicionar ao `src/App.tsx`:

```
/dashboard/energy-management                 → EnergyManagement.tsx
/dashboard/energy-management/warehouse/:id   → WarehouseDetail.tsx
```

Ambas envolvidas pelo `<DashboardLayout>`.

---

## 📌 4. Menu Lateral

Adicionar ao array `menuItems` de `DashboardSidebar.tsx`:

```ts
{
  title: "Gerenciamento de Energia",
  url: "/dashboard/energy-management",
  icon: Building2,  // de lucide-react
}
```

Posicionar **após** o item "Resultado Econômico".

---

## 📌 5. Dados Mock (`src/lib/energyMockData.ts`)

### 5.1 Dados do Condomínio (fatura Enel — inserção mensal)

```ts
export interface CondominiumInvoice {
  month: string;              // "2026-01"
  totalValue: number;         // R$ total da conta
  totalConsumptionKwh: number;
  availablePower: number;     // kW contratado
  demoItems: InvoiceDemoItem[];
}

export interface InvoiceDemoItem {
  indicator: string;
  quantity: number | null;
  unit: string;               // "kVA", "kWh", ""
  tariff: number | null;
  value: number;
  icmsBase: number;
  icmsRate: number;           // 0.24 = 24%
  icmsValue: number;
}
```

Gerar **mock para 3 meses** (janeiro, fevereiro e março de 2026). Usar os itens de demonstrativo exatamente como na tabela abaixo:

| Indicador | Qtd | Unid | Tarifa | Valor (R$) | ICMS Base | Alíq. | ICMS Valor |
|---|---|---|---|---|---|---|---|
| Consumo Reativo Excedente Fp | 1.312 | kVA | 0,41591 | 545,67 | 545,67 | 24% | 130,96 |
| Benefício Tarifário Bruto | — | — | — | 20.899,57 | 20.899,57 | 24% | 5.015,89 |
| TUSD Fora Ponta | 29.818 | kWh | 0,21263 | 6.340,35 | 6.340,35 | 24% | 1.521,68 |
| TUSD Ponta | 4.125 | kWh | 0,21263 | 877,10 | 877,10 | 24% | 210,50 |
| DIC Mensal | — | — | — | -3.645,62 | — | 0% | 0,00 |
| CIP - ILUM PUB | — | — | — | 105,49 | — | 0% | 0,00 |
| Benefício Tarifário Líquido | — | — | — | -14.743,24 | — | 0% | 0,00 |

Variar ligeiramente os valores para cada mês.

### 5.2 Dados dos Galpões

```ts
export interface Warehouse {
  id: string;
  name: string;
  totalConsumptionKwh: number;
  totalCostBrl: number;
  availablePower: number;
}
```

Gerar **8 galpões**. Os 3 primeiros obrigatórios:

| # | id | name |
|---|---|---|
| 1 | mercado-livre | Mercado Livre |
| 2 | shopee | Shopee |
| 3 | mro | MRO |
| 4 | galpao-alpha | Galpão Alpha |
| 5 | galpao-beta | Galpão Beta |
| 6 | galpao-gamma | Galpão Gamma |
| 7 | galpao-delta | Galpão Delta |
| 8 | galpao-epsilon | Galpão Epsilon |

Para cada galpão, gerar dados mock mensais (3 meses), diários (30 dias) e de 15 em 15 minutos (96 registros por dia).

### 5.3 Dados MD50 por Registro (15 min)

```ts
export interface MD50Register {
  timestamp: string;          // ISO
  consumoPonta: number;       // kWh acumulado
  consumoForaPonta: number;
  consumoReserv: number;
  energIndPonta: number;
  energIndForaPonta: number;
  energCapPonta: number;
  energCapForaPonta: number;
  maxPotAtivPonta: number;    // kW
  maxPotAtivForaPonta: number;
  consumoPonta15min: number;  // kWh nos últimos 15 min
  consumoForaPonta15min: number;
  energIndPonta15min: number;
  energIndForaPonta15min: number;
  potAtivT: number;           // kW instantâneo
  fatPotT: number;            // fator de potência
}
```

### 5.4 Dados Diários (sumarização)

```ts
export interface WarehouseDailyData {
  date: string;               // "2026-01-01"
  consumoPontaKwh: number;
  consumoForaPontaKwh: number;
  consumoTotalKwh: number;
  demandaMaxKw: number;
  fatPotMedio: number;
  custoEstimadoBrl: number;
}
```

---

## 📌 6. Página do Condomínio — `EnergyManagement.tsx`

### 6.1 Guarda de Unidade

```tsx
if (selectedUnit?.id !== "th01") {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">
        Módulo disponível apenas para a unidade TH01.
      </p>
    </div>
  );
}
```

### 6.2 Layout (de cima para baixo)

1. **Cabeçalho**
   - `<h1>` "Gerenciamento de Energia — Condomínio TH01"
   - Subtítulo com `text-muted-foreground`.

2. **Barra de ações** (flex row, justify-between)
   - **Esquerda:** `<MonthSelector />` — `<Select>` com opções "Janeiro 2026", "Fevereiro 2026", "Março 2026".
   - **Direita:**
     - Botão "Editar Fatura" (ícone `Pencil`) → abre `<InvoiceEditModal />`.
     - Botão "Enviar Faturas" (ícone `Send`) → abre `<SendInvoiceModal />`.

3. **KPI Cards** (`<CondominiumKpiCards />`)
   - Grid `grid-cols-1 md:grid-cols-3 gap-4`.
   - Card 1: **Valor Total da Conta** — `R$ xx.xxx,xx` — ícone `DollarSign` — borda esquerda `border-l-primary`.
   - Card 2: **Consumo Total** — `xx.xxx kWh` — ícone `Zap` — borda esquerda `border-l-chart-1`.
   - Card 3: **Potência Disponibilizada** — `xxx kW` — ícone `Gauge` — borda esquerda `border-l-chart-2`.

4. **Tabela Demonstrativo de Fatura** (`<InvoiceDemoTable />`)
   - Dentro de um `<Card>` com título "Demonstrativo da Fatura".
   - Colunas: Indicador | Quantidade | Unidade | Tarifa (R$) | Valor (R$) | Base ICMS (R$) | Alíquota ICMS | Valor ICMS (R$).
   - Usar `<Table>` do shadcn. Valores negativos em cor `text-green-600`. Linha totalizadora ao final com `font-bold`.

5. **Lista de Galpões** (`<WarehouseCardList />`)
   - Título "Galpões do Condomínio" dentro de seção.
   - Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`.
   - Cada `<WarehouseCard />`:
     - Nome do galpão (`<CardTitle>`).
     - Consumo total em kWh.
     - Custo total em R$.
     - `hover:shadow-lg transition-shadow cursor-pointer`.
     - Ao clicar → `navigate(\`/dashboard/energy-management/warehouse/\${warehouse.id}\`)`.

### 6.3 Modal Editar Fatura — `<InvoiceEditModal />`

- Componente `<Dialog>` do shadcn.
- Formulário com `react-hook-form` + `zod`.
- Campos editáveis para cada item do demonstrativo:
  - Quantidade, Tarifa, Valor, Alíquota ICMS.
- Campos adicionais:
  - Potência Disponibilizada (kW).
  - Valor Total da Conta (R$).
  - Consumo Total (kWh).
- Botões "Cancelar" e "Salvar" (salvar apenas atualiza o state local/mock).
- Usar `<ScrollArea>` caso o formulário fique grande.

### 6.4 Modal Enviar Faturas — `<SendInvoiceModal />`

- Componente `<Dialog>` do shadcn.
- Lista de galpões com `<Checkbox>` para seleção múltipla.
- Para cada galpão selecionado, campo `<Input type="email">` para o e-mail destinatário.
- Botões "Cancelar" e "Enviar" (enviar apenas mostra toast de sucesso com `sonner`).

---

## 📌 7. Página do Galpão — `WarehouseDetail.tsx`

### 7.1 Parâmetros de Rota

```tsx
const { id } = useParams<{ id: string }>();
```

Buscar o galpão pelo `id` nos dados mock. Se não encontrar, renderizar mensagem de "Galpão não encontrado" com botão para voltar.

### 7.2 Layout (de cima para baixo)

1. **Cabeçalho**
   - Botão de voltar (ícone `ArrowLeft`) → `navigate("/dashboard/energy-management")`.
   - `<h1>` com o nome do galpão.
   - Subtítulo "Dados do módulo Embrasul MD50".

2. **Barra de ações**
   - `<MonthSelector />`.

3. **KPI Cards** (`<WarehouseKpiCards />`)
   - Grid `grid-cols-1 md:grid-cols-3 gap-4`.
   - Card 1: **Consumo Acumulado** — `xx.xxx kWh` — ícone `Zap`.
   - Card 2: **Custo Acumulado** — `R$ xx.xxx,xx` — ícone `DollarSign`.
   - Card 3: **Potência Disponibilizada** — `xxx kW` — ícone `Gauge`.

4. **Gráficos lado a lado**
   - Grid `grid-cols-1 lg:grid-cols-2 gap-4`.
   - **Gráfico Diário** (`<WarehouseDailyChart />`):
     - `<Card>` com título "Consumo Diário (kWh)".
     - `<BarChart>` com eixo X = hora (00:00 a 23:45 em intervalos de 15 min), eixo Y = kWh.
     - Duas barras empilhadas: Ponta (cor primária) e Fora Ponta (cor chart-2).
     - Mostrar dados do dia selecionado (por padrão, hoje).
     - Incluir um `<Select>` para escolher o dia dentro do mês.
   - **Gráfico Mensal** (`<WarehouseMonthlyChart />`):
     - `<Card>` com título "Consumo Acumulado Mensal (kWh)".
     - `<BarChart>` com eixo X = dia do mês (1 a 30), eixo Y = kWh.
     - Duas barras empilhadas: Ponta e Fora Ponta.

5. **Tabelas com Tabs**
   - Usar `<Tabs>` do shadcn com duas abas:
     - **"Dados Diários"** → `<WarehouseDailyTable />`:
       - Colunas: Data | Consumo Ponta (kWh) | Consumo Fora Ponta (kWh) | Consumo Total (kWh) | Demanda Máx (kW) | Fator Potência Médio | Custo Estimado (R$).
       - Usar `<Table>` do shadcn.
     - **"Registros MD50 (15 min)"** → `<WarehouseRegistersTable />`:
       - Colunas: Horário | Cons. Ponta (kWh) | Cons. Fora Ponta (kWh) | Energ. Ind. Ponta | Energ. Ind. F. Ponta | Energ. Cap. Ponta | Energ. Cap. F. Ponta | Pot. Ativa (kW) | Fator Potência.
       - Mostrar registros do dia selecionado.
       - Usar `<ScrollArea>` com altura máxima para evitar página infinita.
       - Incluir `<Select>` para escolher o dia.

---

## 📌 8. Componente Reutilizável — `MonthSelector.tsx`

```tsx
interface MonthSelectorProps {
  value: string;          // "2026-01"
  onChange: (month: string) => void;
  availableMonths: string[];
}
```

- Usar `<Select>` do shadcn.
- Exibir label formatado: "Janeiro 2026", "Fevereiro 2026", etc.
- Meses em português.

---

## 📌 9. Regras de Negócio & Formatação

| Regra | Detalhe |
|---|---|
| Moeda | `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` |
| Número | `Intl.NumberFormat("pt-BR")` com casas decimais adequadas |
| Valores negativos | Exibir em `text-green-600` (crédito/desconto) |
| Fator de potência | Exibir com 2 casas decimais. Se < 0.92, badge `destructive` |
| Potência | Comparar demanda máxima com potência disponibilizada; se > 90%, badge `warning` |
| Mês padrão | Carregar com o mês mais recente disponível nos mock |

---

## 📌 10. Fluxo de Navegação

```
Sidebar → "Gerenciamento de Energia"
  └→ /dashboard/energy-management   (EnergyManagement.tsx)
       ├─ [Seletor de Mês]
       ├─ [Botão Editar Fatura] → Modal
       ├─ [Botão Enviar Faturas] → Modal
       ├─ KPI Cards do condomínio
       ├─ Tabela Demonstrativo
       └─ Cards dos Galpões
            └─ click no card
                 └→ /dashboard/energy-management/warehouse/:id  (WarehouseDetail.tsx)
                      ├─ [Botão Voltar]
                      ├─ [Seletor de Mês]
                      ├─ KPI Cards do galpão
                      ├─ Gráfico Diário + Gráfico Mensal
                      └─ Tabs: Dados Diários | Registros MD50
```

---

## 📌 11. Checklist de Implementação

- [ ] Criar `src/lib/energyMockData.ts` com todos os tipos e dados mock.
- [ ] Criar `src/components/energy/MonthSelector.tsx`.
- [ ] Criar `src/components/energy/CondominiumKpiCards.tsx`.
- [ ] Criar `src/components/energy/InvoiceDemoTable.tsx`.
- [ ] Criar `src/components/energy/WarehouseCard.tsx`.
- [ ] Criar `src/components/energy/WarehouseCardList.tsx`.
- [ ] Criar `src/components/energy/InvoiceEditModal.tsx` (react-hook-form + zod).
- [ ] Criar `src/components/energy/SendInvoiceModal.tsx`.
- [ ] Criar `src/pages/dashboard/EnergyManagement.tsx`.
- [ ] Criar `src/components/energy/WarehouseKpiCards.tsx`.
- [ ] Criar `src/components/energy/WarehouseDailyChart.tsx` (Recharts BarChart).
- [ ] Criar `src/components/energy/WarehouseMonthlyChart.tsx` (Recharts BarChart).
- [ ] Criar `src/components/energy/WarehouseDailyTable.tsx`.
- [ ] Criar `src/components/energy/WarehouseRegistersTable.tsx`.
- [ ] Criar `src/pages/dashboard/WarehouseDetail.tsx`.
- [ ] Adicionar rotas em `src/App.tsx`.
- [ ] Adicionar item no `menuItems` de `src/components/layout/DashboardSidebar.tsx`.
- [ ] Testar navegação completa: sidebar → condomínio → galpão → voltar.
- [ ] Verificar formatação BRL e pt-BR em todos os valores.
- [ ] Verificar responsividade mobile.

---

## 📌 12. Exemplo Visual de Referência (ASCII)

### Página do Condomínio

```
┌─────────────────────────────────────────────────────────────┐
│  Gerenciamento de Energia — Condomínio TH01                 │
│  Dados da fatura mensal Enel                                │
├─────────────────────────────────────────────────────────────┤
│  [Março 2026 ▾]              [✏️ Editar Fatura] [📧 Enviar] │
├──────────────┬──────────────┬───────────────────────────────┤
│ R$ 25.122,45 │  33.943 kWh  │  150 kW Disponibilizado      │
│ Valor Total  │  Consumo     │  Potência                     │
├──────────────┴──────────────┴───────────────────────────────┤
│  Demonstrativo da Fatura                                    │
│ ┌───────────────────────┬──────┬───────┬────────┬────────┐  │
│ │ Indicador             │ Qtd  │Tarifa │Valor R$│ICMS R$ │  │
│ ├───────────────────────┼──────┼───────┼────────┼────────┤  │
│ │ Cons. Reativo Exc. Fp │1.312 │0,4159 │ 545,67 │ 130,96 │  │
│ │ Benef. Tarif. Bruto   │  —   │   —   │20899,57│5015,89 │  │
│ │ TUSD Fora Ponta       │29.818│0,2126 │6340,35 │1521,68 │  │
│ │ ...                   │      │       │        │        │  │
│ └───────────────────────┴──────┴───────┴────────┴────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Galpões do Condomínio                                      │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐ │
│ │Mercado Livre│ │  Shopee    │ │    MRO     │ │Galp. Alpha│ │
│ │ 4.521 kWh  │ │ 3.890 kWh  │ │ 5.102 kWh  │ │ 2.330 kWh │ │
│ │ R$ 3.200   │ │ R$ 2.750   │ │ R$ 3.610   │ │ R$ 1.650  │ │
│ └────────────┘ └────────────┘ └────────────┘ └───────────┘ │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐ │
│ │Galp. Beta  │ │Galp. Gamma │ │Galp. Delta │ │G. Epsilon │ │
│ │ 3.100 kWh  │ │ 2.800 kWh  │ │ 4.200 kWh  │ │ 3.000 kWh │ │
│ │ R$ 2.195   │ │ R$ 1.984   │ │ R$ 2.976   │ │ R$ 2.125  │ │
│ └────────────┘ └────────────┘ └────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Página do Galpão

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar    Mercado Livre                                  │
│              Dados do módulo Embrasul MD50                   │
├─────────────────────────────────────────────────────────────┤
│  [Março 2026 ▾]                                             │
├──────────────┬──────────────┬───────────────────────────────┤
│  4.521 kWh   │  R$ 3.200,00 │  75 kW Disponibilizado       │
│ Cons. Acum.  │  Custo Acum.  │  Potência                    │
├──────────────┴──────────────┴───────────────────────────────┤
│ ┌──────────────────────────┐ ┌─────────────────────────────┐│
│ │  Consumo Diário (kWh)   │ │  Acumulado Mensal (kWh)     ││
│ │  [Dia 15 ▾]             │ │                             ││
│ │  ▓▓░░▓▓░░▓▓▓▓▓▓░░▓▓░░  │ │  ▓░▓░▓░▓░▓░▓░▓░▓░▓░▓░▓░  ││
│ │  ████░░████░░████████░░  │ │  ████████████████████████   ││
│ │  00  06  12  18  24     │ │  1  5  10  15  20  25  30  ││
│ │  ■ Ponta  ■ Fora Ponta  │ │  ■ Ponta  ■ Fora Ponta     ││
│ └──────────────────────────┘ └─────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  [Dados Diários]  [Registros MD50 (15 min)]                 │
│ ┌────────┬────────┬────────┬────────┬────────┬─────────────┐│
│ │  Data  │C.Ponta │C.F.P.  │C.Total │Dem.Max │Custo Est.   ││
│ ├────────┼────────┼────────┼────────┼────────┼─────────────┤│
│ │ 01/03  │  42,5  │ 108,3  │ 150,8  │ 68,2   │ R$ 106,82  ││
│ │ 02/03  │  38,1  │ 112,7  │ 150,8  │ 71,0   │ R$ 108,15  ││
│ │ ...    │        │        │        │        │             ││
│ └────────┴────────┴────────┴────────┴────────┴─────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📌 13. Restrições e Observações Finais

1. **Não alterar** nenhum outro módulo existente (Financial, Telemetry, etc.) — apenas adicionar.
2. **Não instalar** novas dependências — tudo já está disponível no `package.json`.
3. **Mock data apenas** — não criar backend, API calls ou banco de dados.
4. Todos os `useState` para mês selecionado devem iniciar com o mês mais recente do mock.
5. O componente `<MonthSelector>` deve ser reutilizado em ambas as páginas.
6. Manter **consistência visual** com os demais módulos do dashboard (mesmos espaçamentos, cores, tipografia).
7. Usar `useNavigate` do react-router-dom para navegação entre as páginas.
8. Usar `useParams` do react-router-dom para capturar o ID do galpão na página de detalhe.

---

*Prompt gerado em 13/02/2026 para o projeto CEFE Energy Hub — Unidade TH01.*
