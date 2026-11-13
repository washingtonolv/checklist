# Cloudflare Workers — app adaptado, sem publicação

> Estado atualizado e configuração definitiva: [CLOUDFLARE_PUBLICATION.md](./CLOUDFLARE_PUBLICATION.md). Este documento registra a etapa histórica de teste; requisitos antigos de projeto separado e migração destrutiva foram substituídos pela coexistência aditiva.

## Estado da branch

Somente `cloudflare-workers-preview` foi alterada. `main`, `vercel.json`, os dados e as credenciais de produção permanecem intactos. Nenhum Worker, bucket, segredo, projeto Supabase, domínio ou implantação foi criado remotamente.

A branch gera um artefato executável de Workers com **Next.js 15.5.29, React 19.3.1, OpenNext 1.20.17 e Wrangler 4.161.0**, todos fixados no lockfile. A versão atual do OpenNext exige Next >=15.5.29 <16 ou >=16.4.5; por isso a migração inclui atualização do framework nesta branch. Não se usou uma versão antiga do adaptador nem a opção de ignorar versões incompatíveis. A recomendação atual da Cloudflare para apps novos é vinext; aqui foi escolhido OpenNext para preservar o pipeline de build do Next e os fluxos existentes de Server Actions.

`cookies()`, `params`, `searchParams` e o cliente Supabase de servidor foram adaptados para as APIs assíncronas do Next 15. A sessão continua sendo verificada com Supabase Auth e autorização pelas regras de banco e vínculo com lojas. Não se alteraram as versões dos SDKs Supabase nesta etapa.

## Runtime

- `wrangler.jsonc` aponta para `.open-next/worker.js` e `.open-next/assets`, com compatibilidade Node do Workers. O Worker tem nome de teste, sem rotas públicas configuradas, `workers_dev=false` e `preview_urls=false`.
- `open-next.config.ts` desabilita caches compartilhados de dados/ISR. As páginas autenticadas são dinâmicas; assets estáticos têm cache imutável. Não foi criado bucket de cache junto com as fotos.
- O middleware foi movido da raiz para `src/middleware.ts`, compatível com `src/app`. A inclusão no manifesto de build e os redirecionamentos foram verificados. As APIs de fotos e cron passam às verificações próprias de sessão/bearer, sem redirecionamento HTML indevido.
- `getBackend()` seleciona somente Supabase e recusa configuração ausente ou destino não autorizado. Não há fallback de dados, cookies de demonstração ou persistência em filesystem no app. Os módulos locais antigos permanecem somente para testes de regressão; não entram no artefato. As rotas de evidências locais e a vitrine pública fictícia foram desativadas nesta branch.
- O segredo/URL de Supabase de teste deve ser explicitamente permitido por `PREVIEW_SUPABASE_URL`; qualquer divergência é recusada antes da criação do cliente. O ambiente de fotos Cloudflare recusa execução na Vercel.

## Fotos e avatares

No Worker, `createPhotoObjectStore()` usa o binding privado **PHOTOS_BUCKET**. Não são necessárias chaves S3 no Worker. A implementação S3 anterior continua disponível para testes Node com recursos isolados.

Fotos e avatares passam pelo binding **IMAGES**. O build substitui o módulo Node de processamento antes da resolução de caminhos/externalização de dependências; a checagem do artefato recusa código nativo Sharp e o backend local. Apenas o Node de desenvolvimento/testes continua usando Sharp; não é carregado pelo Worker.

O processamento verifica metadados decodificados, aceita JPEG/PNG/WebP, limita entrada a 10 MiB (foto) ou 5 MiB (avatar), limita a 24 milhões de pixels, remove metadados, gera WebP estático e limita saída a 1 MiB ou 8 KB. Fotos ficam em até 1600×1600 e avatares em 96×96. Animações são reduzidas a uma imagem estática pelo Images. Originais não são armazenados. Avatares mantêm o comportamento existente de miniatura em metadados de perfil; as evidências ficam no R2.

As fotos são servidas pelo proxy autenticado, com autorização por loja e `private, no-store`. Permanecem as compensações de falha, o limite transacional por tarefa, a expiração de 90 dias, os metadados históricos e a auditoria descritos em [R2_IMPLEMENTATION.md](./R2_IMPLEMENTATION.md).

**Images é um serviço separado do R2:** a ativação do binding em uma conta real pode exigir plano pago e as transformações têm cobrança própria. Nenhum plano foi contratado, binding remoto ativado ou transformação remota executada. A simulação local não exige credenciais Cloudflare.

## Comandos que não publicam

Requer Node >=22.12, npm e, preferencialmente, Linux/WSL para o build OpenNext. O build e a simulação também foram executados no Windows desta tarefa.

```bash
npm ci
npm test
npm run typecheck
npm run workers:build
npm run workers:check
npm run workers:smoke
```

- `workers:build` compila Next/OpenNext e inspeciona os bundles finais para impedir dependências Node/demo proibidas. Recusa execução dentro da Vercel.
- `workers:check` executa somente `wrangler deploy --dry-run`, sem publicar/upload remoto. O pacote verificado ficou em aproximadamente **2,0 MiB gzip**; o tamanho deve ser monitorado a cada atualização.
- `workers:smoke` sobe processos locais do workerd/Wrangler e encerra-os ao terminar. Verifica página de login, redirecionamento protegido, cron sem segredo, resposta privada das fotos, processamento real de imagens/avatares e PUT/GET/DELETE em R2 local. O harness de bindings está em `tests/workers`; não é rota do app nem entrypoint de implantação.
- `workers:preview` inicia o app já compilado em `127.0.0.1:8787`. Copiar `.dev.vars.example` para `.dev.vars` somente para usar um Supabase isolado real. A ausência de configuração não ativa demonstração local.

Não existem scripts automáticos de deploy/upload. O workflow de CI da branch executa testes, tipos, build, dry-run e smoke local, sem tokens Cloudflare ou segredos de produção.

## Evidência e limites da validação

74 testes unitários/de integração passaram, incluindo migração PostgreSQL em PGlite, RLS, sessões, isolamento, imagens e R2. O build Next/OpenNext, a checagem de pacote e o smoke do workerd passaram localmente. O smoke usa os emuladores locais dos bindings, não uma conta Cloudflare.

Foram corrigidos dois problemas revelados pela execução do Worker: middleware fora da pasta `src` e um alias de imagem que inicialmente não evitava a inclusão do Sharp. A verificação final cobre ambos. Nos testes legados de arquivos, uma trava transitória de renomeação do Windows foi tratada com repetição limitada, preservando a substituição atômica; esse código permanece fora do Worker.

Ainda não foram exercitados login com usuário real, ações com banco hospedado, vínculo de duas lojas numa conta real ou limites de CPU/memória da implantação. Esses testes dependem de recursos isolados e credenciais de teste. Não confundir build local aprovado com sistema publicado ou operação completa aprovada remotamente.

`npm audit` reportou 24 ocorrências (2 baixas, 12 moderadas, 7 altas e 3 críticas), incluindo ferramentas e bibliotecas existentes de exportação. A atualização removeu a versão antiga de Next 14; ainda há avisos de dependências que precisam de revisão antes de exposição pública. Não foi aplicado `audit fix --force`. O bundler também emite avisos de código de terceiros sobre casos duplicados e comparação com zero negativo; não impediram os testes.

## Configuração pendente antes de qualquer publicação

1. Criar/conferir um Supabase **separado e vazio de teste** e aplicar nele as migrações, inclusive a de R2. Não reaplicar nem apontar para produção.
2. Fornecer `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` do teste no build e no runtime. Fornecer `PREVIEW_SUPABASE_URL` com exatamente o mesmo destino. Cadastrar `SUPABASE_SERVICE_ROLE_KEY` apenas como segredo de servidor do teste. Configurar o URL do app e os redirecionamentos de Auth correspondentes. Não herdar credenciais da Vercel.
3. Criar R2 Standard privado de teste e ajustar `bucket_name` do binding `PHOTOS_BUCKET`. A opção `remote=false` mantém a simulação local nos comandos de desenvolvimento; não cria o bucket. Não habilitar acesso público/r2.dev.
4. Avaliar/autorizar o plano Images e configurar o binding `IMAGES`. Se a exigência for custo zero absoluto, substituir esse processamento por uma alternativa WASM com testes de tamanho, CPU e memória antes de publicação; não há garantia de gratuidade desta solução.
5. Aplicar lifecycle de 90 dias de `cloudflare/r2-lifecycle.example.json`, configurar alertas e segredos dos agendadores. O cron de fotos opcional está em `cloudflare/retention-worker.ts`; o cron de geração de tarefas da Vercel não é transplantado automaticamente. Agendar `/api/cron/gerar` com `CRON_SECRET` exclusivo do teste, sem duplicar execução em produção.
6. Executar testes autenticados entre lojas e revisão de dependências, custo e retenção. Somente depois definir uma URL de preview e avaliar publicação separadamente. Esta tarefa não executou deploy.

## Referências oficiais

- [OpenNext: configuração e build](https://opennext.js.org/cloudflare/get-started)
- [OpenNext: bindings por contexto](https://opennext.js.org/cloudflare/bindings)
- [Cloudflare Images: processamento no Worker](https://developers.cloudflare.com/images/optimization/binding/)
- [Next.js 15: APIs assíncronas](https://nextjs.org/docs/app/guides/upgrading/version-15)
