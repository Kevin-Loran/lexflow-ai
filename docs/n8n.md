# Documentação do Workflow n8n

## Visão Geral

O n8n é responsável pela automação de leitura e análise dos contratos. Quando um PDF é adicionado ao Google Drive monitorado, o workflow é disparado automaticamente, o arquivo é processado pelo OpenAI e os dados estruturados são salvos no Supabase.

## Workflow 1: Leitura de Contratos via Google Drive

### Nós do Workflow

```
Google Drive Trigger
   └─ Download file
       └─ Extract from File (PDF)
           └─ Message a model (OpenAI)
               └─ Code in JavaScript
                   └─ HTTP Request → Supabase
```

### Descrição de cada nó

**Google Drive Trigger**
Fica escutando uma pasta específica do Google Drive. Quando um novo arquivo é criado (evento `fileCreated`), o workflow é disparado automaticamente.

**Download file**
Faz o download do arquivo PDF identificado pelo trigger.

**Extract from File**
Extrai o texto bruto do PDF para que possa ser enviado ao modelo de linguagem.

**Message a model (OpenAI)**
Envia o texto extraído para o OpenAI com um prompt estruturado. O modelo retorna um JSON com os campos do contrato: título, tipo, categoria, datas, valores, partes envolvidas, cláusulas, alertas e resumo.

**Code in JavaScript**
Transforma e valida o JSON retornado pelo OpenAI, garantindo que os campos estejam no formato esperado pelo Supabase antes de enviar.

**HTTP Request**
Faz um POST para a API REST do Supabase inserindo o contrato na tabela `contratos`.

### Campos extraídos pelo OpenAI

| Campo | Formato | Exemplo |
|---|---|---|
| titulo_contrato | text | CONTRATO DE PRESTAÇÃO DE SERVIÇOS |
| tipo_documento | text | Contrato de Prestação de Serviços |
| categoria | text | Marketing Digital |
| resumo | text | Texto descritivo |
| data_assinatura | DD/MM/AAAA | 25/06/2025 |
| data_inicio_vigencia | DD/MM/AAAA | 25/06/2025 |
| data_fim_vigencia | DD/MM/AAAA | 25/06/2026 |
| valor_total | text | R$ 30.000,00 |
| valor_mensal | text | R$ 2.500,00 |
| forma_pagamento | text | 12 parcelas mensais |
| partes_envolvidas | JSON | { cnpj, nome, papel } |
| clausulas_relevantes | array | [ "cláusula 1", ... ] |
| prazos_importantes | array | [ "prazo 1", ... ] |
| pontos_de_atencao | array | [ "atenção 1", ... ] |
| alertas_recomendados | array | [ "alerta 1", ... ] |
| prioridade_revisao | text | alta, media, baixa |

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

A página de configuração de email já existe no frontend (`/email`), mas a conexão com o n8n ainda não foi configurada.

## Observações

O n8n utilizado é o n8n Cloud (beccadias.app.n8n.cloud). O plano atual tem limite de 1.000 execuções mensais.

Contratos enviados pelo Upload Manual do frontend não passam pelo n8n e portanto não recebem análise de IA. Os campos precisam ser preenchidos manualmente pelo formulário de edição.
