# Política definitiva de evidências — Cloudflare R2 (90 dias)

**Decisão:** não usar Supabase Storage para fotografias. Supabase somente banco PostgreSQL, autenticação e metadados. Não adicionar fallback de fotos ao Supabase Storage.

## Capacidade
- 32 lojas × 10 fotos/loja/dia = 320 fotos/dia
- 90 dias em regime permanente = 28.800 fotos
- 250 KB por foto = aproximadamente 7,2 GB (sem miniaturas, metadados e backups)
- 300 KB por foto = aproximadamente 8,64 GB
- Limite gratuito R2 Standard 10 GB-mês: monitorar com alertas e margem. Não prometer gratuito se crescer volume, tamanho médio ou operações.

## Fluxo a implementar
1. Usuário autenticado solicita iniciar envio, com ID de loja/tarefa.
2. API autoriza o vínculo usuário/loja/tarefa usando sessão Supabase e regras do banco.
3. Worker recebe bytes (ou emite URL assinada de curta duração para upload direto, conforme suporte) para bucket R2 **privado**. Nunca enviar credenciais R2 ao cliente.
4. Chave do objeto gerada pelo servidor: `lojas/<store_id>/YYYY/MM/DD/<task_id>/<uuid>.webp`.
5. Validar tipo real do arquivo, tamanho máximo, conteudo e limites por tarefa. Otimizar foto, evitando manter original por padrão.
6. Ao confirmar upload, registrar em `task_photos` os dados de identificação, `storage_path`, mime, tamanho e timestamp; em falha de persistência, excluir o objeto órfão.
7. Downloads somente após autorização por loja e tarefa, usando proxy autenticado ou URL de acesso de curta duração. Nunca bucket público.
8. Regra de ciclo de vida de objetos: apagar fotos após 90 dias. Criar auditoria de exclusões e exibir “evidência expirada” sem excluir respostas e histórico.
9. Backups independentes: não reter fotos além dos 90 dias; históricos e respostas podem ter retenção própria.
10. Isolar ambientes de teste, especialmente Supabase, R2 e as credenciais; não permitir exclusões/testes na produção Vercel.

## Bloqueios encontrados no código (2026-11-12)
**Atualização:** a implementação e os testes desta substituição estão em [R2_IMPLEMENTATION.md](./R2_IMPLEMENTATION.md). Os bloqueios abaixo descrevem o estado anterior. A execução integral em Workers e a configuração de recursos isolados continuam pendentes; não foi feito deploy.

O arquivo `src/lib/backend/supabase/index.ts` ainda utiliza `supabase.storage.from(storageBucket())` para obter URLs assinadas, upload e exclusão. Portanto **não está integrado ao R2** e requer refatoração testada antes de publicar.
A branch `cloudflare-workers-preview` não deve usar o backend local baseado em `node:fs`. O deploy Workers ainda não existe.

## Próxima alteração de código
Criar uma interface `PhotoObjectStore` com implementações de R2 por binding do Workers (e, se necessário, API compatível S3 apenas no servidor); substituir operações diretas de Supabase Storage no backend de fotos; adicionar testes de autorização, limite, upload, exclusão, expiração e erro de banco; publicar somente após validação.
