/**
 * Popula um projeto Supabase com categorias, modelos padrão e, opcionalmente,
 * dados de demonstração (lojas e usuários).
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npm run seed:supabase
 *
 * Para criar lojas e usuários de demonstração, defina também:
 *   SEED_DEMO_DATA=true
 *   SEED_SUPERVISOR_EMAIL=... SEED_SUPERVISOR_PASSWORD=...
 *   SEED_MANAGER_EMAIL=... SEED_MANAGER_PASSWORD=...
 *
 * A service role key é usada apenas neste script local. Nunca a exponha no frontend.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const demoMode = process.env.SEED_DEMO_DATA === "true";

if (!url || !serviceRoleKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
if (!adminEmail || !adminPassword) {
  console.error("Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD para o usuário administrador.");
  process.exit(1);
}
if (demoMode && (!process.env.SEED_SUPERVISOR_EMAIL || !process.env.SEED_SUPERVISOR_PASSWORD || !process.env.SEED_MANAGER_EMAIL || !process.env.SEED_MANAGER_PASSWORD)) {
  console.error("Com SEED_DEMO_DATA=true, defina SEED_SUPERVISOR_EMAIL/PASSWORD e SEED_MANAGER_EMAIL/PASSWORD.");
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const categories = [
  { name: "Organização de Estoque", description: "Organização, separação e identificação do estoque", sortOrder: 1 },
  { name: "Organização de Produtos e Prateleiras", description: "Exposição, abastecimento e precificação", sortOrder: 2 },
  { name: "Limpeza e Conservação", description: "Limpeza e conservação geral da loja", sortOrder: 3 },
  { name: "Comunicação Visual", description: "Mural, campanhas e materiais informativos", sortOrder: 4 },
  { name: "Rotinas Administrativas", description: "Controles internos e solicitações da gestão", sortOrder: 5 }
];

const templates = [
  { category: "Organização de Estoque", title: "Organização geral do estoque", description: "Manter o estoque limpo, acessível e com corredores livres.", recurrence: "daily", photoRequirement: "required", dueTime: "10:00" },
  { category: "Organização de Estoque", title: "Separação de produtos por categorias", description: "Separar os produtos por categoria e família.", recurrence: "weekly", photoRequirement: "required", dueTime: "11:00" },
  { category: "Organização de Estoque", title: "Identificação correta dos produtos", description: "Conferir etiquetas e identificações de todos os produtos.", recurrence: "weekly", photoRequirement: "optional", dueTime: "11:30" },
  { category: "Organização de Estoque", title: "Organização de caixas e materiais", description: "Empilhar caixas com segurança e organizar materiais de apoio.", recurrence: "weekly", photoRequirement: "required", dueTime: "12:00" },
  { category: "Organização de Estoque", title: "Verificação de produtos parados", description: "Identificar produtos sem movimentação e reportar à gestão.", recurrence: "monthly", photoRequirement: "optional", dueTime: "15:00" },
  { category: "Organização de Estoque", title: "Conferência de produtos sem identificação", description: "Localizar e identificar produtos sem etiqueta ou código.", recurrence: "weekly", photoRequirement: "required", dueTime: "14:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Organização dos produtos nas prateleiras", description: "Alinhar, agrupar e organizar os produtos nas prateleiras.", recurrence: "daily", photoRequirement: "required", dueTime: "10:30" },
  { category: "Organização de Produtos e Prateleiras", title: "Produtos posicionados corretamente", description: "Conferir posicionamento conforme o plano de exposição.", recurrence: "daily", photoRequirement: "optional", dueTime: "11:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Exposição conforme padrão da marca", description: "Validar a exposição visual conforme o padrão D&D.", recurrence: "weekly", photoRequirement: "required", dueTime: "12:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Abastecimento de produtos", description: "Repor produtos faltantes e manter a exposição completa.", recurrence: "daily", photoRequirement: "optional", dueTime: "09:30" },
  { category: "Organização de Produtos e Prateleiras", title: "Verificação de precificação", description: "Conferir etiquetas de preço e promover correções.", recurrence: "weekly", photoRequirement: "required", dueTime: "13:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Organização de displays e materiais promocionais", description: "Organizar displays e materiais de campanha.", recurrence: "weekly", photoRequirement: "required", dueTime: "14:00" },
  { category: "Limpeza e Conservação", title: "Limpeza de prateleiras", description: "Limpar prateleiras e remover poeira dos produtos.", recurrence: "daily", photoRequirement: "required", dueTime: "09:00" },
  { category: "Limpeza e Conservação", title: "Limpeza de balcões", description: "Limpar balcões, caixa e áreas de atendimento.", recurrence: "daily", photoRequirement: "optional", dueTime: "09:30" },
  { category: "Limpeza e Conservação", title: "Limpeza e organização do estoque", description: "Limpar o estoque e manter o ambiente seguro.", recurrence: "weekly", photoRequirement: "required", dueTime: "16:00" },
  { category: "Limpeza e Conservação", title: "Limpeza da área de atendimento", description: "Limpar piso, vidros e área de circulação.", recurrence: "daily", photoRequirement: "none", dueTime: "10:00" },
  { category: "Limpeza e Conservação", title: "Conservação geral da loja", description: "Verificar iluminação, mobiliário e conservação geral.", recurrence: "monthly", photoRequirement: "optional", dueTime: "17:00" },
  { category: "Comunicação Visual", title: "Atualização do mural", description: "Atualizar o mural de comunicados internos.", recurrence: "weekly", photoRequirement: "required", dueTime: "10:00" },
  { category: "Comunicação Visual", title: "Retirada de comunicados antigos", description: "Remover comunicados e materiais vencidos.", recurrence: "weekly", photoRequirement: "optional", dueTime: "10:30" },
  { category: "Comunicação Visual", title: "Atualização de campanhas", description: "Aplicar as campanhas vigentes conforme orientação.", recurrence: "monthly", photoRequirement: "required", dueTime: "11:00" },
  { category: "Comunicação Visual", title: "Organização de materiais informativos", description: "Organizar folders, cartazes e materiais informativos.", recurrence: "weekly", photoRequirement: "optional", dueTime: "11:30" },
  { category: "Rotinas Administrativas", title: "Conferência de informações", description: "Conferir informações operacionais e registros internos.", recurrence: "daily", photoRequirement: "none", dueTime: "17:00" },
  { category: "Rotinas Administrativas", title: "Atualização de controles internos", description: "Atualizar planilhas e controles da loja.", recurrence: "weekly", photoRequirement: "optional", dueTime: "17:30" },
  { category: "Rotinas Administrativas", title: "Verificação de comunicados", description: "Ler e confirmar os comunicados da gestão.", recurrence: "daily", photoRequirement: "none", dueTime: "18:00" },
  { category: "Rotinas Administrativas", title: "Cumprimento de atividades solicitadas pela gestão", description: "Executar as solicitações encaminhadas pela gerência comercial.", recurrence: "once", photoRequirement: "optional", dueTime: "18:00" }
];

function fail(context, error) {
  console.error(`${context}:`, error?.message ?? error);
  process.exit(1);
}

async function ensureUser({ email, password, name, role }) {
  const { data: existing, error: lookupError } = await admin
    .from("profiles")
    .select("id,email")
    .ilike("email", email)
    .maybeSingle();
  if (lookupError) fail("Erro ao consultar perfil", lookupError);

  let id = existing?.id;
  if (!id) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role }
    });
    if (error) fail(`Erro ao criar usuário ${email}`, error);
    id = data.user.id;
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id,
    name,
    email,
    role,
    active: true
  });
  if (profileError) fail(`Erro ao salvar perfil ${email}`, profileError);
  return id;
}

async function main() {
  console.log("Semeando categorias...");
  const { data: categoryRows, error: categoryError } = await admin
    .from("categories")
    .upsert(
      categories.map((category) => ({
        name: category.name,
        description: category.description,
        sort_order: category.sortOrder,
        active: true
      })),
      { onConflict: "name" }
    )
    .select("id,name");
  if (categoryError) fail("Erro ao criar categorias", categoryError);

  const categoryByName = new Map((categoryRows ?? []).map((row) => [row.name, row.id]));

  console.log("Criando usuário administrador...");
  const adminId = await ensureUser({
    email: adminEmail,
    password: adminPassword,
    name: process.env.SEED_ADMIN_NAME || "Gerente Comercial",
    role: "admin"
  });

  let storeIds = [];
  if (demoMode) {
    console.log("Criando lojas e usuários de demonstração...");
    const supervisorId = await ensureUser({
      email: process.env.SEED_SUPERVISOR_EMAIL,
      password: process.env.SEED_SUPERVISOR_PASSWORD,
      name: process.env.SEED_SUPERVISOR_NAME || "Supervisor(a) Regional",
      role: "supervisor"
    });
    const managerId = await ensureUser({
      email: process.env.SEED_MANAGER_EMAIL,
      password: process.env.SEED_MANAGER_PASSWORD,
      name: process.env.SEED_MANAGER_NAME || "Gerente de Loja",
      role: "manager"
    });

    const demoStores = [
      { name: "D&D Centro (demonstração)", code: "LOJA-001" },
      { name: "D&D Shopping (demonstração)", code: "LOJA-002" },
      { name: "D&D Matriz (demonstração)", code: "LOJA-003" }
    ];
    const { data: storeRows, error: storeError } = await admin
      .from("stores")
      .upsert(
        demoStores.map((store, index) => ({
          name: store.name,
          code: store.code,
          active: true,
          manager_id: index === 0 ? managerId : null
        })),
        { onConflict: "code" }
      )
      .select("id,code");
    if (storeError) fail("Erro ao criar lojas", storeError);
    storeIds = (storeRows ?? []).map((store) => store.id);

    const { error: supervisorError } = await admin.from("store_supervisors").upsert(
      storeIds.map((storeId) => ({ store_id: storeId, supervisor_id: supervisorId })),
      { onConflict: "store_id,supervisor_id" }
    );
    if (supervisorError) fail("Erro ao vincular supervisor", supervisorError);
  } else {
    const { data: storeRows, error: storeError } = await admin.from("stores").select("id").eq("active", true);
    if (storeError) fail("Erro ao consultar lojas", storeError);
    storeIds = (storeRows ?? []).map((store) => store.id);
  }

  console.log("Criando modelos de tarefas...");
  const { data: existingTemplates, error: existingError } = await admin
    .from("task_templates")
    .select("id,title,category_id");
  if (existingError) fail("Erro ao consultar modelos", existingError);
  const existingKeys = new Set((existingTemplates ?? []).map((row) => `${row.category_id}::${row.title}`));
  const today = new Date().toISOString().slice(0, 10);

  const templateRows = [];
  for (const template of templates) {
    const categoryId = categoryByName.get(template.category);
    if (!categoryId) continue;
    const key = `${categoryId}::${template.title}`;
    if (existingKeys.has(key)) continue;
    templateRows.push({
      title: template.title,
      description: template.description,
      category_id: categoryId,
      recurrence: template.recurrence,
      due_time: template.dueTime,
      once_due_date: template.recurrence === "once" ? today : null,
      photo_requirement: template.photoRequirement,
      active: true,
      created_by: adminId
    });
  }

  let createdTemplateIds = [];
  if (templateRows.length) {
    const { data: inserted, error: insertError } = await admin
      .from("task_templates")
      .insert(templateRows)
      .select("id");
    if (insertError) fail("Erro ao criar modelos", insertError);
    createdTemplateIds = (inserted ?? []).map((row) => row.id);
  }

  const allTemplateIds = [...new Set([...(existingTemplates ?? []).map((row) => row.id), ...createdTemplateIds])];
  if (storeIds.length && allTemplateIds.length) {
    const links = allTemplateIds.flatMap((templateId) =>
      storeIds.map((storeId) => ({ template_id: templateId, store_id: storeId }))
    );
    const { error: linkError } = await admin
      .from("template_stores")
      .upsert(links, { onConflict: "template_id,store_id" });
    if (linkError) fail("Erro ao vincular modelos às lojas", linkError);
  }

  console.log("");
  console.log("Seed concluído.");
  console.log(`- Categorias: ${categories.length}`);
  console.log(`- Modelos novos: ${createdTemplateIds.length}`);
  console.log(`- Lojas vinculadas: ${storeIds.length}`);
  if (!storeIds.length) {
    console.log("- Nenhuma loja encontrada: os modelos ficaram sem vínculo até você cadastrar lojas.");
  }
  console.log("- Gere as atividades no painel ou aguarde o cron /api/cron/gerar.");
}

main().catch((error) => fail("Falha inesperada", error));

