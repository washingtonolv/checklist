# Checklist Operacional D&D

> **Branch Cloudflare isolada:** app adaptado para Workers com Next.js 15 / React 19 / OpenNext, sem deploy. [Configuração, testes e pendências](./docs/CLOUDFLARE_WORKERS_PREVIEW.md). A produção Vercel na `main` permanece independente.

Plataforma para gestão e acompanhamento das rotinas operacionais das lojas D&D, com perfis de gerente comercial, supervisor e gerente de loja.

**[Acessar o protótipo visual no GitHub Pages](https://washingtonolv.github.io/checklist/)**

> **Importante:** o site do GitHub Pages é uma demonstração estática, com perfis e informações fictícios. A seleção de usuário não é autenticação real. As alterações feitas no protótipo não são compartilhadas entre dispositivos e não são gravadas em um banco de dados.

## O que existe no projeto

- **Painel gerencial:** indicadores, execução por loja, pendências e evidências.
- **Atividades:** checklists, periodicidade, andamento, observações e revisão.
- **Lojas e usuários:** vinculação de gerentes, supervisores e unidades.
- **Categorias e modelos:** organização das rotinas, prazos e exigência de fotos.
- **Relatórios e histórico:** acompanhamento de atividades, exportações e trilha de auditoria.

O projeto completo é uma aplicação **Next.js 15 / React 19 / TypeScript** com Supabase para autenticação/banco/metadados e R2 privado para evidências no Workers. O protótipo visual é uma implementação HTML separada, criada para validar telas e fluxos antes da integração com o backend.

## Estrutura do repositório

| Caminho | Finalidade |
| --- | --- |
| `src/app/` | Telas, layouts, rotas e páginas |
| `src/actions/` | Ações de autenticação, cadastros e tarefas |
| `src/components/` | Interface, formulários, fotos e relatórios |
| `src/lib/backend/` | Implementações de backend local e Supabase |
| `src/lib/constants.ts` | Perfis, categorias, status e modelos iniciais |
| `supabase/migrations/` | Estrutura e dados iniciais para um futuro ambiente Supabase |
| `tests/` | Testes de sessão, permissões, SQL, R2, Images e regressões legadas |
| `docs/index.html` | **Protótipo público do GitHub Pages**, sem banco de dados |
| [`CODIGO_FONTE_CONSOLIDADO.md`](./CODIGO_FONTE_CONSOLIDADO.md) | Snapshot Markdown dos 90 arquivos de texto do projeto |

## Executar o sistema completo localmente

Requer Node.js e npm. Na pasta raiz do projeto:

```bash
npm ci
npm run dev
```

Acesse `http://localhost:3000`.

Nesta branch, o app exige Supabase de teste configurado e recusa fallback local. Os módulos legados de demonstração permanecem apenas para testes de regressão e não entram no artefato Workers. Para simular o runtime, usar `npm run workers:build` e `npm run workers:preview`.

Com Supabase configurado, o sistema passa a usar o backend correspondente. **Não publique chaves secretas, senhas ou arquivos `.env` no repositório.** Consulte `.env.example` apenas como referência de configuração e revise as políticas de acesso antes de um uso real.

## Testar os perfis no navegador

No [protótipo visual](https://washingtonolv.github.io/checklist/), escolha um dos perfis fictícios:

- **Gerente Comercial:** visão completa e telas administrativas simuladas.
- **Supervisor:** visão demonstrativa das lojas vinculadas.
- **Gerente de Loja:** visão demonstrativa da unidade selecionada.

Use **Trocar usuário** para repetir os testes com outro perfil. Não envie dados reais, fotos de colaboradores ou informações sigilosas no protótipo público.

## Referência do código-fonte

O arquivo [`CODIGO_FONTE_CONSOLIDADO.md`](./CODIGO_FONTE_CONSOLIDADO.md) contém os arquivos de texto extraídos de um projeto compactado, organizados por caminho. Na comparação com a branch `main`, **os 90 arquivos representados no Markdown já correspondiam aos respectivos arquivos do repositório**. Foram preservados o código original e o protótipo visual.

O Markdown é documentação para leitura e referência, **não um projeto executável**. Arquivos binários e dependências instaladas não fazem parte desse snapshot.
