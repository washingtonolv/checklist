# Banco do Checklist D&D

Projeto Supabase: `vnngqilclvxaeewzpinl`, região São Paulo (`sa-east-1`).
Painel: https://supabase.com/dashboard/project/vnngqilclvxaeewzpinl

Foram criadas 11 tabelas com RLS, 5 categorias e o bucket privado `evidencias`.
As funções privilegiadas ficam no schema `private`; os RPCs públicos usam
permissões verificadas. Perfis são definidos pelo servidor em `app_metadata`,
nunca pelo campo editável `user_metadata`.

## Conexão pendente na Vercel

Configure somente no ambiente Production do projeto existente `checklist`:

| Variável | Valor/origem |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vnngqilclvxaeewzpinl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publicável do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de servidor do projeto, armazenada como Secret |
| `SUPABASE_STORAGE_BUCKET` | `evidencias` |
| `NEXT_PUBLIC_APP_URL` | `https://checklist-rosy-eight.vercel.app` |

Nunca coloque a chave de servidor em uma variável `NEXT_PUBLIC_`, no Git ou no chat.
Use um projeto separado para ambientes de teste/Preview.
Depois de salvar as variáveis, faça um novo deploy. `/api/health` deverá indicar
`mode: "supabase"`; esse indicador sozinho não valida login e persistência.

Em Authentication > URL Configuration, configure Site URL com a URL do site e
permita o callback `https://checklist-rosy-eight.vercel.app/auth/callback`.
O primeiro administrador ainda precisa ser criado com e-mail confirmado e senha
própria. Não reutilize as contas/senhas de demonstração. Para criação controlada,
o script `scripts/seed-supabase.mjs` aceita `SEED_ADMIN_EMAIL` e
`SEED_ADMIN_PASSWORD` no ambiente do servidor e a chave de servidor acima.
Antes de usá-lo, revise os modelos iniciais que o script também cadastra.

## Verificação

`supabase/tests/permissions.sql` verifica acesso por loja, escalada de privilégio,
usuários inativos, geração idempotente, fotos obrigatórias e bloqueio de RPCs
anônimos. Os dados de teste são descartados por `ROLLBACK`.
As credenciais reais, o login, o upload de fotos e a persistência após novo deploy
precisam ser validados depois da conexão da Vercel.
