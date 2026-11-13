# Diagnóstico Cloudflare — comandos para Windows PowerShell

Na pasta do projeto, com Git e Node.js instalados:

```powershell
git fetch origin
git switch cloudflare-workers-preview
npm ci
npx vinext check
```

**Não** rode `vinext init` ou `deploy` antes de revisar as incompatibilidades e criar um ambiente Supabase de testes. A branch `main` continua intacta.

Confira o plano e os pontos críticos em [docs/CLOUDFLARE_WORKERS_PREVIEW.md](../docs/CLOUDFLARE_WORKERS_PREVIEW.md).
