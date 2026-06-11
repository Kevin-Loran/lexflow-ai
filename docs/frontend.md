# Documentação do Frontend

## Visão Geral

O frontend do LexFlow AI é uma Single Page Application (SPA) construída com React 19, TypeScript 6 e Vite 8. A estilização usa Tailwind CSS v4 com o plugin oficial para Vite. A autenticação e o acesso ao banco de dados são feitos diretamente pelo cliente Supabase JS no navegador.

## Tecnologias

| Pacote | Versão | Função |
|---|---|---|
| React | 19.2 | Framework de UI |
| TypeScript | 6.0 | Tipagem estática |
| Vite | 8.0 | Build e servidor de desenvolvimento |
| Tailwind CSS | 4.3 | Estilização utilitária |
| @supabase/supabase-js | 2.108 | Cliente Supabase (auth + banco) |
| react-router-dom | 7.17 | Roteamento SPA |
| recharts | 3.8 | Gráficos (pizza e barras) |
| lucide-react | 1.17 | Ícones SVG |
| tslib | 2.8 | Compatibilidade Vite 8 + Supabase |

## Estrutura de Arquivos

```
src/
├── lib/
│   └── supabase.ts           Instância do cliente Supabase
├── contexts/
│   └── AuthContext.tsx       Contexto global de autenticação
├── components/
│   ├── ProtectedRoute.tsx    Guard de rotas autenticadas
│   ├── Layout.tsx            Shell da aplicação (Sidebar + Outlet)
│   └── Sidebar.tsx           Menu de navegação lateral
└── pages/
    ├── Login.tsx             Tela de login e cadastro
    ├── Dashboard.tsx         Visão geral com métricas e gráficos
    ├── Contratos.tsx         Lista de contratos com filtros
    ├── ContratoDetalhes.tsx  Detalhe completo de um contrato
    ├── ContratoForm.tsx      Formulário de criação e edição
    ├── UploadManual.tsx      Upload de PDF para o Storage
    ├── EmailProfissional.tsx Configuração de caixa de email
    └── ComoFunciona.tsx      Página explicativa do produto
```

## Rotas

| Rota | Componente | Protegida |
|---|---|---|
| `/login` | Login | Não |
| `/dashboard` | Dashboard | Sim |
| `/contratos` | Contratos | Sim |
| `/contratos/novo` | ContratoForm | Sim |
| `/contratos/:id` | ContratoDetalhes | Sim |
| `/contratos/:id/editar` | ContratoForm | Sim |
| `/email` | EmailProfissional | Sim |
| `/upload` | UploadManual | Sim |
| `/como-funciona` | ComoFunciona | Sim |

Todas as rotas dentro do Layout são envolvidas por `ProtectedRoute`, que redireciona para `/login` se não houver sessão ativa.

## Autenticação

O contexto `AuthContext` expõe `user`, `session`, `loading` e `signOut` para toda a aplicação. Ele usa `supabase.auth.onAuthStateChange` para reagir a login e logout em tempo real.

O login aceita email e senha. O cadastro cria uma conta via `supabase.auth.signUp`. Não há OAuth configurado no momento.

## Consulta ao Banco

O frontend nunca usa filtros manuais de `user_id` nas queries. O Supabase RLS (Row Level Security) filtra automaticamente os registros pelo usuário autenticado na sessão.

Para listagem e dashboard, o frontend consulta a view `contratos_dashboard`, que já entrega os campos calculados (status, dias para vencer, valor numérico). Para o detalhe do contrato, consulta a tabela `contratos` diretamente para acessar todos os campos JSON.

## Dashboard

Métricas exibidas:
- Total de contratos
- Contratos ativos
- Contratos vencidos
- Contratos vencendo em 30 dias
- Valor total acumulado (R$)
- Quantidade com prioridade alta

Gráficos: pizza por status e barras por prioridade de revisão. Tabela dos 10 contratos mais recentes.

## CRUD de Contratos

O `ContratoForm` funciona em dois modos baseados na presença do parâmetro `:id` na URL:

- **Criar** (`/contratos/novo`): faz `insert` na tabela `contratos` com `user_id` e `origem_documento: 'manual'`
- **Editar** (`/contratos/:id/editar`): carrega os dados existentes, converte datas BR para ISO no picker, faz `update`

A exclusão existe na lista (ícone de lixeira por linha) e no detalhe (botão Excluir), ambos com `window.confirm` antes de deletar.

## Parsing de Datas

O n8n salva datas no formato brasileiro `DD/MM/AAAA`. O componente `ContratoDetalhes` usa a função `formatarData()` que detecta o formato e converte para exibição, evitando `Invalid Date`. O formulário usa `isoDate()` para converter BR para ISO ao popular os campos de data.

## Upload de PDF

O `UploadManual` faz upload para o bucket `contratos-pdf` no Storage do Supabase com o caminho `{user_id}/{timestamp}_{nome_arquivo}`. Depois insere uma linha básica na tabela `contratos`. O arquivo não passa pelo n8n nem pela IA.

## Deploy

O projeto faz deploy automático no GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) a cada push na branch `main`. O build gera a pasta `dist/` que é publicada na branch `gh-pages`.

URL de produção: `https://kevin-loran.github.io/lexflow-ai/`
