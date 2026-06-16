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

Tabela principal de contratos. Cada linha representa um contrato processado pela IA ou criado manualmente pelo advogado.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | Chave primária, gerada automaticamente |
| user_id | uuid | FK para `auth.users` — dono do registro |
| titulo_contrato | text | Título extraído pela IA |
| nome_arquivo | text | Nome original do arquivo PDF |
| tipo_documento | text | Ex: Contrato de Prestação de Serviços |
| categoria | text | Ex: Marketing Digital, Trabalhista |
| status_manual | text | ativo, vencido, pendente, cancelado — sobrepõe o status calculado |
| prioridade_revisao | text | alta, media, baixa |
| data_assinatura | text | Data no formato DD/MM/AAAA (vindo do n8n) |
| data_inicio_vigencia | text | Data no formato DD/MM/AAAA |
| data_fim_vigencia | text | Data no formato DD/MM/AAAA — usada para calcular status |
| valor_total | text | Ex: R$ 30.000,00 |
| valor_mensal | text | Ex: R$ 2.500,00 |
| forma_pagamento | text | Descrição da forma de pagamento |
| partes_envolvidas | jsonb | Array de objetos com cpf, cnpj, nome, papel de cada parte |
| clausulas_relevantes | jsonb | Objeto com chaves foro, multa, rescisao, renovacao, confidencialidade, lgpd |
| prazos_importantes | jsonb | Array de strings com prazos |
| pontos_de_atencao | jsonb | Array de alertas identificados pela IA |
| alertas_recomendados | jsonb | Array de recomendações da IA |
| resumo | text | Resumo gerado pela IA |
| obrigacoes | text ou jsonb | Obrigações do contrato |
| remetente_email | text | Email de origem do documento |
| assunto_email | text | Assunto do email (quando aplicável) |
| arquivo_url | text | URL pública do PDF no Storage |
| origem_documento | text | google_drive, upload_manual, manual |
| created_at | timestamptz | Data e hora de criação |

### `processos`

Tabela de processos trabalhistas. Populada automaticamente pelo fluxo n8n de análise de emails. Estrutura plana (sem JSONB), com `id` do tipo `integer`.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | integer | Chave primária auto-incremento |
| tipo_documento | varchar | Ex: Relato Trabalhista |
| titulo_contrato | varchar | Título do processo ou relato |
| categoria | varchar | Ex: Recursos Humanos |
| resumo | text | Resumo gerado pela IA |
| parte_1_nome | varchar | Nome da primeira parte |
| parte_1_papel | varchar | Papel da primeira parte (ex: Ex-Empregador) |
| parte_2_nome | varchar | Nome da segunda parte |
| parte_2_papel | varchar | Papel da segunda parte (ex: Trabalhador) |
| valor_total | numeric | Valor total em número |
| valor_mensal | varchar | Valor mensal como texto |
| forma_pagamento | text | Forma de pagamento |
| prazos_importantes | text | Prazos relevantes (pode ser JSON serializado) |
| obrigacoes | text | Obrigações identificadas (pode ser JSON serializado) |
| clausula_rescisao | text | Cláusula de rescisão |
| clausula_multa | varchar | Cláusula de multa |
| clausula_confidencialidade | varchar | Cláusula de confidencialidade |
| clausula_renovacao | varchar | Cláusula de renovação |
| clausula_foro | varchar | Foro eleito |
| clausula_lgpd | varchar | Cláusula de LGPD |
| pontos_de_atencao | text | Pontos de atenção (pode ser JSON serializado) |
| alertas_recomendados | text | Alertas recomendados (pode ser JSON serializado) |
| prioridade_revisao | varchar | alta, media, baixa |

A tabela não possui `user_id` nem `created_at`. O RLS está habilitado com policy de SELECT para usuários autenticados (`TO authenticated USING (true)`).

## View: `contratos_dashboard`

View criada sobre a tabela `contratos` que adiciona campos calculados. O frontend usa esta view para listagem, dashboard e detalhe de contratos.

O campo `status` prioriza o valor manual (`status_manual`) antes de calcular pela data. Isso permite que o advogado force um status independente do vencimento.

```sql
SELECT
  c.*,
  safe_br_date(c.data_fim_vigencia) AS data_fim_vigencia_date,
  safe_br_date(c.data_inicio_vigencia) AS data_inicio_vigencia_date,
  safe_br_date(c.data_assinatura) AS data_assinatura_date,
  br_money_to_numeric(c.valor_total) AS valor_total_numero,
  br_money_to_numeric(c.valor_mensal) AS valor_mensal_numero,
  br_money_to_numeric(c.valor_total) AS valor_numero,
  CASE
    WHEN lower(c.status_manual) = 'vencido'   THEN 'Vencido'
    WHEN lower(c.status_manual) = 'cancelado' THEN 'Cancelado'
    WHEN lower(c.status_manual) = 'pendente'  THEN 'Pendente'
    WHEN lower(c.status_manual) = 'ativo'     THEN 'Ativo'
    WHEN safe_br_date(c.data_fim_vigencia) IS NULL               THEN 'Sem data'
    WHEN safe_br_date(c.data_fim_vigencia) < CURRENT_DATE        THEN 'Vencido'
    WHEN safe_br_date(c.data_fim_vigencia) <= CURRENT_DATE + 30  THEN 'Próximo do vencimento'
    ELSE 'Ativo'
  END AS status,
  (safe_br_date(c.data_fim_vigencia) - CURRENT_DATE) AS dias_para_vencer,
  TO_CHAR(safe_br_date(c.data_fim_vigencia), 'MM/YYYY') AS mes_vencimento
FROM contratos c;
```

### Campos calculados

| Campo | Tipo | Descrição |
|---|---|---|
| `status` | text | Vencido, Cancelado, Pendente, Ativo, Próximo do vencimento, Sem data |
| `data_fim_vigencia_date` | date | Data parseada pela função `safe_br_date()` |
| `data_inicio_vigencia_date` | date | Data parseada |
| `data_assinatura_date` | date | Data parseada |
| `valor_total_numero` | numeric | Valor convertido por `br_money_to_numeric()` |
| `valor_mensal_numero` | numeric | Valor mensal convertido |
| `valor_numero` | numeric | Alias de `valor_total_numero` |
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

As URLs são públicas e geradas pelo método `getPublicUrl()` do cliente Supabase.

## Segurança (RLS)

Row Level Security está habilitado em todas as tabelas.

**Tabela `contratos`:** política padrão `auth.uid() = user_id` em SELECT, INSERT, UPDATE e DELETE. Cada advogado acessa apenas seus próprios contratos.

**Tabela `processos`:** não possui coluna `user_id`. A policy ativa é:
```sql
CREATE POLICY "allow_authenticated" ON processos
FOR SELECT TO authenticated USING (true);
```
Qualquer usuário autenticado pode ler todos os processos. Não há políticas de INSERT, UPDATE ou DELETE configuradas.

## Conexão com n8n

O n8n insere registros diretamente via HTTP Request para a API REST do Supabase.

**Contratos:**
```
POST https://dmafrzaahrsrzgftyoqq.supabase.co/rest/v1/contratos
```

**Processos:**
```
POST https://dmafrzaahrsrzgftyoqq.supabase.co/rest/v1/processos
```

As requisições usam a chave `service_role` no header `Authorization` para contornar o RLS e gravar independente do `user_id`.
