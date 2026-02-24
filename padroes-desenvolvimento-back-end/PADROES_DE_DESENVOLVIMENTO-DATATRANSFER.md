# Padrões da Camada DataTransfer (<Projeto>.DataTransfer)

## Responsabilidade
Definir os contratos de entrada e saída da API (DTOs) isolados das entidades de domínio.

## ⛔ PROIBIÇÕES

### ❌ NÃO usar DataAnnotations
**É EXPRESSAMENTE PROIBIDO** utilizar `System.ComponentModel.DataAnnotations` nos DTOs.

```csharp
// ❌ PROIBIDO - NÃO FAZER ISSO
using System.ComponentModel.DataAnnotations;

public class ExemploRequest
{
    [Required(ErrorMessage = "Campo obrigatório")]
    [StringLength(100)]
    public string Campo { get; set; }
}
```

**Motivo:** Todas as validações devem ser feitas na camada de **Domínio** através de:
- Validações no construtor da entidade
- Métodos de validação nos serviços de domínio
- Uso de `RegraDeNegocioExcecao` para regras de negócio
- Uso de `ValidarRegistroNaoFoiEncontrado` para registros não encontrados

```csharp
// ✅ CORRETO - DTOs simples, validação no Domínio
public class ExemploRequest
{
    public string Campo { get; set; }
}

// Validação no Domínio (Entidade ou Serviço)
if (string.IsNullOrWhiteSpace(campo))
    throw new RegraDeNegocioExcecao("Campo é obrigatório");
```

## Estrutura de Pastas
```
<Projeto>.DataTransfer/
└── <Feature>/
    ├── Request/
    │   ├── <Feature>InserirRequest.cs
    │   ├── <Feature>EditarRequest.cs
    │   └── <Feature>ListarRequest.cs
    └── Response/
        └── <Feature>Response.cs
```

## Nomenclatura

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Request Inserir | `<Feature>InserirRequest` | `DepoimentosInserirRequest` |
| Request Editar | `<Feature>EditarRequest` | `DepoimentosEditarRequest` |
| Request Listar | `<Feature>ListarRequest` | `DepoimentosListarRequest` |
| Response | `<Feature>Response` | `DepoimentosResponse` |

## Padrões de Código

### Request de Inserção
```csharp
namespace <Projeto>.DataTransfer.<Feature>.Request;

public class <Feature>InserirRequest
{
    public string Campo { get; set; }   
    public string? CampoOpcional { get; set; }
}
```

### Request de Edição
```csharp
namespace <Projeto>.DataTransfer.<Feature>.Request;

public class <Feature>EditarRequest
{
    public int Id { get; set; }   
    public string? Campo { get; set; } // Nullable para edição parcial
}
```

### Request de Listagem (com Paginação)
```csharp
namespace <Projeto>.DataTransfer.<Feature>.Request;

public class <Feature>ListarRequest : PaginacaoFiltro
{
    public string? Nome { get; set; }
    public bool? Ativo { get; set; }
}
```

### Response
```csharp
namespace <Projeto>.DataTransfer.<Feature>.Response;

public class <Feature>Response
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public DateTime DataCriacao { get; set; }
}
```

## Regras

### Requests
- Herdar de `PaginacaoFiltro` para listagens
- Propriedades simples com `get; set;`
- Sem validações (DataAnnotations proibido)
- Campos opcionais devem ser nullable (`?`)

### Responses
- Espelhar propriedades da entidade
- Usar tipos primitivos ou outros responses (não entidades)
- Enums podem ser expostos diretamente

### Paginação Padrão
```csharp
// De PaginacaoFiltro
public int Qt { get; set; } = 10;  // Quantidade (máx 100)
public int Pg { get; set; } = 1;   // Página
public string? CpOrd { get; set; } // Campo ordenação
public TipoOrdenacaoEnum TpOrd { get; set; } = TipoOrdenacaoEnum.Asc;
```
