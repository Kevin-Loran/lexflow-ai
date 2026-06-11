# Documentação do Supabase

## Projeto

| Campo | Valor |
|---|---|
| Nome | JuriTrack-contratos |
| ID | dmafrzaahrsrzgftyoqq |
| URL | https://dmafrzaahrsrzgftyoqq.supabase.co |
| Região | sa-east-1 (São Paulo) |

## Tabelas

### `contratos`

Tabela principal. Cada linha representa um contrato processado pela IA ou criado manualmente.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária, gerada automaticamente |
| user_id | uuid | FK para `auth.users` — dono do registro |
| titulo_contrato | text | Título extraído pela IA |
| nome_arquivo | text | Nome original do arquivo PDF |
| tipo_documento | text | Ex: Contrato de Prestação de Serviços |
| categoria | text | Ex: Marketing Digital, Trabalhista |
| status_manual | text | ativo, vencido, pendente, cancelado |
| prioridade_revisao | text | alta, media, baixa |
| data_assinatura | text | Data no formato DD/MM/AAAA (vindo do n8n) |
| data_inicio_vigencia | text | Data no formato DD/MM/AAAA |
| data_fim_vigencia | text | Data no formato DD/MM/AAAA — usada para calcular status |
| valor_total | text | Ex: R$ 30.000,00 |
| valor_mensal | text | Ex: R$ 2.500,00 |
| forma_pagamento | text | Descrição da forma de pagamento |
| partes_envolvidas | jsonb | Objeto com cpf, cnpj, nome, papel de cada parte |
| clausulas_relevantes | jsonb | Array de strings com cláusulas importantes |
| prazos_importantes | jsonb | Array de strings com prazos |
| pontos_de_atencao | jsonb | Array de alertas identificados pela IA |
| alertas_recomendados | jsonb | Array de recomendações da IA |
| resumo | text | Resumo gerado pela IA |
| obrigacoes | text | Obrigações do contrato |
| remetente_email | text | Email de origem do documento |
| assunto_email | text | Assunto do email (quando aplicável) |
| arquivo_url | text | URL pública do PDF no Storage |
| origem_documento | text | google_drive, upload_manual, manual |
| created_at | timestamptz | Data e hora de criação |

### `contas_email`

Armazena as configurações de caixa de email do advogado para leitura automática (funcionalidade em desenvolvimento).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária |
| user_id | uuid | FK para `auth.users` |
| email | text | Endereço de email |
| provedor | text | gmail, outlook, yahoo, outro |
| imap_host | text | Servidor IMAP (ex: imap.gmail.com) |
| imap_port | integer | Porta IMAP (ex: 993) |
| created_at | timestamptz | Data de cadastro |

## View: `contratos_dashboard`

View criada sobre a tabela `contratos` que adiciona campos calculados. O frontend usa esta view para listagem e dashboard.

```sql
SELECT
  *,
  safe_br_date(data_fim_vigencia) AS data_fim_vigencia_date,
  br_money_to_numeric(valor_total) AS valor_total_numero,
  CASE
    WHEN safe_br_date(data_fim_vigencia) IS NULL THEN 'Sem data'
    WHEN safe_br_date(data_fim_vigencia) < CURRENT_DATE THEN 'Vencido'
    WHEN safe_br_date(data_fim_vigencia) <= CURRENT_DATE + 30 THEN 'Próximo do vencimento'
    ELSE 'Ativo'
  END AS status,
  (safe_br_date(data_fim_vigencia) - CURRENT_DATE) AS dias_para_vencer,
  TO_CHAR(safe_br_date(data_fim_vigencia), 'MM/YYYY') AS mes_vencimento
FROM contratos;
```

### Campos calculados

| Campo | Tipo | Descrição |
|---|---|---|
| `status` | text | Ativo, Vencido, Próximo do vencimento, Sem data |
| `data_fim_vigencia_date` | date | Data parseada pela função `safe_br_date()` |
| `valor_total_numero` | numeric | Valor numérico convertido por `br_money_to_numeric()` |
| `dias_para_vencer` | integer | Diferença em dias entre hoje e o vencimento |
| `mes_vencimento` | text | Mês de vencimento no formato MM/AAAA |

## Funções Customizadas

### `safe_br_date(text)`

Converte datas em múltiplos formatos para `date`. Aceita DD/MM/AAAA, AAAA-MM-DD e variações. Retorna `NULL` se não conseguir parsear, evitando erros na view.

### `br_money_to_numeric(text)`

Converte strings monetárias no formato brasileiro (ex: "R$ 30.000,00") para `numeric`. Remove símbolos, troca separadores e retorna o número. Retorna `NULL` se falhar.

## Storage

**Bucket:** `contratos-pdf`

Os PDFs enviados pelo frontend são armazenados com o caminho:
```
{user_id}/{timestamp}_{nome_arquivo}
```

Exemplo: `70948aae-db50.../1718123456789_contrato.pdf`

As URLs são públicas e geradas pelo método `getPublicUrl()` do cliente Supabase.

## Segurança (RLS)

Row Level Security está habilitado em todas as tabelas. A política padrão aplicada é:

```sql
auth.uid() = user_id
```

Isso significa que cada usuário só consegue ver, criar, editar e excluir os próprios registros. O Supabase aplica esse filtro automaticamente em todas as queries, sem necessidade de filtro manual no frontend.

## Conexão com n8n

O n8n insere contratos diretamente via HTTP Request para a API REST do Supabase:

```
POST https://dmafrzaahrsrzgftyoqq.supabase.co/rest/v1/contratos
```

O payload enviado pelo n8n inclui todos os campos extraídos pela IA: título, categoria, tipo, resumo, datas, valores, partes envolvidas, cláusulas, prazos e alertas. O `user_id` é definido no workflow do n8n para associar o contrato ao advogado correto.
