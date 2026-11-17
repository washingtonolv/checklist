# Classificação das lojas

A página de lojas separa a rede por região (Rio de Janeiro / Nordeste) e, no Rio, por tipo (D&D Multimarcas / Franquias Natura). As contagens usam apenas as lojas às quais o usuário já tem acesso. Lista/grade e links de criação preservam o grupo selecionado. As lojas inativas continuam disponíveis para consulta.

`stores.region` e `stores.operation_type` são campos persistidos e editáveis por administradores. Alterar nomes, códigos, gerentes ou supervisores não recalcula a classificação. Novos cadastros exigem região e tipo; a combinação Nordeste/Franquias Natura é rejeitada no formulário, no backend e no banco, conforme a organização aprovada.

A migração `20261117033318_store_classification.sql` faz a classificação inicial uma única vez:

- Nomes com PB seguido de hífen → Nordeste / D&D Multimarcas.
- Demais lojas vinculadas à supervisora Layane Andrade → Rio de Janeiro / Franquias Natura.
- Demais lojas, incluindo LOJA TESTE → Rio de Janeiro / D&D Multimarcas.

A identificação da Layane usa o nome completo e o perfil de supervisora existentes no cadastro. Antes da aplicação em produção, revisar os vínculos atuais e confirmar a distribuição prevista (na revisão: 28 RJ, sendo 9 Natura e 19 D&D, e 5 Nordeste; total inclui LOJA TESTE). A migração não remove registros, não altera responsáveis, IDs, atividades ou históricos e mantém as regras de acesso existentes. A classificação não fica vinculada permanentemente à usuária Layane.

## Versão de teste e liberação

O preview da Vercel usa dados fictícios locais isolados. O conjunto de demonstração contém um exemplo de cada grupo para permitir a revisão da navegação e dos formulários.

A migração foi validada com PostgreSQL embarcado, carregando o esquema real e as políticas de acesso. Os testes cobrem a classificação inicial, a precedência de PB, a independência de nomes/vínculos, as combinações válidas e a manutenção das permissões. Há também testes de persistência local e de preservação de atividades.

Nenhuma migração remota deve ser aplicada para disponibilizar esse preview. Após aprovação explícita, salvar uma cópia dos registros de produção, aplicar a migração, conferir a distribuição, preservar uma comparação dos IDs/responsáveis/históricos e só então publicar o código (que depende das novas colunas).
