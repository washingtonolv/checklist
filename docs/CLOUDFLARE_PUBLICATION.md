# Publicação Cloudflare com Supabase existente

## Escopo atual

O usuário cancelou a criação de ambientes de teste após atingir a cota de projetos Supabase gratuitos e autorizou publicar na Cloudflare usando o projeto Checklist D&D existente. Os dois projetos Supabase atuais devem permanecer ativos. Não contratar Workers Paid nem Images Paid.

Somente a branch `cloudflare-workers-preview` recebe alterações. A branch `main`, `vercel.json`, domínio e implantação existentes na Vercel permanecem preservados. Não alterar ou rotacionar credenciais existentes.

## Configuração

- `wrangler.jsonc`: simulação/CI isolada, sem endereço público.
- `wrangler.production.jsonc`: publicação explícita do Worker `checklist-dd`, bucket privado `checklist-photos`, bindings `PHOTOS_BUCKET` e `IMAGES`. `workers_dev=true` publica o app, não o bucket.
- Build e runtime precisam dos mesmos `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Runtime: `PHOTO_ENV=cloudflare`, `CLOUDFLARE_WORKERS=true`, `SUPABASE_ALLOWED_URL` exatamente igual à URL Supabase. O código rejeita execução R2 com `VERCEL_ENV` definido.
- Cadastrar `SUPABASE_SERVICE_ROLE_KEY`, `PHOTO_RETENTION_CRON_SECRET` e `CRON_SECRET` como segredos no servidor Cloudflare. Nunca usar prefixo `NEXT_PUBLIC_` para segredos nem gravá-los no Git.
- Informar `NEXT_PUBLIC_APP_URL` com o endereço final e manter as URLs atuais de Auth; acrescentar redirecionamento Cloudflare apenas se o fluxo exigir. Não substituir a URL da Vercel.

O bucket `checklist-photos` foi criado privado, Standard, com a regra habilitada `photo-retention-90-days`: prefixo `lojas/`, exclusão após 90 dias. Sem domínio público, sem r2.dev público e sem CORS público. O acesso ocorre exclusivamente pelo servidor autenticado.

## Compatibilidade do banco

Aplicar exclusivamente `supabase/migrations/20261113014551_r2_photos.sql`, após verificar o destino. A migração é aditiva: cria `r2_task_photos`, RLS, controle transacional de cinco fotos e RPCs de auditoria/expiração. Não remove políticas de `storage.objects`, privilégios nem linhas da tabela legada `task_photos`.

A função existente `private.enforce_task_rules()` recebe uma alteração guardada: a consulta de evidência obrigatória passa a aceitar fotos legadas ou R2. Todas as demais regras de autorização/status são preservadas. Se o corpo esperado divergir, a transação falha inteira para revisão. O teste PGlite executa as regras originais e verifica tanto conclusão com fotos legadas como conclusão com R2 e rejeição sem fotos.

As fotos R2 usam tabela separada para que a versão antiga da Vercel não interprete chaves R2 como caminhos de Supabase Storage. Durante a coexistência, cada versão exibe as fotos do seu próprio provedor. Tarefas, respostas, usuários e lojas continuam compartilhados. Isso exige coordenação operacional: uma tarefa concluída pela versão Cloudflare aparece concluída também na Vercel, mas suas fotos R2 só são abertas pela Cloudflare. A versão nova não possui fallback de fotos ao Storage.

Não apagar imagens legadas na Vercel. Uma eventual cópia para R2 precisa preservar datas de criação, respeitar expiração/tamanho e manter os objetos antigos enquanto a Vercel precisar deles. Não afirmar migração de fotos antigas antes de conferir os objetos copiados.

## Retenção e agendamento

O proxy bloqueia leitura após 90 dias e o lifecycle remove os bytes. O endpoint `POST /api/cron/photos` exige segredo e registra expiração/auditoria em lotes de até 200. O agendador `checklist-photo-retention` foi publicado com `cloudflare/wrangler.retention.production.jsonc`, executando a cada 15 minutos e usando segredo próprio. A geração de tarefas já agendada na Vercel não foi duplicada enquanto ambos usam o mesmo banco.

## Plano gratuito e limites

Workers permanece Free. Images Free permite 5.000 transformações únicas por mês; novas transformações acima da cota falham, sem cobrança automática nesse plano. Cada foto nova otimizada normalmente consome uma transformação, e avatares compartilham a cota. Portanto 320 fotos/dia ultrapassariam a franquia mensal de processamento, ainda que o armazenamento coubesse no R2.

R2 possui franquia de armazenamento e operações, mas uso excedente é faturável na assinatura ativada pelo usuário. Lifecycle não é teto de gastos. Não prometer custo zero para qualquer volume; acompanhar armazenamento, operações, transformações e falhas de CPU do Workers Free.

Fontes: [Images pricing](https://developers.cloudflare.com/images/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).

## Validação e pendências

75 testes e TypeScript passaram após a adaptação de coexistência. Build OpenNext, dry-run e smoke local devem ser repetidos para o artefato final; a validação local não prova login/upload completos numa conta real. Conferir permissões de duas lojas, upload, leitura autenticada, exclusão administrativa e expiração sem modificar tarefas reais para testes.

A auditoria de dependências ainda aponta avisos em bibliotecas existentes de exportação/validação e ferramentas de build. Sharp nativo não entra no Worker. Não executar correções forçadas ou afirmar que a árvore está livre de vulnerabilidades; manter revisão das dependências e registrar o resultado da publicação.

## Resultado em 13/11/2026

- App publicado em [checklist-dd.checklist-operacional-dd.workers.dev](https://checklist-dd.checklist-operacional-dd.workers.dev/login), com HTTPS funcional. Build da branch no commit `268f14c381bb3c89d77546f53b91c4859ba4984b`; [CI aprovada](https://github.com/washingtonolv/checklist/actions/runs/43357726005).
- Migração hospedada `r2_photos_coexistence` aplicada. Comparação antes/depois confirmou igualdade das seis políticas legadas, dos privilégios da tabela antiga e da contagem de fotos antigas (uma). O corpo da função de regras mudou exclusivamente na consulta de evidência prevista.
- Verificações remotas: login e health 200; página protegida 307 para login; foto sem sessão 401 com `private, no-store`; expiração sem segredo 401 e com segredo 200/zero expiradas. Login da Vercel respondeu 200. Nenhuma tarefa/usuário/foto real foi criada, alterada ou excluída para esses testes.
- `main` permaneceu em `9b6b6c7ea5de412076e2d7bcd0477bb32f358b23`; `vercel.json` permanece igual. Sem alteração de implantação/domínio da Vercel, sem pausar projetos e sem contratar Workers/Images pagos.
- Login autenticado, upload real e autorização entre duas lojas ainda dependem da validação com usuário. A foto legada não foi copiada ao R2; segue preservada para a Vercel. O retorno de recuperação de senha da Cloudflare depende da autorização da URL adicional no Supabase, preservando o destino antigo.
- A publicação inicial foi manual. A automação posterior está descrita abaixo. Não sincronizar ou fazer merge automático em `main`.

Os três testes do agendador passaram além dos 75 testes anteriores; TypeScript passou após essa alteração. O build, dry-run e smoke do artefato publicado passaram. Avisos de dependências seguem pendentes. O único aviso de segurança do Supabase após a migração foi a [proteção contra senhas vazadas desativada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), já existente; não foi alterada a configuração/plano Auth.

## Atualizações automáticas

O workflow `.github/workflows/cloudflare-compatibility.yml` executa testes, tipos, build, dry-run e smoke. Depois de aprovado, o job `deploy` recompila com a configuração pública correta, publica o app e o agendador e verifica as rotas públicas/protegidas. Somente pushes para `cloudflare-workers-preview` podem publicar; execução manual em outra branch não publica. Não existem comandos de Vercel, migrações de banco ou sincronização de branches nesse workflow.

Configuração necessária em GitHub → Settings → Secrets and variables → Actions:

- Secret `CLOUDFLARE_API_TOKEN`: token específico da conta com Workers Scripts Edit e Account Settings Read. Não usar chave global nem token OAuth de usuário do terminal. A chave preparada tem validade de um ano e precisa ser renovada antes de expirar.
- Variável `CLOUDFLARE_ACCOUNT_ID`: conta que hospeda os dois Workers.
- Variável `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave pública compatível com o cliente do app. A chave administrativa Supabase e os segredos dos crons ficam somente na Cloudflare; não são necessários no GitHub.
- Variável `CLOUDFLARE_AUTODEPLOY=true`: habilitar somente após cadastrar e verificar a chave de publicação. Sem essa opção, os testes executam e o deploy é omitido.

O token só é entregue às etapas de validação da configuração e publicação. Dependências e builds não recebem esse segredo. Actions de checkout/setup-node são fixadas por SHA; Wrangler usa a versão fixada no lockfile. Publicações são serializadas para evitar concorrência. Segredos já cadastrados nos Workers são preservados.

A automação fica pendente até cadastrar o token e aprovar uma primeira execução real pelo GitHub Actions. Essa configuração não implica contratar plano pago. Alterações de banco continuam exigindo revisão própria; não executar migrações de produção automaticamente em cada push.
