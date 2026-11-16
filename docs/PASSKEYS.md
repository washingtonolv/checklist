# Biometria / chaves de acesso na Cloudflare

Integração nativa Supabase Auth (WebAuthn/passkeys, recurso experimental). Não usa serviço externo de biometria, plano pago ou tabela própria de credenciais. A digital/face permanece no aparelho; o Supabase guarda a chave pública. PIN, gerenciador de senhas e chave física também podem ser oferecidos pelo sistema operacional.

## Escopo e configuração

- Apenas a branch `cloudflare-workers-preview` e o Worker `checklist-dd`.
- Não fazer merge na `main`, publicar na Vercel ou mudar a Site URL, URLs de redirecionamento e login por senha existentes.
- O Supabase atual é compartilhado: a ativação do provedor é uma configuração **aditiva do Auth nesse projeto**, não uma alteração de credenciais ou de dados das contas. A Vercel permanece com seu código e login por senha.
- No Dashboard, organização `washingtonolv's Org` **Free**, projeto `Checklist D&D`, Authentication → Passkeys:
  - Enable Passkey authentication: ligado.
  - Display Name: `Checklist D&D`.
  - RP ID: `checklist-dd.checklist-operacional-dd.workers.dev`.
  - RP Origins: `https://checklist-dd.checklist-operacional-dd.workers.dev`.
- Ativar a variável de servidor `PASSKEYS_ENABLED=true` somente no Worker definitivo (`PHOTO_ENV=cloudflare`, sem `VERCEL_ENV`). O ambiente de exemplo e a prévia local mantêm o recurso desligado.
- A interface só oferece cadastro/login no endereço HTTPS exato acima e em navegador com WebAuthn. Não usar `workers.dev` como RP ID, wildcard ou o domínio da Vercel. Alterar o domínio/RP ID exige planejamento e pode exigir novo cadastro das chaves.

## Uso

1. Entrar com e-mail/usuário e senha como sempre.
2. Em Meu perfil → Biometria e chaves de acesso, selecionar **Ativar biometria / cadastrar chave**.
3. O próprio usuário confirma no aparelho e escolhe onde guardar a chave. Cadastrar somente em aparelho/gerenciador confiável.
4. Nos próximos acessos, selecionar **Entrar com biometria ou chave de acesso**. Não é necessário preencher usuário nesse fluxo.
5. No perfil, consultar/remover chaves. A remoção exige confirmação e não apaga a senha. Apagar a chave no app revoga sua utilização; o sistema operacional pode continuar mostrando a cópia local até o usuário removê-la também.

Não há criação aberta de usuários por esse fluxo. O cadastro requer usuário confirmado e autenticado. Após a autenticação WebAuthn, o servidor aplica o mesmo `getUser` + perfil ativo + permissões por loja do login com senha. Uma conta inativa não ganha acesso por ter uma chave. Cadastro não muda funções ou vínculos de loja. Nunca autorizar por `user_metadata`.

## Sessão e dependências

`@supabase/supabase-js` fixado em 2.119.0 (passkeys exige >=2.105.0) e `@supabase/ssr` em 0.12.7, com lockfile. O cliente de navegador usa cookies do SSR, não uma sessão paralela em localStorage. O middleware verifica o usuário, mantém cookies nos redirecionamentos e impede cache compartilhado de respostas de autenticação. A senha continua usando o formulário e a ação existentes.

Como o recurso é experimental, revisar changelog e tipos do SDK antes de atualizá-lo. A chave de serviço nunca é enviada ao navegador. Não registrar tokens, desafios, respostas WebAuthn ou nomes privados de aparelhos nos logs.

## Verificação

- Testes: escopo Cloudflare/flag; suporte e origem; cancelamento e mensagens sem detalhes internos; proteção de redirecionamento; perfil ativo/inativo; cookies compatíveis entre cliente e servidor usando os SDKs reais e rede simulada.
- Suíte completa, typecheck, build Next e verificações OpenNext/workerd no CI antes da publicação automática.
- Conferência final no aparelho real: o titular precisa cadastrar sua própria chave, sair e entrar pelo novo botão, cancelar um prompt e confirmar a alternativa por senha. O agente não cadastra uma credencial real em nome do titular.

## Custo e reversão

O Dashboard disponibilizou a configuração na organização Free sem pedir upgrade. Não se contrata serviço pago para esta implementação. Continuam valendo as quotas normais de Auth/Workers do plano existente; isso não torna o consumo da infraestrutura ilimitado.

Para desativar a interface rapidamente, definir `PASSKEYS_ENABLED=false` no Worker e publicar a mesma branch. Não remover credenciais dos usuários para fazer rollback. O login com senha permanece disponível. A política de origem não interfere nas fotos R2, expiração ou permissões das lojas.

Fontes: https://supabase.com/docs/guides/auth/passkeys e https://supabase.com/docs/guides/auth/server-side/creating-a-client
