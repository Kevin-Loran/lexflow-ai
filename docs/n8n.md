# Documentação dos Workflows n8n

## Visão Geral

O n8n gerencia três workflows que formam um pipeline completo de ingestão e análise de contratos.

```
Email com anexo PDF
   └─ Workflow 3: detecta a palavra "Contrato" no assunto e faz upload para o Google Drive
         └─ Workflow 1 (GPT-5-mini): lê o PDF do Drive, analisa com IA e salva no Supabase
         └─ Workflow 2 (Gemini): mesma lógica, monitora uma pasta diferente no Drive
```

O Workflow 3 é a **porta de entrada**: transforma emails em arquivos no Drive. Os Workflows 1 e 2 são os **motores de análise**: leem os PDFs, extraem os dados com IA e gravam na tabela `contratos` do Supabase.

---

## Workflow 3: Disparo por Email com Palavra-Chave

Este workflow é o ponto de entrada do pipeline. Ele monitora a caixa de entrada do Gmail, identifica emails com contratos em anexo e os envia automaticamente para o Google Drive, de onde o Workflow 1 os processa.

### Fluxo

```
Gmail Trigger (polling a cada minuto)
   └─ Filtro: Subject contém "Contrato"?
       └─ Gmail get: baixa a mensagem com anexos
           └─ Set: conta quantos anexos binários existem (Validador_de_doc)
               └─ If: Validador_de_doc == 1?
                   ├─ true → Google Drive: upload para "Contratos Recebidos"
                   └─ false → No Operation (ignora emails sem anexo)
```

### Detalhes de cada nó

**Recebe email (Gmail Trigger)**
Polling a cada minuto na conta OAuth2 "Advogado". Retorna todos os emails novos sem filtro inicial.

**Filtra Para palavra chave no titulo**
Nó Filter que verifica se o campo `Subject` do email contém a string `"Contrato"` (case sensitive). Apenas emails que passam seguem adiante.

**Pega dados do email e extrai o PDF**
Nó Gmail `get:message` que baixa a mensagem completa, com a opção `downloadAttachments: true`. O nome do campo binário gerado usa o `id` do email como prefixo.

**Váriável para Validar se tem DOC**
Nó Set que cria o campo `Validador_de_doc = Object.keys($binary).length`. Isso conta quantos arquivos binários (anexos) foram baixados.

**Condicional se não houver doc**
Nó If que compara `Validador_de_doc === 1`. Se verdadeiro, o email tem exatamente um anexo e o fluxo segue para o upload. Se falso (zero ou múltiplos anexos), cai no "No Operation".

**Upload de documento (Google Drive)**
Faz o upload do arquivo para a pasta **"Contratos Recebidos"** (ID: `1IRp02lUejjxDEKjaRQlgfrciJzXF0Gwb`) no Google Drive da conta "Advogado". Ao chegar nessa pasta, o **Workflow 1** é acionado automaticamente pelo seu Google Drive Trigger.

**No Operation, do nothing**
Encerra o fluxo silenciosamente quando o email não tem anexo ou tem mais de um.

### Conexão com os outros workflows

Depois que o PDF chega na pasta "Contratos Recebidos" do Google Drive, o Workflow 1 (GPT-5-mini) detecta o novo arquivo e inicia a análise de IA automaticamente. O Workflow 2 (Gemini) monitora uma pasta diferente ("Hackaton") e não é alimentado por este workflow.

---

## Workflow 1: JuriTrack - Leitura de Contratos (GPT-5-mini)

### Fluxo

```
Google Drive Trigger — pasta "Contratos Recebidos" (polling a cada minuto)
   └─ Download file
       └─ Extract from File (PDF)
           └─ Message a model (GPT-5-mini)
               └─ Code in JavaScript (normalização completa)
                   └─ HTTP Request → Supabase REST API
```

### Detalhes de cada nó

**Google Drive Trigger**
Monitora a pasta **"Contratos Recebidos"** com polling a cada minuto. Usa autenticação OAuth2 com o Google Drive.

**Download file**
Baixa o PDF usando o `id` retornado pelo trigger.

**Extract from File**
Extrai o texto bruto do PDF.

**Message a model (GPT-5-mini)**
Envia o texto para o modelo com o prompt estruturado. O modelo retorna JSON com os campos do contrato.

**Code in JavaScript**
Nó com lógica robusta de normalização:
- Extrai o texto da IA em diferentes formatos de resposta possíveis
- Remove markdown caso o modelo retorne blocos de código por engano
- Normaliza datas para `DD/MM/AAAA` (aceita ISO, com traço ou barra)
- Substitui campos vazios, "não encontrado" e "null" por `null`
- Garante que campos de lista sejam arrays e campos de mapa sejam objetos
- Define campos fixos: `user_id`, `origem_documento: "Upload manual via Google Drive"`, `remetente_email: "Upload manual"`, `status_manual: "Ativo"`

**HTTP Request**
POST para a API REST do Supabase, tabela `contratos`.

---

## Workflow 2: Extração de Contrato (Gemini)

### Fluxo

```
Google Drive Trigger — pasta "Hackaton" (polling a cada minuto)
   └─ Download
       └─ Transforma o pdf em json (Extract From PDF)
           └─ Mensagem ao Gemini (gemini-3.1-flash-lite)
               └─ Formata a resposta da IA
                   └─ HTTP Request → Supabase REST API
```

### Detalhes de cada nó

**Google Drive Trigger**
Monitora a pasta **"Hackaton"** com polling a cada minuto. Usa uma conta OAuth2 diferente do Workflow 1.

**Download**
Baixa o PDF usando o `id` retornado pelo trigger.

**Transforma o pdf em json**
Extrai o texto bruto do PDF.

**Mensagem ao Gemini (gemini-3.1-flash-lite)**
Envia o texto para o Gemini com o mesmo prompt estruturado do Workflow 1. Usa autenticação via Google Gemini (PaLM) API.

**Formata a resposta da IA**
Nó JavaScript simples que extrai e faz o parse do JSON da resposta do Gemini:
```js
const texto = $input.first().json.content.parts[0].text;
const dados = JSON.parse(texto);
return [{ json: dados }];
```
Não tem normalização de datas nem campos fixos como `user_id`.

**HTTP Request**
POST para a API REST do Supabase, tabela `contratos`.

---

## Comparativo entre os três workflows

| Característica | Workflow 3 (Email) | Workflow 1 (GPT) | Workflow 2 (Gemini) |
|---|---|---|---|
| Gatilho | Gmail Trigger | Google Drive Trigger | Google Drive Trigger |
| Função | Ingestão (email → Drive) | Análise de IA | Análise de IA |
| Filtro de entrada | Palavra "Contrato" no assunto | Pasta "Contratos Recebidos" | Pasta "Hackaton" |
| Modelo de IA | Nenhum | GPT-5-mini | gemini-3.1-flash-lite |
| Normalização de datas | N/A | Sim (DD/MM/AAAA) | Não |
| Campos fixos (user_id, status) | N/A | Sim | Não |
| Destino final | Google Drive | Supabase `contratos` | Supabase `contratos` |

---

## Prompt compartilhado pelos dois workflows

Ambos os workflows usam o mesmo prompt para a IA:

- Responder somente com JSON válido, sem markdown
- Usar `null` quando uma informação não existir no documento
- Datas no formato `DD/MM/AAAA`
- `prioridade_revisao` somente como `"Baixa"`, `"Média"` ou `"Alta"`
- Aumentar a prioridade se houver multa, vencimento próximo, risco jurídico ou cláusula sensível

### Campos extraídos pela IA

| Campo | Tipo |
|---|---|
| tipo_documento | string |
| titulo_contrato | string |
| categoria | string |
| resumo | string |
| data_assinatura | string (DD/MM/AAAA) |
| data_inicio_vigencia | string (DD/MM/AAAA) |
| data_fim_vigencia | string (DD/MM/AAAA) |
| partes_envolvidas | array (nome, cnpj, cpf, papel) |
| valor_total | string |
| valor_mensal | string |
| forma_pagamento | string |
| prazos_importantes | array |
| obrigacoes | array |
| clausulas_relevantes | objeto (rescisao, multa, confidencialidade, renovacao, foro, lgpd) |
| pontos_de_atencao | array |
| alertas_recomendados | array |
| prioridade_revisao | string |

---

## Observações

O n8n utilizado é o **n8n Cloud** (beccadias.app.n8n.cloud). O plano atual tem limite de 1.000 execuções mensais.

O `user_id` está fixo no JavaScript do Workflow 1. O Workflow 2 não define `user_id`, o que pode causar erros de RLS no Supabase dependendo da política configurada.

Contratos enviados pelo Upload Manual do frontend não passam por nenhum dos dois workflows e não recebem análise de IA.
