# LexFlow AI

LexFlow AI é uma plataforma SaaS jurídica para advogados gerenciarem contratos de forma inteligente. O sistema lê PDFs automaticamente via n8n e OpenAI, extrai as informações relevantes e organiza tudo em um dashboard limpo e funcional.

## O que o sistema faz

Quando um contrato em PDF chega pelo Google Drive, o n8n detecta o arquivo, extrai o texto, envia para análise de IA e salva os dados estruturados no Supabase. A partir daí o advogado consegue visualizar todos os contratos, ver quais estão vencendo, filtrar por categoria, status e prioridade, e acessar o detalhe completo de cada um.

Também é possível fazer upload manual de contratos pelo próprio dashboard, criar contratos do zero pelo formulário, editar qualquer campo e excluir registros.

## Tecnologias

O frontend foi construído com React, TypeScript, Vite e Tailwind CSS v4. O banco de dados e autenticação são feitos com Supabase. A automação de leitura de contratos roda no n8n conectado ao OpenAI.

## Como rodar localmente

Instale as dependências e suba o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

O projeto vai rodar em `http://localhost:5173`.

## Estrutura das páginas

- **Dashboard** com cards de resumo e gráficos de status e prioridade
- **Contratos** com tabela, filtros e busca
- **Detalhes do contrato** com todas as informações extraídas pela IA
- **Formulário** para criar e editar contratos manualmente
- **Upload Manual** para enviar PDFs sem passar pelo Google Drive
- **Email Profissional** para configurar a leitura de caixa de entrada
- **Como Funciona** explicando o fluxo completo da plataforma
