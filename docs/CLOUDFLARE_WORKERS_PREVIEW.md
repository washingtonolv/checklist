# Cloudflare Workers — segunda implantação (sem alterar a Vercel)

## Estado
Este ramo é uma preparação **não publicada** para migrar o Checklist Operacional D&D para Cloudflare Workers. A branch `main` e a produção Vercel não devem ser alteradas ou usadas como destino de deploy.

O projeto utiliza Next.js 14 / React 18, Server Actions, middleware Supabase, um backend de fallback no filesystem e o Cron da Vercel. Portanto, **não** podemos simplesmente publicar os arquivos estáticos.

A Cloudflare recomenda **vinext** para novos projetos Next.js em Workers. O adaptador OpenNext atual deixou de suportar Next.js 14; é obrigatório executar o diagnóstico `vinext check` antes de inicializar o novo runtime.

Documentação: https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/nextjs/

## Pré-requisitos
- Conta Cloudflare com Workers Free habilitado; escolha um nome disponível para `workers.dev`.
- Supabase de **testes** com autenticação e RLS configurados. **Não use dados reais durante o teste.**
- Node.js e npm localmente, conectados à internet.
- Não adicionar credenciais ao GitHub ou arquivos versionados.

## Etapa 1 — Diagnóstico (não publica nada)
```bash
git checkout cloudflare-workers-preview
npm ci
npx vinext check
```

Confira incompatibilidades relacionadas a Server Actions, middleware, `sharp`, geração de fotos, URLs assinadas e bibliotecas `node:fs`. A branch tem um job de GitHub Actions que executa somente a verificação de compatibilidade.

## Etapa 2 — Gerar arquivos Cloudflare apenas nesta branch
**Só após analisar o relatório da etapa anterior**:
```bash
npx vinext init --platform=cloudflare --name checklist-dd-preview --cdn-cache=none --data-cache=none --image-optimization=none
```
O comando instala as dependências, atualiza o lockfile e cria `vite.config.ts` e `cloudflare.config.ts`, além de scripts `dev:vinext`, `build:vinext`, `start:vinext` e `deploy:vinext`.

Este projeto usa `next/font/google`, que vinext deve tratar no build. Se existirem componentes `next/image` com imagens raster/remotas, revise a estratégia de otimização antes de publicar. Caso o sistema precise de ISR/cache, a opção `none` deve ser revisada.

Atualize os excludes do ESLint para `.cloudflare/**`, `.vinext/**`, `dist/**` e inclua `.cloudflare/types` no `tsconfig.json` conforme documentação oficial. Revise todo arquivo alterado pelo init.

## Etapa 3 — Bloqueios de segurança antes do primeiro deploy
1. **Fail-closed**: em Cloudflare, jamais ativar `createLocalBackend()`, pois usa `node:fs` e não é persistente. Se faltarem variáveis do Supabase, a implantação deve falhar com erro de configuração, não criar dados locais.
2. Definir `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas variáveis de **build e runtime** do Workers; `SUPABASE_SERVICE_ROLE_KEY` é segredo exclusivo do servidor. Nunca expor essa chave no cliente.
3. Usar um Supabase **separado para testes**; conferir políticas RLS, cadastro, sessão, redirecionamentos de autenticação e autorização por loja.
4. **Fotos ainda usam Supabase Storage no backend atual.** Migrar uploads/leitura/exclusão para R2 privado é uma etapa própria, após validar o runtime e antes de colocar o uso real em produção.
5. O agendamento `vercel.json` (/api/cron/gerar, 06:00 UTC) **não roda automaticamente na Cloudflare**. Criar uma rotina Cloudflare Cron Trigger com autenticação e idempotência; evitar disparar tarefas duas vezes quando Vercel e Cloudflare apontarem para o mesmo Supabase.
6. O servidor local e a geração de arquivos usam APIs Node; testar funções de exportação PDF/XLSX e manipulação de imagens. Não pressupor compatibilidade.
7. Configurar políticas de R2 para 90 dias e verificar logs/exclusão. Manter apenas referências de fotos expiradas no histórico do Supabase.
8. Definir backups independentes e monitorar limites do plano gratuito.

## Etapa 4 — Testes sem publicação
```bash
npm run dev:vinext
npm run build:vinext
npm run start:vinext
```
Validar rotas /login, /painel, /perfil, checklists, ações, perfil de supervisor, uploads e downloads, além dos testes existentes:
```bash
npm run typecheck
npm test
npm run build
```

## Etapa 5 — Publicar só após testes e configuração da conta
```bash
npx cf auth login
npx @vinext/cloudflare deploy --dry-run
npx @vinext/cloudflare deploy
```

A publicação criará endereço no formato `https://checklist-dd-preview.<subdominio-da-conta>.workers.dev`. Não há necessidade de domínio próprio. O domínio real só existirá após sucesso no deploy.

## Nota importante
Uma instalação do GitHub Actions, a criação desta branch ou o script de diagnóstico **não significam que o aplicativo foi migrado ou publicado**. A integração Cloudflare, autenticação, uploads privados para R2, retenção e backups precisam ser configurados e testados separadamente.
