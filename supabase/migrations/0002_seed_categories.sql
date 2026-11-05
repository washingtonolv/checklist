-- Categorias padrão do Checklist Operacional D&D.
-- Os modelos de tarefas são criados pelo script scripts/seed-supabase.mjs,
-- pois precisam ser vinculados às lojas existentes no projeto.

insert into public.categories (name, description, active, sort_order)
values
  ('Organização de Estoque', 'Organização, separação e identificação do estoque', true, 1),
  ('Organização de Produtos e Prateleiras', 'Exposição, abastecimento e precificação', true, 2),
  ('Limpeza e Conservação', 'Limpeza e conservação geral da loja', true, 3),
  ('Comunicação Visual', 'Mural, campanhas e materiais informativos', true, 4),
  ('Rotinas Administrativas', 'Controles internos e solicitações da gestão', true, 5)
on conflict (name) do nothing;

