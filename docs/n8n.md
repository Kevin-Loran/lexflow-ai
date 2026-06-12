# Documentação dos Workflows n8n

## Visão Geral

O n8n gerencia dois workflows de leitura automática de contratos. Ambos monitoram pastas no Google Drive, extraem o texto do PDF, enviam para análise de IA e salvam no Supabase. A diferença principal está no modelo de IA utilizado e no nível de tratamento dos dados antes de salvar.

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

## Comparativo entre os dois workflows

| Característica | Workflow 1 (GPT) | Workflow 2 (Gemini) |
|---|---|---|
| Pasta monitorada | Contratos Recebidos | Hackaton |
| Modelo de IA | GPT-5-mini | gemini-3.1-flash-lite |
| Normalização de datas | Sim (DD/MM/AAAA) | Não |
| Campos fixos (user_id, status) | Sim | Não |
| Tratamento de erros da IA | Robusto | Básico |
| Destino | Supabase `contratos` | Supabase `contratos` |

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
