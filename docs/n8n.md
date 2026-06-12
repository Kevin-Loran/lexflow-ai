# Documentação do Workflow n8n

## Visão Geral

O n8n é responsável pela automação de leitura e análise dos contratos. Quando um PDF é adicionado à pasta monitorada no Google Drive, o workflow dispara automaticamente, extrai o texto, envia para análise via OpenAI e salva os dados estruturados no Supabase.

## Workflow 1: JuriTrack - Leitura de Contratos

### Nós do Workflow

```
Google Drive Trigger (polling a cada minuto)
   └─ Download file
       └─ Extract from File (PDF)
           └─ Message a model (GPT-5-mini)
               └─ Code in JavaScript
                   └─ HTTP Request → Supabase REST API
```

### Detalhes de cada nó

**Google Drive Trigger**
Faz polling a cada minuto na pasta **"Contratos Recebidos"** do Google Drive. Quando detecta um arquivo novo (evento `fileCreated`), inicia o fluxo. Usa autenticação OAuth2 com o Google Drive.

**Download file**
Faz o download do arquivo PDF identificado pelo trigger usando o `id` retornado pelo Google Drive Trigger.

**Extract from File**
Extrai o texto bruto do PDF para enviar ao modelo de linguagem.

**Message a model (GPT-5-mini)**
Envia o texto extraído para o modelo OpenAI com um prompt estruturado. O modelo retorna um JSON com todos os campos do contrato.

Prompt instrui o modelo a:
- Responder somente com JSON válido, sem markdown
- Usar `null` quando uma informação não existir
- Retornar datas no formato `DD/MM/AAAA`
- Usar `prioridade_revisao` como `"Baixa"`, `"Média"` ou `"Alta"`
- Aumentar a prioridade se houver multa, vencimento próximo, risco jurídico ou cláusula sensível

Campos extraídos pelo modelo:

| Campo | Tipo | Descrição |
|---|---|---|
| tipo_documento | string | Ex: Contrato de Prestação de Serviços |
| titulo_contrato | string | Título do contrato |
| categoria | string | Ex: Marketing Digital, Trabalhista |
| resumo | string | Resumo do conteúdo |
| data_assinatura | string | Formato DD/MM/AAAA |
| data_inicio_vigencia | string | Formato DD/MM/AAAA |
| data_fim_vigencia | string | Formato DD/MM/AAAA |
| partes_envolvidas | array | Lista com nome, cnpj, cpf, papel |
| valor_total | string | Ex: R$ 30.000,00 |
| valor_mensal | string | Ex: R$ 2.500,00 |
| forma_pagamento | string | Descrição da forma de pagamento |
| prazos_importantes | array | Lista de prazos relevantes |
| obrigacoes | array | Lista de obrigações das partes |
| clausulas_relevantes | objeto | rescisao, multa, confidencialidade, renovacao, foro, lgpd |
| pontos_de_atencao | array | Alertas identificados pela IA |
| alertas_recomendados | array | Recomendações da IA |
| prioridade_revisao | string | Baixa, Média ou Alta |

**Code in JavaScript**
Transforma e normaliza o JSON da IA antes de enviar ao Supabase. Responsabilidades:

- Extrai o texto da IA em diferentes formatos de resposta possíveis
- Remove markdown caso o modelo retorne ````json` por engano
- Normaliza datas para `DD/MM/AAAA` (aceita ISO, com traço ou barra)
- Substitui campos vazios, "não encontrado" e "null" por `null`
- Garante que campos de lista sejam arrays e campos de mapa sejam objetos
- Define campos fixos: `user_id`, `origem_documento`, `remetente_email`, `status_manual: "Ativo"`

**HTTP Request**
Faz POST para a API REST do Supabase inserindo o contrato na tabela `contratos`. Usa autenticação via API key e cabeçalho `Prefer: return=representation` para receber o registro criado como resposta.

### Campos fixos definidos no JavaScript

| Campo | Valor |
|---|---|
| user_id | ID fixo do usuário advogado |
| origem_documento | "Upload manual via Google Drive" |
| remetente_email | "Upload manual" |
| status_manual | "Ativo" |

## Workflow 2: Leitura de Email (Planejado)

Ainda não implementado. A ideia é monitorar a caixa de entrada do advogado, detectar emails com PDF anexo e disparar o mesmo pipeline de análise do Workflow 1.

```
Email Trigger (Gmail ou IMAP)
   └─ Filtrar emails com PDF anexo
       └─ Download do anexo
           └─ Extract from File (mesmo do W1)
               └─ Message a model (mesmo do W1)
                   └─ Code in JavaScript (mesmo do W1)
                       └─ HTTP Request → Supabase
```

A página de configuração de email já existe no frontend (`/email`), mas a conexão com o n8n ainda não foi feita.

## Observações

O n8n utilizado é o **n8n Cloud** (beccadias.app.n8n.cloud). O plano atual tem limite de 1.000 execuções mensais e está com 14 dias restantes de trial.

Contratos enviados pelo Upload Manual do frontend não passam pelo n8n e portanto não recebem análise de IA. Os campos precisam ser preenchidos manualmente pelo formulário de edição.

O `user_id` está fixo no nó de JavaScript. Para suportar múltiplos advogados no futuro, será necessário passar o `user_id` dinamicamente pelo nome do arquivo ou por metadados do Google Drive.
