# Documentação dos Workflows n8n

## Visão Geral

O n8n gerencia os fluxos de automação que conectam o Gmail, Google Drive e Supabase. Existem dois pipelines independentes: um para **contratos** e outro para **processos trabalhistas**.

```
CONTRATOS
Email com PDF → Workflow 3 (detecta palavra "Contrato") → Google Drive
                                                              └─ Workflow 1 (GPT-5-mini) → Supabase contratos
                                                              └─ Workflow 2 (Gemini)     → Supabase contratos

PROCESSOS TRABALHISTAS
Email do cliente → Workflow Processos → Switch (tipo de email)
                                            └─ Novo Caso → Drive + Gemini → Supabase processos
```

## Workflow de Processos Trabalhistas

Fluxo integrado que captura emails de clientes solicitando abertura de processo trabalhista, organiza os documentos no Drive, notifica o cliente e salva os dados no Supabase.

### Fluxo

```
Gmail Trigger
   └─ Switch (Rules)
       ├─ Novo Caso      → Pega dados e extrai PDF → Edit Fields → Create folder (Drive)
       │                                                               └─ Share folder
       │                                                                   └─ Send a message (confirmação ao cliente)
       │                                                                       └─ Mensagem ao Gemini
       │                                                                           └─ Formata resposta da IA
       │                                                                               └─ HTTP Request → Supabase processos
       ├─ Primeiro Contato → (desativado)
       └─ Sem Automação    → (desativado)
```

### Detalhes de cada nó

**Gmail Trigger**
Monitora a caixa de entrada com polling contínuo. Captura novos emails automaticamente.

**Switch (mode: Rules)**
Classifica o email em três categorias:
- **Novo Caso**: email de cliente pedindo abertura de processo. Segue para o fluxo completo.
- **Primeiro Contato**: email inicial de apresentação. Nó desativado (sem ação configurada).
- **Sem Automação**: email que não requer resposta automática. Nó desativado.

**Pega dados do email e extrai o PDF**
Nó Gmail `get:message` que baixa a mensagem completa com os anexos. Extrai o conteúdo do PDF anexado para análise.

**Edit Fields**
Prepara e formata os campos do email (remetente, assunto, conteúdo) para os próximos nós.

**Create folder (Google Drive)**
Cria uma pasta individual no Google Drive para o caso. O nome da pasta é derivado dos dados do email.

**Share folder (Google Drive)**
Compartilha a pasta criada. O link da pasta fica disponível para ser incluído na resposta ao cliente.

**Send a message (Gmail)**
Envia um email de confirmação ao remetente informando que o caso foi recebido. Executado antes da análise de IA para resposta imediata ao cliente.

**Mensagem ao Gemini**
Envia o conteúdo extraído do email/PDF para o modelo Gemini com o prompt estruturado. Retorna JSON com os dados do processo.

**Formata a resposta da IA**
Nó JavaScript que faz o parse do JSON retornado pelo Gemini e prepara o payload para o Supabase:
```js
const texto = $input.first().json.text ??
              $input.first().json.content?.parts?.[0]?.text ??
              $input.first().json.message?.content ?? ''
const limpo = texto.replace(/```json/gi, '').replace(/```/g, '').trim()
const dados = JSON.parse(limpo)
return [{ json: dados }]
```

**HTTP Request**
POST para `https://dmafrzaahrsrzgftyoqq.supabase.co/rest/v1/processos` com o payload JSON formatado.

### Campos extraídos pela IA para processos

| Campo | Tipo |
|---|---|
| tipo_documento | string |
| titulo_contrato | string |
| categoria | string |
| resumo | string |
| parte_1_nome | string |
| parte_1_papel | string |
| parte_2_nome | string |
| parte_2_papel | string |
| valor_total | number |
| valor_mensal | string |
| forma_pagamento | string |
| prazos_importantes | array ou string |
| obrigacoes | array ou string |
| clausula_rescisao | string |
| clausula_multa | string |
| clausula_confidencialidade | string |
| clausula_renovacao | string |
| clausula_foro | string |
| clausula_lgpd | string |
| pontos_de_atencao | array ou string |
| alertas_recomendados | array ou string |
| prioridade_revisao | string (alta, media, baixa) |

## Workflow 3: Disparo por Email com Palavra-Chave (Contratos)

Ponto de entrada do pipeline de contratos. Monitora o Gmail, identifica emails com contratos em anexo e envia para o Google Drive.

### Fluxo

```
Gmail Trigger (polling a cada minuto)
   └─ Filtro: Subject contém "Contrato"?
       └─ Gmail get: baixa a mensagem com anexos
           └─ Set: conta anexos (Validador_de_doc)
               └─ If: Validador_de_doc == 1?
                   ├─ true  → Google Drive: upload para "Contratos Recebidos"
                   └─ false → No Operation
```

### Detalhes de cada nó

**Gmail Trigger**
Polling a cada minuto na conta OAuth2. Retorna todos os emails novos.

**Filtro por palavra-chave**
Nó Filter que verifica se o `Subject` contém `"Contrato"`. Apenas emails que passam seguem adiante.

**Pega dados do email e extrai o PDF**
Nó Gmail `get:message` com `downloadAttachments: true`.

**Validador de documento**
Nó Set que cria `Validador_de_doc = Object.keys($binary).length`. Conta os anexos binários.

**Condicional**
Nó If que verifica `Validador_de_doc === 1`. Exige exatamente um anexo.

**Upload de documento**
Faz upload do PDF para a pasta **"Contratos Recebidos"** no Google Drive. Ao chegar nessa pasta, o Workflow 1 é acionado automaticamente.

## Workflow 1: Leitura de Contratos (GPT-5-mini)

### Fluxo

```
Google Drive Trigger — pasta "Contratos Recebidos"
   └─ Download file
       └─ Extract from File (PDF)
           └─ Message a model (GPT-5-mini)
               └─ Code in JavaScript (normalização)
                   └─ HTTP Request → Supabase contratos
```

**Code in JavaScript**
Normalização completa:
- Remove markdown caso o modelo retorne blocos de código
- Normaliza datas para `DD/MM/AAAA`
- Substitui campos vazios e "null" por `null`
- Garante que listas sejam arrays e mapas sejam objetos
- Define campos fixos: `user_id`, `origem_documento: "Upload manual via Google Drive"`, `remetente_email: "Upload manual"`, `status_manual: "Ativo"`

## Workflow 2: Extração de Contratos (Gemini)

### Fluxo

```
Google Drive Trigger — pasta "Hackaton"
   └─ Download
       └─ Extract From PDF
           └─ Mensagem ao Gemini (gemini-3.1-flash-lite)
               └─ Formata a resposta da IA
                   └─ HTTP Request → Supabase contratos
```

Não tem normalização de datas nem campos fixos como `user_id`.

## Comparativo dos Workflows

| Característica | Workflow Processos | Workflow 3 | Workflow 1 (GPT) | Workflow 2 (Gemini) |
|---|---|---|---|---|
| Gatilho | Gmail Trigger | Gmail Trigger | Drive Trigger | Drive Trigger |
| Função | Processos trabalhistas | Ingestão (email → Drive) | Análise de contratos | Análise de contratos |
| Filtro de entrada | Switch (tipo de email) | Palavra "Contrato" no assunto | Pasta "Contratos Recebidos" | Pasta "Hackaton" |
| Modelo de IA | Gemini | Nenhum | GPT-5-mini | gemini-3.1-flash-lite |
| Cria pasta no Drive | Sim | Não | Não | Não |
| Envia email de confirmação | Sim | Não | Não | Não |
| Normalização de datas | Não | N/A | Sim | Não |
| Destino final | Supabase `processos` | Google Drive | Supabase `contratos` | Supabase `contratos` |

## Prompt para Análise de Contratos (Workflows 1 e 2)

- Responder somente com JSON válido, sem markdown
- Usar `null` quando uma informação não existir no documento
- Datas no formato `DD/MM/AAAA`
- `prioridade_revisao` somente como `"Baixa"`, `"Média"` ou `"Alta"`
- Aumentar a prioridade se houver multa, vencimento próximo, risco jurídico ou cláusula sensível

## Observações

O n8n utilizado é o **n8n Cloud** (beccadias.app.n8n.cloud). O plano atual tem limite de 1.000 execuções mensais.

O `user_id` está fixo no JavaScript do Workflow 1. O Workflow 2 não define `user_id`, o que pode causar erros de RLS dependendo da política configurada.

O Workflow de Processos não define `user_id` pois a tabela `processos` não possui essa coluna. A autenticação no HTTP Request usa a chave `service_role` para bypass de RLS.

As credenciais Google (OAuth2 Gmail e Drive) precisam ser configuradas individualmente para cada nó com triângulo de aviso no canvas do n8n.
