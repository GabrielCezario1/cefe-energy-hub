# Padrões da Camada Infraestrutura (<Projeto>.Infra)

## Responsabilidade
Implementar repositórios, mapeamentos EF Core, DbContext e serviços de infraestrutura (e-mail, S3, etc).

## Estrutura de Pastas
```
<Projeto>.Infra/
├── Comum/
│   └── Repositorios/
│       └── RepositorioBase.cs
├── Contexto/
│   └── AppDbContext.cs
├── Migrations/
│   └── <DataHora>_<NomeMigration>.cs
└── <Feature>/
    ├── Mapeamentos/
    │   └── <Entidade>Configuration.cs
    └── Repositorios/
        └── <Feature>Repositorio.cs
```

## Nomenclatura

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Repositório | `<Feature>Repositorio` | `UsuariosRepositorio` |
| Mapeamento | `<Entidade>Configuration` | `UsuarioConfiguration` |
| DbContext | `AppDbContext` | `AppDbContext` |

## Padrões de Código

### AppDbContext
```csharp
namespace <Projeto>.Infra.Contexto;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<<Entidade>> <Entidades> { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
```

### RepositorioBase
```csharp
namespace <Projeto>.Infra.Comum.Repositorios;

public class RepositorioBase<T> : IRepositorioBase<T> where T : EntidadeBase
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public RepositorioBase(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public void Inserir(T entidade)
    {
        _dbSet.Add(entidade);
        _context.SaveChanges();
    }

    public void Editar(T entidade)
    {
        _dbSet.Update(entidade);
        _context.SaveChanges();
    }

    public void Excluir(T entidade)
    {
        _dbSet.Remove(entidade);
        _context.SaveChanges();
    }

    public T? Recuperar(long id) => _dbSet.Find(id);

    public T? Recuperar(Expression<Func<T, bool>> expression) => _dbSet.FirstOrDefault(expression);

    public IQueryable<T> Query() => _dbSet.AsQueryable();

    public async Task InserirAsync(T entidade, CancellationToken ct = default)
    {
        await _dbSet.AddAsync(entidade, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task EditarAsync(T entidade, CancellationToken ct = default)
    {
        _dbSet.Update(entidade);
        await _context.SaveChangesAsync(ct);
    }

    public async Task ExcluirAsync(T entidade, CancellationToken ct = default)
    {
        _dbSet.Remove(entidade);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<T?> RecuperarAsync(long id, CancellationToken ct = default)
        => await _dbSet.FindAsync(new object[] { id }, ct);

    public async Task<T?> RecuperarAsync(Expression<Func<T, bool>> expression, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(expression, ct);
}
```

### Repositório da Feature
```csharp
namespace <Projeto>.Infra.<Feature>.Repositorios;

public class <Feature>Repositorio : RepositorioBase<<Entidade>>, I<Feature>Repositorio
{
    public <Feature>Repositorio(AppDbContext context) : base(context)
    {
    }

    // Métodos específicos, se necessário
    public async Task<<Entidade>?> RecuperarPorNomeAsync(string nome, CancellationToken ct = default)
    {
        return await Query().FirstOrDefaultAsync(x => x.Nome == nome, ct);
    }
}
```

### Mapeamento EF Core (Fluent API)
```csharp
namespace <Projeto>.Infra.<Feature>.Mapeamentos;

public class <Entidade>Configuration : IEntityTypeConfiguration<<Entidade>>
{
    public void Configure(EntityTypeBuilder<<Entidade>> builder)
    {
        builder.ToTable(""<tabela_plural>"");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasColumnName(""id"")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Nome)
            .HasColumnName(""nome"")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.Descricao)
            .HasColumnName(""descricao"")
            .HasMaxLength(1000);

        builder.Property(x => x.Ativo)
            .HasColumnName(""ativo"")
            .IsRequired();

        // Enum (armazenado como int)
        builder.Property(x => x.Status)
            .HasColumnName(""status"")
            .HasConversion<int>();

        // Relacionamento Many-to-One
        builder.HasOne(x => x.Usuario)
            .WithMany()
            .HasForeignKey(""UsuarioId"");

        // Relacionamento One-to-Many
        builder.HasMany(x => x.Itens)
            .WithOne(x => x.Pedido)
            .HasForeignKey(x => x.PedidoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

## Métodos Herdados de RepositorioBase<T>

### Síncronos
```csharp
void Inserir(T entidade)
void Editar(T entidade)
void Excluir(T entidade)
T? Recuperar(long id)
T? Recuperar(Expression<Func<T, bool>> expression)
IQueryable<T> Query()
```

### Assíncronos
```csharp
Task InserirAsync(T entidade, CancellationToken ct = default)
Task EditarAsync(T entidade, CancellationToken ct = default)
Task ExcluirAsync(T entidade, CancellationToken ct = default)
Task<T?> RecuperarAsync(long id, CancellationToken ct = default)
Task<T?> RecuperarAsync(Expression<Func<T, bool>> expression, CancellationToken ct = default)
```

## Convenções de Mapeamento

| Tipo C# | Tipo SQL Server | Observação |
|---------|-----------------|------------|
| `long` | `BIGINT` | Chave primária com Identity |
| `int` | `INT` | Números inteiros |
| `string` | `NVARCHAR(n)` | Definir tamanho com `.HasMaxLength()` |
| `decimal` | `DECIMAL(18,2)` | Usar `.HasPrecision(18, 2)` |
| `DateTime` | `DATETIME2` | - |
| `bool` | `BIT` | - |
| `Enum` | `INT` | Usar `.HasConversion<int>()` |

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

## Migrations (EF Core)

### Criar Migration
```bash
dotnet ef migrations add <NomeMigration> --project <Projeto>.Infra --startup-project <Projeto>.Api
```

### Aplicar Migration
```bash
dotnet ef database update --project <Projeto>.Infra --startup-project <Projeto>.Api
```

### Regras
- Sempre criar Migration ao alterar entidades ou mapeamentos
- Nome descritivo: `CriarTabelaUsuarios`, `AdicionarColunaEmailUsuarios`
- Verificar o SQL gerado antes de aplicar em produção

## Registro
Registrar em `ConfiguracoesInjecoesDependencia.AddInjecoesDependencia`:
```csharp
services.AddScoped<I<Feature>Repositorio, <Feature>Repositorio>();
```

## Serviços de Infraestrutura

### E-mail
```csharp
public interface IEmailService
{
    Task EnviarAsync(string destinatario, string assunto, string corpo);
}
```

### Armazenamento (S3/Cloud Storage)
```csharp
public interface IS3Service
{
    Task<string> UploadAsync(Stream arquivo, string chave);
    string GerarUrlPreAssinada(string chave);
}
```