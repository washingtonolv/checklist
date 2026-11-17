# Publicações aprovadas: Vercel e Cloudflare

A aprovação continua sendo solicitada antes de mesclar uma alteração em `main`. Abrir um PR ou criar um preview não autoriza produção. Uma vez aprovada e mesclada a versão, o workflow `Vercel and Cloudflare release` acompanha a publicação automática já existente da Vercel e publica a integração correspondente na Cloudflare.

## Fluxo

1. No PR, integrar o commit proposto em uma cópia da branch `cloudflare-workers-preview`, sem enviar a integração nem publicar. Executar os testes, TypeScript, build OpenNext, dry-run e smoke local com R2/Images. Conflitos interrompem a verificação para correção explícita; nunca escolher automaticamente uma das versões.
2. Após a aprovação e o merge em `main`, repetir a integração e os testes. Preservar o commit exato testado num bundle de Git do próprio workflow.
3. Reconstruir a configuração de produção e conferir o smoke local. Esperar o status de sucesso da Vercel para o mesmo commit de `main`, no projeto `oliver-53fe/checklist`. Uma falha, ausência do status ou versão já substituída interrompe a publicação Cloudflare.
4. Atualizar a branch Cloudflare sem force push, somente se não mudou durante os testes. Publicar o app e o agendador de retenção no mesmo workflow, com os segredos já existentes e `--keep-vars`.
5. Verificar login, proteção de página e saúde do backend nos dois endereços. Registrar os dois commits no resumo da execução. Uma execução com erro significa publicação incompleta, nunca sucesso dos dois provedores.

Os provedores não oferecem uma transação conjunta: a Vercel pode ficar pronta alguns minutos antes da Cloudflare. Se a Cloudflare falhar, a Vercel não é revertida automaticamente; investigar e repetir a execução mais recente em Actions. `workflow_dispatch` serve para recuperar a publicação da versão atual de `main`, já aprovada, e não recebe um commit arbitrário. Versões antigas são recusadas quando `main` já avançou.

## Configuração preservada

- Vercel continua ligada à branch `main`, com seus previews e endereço existentes.
- Cloudflare mantém sua versão de Next/OpenNext, fotos R2, Images, passkeys e agendador. A sincronização é de `main` para Cloudflare. Não enviar essas adaptações de volta à Vercel automaticamente.
- Os arquivos `.github/workflows` da branch Cloudflare são preservados explicitamente durante a integração. Cada branch mantém seus próprios workflows; mudanças de infraestrutura Cloudflare precisam de revisão específica. Isso também evita conceder ao token automático permissão para alterar workflows.
- Reutilizar `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` do repositório. Nenhuma credencial Vercel nova é necessária. O token Cloudflare só é disponibilizado ao passo de publicação; o token GitHub de escrita só ao passo de envio.
- `CLOUDFLARE_AUTODEPLOY` continua controlando o workflow antigo para publicações diretas da branch Cloudflare. O fluxo conjunto publica explicitamente após os testes e a confirmação da Vercel. O push com `GITHUB_TOKEN` não dispara o workflow antigo, conforme a [documentação do GitHub](https://docs.github.com/en/actions/concepts/security/github_token).
- Não executar migrações automaticamente. Toda mudança no banco segue precisando da aprovação e conferência do destino.

## Verificações

`node --test scripts/release-coordination.test.mjs` cobre status pendente, falha, timeout, commit substituído, projeto incorreto e backend indisponível. O workflow também executa os testes reais da aplicação integrada e o smoke de Workers antes de publicar.

Se houver conflito num próximo PR, corrigir a compatibilidade na branch Cloudflare e repetir a verificação do PR antes de pedir a aprovação de produção. Não contornar testes nem substituir a branch inteira com `main`.
