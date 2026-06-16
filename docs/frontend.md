# Documentação do Frontend

## Visão Geral

O frontend do JuriTech é uma Single Page Application (SPA) construída com React 19, TypeScript 6 e Vite 8. A estilização usa Tailwind CSS v4 com o plugin oficial para Vite. A autenticação e o acesso ao banco de dados são feitos diretamente pelo cliente Supabase JS no navegador. Animações usam Framer Motion.

## Tecnologias

| Pacote | Versão | Função |
|---|---|---|
| React | 19.2 | Framework de UI |
| TypeScript | 6.0 | Tipagem estática |
| Vite | 8.0 | Build e servidor de desenvolvimento |
| Tailwind CSS | 4.3 | Estilização utilitária |
| @supabase/supabase-js | 2.108 | Cliente Supabase (auth + banco) |
| react-router-dom | 7.17 | Roteamento SPA com basename `/JuriTech` |
| framer-motion | 12.40 | Animações de entrada e transições |
| recharts | 3.8 | Gráficos (pizza e barras) |
| lucide-react | 1.17 | Ícones SVG |
| tslib | 2.8 | Compatibilidade Vite 8 + Supabase |

## Estrutura de Arquivos

```
src/
├── lib/
│   └── supabase.ts             Instância do cliente Supabase
├── contexts/
│   └── AuthContext.tsx         Contexto global de autenticação
├── components/
│   ├── ProtectedRoute.tsx      Guard de rotas autenticadas
│   ├── Layout.tsx              Shell da aplicação (Sidebar + Outlet)
│   └── Sidebar.tsx             Menu de navegação lateral
└── pages/
    ├── Login.tsx               Tela de login e cadastro (glassmorphism)
    ├── Dashboard.tsx           Visão geral com métricas e gráficos
    ├── Contratos.tsx           Lista de contratos com filtros
    ├── ContratoDetalhes.tsx    Detalhe completo de um contrato
    ├── ContratoForm.tsx        Formulário de criação e edição
    ├── Processos.tsx           Lista de processos trabalhistas em cards
    ├── ProcessoDetalhes.tsx    Detalhe completo de um processo
    └── ComoFunciona.tsx        Página explicativa do produto
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
| `/processos` | Processos | Sim |
| `/processos/:id` | ProcessoDetalhes | Sim |
| `/como-funciona` | ComoFunciona | Sim |

Todas as rotas dentro do Layout são envolvidas por `ProtectedRoute`, que redireciona para `/login` se não houver sessão ativa. O BrowserRouter usa `basename="/JuriTech"` para compatibilidade com GitHub Pages.

## Autenticação

O contexto `AuthContext` expõe `user`, `session`, `loading` e `signOut` para toda a aplicação. Ele usa `supabase.auth.onAuthStateChange` para reagir a login e logout em tempo real.

O login aceita email e senha. O cadastro cria uma conta via `supabase.auth.signUp`. Não há OAuth configurado.

## Login (Glassmorphism)

A tela de login usa design glassmorphism com fundo escuro `#0d0d1a`, três orbs de gradiente radial com `filter: blur(60px)` e um card com `backdropFilter: blur(24px)`. Os estilos críticos são aplicados via `style={{}}` inline (não classes Tailwind) para garantir que o blur funcione corretamente no build de produção.

Framer Motion controla:
- Entrada do card (`opacity: 0 → 1`, `y: 32 → 0`)
- Campo de nome que aparece/desaparece com `AnimatePresence` ao trocar entre login e cadastro
- Mensagens de erro com `AnimatePresence`

## Consulta ao Banco

O frontend nunca usa filtros manuais de `user_id` nas queries. O Supabase RLS (Row Level Security) filtra automaticamente os registros pelo usuário autenticado.

Para listagem e dashboard de **contratos**, o frontend consulta a view `contratos_dashboard`, que entrega os campos calculados (`status`, `dias_para_vencer`, `valor_total_numero`). Para o detalhe do contrato, a query também usa a view para garantir acesso ao campo `dias_para_vencer`.

Para **processos**, o frontend consulta diretamente a tabela `processos`, ordenando por `id DESC` (a tabela não tem coluna `created_at`).

## Dashboard

Métricas exibidas:
- Total de contratos
- Contratos ativos
- Contratos vencidos
- Contratos vencendo em 30 dias
- Valor total acumulado (R$)
- Quantidade com prioridade alta

Gráficos: pizza por status e barras por prioridade de revisão. Tabela dos 10 contratos mais recentes.

## Módulo de Contratos

O `ContratoForm` funciona em dois modos baseados na presença do parâmetro `:id` na URL:

- **Criar** (`/contratos/novo`): faz `insert` na tabela `contratos` com `user_id` e `origem_documento: 'manual'`
- **Editar** (`/contratos/:id/editar`): carrega os dados existentes, converte datas BR para ISO no picker, faz `update`

A exclusão existe na lista e no detalhe, ambos com `window.confirm` antes de deletar. O delete só atualiza o estado local após confirmar ausência de erro no retorno do Supabase.

O `ContratoDetalhes` consulta a view `contratos_dashboard` (não a tabela `contratos`) para ter acesso ao campo calculado `dias_para_vencer`.

## Módulo de Processos

A página `Processos` exibe os processos em cards com grid responsivo (1 coluna no mobile, 2 no tablet, 3 no desktop). Cada card mostra:
- Barra de cor no topo por prioridade (vermelho = alta, âmbar = média, verde = baixa)
- Título e tipo do documento
- Categoria
- Partes envolvidas com papel (Contratante/Contratada)
- Valor total e badge de prioridade

A tabela `processos` tem `id` do tipo `integer` (não `uuid`) e não possui coluna `created_at`. Por isso a query usa `.order('id', { ascending: false })`.

O `ProcessoDetalhes` exibe as informações em seções: Identificação, Partes Envolvidas, Valores e Pagamento, Cláusulas e Análise da IA. Campos de texto que podem conter JSON serializado (prazos, obrigações, alertas) são tratados pela função `parseLista()` que tenta fazer parse como array antes de exibir como texto simples.

## Parsing de Datas

O n8n salva datas de contratos no formato brasileiro `DD/MM/AAAA`. O `ContratoDetalhes` usa a função `formatarData()` que detecta o formato e converte para exibição, evitando `Invalid Date`. O formulário usa `isoDate()` para converter BR para ISO ao popular os campos de data.

Para datas em formato ISO (`AAAA-MM-DD`) vindas do banco, o parse usa `split('-').reverse().join('/')` em vez de `new Date()` para evitar o bug de fuso horário UTC que mostra o dia anterior no Brasil (UTC-3).

## Deploy

O projeto faz deploy automático no GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`) a cada push na branch `main`. O build gera a pasta `dist/` que é publicada na branch `gh-pages`.

O roteamento SPA no GitHub Pages usa o hack do `public/404.html`: quando o GitHub Pages retorna 404 para uma rota como `/JuriTech/processos`, o arquivo 404.html salva o caminho no `sessionStorage` e redireciona para `/JuriTech/`. O `index.html` então lê o `sessionStorage` e restaura a rota via `history.replaceState`.

URL de produção: `https://kevin-loran.github.io/JuriTech/`
