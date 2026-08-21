# <img src="public/favicon.png" width="32" height="32" align="center" /> JuriTech
&#11088;Projeto campeão do hackaton de inteligência artificial e empregabilidade cedido pela ATRIA&#11088;

Plataforma SaaS jurídica que automatiza a gestão de contratos e processos trabalhistas para advogados. Contratos chegam por e-mail ou Google Drive, passam por análise de IA e são organizados automaticamente em um dashboard completo.

## Visão Geral

O JuriTech resolve um problema comum em escritórios de advocacia: a gestão manual e descentralizada de contratos e processos. Com o sistema, contratos em PDF são captados automaticamente, analisados por IA e salvos no banco de dados com todos os campos extraídos (partes, valores, prazos, cláusulas, alertas). O advogado acessa tudo por um painel limpo, com filtros, busca e alertas de vencimento.

## Como acessar:
 acesso:
  acesse esse link: `https://kevin-loran.github.io/JuriTech/`
  
  login: 
  
  `email: advogado.profissionalteste@gmail.com`
  
  `senha: teste123`

## Funcionalidades

**Contratos**
- Captura automática de contratos via e-mail ou Google Drive
- Análise por IA com extração de partes, valores, prazos, cláusulas e obrigações
- Dashboard com filtro por status, categoria e prioridade
- Alertas de vencimento com contagem de dias
- Status manual configurável (Ativo, Vencido, Pendente, Cancelado)
- CRUD completo com edição de campos e exclusão

**Processos Trabalhistas**
- Captura via e-mail com palavra-chave
- Análise automática por IA dos dados do processo
- Visualização em cards por prioridade
- Detalhe completo com identificação, partes, valores, cláusulas e análise da IA

**Autenticação e Segurança**
- Login e cadastro com Supabase Auth
- Row Level Security (RLS) no banco de dados
- Cada advogado acessa apenas seus próprios dados

## Fluxo de Automação

### Contratos

<img width="1449" height="288" alt="image" src="https://github.com/user-attachments/assets/57574529-45cc-4677-8801-2e4c0a6e2e56" />


```
E-mail ou Drive → n8n detecta → Extrai texto do PDF → IA analisa → Supabase salva → Dashboard exibe
```


### Processos Trabalhistas

<img width="1385" height="402" alt="image" src="https://github.com/user-attachments/assets/5b045a86-9740-4c69-a666-e9c35941816b" />


```
Cliente envia e-mail → n8n capta por palavra-chave → IA extrai dados → Supabase salva → Dashboard exibe
```

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 + Tailwind CSS v4 |
| Banco de dados | Supabase (PostgreSQL + RLS + Auth) |
| Automação | n8n Cloud |
| IA | OpenAI GPT + Google Gemini |
| Hospedagem | GitHub Pages + GitHub Actions |

## Estrutura do Repositório

```
/
├── src/
│   ├── pages/          Páginas da aplicação
│   ├── components/     Componentes reutilizáveis
│   ├── contexts/       Contexto de autenticação
│   └── lib/            Configuração do Supabase
├── public/             Arquivos estáticos e 404.html (SPA redirect)
├── docs/               Documentação técnica do projeto
│   ├── frontend.md     Componentes, rotas e lógica do frontend
│   ├── supabase.md     Tabelas, views, funções e RLS
│   └── n8n.md          Workflows de automação e integração com IA
├── .github/
│   └── workflows/
│       └── deploy.yml  Deploy automático no GitHub Pages
└── README.md
```

## Documentação Técnica

- [Frontend](docs/frontend.md) — componentes, rotas, autenticação e lógica
- [Supabase](docs/supabase.md) — tabelas, views, RLS e Storage
- [n8n](docs/n8n.md) — workflows de automação e integração com IA

## Rodando Localmente

```bash
npm install
npm run dev
```

O projeto sobe em `http://localhost:5173`.

Configure as variáveis do Supabase em `src/lib/supabase.ts` com a URL e a chave anon do seu projeto.

## Deploy

O deploy é feito automaticamente no GitHub Pages a cada push na branch `main` via GitHub Actions. O workflow instala as dependências, faz o build e publica o conteúdo da pasta `dist/`.

URL de produção: `https://kevin-loran.github.io/JuriTech/`

## Licença

Projeto privado. Todos os direitos reservados.
