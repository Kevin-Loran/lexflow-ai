# LexFlow AI

LexFlow AI é uma plataforma SaaS jurídica para advogados gerenciarem contratos de forma inteligente. O sistema lê PDFs automaticamente via n8n e OpenAI, extrai as informações relevantes e organiza tudo em um dashboard limpo e funcional.

## Como o sistema funciona

Quando um contrato em PDF chega pelo Google Drive, o n8n detecta o arquivo, extrai o texto, envia para análise de IA e salva os dados estruturados no Supabase. O advogado consegue visualizar todos os contratos, ver quais estão vencendo, filtrar por categoria, status e prioridade, e acessar o detalhe completo de cada um.

Também é possível fazer upload manual de contratos pelo próprio dashboard, criar contratos do zero pelo formulário, editar qualquer campo e excluir registros.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Banco de dados | Supabase (PostgreSQL + RLS + Storage + Auth) |
| Automação | n8n Cloud |
| IA | OpenAI |

## Estrutura do repositório

```
/
├── src/               Código-fonte do frontend React
├── public/            Arquivos estáticos
├── docs/              Documentação do projeto
│   ├── frontend.md    Componentes, rotas e lógica do frontend
│   ├── supabase.md    Tabelas, views, funções e Storage
│   └── n8n.md         Workflows de automação
├── .github/
│   └── workflows/
│       └── deploy.yml Deploy automático no GitHub Pages
└── README.md
```

## Documentação

- [Frontend](docs/frontend.md) — componentes, rotas, autenticação e lógica
- [Supabase](docs/supabase.md) — tabelas, views, RLS e Storage
- [n8n](docs/n8n.md) — workflows de automação e integração com IA

## Rodando localmente

```bash
npm install
npm run dev
```

O projeto sobe em `http://localhost:5173`.

## Deploy

O deploy é feito automaticamente no GitHub Pages a cada push na branch `main` via GitHub Actions.

URL de produção: `https://kevin-loran.github.io/lexflow-ai/`
