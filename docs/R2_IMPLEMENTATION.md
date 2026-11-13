# Fotos privadas no R2 — branch de teste

## Estado e isolamento

**Atualização de runtime:** o app desta branch agora possui build OpenNext/Workers, binding R2 direto e processamento pelo binding Images. Consulte [CLOUDFLARE_WORKERS_PREVIEW.md](./CLOUDFLARE_WORKERS_PREVIEW.md) para a configuração e validação atuais. Os resultados de 68 testes abaixo registram a etapa anterior da migração R2; a etapa Workers ampliou a suíte para 74 testes.

Implementação exclusiva de `cloudflare-workers-preview`. Não foi alterada `main`, a configuração `vercel.json`, nenhum recurso Cloudflare, nenhuma credencial nem dado remoto. Não executar esta migração no projeto Supabase de produção. Não copiar segredos da Vercel para testes.

O app foi atualizado nesta branch para Next.js 15.5.29 / React 19.3.1, com Server Actions e sessões Supabase verificadas por `auth.getUser()`. O backend Supabase continua atendendo autenticação, banco e metadados. Não há chamadas de fotos a `supabase.storage` no código executável nem fallback para esse serviço.

No Worker, o caminho operacional é **Next.js/OpenNext → binding privado PHOTOS_BUCKET**. O adaptador `bindingPhotoStore` agora é usado pelo runtime. O caminho S3 via `aws4fetch@1.0.20` continua disponível para testes Node isolados; suas credenciais não são necessárias no Worker.

O build OpenNext, o dry-run Wrangler e os testes locais do workerd foram aprovados. O backend de arquivos e Sharp nativo ficam fora do artefato final do Worker. Ainda faltam recursos de conta e testes autenticados remotos; nenhum deploy foi feito.

## Fluxo e autorização

1. A Server Action autentica o usuário. O backend consulta a tarefa com o cliente Supabase de sessão, sujeito às políticas de banco existentes, e confere novamente a loja no perfil de sessão. Tarefa invisível, loja alheia, tarefa concluída sem papel de revisão e limite atingido interrompem o fluxo antes do R2.
2. O servidor decodifica os bytes com Images no Worker (Sharp apenas no Node de testes), limita entrada a 10 MiB e 24 milhões de pixels, aceita somente JPEG/PNG/WebP e rejeita conteúdo corrompido; no Worker, a saída é sempre estática. Dimensões, MIME e tamanho declarados pelo navegador não são confiáveis.
3. A imagem é reorientada, reduzida a no máximo 1600×1600, convertida a WebP qualidade 65 sem metadados EXIF e limitada a 1 MiB após compressão. A meta de 250–300 KB é uma estimativa de capacidade, não uma promessa para toda foto. Originais não são gravados no R2, inclusive se enviados pelo cliente.
4. A chave é gerada no servidor: `lojas/<store_id>/YYYY/MM/DD/<task_id>/<uuid>.webp`, com data UTC. O bucket é privado. Nenhum segredo R2 vai para o navegador.
5. Depois do PUT, o servidor grava metadados pelo cliente administrativo. INSERT/UPDATE diretos de `task_photos` são revogados de clientes autenticados para impedir fotos fictícias usadas na conclusão obrigatória. A autorização da tarefa é feita antes com sessão/RLS; não se usa o cliente administrativo para descobrir tarefas acessíveis.
6. Erro de metadados aciona DELETE compensatório no R2. Falha da compensação registra a chave no log do servidor; alertar e reconciliar esses casos. O lifecycle é a proteção final de objetos órfãos. Não existe transação distribuída R2/Postgres.
7. O banco serializa inserções por tarefa com bloqueio da tarefa e mantém o limite absoluto de **5 fotos**. Manter `NEXT_PUBLIC_MAX_PHOTOS_PER_TASK=5` no teste; alterar esse limite exige atualizar também a regra SQL. Metadados expirados continuam contando como evidências históricas.
8. O navegador recebe `/api/photos/<id>`. Cada GET verifica uma sessão atual, perfil ativo, visibilidade da foto pela RLS e acesso à loja antes de consultar o R2. Respostas usam `private, no-store` e `nosniff`. Não há bucket público, URL pública ou URL assinada persistida no banco. A remoção de acesso à loja vale na próxima requisição.
9. Exclusão manual mantém a restrição existente de administrador. Primeiro apaga o objeto; a RPC `delete_r2_photo` exclui o metadado e registra auditoria na mesma transação, aplicando RLS. Falha do R2 não exclui metadados; falha posterior no banco permite repetir DELETE idempotente. Clientes não devem chamar a RPC diretamente: o fluxo de app passa pelo backend que remove os bytes.

## Retenção

O proxy deixa de servir a foto exatamente aos 90×24h de `created_at` e retorna 410. As galerias da tarefa, loja e painel exibem “Evidência expirada”. A regra de lifecycle deve excluir objetos do prefixo `lojas/` após 90 dias. A exclusão física do lifecycle é assíncrona; a aplicação não depende desse atraso para bloquear leitura.

`POST /api/cron/photos` exige `PHOTO_RETENTION_CRON_SECRET` mesmo em desenvolvimento e aceita somente o ambiente isolado. Processa até 200 metadados vencidos por chamada; DELETE R2 é repetível mesmo após o lifecycle. A RPC `expire_r2_photo`, exclusiva de `service_role`, registra auditoria e `expired_at` atomicamente, preservando metadados, respostas e histórico. Auditoria é de processamento/confirmação da expiração pelo app, não o instante exato da operação interna de lifecycle. Falhas mantêm o lote pendente para repetição. Monitorar erros e atraso; na carga inicial repetir lotes até retornar zero.

`cloudflare/retention-worker.ts` e seu exemplo Wrangler são um agendador opcional que chama esse endpoint a cada 15 minutos. Não hospedam o app nem o bucket. O endpoint deve apontar somente para um app de teste configurado. Configurar o segredo do Worker separadamente. Não foi criado cron na Vercel.

Backups de fotos não devem reter bytes além dos 90 dias; não habilitar cópias permanentes ou outro bucket sem retenção equivalente. Histórico e respostas podem ter retenção própria.

## Configuração pendente, sem segredos no repositório

1. Criar **um projeto Supabase separado e vazio** de teste. Aplicar as migrações na ordem nesse projeto, incluindo `20261113014551_r2_photos.sql`. A migração remove políticas antigas do bucket `evidencias`, revoga escrita direta de metadados e adiciona RPCs/controle de limite. Não apaga objetos de Storage existentes. Não importar fotos/metadados legados automaticamente; qualquer cópia exige plano de migração e revisão de datas, limites e retenção.
2. Preencher `.env.example` apenas com valores desse projeto. `PHOTO_ENV=cloudflare-preview`; `PREVIEW_SUPABASE_URL` precisa coincidir com `NEXT_PUBLIC_SUPABASE_URL`. Essa igualdade é uma confirmação explícita de destino, não uma prova automática de que o projeto é de teste: conferir no painel. O código R2 recusa qualquer `VERCEL_ENV` definido.
3. Criar um bucket **R2 Standard privado de teste**, sem domínio público nem r2.dev público. No Worker, configurar o binding PHOTOS_BUCKET; credenciais S3 não são necessárias. Apenas para o caminho Node/S3, criar credenciais limitadas a ler/gravar/excluir somente esse bucket. No caminho Node/S3, preencher `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` exclusivamente no servidor. Nunca usar nomes `NEXT_PUBLIC_` para esses segredos. O endpoint padrão implementado é `https://<account>.r2.cloudflarestorage.com`; buckets jurisdicionais exigem adaptação explícita do endpoint.
4. Aplicar e conferir no painel/API S3 a regra de `cloudflare/r2-lifecycle.example.json`. Não é uma configuração Wrangler aplicada automaticamente. Como os uploads/downloads passam pelo servidor, não é necessário habilitar CORS público no bucket.
5. Gerar um segredo exclusivo para a rotina e configurar um agendador de teste. O exemplo `cloudflare/wrangler.retention.example.jsonc` é opcional: copiar, trocar o endereço e cadastrar o segredo fora do arquivo. Não executar deploy com os placeholders. Ativar alertas de falhas, objetos órfãos, lotes pendentes, consumo e tamanho médio. Não prometer gratuidade caso volume/operações cresçam.
6. Testar com duas lojas e usuários diferentes: upload, visualização, revogação de vínculo, admin DELETE, concorrência de seis envios, credencial R2 inválida, falha de banco e expiração. Somente após isso avaliar separadamente publicação em ambiente de teste. Nenhum teste remoto foi realizado nesta tarefa porque não foram provisionados recursos isolados.

## Verificação e dependências

- 68 testes passando, incluindo validação de bytes, autorização por loja, falhas de R2/banco, compensação, proxy, expiração, agendador autenticado, binding R2 e cliente S3 simulado.
- A migração executou em PostgreSQL via `@electric-sql/pglite@0.3.14`, apenas dependência de desenvolvimento, com fixture de papéis/tabelas/políticas. Verificados privilégios, limite e expiração idempotente com auditoria. A fixture não substitui testar toda a cadeia Supabase/Auth/Postgres hospedada ou concorrência entre conexões reais.
- `npm run typecheck` e `npm run build` aprovados localmente; o build já omite lint por configuração preexistente. CI da branch passa a executar testes, tipos e build, mantendo o check de compatibilidade já existente, sem comandos de deploy.
- Uma execução intermediária teve `EPERM` de renomeação no teste do backend local no Windows; as execuções seguintes passaram sem alterações nesse backend.
- `npm audit` apontou 25 ocorrências (2 baixas, 9 moderadas, 10 altas, 4 críticas) na árvore instalada, incluindo Next, jsPDF, Sharp, XLSX, Zod e ferramentas de teste. `aws4fetch` e PGlite adicionados não foram listados como vulneráveis nesse relatório. Não foi feito upgrade amplo de framework/autenticação fora do escopo; resolver as dependências vulneráveis antes de exposição pública. Preservados os pins Supabase existentes e o lockfile; não utilizar `npm audit fix --force` sem revisão.

## Referências

- [Política de evidências da branch](./R2_PHOTO_RETENTION_90_DAYS.md)
- [R2 com aws4fetch](https://developers.cloudflare.com/r2/examples/aws/aws4fetch/)
- [Lifecycle R2](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)
- [Verificação de usuário Supabase](https://supabase.com/docs/reference/javascript/auth-getuser)
