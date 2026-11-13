# Verificação Cloudflare sem publicação

Na branch cloudflare-workers-preview, com Node >=22.12 e npm:

```powershell
npm ci
npm test
npm run typecheck
npm run workers:build
npm run workers:check
npm run workers:smoke
```

O adaptador escolhido é OpenNext. O projeto já foi configurado manualmente; não executar init/migrate de outros adaptadores. Os comandos acima não publicam recursos. O check usa somente --dry-run e o smoke usa --local.

Confira as configurações ainda pendentes, inclusive Supabase isolado, R2 privado e plano Images, em [docs/CLOUDFLARE_WORKERS_PREVIEW.md](../docs/CLOUDFLARE_WORKERS_PREVIEW.md).
