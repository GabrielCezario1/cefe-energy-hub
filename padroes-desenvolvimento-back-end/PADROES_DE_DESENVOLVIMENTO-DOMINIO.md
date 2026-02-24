# Padrões da Camada Domínio (<Projeto>.Dominio)

## Responsabilidade
Conter a lógica de negócio, entidades, repositórios (interfaces) e regras de validação.

## Estrutura de Pastas
```
<Projeto>.Dominio/
├── libs/
│   ├── Consultas/
│   ├── Entidades/
│   ├── Excecoes/
│   ├── Extensions/
│   ├── Filtros/
│   ├── Repositorios/
│   └── UnitOfWork/
└── <Feature>/
    ├── Entidades/
    │   └── <Entidade>.cs
    ├── Repositorios/
    │   └── I<Feature>Repositorio.cs
    └── Servicos/
        ├── Comandos/
        │   ├── <Feature>InserirComando.cs
        │   └── <Feature>EditarComando.cs
        ├── Interfaces/
        │   └── I<Feature>Servicos.cs
        └── <Feature>Servicos.cs
```

## Nomenclatura

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Entidade | Singular, PascalCase | `Depoimento`, `Plano`, `Usuario` |
| Repositório Interface | `I<Feature>Repositorio` | `IDepoimentosRepositorio` |
| Serviço | `<Feature>Servicos` | `DepoimentosServicos` |
| Serviço Interface | `I<Feature>Servicos` | `IDepoimentosServicos` |
| Comando Inserir | `<Feature>InserirComando` | `DepoimentosInserirComando` |
| Comando Editar | `<Feature>EditarComando` | `DepoimentosEditarComando` |

## Padrões de Código

### Entidade
```csharp
namespace <Projeto>.Dominio.<Feature>.Entidades;

public class <Entidade>
{
    public virtual int Id { get; protected set; }
    public virtual string Nome { get; protected set; }
    public virtual bool Ativo { get; protected set; }

    protected <Entidade>() { } // NHibernate

    public <Entidade>(string nome)
    {
        SetNome(nome);
        Ativo = true;
    }

    public virtual void SetNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new RegraDeNegocioExcecao("Nome é obrigatório");
        Nome = nome;
    }

    public virtual void Ativar() => Ativo = true;
    public virtual void Desativar() => Ativo = false;
}
```

### Interface do Repositório
```csharp
namespace <Projeto>.Dominio.<Feature>.Repositorios;

public interface I<Feature>Repositorio : IRepositorioNHibernate<<Entidade>>
{
    // Métodos específicos da feature, se necessário
}
```

### Comando
```csharp
namespace <Projeto>.Dominio.<Feature>.Servicos.Comandos;

public class <Feature>InserirComando
{
    public string Nome { get; set; }
    public string Descricao { get; set; }
}
```

### Serviço de Domínio
```csharp
namespace <Projeto>.Dominio.<Feature>.Servicos;

public class <Feature>Servicos : I<Feature>Servicos
{
    private readonly I<Feature>Repositorio _<feature>Repositorio;

    public <Feature>Servicos(I<Feature>Repositorio <feature>Repositorio)
    {
        _<feature>Repositorio = <feature>Repositorio;
    }

    public <Entidade> Inserir(<Feature>InserirComando comando)
    {
        var entidade = new <Entidade>(comando.Nome);
        _<feature>Repositorio.Inserir(entidade);
        return entidade;
    }

    public <Entidade> Editar(<Feature>EditarComando comando)
    {
        var entidade = Validar(comando.Id);
        
        if (comando.Nome != null)
            entidade.SetNome(comando.Nome);
        
        _<feature>Repositorio.Editar(entidade);
        return entidade;
    }

    public void Excluir(int id)
    {
        var entidade = Validar(id);
        _<feature>Repositorio.Excluir(entidade);
    }

    public <Entidade> Recuperar(int id)
    {
        var entidade = Validar(id);
        return entidade;
    }

    private <Entidade> Validar(int id)
    {
        var entidade = _<feature>Repositorio.Recuperar(id);
        entidade.ValidarRegistroNaoFoiEncontrado("<Entidade> não encontrada");
        return entidade;
    }
}
```

## Regras de Entidades

### Obrigatórias
| Regra | Descrição |
|-------|-----------|
| Construtor vazio protegido | `protected <Entidade>() { }` - **OBRIGATÓRIO** para NHibernate instanciar objetos ao hidratar do banco |
| Setters `protected` | Impede alteração direta, forçando uso dos métodos Set |
| Propriedades `virtual` | Necessário para lazy loading do NHibernate |
| Método `Set<Propriedade>` | **OBRIGATÓRIO** para TODA propriedade mutável - centraliza validações |
| Validações nos Sets | **OBRIGATÓRIO** - Todas as validações de negócio devem estar DENTRO dos métodos Set |

### Exemplo Correto
```csharp
public class Produto
{
    // Propriedades com setters protected
    public virtual int Id { get; protected set; }
    public virtual string Nome { get; protected set; }
    public virtual decimal Preco { get; protected set; }
    public virtual bool Ativo { get; protected set; }
    
    // Construtor vazio OBRIGATÓRIO para NHibernate
    protected Produto() { }
    
    // Construtor público usa métodos Set para validar
    public Produto(string nome, decimal preco)
    {
        SetNome(nome);
        SetPreco(preco);
        Ativo = true;
    }
    
    // OBRIGATÓRIO: Método Set para cada propriedade mutável
    // OBRIGATÓRIO: Validações DENTRO do método Set
    public virtual void SetNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new RegraDeNegocioExcecao("Nome é obrigatório");
        
        if (nome.Length > 100)
            throw new RegraDeNegocioExcecao("Nome não pode ter mais de 100 caracteres");
        
        Nome = nome;
    }
    
    public virtual void SetPreco(decimal preco)
    {
        if (preco < 0)
            throw new RegraDeNegocioExcecao("Preço não pode ser negativo");
        
        Preco = preco;
    }
    
    // Métodos de estado podem alterar diretamente (sem validação complexa)
    public virtual void Ativar() => Ativo = true;
    public virtual void Desativar() => Ativo = false;
}
```

### Por Que Essas Regras?
| Regra | Justificativa |
|-------|---------------|
| Construtor vazio | NHibernate precisa instanciar objetos sem parâmetros ao carregar do banco de dados |
| Métodos Set | Centralizam validações e evitam duplicação de código |
| Validações nos Sets | Garantem que as invariantes da entidade sejam respeitadas independente de onde a propriedade é alterada |
| Setters protected | Forçam o uso dos métodos Set, garantindo que validações sempre sejam executadas |

## Exceções
```csharp
// Regra de negócio violada
throw new RegraDeNegocioExcecao("Mensagem de erro");

// Registro não encontrado
entidade.ValidarRegistroNaoFoiEncontrado("Mensagem");
```

## Unit of Work

A interface `IUnitOfWork` define o contrato para gerenciamento de transações:

```csharp
namespace <Projeto>.Dominio.libs.UnitOfWork;

public interface IUnitOfWork : IDisposable
{
    Task BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
    bool IsInTransaction { get; }
}
```

### Localização
- `<Projeto>.Dominio/libs/UnitOfWork/IUnitOfWork.cs`

### Responsabilidade
- Definir contrato para controle transacional
- Garantir que a camada de aplicação possa gerenciar commits/rollbacks
- Manter o domínio agnóstico à implementação (NHibernate)

## Extension Methods
```csharp
// Validar se registro existe
entidade.ValidarRegistroNaoFoiEncontrado("Mensagem");
```

## Bibliotecas Compartilhadas (libs/)

### Consultas
- `PaginacaoConsulta<T>` - Envelope de resposta paginada com `Registros` e `Total`

### Entidades
- Classes base para entidades, se necessário

### Excecoes
- `RegraDeNegocioExcecao` - Exceção para regras de negócio violadas

### Extensions
- `PaginacaoExtension` - Helpers para paginação de queries
- `ValidarRegistroNaoFoiEncontrado` - Extension method para validar existência

### Filtros
- `PaginacaoFiltro` - Base para requests de listagem (Qt, Pg, CpOrd, TpOrd)
- `TipoOrdenacaoEnum` - Enum para tipo de ordenação (Asc/Desc)

### Repositorios
- `IRepositorioNHibernate<T>` - Interface base para repositórios
