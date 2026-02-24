# Padrões da Camada IoC (<Projeto>.Ioc)

## Responsabilidade
Configurar injeção de dependências, Entity Framework Core (DbContext) e serviços transversais.

## Estrutura de Pastas
```
<Projeto>.Ioc/
├── ConfiguracoesInjecoesDependencia.cs
├── ConfiguracoesDbContext.cs
└── ConfiguracoesAutoMapper.cs
```

## Padrões de Código

### Configuração do DbContext (EF Core + SQL Server)
```csharp
// filepath: ConfiguracoesDbContext.cs

namespace <Projeto>.Ioc;

public static class ConfiguracoesDbContext
{
    public static IServiceCollection AddDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString(""DefaultConnection"")));

        return services;
    }
}
```

### Registro de Dependências
```csharp
// filepath: ConfiguracoesInjecoesDependencia.cs

namespace <Projeto>.Ioc;

public static class ConfiguracoesInjecoesDependencia
{
    public static IServiceCollection AddInjecoesDependencia(this IServiceCollection services)
    {
        // Repositórios
        services.AddScoped<I<Feature>Repositorio, <Feature>Repositorio>();

        // Serviços de Domínio
        services.AddScoped<I<Feature>Servicos, <Feature>Servicos>();

        // Serviços de Aplicação
        services.AddScoped<I<Feature>AppServico, <Feature>AppServico>();

        // Validadores
        services.AddScoped<IValidator<<Feature>InserirRequest>, <Feature>InserirValidador>();
        services.AddScoped<IValidator<<Feature>EditarRequest>, <Feature>EditarValidador>();

        return services;
    }
}
```

### Configuração do AutoMapper
```csharp
// filepath: ConfiguracoesAutoMapper.cs

namespace <Projeto>.Ioc;

public static class ConfiguracoesAutoMapper
{
    public static IServiceCollection AddAutoMapper(this IServiceCollection services)
    {
        services.AddSingleton(new MapperConfiguration(config =>
        {
            config.AddProfile<<Feature>Profile>();
            // Adicionar novos profiles aqui
        }).CreateMapper());

        return services;
    }
}
```

### Ordem de Registro
1. Repositórios
2. Serviços de Domínio
3. Serviços de Aplicação
4. Validadores
5. Serviços de Infraestrutura (e-mail, S3, etc.)

### Ciclo de Vida
| Tipo | Ciclo | Quando Usar |
|------|-------|-------------|
| `AddScoped` | Por request | Repositórios, Serviços, DbContext |
| `AddSingleton` | Único | AutoMapper, Configurações, Cache |
| `AddTransient` | Cada injeção | Factories |

## Uso no Program.cs

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Registra DbContext (EF Core + SQL Server)
builder.Services.AddDbContext(builder.Configuration);

// Registra Injeções de Dependência
builder.Services.AddInjecoesDependencia();

// Registra AutoMapper Profiles
builder.Services.AddAutoMapper();
```

## Checklist Nova Feature
```
[ ] Registrar IRepositorio -> Repositorio
[ ] Registrar IServicos -> Servicos
[ ] Registrar IAppServico -> AppServico
[ ] Registrar IValidator -> Validador (Inserir e Editar)
[ ] Adicionar Profile no ConfiguracoesAutoMapper
[ ] Adicionar DbSet no AppDbContext
[ ] Criar Configuration (mapeamento EF Core)
[ ] Criar Migration EF Core
```

## Regras Importantes
- ✅ Toda interface nova DEVE ser registrada aqui
- ✅ Manter ordem de registro consistente (repositórios -> domínio -> aplicação -> validadores -> infra)
- ✅ Usar `AddScoped` para tudo relacionado a request HTTP
- ✅ O `AppDbContext` é registrado como Scoped automaticamente pelo `AddDbContext`
- ❌ NÃO esquecer de registrar—ausência gera `InvalidOperationException` ao ativar controllers
- ❌ NÃO usar `AddSingleton` para serviços que dependem de `AppDbContext`