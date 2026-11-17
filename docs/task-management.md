# Gerenciamento de Tarefas — revisão e publicação

A página `/gerenciamento-tarefas` reúne as abas Modelos de Tarefas e Categorias. Os endereços antigos redirecionam para a aba correspondente; links de edição existentes continuam funcionando.

## Regras

- Administradores ativos criam, editam, arquivam e restauram registros.
- Em Supabase, somente o Administrador Geral pode excluir definitivamente, tanto pela aplicação quanto pela API do banco. No modo local de demonstração, administradores podem testar a exclusão em dados fictícios.
- Modelos sem categoria usam `NULL`, sem categoria artificial. A geração, os indicadores e os relatórios aceitam esse valor.
- Modelos com qualquer atividade gerada não podem ser excluídos, mesmo pendente. Arquivar interrompe novas gerações e mantém atividades, execuções, observações e fotos.
- Categorias com modelos exigem reclassificação dos modelos (inclusive arquivados) antes da exclusão. Categorias referenciadas por atividades também não podem ser excluídas: devem ser arquivadas.
- Arquivar uma categoria impede sua seleção em novos vínculos. Os modelos já vinculados mantêm seu próprio status e podem continuar gerando atividades. A edição mantém a categoria arquivada atual até que o administrador escolha outra.
- Categorias arquivadas continuam legíveis nos históricos das lojas autorizadas.
- Salvar modelo e vínculos com lojas no Supabase é uma única transação. Falhas não deixam modelo parcial nem apagam vínculos anteriores. A auditoria de exclusão é transacional.
- Criar uma categoria no formulário do modelo mantém o título, orientações e seleção de lojas já preenchidos.

## Validação

`npm test` executa os testes existentes, os testes do backend local e testes SQL com PostgreSQL embarcado (PGlite). Estes carregam o esquema real e a nova migração, com representações locais apenas dos serviços Auth/Storage pertencentes ao Supabase. Cobrem RLS, chaves estrangeiras, geração sem categoria, preservação de históricos, exclusão auditada e rollback de modelo/lojas.

`npm run typecheck` e `npm run build` verificam tipos e compilação. A configuração atual do repositório ignora lint durante o build e ainda não inclui configuração ESLint; isso é uma limitação anterior a esta alteração.

## Produção — somente após aprovação explícita

1. Revisar e aprovar o PR e a versão de teste.
2. Fazer backup e aplicar `supabase/migrations/20261117021603_task_management.sql` ao ambiente aprovado. A migração é aditiva: torna categoria opcional, restringe exclusão e adiciona a função de salvamento transacional. Não apaga linhas existentes.
3. Validar no ambiente de homologação com autenticação Supabase real. Os testes SQL locais não substituem essa validação de infraestrutura.
4. Publicar a aplicação compatível com a migração. A versão nova depende da função `save_task_template`; aplicar a migração antes de liberar o código.
5. Conferir cadastro, edição, arquivamento/restauração e visibilidade do histórico com um gerente e um administrador.

Previews da Vercel já usam o backend local isolado, mesmo se herdarem variáveis do Supabase. Nenhuma migração deve ser aplicada à produção para preparar o preview.
