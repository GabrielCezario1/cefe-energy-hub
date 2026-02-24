# Padrões da Camada Aplicação (<Projeto>.Aplicacao)

## Responsabilidade
Orquestrar fluxos de aplicação, mapear DTOs para comandos, delegar para serviços de domínio e retornar responses.

## Estrutura de Pastas
```
<Projeto>.Aplicacao/
└── <Feature>/
    ├── Profiles/
    │   └── <Feature>Profile.cs
    └── Servicos/
        ├── Interfaces/
        │   └── I<Feature>AppServico.cs
        └── <Feature>AppServico.cs
```

## Nomenclatura

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Serviço | `<Feature>AppServico` | `DepoimentosAppServico` |
| Interface | `I<Feature>AppServico` | `IDepoimentosAppServico` |
| Profile | `<Feature>Profile` | `DepoimentosProfile` |

## Padrões de Código

### Interface
```csharp
namespace <Projeto>.Aplicacao.<Feature>.Servicos.Interfaces;

public interface I<Feature>AppServico
{
    <Feature>Response Inserir(<Feature>InserirRequest request);
    <Feature>Response Editar(<Feature>EditarRequest request);
    void Excluir(int id);
    <Feature>Response Recuperar(int id);
    PaginacaoConsulta<<Feature>Response> Listar(<Feature>ListarRequest request);
}
```

### Serviço de Aplicação
```csharp
namespace <Projeto>.Aplicacao.<Feature>.Servicos;

public class <Feature>AppServico : I<Feature>AppServico
{
    private readonly I<Feature>Servicos _<feature>Servicos;
    private readonly IMapper _mapper;

    public <Feature>AppServico(
        I<Feature>Servicos <feature>Servicos,
        IMapper mapper)
    {
        _<feature>Servicos = <feature>Servicos;
        _mapper = mapper;
    }

    public <Feature>Response Inserir(<Feature>InserirRequest request)
    {
        var comando = _mapper.Map<<Feature>InserirComando>(request);
        var entidade = _<feature>Servicos.Inserir(comando);
        return _mapper.Map<<Feature>Response>(entidade);
    }

    public <Feature>Response Editar(<Feature>EditarRequest request)
    {
        var comando = _mapper.Map<<Feature>EditarComando>(request);
        var entidade = _<feature>Servicos.Editar(comando);
        return _mapper.Map<<Feature>Response>(entidade);
    }

    public <Feature>Response Recuperar(int id)
    {
        var entidade = _<feature>Servicos.Recuperar(id);
        return _mapper.Map<<Feature>Response>(entidade);
    }

    public PaginacaoConsulta<<Feature>Response> Listar(<Feature>ListarRequest request)
    {
        var resultado = _<feature>Servicos.Listar(request);
        return new PaginacaoConsulta<<Feature>Response>
        {
            Registros = _mapper.Map<List<<Feature>Response>>(resultado.Registros),
            Total = resultado.Total
        };
    }
}
```

### Profile AutoMapper
```csharp
namespace <Projeto>.Aplicacao.<Feature>.Profiles;

public class <Feature>Profile : Profile
{
    public <Feature>Profile()
    {
        // Request → Comando
        CreateMap<<Feature>InserirRequest, <Feature>InserirComando>();
        CreateMap<<Feature>EditarRequest, <Feature>EditarComando>();
        
        // Entidade → Response
        CreateMap<<Entidade>, <Feature>Response>();
    }
}
```

## Fluxo de Dados
```
Request (DTO) → Comando (Domínio) → Entidade → Response (DTO)
```

## Responsabilidades
- ✅ Mapear DTOs para comandos do domínio
- ✅ Chamar serviços de domínio
- ✅ Mapear entidades para responses
- ✅ Orquestrar múltiplos serviços se necessário
- ✅ Gerenciar transações via `IUnitOfWork`
- ❌ NÃO conter lógica de negócio
- ❌ NÃO acessar repositórios diretamente (exceto consultas simples)

## Gerenciamento de Transações

Os AppServicos são responsáveis por orquestrar transações usando `IUnitOfWork`:

### Padrão de Uso

```csharp
public class <Feature>AppServico : I<Feature>AppServico
{
    private readonly I<Feature>Servicos _<feature>Servicos;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public <Feature>AppServico(
        I<Feature>Servicos <feature>Servicos,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _<feature>Servicos = <feature>Servicos;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<<Feature>Response> InserirAsync(<Feature>InserirRequest request)
    {
        try
        {
            await _unitOfWork.BeginTransactionAsync();
            var comando = _mapper.Map<<Feature>InserirComando>(request);
            var entidade = await _<feature>Servicos.InserirAsync(comando);
            await _unitOfWork.CommitAsync();
            return _mapper.Map<<Feature>Response>(entidade);
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task ExcluirAsync(int id, int usuarioId)
    {
        try
        {
            await _unitOfWork.BeginTransactionAsync();
            await _<feature>Servicos.ExcluirAsync(id, usuarioId);
            await _unitOfWork.CommitAsync();
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }
}
```

### Quando Usar Unit of Work
- ✅ Operações que alteram dados (Insert, Update, Delete)
- ✅ Operações que envolvem múltiplas entidades
- ❌ Consultas somente leitura (Listar, Recuperar)

## Registro
Registrar em `ConfiguracoesInjecoesDependencia.AddInterfaces`:
```csharp
services.AddScoped<I<Feature>AppServico, <Feature>AppServico>();
```

Registrar Profile em `Program.cs`:
```csharp
config.AddProfile<<Feature>Profile>();
```
