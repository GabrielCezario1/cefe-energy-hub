# API de consulta de dados do sistema ProjectSwitch v1.2

Este template informa como fazer consultas à API de dados do sistema ProjectSwitch da Nortebox. Para isso, será necessário obter as credenciais juntamente com a Nortebox entrado com contato por e-mail em [contato@nortebox.com.br](mailto:contato@nortebox.com.br)

> Lembre-se de configurar o Access-Token nas configurações de autenticação.

---

## Índice de Métodos

- [Autenticação](#autenticação-1)
- [Variáveis](#variáveis)
- [Autenticação](#autenticação-2)
  - [GET Versão da API](#get-baseurltargetversion-versão-da-api)
  - [GET Verificar a data de validade do access token](#get-baseurltargettokenvalidity-verificar-a-data-de-validade-do-access-token)
  - [POST Renovar access token](#post-baseurl-renovar-access-token)
- [Equipamentos e Plantas](#equipamentos-e-plantas)
  - [GET Buscar lista de contratos](#get-baseurltargetcontracts-buscar-lista-de-contratos)
  - [GET Buscar lista de plantas](#get-baseurltargetplants-buscar-lista-de-plantas)
  - [GET Equipamentos de uma planta](#get-baseurltargetequipaments-equipamentos-de-uma-planta)
  - [GET Dados dos modens](#get-baseurltargetmodems-dados-dos-modens)
  - [POST Criar uma nova planta](#post-baseurl-criar-uma-nova-planta)
  - [GET Dados cadastrais de uma planta](#get-baseurltargetdetailplants-dados-cadastrais-de-uma-planta)
  - [POST Editar planta](#post-baseurl-editar-planta)
  - [POST Clonar uma planta](#post-baseurl-clonar-uma-planta)
  - [GET Ver mensagem de planta](#get-baseurltargetgetplantmessage-ver-mensagem-de-planta)
  - [POST Editar mensagem de planta](#post-baseurl-editar-mensagem-de-planta)
  - [POST Criar um equipamento](#post-baseurl-criar-um-equipamento)
  - [GET Dados cadastrais de um equipamento](#get-baseurltargetdetailequipament-dados-cadastrais-de-um-equipamento)
  - [POST Editar equipamento](#post-baseurl-editar-equipamento)
  - [POST Clonar um equipamento](#post-baseurl-clonar-um-equipamento)
  - [POST Migrar um equipamento](#post-baseurl-migrar-um-equipamento)
  - [POST Alocar modem](#post-baseurl-alocar-modem)
  - [POST Desalocar modem](#post-baseurl-desalocar-modem)
  - [POST Setar ID Modbus de equipamento](#post-baseurl-setar-id-modbus-de-equipamento)
  - [POST Remover ID Modbus de equipamento](#post-baseurl-remover-id-modbus-de-equipamento)
- [Tempo real](#tempo-real)
  - [GET Busca informações em tempo real](#get-baseurltargetrealtime-busca-informações-em-tempo-real)
  - [POST Enviar comando](#post-baseurl-enviar-comando)
  - [POST Solicitar leitura de parâmetro](#post-baseurl-solicitar-leitura-de-parâmetro)
  - [POST Escrever parâmetro](#post-baseurl-escrever-parâmetro)
- [Histórico](#histórico)
  - [GET Busca um snapshot do equipamento](#get-baseurltargetsnapshot-busca-um-snapshot-do-equipamento)
  - [GET Busca histórico de um equipamento](#get-baseurltargethistory-busca-histórico-de-um-equipamento)
  - [GET Busca ultimo valor de um campo](#get-baseurltargetlastvalue-busca-ultimo-valor-de-um-campo)
  - [GET Histórico de Alarmes](#get-baseurltargetpreviousalarms-histórico-de-alarmes)
  - [GET Histórico de Comandos](#get-baseurltargetpreviouscommands-histórico-de-comandos)
  - [GET Histórico de Geração](#get-baseurltargetrunhistory-histórico-de-geração)
  - [GET Ver mensagens de histórico](#get-baseurltargetgetequipamenthistory-ver-mensagens-de-histórico)
  - [POST Adicionar mensagem de histórico de equipamento](#post-baseurl-adicionar-mensagem-de-histórico-de-equipamento)
  - [GET Ver status da 'Chave de boca'](#get-baseurltargetgetwrenchsymbol-ver-status-da-chave-de-boca)
  - [POST Ativar/desativar 'chave de boca'](#post-baseurl-ativardesativar-chave-de-boca)
- [Campos, comandos e parâmetros](#campos-comandos-e-parâmetros)
  - [GET Lista de campos](#get-baseurltargetfieldlist-lista-de-campos)
  - [GET Lista de comandos](#get-baseurltargetcommandlist-lista-de-comandos)
  - [GET Lista de parâmetros](#get-baseurltargetparamslist-lista-de-parâmetros)
  - [GET Lista de tipos de equipamentos](#get-baseurltargettypeequipamenlist-lista-de-tipos-de-equipamentos)
- [Usuários](#usuários)
  - [POST Criar novo usuário](#post-baseurl-criar-novo-usuário)
  - [GET Detalhes de usuário](#get-baseurltargetdetailuser-detalhes-de-usuário)
  - [POST Editar usuário](#post-baseurl-editar-usuário)
  - [POST Bloquear/desbloquear usuário](#post-baseurl-bloqueardesbloquear-usuário)
  - [POST Alterar a senha](#post-baseurl-alterar-a-senha)
  - [POST Alterar conta vinculada](#post-baseurl-alterar-conta-vinculada)
  - [POST Adicionar conta vinculada](#post-baseurl-adicionar-conta-vinculada)
  - [POST Alterar permissões de acesso](#post-baseurl-alterar-permissões-de-acesso)
  - [GET Procura convite de recuperação de senha](#get-baseurltargetrequestpassrecoverinvite-procura-convite-de-recuperação-de-senha)
  - [POST Convite de recuperação de senha](#post-baseurl-convite-de-recuperação-de-senha)

---

## Autenticação

**Type:** bearer

| Variável | Valor | Tipo |
|----------|-------|------|
| token | {{access_token}} | string |

---

## Variáveis

| Variável | Valor | Tipo |
|----------|-------|------|
| baseURL | https://projectswitch.nortebox.com.br/api.php | string |

---

## Autenticação

### GET `{{baseURL}}?target=version` [Versão da API]

Exibe a versão da API

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | version | Sim |

**Resposta em caso de sucesso**

```json
{
   "version":  "1.2"  /* Exibe a versão da API */
}
```

---

### GET `{{baseURL}}?target=tokenValidity` [Verificar a data de validade do access token]

Exibe a data de validade do token de autenticação

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | tokenValidity | Sim |

**Resposta em caso de sucesso**

```json
{
   "validity":  "2026-01-28 09:06:28"  /* Data e hora de validade do Access Token */
}
```

---

### POST `{{baseURL}}` [Renovar access token]

Renova o token de autenticação. Uma renovação de token deve ser solicitada antes do vencimento do token em uso. Caso o token não seja renovado antes do vencimento, o mesmo será bloqueado, necessitando contato com o suporte para a geração de um novo token

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | renoveToken | Sim |

**Resposta em caso de sucesso**

```json
{
   "accessToken":  "ACCESS TOKEN DE EXEMPLO",  /* Novo Access Token */
   "validity":  "2026-01-28 09:06:28"  /* Data e hora de validade do Access Token */
}
```

---

## Equipamentos e Plantas

### GET `{{baseURL}}?target=contracts` [Buscar lista de contratos]

Exibe a lista de contratos

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | contracts | Sim |

**Resposta em caso de sucesso**

```json
[
  {
     "idContrato":  0,  /* ID do contrato */
     "contrato":  ""  /* Nome do contrato */
  }
]  /* Lista de contratos */
```

---

### GET `{{baseURL}}?target=plants` [Buscar lista de plantas]

Exibe a lista de plantas

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | plants | Sim |
| idContrato | integer | Código de contrato para filtrar plantas específicas | | Não |

**Resposta em caso de sucesso**

```json
[
  {
     "id":  0,  /* ID da planta */
     "nome":  "",  /* Nome da planta */
     "idContrato":  "",  /* ID do contrato ao qual a planta pertence */
     "contrato":  ""  /* Nome do contrato ao qual a planta pertence */
  }
]  /* Lista de plantas */
```

---

### GET `{{baseURL}}?target=equipaments` [Equipamentos de uma planta]

Exibe a lista de equipamentos de uma planta

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | equipaments | Sim |
| plantId | integer | Código da planta para exibir os equipamentos | | Sim |

**Resposta em caso de sucesso**

```json
[
  {
     "codigo":  0,  /* ID do equipamento */
     "nome":  "",  /* Nome do equipamento */
     "numero_serie":  "",  /* Número de série */
     "motor":  "",  /* Marca/modelo do motor */
     "motor_serie":  "",  /* Número de série do motor */
     "alternador":  "",  /* Marca/modelo do alternador */
     "alternador_serie":  "",  /* Número de série do alternador */
     "modulo":  "",  /* Marca/modelo do controlador */
     "modulo_serie":  "",  /* Número de série do controlador */
     "potencia":  "",  /* Potência ativa em kW */
     "tensao":  "",  /* Tensão de operação em V */
     "grupo_modelo":  "",  /* Grupo do tipo de equipamento */
     "potencia_aparente":  "",  /* Potência aparente em kVA */
     "patrimonio":  "",  /* Número de patrimônio */
     "id_tipo_equipamento":  "",  /* ID do tipo de equipamento */
     "tipo":  "",  /* Nome do tipo de equipamento */
     "online":  true,  /* Se o equipamento está online */
     "chave_de_boca":  true  /* Se o símbolo de 'chave de boca' está visível no equipamento */
  }
]  /* Lista de equipamentos */
```

---

### GET `{{baseURL}}?target=modems` [Dados dos modens]

Exibe os dados dos modens

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | modems | Sim |
| onlyStatus | integer | Caso esteja presente, mostra informações resumidas | | Não |
| idContrato | integer | Código de contrato para filtrar modens especificos | | Não |

**Resposta em caso de sucesso**

```json
[
  {
     "id":  0,  /* ID do modem */
     "cod_modem":  "ModemXXXX",  /* Código do modem */
     "descricao":  "",  /* Descrição do modem */
     "online":  true,  /* Se o modem está online */
     "idPlanta":  0,  /* ID da planta ao qual o modem está configurado */
     "idContrato":  0,  /* ID do contrato ao qual pertence o modem */
     "planta":  "",  /* Nome da planta ao qual o modem está configurado */
     "modelo":  "",  /* Modelo do modem */
     "imei":  "",  /* IMEI (Somente se não enviar o parâmetro onlyStatus) */
     "mac":  "",  /* MAC (Somente se não enviar o parâmetro onlyStatus) */
     "simcards": [
        {
           "operadora":  "",  /* Operadora */
           "iccid":  "",  /* ICCID */
           "franquia":  0,  /* Franquia [Mb] */
           "consumo":  0  /* Consumo de dados [Mb] */
        }
     ],  /* Sim-cards (Somente se não enviar o parâmetro onlyStatus) */
     "equips": [
        {
           "equipamentId":  0,  /* ID do equipamento */
           "modbus_id":  0,  /* ID Modbus do equipamento */
           "equipamento":  "",  /* Nome do equipamento */
           "planta":  ""  /* Nome da planta */
        }
     ]  /* Equipamentos vinculados (Somente se não enviar o parâmetro onlyStatus) */
  }
]  /* Lista de modens */
```

---

### POST `{{baseURL}}` [Criar uma nova planta]

Cria uma nova planta

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | createPlant | Sim |
| idContrato | integer | Código do contrato para a nova planta | | Sim |
| nome | texto | Nome da planta | | Sim |
| descricao | texto | Descrição | | Não |
| capacidade | integer | Capacidade em kW | | Sim |
| qtdEquipamentos | integer | Quantidade de máquinas | | Sim |
| endereco | texto | Endereço | | Não |
| complemento | texto | Complemento | | Não |
| bairro | texto | Bairro | | Não |
| cidade | texto | Cidade | | Não |
| uf | texto | UF | | Não |
| cep | texto | CEP | | Não |
| latitude | float | Latitude | | Não |
| longitude | float | Longitude | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idPlanta":  0  /* ID da nova planta criada */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### GET `{{baseURL}}?target=detailPlants` [Dados cadastrais de uma planta]

Ver dados cadastrais de uma planta

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | detailPlants | Sim |
| idPlanta | integer | Código da planta | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idPlanta":  0,  /* Código da planta */
   "nome":  "",  /* Nome da planta */
   "descricao":  "",  /* Descrição */
   "capacidade":  0,  /* Capacidade em kW */
   "qtdEquipamentos":  0,  /* Quantidade de equipamentos */
   "endereco":  "",  /* Endereço */
   "complemento":  "",  /* Complemento */
   "bairro":  "",  /* Bairro */
   "cidade":  "",  /* Cidade */
   "uf":  "",  /* UF */
   "cep":  "",  /* CEP */
   "latitude":  0.00,  /* Latitude */
   "longitude":  0.00,  /* Longitude */
   "obs":  "",  /* Observações */
   "idEquipamentoEntrada":  0,  /* Código do equipamento de entrada */
   "idEquipamentoRastreador":  0  /* Código do equipamento rastreador */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Editar planta]

Editar os dados de uma planta

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | editPlant | Sim |
| idPlanta | integer | Código da planta que deseja editar | | Sim |
| nome | texto | Nome da planta | | Não |
| descricao | texto | Descrição | | Não |
| capacidade | integer | Capacidade em kW | | Não |
| qtdEquipamentos | integer | Quantidade de máquinas | | Não |
| endereco | texto | Endereço | | Não |
| complemento | texto | Complemento | | Não |
| bairro | texto | Bairro | | Não |
| cidade | texto | Cidade | | Não |
| uf | texto | UF | | Não |
| cep | texto | CEP | | Não |
| latitude | float | Latitude | | Não |
| longitude | float | Longitude | | Não |
| idEquipamentoEntrada | integer | ID do equipamento de entrada | | Não |
| idEquipamentoRastreador | integer | ID do equipamento rastreador | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Clonar uma planta]

Clonar planta

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | clonePlant | Sim |
| idPlanta | integer | Código da planta que será clonada | | Sim |
| idContrato | integer | Código do contrato destino do clone | | Sim |
| cloneCompleto | bool | Em um clone completo, a planta é clonada juntamente com todos os seus equipamentos | | Não |
| nome | texto | Nome da nova planta | | Não |
| descricao | texto | Descrição da nova planta | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idPlanta":  0  /* ID da nova planta criada */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### GET `{{baseURL}}?target=getPlantMessage` [Ver mensagem de planta]

Ver a mensagem atual de uma planta

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | getPlantMessage | Sim |
| idPlanta | integer | Código da planta | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idPlanta":  0,  /* Código da planta */
   "tipo":  "",  /* Tipo da mensagem. Pode ser danger, warning, info */
   "mensagem":  "",  /* Texto da mensagem */
   "visivel":  true  /* Se a mensagem está visível */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Editar mensagem de planta]

Editar a mensagem atual de uma planta

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | setPlantMessage | Sim |
| idPlanta | integer | Código da planta que deseja editar | | Sim |
| tipo | texto | Tipo de mensagem. Pode ser info, cuidado, perigo | | Não |
| mensagem | texto | Texto da mensagem | | Não |
| visivel | bool | Se a mensagem é visível | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Criar um equipamento]

Criar um equipamento

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | createEquipament | Sim |
| idPlanta | integer | ID da planta onde o equipamento será criado | | Sim |
| nome | texto | Nome do equipamento | | Sim |
| idTipoEquipamento | texto | ID do tipo de equipamento | | Sim |
| patrimonio | texto | Capacidade em kW | | Não |
| potenciaAtiva | integer | Potência ativa em kW | | Sim |
| potenciaAparente | integer | Potência aparente em kVA | | Sim |
| numeroSerie | texto | Número de série do equipamento | | Não |
| motor | texto | Marca/modelo do motor | | Não |
| serieMotor | texto | Numero de série do motor | | Não |
| alternador | texto | Marca/modelo do alternador | | Não |
| serieAlternador | texto | Numero de série do alternador | | Não |
| controlador | texto | Marca/modelo do controlador | | Não |
| serieControlador | texto | Numero de série do controlador | | Não |
| oculto | bool | Se este equipamento ficará oculto | | Não |
| eEquipamentoDeEntrada | bool | Se este equipamento será a entrada da planta | | Não |
| eEquipamentoRastreador | bool | Se este equipamento será o rastreador da planta | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idEquipamento":  0  /* ID do novo equipamento criado */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### GET `{{baseURL}}?target=detailEquipament` [Dados cadastrais de um equipamento]

Buscar os dados de um equipamento

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | detailEquipament | Sim |
| idEquipamento | integer | ID do equipamento para buscar os dados | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idEquipamento":  0,  /* ID do equipamento */
   "idPlanta":  0,  /* ID da planta a qual o equipamento pertence */
   "idTipo":  0,  /* ID do tipo de equipamento */
   "nome":  "",  /* Nome do equipamento */
   "patrimonio":  "",  /* Patrimônio */
   "numeroSerie":  "",  /* Número de série */
   "potencia_ativa":  0,  /* Potência ativa em kW */
   "potencia_aparente":  0,  /* Potência aparente em kVA */
   "motor":  "",  /* Marca/modelo do motor */
   "serieMotor":  "",  /* Número de série do motor */
   "alternador":  "",  /* Marca/modelo do alternador */
   "serieAlternador":  "",  /* Número de série do alternador */
   "controlador":  "",  /* Marca/modelo do controlador */
   "serieControlador":  "",  /* Número de série do controlador */
   "oculto":  true,  /* Se o equipamento é oculto */
   "entradaPlanta":  true,  /* Se o equipamento é a entrada da planta */
   "rastreadorPlanta":  true  /* Se o equipamento é o rastreador da planta */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Editar equipamento]

Editar dados cadastrais de um equipamento

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | editEquipament | Sim |
| idEquipamento | integer | ID do equipamento para editar | | Sim |
| patrimonio | texto | Capacidade em kW | | Não |
| numeroSerie | texto | Número de série do equipamento | | Não |
| potenciaAtiva | integer | Potência ativa em kW | | Não |
| potenciaAparente | integer | Potência aparente em kVA | | Não |
| motor | texto | Marca/modelo do motor | | Não |
| serieMotor | texto | Numero de série do motor | | Não |
| alternador | texto | Marca/modelo do alternador | | Não |
| serieAlternador | texto | Numero de série do alternador | | Não |
| controlador | texto | Marca/modelo do controlador | | Não |
| serieControlador | texto | Numero de série do controlador | | Não |
| oculto | bool | Se este equipamento ficará oculto | | Não |
| entradaDaPlanta | bool | Se este equipamento será a entrada da planta | | Não |
| rastreadorDaPlanta | bool | Se este equipamento será o rastreador da planta | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idEquipamento":  0  /* ID do novo equipamento criado */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Clonar um equipamento]

Clonar um equipamento

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | cloneEquipamet | Sim |
| idEquipamento | integer | ID do equipamento para clonar | | Sim |
| idPlanta | integer | Planta de destino do clone do equipamento | | Sim |
| nome | texto | Nome do novo equipamento | | Sim |
| patrimonio | texto | Patrimônio do novo equipamento | | Sim |
| eEquipamentoDeEntrada | bool | Se o novo equipamento será o equipamento de entrada da planta | | Sim |
| eEquipamentoRastreador | bool | Se o novo equipamento será o rastreador da planta | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idEquipamento":  0,  /* ID do novo equipamento criado */
   "idPlanta":  0  /* ID da planta destino */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Migrar um equipamento]

Migrar um equipamento para nova planta

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | moveEquipamet | Sim |
| idEquipamento | integer | ID do equipamento para migrar | | Sim |
| idPlanta | integer | Planta de destino do equipamento | | Sim |
| nome | texto | Nome equipamento | | Não |
| patrimonio | texto | Patrimônio do equipamento | | Não |
| eEquipamentoDeEntrada | bool | Se o equipamento será o equipamento de entrada da planta | | Sim |
| eEquipamentoRastreador | bool | Se o equipamento será o rastreador da planta | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idEquipamento":  0,  /* ID do equipamento */
   "idPlanta":  0  /* ID da planta destino */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Alocar modem]

Faz a alocação de um modem para uma planta

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | allocateModem | Sim |
| idModem | integer | ID do modem para ser alocado | | Sim |
| idPlanta | integer | Planta de destino | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Desalocar modem]

Retorna um modem para o estoque, removendo todas as suas alocações

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | freeModem | Sim |
| idModem | integer | ID do modem para ser devolvido ao estoque | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Setar ID Modbus de equipamento]

Cadastra o ID Modbus de um equipamento a um modem

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | setModem | Sim |
| idModem | integer | ID do modem | | Sim |
| idEquipamento | integer | ID do equipamento | | Sim |
| modbusId | integer | ID Modbus do equipamento | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Remover ID Modbus de equipamento]

Remover o ID Modbus e o vinculo de um equipamento a um modem

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | unsetModem | Sim |
| idEquipamento | integer | ID do equipamento | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

## Tempo real

### GET `{{baseURL}}?target=realtime` [Busca informações em tempo real]

Exibe dados de tempo real

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | realtime | Sim |
| mode | text | Modo da consulta. Pode ser all, alarms, readings, commands, params | | Sim |
| equipaments | text | Lista dos equipamentos para buscar os dados, separados por vírgula | | Não |

**Resposta em caso de sucesso**

```json
[
  {
     "id":  0,  /* ID do equipamento */
     "name":  "",  /* Nome do equipamento */
     "online":  true,  /* O equipamento está online no momento */
     "alarms": [
        {
           "data_cadastro":  "2026-01-28 09:06:28",  /* Data/hora do alarme */
           "visto":  true,  /* Se o alarme foi marcado como visto */
           "data_vista":  "",  /* Data em que o alarme foi marcado como visto */
           "nome":  "",  /* Nome do alarme */
           "descricao":  ""  /* Descrição do alarme */
        }
     ],  /* Lista de alarmes ativos */
     "readings": [
        {
           "valor":  "",  /* Valor da leitura */
           "data_cadastro":  "2026-01-28 09:06:28",  /* Data/hora da leitura */
           "nome_campo":  "",  /* Nome do campo */
           "descricao":  "",  /* Descrição do campo */
           "unidade":  "",  /* Unidade */
           "cod_campo":  0  /* ID do campo */
        }
     ],  /* Lista de leituras atuais */
     "commands": [
        {
           "nome":  "",  /* Nome do comando */
           "descricao":  "",  /* Descrição do comando */
           "data_cadastro":  "2026-01-28 09:06:28",  /* Data/hora do cadastro */
           "data_tentativa":  "2026-01-28 09:06:28",  /* Data/hora da ultima tentativa de executar o comando */
           "tentativas":  0,  /* Número de tentativas de executar o comando */
           "expirado":  true  /* Se o envio do comando está expirado */
        }
     ],  /* Fila de comandos */
     "params": [
        {
           "nome":  "",  /* Nome do parâmetro */
           "descricao":  "",  /* Descrição do parâmetro */
           "valor":  "",  /* Valor do parâmetro */
           "data_leitura":  "2026-01-28 09:06:28",  /* Data/hora da leitura do parâmetro */
           "lido":  true  /* Se o novo valor do parâmetro foi lido */
        }
     ]  /* Lista de parâmetros */
  }
]  /* Lista de equipamentos */
```

---

### POST `{{baseURL}}` [Enviar comando]

Envia um comando para um equipamento

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | sendCommand | Sim |
| idEquipamento | integer | ID do equipamento | | Sim |
| commandName | text | Nome do comando a ser executado | | Sim |
| value | integer | Valor para escrever no comando | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "ok",
   "msg":  ""  /* Mensagem de erro */
}
```

---

### POST `{{baseURL}}` [Solicitar leitura de parâmetro]

Solicita a leitura de um parâmetro

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | requestParam | Sim |
| idEquipamento | integer | ID do equipamento | | Sim |
| paramName | text | Nome do parâmetro a ser lido | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "ok",
   "msg":  ""  /* Mensagem de erro */
}
```

---

### POST `{{baseURL}}` [Escrever parâmetro]

Escreve um parâmetro em um equipamento

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | writeParam | Sim |
| idEquipamento | integer | ID do equipamento | | Sim |
| paramName | text | Nome do parâmetro a ser lido | | Sim |
| value | text | Valor para escrever no parâmetro | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "ok",
   "msg":  ""  /* Mensagem de erro */
}
```

---

## Histórico

### GET `{{baseURL}}?target=snapshot` [Busca um snapshot do equipamento]

Exibe uma fotografia dos dados do equipamento

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | snapshot | Sim |
| equipamentId | integer | ID do equipamento | | Sim |
| moment | text | Data e hora dos dados. Formato: 2025-10-21 10:55:32 | | Não |

**Resposta em caso de sucesso**

```json
{
   "id":  0,  /* ID do equipamento */
   "moment":  "2026-01-28 09:06:28",  /* Data/hora do snapshot solicitado */
   "snap": [
      {
         "data_leitura":  "2026-01-28 09:06:28",  /* Data/hora da leitura */
         "valor":  "",  /* Valor da leitura */
         "nome_campo":  "",  /* Nome do campo */
         "descricao":  "",  /* Descrição do campo */
         "unidade":  "",  /* Unidade */
         "cod_campo":  0  /* ID do campo */
      }
   ]  /* Resultados encontrados */
}
```

---

### GET `{{baseURL}}?target=history` [Busca histórico de um equipamento]

Busca valores históricos de um campo

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | history | Sim |
| equipamentId | integer | ID do equipamento | | Sim |
| startDate | text | Data e hora de início. Formato: 2025-10-21 10:55:32 | | Sim |
| endDate | text | Data e hora de fim. Formato: 2025-10-21 10:55:32 | | Sim |
| field | text | Nome do campo que está buscando o histórico | | Não |
| fieldId | text | ID de campo que está buscando o histórico | | Não |

**Resposta em caso de sucesso**

```json
{
   "id":  0,  /* ID do equipamento */
   "name":  0,  /* Nome do equipamento */
   "startDate":  "2026-01-28 09:06:28",  /* Data/hora inicial */
   "endDate":  "2026-01-28 09:06:28",  /* Data/hora final */
   "field":  "",  /* Nome do campo solicitado */
   "fieldId":  0,  /* ID do campo solicitado */
   "history": [
      {
         "data_leitura":  "2026-01-28 09:06:28",  /* Data/hora da leitura */
         "valor":  "",  /* Valor da leitura */
         "nome_campo":  "",  /* Nome do campo */
         "descricao":  "",  /* Descrição do campo */
         "unidade":  ""  /* Unidade */
      }
   ]  /* Histórico */
}
```

---

### GET `{{baseURL}}?target=lastValue` [Busca ultimo valor de um campo]

Busca o ultimo valor de um campo

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | lastValue | Sim |
| equipaments | integer | Lista de IDs de equipamentos separada por vírgula | | Não |
| plantId | integer | ID da planta | | Não |
| field | text | Nome do campo que está buscando o histórico | | Não |
| fieldId | text | ID de campo que está buscando o histórico | | Não |

**Resposta em caso de sucesso**

```json
{
   "id":  0,  /* ID do equipamento */
   "name":  "",  /* Nome do equipamento */
   "field":  "",  /* Nome do campo solicitado */
   "fieldId":  0,  /* ID do campo solicitado */
   "origin":  "",  /* Origem da leitura. Pode ser history, realtime ou no-value */
   "moment":  "2026-01-28 09:06:28",  /* Data/hora da leitura */
   "valor":  "",  /* Valor da leitura */
   "unidade":  ""  /* Unidade */
}
```

---

### GET `{{baseURL}}?target=previousAlarms` [Histórico de Alarmes]

Busca hostórico de alarmes de um equipamento

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | previousAlarms | Sim |
| equipamentId | integer | ID do equipamento | | Sim |
| startDate | text | Data e hora de início. Formato: 2025-10-21 10:55:32 | | Sim |
| endDate | text | Data e hora de fim. Formato: 2025-10-21 10:55:32 | | Sim |

**Resposta em caso de sucesso**

```json
{
   "id":  0,  /* ID do equipamento */
   "name":  "",  /* Nome do equipamento */
   "startDate":  "2026-01-28 09:06:28",  /* Data/hora de inicio */
   "endDate":  "",  /* Data/hora de fim */
   "alarms": [
      {
         "nome":  "",  /* Nome do alarme */
         "descricao":  "",  /* Descrição do alarme */
         "data_cadastro":  "2026-01-28 09:06:28",  /* Data/hora de registro do alarme */
         "data_ack":  "2026-01-28 09:06:28",  /* Data/hora de reconhecimento do alarme */
         "data_saida":  "2026-01-28 09:06:28"  /* Data/hora de saída do alarme */
      }
   ]  /* Lista de alarmes */
}
```

---

### GET `{{baseURL}}?target=previousCommands` [Histórico de Comandos]

Busca hostórico de comandos de um equipamento

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | previousCommands | Sim |
| equipamentId | integer | ID do equipamento | | Sim |
| startDate | text | Data e hora de início. Formato: 2025-10-21 10:55:32 | | Sim |
| endDate | text | Data e hora de fim. Formato: 2025-10-21 10:55:32 | | Sim |

**Resposta em caso de sucesso**

```json
{
   "id":  0,  /* ID do equipamento */
   "name":  "",  /* Nome do equipamento */
   "startDate":  "2026-01-28 09:06:28",  /* Data/hora de inicio */
   "endDate":  "2026-01-28 09:06:28",  /* Data/hora de fim */
   "commands": [
      {
         "nome":  "",  /* Nome do comando */
         "descricao":  "",  /* Descrição do comando */
         "data_comando":  "2026-01-28 09:06:28",  /* Data/hora de envio do comando */
         "username":  ""  /* Nome do usuário que enviou o comando */
      }
   ]  /* Lista de comandos */
}
```

---

### GET `{{baseURL}}?target=runHistory` [Histórico de Geração]

Busca hostórico de geração de um equipamento

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | runHistory | Sim |
| equipamentId | integer | ID do equipamento | | Sim |
| startDate | text | Data e hora de início. Formato: 2025-10-21 10:55:32 | | Sim |
| endDate | text | Data e hora de fim. Formato: 2025-10-21 10:55:32 | | Sim |

**Resposta em caso de sucesso**

```json
{
   "id":  0,  /* ID do equipamento */
   "name":  "",  /* Nome do equipamento */
   "startDate":  "2026-01-28 09:06:28",  /* Data/hora de inicio */
   "endDate":  "2026-01-28 09:06:28",  /* Data/hora de fim */
   "history": [
      {
         "energia_inicial":  0.00,  /* Energia inicial [kWh] */
         "energia_final":  0.00,  /* Energia fnicial [kWh] */
         "energia_total":  0.00,  /* Energia total [kWh] */
         "horimetro_inicial":  0.00,  /* Horímetro inicial [h] */
         "horimetro_final":  0.00,  /* Horímetro fnicial [h] */
         "horimetro_total":  0.00,  /* Horímetro total [h] */
         "comb_inicial":  0.00,  /* Combustível inicial [kL] */
         "comb_final":  0.00,  /* Combustível fnicial [kL] */
         "comb_total":  0.00,  /* Combustível total [kL] */
         "data_inicial":  "2026-01-28 09:06:28",  /* Data/hora inicial */
         "data_final":  "2026-01-28 09:06:28",  /* Data/hora final */
         "funcionamento":  true,  /* Registro com a máquina em funcionamento */
         "finalizada":  true,  /* Geração finalizada */
         "nome":  ""  /* Classificação desta geração */
      }
   ]  /* Lista de histórico de geração */
}
```

---

### GET `{{baseURL}}?target=getEquipamentHistory` [Ver mensagens de histórico]

Ver mensagens de histórico de equipamento

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | getEquipamentHistory | Sim |
| idEquipamento | integer | ID do equipamento | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "mensagens": [
      {
         "titulo":  "",  /* Título da mensagem */
         "texto":  "",  /* Texto da mensagem */
         "cadastro":  "2026-01-28 09:06:28"  /* Data/hora de cadastro */
      }
   ]  /* Lista de mensagens de histórico */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Adicionar mensagem de histórico de equipamento]

Cadastrar nova mensagem de histórico de equipamento

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | addEquipamentHistory | Sim |
| idEquipamento | integer | ID do equipamento para migrar | | Sim |
| titulo | texto | Título da mensagem | | Não |
| texto | texto | Texto da mensagem | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### GET `{{baseURL}}?target=getWrenchSymbol` [Ver status da 'Chave de boca']

Ver status do símbolo de 'Chave de Boca'

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | getWrenchSymbol | Sim |
| idEquipamento | integer | ID do equipamento | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "presente":  true,  /* Se o símbolo de 'chave de boca' está presente */
   "dataEvento":  "2026-01-28 09:06:28",  /* Data/hora da inclusão do símbolo de 'chave de boca' */
   "motivo":  ""  /* Motivo do evento de 'chave de boca' */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Ativar/desativar 'chave de boca']

Ativar/desativar símbolo de 'chave de boca'

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | setWrenchSymbol | Sim |
| idEquipamento | integer | ID do equipamento | | Sim |
| ativar | bool | Caso esteja presente, ativa o símbolo de 'chave de boca' | | Não |
| dataEvento | texto | Título da mensagem | | Não |
| motivo | texto | Texto da mensagem | | Não |
| desativar | bool | Caso esteja presente, desativa o símbolo de 'chave de boca' | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

## Campos, comandos e parâmetros

### GET `{{baseURL}}?target=fieldList` [Lista de campos]

Exibe os campos disponíveis

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | fieldList | Sim |
| equipamentId | integer | Caso esteja presente, informa um ID de equipamento | | Não |
| typeId | integer | Caso esteja presente, informa o ID de um tipo de equipamento | | Não |

**Resposta em caso de sucesso**

```json
{
   "id":  0,  /* ID do tipo de equipamento */
   "nome":  "",  /* Nome do tipo de equipamento */
   "fields": [
      {
         "nome_campo":  "",  /* Nome do campo */
         "descricao":  "",  /* Descrição do campo */
         "unidade":  "",  /* Unidade */
         "binario":  true,  /* Se o campo é binário */
         "salvar":  true,  /* Se o campo é salvo no log */
         "calculado":  true,  /* Se o campo é calculado pelo sistema */
         "acumulador":  true  /* Se o campo é um acumulador */
      }
   ]  /* Lista de campos */
}
```

---

### GET `{{baseURL}}?target=commandList` [Lista de comandos]

Exibe os comandos disponíveis

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | commandList | Sim |
| equipamentId | integer | Caso esteja presente, informa um ID de equipamento | | Não |
| typeId | integer | Caso esteja presente, informa o ID de um tipo de equipamento | | Não |

**Resposta em caso de sucesso**

```json
{
   "id":  0,  /* ID do tipo de equipamento */
   "nome":  "",  /* Nome do tipo de equipamento */
   "commands": [
      {
         "nome":  "",  /* Nome do comando */
         "descricao":  ""  /* Descrição do comando */
      }
   ]  /* Lista de comandos */
}
```

---

### GET `{{baseURL}}?target=paramsList` [Lista de parâmetros]

Exibe os parâmetros disponíveis

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | paramsList | Sim |
| equipamentId | integer | Caso esteja presente, informa um ID de equipamento | | Não |
| typeId | integer | Caso esteja presente, informa o ID de um tipo de equipamento | | Não |

**Resposta em caso de sucesso**

```json
{
   "id":  0,  /* ID do tipo de equipamento */
   "nome":  "",  /* Nome do tipo de equipamento */
   "params": [
      {
         "nome":  "",  /* Nome do parâmetro */
         "descricao":  "",  /* Descrição do parâmetro */
         "editavel":  true  /* Se este parâmetro pode ser editado pelo sistema */
      }
   ]  /* Lista de parâmetros */
}
```

---

### GET `{{baseURL}}?target=typeEquipamenList` [Lista de tipos de equipamentos]

Exibe a lista de tipos de equipamentos disponíveis

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | typeEquipamenList | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "types": [
      {
         "id":  0,  /* ID do tipo de equipamento */
         "nome":  "",  /* Nome do tipo de equipamento */
         "descricao":  "",  /* Descrição */
         "classe":  "",  /* Classe */
         "categorias":  "",  /* Categorias */
         "registraLeituras":  true,  /* Equipamento registra leituras */
         "registraAlarmes":  true,  /* Equipamento registra alarmes */
         "registraGeracao":  true,  /* Equipamento registra geração */
         "enviaComandos":  true,  /* Equipamento envia comandos */
         "registraCombustivel":  true,  /* Equipamento registra combustível */
         "registraEnergia":  true,  /* Equipamento registra energia */
         "registraHorimetro":  true  /* Equipamento registra horímetro */
      }
   ]  /* Lista com os tipos de equipamentos */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

## Usuários

### POST `{{baseURL}}` [Criar novo usuário]

Criar um novo usuário

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | createUser | Sim |
| idContrato | integer | Código do contrato o novo usuário | | Sim |
| login | texto | Login do novo usuário | | Sim |
| nome | texto | Nome do usuário | | Sim |
| senha | texto | Senha para o novo usuário | | Não |
| rg | texto | RG | | Não |
| cpf | integer | CPF | | Não |
| endereco | texto | Endereço | | Não |
| bairro | texto | Bairro | | Não |
| cidade | texto | Cidade | | Não |
| uf | texto | UF | | Não |
| cep | integer | CEP | | Não |
| email | texto | E-mail | | Não |
| telefone | integer | Telefone | | Não |
| celular | integer | Celular | | Não |
| permiteEmail | bool | Usuário permite o envio de e-mails | | Sim |
| permiteSms | bool | Usuário permite o envio de SMS | | Sim |
| permitePush | bool | Usuário permite o envio de notificações PUSH | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "idUsuario":  0,  /* ID do novo usuário criado */
   "msg":  ""  /* Mensagem com informações sobre a criação do usuário */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### GET `{{baseURL}}?target=detailUser` [Detalhes de usuário]

Buscar detalhes de um usuário

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | detailUser | Sim |
| idUsuario | integer | ID do usuário a ser buscado | | Não |
| login | text | Login do usuário a ser buscado | | Não |

**Resposta em caso de sucesso**

```json
{
   "idUsuario":  0,  /* ID do usuário */
   "login":  "",  /* Login do usuário */
   "nome":  "",  /* Nome do usuário */
   "rg":  "",  /* RG */
   "cpf":  0,  /* CPF */
   "endereco":  "",  /* Endereço */
   "bairro":  "",  /* Bairro */
   "cidade":  "",  /* Cidade */
   "uf":  "",  /* UF */
   "cep":  0,  /* CEP */
   "email":  "",  /* E-mail */
   "telefone":  0,  /* Telefone */
   "celular":  0,  /* Celular */
   "permiteEmail":  true,  /* Permite envio de e-mails */
   "permiteSms":  true,  /* Permite envio de SMS */
   "permitePush":  true,  /* Permite envio de notificações PUSH */
   "bloqueado":  true,  /* Usuário bloqueado */
   "permissoes": [
      {
         "idPlanta":  0,  /* ID da planta */
         "nome":  "",  /* Nome da planta */
         "comandos":  true,  /* Usuário pode enviar comandos */
         "sms":  true,  /* Usuário recebe notificações por SMS */
         "email":  true  /* Usuário recebe notificações por e-mail */
      }
   ],  /* Permissões do usuário */
   "contasVinculadas": [
      {
         "idConta":  0,  /* ID da conta vinculada */
         "provedor":  "",  /* Provedor de autenticação */
         "uuid":  "",  /* UUID do usuário */
         "ativa":  true  /* Conta ativa */
      }
   ]  /* Contas vinculadas */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Editar usuário]

Editar um usuário

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | editUser | Sim |
| idUsuario | integer | ID de usuário para editar | | Sim |
| nome | texto | Nome do usuário | | Não |
| rg | texto | RG | | Não |
| cpf | integer | CPF | | Não |
| endereco | texto | Endereço | | Não |
| bairro | texto | Bairro | | Não |
| cidade | texto | Cidade | | Não |
| uf | texto | UF | | Não |
| cep | integer | CEP | | Não |
| email | texto | E-mail | | Não |
| telefone | integer | Telefone | | Não |
| celular | integer | Celular | | Não |
| permiteEmail | bool | Usuário permite o envio de e-mails | | Não |
| permiteSms | bool | Usuário permite o envio de SMS | | Não |
| permitePush | bool | Usuário permite o envio de notificações PUSH | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Bloquear/desbloquear usuário]

Bloquear/desbloquer um usuário

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | blockUser | Sim |
| idUsuario | integer | ID de usuário para editar | | Sim |
| bloquear | bool | Flag que indica que é para bloquer um usuário | | Não |
| desbloquear | bool | Flag que indica que é para desbloquer um usuário | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Alterar a senha]

Alterar a senha de um usuário

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | changeUserPassword | Sim |
| idUsuario | integer | ID de usuário para editar | | Sim |
| novaSenha | texto | Nova senha do usuário | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Alterar conta vinculada]

Alterar uma conta vinculada a um usuário

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | changeUserLinkedAccounts | Sim |
| idUsuario | integer | ID de usuário para editar | | Sim |
| provedor | texto | Provedor de autenticação | | Sim |
| ativo | bool | Se o provedor de autenticação será ativado/desativado | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Adicionar conta vinculada]

Adicionar uma nova conta vinculada ao usuário

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | addUserLinkedAccount | Sim |
| idUsuario | integer | ID de usuário para editar | | Sim |
| provedor | texto | Provedor de autenticação | | Sim |
| uuid | texto | UUID da conta vinculada | | Sim |
| ativo | bool | Se a conta está ativa | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Alterar permissões de acesso]

Alterar permissões de acesso de um usuário

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | changeUserPermission | Sim |
| idUsuario | integer | ID de usuário para editar | | Sim |
| idPlanta | integer | ID da planta | | Sim |
| acesso | bool | Usuário com acesso à planta | | Sim |
| comandos | bool | Usuário com permissão de comandos nesta planta | | Não |
| sms | bool | Usuário recebe notificação SMS desta planta | | Não |
| email | bool | Usuário recebe notificação por e-mail desta planta | | Não |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok"
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### GET `{{baseURL}}?target=requestPassRecoverInvite` [Procura convite de recuperação de senha]

Verifica se existe um convite de recuperação de senha

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| target | text | Chamada da API | requestPassRecoverInvite | Sim |
| idUsuario | integer | ID de usuário | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "link":  "https://link.para.o.servidor/convite?id=123456",  /* Link para recuperação de senha */
   "emissao":  "2026-01-28 09:06:28"  /* Data/hora de emissão do convite */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```

---

### POST `{{baseURL}}` [Convite de recuperação de senha]

Gera um convite para recuperação de senha

**Dados do formulário [formdata]**

| Parâmetro | Tipo | Descrição | Valor | Requerido |
|-----------|------|-----------|-------|-----------|
| operation | text | Chamada da API | requestPassRecoverInvite | Sim |
| idUsuario | integer | ID de usuário | | Sim |

**Resposta em caso de sucesso**

```json
{
   "status":  "ok",
   "link":  "https://link.para.o.servidor/convite?id=123456",  /* Link para recuperação de senha */
   "validade":  "2026-01-28 09:06:28"  /* Data/hora de validade do convite */
}
```

**Resposta em caso de erro**

```json
{
   "status":  "erro",
   "msg":  ""  /* Mensagem do erro ocorrida */
}
```
