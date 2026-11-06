# Checklist Operacional D&D — Código-fonte consolidado

Documento Markdown gerado a partir do projeto original compactado. Contém os arquivos de código e configuração relevantes, organizados por caminho.

> **Observação:** dependências (`node_modules`), compilados (`.next`), dados locais (`.local`), imagens e outros arquivos binários foram excluídos. O arquivo `.env.example` também foi omitido por precaução. Este `.md` é uma representação para leitura e referência, não um projeto executável.

**Total de arquivos de texto incluídos:** 90.

## Índice dos arquivos

- `.gitignore`
- `middleware.ts`
- `next.config.mjs`
- `package.json`
- `postcss.config.mjs`
- `scripts/generate-logo.mjs`
- `scripts/seed-supabase.mjs`
- `src/actions/auth.ts`
- `src/actions/categories.ts`
- `src/actions/state.ts`
- `src/actions/stores.ts`
- `src/actions/tasks.ts`
- `src/actions/templates.ts`
- `src/actions/users.ts`
- `src/app/(app)/atividades/[id]/page.tsx`
- `src/app/(app)/atividades/page.tsx`
- `src/app/(app)/categorias/[id]/editar/page.tsx`
- `src/app/(app)/categorias/page.tsx`
- `src/app/(app)/historico/page.tsx`
- `src/app/(app)/layout.tsx`
- `src/app/(app)/lojas/[id]/editar/page.tsx`
- `src/app/(app)/lojas/[id]/page.tsx`
- `src/app/(app)/lojas/nova/page.tsx`
- `src/app/(app)/lojas/page.tsx`
- `src/app/(app)/modelos/[id]/editar/page.tsx`
- `src/app/(app)/modelos/novo/page.tsx`
- `src/app/(app)/modelos/page.tsx`
- `src/app/(app)/painel/page.tsx`
- `src/app/(app)/perfil/page.tsx`
- `src/app/(app)/relatorios/page.tsx`
- `src/app/(app)/usuarios/[id]/editar/page.tsx`
- `src/app/(app)/usuarios/novo/page.tsx`
- `src/app/(app)/usuarios/page.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/recuperar-senha/page.tsx`
- `src/app/(auth)/redefinir-senha/page.tsx`
- `src/app/api/cron/gerar/route.ts`
- `src/app/api/evidencias/[...path]/route.ts`
- `src/app/api/health/route.ts`
- `src/app/auth/callback/route.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/auth/ForgotPasswordForm.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/ProfilePasswordForm.tsx`
- `src/components/auth/ResetPasswordForm.tsx`
- `src/components/brand/Logo.tsx`
- `src/components/forms/CategoryForm.tsx`
- `src/components/forms/StoreForm.tsx`
- `src/components/forms/TemplateForm.tsx`
- `src/components/forms/UserForm.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/photos/PhotoGallery.tsx`
- `src/components/photos/PhotoUploader.tsx`
- `src/components/reports/ReportExport.tsx`
- `src/components/tasks/GenerateTasksButton.tsx`
- `src/components/tasks/ObservationForm.tsx`
- `src/components/tasks/TaskActions.tsx`
- `src/components/ui/badges.tsx`
- `src/components/ui/index.tsx`
- `src/lib/access.ts`
- `src/lib/auth-server.ts`
- `src/lib/backend/index.ts`
- `src/lib/backend/local/auth.ts`
- `src/lib/backend/local/db.ts`
- `src/lib/backend/local/index.ts`
- `src/lib/backend/local/seed.ts`
- `src/lib/backend/local/session.ts`
- `src/lib/backend/supabase/index.ts`
- `src/lib/backend/types.ts`
- `src/lib/constants.ts`
- `src/lib/dashboard.ts`
- `src/lib/dates.ts`
- `src/lib/image-client.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/config.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/lib/types.ts`
- `src/lib/utils.ts`
- `src/lib/validation.ts`
- `supabase/migrations/0001_schema.sql`
- `supabase/migrations/0002_seed_categories.sql`
- `tailwind.config.ts`
- `tests/local-backend.test.ts`
- `tsconfig.json`
- `vercel.json`
- `vitest.config.ts`

---

## Conteúdo dos arquivos

### `.gitignore`

````text
# dependências
/node_modules
/.pnp
.pnp.js

# builds
/.next/
/out/
/build
*.tsbuildinfo
next-env.d.ts

# ambiente
.env
.env.local
.env.*.local

# modo local (dados e evidências de desenvolvimento)
/.local/
/.local-test/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# sistema
.DS_Store
Thumbs.db

# Vercel
.vercel
````

### `middleware.ts`

````typescript
import type { NextRequest } from "next/server";
import { updateSession } from "./src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)"
  ]
};
````

### `next.config.mjs`

````javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb"
    }
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
````

### `package.json`

````json
{
  "name": "checklist-operacional-dd",
  "version": "1.0.0",
  "private": true,
  "description": "Checklist Operacional D&D - plataforma de gestão de rotinas operacionais das lojas",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "seed:supabase": "node scripts/seed-supabase.mjs",
    "logo": "node scripts/generate-logo.mjs"
  },
  "dependencies": {
    "@supabase/ssr": "0.5.2",
    "@supabase/supabase-js": "2.45.4",
    "bcryptjs": "2.4.3",
    "clsx": "2.1.1",
    "jose": "5.9.6",
    "jspdf": "2.5.2",
    "jspdf-autotable": "3.8.4",
    "lucide-react": "0.454.0",
    "next": "^14.2.35",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "sharp": "0.33.5",
    "sonner": "1.7.0",
    "tailwind-merge": "2.5.4",
    "xlsx": "0.18.5",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "2.4.6",
    "@types/node": "22.9.0",
    "@types/react": "18.3.12",
    "@types/react-dom": "18.3.1",
    "autoprefixer": "10.4.20",
    "eslint": "8.57.1",
    "eslint-config-next": "^14.2.35",
    "postcss": "8.4.47",
    "tailwindcss": "3.4.14",
    "typescript": "5.6.3",
    "vitest": "2.1.4"
  }
}
````

### `postcss.config.mjs`

````javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
````

### `scripts/generate-logo.mjs`

````javascript
// Gera os arquivos PNG da marca a partir dos SVGs oficiais.
// Substitua public/brand/logo-dd.svg pela logo oficial, se desejar,
// e execute: npm run logo
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const brandDir = path.join(root, "public", "brand");
await mkdir(brandDir, { recursive: true });

const logoSvg = path.join(brandDir, "logo-dd.svg");
const markSvg = path.join(brandDir, "logo-dd-mark.svg");

await sharp(logoSvg).resize({ width: 1200 }).png().toFile(path.join(brandDir, "logo-dd.png"));
await sharp(logoSvg).resize({ width: 480 }).png().toFile(path.join(brandDir, "logo-dd-small.png"));
await sharp(markSvg).resize({ width: 512 }).png().toFile(path.join(brandDir, "logo-dd-mark.png"));
await sharp(markSvg).resize({ width: 64 }).png().toFile(path.join(root, "src", "app", "icon.png"));

console.log("Logo PNG gerada em public/brand e src/app/icon.png");
````

### `scripts/seed-supabase.mjs`

````javascript
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
      user_metadata: { name, role }
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
````

### `src/actions/auth.ts`

````typescript
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getBackend, isLocalMode } from "@/lib/backend";
import { loginSchema, newPasswordSchema, resetRequestSchema } from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/painel";
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    await getBackend().auth.signIn(parsed.data.email, parsed.data.password);
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "E-mail ou senha inválidos.") };
  }
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await getBackend().auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const result = await getBackend().auth.requestPasswordReset(parsed.data.email);
    return {
      ok: true,
      message: isLocalMode()
        ? "Solicitação registrada. No modo local, use o link abaixo para redefinir a senha."
        : "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.",
      resetUrl: result.resetUrl
    };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível solicitar a recuperação.") };
  }
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  const token = String(formData.get("token") ?? "");
  try {
    if (isLocalMode()) {
      if (!token) return { ok: false, error: "Link de recuperação inválido." };
      await getBackend().auth.resetPasswordWithToken(token, parsed.data.password);
    } else {
      await getBackend().auth.updatePassword(parsed.data.password);
    }
    return { ok: true, message: "Senha atualizada. Você já pode entrar com a nova senha." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível atualizar a senha.") };
  }
}

export async function updatePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    await getBackend().auth.updatePassword(parsed.data.password);
    return { ok: true, message: "Senha atualizada com sucesso." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível atualizar a senha.") };
  }
}
````

### `src/actions/categories.ts`

````typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getBackend } from "@/lib/backend";
import { requireAdmin } from "@/lib/auth-server";
import { categorySchema, formString, parseBoolean } from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const id = formString(formData.get("id"));
  const parsed = categorySchema.safeParse({
    name: formString(formData.get("name")),
    description: formString(formData.get("description")),
    active: parseBoolean(formData.get("active")),
    sortOrder: formString(formData.get("sortOrder")) || "0"
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const backend = getBackend();
    if (id) await backend.updateCategory(actor, id, parsed.data);
    else await backend.createCategory(actor, parsed.data);
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível salvar a categoria.") };
  }
  revalidatePath("/categorias");
  revalidatePath("/modelos");
  redirect(`/categorias?sucesso=${encodeURIComponent(id ? "Categoria atualizada." : "Categoria criada.")}`);
}
````

### `src/actions/state.ts`

````typescript
export interface ActionState {
  ok: boolean;
  error?: string;
  message?: string;
  resetUrl?: string;
}

export const initialActionState: ActionState = { ok: false };
````

### `src/actions/stores.ts`

````typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getBackend } from "@/lib/backend";
import { requireAdmin } from "@/lib/auth-server";
import { formString, formStringArray, parseBoolean, storeSchema } from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function saveStoreAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const id = formString(formData.get("id"));
  const parsed = storeSchema.safeParse({
    name: formString(formData.get("name")),
    code: formString(formData.get("code")),
    managerId: formString(formData.get("managerId")) || null,
    supervisorIds: formStringArray(formData, "supervisorIds"),
    active: parseBoolean(formData.get("active"))
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const backend = getBackend();
    if (id) {
      await backend.updateStore(actor, id, parsed.data);
    } else {
      await backend.createStore(actor, parsed.data);
    }
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível salvar a loja.") };
  }
  revalidatePath("/lojas");
  revalidatePath("/painel");
  revalidatePath("/usuarios");
  redirect(`/lojas?sucesso=${encodeURIComponent(id ? "Loja atualizada com sucesso." : "Loja cadastrada com sucesso.")}`);
}
````

### `src/actions/tasks.ts`

````typescript
"use server";

import { revalidatePath } from "next/cache";
import { getBackend } from "@/lib/backend";
import { requireUser } from "@/lib/auth-server";
import { completeTaskSchema, observationSchema } from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { TaskPhoto } from "@/lib/types";
import type { ActionState } from "./state";

function revalidateTask(taskId: string): void {
  revalidatePath(`/atividades/${taskId}`);
  revalidatePath("/atividades");
  revalidatePath("/painel");
  revalidatePath("/historico");
  revalidatePath("/relatorios");
}

export async function startTaskAction(taskId: string): Promise<ActionState> {
  const actor = await requireUser();
  try {
    await getBackend().startTask(actor, taskId);
    revalidateTask(taskId);
    return { ok: true, message: "Atividade iniciada." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function completeTaskAction(taskId: string, formData: FormData): Promise<ActionState> {
  const actor = await requireUser();
  const parsed = completeTaskSchema.safeParse({
    observation: String(formData.get("observation") ?? "")
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    await getBackend().completeTask(actor, taskId, parsed.data.observation);
    revalidateTask(taskId);
    return { ok: true, message: "Atividade concluída com sucesso." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function requestCorrectionAction(taskId: string, note: string): Promise<ActionState> {
  const actor = await requireUser();
  if (note.trim().length < 3) return { ok: false, error: "Descreva o motivo da correção." };
  try {
    await getBackend().requestCorrection(actor, taskId, note.trim());
    revalidateTask(taskId);
    return { ok: true, message: "Correção solicitada ao responsável." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function rejectTaskAction(taskId: string, note: string): Promise<ActionState> {
  const actor = await requireUser();
  if (note.trim().length < 3) return { ok: false, error: "Descreva o motivo da reprovação." };
  try {
    await getBackend().rejectTask(actor, taskId, note.trim());
    revalidateTask(taskId);
    return { ok: true, message: "Atividade reprovada." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function approveTaskAction(taskId: string, note: string): Promise<ActionState> {
  const actor = await requireUser();
  try {
    await getBackend().approveTask(actor, taskId, note.trim());
    revalidateTask(taskId);
    return { ok: true, message: "Execução aprovada." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function reopenTaskAction(taskId: string, note: string): Promise<ActionState> {
  const actor = await requireUser();
  try {
    await getBackend().reopenTask(actor, taskId, note.trim());
    revalidateTask(taskId);
    return { ok: true, message: "Atividade reaberta." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function addObservationAction(taskId: string, content: string): Promise<ActionState> {
  const actor = await requireUser();
  const parsed = observationSchema.safeParse({ content });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    await getBackend().addObservation(actor, taskId, parsed.data.content);
    revalidateTask(taskId);
    return { ok: true, message: "Observação registrada." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}

export async function uploadPhotoAction(
  taskId: string,
  formData: FormData
): Promise<ActionState & { photo?: TaskPhoto }> {
  const actor = await requireUser();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecione uma imagem para enviar." };
  }
  const original = formData.get("original");
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let originalInput: { buffer: Buffer; mimeType: string; sizeBytes: number } | undefined;
    if (original instanceof File && original.size > 0) {
      originalInput = {
        buffer: Buffer.from(await original.arrayBuffer()),
        mimeType: original.type || "image/jpeg",
        sizeBytes: original.size
      };
    }
    const photo = await getBackend().uploadPhoto(actor, taskId, {
      buffer,
      mimeType: file.type || "image/webp",
      originalName: file.name,
      sizeBytes: file.size,
      width: Number(formData.get("width")) || undefined,
      height: Number(formData.get("height")) || undefined,
      original: originalInput
    });
    revalidateTask(taskId);
    return { ok: true, message: "Foto enviada.", photo };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível enviar a foto.") };
  }
}

export async function deletePhotoAction(photoId: string): Promise<ActionState> {
  const actor = await requireUser();
  try {
    await getBackend().deletePhoto(actor, photoId);
    revalidatePath("/atividades");
    revalidatePath("/painel");
    revalidatePath("/relatorios");
    revalidatePath("/historico");
    return { ok: true, message: "Foto removida." };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error) };
  }
}
````

### `src/actions/templates.ts`

````typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getBackend } from "@/lib/backend";
import { requireAdmin } from "@/lib/auth-server";
import {
  formString,
  formStringArray,
  parseBoolean,
  templateSchema
} from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function saveTemplateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const id = formString(formData.get("id"));
  const parsed = templateSchema.safeParse({
    title: formString(formData.get("title")),
    description: formString(formData.get("description")),
    categoryId: formString(formData.get("categoryId")),
    recurrence: formString(formData.get("recurrence")),
    dueTime: formString(formData.get("dueTime")) || "18:00",
    onceDueDate: formString(formData.get("onceDueDate")) || null,
    photoRequirement: formString(formData.get("photoRequirement")),
    active: parseBoolean(formData.get("active")),
    storeIds: formStringArray(formData, "storeIds")
  });
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const backend = getBackend();
    const input = { ...parsed.data, onceDueDate: parsed.data.onceDueDate ?? null };
    if (id) await backend.updateTemplate(actor, id, input);
    else await backend.createTemplate(actor, input);
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível salvar o modelo de tarefa.") };
  }
  revalidatePath("/modelos");
  revalidatePath("/atividades");
  revalidatePath("/painel");
  redirect(`/modelos?sucesso=${encodeURIComponent(id ? "Modelo atualizado." : "Modelo criado.")}`);
}

export async function generateTasksAction(): Promise<ActionState> {
  const actor = await requireAdmin();
  try {
    const created = await getBackend().ensureGenerated(actor);
    revalidatePath("/atividades");
    revalidatePath("/painel");
    return {
      ok: true,
      message: created > 0 ? `${created} atividade(s) gerada(s).` : "Nenhuma atividade nova para gerar agora."
    };
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível gerar as atividades.") };
  }
}
````

### `src/actions/users.ts`

````typescript
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getBackend } from "@/lib/backend";
import { requireAdmin } from "@/lib/auth-server";
import {
  formString,
  formStringArray,
  parseBoolean,
  userCreateSchema,
  userUpdateSchema
} from "@/lib/validation";
import { safeErrorMessage } from "@/lib/utils";
import type { ActionState } from "./state";

function zodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos.";
}

export async function saveUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const id = formString(formData.get("id"));
  const raw = {
    name: formString(formData.get("name")),
    email: formString(formData.get("email")),
    password: formString(formData.get("password")),
    role: formString(formData.get("role")),
    active: parseBoolean(formData.get("active")),
    storeIds: formStringArray(formData, "storeIds")
  };
  const parsed = id
    ? userUpdateSchema.safeParse({ ...raw, password: raw.password || undefined })
    : userCreateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: zodMessage(parsed.error) };
  try {
    const backend = getBackend();
    if (id) {
      await backend.updateUser(actor, id, parsed.data);
    } else {
      if (!parsed.data.password) return { ok: false, error: "Informe a senha inicial." };
      await backend.createUser(actor, parsed.data);
    }
  } catch (error) {
    return { ok: false, error: safeErrorMessage(error, "Não foi possível salvar o usuário.") };
  }
  revalidatePath("/usuarios");
  revalidatePath("/lojas");
  redirect(`/usuarios?sucesso=${encodeURIComponent(id ? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso.")}`);
}
````

### `src/app/(app)/atividades/[id]/page.tsx`

````tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock3,
  History,
  Info,
  MessageSquare,
  ShieldCheck,
  Store,
  UserRound
} from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { ACTION_LABELS, RECURRENCE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { dueLabel, formatDate, formatDateTime, formatTime, isOverdue } from "@/lib/dates";
import type { TaskDetail } from "@/lib/types";
import { Card, CardHeader, PageHeader } from "@/components/ui";
import { PhotoBadge, StatusBadge } from "@/components/ui/badges";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import { PhotoUploader } from "@/components/photos/PhotoUploader";
import { TaskActions } from "@/components/tasks/TaskActions";
import { ObservationForm } from "@/components/tasks/ObservationForm";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const backend = getBackend();
  let task: TaskDetail | null = null;
  try {
    task = await backend.getTask(user, params.id);
  } catch {
    task = null;
  }
  if (!task) notFound();

  const canReview = user.role === "admin" || user.role === "supervisor";
  const canUpload = task.status !== "completed" || canReview;
  const overdue = isOverdue(task);
  const optimizedPhotos = task.photos.filter((photo) => !photo.isOriginal);
  const originalPhotos = task.photos.filter((photo) => photo.isOriginal);

  return (
    <div>
      <Link href="/atividades" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para atividades
      </Link>

      <PageHeader
        eyebrow={`${task.storeName} · ${task.storeCode}`}
        title={task.title}
        subtitle={task.description || "Sem descrição cadastrada."}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            {overdue ? (
              <span className="badge border border-pink bg-pink/5 text-pink">
                <AlertTriangle className="h-3.5 w-3.5" />
                Atrasada
              </span>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader title="Detalhes da atividade" icon={<ClipboardList className="h-4 w-4" />} />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <InfoRow icon={<Store className="h-4 w-4" />} label="Loja" value={`${task.storeName} (${task.storeCode})`} />
              <InfoRow icon={<ClipboardList className="h-4 w-4" />} label="Categoria" value={task.categoryName} />
              <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Periodicidade" value={RECURRENCE_LABELS[task.recurrence]} />
              <InfoRow icon={<Clock3 className="h-4 w-4" />} label="Prazo" value={dueLabel(task.dueDate, task.dueTime)} />
              <InfoRow icon={<Camera className="h-4 w-4" />} label="Evidência" value={<PhotoBadge requirement={task.photoRequirement} count={task.photoCount} />} />
              <InfoRow icon={<UserRound className="h-4 w-4" />} label="Responsável pela execução" value={task.completedByName ?? "Ainda não executada"} />
            </div>
            {task.observation ? (
              <div className="mx-5 mb-5 rounded-xl border border-pink/10 bg-turquesa/5 p-3 text-sm text-pink/75">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-pink/45">Última observação</p>
                {task.observation}
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader
              title="Evidências fotográficas"
              description={`${optimizedPhotos.length} foto(s) · armazenamento seguro`}
              icon={<Camera className="h-4 w-4" />}
              action={<PhotoBadge requirement={task.photoRequirement} count={task.photoCount} />}
            />
            <div className="space-y-4 p-5">
              <PhotoGallery photos={task.photos} canDelete={user.role === "admin"} emptyMessage="Nenhuma evidência anexada até o momento." />
              {originalPhotos.length ? (
                <p className="text-[11px] text-pink/45">
                  {originalPhotos.length} arquivo(s) original(is) preservado(s) para auditoria.
                </p>
              ) : null}
              {canUpload ? (
                <div className="rounded-xl border border-dashed border-pink/20 bg-turquesa/5 p-3">
                  <PhotoUploader taskId={task.id} photoCount={task.photoCount} required={task.photoRequirement === "required"} />
                </div>
              ) : (
                <p className="rounded-xl border border-pink/15 bg-pink/5 px-3 py-2 text-xs text-pink/60">
                  Atividade concluída. A inclusão de novas evidências exige reabertura pela supervisão.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Observações"
              description="Registros da loja e da supervisão"
              icon={<MessageSquare className="h-4 w-4" />}
            />
            <div className="space-y-4 p-5">
              {task.observations.length ? (
                <div className="space-y-3">
                  {task.observations.map((observation) => (
                    <div key={observation.id} className="rounded-xl border border-pink/10 p-3">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-pink/50">
                        <span className="font-bold text-pink/70">{observation.userName}</span>
                        <span>{formatDateTime(observation.createdAt)}</span>
                      </div>
                      <p className="text-sm text-pink/75">{observation.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-pink/50">Nenhuma observação registrada.</p>
              )}
              <ObservationForm taskId={task.id} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Histórico da execução"
              description="Quem fez, quando e com quais evidências"
              icon={<History className="h-4 w-4" />}
            />
            <div className="p-5">
              {task.executions.length ? (
                <ol className="relative space-y-5 border-l border-pink/15 pl-5">
                  {task.executions.map((execution) => (
                    <li key={execution.id} className="relative">
                      <span className="absolute -left-[27px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-turquesa" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-pink">{ACTION_LABELS[execution.action] ?? execution.action}</p>
                        <span className="text-[11px] text-pink/45">{formatDateTime(execution.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-pink/55">
                        {execution.userName}
                        {execution.previousStatus && execution.newStatus && execution.previousStatus !== execution.newStatus
                          ? ` · ${STATUS_LABELS[execution.previousStatus]} → ${STATUS_LABELS[execution.newStatus]}`
                          : ""}
                      </p>
                      {execution.note ? <p className="mt-1 text-sm text-pink/70">{execution.note}</p> : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-pink/50">Nenhum evento registrado.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Ações" description="Execute e revise esta atividade" icon={<ShieldCheck className="h-4 w-4" />} />
            <div className="p-5">
              <TaskActions
                taskId={task.id}
                status={task.status}
                photoCount={task.photoCount}
                photoRequired={task.photoRequirement === "required"}
                canReview={canReview}
                approved={Boolean(task.approvedAt)}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Resumo" icon={<Info className="h-4 w-4" />} />
            <div className="space-y-3 p-5 text-sm">
              <SummaryRow label="Prazo" value={`${formatDate(task.dueDate)} às ${formatTime(task.dueTime)}`} />
              <SummaryRow label="Concluída em" value={task.completedAt ? formatDateTime(task.completedAt) : "—"} />
              <SummaryRow label="Aprovada em" value={task.approvedAt ? formatDateTime(task.approvedAt) : "Aguardando revisão"} />
              <SummaryRow label="Fotos" value={`${task.photoCount} evidência(s)`} />
              <SummaryRow label="Período" value={task.periodKey} />
              {task.approvedAt ? (
                <p className="flex items-center gap-2 rounded-lg border border-turquesa/40 bg-turquesa/10 px-3 py-2 text-xs font-semibold text-pink">
                  <CheckCircle2 className="h-4 w-4" />
                  Execução aprovada
                </p>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Regras de segurança" icon={<ShieldCheck className="h-4 w-4" />} />
            <ul className="space-y-2 p-5 text-xs text-pink/60">
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />A conclusão é registrada com usuário, data e hora.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />Fotos obrigatórias bloqueiam a conclusão sem evidência.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />Correções e reprovações mantêm o histórico anterior.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />Somente a gerente comercial pode excluir evidências.</li>
            </ul>
          </Card>

          <Link href={`/lojas/${task.storeId}`} className={cn("btn-ghost w-full")}>
            <Store className="h-4 w-4" />
            Abrir histórico da loja
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-turquesa/15 text-pink">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-pink/45">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-pink/80">{value}</div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-pink/10 pb-2 last:border-0">
      <span className="text-xs text-pink/50">{label}</span>
      <span className="text-right text-xs font-semibold text-pink/80">{value}</span>
    </div>
  );
}
````

### `src/app/(app)/atividades/page.tsx`

````tsx
import Link from "next/link";
import { AlertTriangle, CalendarClock, Camera, CheckCircle2, ClipboardList, Filter, Search } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { dueLabel, formatDateTime, isOverdue, monthRange } from "@/lib/dates";
import type { TaskFilters, TaskStatus } from "@/lib/types";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { PhotoBadge, StatusBadge } from "@/components/ui/badges";
import { GenerateTasksButton } from "@/components/tasks/GenerateTasksButton";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function statusFrom(value: string | undefined): TaskStatus | "" {
  return value && STATUS_ORDER.includes(value as TaskStatus) ? (value as TaskStatus) : "";
}

export default async function TasksPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await requireUser();
  const backend = getBackend();
  const range = monthRange();
  const filters: TaskFilters = {
    storeId: typeof searchParams.storeId === "string" ? searchParams.storeId : "",
    categoryId: typeof searchParams.categoryId === "string" ? searchParams.categoryId : "",
    status: statusFrom(typeof searchParams.status === "string" ? searchParams.status : undefined),
    from: typeof searchParams.from === "string" && searchParams.from ? searchParams.from : range.from,
    to: typeof searchParams.to === "string" && searchParams.to ? searchParams.to : range.to,
    search: typeof searchParams.search === "string" ? searchParams.search : ""
  };

  if (user.role === "admin") {
    try {
      await backend.ensureGenerated(user);
    } catch {
      // cron é a fonte principal em produção
    }
  }

  const [stores, categories, tasks] = await Promise.all([
    backend.listStores(user),
    backend.listCategories(user),
    backend.listTasks(user, filters)
  ]);

  const tabParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) tabParams.set(key, String(value));
  }

  function tabHref(status: TaskStatus | "") {
    const params = new URLSearchParams(tabParams);
    if (status) params.set("status", status);
    else params.delete("status");
    return `/atividades?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Checklists operacionais"
        title="Atividades"
        subtitle="Execute, acompanhe e revise as rotinas das lojas com evidências fotográficas."
        actions={user.role === "admin" ? <GenerateTasksButton /> : null}
      />

      <Card className="mb-5 p-4">
        <form method="get" action="/atividades" className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <label className="label" htmlFor="search">Buscar atividade</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink/35" />
              <input id="search" name="search" defaultValue={filters.search} className="input pl-9" placeholder="Nome da atividade..." />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="storeId">Loja</label>
            <select id="storeId" name="storeId" defaultValue={filters.storeId} className="input">
              <option value="">Todas</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="categoryId">Categoria</label>
            <select id="categoryId" name="categoryId" defaultValue={filters.categoryId} className="input">
              <option value="">Todas</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="from">De</label>
            <input id="from" name="from" type="date" defaultValue={filters.from} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="to">Até</label>
            <input id="to" name="to" type="date" defaultValue={filters.to} className="input" />
          </div>
          <div className="flex items-end gap-2 xl:col-span-6">
            <button type="submit" className="btn-primary btn-sm">
              <Filter className="h-4 w-4" />
              Filtrar
            </button>
            <Link href="/atividades" className="btn-ghost btn-sm">Limpar</Link>
            <span className="ml-auto text-xs text-pink/50">{tasks.length} atividade(s) no período</span>
          </div>
        </form>
      </Card>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <Link
          href={tabHref("")}
          className={cn("shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold", !filters.status ? "border-pink bg-pink text-white" : "border-pink/15 bg-white text-pink/65 hover:border-turquesa")}
        >
          Todas
        </Link>
        {STATUS_ORDER.map((status) => (
          <Link
            key={status}
            href={tabHref(status)}
            className={cn("shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold", filters.status === status ? "border-pink bg-pink text-white" : "border-pink/15 bg-white text-pink/65 hover:border-turquesa")}
          >
            {STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      {tasks.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            return (
              <Link
                key={task.id}
                href={`/atividades/${task.id}`}
                className={cn(
                  "card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:border-turquesa hover:shadow-soft",
                  overdue && task.status !== "completed" ? "border-pink/40" : ""
                )}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={task.status} />
                  {overdue && task.status !== "completed" ? (
                    <span className="badge border border-pink bg-pink/5 text-pink">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Atrasada
                    </span>
                  ) : null}
                </div>
                <h2 className="text-base font-bold leading-snug text-pink group-hover:underline group-hover:decoration-turquesa group-hover:decoration-2 group-hover:underline-offset-4">
                  {task.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs text-pink/55">{task.description || "Sem descrição."}</p>
                <div className="mt-3 space-y-1.5 text-xs text-pink/60">
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-turquesa" />
                    {task.storeName} · {task.storeCode}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-pink/40" />
                    {task.categoryName}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5 text-pink/40" />
                    {dueLabel(task.dueDate, task.dueTime)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-pink/10 pt-3">
                  <PhotoBadge requirement={task.photoRequirement} count={task.photoCount} />
                  {task.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-pink/55">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {task.completedByName ?? "Concluída"}
                    </span>
                  ) : null}
                </div>
                {task.status === "completed" && task.completedAt ? (
                  <p className="mt-2 text-[10px] text-pink/40">{formatDateTime(task.completedAt)}</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="Nenhuma atividade encontrada"
            description="Ajuste os filtros, o período ou aguarde a geração automática das tarefas recorrentes."
            action={user.role === "admin" ? <GenerateTasksButton /> : <Link href="/painel" className="btn-ghost btn-sm">Voltar ao painel</Link>}
          />
        </Card>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-pink/15 px-4 py-3 text-[11px] text-pink/50">
        <Camera className="h-4 w-4" />
        Atividades com foto obrigatória só podem ser concluídas após o envio de pelo menos uma evidência.
        <span className="hidden sm:inline">·</span>
        <span>{user.role === "admin" ? "Você visualiza todas as lojas." : user.role === "supervisor" ? "Você visualiza as lojas da sua supervisão." : "Você visualiza somente a sua loja."}</span>
      </div>
    </div>
  );
}
````

### `src/app/(app)/categorias/[id]/editar/page.tsx`

````tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { CategoryForm } from "@/components/forms/CategoryForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const user = await requireAdmin();
  const categories = await getBackend().listCategories(user);
  const category = categories.find((item) => item.id === params.id);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/categorias" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para categorias
      </Link>
      <PageHeader eyebrow="Edição" title={category.name} subtitle="Atualize a descrição, a ordem e o status da categoria." />
      <Card className="p-5 sm:p-6">
        <CategoryForm category={category} />
      </Card>
    </div>
  );
}
````

### `src/app/(app)/categorias/page.tsx`

````tsx
import Link from "next/link";
import { CheckCircle2, FolderTree, Layers, ListChecks, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { Alert } from "@/components/ui";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams
}: {
  searchParams: { sucesso?: string };
}) {
  const user = await requireAdmin();
  const categories = await getBackend().listCategories(user);

  return (
    <div>
      <PageHeader
        eyebrow="Estrutura dos checklists"
        title="Categorias"
        subtitle="Organize as rotinas operacionais em grupos claros para a execução das lojas."
      />

      {searchParams.sucesso ? (
        <div className="mb-5">
          <Alert tone="success">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{searchParams.sucesso}</span>
          </Alert>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader
            title="Categorias cadastradas"
            description={`${categories.length} categoria(s) na estrutura atual`}
            icon={<FolderTree className="h-4 w-4" />}
            action={<Link href="/modelos" className="btn-ghost btn-sm"><ListChecks className="h-4 w-4" />Ver modelos</Link>}
          />
          {categories.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Modelos</th>
                    <th>Ordem</th>
                    <th>Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <div className="flex items-center gap-2 font-bold text-pink">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-turquesa/15">
                            <Layers className="h-4 w-4" />
                          </span>
                          {category.name}
                        </div>
                      </td>
                      <td className="max-w-[280px] text-xs text-pink/60">{category.description || "—"}</td>
                      <td><span className="badge bg-turquesa/15 text-pink">{category.templateCount ?? 0}</span></td>
                      <td className="text-xs text-pink/60">{category.sortOrder}</td>
                      <td>
                        <span className={cn("badge", category.active ? "bg-pink text-white" : "border border-pink/20 bg-white text-pink/55")}>
                          {category.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <Link href={`/categorias/${category.id}/editar`} className="btn-secondary btn-sm">
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<FolderTree className="h-6 w-6" />}
              title="Nenhuma categoria cadastrada"
              description="Crie a primeira categoria para organizar os modelos de tarefas."
            />
          )}
        </Card>

        <Card>
          <CardHeader title="Nova categoria" description="Crie um agrupamento de rotinas" icon={<FolderTree className="h-4 w-4" />} />
          <div className="p-5">
            <CategoryForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
````

### `src/app/(app)/historico/page.tsx`

````tsx
import Link from "next/link";
import { Activity, Filter, History, ScrollText, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { ACTION_LABELS } from "@/lib/constants";
import { formatDateTime, monthRange } from "@/lib/dates";
import type { ExecutionAction, HistoryFilters } from "@/lib/types";
import { Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ACTIONS = Object.keys(ACTION_LABELS) as ExecutionAction[];

export default async function HistoryPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await requireUser();
  const backend = getBackend();
  const range = monthRange();
  const tab = searchParams.aba === "auditoria" && user.role === "admin" ? "auditoria" : "execucoes";
  const filters: HistoryFilters = {
    storeId: typeof searchParams.storeId === "string" ? searchParams.storeId : "",
    action:
      typeof searchParams.action === "string" && ACTIONS.includes(searchParams.action as ExecutionAction)
        ? (searchParams.action as ExecutionAction)
        : "",
    from: typeof searchParams.from === "string" && searchParams.from ? searchParams.from : range.from,
    to: typeof searchParams.to === "string" && searchParams.to ? searchParams.to : range.to,
    limit: 500
  };

  const stores = await backend.listStores(user);
  const history = await backend.listHistory(user, filters);
  const audit = user.role === "admin" && tab === "auditoria" ? await backend.listAudit(user, 300) : [];

  const baseParams = new URLSearchParams();
  if (filters.storeId) baseParams.set("storeId", filters.storeId);
  if (filters.action) baseParams.set("action", filters.action);
  if (filters.from) baseParams.set("from", filters.from);
  if (filters.to) baseParams.set("to", filters.to);

  function tabHref(nextTab: string) {
    const params = new URLSearchParams(baseParams);
    params.set("aba", nextTab);
    return `/historico?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Execuções e auditoria"
        title="Histórico"
        subtitle="Rastreie quem executou, revisou e alterou cada atividade. Os registros são preservados mesmo após correções."
      />

      <div className="mb-5 flex gap-2">
        <Link
          href={tabHref("execucoes")}
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-semibold",
            tab === "execucoes" ? "border-pink bg-pink text-white" : "border-pink/15 bg-white text-pink/65 hover:border-turquesa"
          )}
        >
          <Activity className="mr-1.5 inline h-3.5 w-3.5" />
          Execuções
        </Link>
        {user.role === "admin" ? (
          <Link
            href={tabHref("auditoria")}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold",
              tab === "auditoria" ? "border-pink bg-pink text-white" : "border-pink/15 bg-white text-pink/65 hover:border-turquesa"
            )}
          >
            <ShieldCheck className="mr-1.5 inline h-3.5 w-3.5" />
            Auditoria
          </Link>
        ) : null}
      </div>

      <Card className="mb-5 p-4">
        <form method="get" action="/historico" className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input type="hidden" name="aba" value={tab} />
          <div>
            <label className="label" htmlFor="storeId">Loja</label>
            <select id="storeId" name="storeId" defaultValue={filters.storeId} className="input">
              <option value="">Todas</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="action">Ação</label>
            <select id="action" name="action" defaultValue={filters.action} className="input">
              <option value="">Todas</option>
              {ACTIONS.map((action) => <option key={action} value={action}>{ACTION_LABELS[action]}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="from">De</label>
            <input id="from" name="from" type="date" defaultValue={filters.from} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="to">Até</label>
            <input id="to" name="to" type="date" defaultValue={filters.to} className="input" />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary btn-sm"><Filter className="h-4 w-4" />Filtrar</button>
            <Link href={`/historico?aba=${tab}`} className="btn-ghost btn-sm">Limpar</Link>
          </div>
        </form>
      </Card>

      {tab === "execucoes" ? (
        <Card>
          <CardHeader
            title="Eventos de execução"
            description={`${history.length} evento(s) no período filtrado`}
            icon={<History className="h-4 w-4" />}
          />
          {history.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data e hora</th>
                    <th>Evento</th>
                    <th>Atividade</th>
                    <th>Loja</th>
                    <th>Responsável</th>
                    <th>Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((execution) => (
                    <tr key={execution.id}>
                      <td className="whitespace-nowrap text-xs text-pink/60">{formatDateTime(execution.createdAt)}</td>
                      <td>
                        <span className="badge border border-turquesa/40 bg-turquesa/10 text-pink">
                          {ACTION_LABELS[execution.action] ?? execution.action}
                        </span>
                      </td>
                      <td>
                        {execution.taskTitle ? (
                          <Link href={`/atividades/${execution.taskId}`} className="text-xs font-semibold text-pink hover:underline">
                            {execution.taskTitle}
                          </Link>
                        ) : (
                          <span className="text-xs text-pink/45">Atividade removida</span>
                        )}
                      </td>
                      <td className="text-xs text-pink/60">{execution.storeName ?? "—"}</td>
                      <td className="text-xs text-pink/60">{execution.userName}</td>
                      <td className="max-w-[280px] text-xs text-pink/55">{execution.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<History className="h-6 w-6" />}
              title="Nenhum evento no período"
              description="As ações de início, conclusão, correção, aprovação e anexos aparecerão aqui."
            />
          )}
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Trilha de auditoria"
            description="Ações administrativas registradas no sistema"
            icon={<ScrollText className="h-4 w-4" />}
          />
          {audit.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data e hora</th>
                    <th>Ator</th>
                    <th>Ação</th>
                    <th>Entidade</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((entry) => (
                    <tr key={entry.id}>
                      <td className="whitespace-nowrap text-xs text-pink/60">{formatDateTime(entry.createdAt)}</td>
                      <td className="text-xs font-semibold text-pink/70">{entry.actorName}</td>
                      <td><span className="badge bg-pink/10 text-pink">{entry.action}</span></td>
                      <td className="text-xs text-pink/60">{entry.entityType}</td>
                      <td className="max-w-[360px] break-words text-[11px] text-pink/50">{JSON.stringify(entry.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<ScrollText className="h-6 w-6" />}
              title="Nenhum registro de auditoria"
              description="Cadastros e alterações administrativas serão registrados nesta trilha."
            />
          )}
        </Card>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-pink/15 px-4 py-3 text-[11px] text-pink/50">
        <ShieldCheck className="h-4 w-4" />
        O histórico preserva o estado anterior e posterior de cada mudança de status. Registros não são sobrescritos.
      </div>
    </div>
  );
}
````

### `src/app/(app)/layout.tsx`

````tsx
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth-server";
import { isLocalMode } from "@/lib/backend";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell user={user} demoMode={isLocalMode()}>
      {children}
    </AppShell>
  );
}
````

### `src/app/(app)/lojas/[id]/editar/page.tsx`

````tsx
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { StoreForm } from "@/components/forms/StoreForm";

export const dynamic = "force-dynamic";

export default async function EditStorePage({ params }: { params: { id: string } }) {
  const user = await requireAdmin();
  const backend = getBackend();
  const store = await backend.getStore(user, params.id);
  if (!store) notFound();
  const users = await backend.listUsers(user);
  const managers = users.filter((person) => person.role === "manager").map((person) => ({ id: person.id, name: person.name }));
  const supervisors = users.filter((person) => person.role === "supervisor").map((person) => ({ id: person.id, name: person.name }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/lojas/${store.id}`} className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para a loja
      </Link>
      <PageHeader eyebrow={store.code} title={`Editar ${store.name}`} subtitle="Atualize os dados da unidade, gerente e supervisores." />
      <Card className="p-5 sm:p-6">
        <StoreForm store={store} managers={managers} supervisors={supervisors} />
      </Card>
    </div>
  );
}
````

### `src/app/(app)/lojas/[id]/page.tsx`

````tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarClock,
  Camera,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Pencil,
  UserRound,
  Users
} from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { dueLabel, formatDate, formatDateTime, isOverdue, monthRange } from "@/lib/dates";
import { percent } from "@/lib/utils";
import type { Store } from "@/lib/types";
import { Card, CardHeader, EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { PhotoBadge, StatusBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StoreDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const backend = getBackend();
  let store: Store | null = null;
  try {
    store = await backend.getStore(user, params.id);
  } catch {
    store = null;
  }
  if (!store) notFound();

  const range = monthRange();
  const tasks = await backend.listTasks(user, {
    storeId: store.id,
    from: range.from,
    to: range.to
  });
  const photos = tasks.length
    ? await backend.listPhotosForTasks(
        user,
        tasks.slice(0, 40).map((task) => task.id)
      )
    : [];

  const completed = tasks.filter((task) => task.status === "completed").length;
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const correction = tasks.filter((task) => task.status === "correction_requested").length;
  const rejected = tasks.filter((task) => task.status === "rejected").length;
  const overdue = tasks.filter((task) => isOverdue(task)).length;
  const rate = percent(completed, tasks.length);
  const recentTasks = [...tasks]
    .sort((a, b) => `${b.dueDate}${b.dueTime}`.localeCompare(`${a.dueDate}${a.dueTime}`))
    .slice(0, 8);
  const recentPhotos = photos.slice(0, 6);
  const canManage = user.role === "admin";

  return (
    <div>
      <Link href="/lojas" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para lojas
      </Link>

      <PageHeader
        eyebrow={store.code}
        title={store.name}
        subtitle="Indicadores do mês, equipe responsável e histórico recente da unidade."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("badge", store.active ? "bg-pink text-white" : "border border-pink/20 bg-white text-pink/55")}>
              {store.active ? "Loja ativa" : "Loja inativa"}
            </span>
            {canManage ? (
              <Link href={`/lojas/${store.id}/editar`} className="btn-secondary btn-sm">
                <Pencil className="h-4 w-4" />
                Editar loja
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Atividades no mês"
          value={tasks.length}
          hint={`${formatDate(range.from)} a ${formatDate(range.to)}`}
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Concluídas"
          value={completed}
          hint={`${rate}% de execução`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="pink"
        />
        <StatCard
          label="Em aberto"
          value={pending + inProgress + correction + rejected}
          hint={`${inProgress} em andamento · ${correction} correções`}
          icon={<CalendarClock className="h-5 w-5" />}
          tone="outline"
        />
        <StatCard
          label="Atrasadas"
          value={overdue}
          hint="Prazo vencido"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="turquesa"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Execução no mês"
              description="Progresso das rotinas da unidade"
              icon={<CheckCircle2 className="h-4 w-4" />}
              action={<span className="text-sm font-black text-pink">{rate}%</span>}
            />
            <div className="space-y-4 p-5">
              <ProgressBar value={rate} label="Atividades concluídas" />
              <div className="grid gap-2 sm:grid-cols-2">
                <StatusRow label="Pendentes" value={pending} />
                <StatusRow label="Em andamento" value={inProgress} />
                <StatusRow label="Aguardando correção" value={correction} />
                <StatusRow label="Reprovadas" value={rejected} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Atividades recentes"
              description="Últimos checklists do período"
              icon={<ClipboardList className="h-4 w-4" />}
              action={<Link href={`/atividades?storeId=${store.id}`} className="btn-ghost btn-sm">Ver todas</Link>}
            />
            {recentTasks.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Atividade</th>
                      <th>Categoria</th>
                      <th>Prazo</th>
                      <th>Status</th>
                      <th>Evidência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <Link href={`/atividades/${task.id}`} className="font-semibold text-pink hover:underline">
                            {task.title}
                          </Link>
                        </td>
                        <td className="text-xs text-pink/60">{task.categoryName}</td>
                        <td className="text-xs">
                          <span className={cn(isOverdue(task) ? "font-bold text-pink" : "text-pink/60")}>
                            {dueLabel(task.dueDate, task.dueTime)}
                          </span>
                        </td>
                        <td><StatusBadge status={task.status} /></td>
                        <td><PhotoBadge requirement={task.photoRequirement} count={task.photoCount} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="Nenhuma atividade no mês"
                description="As rotinas serão exibidas aqui assim que forem geradas."
              />
            )}
          </Card>

          <Card>
            <CardHeader title="Evidências recentes" description="Fotos enviadas pela loja" icon={<Camera className="h-4 w-4" />} />
            <div className="p-5">
              {recentPhotos.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {recentPhotos.map((photo) => (
                    <Link key={photo.id} href={`/atividades/${photo.taskId}`} className="group overflow-hidden rounded-xl border border-pink/10 bg-turquesa/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.url} alt="Evidência da loja" loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.03]" />
                      <div className="p-2">
                        <p className="truncate text-[11px] font-semibold text-pink">{photo.uploadedByName}</p>
                        <p className="truncate text-[10px] text-pink/50">{formatDateTime(photo.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Camera className="h-6 w-6" />} title="Nenhuma evidência recente" description="As fotos enviadas pela loja aparecerão aqui." />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Dados da loja" icon={<Building2 className="h-4 w-4" />} />
            <div className="space-y-3 p-5 text-sm">
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Código" value={store.code} />
              <InfoRow icon={<UserRound className="h-4 w-4" />} label="Gerente responsável" value={store.managerName ?? "Não vinculado"} />
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                label="Supervisores"
                value={store.supervisors.length ? store.supervisors.map((item) => item.name).join(", ") : "Não vinculado"}
              />
              <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Cadastrada em" value={formatDate(store.createdAt)} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Acesso" description="Quem visualiza esta unidade" icon={<Users className="h-4 w-4" />} />
            <div className="space-y-3 p-5 text-xs text-pink/65">
              <p className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />
                A gerente comercial visualiza todas as lojas da rede.
              </p>
              <p className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />
                Supervisores visualizam apenas as lojas vinculadas ao seu perfil.
              </p>
              <p className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa" />
                O gerente de loja visualiza exclusivamente esta unidade.
              </p>
            </div>
          </Card>

          {canManage ? (
            <div className="flex flex-col gap-2">
              <Link href={`/lojas/${store.id}/editar`} className="btn-primary">
                <Pencil className="h-4 w-4" />
                Editar dados da loja
              </Link>
              <Link href={`/atividades?storeId=${store.id}`} className="btn-ghost">
                <ClipboardList className="h-4 w-4" />
                Abrir checklists da loja
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-pink/10 px-3 py-2 text-xs">
      <span className="text-pink/65">{label}</span>
      <span className="font-black text-pink">{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-turquesa/15 text-pink">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-pink/45">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-pink/80">{value}</p>
      </div>
    </div>
  );
}
````

### `src/app/(app)/lojas/nova/page.tsx`

````tsx
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { StoreForm } from "@/components/forms/StoreForm";

export const dynamic = "force-dynamic";

export default async function NewStorePage() {
  const user = await requireAdmin();
  const users = await getBackend().listUsers(user);
  const managers = users.filter((person) => person.role === "manager").map((person) => ({ id: person.id, name: person.name }));
  const supervisors = users.filter((person) => person.role === "supervisor").map((person) => ({ id: person.id, name: person.name }));

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/lojas" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para lojas
      </Link>
      <PageHeader eyebrow="Cadastro" title="Nova loja" subtitle="Cadastre a unidade, defina o gerente e os supervisores responsáveis." />
      <Card className="p-5 sm:p-6">
        <StoreForm managers={managers} supervisors={supervisors} />
      </Card>
    </div>
  );
}
````

### `src/app/(app)/lojas/page.tsx`

````tsx
import Link from "next/link";
import { Building2, CheckCircle2, MapPin, Plus, Store, UserRound, Users } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { Alert } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StoresPage({
  searchParams
}: {
  searchParams: { sucesso?: string };
}) {
  const user = await requireUser();
  const stores = await getBackend().listStores(user);
  const isAdmin = user.role === "admin";

  return (
    <div>
      <PageHeader
        eyebrow="Rede D&D"
        title="Lojas"
        subtitle={isAdmin ? "Cadastre, edite e acompanhe as unidades da rede." : "Unidades vinculadas ao seu perfil."}
        actions={isAdmin ? (
          <Link href="/lojas/nova" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nova loja
          </Link>
        ) : null}
      />

      {searchParams.sucesso ? (
        <div className="mb-5">
          <Alert tone="success">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{searchParams.sucesso}</span>
          </Alert>
        </div>
      ) : null}

      {stores.length ? (
        isAdmin ? (
          <Card>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Loja</th>
                    <th>Código</th>
                    <th>Gerente</th>
                    <th>Supervisores</th>
                    <th>Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr key={store.id}>
                      <td>
                        <Link href={`/lojas/${store.id}`} className="flex items-center gap-2 font-bold text-pink hover:underline">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-turquesa/15">
                            <Store className="h-4 w-4" />
                          </span>
                          {store.name}
                        </Link>
                      </td>
                      <td className="font-mono text-xs">{store.code}</td>
                      <td>{store.managerName ?? <span className="text-pink/40">Não vinculado</span>}</td>
                      <td>
                        {store.supervisors.length ? (
                          <div className="flex flex-wrap gap-1">
                            {store.supervisors.map((supervisor) => (
                              <span key={supervisor.id} className="badge bg-turquesa/15 text-pink">{supervisor.name}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-pink/40">—</span>
                        )}
                      </td>
                      <td>
                        <span className={cn("badge", store.active ? "bg-pink text-white" : "border border-pink/20 bg-white text-pink/55")}>
                          {store.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link href={`/lojas/${store.id}`} className="btn-ghost btn-sm">Ver</Link>
                          <Link href={`/lojas/${store.id}/editar`} className="btn-secondary btn-sm">Editar</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => (
              <Link key={store.id} href={`/lojas/${store.id}`} className="card group p-5 transition hover:-translate-y-0.5 hover:border-turquesa">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-turquesa/15 text-pink">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className={cn("badge", store.active ? "bg-pink text-white" : "border border-pink/20 bg-white text-pink/55")}>
                    {store.active ? "Ativa" : "Inativa"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-pink group-hover:underline group-hover:decoration-turquesa group-hover:decoration-2 group-hover:underline-offset-4">{store.name}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-pink/50"><MapPin className="h-3.5 w-3.5" />{store.code}</p>
                <div className="mt-4 space-y-2 text-xs text-pink/65">
                  <p className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-pink/40" />{store.managerName ?? "Sem gerente vinculado"}</p>
                  <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-pink/40" />{store.supervisors.map((item) => item.name).join(", ") || "Sem supervisor"}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <Card>
          <EmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="Nenhuma loja vinculada"
            description={isAdmin ? "Cadastre a primeira unidade da rede D&D." : "Procure a gerente comercial para ser vinculado a uma loja."}
            action={isAdmin ? <Link href="/lojas/nova" className="btn-primary">Cadastrar loja</Link> : null}
          />
        </Card>
      )}
    </div>
  );
}
````

### `src/app/(app)/modelos/[id]/editar/page.tsx`

````tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { TemplateForm } from "@/components/forms/TemplateForm";
import type { TaskTemplate } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  const user = await requireAdmin();
  const backend = getBackend();
  let template: TaskTemplate | null = null;
  try {
    template = await backend.getTemplate(user, params.id);
  } catch {
    template = null;
  }
  if (!template) notFound();

  const [categories, stores] = await Promise.all([backend.listCategories(user), backend.listStores(user)]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/modelos" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para modelos
      </Link>
      <PageHeader
        eyebrow="Edição"
        title={template.title}
        subtitle="Ajuste a periodicidade, o prazo, as lojas e a regra de evidência. As atividades já geradas mantêm o histórico."
      />
      <Card className="p-5 sm:p-6">
        <TemplateForm template={template} categories={categories} stores={stores} />
      </Card>
    </div>
  );
}
````

### `src/app/(app)/modelos/novo/page.tsx`

````tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Alert, Card, PageHeader } from "@/components/ui";
import { TemplateForm } from "@/components/forms/TemplateForm";

export const dynamic = "force-dynamic";

export default async function NewTemplatePage() {
  const user = await requireAdmin();
  const backend = getBackend();
  const [categories, stores] = await Promise.all([backend.listCategories(user), backend.listStores(user)]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/modelos" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para modelos
      </Link>
      <PageHeader
        eyebrow="Novo modelo"
        title="Criar atividade recorrente"
        subtitle="A atividade será gerada automaticamente para as lojas selecionadas, respeitando a periodicidade."
      />
      {categories.length && stores.length ? (
        <Card className="p-5 sm:p-6">
          <TemplateForm categories={categories} stores={stores} />
        </Card>
      ) : (
        <Card>
          <div className="p-6">
            <Alert tone="info">
              Para criar um modelo, cadastre pelo menos uma categoria e uma loja ativa.
              <span className="mt-3 flex flex-wrap gap-2">
                <Link href="/categorias" className="btn-secondary btn-sm">Cadastrar categoria</Link>
                <Link href="/lojas/nova" className="btn-ghost btn-sm">Cadastrar loja</Link>
              </span>
            </Alert>
          </div>
        </Card>
      )}
    </div>
  );
}
````

### `src/app/(app)/modelos/page.tsx`

````tsx
import Link from "next/link";
import { CalendarClock, Camera, CheckCircle2, ListChecks, Pencil, Plus, Store } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { PHOTO_LABELS, RECURRENCE_LABELS } from "@/lib/constants";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { Alert } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  searchParams
}: {
  searchParams: { sucesso?: string };
}) {
  const user = await requireAdmin();
  const backend = getBackend();
  const [templates, categories] = await Promise.all([backend.listTemplates(user), backend.listCategories(user)]);
  const grouped = categories
    .map((category) => ({
      category,
      templates: templates.filter((template) => template.categoryId === category.id)
    }))
    .filter((group) => group.templates.length > 0);
  const uncategorized = templates.filter((template) => !categories.some((category) => category.id === template.categoryId));

  return (
    <div>
      <PageHeader
        eyebrow="Rotinas e periodicidade"
        title="Modelos de tarefas"
        subtitle="Defina as atividades recorrentes, os prazos, as lojas participantes e a regra de evidência."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/categorias" className="btn-ghost">
              Categorias
            </Link>
            <Link href="/modelos/novo" className="btn-primary">
              <Plus className="h-4 w-4" />
              Novo modelo
            </Link>
          </div>
        }
      />

      {searchParams.sucesso ? (
        <div className="mb-5">
          <Alert tone="success">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{searchParams.sucesso}</span>
          </Alert>
        </div>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Summary label="Modelos cadastrados" value={templates.length} />
        <Summary label="Modelos ativos" value={templates.filter((template) => template.active).length} />
        <Summary label="Com foto obrigatória" value={templates.filter((template) => template.photoRequirement === "required").length} />
      </div>

      {templates.length ? (
        <div className="space-y-6">
          {[...grouped, ...(uncategorized.length ? [{ category: { id: "sem-categoria", name: "Sem categoria", description: "" }, templates: uncategorized }] : [])].map((group) => (
            <Card key={group.category.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink/10 bg-turquesa/5 px-5 py-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-pink">{group.category.name}</h2>
                  <p className="text-[11px] text-pink/50">{group.templates.length} modelo(s)</p>
                </div>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Atividade</th>
                      <th>Periodicidade</th>
                      <th>Prazo</th>
                      <th>Evidência</th>
                      <th>Lojas</th>
                      <th>Status</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.templates.map((template) => (
                      <tr key={template.id}>
                        <td>
                          <p className="font-bold text-pink">{template.title}</p>
                          <p className="max-w-[320px] text-[11px] text-pink/50">{template.description || "Sem descrição."}</p>
                        </td>
                        <td>
                          <span className="badge border border-turquesa/50 bg-turquesa/10 text-pink">
                            <CalendarClock className="h-3.5 w-3.5" />
                            {RECURRENCE_LABELS[template.recurrence]}
                          </span>
                        </td>
                        <td className="text-xs text-pink/65">
                          {template.recurrence === "once" && template.onceDueDate ? template.onceDueDate : template.dueTime}
                        </td>
                        <td>
                          <span className={cn("badge", template.photoRequirement === "required" ? "bg-pink text-white" : "border border-pink/15 bg-white text-pink/65")}>
                            <Camera className="h-3.5 w-3.5" />
                            {PHOTO_LABELS[template.photoRequirement]}
                          </span>
                        </td>
                        <td>
                          <div className="flex max-w-[220px] flex-wrap gap-1">
                            {template.storeNames.slice(0, 3).map((name) => (
                              <span key={name} className="badge bg-turquesa/15 text-pink">
                                <Store className="h-3 w-3" />
                                {name}
                              </span>
                            ))}
                            {template.storeNames.length > 3 ? (
                              <span className="badge border border-pink/15 text-pink/55">+{template.storeNames.length - 3}</span>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <span className={cn("badge", template.active ? "bg-pink text-white" : "border border-pink/20 bg-white text-pink/55")}>
                            {template.active ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end">
                            <Link href={`/modelos/${template.id}/editar`} className="btn-secondary btn-sm">
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<ListChecks className="h-6 w-6" />}
            title="Nenhum modelo de tarefa"
            description="Crie as rotinas recorrentes que serão geradas automaticamente para as lojas."
            action={<Link href="/modelos/novo" className="btn-primary">Criar modelo</Link>}
          />
        </Card>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-pink/15 px-4 py-3 text-[11px] text-pink/50">
        <Camera className="h-4 w-4" />
        A geração automática evita duplicidades por loja, modelo e período (diário, semanal, mensal ou pontual).
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="card flex items-center justify-between gap-3 p-4">
      <span className="text-xs font-semibold text-pink/60">{label}</span>
      <span className="text-2xl font-black text-pink">{value}</span>
    </div>
  );
}
````

### `src/app/(app)/painel/page.tsx`

````tsx
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  ListChecks,
  Plus,
  Store
} from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { computeDashboard } from "@/lib/dashboard";
import { monthRange, dueLabel, formatDate } from "@/lib/dates";
import { ROLE_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import type { DashboardFilters, Role, TaskStatus } from "@/lib/types";
import { Card, CardHeader, EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { RoleBadge, StatusBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await requireUser();
  const backend = getBackend();
  const range = monthRange();
  const filters: DashboardFilters = {
    storeId: typeof searchParams.storeId === "string" ? searchParams.storeId : "",
    supervisorId: typeof searchParams.supervisorId === "string" ? searchParams.supervisorId : "",
    managerId: typeof searchParams.managerId === "string" ? searchParams.managerId : "",
    categoryId: typeof searchParams.categoryId === "string" ? searchParams.categoryId : "",
    status: (typeof searchParams.status === "string" ? searchParams.status : "") as TaskStatus | "",
    from: typeof searchParams.from === "string" && searchParams.from ? searchParams.from : range.from,
    to: typeof searchParams.to === "string" && searchParams.to ? searchParams.to : range.to
  };

  if (user.role === "admin") {
    try {
      await backend.ensureGenerated(user);
    } catch {
      // a rotina também é executada pelo cron; não bloqueia o painel
    }
  }

  const [stores, categories, tasks] = await Promise.all([
    backend.listStores(user),
    backend.listCategories(user),
    backend.listTasks(user, filters)
  ]);
  const people = user.role === "admin" ? await backend.listUsers(user) : [];
  const photos = tasks.length
    ? await backend.listPhotosForTasks(
        user,
        tasks.slice(0, 60).map((task) => task.id)
      )
    : [];
  const enrichedPhotos = photos.slice(0, 8).map((photo) => {
    const task = tasks.find((item) => item.id === photo.taskId);
    return {
      ...photo,
      taskTitle: task?.title ?? "Atividade",
      storeName: task?.storeName ?? "Loja"
    };
  });
  const data = computeDashboard(tasks, stores, enrichedPhotos, user, filters);
  const supervisors = people.filter((person) => person.role === "supervisor");
  const managers = people.filter((person) => person.role === "manager");

  const title =
    user.role === "admin"
      ? "Painel gerencial"
      : user.role === "supervisor"
        ? "Painel da supervisão"
        : "Painel da minha loja";

  const subtitle =
    user.role === "admin"
      ? "Acompanhe a execução das rotinas, as evidências e o desempenho de todas as lojas D&D."
      : user.role === "supervisor"
        ? "Indicadores das lojas sob sua responsabilidade, com pendências e evidências recentes."
        : "Sua rotina operacional, pendências e evidências da loja.";

  return (
    <div>
      <PageHeader
        eyebrow={ROLE_LABELS[user.role]}
        title={title}
        subtitle={subtitle}
        actions={
          user.role === "admin" ? (
            <>
              <Link href="/lojas/nova" className="btn-ghost">
                <Plus className="h-4 w-4" />
                Nova loja
              </Link>
              <Link href="/modelos/novo" className="btn-primary">
                <ListChecks className="h-4 w-4" />
                Nova atividade
              </Link>
            </>
          ) : (
            <Link href="/atividades" className="btn-primary">
              <ClipboardList className="h-4 w-4" />
              Ver atividades
            </Link>
          )
        }
      />

      <form className="card mb-6 p-4" method="get" action="/painel">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div>
            <label className="label" htmlFor="storeId">Loja</label>
            <select id="storeId" name="storeId" defaultValue={filters.storeId} className="input">
              <option value="">Todas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
          {user.role === "admin" ? (
            <>
              <div>
                <label className="label" htmlFor="supervisorId">Supervisor</label>
                <select id="supervisorId" name="supervisorId" defaultValue={filters.supervisorId} className="input">
                  <option value="">Todos</option>
                  {supervisors.map((person) => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="managerId">Gerente</label>
                <select id="managerId" name="managerId" defaultValue={filters.managerId} className="input">
                  <option value="">Todos</option>
                  {managers.map((person) => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
          <div>
            <label className="label" htmlFor="categoryId">Categoria</label>
            <select id="categoryId" name="categoryId" defaultValue={filters.categoryId} className="input">
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={filters.status} className="input">
              <option value="">Todos</option>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="from">De</label>
            <input id="from" name="from" type="date" defaultValue={filters.from} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="to">Até</label>
            <input id="to" name="to" type="date" defaultValue={filters.to} className="input" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <Link href="/painel" className="btn-ghost btn-sm">Limpar filtros</Link>
          <button type="submit" className="btn-primary btn-sm">Aplicar filtros</button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Lojas ativas"
          value={data.totalStores}
          hint={user.role === "admin" ? "Rede completa" : "Unidades sob sua responsabilidade"}
          icon={<Store className="h-5 w-5" />}
          tone="turquesa"
        />
        <StatCard
          label="Atividades previstas"
          value={data.totalTasks}
          hint={`${formatDate(filters.from)} a ${formatDate(filters.to)}`}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="outline"
        />
        <StatCard
          label="Concluídas"
          value={data.completed}
          hint={`${data.executionRate}% de execução no período`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="pink"
        />
        <StatCard
          label="Pendentes"
          value={data.pending + data.inProgress + data.correction + data.rejected}
          hint={`${data.inProgress} em andamento · ${data.correction} correções`}
          icon={<CalendarClock className="h-5 w-5" />}
          tone="outline"
        />
        <StatCard
          label="Atrasadas"
          value={data.overdue}
          hint="Prazo vencido e sem conclusão"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="pink"
        />
        <StatCard
          label="Fotos recentes"
          value={enrichedPhotos.length}
          hint="Evidências enviadas no período"
          icon={<Camera className="h-5 w-5" />}
          tone="turquesa"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader title="Execução geral" description="Percentual de atividades concluídas" icon={<CheckCircle2 className="h-4 w-4" />} />
          <div className="flex flex-col items-center gap-5 p-6">
            <div
              className="relative flex h-40 w-40 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(#891745 ${data.executionRate * 3.6}deg, rgba(18,217,239,0.2) 0deg)` }}
              role="img"
              aria-label={`Execução geral: ${data.executionRate}%`}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-4xl font-black text-pink">{data.executionRate}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink/50">execução</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              {data.statusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-pink/65">{item.label}</span>
                  <span className="font-bold text-pink">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Ranking de lojas"
            description="Melhor desempenho no período filtrado"
            icon={<Building2 className="h-4 w-4" />}
            action={<Link href="/relatorios" className="btn-ghost btn-sm">Relatório</Link>}
          />
          <div className="p-5">
            {data.storeRanking.length ? (
              <div className="space-y-4">
                {data.storeRanking.slice(0, 6).map((store, index) => (
                  <div key={store.storeId}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black", index === 0 ? "bg-pink text-white" : "bg-turquesa/20 text-pink")}>
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-pink">{store.storeName}</p>
                          <p className="text-[11px] text-pink/50">{store.storeCode} · {store.completed}/{store.total} concluídas</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-pink">{store.rate}%</span>
                    </div>
                    <ProgressBar value={store.rate} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Building2 className="h-6 w-6" />}
                title="Sem dados no período"
                description="Ajuste os filtros ou aguarde a geração das atividades."
              />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Lojas com mais pendências" description="Priorize o acompanhamento" icon={<AlertTriangle className="h-4 w-4" />} />
          <div className="p-5">
            {data.pendingRanking.length ? (
              <div className="space-y-3">
                {data.pendingRanking.slice(0, 6).map((store) => (
                  <Link key={store.storeId} href={`/lojas/${store.storeId}`} className="flex items-center justify-between gap-3 rounded-xl border border-pink/10 px-3 py-2.5 hover:border-turquesa hover:bg-turquesa/5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-pink">{store.storeName}</p>
                      <p className="text-[11px] text-pink/50">{store.overdue} atrasadas · {store.total} previstas</p>
                    </div>
                    <span className="badge bg-pink/10 text-pink">{store.pending} pendentes</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-pink/50">Nenhuma pendência no período.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Atividades atrasadas" description="Prazo vencido" icon={<CalendarClock className="h-4 w-4" />} action={<Link href="/atividades?status=pending" className="btn-ghost btn-sm">Ver todas</Link>} />
          <div className="p-5">
            {data.overdueTasks.length ? (
              <div className="space-y-3">
                {data.overdueTasks.map((task) => (
                  <Link key={task.id} href={`/atividades/${task.id}`} className="flex items-start justify-between gap-3 rounded-xl border border-pink/10 px-3 py-2.5 hover:border-turquesa hover:bg-turquesa/5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-pink">{task.title}</p>
                      <p className="text-[11px] text-pink/50">{task.storeName} · {dueLabel(task.dueDate, task.dueTime)}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-pink/50">Nenhuma atividade atrasada. Boa operação!</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Evidências recentes" description="Últimas fotos enviadas" icon={<Camera className="h-4 w-4" />} action={<Link href="/relatorios" className="btn-ghost btn-sm">Ver relatórios</Link>} />
          <div className="p-5">
            {enrichedPhotos.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {enrichedPhotos.map((photo) => (
                  <Link key={photo.id} href={`/atividades/${photo.taskId}`} className="group overflow-hidden rounded-xl border border-pink/10 bg-turquesa/5">
                    {photo.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.url} alt={photo.taskTitle} loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.03]" />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center text-[10px] text-pink/40">Sem prévia</div>
                    )}
                    <div className="p-2">
                      <p className="truncate text-[11px] font-semibold text-pink">{photo.taskTitle}</p>
                      <p className="truncate text-[10px] text-pink/50">{photo.storeName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Camera className="h-6 w-6" />} title="Nenhuma evidência recente" description="As fotos enviadas pelas lojas aparecerão aqui." />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Desempenho por categoria" description="Execução no período" icon={<FileSpreadsheet className="h-4 w-4" />} />
          <div className="p-5">
            {data.categoryBreakdown.length ? (
              <div className="space-y-4">
                {data.categoryBreakdown.map((category) => (
                  <div key={category.categoryName}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-semibold text-pink/75">{category.categoryName}</span>
                      <span className="font-bold text-pink">{category.rate}%</span>
                    </div>
                    <ProgressBar value={category.rate} />
                    <p className="mt-1 text-[10px] text-pink/45">{category.completed} de {category.total} concluídas</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-pink/50">Sem dados no período.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-pink/20 bg-turquesa/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <RoleBadge role={user.role as Role} />
          <p className="text-xs text-pink/60">
            {user.role === "admin"
              ? "Você visualiza todas as lojas e pode gerenciar usuários, categorias e modelos."
              : user.role === "supervisor"
                ? "Você visualiza somente as lojas vinculadas à sua supervisão."
                : "Você visualiza somente a sua loja."}
          </p>
        </div>
        <Link href="/atividades" className="btn-ghost btn-sm">
          Abrir checklists
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
````

### `src/app/(app)/perfil/page.tsx`

````tsx
import { KeyRound, Mail, ShieldCheck, Store, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend, isLocalMode } from "@/lib/backend";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
import { Card, CardHeader, PageHeader } from "@/components/ui";
import { RoleBadge } from "@/components/ui/badges";
import { ProfilePasswordForm } from "@/components/auth/ProfilePasswordForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const stores = await getBackend().listStores(user);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Dados de acesso"
        title="Meu perfil"
        subtitle="Consulte suas permissões, lojas vinculadas e atualize sua senha com segurança."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Identificação" description="Dados da sua conta" icon={<UserRound className="h-4 w-4" />} />
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-turquesa/15 text-xl font-black text-pink">
                {user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}
              </span>
              <div>
                <p className="text-lg font-black text-pink">{user.name}</p>
                <RoleBadge role={user.role} />
              </div>
            </div>
            <div className="space-y-3 border-t border-pink/10 pt-4 text-sm">
              <p className="flex items-center gap-2 text-pink/70"><Mail className="h-4 w-4 text-pink/40" />{user.email}</p>
              <p className="flex items-center gap-2 text-pink/70"><ShieldCheck className="h-4 w-4 text-pink/40" />{ROLE_LABELS[user.role]} · {ROLE_DESCRIPTIONS[user.role]}</p>
            </div>
            <div className="rounded-xl border border-turquesa/40 bg-turquesa/10 p-3 text-xs text-pink/70">
              {user.role === "admin"
                ? "Você tem acesso total à rede, incluindo usuários, categorias, modelos e auditoria."
                : user.role === "supervisor"
                  ? "Você acompanha as lojas vinculadas à sua supervisão e pode revisar execuções."
                  : "Você executa e acompanha as atividades exclusivamente da sua loja."}
            </div>
            {isLocalMode() ? (
              <p className="rounded-xl border border-dashed border-pink/20 px-3 py-2 text-[11px] text-pink/50">
                Ambiente local de demonstração. Em produção, os dados são armazenados no Supabase.
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader title="Lojas vinculadas" description="Unidades que você pode acessar" icon={<Store className="h-4 w-4" />} />
          <div className="space-y-2 p-5">
            {stores.length ? (
              stores.map((store) => (
                <div key={store.id} className="flex items-center justify-between gap-3 rounded-xl border border-pink/10 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-pink">{store.name}</p>
                    <p className="text-[11px] text-pink/45">{store.code}</p>
                  </div>
                  <span className="badge bg-turquesa/15 text-pink">{store.active ? "Ativa" : "Inativa"}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-pink/50">Nenhuma loja vinculada. Procure a gerente comercial.</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Segurança da conta" description="Atualize sua senha de acesso" icon={<KeyRound className="h-4 w-4" />} />
          <div className="max-w-xl p-5">
            <ProfilePasswordForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
````

### `src/app/(app)/relatorios/page.tsx`

````tsx
import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, FileSpreadsheet, Filter, Percent } from "lucide-react";
import { requireUser } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { ACTION_LABELS, RECURRENCE_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { dueLabel, formatDate, formatDateTime, isOverdue, monthRange } from "@/lib/dates";
import { percent } from "@/lib/utils";
import type { TaskFilters, TaskStatus } from "@/lib/types";
import { Card, CardHeader, EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { ReportExport, type ReportRow } from "@/components/reports/ReportExport";
import { StatusBadge } from "@/components/ui/badges";

export const dynamic = "force-dynamic";

function statusFrom(value: string | undefined): TaskStatus | "" {
  return value && STATUS_ORDER.includes(value as TaskStatus) ? (value as TaskStatus) : "";
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const user = await requireUser();
  const backend = getBackend();
  const range = monthRange();
  const filters: TaskFilters = {
    storeId: typeof searchParams.storeId === "string" ? searchParams.storeId : "",
    categoryId: typeof searchParams.categoryId === "string" ? searchParams.categoryId : "",
    status: statusFrom(typeof searchParams.status === "string" ? searchParams.status : undefined),
    from: typeof searchParams.from === "string" && searchParams.from ? searchParams.from : range.from,
    to: typeof searchParams.to === "string" && searchParams.to ? searchParams.to : range.to
  };

  if (user.role === "admin") {
    try {
      await backend.ensureGenerated(user);
    } catch {
      // a geração também é executada pelo cron
    }
  }

  const [stores, categories, tasks] = await Promise.all([
    backend.listStores(user),
    backend.listCategories(user),
    backend.listTasks(user, filters)
  ]);

  const completed = tasks.filter((task) => task.status === "completed").length;
  const pending = tasks.length - completed;
  const overdue = tasks.filter((task) => isOverdue(task)).length;
  const rate = percent(completed, tasks.length);
  const selectedStore = stores.find((store) => store.id === filters.storeId);
  const selectedCategory = categories.find((category) => category.id === filters.categoryId);
  const periodLabel = `${formatDate(filters.from)} a ${formatDate(filters.to)}`;
  const filterLabel = [
    selectedStore?.name ?? "Todas as lojas",
    selectedCategory?.name ?? "Todas as categorias",
    filters.status ? STATUS_LABELS[filters.status] : "Todos os status"
  ].join(" · ");

  const rows: ReportRow[] = tasks.map((task) => ({
    store: task.storeName,
    code: task.storeCode,
    task: task.title,
    category: task.categoryName,
    recurrence: RECURRENCE_LABELS[task.recurrence],
    due: dueLabel(task.dueDate, task.dueTime),
    status: STATUS_LABELS[task.status],
    executor: task.completedByName ?? "—",
    completedAt: task.completedAt ? formatDateTime(task.completedAt) : "—",
    photos: task.photoCount
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Indicadores e exportações"
        title="Relatórios"
        subtitle="Consolide a execução das lojas, filtre o período e exporte em Excel ou PDF para reuniões e auditorias."
        actions={
          <ReportExport rows={rows} summary={{ total: tasks.length, completed, pending, overdue, rate }} periodLabel={periodLabel} filterLabel={filterLabel} />
        }
      />

      <Card className="mb-5 p-4 no-print">
        <form method="get" action="/relatorios" className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div>
            <label className="label" htmlFor="storeId">Loja</label>
            <select id="storeId" name="storeId" defaultValue={filters.storeId} className="input">
              <option value="">Todas</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="categoryId">Categoria</label>
            <select id="categoryId" name="categoryId" defaultValue={filters.categoryId} className="input">
              <option value="">Todas</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={filters.status} className="input">
              <option value="">Todos</option>
              {STATUS_ORDER.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="from">De</label>
            <input id="from" name="from" type="date" defaultValue={filters.from} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="to">Até</label>
            <input id="to" name="to" type="date" defaultValue={filters.to} className="input" />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary btn-sm"><Filter className="h-4 w-4" />Filtrar</button>
            <Link href="/relatorios" className="btn-ghost btn-sm">Limpar</Link>
          </div>
        </form>
      </Card>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Atividades previstas" value={tasks.length} hint={periodLabel} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label="Concluídas" value={completed} hint={`${rate}% de execução`} icon={<CheckCircle2 className="h-5 w-5" />} tone="pink" />
        <StatCard label="Em aberto" value={pending} hint="Pendentes, em andamento ou em correção" icon={<CalendarClock className="h-5 w-5" />} tone="outline" />
        <StatCard label="Atrasadas" value={overdue} hint="Prazo vencido no período" icon={<AlertTriangle className="h-5 w-5" />} tone="turquesa" />
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader title="Execução do período" description="Percentual consolidado" icon={<Percent className="h-4 w-4" />} />
          <div className="space-y-4 p-5">
            <div className="flex items-end justify-between gap-3">
              <span className="text-4xl font-black text-pink">{rate}%</span>
              <span className="text-xs text-pink/50">{completed} de {tasks.length} concluídas</span>
            </div>
            <ProgressBar value={rate} />
            <div className="grid gap-2 sm:grid-cols-2">
              {STATUS_ORDER.map((status) => (
                <div key={status} className="flex items-center justify-between gap-2 rounded-lg border border-pink/10 px-3 py-2 text-[11px]">
                  <span className="text-pink/60">{STATUS_LABELS[status]}</span>
                  <span className="font-black text-pink">{tasks.filter((task) => task.status === status).length}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Resumo por loja" description="Execução consolidada no filtro atual" icon={<FileSpreadsheet className="h-4 w-4" />} />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Previstas</th>
                  <th>Concluídas</th>
                  <th>Atrasadas</th>
                  <th>Execução</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => {
                  const storeTasks = tasks.filter((task) => task.storeId === store.id);
                  const storeCompleted = storeTasks.filter((task) => task.status === "completed").length;
                  const storeOverdue = storeTasks.filter((task) => isOverdue(task)).length;
                  return (
                    <tr key={store.id}>
                      <td>
                        <Link href={`/lojas/${store.id}`} className="font-semibold text-pink hover:underline">{store.name}</Link>
                        <p className="text-[10px] text-pink/45">{store.code}</p>
                      </td>
                      <td>{storeTasks.length}</td>
                      <td>{storeCompleted}</td>
                      <td className={storeOverdue ? "font-bold text-pink" : ""}>{storeOverdue}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ProgressBar value={percent(storeCompleted, storeTasks.length)} className="min-w-[80px]" />
                          <span className="w-9 text-right text-xs font-bold text-pink">{percent(storeCompleted, storeTasks.length)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Detalhamento das atividades"
          description={`${tasks.length} registro(s) · ${filterLabel}`}
          icon={<ClipboardList className="h-4 w-4" />}
          action={<span className="badge border border-pink/15 bg-white text-pink/60">{periodLabel}</span>}
        />
        {tasks.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Atividade</th>
                  <th>Categoria</th>
                  <th>Prazo</th>
                  <th>Status</th>
                  <th>Executor</th>
                  <th>Fotos</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <p className="text-xs font-semibold text-pink">{task.storeName}</p>
                      <p className="text-[10px] text-pink/45">{task.storeCode}</p>
                    </td>
                    <td>
                      <Link href={`/atividades/${task.id}`} className="font-semibold text-pink hover:underline">{task.title}</Link>
                      <p className="text-[10px] text-pink/45">{RECURRENCE_LABELS[task.recurrence]}</p>
                    </td>
                    <td className="text-xs text-pink/60">{task.categoryName}</td>
                    <td className="text-xs text-pink/65">
                      <span className={isOverdue(task) ? "font-bold text-pink" : ""}>{dueLabel(task.dueDate, task.dueTime)}</span>
                    </td>
                    <td><StatusBadge status={task.status} /></td>
                    <td className="text-xs text-pink/60">
                      {task.completedByName ?? "—"}
                      {task.completedAt ? <p className="text-[10px] text-pink/40">{formatDateTime(task.completedAt)}</p> : null}
                    </td>
                    <td className="text-xs font-bold text-pink">{task.photoCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="Nenhum registro no período"
            description="Ajuste os filtros ou aguarde a geração automática das atividades recorrentes."
          />
        )}
      </Card>

      <p className="mt-4 text-[11px] text-pink/45">
        Relatório gerado a partir das atividades registradas no sistema. A exportação em PDF e Excel respeita os filtros
        aplicados. Ações de execução disponíveis no histórico: {Object.values(ACTION_LABELS).slice(0, 4).join(", ")} e outras.
      </p>
    </div>
  );
}
````

### `src/app/(app)/usuarios/[id]/editar/page.tsx`

````tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { UserForm } from "@/components/forms/UserForm";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await requireAdmin();
  const backend = getBackend();
  const [account, stores] = await Promise.all([
    backend.getUser(user, params.id),
    backend.listStores(user)
  ]);
  if (!account) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/usuarios" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para usuários
      </Link>
      <PageHeader
        eyebrow="Edição"
        title={account.name}
        subtitle="Atualize os dados de acesso, o perfil e as lojas vinculadas."
      />
      <Card className="p-5 sm:p-6">
        <UserForm user={account} stores={stores.map((store) => ({ id: store.id, name: store.name }))} />
      </Card>
    </div>
  );
}
````

### `src/app/(app)/usuarios/novo/page.tsx`

````tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { Card, PageHeader } from "@/components/ui";
import { UserForm } from "@/components/forms/UserForm";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const user = await requireAdmin();
  const stores = await getBackend().listStores(user);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/usuarios" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-pink/55 hover:text-pink">
        <ArrowLeft className="h-4 w-4" />
        Voltar para usuários
      </Link>
      <PageHeader
        eyebrow="Cadastro"
        title="Novo usuário"
        subtitle="Defina o perfil de acesso e vincule o responsável às lojas da rede."
      />
      <Card className="p-5 sm:p-6">
        <UserForm stores={stores.map((store) => ({ id: store.id, name: store.name }))} />
      </Card>
    </div>
  );
}
````

### `src/app/(app)/usuarios/page.tsx`

````tsx
import Link from "next/link";
import { CheckCircle2, Plus, ShieldCheck, Store, UserRound, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth-server";
import { getBackend } from "@/lib/backend";
import { formatDate } from "@/lib/dates";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { Alert } from "@/components/ui";
import { RoleBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams
}: {
  searchParams: { sucesso?: string };
}) {
  const user = await requireAdmin();
  const users = await getBackend().listUsers(user);

  return (
    <div>
      <PageHeader
        eyebrow="Equipe e permissões"
        title="Usuários"
        subtitle="Gerencie supervisores e gerentes de loja, seus acessos e vínculos com as unidades."
        actions={
          <Link href="/usuarios/novo" className="btn-primary">
            <Plus className="h-4 w-4" />
            Novo usuário
          </Link>
        }
      />

      {searchParams.sucesso ? (
        <div className="mb-5">
          <Alert tone="success">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{searchParams.sucesso}</span>
          </Alert>
        </div>
      ) : null}

      {users.length ? (
        <Card>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Perfil</th>
                  <th>Lojas vinculadas</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-turquesa/15 text-pink">
                          <UserRound className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-bold text-pink">{person.name}</p>
                          <p className="text-[11px] text-pink/50">{person.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge role={person.role} /></td>
                    <td>
                      {person.storeNames.length ? (
                        <div className="flex flex-wrap gap-1">
                          {person.storeNames.map((name) => (
                            <span key={name} className="badge bg-turquesa/15 text-pink">
                              <Store className="h-3 w-3" />
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-pink/45">Sem vínculo</span>
                      )}
                    </td>
                    <td>
                      <span className={cn("badge", person.active ? "bg-pink text-white" : "border border-pink/20 bg-white text-pink/55")}>
                        {person.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="text-xs text-pink/60">{formatDate(person.createdAt)}</td>
                    <td>
                      <div className="flex justify-end">
                        <Link href={`/usuarios/${person.id}/editar`} className="btn-secondary btn-sm">Editar</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Nenhum usuário cadastrado"
            description="Cadastre supervisores e gerentes de loja para começar a operar os checklists."
            action={<Link href="/usuarios/novo" className="btn-primary">Cadastrar usuário</Link>}
          />
        </Card>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-pink/15 px-4 py-3 text-[11px] text-pink/50">
        <ShieldCheck className="h-4 w-4" />
        As permissões são aplicadas no banco de dados e na camada de servidor, não apenas na interface.
        <span className="hidden sm:inline">·</span>
        <span>Senhas são armazenadas com hash e nunca são exibidas.</span>
      </div>
    </div>
  );
}
````

### `src/app/(auth)/layout.tsx`

````tsx
import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-turquesa via-turquesa/85 to-turquesa/60 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[48px] border-white/25" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-pink/10" />
        <div className="absolute right-16 top-1/3 h-24 w-24 rotate-12 rounded-3xl bg-pink/15" />
        <div className="relative z-10 rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur">
          <Logo size="lg" href={null} />
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="mb-3 inline-flex rounded-full border border-pink/20 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-pink">
            Gestão operacional
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-pink">
            A rotina das lojas D&amp;D, visível em um só lugar.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-pink/70">
            Checklists diários, evidências fotográficas, correções e indicadores de desempenho para a gerência
            comercial, supervisores e gerentes de loja.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 text-xs font-semibold text-pink/60">
          <span className="h-2 w-2 rounded-full bg-pink" />
          Identidade D&amp;D · Azul turquesa, rosa pink e branco
        </div>
      </section>

      <section className="flex min-h-screen flex-col justify-center bg-white px-5 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size="md" href={null} />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
````

### `src/app/(auth)/login/page.tsx`

````tsx
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { isLocalMode } from "@/lib/backend";
import { DEMO_CREDENTIALS } from "@/lib/constants";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage({
  searchParams
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams.next?.startsWith("/") ? searchParams.next : "/painel";
  return (
    <LoginForm
      next={next}
      demoCredentials={isLocalMode() ? DEMO_CREDENTIALS : []}
    />
  );
}
````

### `src/app/(auth)/recuperar-senha/page.tsx`

````tsx
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
````

### `src/app/(auth)/redefinir-senha/page.tsx`

````tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { isLocalMode } from "@/lib/backend";
import { getSessionUser } from "@/lib/auth-server";
import { Alert } from "@/components/ui";

export const metadata: Metadata = { title: "Redefinir senha" };

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string };
}) {
  const local = isLocalMode();
  const token = searchParams.token ?? "";
  const session = local ? null : await getSessionUser();
  const valid = local ? Boolean(token) : Boolean(session);

  if (!valid) {
    return (
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink/45">Segurança</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-pink">Link inválido ou expirado</h1>
        <div className="mt-5">
          <Alert tone="error">
            Solicite um novo link de recuperação para redefinir sua senha.
          </Alert>
        </div>
        <p className="mt-5 text-sm text-pink/60">
          <Link href="/recuperar-senha" className="link">
            Solicitar novo link
          </Link>
        </p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
````

### `src/app/api/cron/gerar/route.ts`

````typescript
import { NextResponse } from "next/server";
import { getBackend, isLocalMode } from "@/lib/backend";
import { todayKey } from "@/lib/dates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  try {
    if (isLocalMode()) {
      const created = await getBackend().ensureGenerated({
        id: "system",
        name: "Sistema",
        email: "system@local",
        role: "admin",
        active: true,
        storeIds: []
      });
      return NextResponse.json({ ok: true, mode: "local", created, date: todayKey() });
    }

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("generate_task_instances", { p_today: todayKey() });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, mode: "supabase", created: Number(data ?? 0), date: todayKey() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Falha ao gerar atividades." },
      { status: 500 }
    );
  }
}
````

### `src/app/api/evidencias/[...path]/route.ts`

````typescript
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessStore } from "@/lib/access";
import { getBackend, isLocalMode } from "@/lib/backend";
import { getDb, uploadsDir } from "@/lib/backend/local/db";

export const dynamic = "force-dynamic";

function safeSegments(segments: string[]): boolean {
  return segments.every(
    (segment) =>
      Boolean(segment) &&
      segment !== "." &&
      segment !== ".." &&
      !segment.includes("\\") &&
      !segment.includes("/") &&
      !segment.includes("\0")
  );
}

export async function GET(_request: NextRequest, { params }: { params: { path: string[] } }) {
  if (!isLocalMode()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const actor = await getBackend().auth.getSession();
  if (!actor) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const segments = params.path ?? [];
  if (!segments.length || !safeSegments(segments)) {
    return new NextResponse("Caminho inválido.", { status: 400 });
  }

  const storagePath = segments.join("/");
  const db = await getDb();
  const photo = db.photos.find((item) => item.storagePath === storagePath);
  if (!photo) {
    return new NextResponse("Evidência não encontrada.", { status: 404 });
  }

  const task = db.tasks.find((item) => item.id === photo.taskId);
  if (!task || !canAccessStore(actor, task.storeId)) {
    return new NextResponse("Acesso negado.", { status: 403 });
  }

  const base = path.resolve(uploadsDir());
  const absolute = path.resolve(base, storagePath);
  if (absolute !== base && !absolute.startsWith(`${base}${path.sep}`)) {
    return new NextResponse("Caminho inválido.", { status: 400 });
  }

  try {
    const data = await fs.readFile(absolute);
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": photo.mimeType,
        "Content-Length": String(data.byteLength),
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return new NextResponse("Evidência não encontrada.", { status: 404 });
  }
}
````

### `src/app/api/health/route.ts`

````typescript
import { NextResponse } from "next/server";
import { isLocalMode } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "checklist-operacional-dd",
    mode: isLocalMode() ? "local" : "supabase",
    timestamp: new Date().toISOString()
  });
}
````

### `src/app/auth/callback/route.ts`

````typescript
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/redefinir-senha";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/redefinir-senha";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?erro=link-invalido", url.origin));
}
````

### `src/app/globals.css`

````css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --dd-turquesa: #12d9ef;
  --dd-pink: #891745;
  --dd-white: #ffffff;
  --dd-pink-soft: rgba(137, 23, 69, 0.08);
  --dd-turquesa-soft: rgba(18, 217, 239, 0.12);
  --dd-border: rgba(137, 23, 69, 0.14);
}

* {
  border-color: var(--dd-border);
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  background:
    radial-gradient(circle at 100% 0%, rgba(18, 217, 239, 0.11), transparent 34rem),
    radial-gradient(circle at 0% 100%, rgba(137, 23, 69, 0.06), transparent 30rem),
    #ffffff;
  color: rgba(137, 23, 69, 0.86);
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: var(--dd-turquesa);
  color: var(--dd-pink);
}

::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(137, 23, 69, 0.22);
  border-radius: 999px;
  border: 2px solid #ffffff;
}

::-webkit-scrollbar-track {
  background: rgba(18, 217, 239, 0.06);
}

@layer components {
  .card {
    @apply rounded-2xl border bg-white shadow-card;
  }

  .card-flat {
    @apply rounded-2xl border bg-white;
  }

  .btn {
    @apply inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-turquesa focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
  }

  .btn-primary {
    @apply btn bg-pink text-white shadow-soft hover:bg-pink/90 active:scale-[0.99];
  }

  .btn-secondary {
    @apply btn bg-turquesa text-pink hover:bg-turquesa/85 active:scale-[0.99];
  }

  .btn-ghost {
    @apply btn border border-pink/15 bg-white text-pink hover:border-turquesa hover:bg-turquesa/10;
  }

  .btn-danger {
    @apply btn border border-pink/30 bg-white text-pink hover:bg-pink hover:text-white;
  }

  .btn-sm {
    @apply px-3 py-1.5 text-xs;
  }

  .input {
    @apply w-full rounded-xl border border-pink/20 bg-white px-3.5 py-2.5 text-sm text-pink outline-none transition placeholder:text-pink/35 focus:border-turquesa focus:ring-2 focus:ring-turquesa/30;
  }

  .label {
    @apply mb-1.5 block text-xs font-bold uppercase tracking-wide text-pink/75;
  }

  .hint {
    @apply mt-1 text-xs text-pink/55;
  }

  .badge {
    @apply inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold;
  }

  .table-wrap {
    @apply w-full overflow-x-auto;
  }

  .table {
    @apply w-full min-w-[720px] border-collapse text-left text-sm;
  }

  .table thead th {
    @apply border-b border-pink/10 bg-turquesa/5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-pink/60;
  }

  .table tbody td {
    @apply border-b border-pink/10 px-4 py-3 align-middle text-pink/80;
  }

  .table tbody tr:hover {
    @apply bg-turquesa/5;
  }

  .section-title {
    @apply text-sm font-bold uppercase tracking-wide text-pink/70;
  }

  .link {
    @apply font-semibold text-pink underline decoration-turquesa decoration-2 underline-offset-4 hover:text-pink/75;
  }

  .skeleton {
    @apply animate-pulse rounded-xl bg-pink/10;
  }
}

.animate-delay-1 {
  animation-delay: 60ms;
}

.animate-delay-2 {
  animation-delay: 120ms;
}

.animate-delay-3 {
  animation-delay: 180ms;
}

@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: #ffffff;
  }
  .card,
  .card-flat {
    box-shadow: none;
    border-color: rgba(137, 23, 69, 0.2);
  }
}
````

### `src/app/layout.tsx`

````tsx
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`
  },
  description:
    "Plataforma de gestão das rotinas operacionais das lojas D&D: checklists, evidências fotográficas e indicadores.",
  applicationName: APP_NAME,
  icons: {
    icon: "/brand/logo-dd-mark.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12D9EF"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              border: "1px solid rgba(137,23,69,0.16)",
              color: "#891745",
              borderRadius: "14px"
            }
          }}
        />
      </body>
    </html>
  );
}
````

### `src/app/page.tsx`

````tsx
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const user = await getSessionUser();
  redirect(user ? "/painel" : "/login");
}
````

### `src/components/auth/ForgotPasswordForm.tsx`

````tsx
"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Mail } from "lucide-react";
import { requestPasswordResetAction } from "@/actions/auth";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      <Mail className="h-4 w-4" />
      {pending ? "Enviando..." : "Solicitar recuperação"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useFormState(requestPasswordResetAction, initialActionState);
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink/45">Recuperação de acesso</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-pink">Esqueceu a senha?</h1>
      <p className="mt-2 text-sm text-pink/60">
        Informe seu e-mail. Enviaremos as instruções para criar uma nova senha.
      </p>

      <div className="mt-6 space-y-4">
        {state?.error ? <Alert tone="error">{state.error}</Alert> : null}
        {state.message ? (
          <Alert tone="success">
            <p>{state.message}</p>
            {state.resetUrl ? (
              <Link href={state.resetUrl} className="link mt-2 inline-block break-all">
                Abrir link de redefinição
              </Link>
            ) : null}
          </Alert>
        ) : null}

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              E-mail
            </label>
            <input id="email" name="email" type="email" required className="input" placeholder="seu.nome@dd.com.br" />
          </div>
          <Submit />
        </form>

        <p className="text-center text-sm text-pink/60">
          <Link href="/login" className="link">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
````

### `src/components/auth/LoginForm.tsx`

````tsx
"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";

interface DemoCredential {
  role: string;
  email: string;
  password: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      <LogIn className="h-4 w-4" />
      {pending ? "Entrando..." : "Entrar na plataforma"}
    </button>
  );
}

export function LoginForm({
  next,
  demoCredentials
}: {
  next: string;
  demoCredentials: DemoCredential[];
}) {
  const [state, action] = useFormState(loginAction, initialActionState);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <div className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink/45">Acesso restrito</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-pink">Bem-vinda de volta</h1>
        <p className="mt-2 text-sm text-pink/60">
          Entre com seu e-mail corporativo para acompanhar as atividades das lojas.
        </p>
      </div>

      {state?.error ? (
        <div className="mb-4">
          <Alert tone="error">{state.error}</Alert>
        </div>
      ) : null}

      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input"
            placeholder="seu.nome@dd.com.br"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">
              Senha
            </label>
            <Link href="/recuperar-senha" className="mb-1.5 text-xs font-semibold text-pink/60 hover:text-pink">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input pr-11"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-pink/45 hover:bg-pink/5 hover:text-pink"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <SubmitButton />
      </form>

      {demoCredentials.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-pink/20 bg-turquesa/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-pink/60">Acessos de demonstração</p>
          <p className="mt-1 text-xs text-pink/55">
            Dados locais de teste. Clique em um perfil para preencher o formulário.
          </p>
          <div className="mt-3 space-y-2">
            {demoCredentials.map((credential) => (
              <button
                key={credential.email}
                type="button"
                onClick={() => {
                  setEmail(credential.email);
                  setPassword(credential.password);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-pink/10 bg-white px-3 py-2 text-left transition hover:border-turquesa hover:bg-turquesa/5"
              >
                <span>
                  <span className="block text-xs font-bold text-pink">{credential.role}</span>
                  <span className="block text-[11px] text-pink/55">{credential.email}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink/40">Usar</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-pink/50">Senha padrão: {demoCredentials[0]?.password}</p>
        </div>
      ) : null}
    </div>
  );
}
````

### `src/components/auth/ProfilePasswordForm.tsx`

````tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { KeyRound } from "lucide-react";
import { updatePasswordAction } from "@/actions/auth";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <KeyRound className="h-4 w-4" />
      {pending ? "Salvando..." : "Atualizar senha"}
    </button>
  );
}

export function ProfilePasswordForm() {
  const [state, action] = useFormState(updatePasswordAction, initialActionState);
  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}
      <div>
        <label htmlFor="password" className="label">Nova senha *</label>
        <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="label">Confirmar nova senha *</label>
        <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className="input" autoComplete="new-password" />
      </div>
      <p className="hint">Use no mínimo 8 caracteres. A senha é armazenada com hash e nunca é exibida.</p>
      <Submit />
    </form>
  );
}
````

### `src/components/auth/ResetPasswordForm.tsx`

````tsx
"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { KeyRound } from "lucide-react";
import { resetPasswordAction } from "@/actions/auth";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      <KeyRound className="h-4 w-4" />
      {pending ? "Salvando..." : "Definir nova senha"}
    </button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useFormState(resetPasswordAction, initialActionState);
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink/45">Segurança</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-pink">Criar nova senha</h1>
      <p className="mt-2 text-sm text-pink/60">Use no mínimo 8 caracteres e não compartilhe sua senha.</p>

      <div className="mt-6 space-y-4">
        {state?.error ? <Alert tone="error">{state.error}</Alert> : null}
        {state.message ? (
          <Alert tone="success">
            <p>{state.message}</p>
            <Link href="/login" className="link mt-2 inline-block">
              Ir para o login
            </Link>
          </Alert>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div>
              <label htmlFor="password" className="label">
                Nova senha
              </label>
              <input id="password" name="password" type="password" required minLength={8} className="input" autoComplete="new-password" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="input"
                autoComplete="new-password"
              />
            </div>
            <Submit />
          </form>
        )}
        {!state.message ? (
          <p className="text-center text-sm text-pink/60">
            <Link href="/login" className="link">
              Voltar para o login
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
````

### `src/components/brand/Logo.tsx`

````tsx
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  size = "md",
  href = "/painel",
  className
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
}) {
  const widths = { sm: 132, md: 178, lg: 300 };
  const image = (
    <Image
      src="/brand/logo-dd.png"
      alt="D&D Checklist Operacional"
      width={widths[size]}
      height={Math.round(widths[size] / 3)}
      priority={size === "lg"}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
  if (!href) return image;
  return (
    <Link href={href} aria-label="Ir para o painel" className="inline-flex">
      {image}
    </Link>
  );
}

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo-dd-mark.png"
      alt="D&D"
      width={size}
      height={size}
      className={cn("rounded-xl", className)}
    />
  );
}
````

### `src/components/forms/CategoryForm.tsx`

````tsx
"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { FolderTree, Save } from "lucide-react";
import { saveCategoryAction } from "@/actions/categories";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";
import type { Category } from "@/lib/types";

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Salvando..." : editing ? "Salvar alterações" : "Criar categoria"}
    </button>
  );
}

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action] = useFormState(saveCategoryAction, initialActionState);
  const editing = Boolean(category);

  return (
    <form action={action} className="space-y-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div>
        <label htmlFor="name" className="label">Nome da categoria *</label>
        <input id="name" name="name" required defaultValue={category?.name} className="input" placeholder="Ex.: Organização de Estoque" />
      </div>
      <div>
        <label htmlFor="description" className="label">Descrição</label>
        <textarea id="description" name="description" rows={3} defaultValue={category?.description} className="input" placeholder="Objetivo e abrangência desta categoria" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sortOrder" className="label">Ordem de exibição</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} step={1} defaultValue={category?.sortOrder ?? 0} className="input" />
        </div>
        <div>
          <label className="label">Status</label>
          <label className="flex h-[42px] cursor-pointer items-center gap-3 rounded-xl border border-pink/20 bg-white px-3.5">
            <input type="checkbox" name="active" defaultChecked={category?.active ?? true} className="h-4 w-4 accent-[#891745]" />
            <span className="flex items-center gap-2 text-sm font-semibold text-pink/75">
              <FolderTree className="h-4 w-4 text-pink/45" />
              Categoria ativa
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-pink/10 pt-4">
        <Link href="/categorias" className="btn-ghost">Cancelar</Link>
        <Submit editing={editing} />
      </div>
    </form>
  );
}
````

### `src/components/forms/StoreForm.tsx`

````tsx
"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { saveStoreAction } from "@/actions/stores";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";
import type { Store } from "@/lib/types";

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar loja"}
    </button>
  );
}

export function StoreForm({
  store,
  managers,
  supervisors
}: {
  store?: Store;
  managers: { id: string; name: string }[];
  supervisors: { id: string; name: string }[];
}) {
  const [state, action] = useFormState(saveStoreAction, initialActionState);
  const editing = Boolean(store);

  return (
    <form action={action} className="space-y-5">
      {store ? <input type="hidden" name="id" value={store.id} /> : null}
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Nome da loja *</label>
          <input id="name" name="name" required defaultValue={store?.name} className="input" placeholder="D&D Centro" />
        </div>
        <div>
          <label htmlFor="code" className="label">Código / identificação *</label>
          <input id="code" name="code" required defaultValue={store?.code} className="input" placeholder="LOJA-001" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="managerId" className="label">Gerente responsável</label>
          <select id="managerId" name="managerId" defaultValue={store?.managerId ?? ""} className="input">
            <option value="">Sem gerente vinculado</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select>
          <p className="hint">O gerente visualiza somente esta loja.</p>
        </div>
        <div>
          <label className="label">Status da unidade</label>
          <label className="flex h-[42px] cursor-pointer items-center gap-3 rounded-xl border border-pink/20 bg-white px-3.5">
            <input type="checkbox" name="active" defaultChecked={store?.active ?? true} className="h-4 w-4 accent-[#891745]" />
            <span className="text-sm font-semibold text-pink/75">Loja ativa</span>
          </label>
          <p className="hint">Lojas inativas não geram novas atividades.</p>
        </div>
      </div>

      <div>
        <p className="label">Supervisores responsáveis</p>
        {supervisors.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {supervisors.map((supervisor) => (
              <label key={supervisor.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-pink/15 bg-white px-3.5 py-2.5 hover:border-turquesa">
                <input
                  type="checkbox"
                  name="supervisorIds"
                  value={supervisor.id}
                  defaultChecked={store?.supervisors.some((item) => item.id === supervisor.id)}
                  className="h-4 w-4 accent-[#891745]"
                />
                <span className="text-sm text-pink/75">{supervisor.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <Alert tone="info">Cadastre supervisores no módulo de usuários antes de vincular lojas.</Alert>
        )}
        <p className="hint">O supervisor visualiza todas as lojas marcadas acima.</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-pink/10 pt-4">
        <Link href="/lojas" className="btn-ghost">Cancelar</Link>
        <Submit editing={editing} />
      </div>
    </form>
  );
}
````

### `src/components/forms/TemplateForm.tsx`

````tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Camera, CalendarClock, Save } from "lucide-react";
import { saveTemplateAction } from "@/actions/templates";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";
import { PHOTO_LABELS, RECURRENCE_LABELS } from "@/lib/constants";
import type { Category, Recurrence, Store, TaskTemplate } from "@/lib/types";

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Salvando..." : editing ? "Salvar alterações" : "Criar modelo"}
    </button>
  );
}

export function TemplateForm({
  template,
  categories,
  stores
}: {
  template?: TaskTemplate;
  categories: Category[];
  stores: Store[];
}) {
  const [state, action] = useFormState(saveTemplateAction, initialActionState);
  const [recurrence, setRecurrence] = useState<Recurrence>(template?.recurrence ?? "daily");
  const editing = Boolean(template);

  return (
    <form action={action} className="space-y-5">
      {template ? <input type="hidden" name="id" value={template.id} /> : null}
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div>
        <label htmlFor="title" className="label">Nome da atividade *</label>
        <input id="title" name="title" required defaultValue={template?.title} className="input" placeholder="Ex.: Organização geral do estoque" />
      </div>

      <div>
        <label htmlFor="description" className="label">Descrição / orientação</label>
        <textarea id="description" name="description" rows={3} defaultValue={template?.description} className="input" placeholder="Explique o que deve ser feito e o padrão esperado." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="categoryId" className="label">Categoria *</label>
          <select id="categoryId" name="categoryId" required defaultValue={template?.categoryId ?? ""} className="input">
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="recurrence" className="label">Periodicidade *</label>
          <select
            id="recurrence"
            name="recurrence"
            className="input"
            value={recurrence}
            onChange={(event) => setRecurrence(event.target.value as Recurrence)}
          >
            {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((key) => (
              <option key={key} value={key}>{RECURRENCE_LABELS[key]}</option>
            ))}
          </select>
          <p className="hint">A geração evita duplicidade por loja e período.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="dueTime" className="label">Horário limite *</label>
          <input id="dueTime" name="dueTime" type="time" required defaultValue={template?.dueTime ?? "18:00"} className="input" />
        </div>
        {recurrence === "once" ? (
          <div>
            <label htmlFor="onceDueDate" className="label">Data da atividade *</label>
            <input
              id="onceDueDate"
              name="onceDueDate"
              type="date"
              required
              defaultValue={template?.onceDueDate ?? ""}
              className="input"
            />
          </div>
        ) : (
          <input type="hidden" name="onceDueDate" value="" />
        )}
        <div>
          <label htmlFor="photoRequirement" className="label">Evidência fotográfica *</label>
          <select id="photoRequirement" name="photoRequirement" defaultValue={template?.photoRequirement ?? "optional"} className="input">
            {(Object.keys(PHOTO_LABELS) as Array<keyof typeof PHOTO_LABELS>).map((key) => (
              <option key={key} value={key}>{PHOTO_LABELS[key]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-pink/10 bg-turquesa/5 p-3 text-xs text-pink/60">
        <p className="flex items-center gap-2 font-semibold text-pink">
          <Camera className="h-4 w-4" />
          Regra de evidência
        </p>
        <p className="mt-1">
          Quando a foto é obrigatória, a atividade não pode ser concluída sem pelo menos uma imagem anexada. A regra é
          validada no servidor e no banco de dados.
        </p>
      </div>

      <div>
        <p className="label">Lojas em que a rotina será gerada *</p>
        {stores.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {stores.map((store) => (
              <label key={store.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-pink/15 bg-white px-3.5 py-2.5 hover:border-turquesa">
                <input
                  type="checkbox"
                  name="storeIds"
                  value={store.id}
                  defaultChecked={template ? template.storeIds.includes(store.id) : store.active}
                  className="h-4 w-4 accent-[#891745]"
                />
                <span className="text-sm text-pink/75">{store.name}</span>
                {!store.active ? <span className="badge border border-pink/15 text-pink/45">Inativa</span> : null}
              </label>
            ))}
          </div>
        ) : (
          <Alert tone="info">Cadastre lojas antes de criar modelos de tarefas.</Alert>
        )}
        <p className="hint">Lojas inativas não recebem novas atividades, mesmo que estejam marcadas.</p>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-pink/15 bg-white px-3.5 py-2.5">
        <input type="checkbox" name="active" defaultChecked={template?.active ?? true} className="h-4 w-4 accent-[#891745]" />
        <span className="flex items-center gap-2 text-sm font-semibold text-pink/75">
          <CalendarClock className="h-4 w-4 text-pink/45" />
          Modelo ativo
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-pink/10 pt-4">
        <Link href="/modelos" className="btn-ghost">Cancelar</Link>
        <Submit editing={editing} />
      </div>
    </form>
  );
}
````

### `src/components/forms/UserForm.tsx`

````tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Save, ShieldCheck } from "lucide-react";
import { saveUserAction } from "@/actions/users";
import { initialActionState } from "@/actions/state";
import { Alert } from "@/components/ui";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants";
import type { UserAccount } from "@/lib/types";

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Salvando..." : editing ? "Salvar alterações" : "Cadastrar usuário"}
    </button>
  );
}

export function UserForm({
  user,
  stores
}: {
  user?: UserAccount;
  stores: { id: string; name: string }[];
}) {
  const [state, action] = useFormState(saveUserAction, initialActionState);
  const [role, setRole] = useState<"supervisor" | "manager">(user?.role === "manager" ? "manager" : "supervisor");
  const editing = Boolean(user);
  const selectedStoreIds = user?.storeIds ?? [];

  return (
    <form action={action} className="space-y-5">
      {user ? <input type="hidden" name="id" value={user.id} /> : null}
      {state?.error ? <Alert tone="error">{state.error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Nome completo *</label>
          <input id="name" name="name" required defaultValue={user?.name} className="input" placeholder="Nome do responsável" />
        </div>
        <div>
          <label htmlFor="email" className="label">E-mail de acesso *</label>
          <input id="email" name="email" type="email" required defaultValue={user?.email} className="input" placeholder="nome@empresa.com" autoComplete="email" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="label">Perfil de acesso *</label>
          <select
            id="role"
            name="role"
            className="input"
            value={role}
            onChange={(event) => setRole(event.target.value as "supervisor" | "manager")}
          >
            <option value="supervisor">{ROLE_LABELS.supervisor}</option>
            <option value="manager">{ROLE_LABELS.manager}</option>
          </select>
          <p className="hint">{ROLE_DESCRIPTIONS[role]}</p>
        </div>
        <div>
          <label htmlFor="password" className="label">{editing ? "Nova senha (opcional)" : "Senha inicial *"}</label>
          <input
            id="password"
            name="password"
            type="password"
            required={!editing}
            minLength={8}
            className="input"
            placeholder={editing ? "Deixe em branco para manter" : "No mínimo 8 caracteres"}
            autoComplete="new-password"
          />
          <p className="hint">A senha nunca é exibida após o cadastro.</p>
        </div>
      </div>

      <div>
        <p className="label">Lojas vinculadas {role === "manager" ? "*" : ""}</p>
        {stores.length ? (
          role === "manager" ? (
            <select name="storeIds" className="input" defaultValue={selectedStoreIds[0] ?? ""} required>
              <option value="">Selecione a loja do gerente</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {stores.map((store) => (
                <label key={store.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-pink/15 bg-white px-3.5 py-2.5 hover:border-turquesa">
                  <input
                    type="checkbox"
                    name="storeIds"
                    value={store.id}
                    defaultChecked={selectedStoreIds.includes(store.id)}
                    className="h-4 w-4 accent-[#891745]"
                  />
                  <span className="text-sm text-pink/75">{store.name}</span>
                </label>
              ))}
            </div>
          )
        ) : (
          <Alert tone="info">Cadastre uma loja antes de vincular o usuário.</Alert>
        )}
        <p className="hint">
          {role === "manager"
            ? "O gerente de loja pode ser vinculado a apenas uma unidade."
            : "O supervisor visualiza todas as lojas marcadas acima."}
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-pink/15 bg-white px-3.5 py-2.5">
        <input type="checkbox" name="active" defaultChecked={user?.active ?? true} className="h-4 w-4 accent-[#891745]" />
        <span className="flex items-center gap-2 text-sm font-semibold text-pink/75">
          <ShieldCheck className="h-4 w-4 text-pink/45" />
          Usuário ativo
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-pink/10 pt-4">
        <Link href="/usuarios" className="btn-ghost">Cancelar</Link>
        <Submit editing={editing} />
      </div>
    </form>
  );
}
````

### `src/components/layout/AppShell.tsx`

````tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  FileSpreadsheet,
  FolderTree,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Store,
  Users,
  X
} from "lucide-react";
import type { Role, SessionUser } from "@/lib/types";
import { NAV_ITEMS, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { Avatar } from "@/components/ui";
import { RoleBadge } from "@/components/ui/badges";
import { Logo } from "@/components/brand/Logo";

const ICONS = {
  LayoutDashboard,
  ClipboardCheck,
  Store,
  Users,
  FolderTree,
  ListChecks,
  FileSpreadsheet,
  History
} as const;

const TITLES: { prefix: string; title: string; description: string }[] = [
  { prefix: "/painel", title: "Painel", description: "Visão geral da operação" },
  { prefix: "/atividades", title: "Atividades", description: "Checklists e evidências" },
  { prefix: "/lojas", title: "Lojas", description: "Unidades da rede" },
  { prefix: "/usuarios", title: "Usuários", description: "Equipe e permissões" },
  { prefix: "/categorias", title: "Categorias", description: "Estrutura dos checklists" },
  { prefix: "/modelos", title: "Modelos de tarefas", description: "Rotinas e periodicidade" },
  { prefix: "/relatorios", title: "Relatórios", description: "Indicadores e exportações" },
  { prefix: "/historico", title: "Histórico", description: "Execuções e auditoria" },
  { prefix: "/perfil", title: "Meu perfil", description: "Dados de acesso" }
];

export function AppShell({
  user,
  demoMode,
  children
}: {
  user: SessionUser;
  demoMode: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const nav = NAV_ITEMS.filter((item) => (item.roles as readonly Role[]).includes(user.role));
  const current = TITLES.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-6">
        <Logo size="sm" href="/painel" />
        <button
          type="button"
          className="rounded-lg p-2 text-pink/60 hover:bg-pink/5 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mx-5 mb-5 h-1 rounded-full bg-gradient-to-r from-turquesa via-turquesa to-pink" />
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Navegação principal">
        {nav.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-turquesa/15 text-pink"
                  : "text-pink/65 hover:bg-pink/5 hover:text-pink"
              )}
              aria-current={active ? "page" : undefined}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-pink" />
              ) : null}
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-pink" : "text-pink/50 group-hover:text-pink")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-pink/10 p-4">
        <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-turquesa/8 p-3">
          <Avatar name={user.name} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-pink">{user.name}</p>
            <p className="truncate text-[11px] text-pink/55">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn-ghost w-full justify-start text-xs">
            <LogOut className="h-4 w-4" />
            Sair da plataforma
          </button>
        </form>
        {demoMode ? (
          <p className="mt-3 rounded-lg border border-dashed border-pink/20 px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-pink/50">
            Modo local de demonstração
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-[268px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] border-r border-pink/10 bg-white lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-pink/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />
          <aside className="absolute inset-y-0 left-0 w-[286px] max-w-[86vw] border-r border-pink/10 bg-white shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-pink/10 bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-pink hover:bg-pink/5 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-pink">{current?.title ?? "Checklist Operacional"}</p>
              <p className="hidden truncate text-[11px] text-pink/50 sm:block">
                {current?.description ?? "D&D"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <RoleBadge role={user.role} className="hidden sm:inline-flex" />
            <Link href="/perfil" className="flex items-center gap-2 rounded-full border border-pink/10 py-1 pl-1 pr-3 hover:bg-turquesa/10">
              <Avatar name={user.name} size={30} />
              <span className="hidden max-w-[140px] truncate text-xs font-semibold text-pink sm:block">
                {user.name}
              </span>
            </Link>
            <form action={logoutAction} className="hidden sm:block">
              <button type="submit" className="rounded-lg p-2 text-pink/60 hover:bg-pink/5 hover:text-pink" aria-label="Sair">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <footer className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 pb-6 text-[11px] text-pink/40 sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} D&D · Checklist Operacional</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-turquesa" />
          {demoMode ? "Dados locais de demonstração" : "Conectado ao Supabase"}
        </span>
      </footer>
    </div>
  );
}
````

### `src/components/photos/PhotoGallery.tsx`

````tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { deletePhotoAction } from "@/actions/tasks";
import type { TaskPhoto } from "@/lib/types";
import { formatDateTime } from "@/lib/dates";
import { cn, formatBytes } from "@/lib/utils";

export function PhotoGallery({
  photos,
  canDelete = false,
  columns = 3,
  emptyMessage = "Nenhuma foto anexada."
}: {
  photos: TaskPhoto[];
  canDelete?: boolean;
  columns?: 2 | 3 | 4;
  emptyMessage?: string;
}) {
  const [selected, setSelected] = useState<TaskPhoto | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!photos.length) {
    return <p className="text-sm text-pink/50">{emptyMessage}</p>;
  }

  const grid = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4"
  }[columns];

  function remove(photo: TaskPhoto) {
    if (!window.confirm("Remover esta evidência? A ação será registrada na auditoria.")) return;
    startTransition(async () => {
      const result = await deletePhotoAction(photo.id);
      if (result.ok) {
        toast.success(result.message ?? "Foto removida.");
        setSelected(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Não foi possível remover a foto.");
      }
    });
  }

  return (
    <>
      <div className={cn("grid gap-3", grid)}>
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelected(photo)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-pink/10 bg-turquesa/5 text-left"
          >
            {photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.url}
                alt={`Evidência de ${formatDateTime(photo.createdAt)}`}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-pink/50">Prévia indisponível</span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-pink/80 to-transparent px-2.5 pb-2 pt-6 text-[10px] font-semibold text-white">
              <span className="truncate">{photo.isOriginal ? "Original" : "Otimizada"}</span>
              <ZoomIn className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-pink/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da evidência"
          onClick={() => setSelected(null)}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-pink/10 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-pink">Evidência fotográfica</p>
                <p className="text-[11px] text-pink/55">
                  {formatDateTime(selected.createdAt)} · {formatBytes(selected.sizeBytes)} · {selected.uploadedByName}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-pink/60 hover:bg-pink/5 hover:text-pink"
                onClick={() => setSelected(null)}
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-turquesa/5 p-3">
              {selected.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.url} alt="Evidência ampliada" className="mx-auto max-h-[68vh] w-auto rounded-xl object-contain" />
              ) : (
                <p className="p-10 text-center text-sm text-pink/50">Prévia indisponível.</p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3">
              {selected.url ? (
                <a href={selected.url} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
                  <Download className="h-4 w-4" />
                  Abrir original
                </a>
              ) : null}
              {canDelete ? (
                <button type="button" className="btn-danger btn-sm" onClick={() => remove(selected)} disabled={pending}>
                  <Trash2 className="h-4 w-4" />
                  {pending ? "Removendo..." : "Remover evidência"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
````

### `src/components/photos/PhotoUploader.tsx`

````tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { uploadPhotoAction } from "@/actions/tasks";
import { compressImage, type CompressedImage } from "@/lib/image-client";
import { MAX_PHOTO_MB, MAX_PHOTOS_PER_TASK } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";

interface Preview {
  compressed: CompressedImage;
  previewUrl: string;
}

export function PhotoUploader({
  taskId,
  photoCount,
  required
}: {
  taskId: string;
  photoCount: number;
  required: boolean;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const remaining = Math.max(0, MAX_PHOTOS_PER_TASK - photoCount);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError("");
    const files = Array.from(fileList).slice(0, remaining);
    if (!files.length) {
      setError(`Limite de ${MAX_PHOTOS_PER_TASK} fotos por atividade atingido.`);
      return;
    }
    try {
      const next: Preview[] = [];
      for (const file of files) {
        if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
          throw new Error(`${file.name}: a imagem ultrapassa ${MAX_PHOTO_MB} MB.`);
        }
        const compressed = await compressImage(file);
        next.push({ compressed, previewUrl: URL.createObjectURL(compressed.file) });
      }
      setPreviews((current) => [...current, ...next]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível preparar a imagem.");
    } finally {
      if (cameraRef.current) cameraRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  function removePreview(index: number) {
    setPreviews((current) => {
      const copy = [...current];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  }

  async function uploadAll() {
    if (!previews.length) return;
    setUploading(true);
    setError("");
    let success = 0;
    try {
      for (const preview of previews) {
        const formData = new FormData();
        formData.set("photo", preview.compressed.file);
        formData.set("width", String(preview.compressed.width));
        formData.set("height", String(preview.compressed.height));
        if (process.env.NEXT_PUBLIC_PRESERVE_ORIGINALS === "true") {
          formData.set("original", preview.compressed.original);
        }
        const result = await uploadPhotoAction(taskId, formData);
        if (!result.ok) {
          toast.error(result.error ?? "Falha ao enviar a foto.");
        } else {
          success += 1;
        }
      }
      if (success > 0) {
        toast.success(`${success} foto(s) enviada(s) com sucesso.`);
        previews.forEach((preview) => URL.revokeObjectURL(preview.previewUrl));
        setPreviews([]);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar as fotos.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-pink/65">
          {photoCount} de {MAX_PHOTOS_PER_TASK} fotos · limite {MAX_PHOTO_MB} MB por imagem
        </p>
        {required && photoCount === 0 ? (
          <span className="badge border border-pink bg-pink/5 text-pink">Foto obrigatória</span>
        ) : null}
      </div>

      {remaining > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={() => cameraRef.current?.click()} disabled={uploading}>
            <Camera className="h-4 w-4" />
            Tirar foto
          </button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => galleryRef.current?.click()} disabled={uploading}>
            <ImagePlus className="h-4 w-4" />
            Escolher da galeria
          </button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-pink/20 px-3 py-2 text-xs text-pink/55">
          Limite de fotos atingido para esta atividade.
        </p>
      )}

      {error ? <p className="rounded-lg border border-pink/30 bg-pink/5 px-3 py-2 text-xs text-pink">{error}</p> : null}

      {previews.length ? (
        <div className="space-y-3 rounded-xl border border-pink/10 bg-turquesa/5 p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {previews.map((preview, index) => (
              <div key={preview.previewUrl} className="group relative overflow-hidden rounded-lg border border-pink/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.previewUrl} alt="Prévia da foto" className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-pink shadow hover:bg-pink hover:text-white"
                  aria-label="Remover prévia"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <p className="truncate px-2 py-1 text-[10px] text-pink/55">{formatBytes(preview.compressed.file.size)}</p>
              </div>
            ))}
          </div>
          <button type="button" className="btn-primary btn-sm w-full" onClick={uploadAll} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {uploading ? "Enviando evidências..." : `Enviar ${previews.length} foto(s)`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
````

### `src/components/reports/ReportExport.tsx`

````tsx
"use client";

import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportRow {
  store: string;
  code: string;
  task: string;
  category: string;
  recurrence: string;
  due: string;
  status: string;
  executor: string;
  completedAt: string;
  photos: number;
}

export interface ReportSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  rate: number;
}

function stamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function ReportExport({
  rows,
  summary,
  periodLabel,
  filterLabel
}: {
  rows: ReportRow[];
  summary: ReportSummary;
  periodLabel: string;
  filterLabel: string;
}) {
  function exportExcel() {
    const workbook = XLSX.utils.book_new();
    const dataSheet = XLSX.utils.json_to_sheet(rows);
    dataSheet["!cols"] = [
      { wch: 24 },
      { wch: 12 },
      { wch: 42 },
      { wch: 30 },
      { wch: 14 },
      { wch: 20 },
      { wch: 22 },
      { wch: 24 },
      { wch: 20 },
      { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(workbook, dataSheet, "Atividades");

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ["CHECKLIST OPERACIONAL D&D"],
      ["Relatório operacional"],
      [],
      ["Período", periodLabel],
      ["Filtros", filterLabel],
      [],
      ["Indicador", "Valor"],
      ["Atividades previstas", summary.total],
      ["Concluídas", summary.completed],
      ["Em aberto", summary.pending],
      ["Atrasadas", summary.overdue],
      ["Taxa de execução", `${summary.rate}%`],
      [],
      ["Gerado em", new Date().toLocaleString("pt-BR")]
    ]);
    summarySheet["!cols"] = [{ wch: 28 }, { wch: 48 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    XLSX.writeFile(workbook, `checklist-dd-relatorio-${stamp()}.xlsx`);
  }

  function exportPdf() {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFillColor(137, 23, 69);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 54, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("CHECKLIST OPERACIONAL D&D", 32, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Relatório operacional das lojas", 32, 40);

    doc.setTextColor(137, 23, 69);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Período: ${periodLabel}`, 32, 76);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Filtros: ${filterLabel}`, 32, 92);
    doc.text(
      `Previstas: ${summary.total}  ·  Concluídas: ${summary.completed}  ·  Em aberto: ${summary.pending}  ·  Atrasadas: ${summary.overdue}  ·  Execução: ${summary.rate}%`,
      32,
      106
    );

    autoTable(doc, {
      startY: 122,
      head: [["Loja", "Código", "Atividade", "Categoria", "Prazo", "Status", "Executor", "Fotos"]],
      body: rows.map((row) => [
        row.store,
        row.code,
        row.task,
        row.category,
        row.due,
        row.status,
        row.executor,
        String(row.photos)
      ]),
      styles: { fontSize: 7.5, cellPadding: 4, textColor: [137, 23, 69] },
      headStyles: { fillColor: [137, 23, 69], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [241, 253, 255] },
      margin: { left: 32, right: 32 },
      didDrawPage: () => {
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(7);
        doc.setTextColor(137, 23, 69);
        doc.text(
          `Gerado em ${new Date().toLocaleString("pt-BR")} · Checklist Operacional D&D`,
          32,
          pageHeight - 18
        );
      }
    });

    doc.save(`checklist-dd-relatorio-${stamp()}.pdf`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={exportExcel} className="btn-secondary btn-sm" disabled={!rows.length}>
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </button>
      <button type="button" onClick={exportPdf} className="btn-primary btn-sm" disabled={!rows.length}>
        <FileDown className="h-4 w-4" />
        PDF
      </button>
      <button type="button" onClick={() => window.print()} className="btn-ghost btn-sm no-print">
        <Printer className="h-4 w-4" />
        Imprimir
      </button>
    </div>
  );
}
````

### `src/components/tasks/GenerateTasksButton.tsx`

````tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { generateTasksAction } from "@/actions/templates";

export function GenerateTasksButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn-ghost btn-sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await generateTasksAction();
          if (result.ok) {
            toast.success(result.message ?? "Atividades geradas.");
            router.refresh();
          } else {
            toast.error(result.error ?? "Não foi possível gerar as atividades.");
          }
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Gerar tarefas
    </button>
  );
}
````

### `src/components/tasks/ObservationForm.tsx`

````tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { addObservationAction } from "@/actions/tasks";

export function ObservationForm({ taskId }: { taskId: string }) {
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit() {
    if (content.trim().length < 2) {
      toast.error("Escreva uma observação.");
      return;
    }
    startTransition(async () => {
      const result = await addObservationAction(taskId, content);
      if (result.ok) {
        toast.success(result.message ?? "Observação registrada.");
        setContent("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Não foi possível registrar a observação.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <label htmlFor="observation" className="label">
        Nova observação
      </label>
      <textarea
        id="observation"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        className="input resize-y"
        placeholder="Registre uma orientação, pendência ou acompanhamento..."
      />
      <button type="button" className="btn-ghost btn-sm" onClick={submit} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
        {pending ? "Registrando..." : "Registrar observação"}
      </button>
    </div>
  );
}
````

### `src/components/tasks/TaskActions.tsx`

````tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ThumbsUp,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  approveTaskAction,
  completeTaskAction,
  rejectTaskAction,
  reopenTaskAction,
  requestCorrectionAction,
  startTaskAction
} from "@/actions/tasks";
import type { TaskStatus } from "@/lib/types";
import { Alert } from "@/components/ui";

type Mode = "complete" | "correction" | "reject" | "approve" | "reopen" | null;

export function TaskActions({
  taskId,
  status,
  photoCount,
  photoRequired,
  canReview,
  approved
}: {
  taskId: string;
  status: TaskStatus;
  photoCount: number;
  photoRequired: boolean;
  canReview: boolean;
  approved: boolean;
}) {
  const [mode, setMode] = useState<Mode>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const needsPhoto = photoRequired && photoCount === 0;

  function run(action: () => Promise<{ ok: boolean; error?: string; message?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Ação concluída.");
        setMode(null);
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Não foi possível concluir a ação.");
      }
    });
  }

  function complete() {
    const formData = new FormData();
    formData.set("observation", note);
    run(() => completeTaskAction(taskId, formData));
  }

  function submitReview() {
    if (mode === "correction") run(() => requestCorrectionAction(taskId, note));
    if (mode === "reject") run(() => rejectTaskAction(taskId, note));
    if (mode === "approve") run(() => approveTaskAction(taskId, note));
    if (mode === "reopen") run(() => reopenTaskAction(taskId, note));
  }

  const noteLabel =
    mode === "correction"
      ? "Descreva o que precisa ser corrigido"
      : mode === "reject"
        ? "Motivo da reprovação"
        : mode === "approve"
          ? "Comentário da aprovação (opcional)"
          : "Observação da reabertura (opcional)";

  return (
    <div className="space-y-3">
      {status !== "completed" ? (
        <>
          {status === "pending" ? (
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => run(() => startTaskAction(taskId))}
              disabled={pending}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Iniciar atividade
            </button>
          ) : null}
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => setMode(mode === "complete" ? null : "complete")}
            disabled={pending}
          >
            <CheckCircle2 className="h-4 w-4" />
            Concluir atividade
          </button>
          {needsPhoto ? (
            <Alert tone="error">
              Esta atividade exige pelo menos uma foto. A conclusão ficará bloqueada até o envio da evidência.
            </Alert>
          ) : null}
        </>
      ) : (
        <div className="rounded-xl border border-pink/15 bg-turquesa/5 p-3">
          <p className="flex items-center gap-2 text-sm font-bold text-pink">
            <CheckCircle2 className="h-4 w-4" />
            Atividade concluída
          </p>
          <p className="mt-1 text-xs text-pink/60">
            {approved ? "Execução aprovada pela supervisão." : "Aguardando revisão da supervisão."}
          </p>
        </div>
      )}

      {canReview && status !== "pending" ? (
        <div className="space-y-2 border-t border-pink/10 pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-pink/45">Revisão da supervisão</p>
          <div className="grid grid-cols-2 gap-2">
            {status === "completed" && !approved ? (
              <button type="button" className="btn-secondary btn-sm" onClick={() => setMode(mode === "approve" ? null : "approve")} disabled={pending}>
                <ThumbsUp className="h-4 w-4" />
                Aprovar
              </button>
            ) : null}
            {status === "completed" ? (
              <button type="button" className="btn-ghost btn-sm" onClick={() => setMode(mode === "correction" ? null : "correction")} disabled={pending}>
                <RotateCcw className="h-4 w-4" />
                Correção
              </button>
            ) : null}
            {status === "completed" ? (
              <button type="button" className="btn-danger btn-sm" onClick={() => setMode(mode === "reject" ? null : "reject")} disabled={pending}>
                <XCircle className="h-4 w-4" />
                Reprovar
              </button>
            ) : null}
            <button type="button" className="btn-ghost btn-sm" onClick={() => setMode(mode === "reopen" ? null : "reopen")} disabled={pending}>
              <RotateCcw className="h-4 w-4" />
              Reabrir
            </button>
          </div>
        </div>
      ) : null}

      {mode ? (
        <div className="rounded-xl border border-turquesa bg-turquesa/5 p-3">
          <label className="label" htmlFor="task-action-note">
            {mode === "complete" ? "Observação da conclusão (opcional)" : noteLabel}
          </label>
          <textarea
            id="task-action-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="input resize-y"
            placeholder={mode === "complete" ? "Descreva como a atividade foi executada..." : "Escreva o motivo..."}
          />
          {mode === "complete" ? (
            <button type="button" className="btn-primary mt-2 w-full" onClick={complete} disabled={pending || needsPhoto}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {pending ? "Concluindo..." : needsPhoto ? "Anexe a foto obrigatória" : "Confirmar conclusão"}
            </button>
          ) : (
            <div className="mt-2 flex gap-2">
              <button type="button" className="btn-ghost btn-sm flex-1" onClick={() => setMode(null)} disabled={pending}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary btn-sm flex-1"
                onClick={submitReview}
                disabled={pending || ((mode === "correction" || mode === "reject") && note.trim().length < 3)}
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Confirmar
              </button>
            </div>
          )}
        </div>
      ) : null}

      {canReview && status === "pending" ? (
        <p className="flex items-start gap-2 rounded-xl border border-dashed border-pink/20 p-3 text-xs text-pink/55">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          A revisão fica disponível após a execução da atividade pela loja.
        </p>
      ) : null}
    </div>
  );
}
````

### `src/components/ui/badges.tsx`

````tsx
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  CircleDashed,
  Clock3,
  LoaderCircle,
  ShieldAlert,
  XCircle
} from "lucide-react";
import { PHOTO_LABELS, ROLE_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { PhotoRequirement, Role, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const config: Record<TaskStatus, { className: string; icon: ReactNode }> = {
    pending: {
      className: "border border-pink/20 bg-pink/5 text-pink",
      icon: <CircleDashed className="h-3.5 w-3.5" />
    },
    in_progress: {
      className: "border border-turquesa bg-turquesa/15 text-pink",
      icon: <LoaderCircle className="h-3.5 w-3.5" />
    },
    completed: {
      className: "border border-pink bg-pink text-white",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />
    },
    correction_requested: {
      className: "border border-dashed border-pink bg-white text-pink",
      icon: <AlertTriangle className="h-3.5 w-3.5" />
    },
    rejected: {
      className: "border-2 border-pink bg-white text-pink",
      icon: <XCircle className="h-3.5 w-3.5" />
    }
  };
  return (
    <span className={cn("badge", config[status].className, className)}>
      {config[status].icon}
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PhotoBadge({
  requirement,
  count,
  className
}: {
  requirement: PhotoRequirement;
  count?: number;
  className?: string;
}) {
  const config = {
    required: {
      className: "border border-pink/25 bg-pink/5 text-pink",
      icon: <Camera className="h-3.5 w-3.5" />
    },
    optional: {
      className: "border border-turquesa/50 bg-turquesa/10 text-pink",
      icon: <Camera className="h-3.5 w-3.5" />
    },
    none: {
      className: "border border-pink/15 bg-white text-pink/55",
      icon: <CameraOff className="h-3.5 w-3.5" />
    }
  };
  return (
    <span className={cn("badge", config[requirement].className, className)}>
      {config[requirement].icon}
      {PHOTO_LABELS[requirement]}
      {typeof count === "number" && count > 0 ? ` · ${count}` : ""}
    </span>
  );
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  const config: Record<Role, string> = {
    admin: "bg-pink text-white",
    supervisor: "bg-turquesa text-pink",
    manager: "border border-pink/25 bg-white text-pink"
  };
  return (
    <span className={cn("badge", config[role], className)}>
      {role === "admin" ? <ShieldAlert className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
      {ROLE_LABELS[role]}
    </span>
  );
}
````

### `src/components/ui/index.tsx`

````tsx
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  as: Component = "div"
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return <Component className={cn("card", className)}>{children}</Component>;
}

export function CardHeader({
  title,
  description,
  action,
  icon
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-pink/10 px-5 py-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-turquesa/15 text-pink">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-bold text-pink">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-pink/60">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-pink/45">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-black tracking-tight text-pink sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-pink/65">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon ? (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-turquesa/15 text-pink">
          {icon}
        </span>
      ) : null}
      <h3 className="text-base font-bold text-pink">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-pink/60">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  label
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-pink/60">
          <span>{label}</span>
          <span>{safe}%</span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-pink/10"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progresso"}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-turquesa to-pink transition-all duration-500"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "turquesa"
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone?: "turquesa" | "pink" | "outline";
}) {
  const tones = {
    turquesa: "bg-turquesa/12 text-pink border-turquesa/30",
    pink: "bg-pink text-white border-pink",
    outline: "bg-white text-pink border-pink/20"
  };
  return (
    <div className="card animate-fade-up p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-pink/55">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-pink">{value}</p>
          {hint ? <p className="mt-1 text-xs text-pink/55">{hint}</p> : null}
        </div>
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", tones[tone])}>
          {icon}
        </span>
      </div>
    </div>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-turquesa/20 font-bold text-pink"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {initials || "D&D"}
    </span>
  );
}

export function Alert({
  tone = "info",
  children
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const classes = {
    info: "border-turquesa/40 bg-turquesa/10 text-pink",
    error: "border-pink/30 bg-pink/5 text-pink",
    success: "border-pink/30 bg-white text-pink"
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", classes[tone])} role={tone === "error" ? "alert" : undefined}>
      {children}
    </div>
  );
}
````

### `src/lib/access.ts`

````typescript
import type { SessionUser } from "./types";

export function canAccessStore(actor: SessionUser, storeId: string): boolean {
  if (actor.role === "admin") return true;
  return actor.storeIds.includes(storeId);
}

export function assertStoreAccess(actor: SessionUser, storeId: string): void {
  if (!canAccessStore(actor, storeId)) {
    throw new Error("Você não tem permissão para acessar esta loja.");
  }
}

export function assertAdmin(actor: SessionUser): void {
  if (actor.role !== "admin") {
    throw new Error("Somente a gerente comercial pode executar esta ação.");
  }
}

export function assertSupervisorOrAdmin(actor: SessionUser): void {
  if (actor.role !== "admin" && actor.role !== "supervisor") {
    throw new Error("Somente supervisores e a gerente comercial podem executar esta ação.");
  }
}

export function canReview(actor: SessionUser): boolean {
  return actor.role === "admin" || actor.role === "supervisor";
}
````

### `src/lib/auth-server.ts`

````typescript
import { redirect } from "next/navigation";
import { getBackend } from "./backend";
import type { Role, SessionUser } from "./types";

export async function getSessionUser(): Promise<SessionUser | null> {
  return getBackend().auth.getSession();
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/painel");
  return user;
}

export async function requireRoles(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/painel");
  return user;
}
````

### `src/lib/backend/index.ts`

````typescript
import { isSupabaseConfigured } from "../supabase/config";
import type { Backend } from "./types";
import { createLocalBackend } from "./local";
import { createSupabaseBackend } from "./supabase";

let instance: Backend | null = null;

export function getBackend(): Backend {
  if (!instance) {
    instance = isSupabaseConfigured() ? createSupabaseBackend() : createLocalBackend();
  }
  return instance;
}

export function isLocalMode(): boolean {
  return !isSupabaseConfigured();
}

export type { Backend };
````

### `src/lib/backend/local/auth.ts`

````typescript
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { SessionUser } from "../../types";
import { getDb, mutateDb, newId } from "./db";
import {
  LOCAL_SESSION_COOKIE,
  createLocalSessionToken,
  verifyLocalSessionToken
} from "./session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export async function localSignIn(email: string, password: string): Promise<SessionUser> {
  const db = await getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === normalizeEmail(email));
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    throw new Error("E-mail ou senha inválidos.");
  }
  const token = await createLocalSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });
  cookies().set(LOCAL_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE
  });
  return await localSessionUser(user.id);
}

async function localSessionUser(userId: string): Promise<SessionUser> {
  const db = await getDb();
  const user = db.users.find((item) => item.id === userId);
  if (!user || !user.active) throw new Error("Sessão inválida.");
  const storeIds = db.stores
    .filter((store) => store.active && (store.managerId === user.id || store.supervisorIds.includes(user.id)))
    .map((store) => store.id);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    storeIds: user.role === "admin" ? db.stores.filter((store) => store.active).map((store) => store.id) : storeIds
  };
}

export async function getLocalSession(): Promise<SessionUser | null> {
  const token = cookies().get(LOCAL_SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyLocalSessionToken(token);
  if (!payload) return null;
  try {
    return await localSessionUser(payload.sub);
  } catch {
    return null;
  }
}

export async function localSignOut(): Promise<void> {
  cookies().delete(LOCAL_SESSION_COOKIE);
}

export async function localRequestPasswordReset(email: string): Promise<{ resetUrl?: string }> {
  const normalized = normalizeEmail(email);
  const db = await getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === normalized && item.active);
  if (!user) return {};
  const token = newId().replace(/-/g, "");
  await mutateDb((current) => {
    current.passwordResets = current.passwordResets.filter((item) => item.userId !== user.id || item.used);
    current.passwordResets.push({
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      used: false
    });
  });
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return { resetUrl: `${base}/redefinir-senha?token=${token}` };
}

export async function localResetPassword(token: string, newPassword: string): Promise<void> {
  await mutateDb((db) => {
    const reset = db.passwordResets.find((item) => item.token === token && !item.used);
    if (!reset) throw new Error("Link de recuperação inválido ou já utilizado.");
    if (new Date(reset.expiresAt).getTime() < Date.now()) {
      throw new Error("Link de recuperação expirado. Solicite um novo.");
    }
    const user = db.users.find((item) => item.id === reset.userId);
    if (!user) throw new Error("Usuário não encontrado.");
    user.passwordHash = hashPassword(newPassword);
    reset.used = true;
  });
}

export async function localUpdatePassword(newPassword: string): Promise<void> {
  const session = await getLocalSession();
  if (!session) throw new Error("Sessão expirada. Entre novamente.");
  await mutateDb((db) => {
    const user = db.users.find((item) => item.id === session.id);
    if (!user) throw new Error("Usuário não encontrado.");
    user.passwordHash = hashPassword(newPassword);
  });
}
````

### `src/lib/backend/local/db.ts`

````typescript
import fs from "node:fs";
import path from "node:path";
import type { PhotoRequirement, Recurrence, Role, TaskStatus } from "../../types";

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface LocalStore {
  id: string;
  name: string;
  code: string;
  active: boolean;
  managerId: string | null;
  supervisorIds: string[];
  createdAt: string;
}

export interface LocalCategory {
  id: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
}

export interface LocalTemplate {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  recurrence: Recurrence;
  dueTime: string;
  onceDueDate: string | null;
  photoRequirement: PhotoRequirement;
  active: boolean;
  storeIds: string[];
  createdAt: string;
}

export interface LocalTask {
  id: string;
  templateId: string;
  storeId: string;
  title: string;
  description: string;
  categoryId: string;
  recurrence: Recurrence;
  periodKey: string;
  dueDate: string;
  dueTime: string;
  status: TaskStatus;
  photoRequirement: PhotoRequirement;
  completedAt: string | null;
  completedById: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  observation: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalPhoto {
  id: string;
  taskId: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  isOriginal: boolean;
  uploadedById: string;
  createdAt: string;
}

export interface LocalExecution {
  id: string;
  taskId: string;
  action: string;
  note: string;
  userId: string;
  previousStatus: TaskStatus | null;
  newStatus: TaskStatus | null;
  createdAt: string;
}

export interface LocalObservation {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface LocalAudit {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface LocalPasswordReset {
  token: string;
  userId: string;
  expiresAt: string;
  used: boolean;
}

export interface LocalDb {
  version: number;
  users: LocalUser[];
  stores: LocalStore[];
  categories: LocalCategory[];
  templates: LocalTemplate[];
  tasks: LocalTask[];
  photos: LocalPhoto[];
  executions: LocalExecution[];
  observations: LocalObservation[];
  audit: LocalAudit[];
  passwordResets: LocalPasswordReset[];
}

const globalDb = globalThis as unknown as {
  __ddLocalDb?: { dir: string; promise: Promise<LocalDb> };
  __ddWriteQueue?: Promise<unknown>;
};

export function localDataDir(): string {
  return path.resolve(process.cwd(), process.env.LOCAL_DATA_DIR || ".local");
}

export function uploadsDir(): string {
  return path.join(localDataDir(), "uploads");
}

export async function getDb(): Promise<LocalDb> {
  const dir = localDataDir();
  if (globalDb.__ddLocalDb && globalDb.__ddLocalDb.dir === dir) {
    return globalDb.__ddLocalDb.promise;
  }
  const promise = loadOrCreate(dir);
  globalDb.__ddLocalDb = { dir, promise };
  return promise;
}

async function loadOrCreate(dir: string): Promise<LocalDb> {
  const file = path.join(dir, "data.json");
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, "utf8")) as LocalDb;
  }
  const { createSeedDb } = await import("./seed");
  const db = await createSeedDb(dir);
  await saveDb(db);
  return db;
}

export async function saveDb(db: LocalDb): Promise<void> {
  const dir = localDataDir();
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "data.json");
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(temp, file);
}

export function mutateDb<T>(fn: (db: LocalDb) => T | Promise<T>): Promise<T> {
  const previous = globalDb.__ddWriteQueue ?? Promise.resolve();
  const next = previous.then(async () => {
    const db = await getDb();
    const result = await fn(db);
    await saveDb(db);
    return result;
  });
  globalDb.__ddWriteQueue = next.catch(() => undefined);
  return next;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function resetLocalDbCacheForTests(): void {
  globalDb.__ddLocalDb = undefined;
  globalDb.__ddWriteQueue = undefined;
}
````

### `src/lib/backend/local/index.ts`

````typescript
import fs from "node:fs";
import path from "node:path";
import { assertAdmin, assertStoreAccess, canReview } from "../../access";
import { MAX_PHOTOS_PER_TASK } from "../../constants";
import { isOverdue, periodForRecurrence, toDateKey } from "../../dates";
import type {
  AuditEntry,
  Category,
  CategoryInput,
  HistoryFilters,
  SessionUser,
  Store,
  StoreInput,
  Task,
  TaskDetail,
  TaskExecution,
  TaskFilters,
  TaskObservation,
  TaskPhoto,
  TaskStatus,
  TaskTemplate,
  TaskTemplateInput,
  UploadPhotoInput,
  UserAccount,
  UserInput
} from "../../types";
import type { Backend } from "../types";
import {
  getDb,
  mutateDb,
  newId,
  nowIso,
  uploadsDir,
  type LocalDb,
  type LocalExecution,
  type LocalPhoto,
  type LocalStore,
  type LocalTask,
  type LocalTemplate,
  type LocalUser
} from "./db";
import {
  getLocalSession,
  hashPassword,
  localRequestPasswordReset,
  localResetPassword,
  localSignIn,
  localSignOut,
  localUpdatePassword
} from "./auth";

const ALLOWED_MIME = ["image/webp", "image/jpeg", "image/png"];

function photoUrl(storagePath: string): string {
  return `/api/evidencias/${storagePath.split("/").map(encodeURIComponent).join("/")}`;
}

function mapStore(db: LocalDb, store: LocalStore): Store {
  const manager = db.users.find((user) => user.id === store.managerId);
  return {
    id: store.id,
    name: store.name,
    code: store.code,
    active: store.active,
    managerId: store.managerId,
    managerName: manager?.name ?? null,
    supervisors: store.supervisorIds
      .map((id) => db.users.find((user) => user.id === id))
      .filter((user): user is LocalUser => !!user)
      .map((user) => ({ id: user.id, name: user.name })),
    createdAt: store.createdAt
  };
}

function mapUser(db: LocalDb, user: LocalUser): UserAccount {
  const stores = db.stores.filter(
    (store) => store.managerId === user.id || store.supervisorIds.includes(user.id)
  );
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    storeIds: stores.map((store) => store.id),
    storeNames: stores.map((store) => store.name),
    createdAt: user.createdAt
  };
}

function mapCategory(db: LocalDb, category: LocalDb["categories"][number]): Category {
  return {
    ...category,
    templateCount: db.templates.filter((template) => template.categoryId === category.id).length
  };
}

function mapTemplate(db: LocalDb, template: LocalTemplate): TaskTemplate {
  const category = db.categories.find((item) => item.id === template.categoryId);
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    categoryId: template.categoryId,
    categoryName: category?.name ?? "Sem categoria",
    recurrence: template.recurrence,
    dueTime: template.dueTime,
    onceDueDate: template.onceDueDate,
    photoRequirement: template.photoRequirement,
    active: template.active,
    storeIds: template.storeIds,
    storeNames: template.storeIds
      .map((id) => db.stores.find((store) => store.id === id)?.name)
      .filter((name): name is string => !!name),
    createdAt: template.createdAt
  };
}

function mapTask(db: LocalDb, task: LocalTask): Task {
  const store = db.stores.find((item) => item.id === task.storeId);
  const category = db.categories.find((item) => item.id === task.categoryId);
  const completedBy = db.users.find((user) => user.id === task.completedById);
  const approvedBy = db.users.find((user) => user.id === task.approvedById);
  return {
    id: task.id,
    templateId: task.templateId,
    storeId: task.storeId,
    storeName: store?.name ?? "Loja removida",
    storeCode: store?.code ?? "—",
    title: task.title,
    description: task.description,
    categoryId: task.categoryId,
    categoryName: category?.name ?? "Sem categoria",
    recurrence: task.recurrence,
    periodKey: task.periodKey,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    status: task.status,
    photoRequirement: task.photoRequirement,
    completedAt: task.completedAt,
    completedById: task.completedById,
    completedByName: completedBy?.name ?? null,
    approvedAt: task.approvedAt,
    approvedById: task.approvedById,
    approvedByName: approvedBy?.name ?? null,
    observation: task.observation,
    createdAt: task.createdAt,
    photoCount: db.photos.filter((photo) => photo.taskId === task.id && !photo.isOriginal).length
  };
}

function mapPhoto(db: LocalDb, photo: LocalPhoto): TaskPhoto {
  const user = db.users.find((item) => item.id === photo.uploadedById);
  return {
    id: photo.id,
    taskId: photo.taskId,
    storagePath: photo.storagePath,
    url: photoUrl(photo.storagePath),
    mimeType: photo.mimeType,
    sizeBytes: photo.sizeBytes,
    isOriginal: photo.isOriginal,
    uploadedById: photo.uploadedById,
    uploadedByName: user?.name ?? "Usuário removido",
    createdAt: photo.createdAt
  };
}

function mapExecution(db: LocalDb, execution: LocalExecution, task?: LocalTask): TaskExecution {
  const user = db.users.find((item) => item.id === execution.userId);
  const relatedTask = task ?? db.tasks.find((item) => item.id === execution.taskId);
  const store = relatedTask ? db.stores.find((item) => item.id === relatedTask.storeId) : undefined;
  return {
    id: execution.id,
    taskId: execution.taskId,
    action: execution.action as TaskExecution["action"],
    note: execution.note,
    userId: execution.userId,
    userName: user?.name ?? "Usuário removido",
    previousStatus: execution.previousStatus,
    newStatus: execution.newStatus,
    createdAt: execution.createdAt,
    taskTitle: relatedTask?.title,
    storeName: store?.name
  };
}

function mapAudit(db: LocalDb, entry: LocalDb["audit"][number]): AuditEntry {
  const actor = db.users.find((user) => user.id === entry.actorId);
  return {
    id: entry.id,
    actorId: entry.actorId,
    actorName: actor?.name ?? "Sistema",
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    details: entry.details,
    createdAt: entry.createdAt
  };
}

function addAudit(
  db: LocalDb,
  actor: SessionUser,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown> = {}
): void {
  db.audit.unshift({
    id: newId(),
    actorId: actor.id,
    action,
    entityType,
    entityId,
    details,
    createdAt: nowIso()
  });
  if (db.audit.length > 3000) db.audit.length = 3000;
}

function addExecution(
  db: LocalDb,
  task: LocalTask,
  actor: SessionUser,
  action: LocalExecution["action"],
  note: string,
  previousStatus: TaskStatus | null,
  newStatus: TaskStatus | null
): void {
  db.executions.push({
    id: newId(),
    taskId: task.id,
    action,
    note,
    userId: actor.id,
    previousStatus,
    newStatus,
    createdAt: nowIso()
  });
}

function findAccessibleTask(db: LocalDb, actor: SessionUser, taskId: string): LocalTask {
  const task = db.tasks.find((item) => item.id === taskId);
  if (!task) throw new Error("Atividade não encontrada.");
  assertStoreAccess(actor, task.storeId);
  return task;
}

function validateStoreRelations(db: LocalDb, input: StoreInput): void {
  if (input.managerId) {
    const manager = db.users.find((user) => user.id === input.managerId);
    if (!manager || manager.role !== "manager") throw new Error("Gerente de loja inválido.");
  }
  for (const supervisorId of input.supervisorIds) {
    const supervisor = db.users.find((user) => user.id === supervisorId);
    if (!supervisor || supervisor.role !== "supervisor") throw new Error("Supervisor inválido.");
  }
}

function ensureGeneratedForDate(db: LocalDb, date: Date): number {
  const dateKey = toDateKey(date);
  let created = 0;
  for (const template of db.templates) {
    if (!template.active) continue;
    if (template.recurrence === "once" && !template.onceDueDate) continue;
    if (template.recurrence === "once" && template.onceDueDate! > dateKey) continue;

    const period = periodForRecurrence(template.recurrence, date);
    const dueDate = template.recurrence === "once" ? template.onceDueDate! : period.dueDate;

    for (const storeId of template.storeIds) {
      const store = db.stores.find((item) => item.id === storeId);
      if (!store || !store.active) continue;
      const exists = db.tasks.some(
        (task) =>
          task.templateId === template.id &&
          task.storeId === storeId &&
          task.periodKey === period.periodKey
      );
      if (exists) continue;
      db.tasks.push({
        id: newId(),
        templateId: template.id,
        storeId,
        title: template.title,
        description: template.description,
        categoryId: template.categoryId,
        recurrence: template.recurrence,
        periodKey: period.periodKey,
        dueDate,
        dueTime: template.dueTime,
        status: "pending",
        photoRequirement: template.photoRequirement,
        completedAt: null,
        completedById: null,
        approvedAt: null,
        approvedById: null,
        observation: "",
        createdAt: nowIso(),
        updatedAt: nowIso()
      });
      created += 1;
    }
  }
  return created;
}

function ensureGeneratedForToday(): Promise<number> {
  return mutateDb((db) => {
    const today = new Date();
    let total = 0;
    // Recupera até 7 dias sem geração (proteção para ambientes que ficaram parados).
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - offset);
      total += ensureGeneratedForDate(db, date);
    }
    return total;
  });
}

function filterVisibleTasks(db: LocalDb, actor: SessionUser, filters: TaskFilters): LocalTask[] {
  const supervisorStores = filters.supervisorId
    ? db.stores.filter((store) => store.supervisorIds.includes(filters.supervisorId!)).map((store) => store.id)
    : null;
  const managerStores = filters.managerId
    ? db.stores.filter((store) => store.managerId === filters.managerId).map((store) => store.id)
    : null;

  return db.tasks.filter((task) => {
    if (actor.role !== "admin" && !actor.storeIds.includes(task.storeId)) return false;
    if (filters.storeId && task.storeId !== filters.storeId) return false;
    if (filters.categoryId && task.categoryId !== filters.categoryId) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.from && task.dueDate < filters.from) return false;
    if (filters.to && task.dueDate > filters.to) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (supervisorStores && !supervisorStores.includes(task.storeId)) return false;
    if (managerStores && !managerStores.includes(task.storeId)) return false;
    return true;
  });
}

export function createLocalBackend(): Backend {
  return {
    mode: "local",
    isDemo: true,
    auth: {
      getSession: getLocalSession,
      signIn: localSignIn,
      signOut: localSignOut,
      requestPasswordReset: localRequestPasswordReset,
      resetPasswordWithToken: localResetPassword,
      updatePassword: localUpdatePassword
    },

    async listStores(actor) {
      const db = await getDb();
      return db.stores
        .filter((store) => actor.role === "admin" || actor.storeIds.includes(store.id))
        .map((store) => mapStore(db, store))
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async getStore(actor, id) {
      const db = await getDb();
      const store = db.stores.find((item) => item.id === id);
      if (!store) return null;
      assertStoreAccess(actor, id);
      return mapStore(db, store);
    },

    async createStore(actor, input) {
      assertAdmin(actor);
      return mutateDb((db) => {
        if (db.stores.some((store) => store.code.toLowerCase() === input.code.toLowerCase())) {
          throw new Error("Já existe uma loja com este código.");
        }
        validateStoreRelations(db, input);
        const store: LocalStore = {
          id: newId(),
          name: input.name,
          code: input.code,
          active: input.active,
          managerId: input.managerId,
          supervisorIds: input.supervisorIds,
          createdAt: nowIso()
        };
        db.stores.push(store);
        addAudit(db, actor, "store.created", "store", store.id, { name: store.name, code: store.code });
        return mapStore(db, store);
      });
    },

    async updateStore(actor, id, input) {
      assertAdmin(actor);
      return mutateDb((db) => {
        const store = db.stores.find((item) => item.id === id);
        if (!store) throw new Error("Loja não encontrada.");
        if (
          db.stores.some(
            (item) => item.id !== id && item.code.toLowerCase() === input.code.toLowerCase()
          )
        ) {
          throw new Error("Já existe uma loja com este código.");
        }
        validateStoreRelations(db, input);
        store.name = input.name;
        store.code = input.code;
        store.active = input.active;
        store.managerId = input.managerId;
        store.supervisorIds = input.supervisorIds;
        addAudit(db, actor, "store.updated", "store", store.id, {
          name: store.name,
          active: store.active
        });
        return mapStore(db, store);
      });
    },

    async listUsers(actor) {
      assertAdmin(actor);
      const db = await getDb();
      return db.users
        .filter((user) => user.role !== "admin")
        .map((user) => mapUser(db, user))
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async getUser(actor, id) {
      assertAdmin(actor);
      const db = await getDb();
      const user = db.users.find((item) => item.id === id);
      return user ? mapUser(db, user) : null;
    },

    async createUser(actor, input) {
      assertAdmin(actor);
      return mutateDb((db) => {
        const email = input.email.trim().toLowerCase();
        if (db.users.some((user) => user.email.toLowerCase() === email)) {
          throw new Error("Já existe um usuário com este e-mail.");
        }
        if (input.role === "manager" && input.storeIds.length > 1) {
          throw new Error("Um gerente de loja pode estar vinculado a apenas uma loja.");
        }
        for (const storeId of input.storeIds) {
          if (!db.stores.some((store) => store.id === storeId)) throw new Error("Loja inválida.");
        }
        const user: LocalUser = {
          id: newId(),
          name: input.name,
          email,
          passwordHash: "",
          role: input.role,
          active: input.active,
          createdAt: nowIso()
        };
        user.passwordHash = hashPassword(input.password!);
        db.users.push(user);
        for (const store of db.stores) {
          if (input.role === "manager" && input.storeIds[0] === store.id) store.managerId = user.id;
          if (input.role === "supervisor" && input.storeIds.includes(store.id) && !store.supervisorIds.includes(user.id)) {
            store.supervisorIds.push(user.id);
          }
        }
        addAudit(db, actor, "user.created", "user", user.id, { name: user.name, role: user.role });
        return mapUser(db, user);
      });
    },

    async updateUser(actor, id, input) {
      assertAdmin(actor);
      return mutateDb((db) => {
        const user = db.users.find((item) => item.id === id);
        if (!user) throw new Error("Usuário não encontrado.");
        if (user.role === "admin") throw new Error("O usuário administrador não pode ser editado por este módulo.");
        const email = input.email.trim().toLowerCase();
        if (db.users.some((item) => item.id !== id && item.email.toLowerCase() === email)) {
          throw new Error("Já existe um usuário com este e-mail.");
        }
        if (input.role === "manager" && input.storeIds.length > 1) {
          throw new Error("Um gerente de loja pode estar vinculado a apenas uma loja.");
        }
        for (const storeId of input.storeIds) {
          if (!db.stores.some((store) => store.id === storeId)) throw new Error("Loja inválida.");
        }
        user.name = input.name;
        user.email = email;
        user.role = input.role;
        user.active = input.active;
        if (input.password) {
          user.passwordHash = hashPassword(input.password);
        }
        for (const store of db.stores) {
          if (store.managerId === user.id) store.managerId = null;
          store.supervisorIds = store.supervisorIds.filter((supervisorId) => supervisorId !== user.id);
        }
        for (const store of db.stores) {
          if (input.role === "manager" && input.storeIds[0] === store.id) store.managerId = user.id;
          if (input.role === "supervisor" && input.storeIds.includes(store.id)) store.supervisorIds.push(user.id);
        }
        addAudit(db, actor, "user.updated", "user", user.id, {
          name: user.name,
          role: user.role,
          active: user.active
        });
        return mapUser(db, user);
      });
    },

    async listCategories(actor) {
      const db = await getDb();
      return db.categories
        .filter((category) => actor.role === "admin" || category.active)
        .map((category) => mapCategory(db, category))
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    },

    async createCategory(actor, input) {
      assertAdmin(actor);
      return mutateDb((db) => {
        if (db.categories.some((category) => category.name.toLowerCase() === input.name.toLowerCase())) {
          throw new Error("Já existe uma categoria com este nome.");
        }
        const category = {
          id: newId(),
          name: input.name,
          description: input.description,
          active: input.active,
          sortOrder: input.sortOrder
        };
        db.categories.push(category);
        addAudit(db, actor, "category.created", "category", category.id, { name: category.name });
        return mapCategory(db, category);
      });
    },

    async updateCategory(actor, id, input) {
      assertAdmin(actor);
      return mutateDb((db) => {
        const category = db.categories.find((item) => item.id === id);
        if (!category) throw new Error("Categoria não encontrada.");
        if (
          db.categories.some(
            (item) => item.id !== id && item.name.toLowerCase() === input.name.toLowerCase()
          )
        ) {
          throw new Error("Já existe uma categoria com este nome.");
        }
        category.name = input.name;
        category.description = input.description;
        category.active = input.active;
        category.sortOrder = input.sortOrder;
        addAudit(db, actor, "category.updated", "category", category.id, { name: category.name });
        return mapCategory(db, category);
      });
    },

    async listTemplates(actor) {
      const db = await getDb();
      return db.templates
        .filter(
          (template) =>
            actor.role === "admin" ||
            (template.active && template.storeIds.some((storeId) => actor.storeIds.includes(storeId)))
        )
        .map((template) => mapTemplate(db, template))
        .sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.title.localeCompare(b.title));
    },

    async getTemplate(actor, id) {
      const db = await getDb();
      const template = db.templates.find((item) => item.id === id);
      if (!template) return null;
      if (actor.role !== "admin" && !template.storeIds.some((storeId) => actor.storeIds.includes(storeId))) {
        throw new Error("Você não tem permissão para acessar este modelo.");
      }
      return mapTemplate(db, template);
    },

    async createTemplate(actor, input) {
      assertAdmin(actor);
      return mutateDb((db) => {
        if (!db.categories.some((category) => category.id === input.categoryId)) {
          throw new Error("Categoria inválida.");
        }
        for (const storeId of input.storeIds) {
          if (!db.stores.some((store) => store.id === storeId)) throw new Error("Loja inválida.");
        }
        const template: LocalTemplate = {
          id: newId(),
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          recurrence: input.recurrence,
          dueTime: input.dueTime,
          onceDueDate: input.recurrence === "once" ? input.onceDueDate ?? toDateKey(new Date()) : null,
          photoRequirement: input.photoRequirement,
          active: input.active,
          storeIds: input.storeIds,
          createdAt: nowIso()
        };
        db.templates.push(template);
        ensureGeneratedForDate(db, new Date());
        addAudit(db, actor, "template.created", "template", template.id, { title: template.title });
        return mapTemplate(db, template);
      });
    },

    async updateTemplate(actor, id, input) {
      assertAdmin(actor);
      return mutateDb((db) => {
        const template = db.templates.find((item) => item.id === id);
        if (!template) throw new Error("Modelo de tarefa não encontrado.");
        if (!db.categories.some((category) => category.id === input.categoryId)) {
          throw new Error("Categoria inválida.");
        }
        for (const storeId of input.storeIds) {
          if (!db.stores.some((store) => store.id === storeId)) throw new Error("Loja inválida.");
        }
        template.title = input.title;
        template.description = input.description;
        template.categoryId = input.categoryId;
        template.recurrence = input.recurrence;
        template.dueTime = input.dueTime;
        template.onceDueDate = input.recurrence === "once" ? input.onceDueDate ?? toDateKey(new Date()) : null;
        template.photoRequirement = input.photoRequirement;
        template.active = input.active;
        template.storeIds = input.storeIds;
        ensureGeneratedForDate(db, new Date());
        addAudit(db, actor, "template.updated", "template", template.id, {
          title: template.title,
          active: template.active
        });
        return mapTemplate(db, template);
      });
    },

    async listTasks(actor, filters = {}) {
      await ensureGeneratedForToday();
      const db = await getDb();
      return filterVisibleTasks(db, actor, filters)
        .map((task) => mapTask(db, task))
        .sort((a, b) => {
          const aKey = `${a.dueDate}${a.dueTime}`;
          const bKey = `${b.dueDate}${b.dueTime}`;
          return aKey.localeCompare(bKey);
        })
        .slice(0, filters.limit ?? 1000);
    },

    async getTask(actor, id) {
      const db = await getDb();
      const task = findAccessibleTask(db, actor, id);
      const mapped = mapTask(db, task);
      return {
        ...mapped,
        photos: db.photos
          .filter((photo) => photo.taskId === id)
          .map((photo) => mapPhoto(db, photo))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
        executions: db.executions
          .filter((execution) => execution.taskId === id)
          .map((execution) => mapExecution(db, execution, task))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
        observations: db.observations
          .filter((observation) => observation.taskId === id)
          .map((observation) => {
            const user = db.users.find((item) => item.id === observation.userId);
            return {
              id: observation.id,
              taskId: observation.taskId,
              userId: observation.userId,
              userName: user?.name ?? "Usuário removido",
              content: observation.content,
              createdAt: observation.createdAt
            };
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      } satisfies TaskDetail;
    },

    async ensureGenerated() {
      return ensureGeneratedForToday();
    },

    async startTask(actor, id) {
      await mutateDb((db) => {
        const task = findAccessibleTask(db, actor, id);
        if (task.status === "completed") throw new Error("Esta atividade já está concluída.");
        if (task.status === "in_progress") return;
        const previous = task.status;
        task.status = "in_progress";
        task.updatedAt = nowIso();
        addExecution(db, task, actor, "started", "", previous, "in_progress");
        addAudit(db, actor, "task.started", "task", task.id, { title: task.title });
      });
    },

    async completeTask(actor, id, observation) {
      await mutateDb((db) => {
        const task = findAccessibleTask(db, actor, id);
        if (task.status === "completed") throw new Error("Esta atividade já está concluída.");
        const photoCount = db.photos.filter((photo) => photo.taskId === task.id && !photo.isOriginal).length;
        if (task.photoRequirement === "required" && photoCount === 0) {
          throw new Error("Foto obrigatória: anexe pelo menos uma evidência antes de concluir.");
        }
        const previous = task.status;
        task.status = "completed";
        task.completedAt = nowIso();
        task.completedById = actor.id;
        task.approvedAt = null;
        task.approvedById = null;
        task.observation = observation;
        task.updatedAt = nowIso();
        addExecution(db, task, actor, "completed", observation || "Atividade concluída.", previous, "completed");
        addAudit(db, actor, "task.completed", "task", task.id, {
          title: task.title,
          photoCount
        });
      });
    },

    async requestCorrection(actor, id, note) {
      if (!canReview(actor)) throw new Error("Somente supervisores e a gerente comercial podem solicitar correção.");
      await mutateDb((db) => {
        const task = findAccessibleTask(db, actor, id);
        if (task.status === "pending") throw new Error("A atividade ainda não foi executada.");
        const previous = task.status;
        task.status = "correction_requested";
        task.approvedAt = null;
        task.approvedById = null;
        task.observation = note;
        task.updatedAt = nowIso();
        addExecution(db, task, actor, "correction_requested", note, previous, "correction_requested");
        addAudit(db, actor, "task.correction_requested", "task", task.id, { title: task.title, note });
      });
    },

    async rejectTask(actor, id, note) {
      if (!canReview(actor)) throw new Error("Somente supervisores e a gerente comercial podem reprovar tarefas.");
      await mutateDb((db) => {
        const task = findAccessibleTask(db, actor, id);
        if (task.status === "pending") throw new Error("A atividade ainda não foi executada.");
        const previous = task.status;
        task.status = "rejected";
        task.approvedAt = null;
        task.approvedById = null;
        task.observation = note;
        task.updatedAt = nowIso();
        addExecution(db, task, actor, "rejected", note, previous, "rejected");
        addAudit(db, actor, "task.rejected", "task", task.id, { title: task.title, note });
      });
    },

    async approveTask(actor, id, note) {
      if (!canReview(actor)) throw new Error("Somente supervisores e a gerente comercial podem aprovar execuções.");
      await mutateDb((db) => {
        const task = findAccessibleTask(db, actor, id);
        if (task.status !== "completed") throw new Error("Somente atividades concluídas podem ser aprovadas.");
        task.approvedAt = nowIso();
        task.approvedById = actor.id;
        task.updatedAt = nowIso();
        addExecution(db, task, actor, "approved", note || "Execução aprovada.", "completed", "completed");
        addAudit(db, actor, "task.approved", "task", task.id, { title: task.title });
      });
    },

    async reopenTask(actor, id, note) {
      if (!canReview(actor)) throw new Error("Somente supervisores e a gerente comercial podem reabrir tarefas.");
      await mutateDb((db) => {
        const task = findAccessibleTask(db, actor, id);
        const previous = task.status;
        task.status = "in_progress";
        task.completedAt = null;
        task.completedById = null;
        task.approvedAt = null;
        task.approvedById = null;
        task.updatedAt = nowIso();
        addExecution(db, task, actor, "reopened", note || "Tarefa reaberta.", previous, "in_progress");
        addAudit(db, actor, "task.reopened", "task", task.id, { title: task.title, note });
      });
    },

    async addObservation(actor, id, content) {
      return mutateDb((db) => {
        const task = findAccessibleTask(db, actor, id);
        const observation: LocalDb["observations"][number] = {
          id: newId(),
          taskId: task.id,
          userId: actor.id,
          content,
          createdAt: nowIso()
        };
        db.observations.push(observation);
        addExecution(db, task, actor, "observation", content, task.status, task.status);
        addAudit(db, actor, "task.observation", "task", task.id, { title: task.title, content });
        return {
          id: observation.id,
          taskId: observation.taskId,
          userId: observation.userId,
          userName: actor.name,
          content: observation.content,
          createdAt: observation.createdAt
        } satisfies TaskObservation;
      });
    },

    async uploadPhoto(actor, taskId, input) {
      if (!ALLOWED_MIME.includes(input.mimeType)) {
        throw new Error("Formato inválido. Envie imagens WebP, JPEG ou PNG.");
      }
      const maxBytes = Number(process.env.NEXT_PUBLIC_MAX_PHOTO_MB ?? 10) * 1024 * 1024;
      if (input.sizeBytes > maxBytes) {
        throw new Error(`A imagem ultrapassa o limite de ${process.env.NEXT_PUBLIC_MAX_PHOTO_MB ?? 10} MB.`);
      }
      const db = await getDb();
      const task = findAccessibleTask(db, actor, taskId);
      if (task.status === "completed" && !canReview(actor)) {
        throw new Error("Atividade concluída. Solicite a reabertura para anexar novas evidências.");
      }
      const count = db.photos.filter((photo) => photo.taskId === taskId && !photo.isOriginal).length;
      if (count >= MAX_PHOTOS_PER_TASK) {
        throw new Error(`Limite de ${MAX_PHOTOS_PER_TASK} fotos por atividade atingido.`);
      }

      const id = newId();
      const extension = input.mimeType === "image/png" ? "png" : input.mimeType === "image/jpeg" ? "jpg" : "webp";
      const relativePath = `${task.storeId}/${taskId}/${id}.${extension}`;
      const absolute = path.join(uploadsDir(), relativePath);
      fs.mkdirSync(path.dirname(absolute), { recursive: true });
      fs.writeFileSync(absolute, input.buffer);

      let originalPhoto: LocalPhoto | null = null;
      if (input.original) {
        const originalId = newId();
        const originalExt = input.original.mimeType === "image/png" ? "png" : input.original.mimeType === "image/jpeg" ? "jpg" : "webp";
        const originalPath = `${task.storeId}/${taskId}/${originalId}-original.${originalExt}`;
        const originalAbsolute = path.join(uploadsDir(), originalPath);
        fs.mkdirSync(path.dirname(originalAbsolute), { recursive: true });
        fs.writeFileSync(originalAbsolute, input.original.buffer);
        originalPhoto = {
          id: originalId,
          taskId,
          storagePath: originalPath,
          mimeType: input.original.mimeType,
          sizeBytes: input.original.sizeBytes,
          width: input.width ?? null,
          height: input.height ?? null,
          isOriginal: true,
          uploadedById: actor.id,
          createdAt: nowIso()
        };
      }

      return mutateDb((current) => {
        const currentTask = findAccessibleTask(current, actor, taskId);
        const photo: LocalPhoto = {
          id,
          taskId,
          storagePath: relativePath,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          width: input.width ?? null,
          height: input.height ?? null,
          isOriginal: false,
          uploadedById: actor.id,
          createdAt: nowIso()
        };
        current.photos.push(photo);
        if (originalPhoto) current.photos.push(originalPhoto);
        addExecution(current, currentTask, actor, "photo_added", input.originalName, null, null);
        addAudit(current, actor, "task.photo_added", "task", taskId, {
          title: currentTask.title,
          sizeBytes: input.sizeBytes,
          mimeType: input.mimeType
        });
        return mapPhoto(current, photo);
      });
    },

    async deletePhoto(actor, photoId) {
      assertAdmin(actor);
      const db = await getDb();
      const photo = db.photos.find((item) => item.id === photoId);
      if (!photo) throw new Error("Foto não encontrada.");
      const task = findAccessibleTask(db, actor, photo.taskId);
      const absolute = path.join(uploadsDir(), photo.storagePath);
      try {
        fs.unlinkSync(absolute);
      } catch {
        // arquivo já removido
      }
      await mutateDb((current) => {
        current.photos = current.photos.filter((item) => item.id !== photoId);
        addAudit(current, actor, "task.photo_removed", "task", photo.taskId, {
          title: task.title,
          storagePath: photo.storagePath
        });
        addExecution(current, task, actor, "photo_removed", "Foto removida pela administração.", null, null);
      });
    },

    async listPhotosForTasks(actor, taskIds) {
      const db = await getDb();
      const allowed = new Set(
        db.tasks
          .filter((task) => actor.role === "admin" || actor.storeIds.includes(task.storeId))
          .map((task) => task.id)
      );
      return db.photos
        .filter((photo) => taskIds.includes(photo.taskId) && allowed.has(photo.taskId))
        .map((photo) => mapPhoto(db, photo))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async listHistory(actor, filters = {}) {
      const db = await getDb();
      const visibleTaskIds = new Set(
        db.tasks
          .filter((task) => {
            if (actor.role !== "admin" && !actor.storeIds.includes(task.storeId)) return false;
            if (filters.storeId && task.storeId !== filters.storeId) return false;
            return true;
          })
          .map((task) => task.id)
      );
      return db.executions
        .filter((execution) => {
          if (!visibleTaskIds.has(execution.taskId)) return false;
          if (filters.action && execution.action !== filters.action) return false;
          if (filters.from && execution.createdAt.slice(0, 10) < filters.from) return false;
          if (filters.to && execution.createdAt.slice(0, 10) > filters.to) return false;
          return true;
        })
        .map((execution) => mapExecution(db, execution))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, filters.limit ?? 300);
    },

    async listAudit(actor, limit = 200) {
      assertAdmin(actor);
      const db = await getDb();
      return db.audit
        .map((entry) => mapAudit(db, entry))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
    }
  };
}
````

### `src/lib/backend/local/seed.ts`

````typescript
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { DEFAULT_CATEGORIES, DEFAULT_TEMPLATES } from "../../constants";
import { addDays, periodForRecurrence, toDateKey } from "../../dates";
import type { TaskStatus } from "../../types";
import type {
  LocalAudit,
  LocalCategory,
  LocalDb,
  LocalExecution,
  LocalObservation,
  LocalPhoto,
  LocalStore,
  LocalTask,
  LocalTemplate,
  LocalUser
} from "./db";
import { newId, nowIso, uploadsDir } from "./db";

const DEMO_PASSWORD = "Dd@2026!";

function isoAt(dateKey: string, hour: number, minute: number): string {
  return new Date(`${dateKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`).toISOString();
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    const map: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" };
    return map[char];
  });
}

async function evidenceBuffer(storeName: string): Promise<Buffer> {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#12D9EF"/>
          <stop offset="100%" stop-color="#891745"/>
        </linearGradient>
      </defs>
      <rect width="960" height="720" fill="url(#g)"/>
      <rect x="48" y="48" width="864" height="624" rx="32" fill="#FFFFFF" fill-opacity="0.94"/>
      <text x="96" y="180" font-family="Segoe UI, Arial" font-size="34" font-weight="700" fill="#891745">EVIDÊNCIA DEMONSTRATIVA</text>
      <text x="96" y="240" font-family="Segoe UI, Arial" font-size="24" fill="#891745" opacity="0.75">${escapeXml(storeName)}</text>
      <text x="96" y="320" font-family="Segoe UI, Arial" font-size="22" fill="#891745" opacity="0.7">Imagem gerada automaticamente para testes do modo local.</text>
      <text x="96" y="360" font-family="Segoe UI, Arial" font-size="22" fill="#891745" opacity="0.7">Substitua por fotos reais ao usar o Supabase.</text>
      <rect x="96" y="430" width="360" height="16" rx="8" fill="#12D9EF"/>
      <rect x="96" y="466" width="250" height="16" rx="8" fill="#891745" fill-opacity="0.55"/>
      <rect x="96" y="502" width="300" height="16" rx="8" fill="#12D9EF" fill-opacity="0.55"/>
      <text x="96" y="620" font-family="Segoe UI, Arial" font-size="18" fill="#891745" opacity="0.55">CHECKLIST OPERACIONAL D&amp;D</text>
    </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 68, mozjpeg: true }).toBuffer();
}

export async function createSeedDb(dir: string): Promise<LocalDb> {
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(path.join(dir, "uploads"), { recursive: true });

  const createdAt = nowIso();
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  const storeIds = [newId(), newId(), newId()];
  const admin: LocalUser = {
    id: newId(),
    name: "Gerente Comercial D&D",
    email: "admin@dd.local",
    passwordHash,
    role: "admin",
    active: true,
    createdAt
  };
  const supervisor1: LocalUser = {
    id: newId(),
    name: "Supervisora Regional",
    email: "supervisor@dd.local",
    passwordHash,
    role: "supervisor",
    active: true,
    createdAt
  };
  const supervisor2: LocalUser = {
    id: newId(),
    name: "Supervisor de Operações",
    email: "supervisor2@dd.local",
    passwordHash,
    role: "supervisor",
    active: true,
    createdAt
  };
  const manager1: LocalUser = {
    id: newId(),
    name: "Gerente Loja Centro",
    email: "gerente@dd.local",
    passwordHash,
    role: "manager",
    active: true,
    createdAt
  };
  const manager2: LocalUser = {
    id: newId(),
    name: "Gerente Loja Shopping",
    email: "gerente2@dd.local",
    passwordHash,
    role: "manager",
    active: true,
    createdAt
  };
  const manager3: LocalUser = {
    id: newId(),
    name: "Gerente Loja Matriz",
    email: "gerente3@dd.local",
    passwordHash,
    role: "manager",
    active: true,
    createdAt
  };
  const users = [admin, supervisor1, supervisor2, manager1, manager2, manager3];

  const stores: LocalStore[] = [
    {
      id: storeIds[0],
      name: "D&D Centro",
      code: "LOJA-001",
      active: true,
      managerId: manager1.id,
      supervisorIds: [supervisor1.id],
      createdAt
    },
    {
      id: storeIds[1],
      name: "D&D Shopping",
      code: "LOJA-002",
      active: true,
      managerId: manager2.id,
      supervisorIds: [supervisor1.id, supervisor2.id],
      createdAt
    },
    {
      id: storeIds[2],
      name: "D&D Matriz",
      code: "LOJA-003",
      active: true,
      managerId: manager3.id,
      supervisorIds: [supervisor1.id, supervisor2.id],
      createdAt
    }
  ];

  const categories: LocalCategory[] = DEFAULT_CATEGORIES.map((category) => ({
    id: newId(),
    name: category.name,
    description: category.description,
    active: true,
    sortOrder: category.sortOrder
  }));

  const today = new Date();
  const templates: LocalTemplate[] = DEFAULT_TEMPLATES.map((template) => {
    const category = categories.find((item) => item.name === template.category);
    if (!category) throw new Error(`Categoria não encontrada no seed: ${template.category}`);
    return {
      id: newId(),
      title: template.title,
      description: template.description,
      categoryId: category.id,
      recurrence: template.recurrence,
      dueTime: template.dueTime,
      onceDueDate: template.recurrence === "once" ? toDateKey(today) : null,
      photoRequirement: template.photoRequirement,
      active: true,
      storeIds: [...storeIds],
      createdAt
    };
  });

  const tasks: LocalTask[] = [];
  const photos: LocalPhoto[] = [];
  const executions: LocalExecution[] = [];
  const observations: LocalObservation[] = [];
  const audit: LocalAudit[] = [];

  const buffers = new Map<string, Buffer>();
  for (const store of stores) {
    buffers.set(store.id, await evidenceBuffer(store.name));
  }

  const taskKeys = new Set<string>();
  const days = 10;

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    const dateKey = toDateKey(date);

    for (let templateIndex = 0; templateIndex < templates.length; templateIndex += 1) {
      const template = templates[templateIndex];
      const period = periodForRecurrence(template.recurrence, date);
      if (template.recurrence === "once" && template.onceDueDate !== dateKey) continue;

      for (let storeIndex = 0; storeIndex < stores.length; storeIndex += 1) {
        const store = stores[storeIndex];
        const key = `${template.id}|${store.id}|${period.periodKey}`;
        if (taskKeys.has(key)) continue;
        taskKeys.add(key);

        const hash = offset * 17 + templateIndex * 7 + storeIndex * 5;
        const isPast = period.dueDate < toDateKey(today);
        const isToday = period.dueDate === toDateKey(today);
        let status: TaskStatus = "pending";
        if (isPast) {
          const mod = hash % 11;
          if (mod === 0) status = "correction_requested";
          else if (mod === 1) status = "rejected";
          else if (mod === 2) status = "in_progress";
          else if (mod === 3) status = "pending";
          else status = "completed";
        } else if (isToday) {
          const mod = hash % 5;
          status = mod === 0 ? "pending" : mod === 1 ? "in_progress" : mod === 4 ? "pending" : "completed";
        }

        const manager = users.find((user) => user.id === store.managerId);
        const taskId = newId();
        const completedAt =
          status === "completed" || status === "correction_requested" || status === "rejected"
            ? isoAt(period.dueDate, 14 + (hash % 3), (hash * 7) % 60)
            : null;
        const approvedAt =
          status === "completed" && hash % 2 === 0
            ? isoAt(period.dueDate, 17, (hash * 3) % 60)
            : null;

        const task: LocalTask = {
          id: taskId,
          templateId: template.id,
          storeId: store.id,
          title: template.title,
          description: template.description,
          categoryId: template.categoryId,
          recurrence: template.recurrence,
          periodKey: period.periodKey,
          dueDate: period.dueDate,
          dueTime: template.dueTime,
          status,
          photoRequirement: template.photoRequirement,
          completedAt,
          completedById: completedAt ? manager?.id ?? supervisor1.id : null,
          approvedAt,
          approvedById: approvedAt ? supervisor1.id : null,
          observation:
            status === "correction_requested"
              ? "Ajustar a organização e reenviar a evidência fotográfica."
              : status === "rejected"
                ? "Execução reprovada: atividade não atende ao padrão da marca."
                : hash % 7 === 0
                  ? "Execução realizada conforme o padrão operacional."
                  : "",
          createdAt: isoAt(dateKey, 8, 0),
          updatedAt: completedAt ?? isoAt(dateKey, 8, 0)
        };
        tasks.push(task);

        if (completedAt) {
          const executor = manager?.id ?? supervisor1.id;
          executions.push({
            id: newId(),
            taskId,
            action: "started",
            note: "",
            userId: executor,
            previousStatus: "pending",
            newStatus: "in_progress",
            createdAt: isoAt(period.dueDate, 13, 0)
          });
          executions.push({
            id: newId(),
            taskId,
            action: "completed",
            note: task.observation || "Atividade concluída.",
            userId: executor,
            previousStatus: "in_progress",
            newStatus: "completed",
            createdAt: completedAt
          });
          audit.push({
            id: newId(),
            actorId: executor,
            action: "task.completed",
            entityType: "task",
            entityId: taskId,
            details: { store: store.name, title: task.title },
            createdAt: completedAt
          });
          if (status === "correction_requested") {
            executions.push({
              id: newId(),
              taskId,
              action: "correction_requested",
              note: "Ajustar a organização e reenviar a evidência fotográfica.",
              userId: supervisor1.id,
              previousStatus: "completed",
              newStatus: "correction_requested",
              createdAt: isoAt(period.dueDate, 17, 10)
            });
          }
          if (status === "rejected") {
            executions.push({
              id: newId(),
              taskId,
              action: "rejected",
              note: "Execução reprovada: atividade não atende ao padrão da marca.",
              userId: supervisor1.id,
              previousStatus: "completed",
              newStatus: "rejected",
              createdAt: isoAt(period.dueDate, 17, 20)
            });
          }
          if (approvedAt) {
            executions.push({
              id: newId(),
              taskId,
              action: "approved",
              note: "Execução aprovada pela supervisão.",
              userId: supervisor1.id,
              previousStatus: "completed",
              newStatus: "completed",
              createdAt: approvedAt
            });
          }

          if (template.photoRequirement !== "none" && (template.photoRequirement === "required" || hash % 2 === 0)) {
            const photoId = newId();
            const relativePath = `${store.id}/${taskId}/${photoId}.jpg`;
            const absolute = path.join(uploadsDir(), relativePath);
            fs.mkdirSync(path.dirname(absolute), { recursive: true });
            const buffer = buffers.get(store.id)!;
            fs.writeFileSync(absolute, buffer);
            photos.push({
              id: photoId,
              taskId,
              storagePath: relativePath,
              mimeType: "image/jpeg",
              sizeBytes: buffer.length,
              width: 960,
              height: 720,
              isOriginal: false,
              uploadedById: executor,
              createdAt: completedAt
            });
            executions.push({
              id: newId(),
              taskId,
              action: "photo_added",
              note: "Evidência fotográfica anexada.",
              userId: executor,
              previousStatus: null,
              newStatus: null,
              createdAt: completedAt
            });
          }
        }

        if (hash % 9 === 0) {
          observations.push({
            id: newId(),
            taskId,
            userId: supervisor1.id,
            content: "Acompanhamento da supervisão: manter o padrão durante a semana.",
            createdAt: isoAt(period.dueDate, 16, 30)
          });
        }
      }
    }
  }

  return {
    version: 1,
    users,
    stores,
    categories,
    templates,
    tasks,
    photos,
    executions,
    observations,
    audit,
    passwordResets: []
  };
}
````

### `src/lib/backend/local/session.ts`

````typescript
import { SignJWT, jwtVerify } from "jose";

export const LOCAL_SESSION_COOKIE = "dd_session";

export interface LocalSessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "supervisor" | "manager";
}

function secretKey(): Uint8Array {
  const secret =
    process.env.LOCAL_AUTH_SECRET ||
    "dd-local-development-secret-change-me-please-2026";
  return new TextEncoder().encode(secret);
}

export async function createLocalSessionToken(payload: LocalSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifyLocalSessionToken(token: string): Promise<LocalSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || !payload.role) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: payload.role as LocalSessionPayload["role"]
    };
  } catch {
    return null;
  }
}
````

### `src/lib/backend/supabase/index.ts`

````typescript
import { assertAdmin, canReview } from "../../access";
import { MAX_PHOTOS_PER_TASK } from "../../constants";
import { todayKey } from "../../dates";
import type {
  AuditEntry,
  Category,
  CategoryInput,
  HistoryFilters,
  SessionUser,
  Store,
  StoreInput,
  Task,
  TaskDetail,
  TaskExecution,
  TaskFilters,
  TaskObservation,
  TaskPhoto,
  TaskTemplate,
  TaskTemplateInput,
  UploadPhotoInput,
  UserAccount,
  UserInput
} from "../../types";
import type { Backend } from "../types";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { createSupabaseServerClient } from "../../supabase/server";
import { storageBucket } from "../../supabase/config";

type Row = Record<string, any>;

const ALLOWED_MIME = ["image/webp", "image/jpeg", "image/png"];

function fail(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ? translateError(error.message, fallback) : fallback);
}

function translateError(message: string, fallback: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("duplicate key") && lower.includes("code")) return "Já existe uma loja com este código.";
  if (lower.includes("duplicate key")) return "Este registro já existe.";
  if (lower.includes("row-level security")) return "Você não tem permissão para executar esta ação.";
  if (lower.includes("foto obrigatória")) return "Foto obrigatória: anexe pelo menos uma evidência antes de concluir.";
  if (lower.includes("invalid login")) return "E-mail ou senha inválidos.";
  if (lower.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (lower.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  return message || fallback;
}

function countOf(value: unknown): number {
  if (Array.isArray(value)) return Number(value[0]?.count ?? 0);
  return Number(value ?? 0);
}

function mapStoreRow(row: Row): Store {
  const supervisors = (row.store_supervisors ?? [])
    .map((item: Row) => item.supervisor)
    .filter(Boolean)
    .map((item: Row) => ({ id: item.id, name: item.name }));
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    active: row.active,
    managerId: row.manager_id,
    managerName: row.manager?.name ?? null,
    supervisors,
    createdAt: row.created_at
  };
}

function mapCategoryRow(row: Row, templateCount = 0): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    active: row.active,
    sortOrder: row.sort_order ?? 0,
    templateCount
  };
}

function mapTemplateRow(row: Row): TaskTemplate {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    categoryId: row.category_id,
    categoryName: row.category?.name ?? "Sem categoria",
    recurrence: row.recurrence,
    dueTime: String(row.due_time ?? "18:00").slice(0, 5),
    onceDueDate: row.once_due_date,
    photoRequirement: row.photo_requirement,
    active: row.active,
    storeIds: (row.template_stores ?? []).map((item: Row) => item.store_id),
    storeNames: (row.template_stores ?? []).map((item: Row) => item.store?.name).filter(Boolean),
    createdAt: row.created_at
  };
}

function mapTaskRow(row: Row): Task {
  return {
    id: row.id,
    templateId: row.template_id,
    storeId: row.store_id,
    storeName: row.store?.name ?? "Loja removida",
    storeCode: row.store?.code ?? "—",
    title: row.title,
    description: row.description ?? "",
    categoryId: row.category_id,
    categoryName: row.category?.name ?? "Sem categoria",
    recurrence: row.recurrence,
    periodKey: row.period_key,
    dueDate: row.due_date,
    dueTime: String(row.due_time ?? "18:00").slice(0, 5),
    status: row.status,
    photoRequirement: row.photo_requirement,
    completedAt: row.completed_at,
    completedById: row.completed_by,
    completedByName: row.completed?.name ?? null,
    approvedAt: row.approved_at,
    approvedById: row.approved_by,
    approvedByName: row.approved?.name ?? null,
    observation: row.observation ?? "",
    createdAt: row.created_at,
    photoCount: countOf(row.photos)
  };
}

async function audit(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  await supabase.rpc("log_audit", {
    p_action: action,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_details: details
  });
}

async function signedPhotos(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  rows: Row[]
): Promise<Row[]> {
  if (!rows.length) return [];
  const paths = rows.map((row) => row.storage_path).filter(Boolean);
  const { data } = await supabase.storage.from(storageBucket()).createSignedUrls(paths, 3600);
  const byPath = new Map((data ?? []).map((item) => [item.path, item.signedUrl]));
  return rows.map((row) => ({ ...row, signed_url: byPath.get(row.storage_path) ?? "" }));
}

function mapPhotoRow(row: Row): TaskPhoto {
  return {
    id: row.id,
    taskId: row.task_id,
    storagePath: row.storage_path,
    url: row.signed_url ?? "",
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes ?? 0,
    isOriginal: row.is_original,
    uploadedById: row.uploaded_by,
    uploadedByName: row.uploader?.name ?? "Usuário",
    createdAt: row.created_at
  };
}

function mapExecutionRow(row: Row): TaskExecution {
  return {
    id: row.id,
    taskId: row.task_id,
    action: row.action,
    note: row.note ?? "",
    userId: row.user_id,
    userName: row.user?.name ?? "Usuário",
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    createdAt: row.created_at,
    taskTitle: row.task?.title,
    storeName: row.task?.store?.name
  };
}

export function createSupabaseBackend(): Backend {
  return {
    mode: "supabase",
    isDemo: false,
    auth: {
      async getSession() {
        const supabase = createSupabaseServerClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user) return null;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id,name,email,role,active")
          .eq("id", user.id)
          .maybeSingle();
        if (!profile || !profile.active) return null;
        const { data: stores } = await supabase.from("stores").select("id").eq("active", true);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          active: profile.active,
          storeIds: (stores ?? []).map((store: Row) => store.id)
        };
      },
      async signIn(email, password) {
        const supabase = createSupabaseServerClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) fail(error, "Não foi possível entrar.");
        const session = await this.getSession();
        if (!session) {
          await supabase.auth.signOut();
          throw new Error("Usuário inativo. Procure a gerente comercial.");
        }
        return session;
      },
      async signOut() {
        const supabase = createSupabaseServerClient();
        await supabase.auth.signOut();
      },
      async requestPasswordReset(email) {
        const supabase = createSupabaseServerClient();
        const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${base}/auth/callback?next=/redefinir-senha`
        });
        if (error) fail(error, "Não foi possível enviar o e-mail de recuperação.");
        return {};
      },
      async resetPasswordWithToken() {
        throw new Error("No Supabase, a redefinição é feita pelo link enviado ao e-mail.");
      },
      async updatePassword(newPassword) {
        const supabase = createSupabaseServerClient();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) fail(error, "Não foi possível atualizar a senha.");
      }
    },

    async listStores(actor) {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("stores")
        .select(
          "id,name,code,active,manager_id,created_at,manager:profiles!stores_manager_id_fkey(id,name),store_supervisors(supervisor:profiles!store_supervisors_supervisor_id_fkey(id,name))"
        )
        .order("name");
      if (error) fail(error, "Não foi possível carregar as lojas.");
      return (data ?? [])
        .filter((row: Row) => actor.role === "admin" || actor.storeIds.includes(row.id))
        .map(mapStoreRow);
    },

    async getStore(actor, id) {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("stores")
        .select(
          "id,name,code,active,manager_id,created_at,manager:profiles!stores_manager_id_fkey(id,name),store_supervisors(supervisor:profiles!store_supervisors_supervisor_id_fkey(id,name))"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) fail(error, "Não foi possível carregar a loja.");
      if (!data) return null;
      return mapStoreRow(data);
    },

    async createStore(actor, input) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("stores")
        .insert({
          name: input.name,
          code: input.code,
          manager_id: input.managerId,
          active: input.active
        })
        .select("id")
        .single();
      if (error || !data) fail(error, "Não foi possível criar a loja.");
      if (input.supervisorIds.length) {
        const { error: linkError } = await supabase.from("store_supervisors").insert(
          input.supervisorIds.map((supervisorId) => ({
            store_id: data.id,
            supervisor_id: supervisorId
          }))
        );
        if (linkError) fail(linkError, "Loja criada, mas não foi possível vincular supervisores.");
      }
      await audit(supabase, "store.created", "store", data.id, { name: input.name, code: input.code });
      const store = await this.getStore(actor, data.id);
      if (!store) throw new Error("Loja criada, mas não foi possível recarregá-la.");
      return store;
    },

    async updateStore(actor, id, input) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const { error } = await supabase
        .from("stores")
        .update({
          name: input.name,
          code: input.code,
          manager_id: input.managerId,
          active: input.active
        })
        .eq("id", id);
      if (error) fail(error, "Não foi possível atualizar a loja.");
      await supabase.from("store_supervisors").delete().eq("store_id", id);
      if (input.supervisorIds.length) {
        const { error: linkError } = await supabase.from("store_supervisors").insert(
          input.supervisorIds.map((supervisorId) => ({ store_id: id, supervisor_id: supervisorId }))
        );
        if (linkError) fail(linkError, "Não foi possível atualizar os supervisores.");
      }
      await audit(supabase, "store.updated", "store", id, { name: input.name, active: input.active });
      const store = await this.getStore(actor, id);
      if (!store) throw new Error("Loja atualizada, mas não foi possível recarregá-la.");
      return store;
    },

    async listUsers(actor) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const [profilesResult, storesResult, linksResult] = await Promise.all([
        supabase.from("profiles").select("id,name,email,role,active,created_at").neq("role", "admin").order("name"),
        supabase.from("stores").select("id,name,manager_id"),
        supabase.from("store_supervisors").select("store_id,supervisor_id")
      ]);
      if (profilesResult.error) fail(profilesResult.error, "Não foi possível carregar os usuários.");
      if (storesResult.error) fail(storesResult.error, "Não foi possível carregar as lojas.");
      if (linksResult.error) fail(linksResult.error, "Não foi possível carregar os vínculos.");
      const storesById = new Map((storesResult.data ?? []).map((store: Row) => [store.id, store]));
      return (profilesResult.data ?? []).map((profile: Row) => {
        const storeIds = new Set<string>();
        for (const store of storesResult.data ?? []) if (store.manager_id === profile.id) storeIds.add(store.id);
        for (const link of linksResult.data ?? []) if (link.supervisor_id === profile.id) storeIds.add(link.store_id);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          active: profile.active,
          storeIds: [...storeIds],
          storeNames: [...storeIds].map((storeId) => storesById.get(storeId)?.name).filter(Boolean),
          createdAt: profile.created_at
        } satisfies UserAccount;
      });
    },

    async getUser(actor, id) {
      const users = await this.listUsers(actor);
      return users.find((user) => user.id === id) ?? null;
    },

    async createUser(actor, input) {
      assertAdmin(actor);
      if (input.role === "manager" && input.storeIds.length > 1) {
        throw new Error("Um gerente de loja pode estar vinculado a apenas uma loja.");
      }
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { name: input.name, role: input.role }
      });
      if (error || !data.user) fail(error, "Não foi possível criar o usuário.");
      const userId = data.user.id;
      try {
        const { error: profileError } = await admin.from("profiles").upsert({
          id: userId,
          name: input.name,
          email: input.email,
          role: input.role,
          active: input.active
        });
        if (profileError) fail(profileError, "Não foi possível criar o perfil do usuário.");
        if (input.role === "manager" && input.storeIds[0]) {
          const { error: storeError } = await admin
            .from("stores")
            .update({ manager_id: userId })
            .eq("id", input.storeIds[0]);
          if (storeError) fail(storeError, "Não foi possível vincular o gerente à loja.");
        }
        if (input.role === "supervisor" && input.storeIds.length) {
          const { error: linkError } = await admin.from("store_supervisors").insert(
            input.storeIds.map((storeId) => ({ store_id: storeId, supervisor_id: userId }))
          );
          if (linkError) fail(linkError, "Não foi possível vincular o supervisor às lojas.");
        }
      } catch (error) {
        await admin.auth.admin.deleteUser(userId);
        throw error;
      }
      const supabase = createSupabaseServerClient();
      await audit(supabase, "user.created", "user", userId, { name: input.name, role: input.role });
      const user = await this.getUser(actor, userId);
      if (!user) throw new Error("Usuário criado, mas não foi possível recarregá-lo.");
      return user;
    },

    async updateUser(actor, id, input) {
      assertAdmin(actor);
      if (input.role === "manager" && input.storeIds.length > 1) {
        throw new Error("Um gerente de loja pode estar vinculado a apenas uma loja.");
      }
      const admin = createSupabaseAdminClient();
      const { data: profile } = await admin.from("profiles").select("role").eq("id", id).maybeSingle();
      if (!profile) throw new Error("Usuário não encontrado.");
      if (profile.role === "admin") throw new Error("O usuário administrador não pode ser editado por este módulo.");
      const authUpdate: Record<string, unknown> = { email: input.email, email_confirm: true };
      if (input.password) authUpdate.password = input.password;
      const { error: authError } = await admin.auth.admin.updateUserById(id, authUpdate);
      if (authError) fail(authError, "Não foi possível atualizar o acesso do usuário.");
      const { error: profileError } = await admin
        .from("profiles")
        .update({ name: input.name, email: input.email, role: input.role, active: input.active })
        .eq("id", id);
      if (profileError) fail(profileError, "Não foi possível atualizar o perfil.");
      await admin.from("stores").update({ manager_id: null }).eq("manager_id", id);
      await admin.from("store_supervisors").delete().eq("supervisor_id", id);
      if (input.role === "manager" && input.storeIds[0]) {
        const { error: storeError } = await admin
          .from("stores")
          .update({ manager_id: id })
          .eq("id", input.storeIds[0]);
        if (storeError) fail(storeError, "Não foi possível vincular o gerente à loja.");
      }
      if (input.role === "supervisor" && input.storeIds.length) {
        const { error: linkError } = await admin.from("store_supervisors").insert(
          input.storeIds.map((storeId) => ({ store_id: storeId, supervisor_id: id }))
        );
        if (linkError) fail(linkError, "Não foi possível vincular o supervisor às lojas.");
      }
      const supabase = createSupabaseServerClient();
      await audit(supabase, "user.updated", "user", id, {
        name: input.name,
        role: input.role,
        active: input.active
      });
      const user = await this.getUser(actor, id);
      if (!user) throw new Error("Usuário atualizado, mas não foi possível recarregá-lo.");
      return user;
    },

    async listCategories(actor) {
      const supabase = createSupabaseServerClient();
      const [categoriesResult, templatesResult] = await Promise.all([
        supabase.from("categories").select("id,name,description,active,sort_order").order("sort_order"),
        supabase.from("task_templates").select("id,category_id")
      ]);
      if (categoriesResult.error) fail(categoriesResult.error, "Não foi possível carregar as categorias.");
      const counts = new Map<string, number>();
      for (const template of templatesResult.data ?? []) {
        counts.set(template.category_id, (counts.get(template.category_id) ?? 0) + 1);
      }
      return (categoriesResult.data ?? [])
        .filter((row: Row) => actor.role === "admin" || row.active)
        .map((row: Row) => mapCategoryRow(row, counts.get(row.id) ?? 0));
    },

    async createCategory(actor, input) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: input.name,
          description: input.description,
          active: input.active,
          sort_order: input.sortOrder
        })
        .select("id,name,description,active,sort_order")
        .single();
      if (error || !data) fail(error, "Não foi possível criar a categoria.");
      await audit(supabase, "category.created", "category", data.id, { name: input.name });
      return mapCategoryRow(data);
    },

    async updateCategory(actor, id, input) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: input.name,
          description: input.description,
          active: input.active,
          sort_order: input.sortOrder
        })
        .eq("id", id)
        .select("id,name,description,active,sort_order")
        .single();
      if (error || !data) fail(error, "Não foi possível atualizar a categoria.");
      await audit(supabase, "category.updated", "category", id, { name: input.name });
      return mapCategoryRow(data);
    },

    async listTemplates(actor) {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("task_templates")
        .select(
          "id,title,description,category_id,recurrence,due_time,once_due_date,photo_requirement,active,created_at,category:categories!task_templates_category_id_fkey(id,name),template_stores(store_id,store:stores(id,name))"
        )
        .order("title");
      if (error) fail(error, "Não foi possível carregar os modelos de tarefas.");
      return (data ?? [])
        .filter(
          (row: Row) =>
            actor.role === "admin" ||
            (row.active && (row.template_stores ?? []).some((item: Row) => actor.storeIds.includes(item.store_id)))
        )
        .map(mapTemplateRow);
    },

    async getTemplate(actor, id) {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("task_templates")
        .select(
          "id,title,description,category_id,recurrence,due_time,once_due_date,photo_requirement,active,created_at,category:categories!task_templates_category_id_fkey(id,name),template_stores(store_id,store:stores(id,name))"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) fail(error, "Não foi possível carregar o modelo.");
      if (!data) return null;
      if (actor.role !== "admin" && !(data.template_stores ?? []).some((item: Row) => actor.storeIds.includes(item.store_id))) {
        throw new Error("Você não tem permissão para acessar este modelo.");
      }
      return mapTemplateRow(data);
    },

    async createTemplate(actor, input) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("task_templates")
        .insert({
          title: input.title,
          description: input.description,
          category_id: input.categoryId,
          recurrence: input.recurrence,
          due_time: input.dueTime,
          once_due_date: input.recurrence === "once" ? input.onceDueDate : null,
          photo_requirement: input.photoRequirement,
          active: input.active,
          created_by: actor.id
        })
        .select("id")
        .single();
      if (error || !data) fail(error, "Não foi possível criar o modelo de tarefa.");
      const { error: linkError } = await supabase.from("template_stores").insert(
        input.storeIds.map((storeId) => ({ template_id: data.id, store_id: storeId }))
      );
      if (linkError) fail(linkError, "Modelo criado, mas não foi possível vincular as lojas.");
      await audit(supabase, "template.created", "template", data.id, { title: input.title });
      const template = await this.getTemplate(actor, data.id);
      if (!template) throw new Error("Modelo criado, mas não foi possível recarregá-lo.");
      return template;
    },

    async updateTemplate(actor, id, input) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const { error } = await supabase
        .from("task_templates")
        .update({
          title: input.title,
          description: input.description,
          category_id: input.categoryId,
          recurrence: input.recurrence,
          due_time: input.dueTime,
          once_due_date: input.recurrence === "once" ? input.onceDueDate : null,
          photo_requirement: input.photoRequirement,
          active: input.active
        })
        .eq("id", id);
      if (error) fail(error, "Não foi possível atualizar o modelo.");
      await supabase.from("template_stores").delete().eq("template_id", id);
      const { error: linkError } = await supabase.from("template_stores").insert(
        input.storeIds.map((storeId) => ({ template_id: id, store_id: storeId }))
      );
      if (linkError) fail(linkError, "Não foi possível atualizar as lojas do modelo.");
      await audit(supabase, "template.updated", "template", id, { title: input.title, active: input.active });
      const template = await this.getTemplate(actor, id);
      if (!template) throw new Error("Modelo atualizado, mas não foi possível recarregá-lo.");
      return template;
    },

    async listTasks(actor, filters = {}) {
      const supabase = createSupabaseServerClient();
      let storeIdsFilter: string[] | null = null;
      if (filters.supervisorId) {
        const { data } = await supabase
          .from("store_supervisors")
          .select("store_id")
          .eq("supervisor_id", filters.supervisorId);
        storeIdsFilter = (data ?? []).map((row: Row) => row.store_id);
        if (!storeIdsFilter.length) return [];
      }
      if (filters.managerId) {
        const { data } = await supabase.from("stores").select("id").eq("manager_id", filters.managerId);
        storeIdsFilter = (data ?? []).map((row: Row) => row.id);
        if (!storeIdsFilter.length) return [];
      }
      let query = supabase
        .from("task_instances")
        .select(
          "id,template_id,store_id,title,description,category_id,recurrence,period_key,due_date,due_time,status,photo_requirement,completed_at,completed_by,approved_at,approved_by,observation,created_at,store:stores!task_instances_store_id_fkey(id,name,code),category:categories!task_instances_category_id_fkey(id,name),completed:profiles!task_instances_completed_by_fkey(id,name),approved:profiles!task_instances_approved_by_fkey(id,name),photos:task_photos(count)"
        )
        .order("due_date", { ascending: true })
        .order("due_time", { ascending: true })
        .limit(filters.limit ?? 1000);
      if (filters.storeId) query = query.eq("store_id", filters.storeId);
      if (storeIdsFilter) query = query.in("store_id", storeIdsFilter);
      if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.from) query = query.gte("due_date", filters.from);
      if (filters.to) query = query.lte("due_date", filters.to);
      if (filters.search) query = query.ilike("title", `%${filters.search}%`);
      const { data, error } = await query;
      if (error) fail(error, "Não foi possível carregar as atividades.");
      return (data ?? []).map(mapTaskRow);
    },

    async getTask(actor, id) {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("task_instances")
        .select(
          "id,template_id,store_id,title,description,category_id,recurrence,period_key,due_date,due_time,status,photo_requirement,completed_at,completed_by,approved_at,approved_by,observation,created_at,store:stores!task_instances_store_id_fkey(id,name,code),category:categories!task_instances_category_id_fkey(id,name),completed:profiles!task_instances_completed_by_fkey(id,name),approved:profiles!task_instances_approved_by_fkey(id,name),photos:task_photos(count)"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) fail(error, "Não foi possível carregar a atividade.");
      if (!data) return null;
      const [photosResult, executionsResult, observationsResult] = await Promise.all([
        supabase
          .from("task_photos")
          .select("id,task_id,storage_path,mime_type,size_bytes,is_original,uploaded_by,created_at,uploader:profiles!task_photos_uploaded_by_fkey(id,name)")
          .eq("task_id", id)
          .order("created_at"),
        supabase
          .from("task_executions")
          .select("id,task_id,action,note,user_id,previous_status,new_status,created_at,user:profiles!task_executions_user_id_fkey(id,name)")
          .eq("task_id", id)
          .order("created_at"),
        supabase
          .from("task_observations")
          .select("id,task_id,user_id,content,created_at,user:profiles!task_observations_user_id_fkey(id,name)")
          .eq("task_id", id)
          .order("created_at", { ascending: false })
      ]);
      const photos = await signedPhotos(supabase, photosResult.data ?? []);
      return {
        ...mapTaskRow(data),
        photos: photos.map(mapPhotoRow),
        executions: (executionsResult.data ?? []).map(mapExecutionRow),
        observations: (observationsResult.data ?? []).map((row: Row) => ({
          id: row.id,
          taskId: row.task_id,
          userId: row.user_id,
          userName: row.user?.name ?? "Usuário",
          content: row.content,
          createdAt: row.created_at
        }))
      } satisfies TaskDetail;
    },

    async ensureGenerated(actor) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase.rpc("generate_task_instances", { p_today: todayKey() });
      if (error) fail(error, "Não foi possível gerar as tarefas.");
      return Number(data ?? 0);
    },

    async startTask(actor, id) {
      const supabase = createSupabaseServerClient();
      const { data: task } = await supabase
        .from("task_instances")
        .select("id,status,title")
        .eq("id", id)
        .maybeSingle();
      if (!task) throw new Error("Atividade não encontrada ou sem permissão.");
      if (task.status === "completed") throw new Error("Esta atividade já está concluída.");
      if (task.status === "in_progress") return;
      const { error } = await supabase
        .from("task_instances")
        .update({ status: "in_progress", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) fail(error, "Não foi possível iniciar a atividade.");
      await supabase.from("task_executions").insert({
        task_id: id,
        action: "started",
        note: "",
        user_id: actor.id,
        previous_status: task.status,
        new_status: "in_progress"
      });
      await audit(supabase, "task.started", "task", id, { title: task.title });
    },

    async completeTask(actor, id, observation) {
      const supabase = createSupabaseServerClient();
      const { data: task } = await supabase
        .from("task_instances")
        .select("id,status,title,photo_requirement")
        .eq("id", id)
        .maybeSingle();
      if (!task) throw new Error("Atividade não encontrada ou sem permissão.");
      if (task.status === "completed") throw new Error("Esta atividade já está concluída.");
      const { count } = await supabase
        .from("task_photos")
        .select("id", { count: "exact", head: true })
        .eq("task_id", id)
        .eq("is_original", false);
      if (task.photo_requirement === "required" && !count) {
        throw new Error("Foto obrigatória: anexe pelo menos uma evidência antes de concluir.");
      }
      const { error } = await supabase
        .from("task_instances")
        .update({
          status: "completed",
          observation,
          completed_at: new Date().toISOString(),
          completed_by: actor.id,
          approved_at: null,
          approved_by: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) fail(error, "Não foi possível concluir a atividade.");
      await supabase.from("task_executions").insert({
        task_id: id,
        action: "completed",
        note: observation || "Atividade concluída.",
        user_id: actor.id,
        previous_status: task.status,
        new_status: "completed"
      });
      await audit(supabase, "task.completed", "task", id, { title: task.title, photoCount: count ?? 0 });
    },

    async requestCorrection(actor, id, note) {
      if (!canReview(actor)) throw new Error("Somente supervisores e a gerente comercial podem solicitar correção.");
      const supabase = createSupabaseServerClient();
      const { data: task } = await supabase.from("task_instances").select("id,status,title").eq("id", id).maybeSingle();
      if (!task) throw new Error("Atividade não encontrada ou sem permissão.");
      if (task.status === "pending") throw new Error("A atividade ainda não foi executada.");
      const { error } = await supabase
        .from("task_instances")
        .update({
          status: "correction_requested",
          observation: note,
          approved_at: null,
          approved_by: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) fail(error, "Não foi possível solicitar a correção.");
      await supabase.from("task_executions").insert({
        task_id: id,
        action: "correction_requested",
        note,
        user_id: actor.id,
        previous_status: task.status,
        new_status: "correction_requested"
      });
      await audit(supabase, "task.correction_requested", "task", id, { title: task.title, note });
    },

    async rejectTask(actor, id, note) {
      if (!canReview(actor)) throw new Error("Somente supervisores e a gerente comercial podem reprovar tarefas.");
      const supabase = createSupabaseServerClient();
      const { data: task } = await supabase.from("task_instances").select("id,status,title").eq("id", id).maybeSingle();
      if (!task) throw new Error("Atividade não encontrada ou sem permissão.");
      if (task.status === "pending") throw new Error("A atividade ainda não foi executada.");
      const { error } = await supabase
        .from("task_instances")
        .update({
          status: "rejected",
          observation: note,
          approved_at: null,
          approved_by: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) fail(error, "Não foi possível reprovar a atividade.");
      await supabase.from("task_executions").insert({
        task_id: id,
        action: "rejected",
        note,
        user_id: actor.id,
        previous_status: task.status,
        new_status: "rejected"
      });
      await audit(supabase, "task.rejected", "task", id, { title: task.title, note });
    },

    async approveTask(actor, id, note) {
      if (!canReview(actor)) throw new Error("Somente supervisores e a gerente comercial podem aprovar execuções.");
      const supabase = createSupabaseServerClient();
      const { data: task } = await supabase.from("task_instances").select("id,status,title").eq("id", id).maybeSingle();
      if (!task) throw new Error("Atividade não encontrada ou sem permissão.");
      if (task.status !== "completed") throw new Error("Somente atividades concluídas podem ser aprovadas.");
      const { error } = await supabase
        .from("task_instances")
        .update({ approved_at: new Date().toISOString(), approved_by: actor.id, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) fail(error, "Não foi possível aprovar a atividade.");
      await supabase.from("task_executions").insert({
        task_id: id,
        action: "approved",
        note: note || "Execução aprovada.",
        user_id: actor.id,
        previous_status: "completed",
        new_status: "completed"
      });
      await audit(supabase, "task.approved", "task", id, { title: task.title });
    },

    async reopenTask(actor, id, note) {
      if (!canReview(actor)) throw new Error("Somente supervisores e a gerente comercial podem reabrir tarefas.");
      const supabase = createSupabaseServerClient();
      const { data: task } = await supabase.from("task_instances").select("id,status,title").eq("id", id).maybeSingle();
      if (!task) throw new Error("Atividade não encontrada ou sem permissão.");
      const { error } = await supabase
        .from("task_instances")
        .update({
          status: "in_progress",
          completed_at: null,
          completed_by: null,
          approved_at: null,
          approved_by: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) fail(error, "Não foi possível reabrir a atividade.");
      await supabase.from("task_executions").insert({
        task_id: id,
        action: "reopened",
        note: note || "Tarefa reaberta.",
        user_id: actor.id,
        previous_status: task.status,
        new_status: "in_progress"
      });
      await audit(supabase, "task.reopened", "task", id, { title: task.title, note });
    },

    async addObservation(actor, id, content) {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("task_observations")
        .insert({ task_id: id, user_id: actor.id, content })
        .select("id,task_id,user_id,content,created_at")
        .single();
      if (error || !data) fail(error, "Não foi possível registrar a observação.");
      await supabase.from("task_executions").insert({
        task_id: id,
        action: "observation",
        note: content,
        user_id: actor.id,
        previous_status: null,
        new_status: null
      });
      await audit(supabase, "task.observation", "task", id, { content });
      return {
        id: data.id,
        taskId: data.task_id,
        userId: data.user_id,
        userName: actor.name,
        content: data.content,
        createdAt: data.created_at
      } satisfies TaskObservation;
    },

    async uploadPhoto(actor, taskId, input) {
      if (!ALLOWED_MIME.includes(input.mimeType)) {
        throw new Error("Formato inválido. Envie imagens WebP, JPEG ou PNG.");
      }
      const maxMb = Number(process.env.NEXT_PUBLIC_MAX_PHOTO_MB ?? 10);
      if (input.sizeBytes > maxMb * 1024 * 1024) {
        throw new Error(`A imagem ultrapassa o limite de ${maxMb} MB.`);
      }
      const supabase = createSupabaseServerClient();
      const { data: task } = await supabase
        .from("task_instances")
        .select("id,store_id,status,title,photo_requirement")
        .eq("id", taskId)
        .maybeSingle();
      if (!task) throw new Error("Atividade não encontrada ou sem permissão.");
      if (task.status === "completed" && !canReview(actor)) {
        throw new Error("Atividade concluída. Solicite a reabertura para anexar novas evidências.");
      }
      const { count } = await supabase
        .from("task_photos")
        .select("id", { count: "exact", head: true })
        .eq("task_id", taskId)
        .eq("is_original", false);
      if ((count ?? 0) >= MAX_PHOTOS_PER_TASK) {
        throw new Error(`Limite de ${MAX_PHOTOS_PER_TASK} fotos por atividade atingido.`);
      }
      const id = crypto.randomUUID();
      const extension = input.mimeType === "image/png" ? "png" : input.mimeType === "image/jpeg" ? "jpg" : "webp";
      const storagePath = `${task.store_id}/${taskId}/${id}.${extension}`;
      const bucket = supabase.storage.from(storageBucket());
      const { error: uploadError } = await bucket.upload(storagePath, input.buffer, {
        contentType: input.mimeType,
        upsert: false,
        cacheControl: "3600"
      });
      if (uploadError) fail(uploadError, "Não foi possível enviar a foto.");
      let originalPath: string | null = null;
      try {
        const { error: insertError } = await supabase.from("task_photos").insert({
          id,
          task_id: taskId,
          storage_path: storagePath,
          mime_type: input.mimeType,
          size_bytes: input.sizeBytes,
          width: input.width ?? null,
          height: input.height ?? null,
          is_original: false,
          uploaded_by: actor.id
        });
        if (insertError) fail(insertError, "Não foi possível registrar a foto.");
        if (input.original) {
          const originalId = crypto.randomUUID();
          const originalExt =
            input.original.mimeType === "image/png" ? "png" : input.original.mimeType === "image/jpeg" ? "jpg" : "webp";
          originalPath = `${task.store_id}/${taskId}/${originalId}-original.${originalExt}`;
          const { error: originalUploadError } = await bucket.upload(originalPath, input.original.buffer, {
            contentType: input.original.mimeType,
            upsert: false,
            cacheControl: "3600"
          });
          if (originalUploadError) {
            originalPath = null;
          } else {
            await supabase.from("task_photos").insert({
              id: originalId,
              task_id: taskId,
              storage_path: originalPath,
              mime_type: input.original.mimeType,
              size_bytes: input.original.sizeBytes,
              width: input.width ?? null,
              height: input.height ?? null,
              is_original: true,
              uploaded_by: actor.id
            });
          }
        }
      } catch (error) {
        await bucket.remove([storagePath, ...(originalPath ? [originalPath] : [])]);
        throw error;
      }
      await supabase.from("task_executions").insert({
        task_id: taskId,
        action: "photo_added",
        note: input.originalName,
        user_id: actor.id,
        previous_status: null,
        new_status: null
      });
      await audit(supabase, "task.photo_added", "task", taskId, {
        title: task.title,
        sizeBytes: input.sizeBytes,
        mimeType: input.mimeType
      });
      const { data: signed } = await bucket.createSignedUrl(storagePath, 3600);
      return {
        id,
        taskId,
        storagePath,
        url: signed?.signedUrl ?? "",
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        isOriginal: false,
        uploadedById: actor.id,
        uploadedByName: actor.name,
        createdAt: new Date().toISOString()
      } satisfies TaskPhoto;
    },

    async deletePhoto(actor, photoId) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const { data: photo } = await supabase
        .from("task_photos")
        .select("id,task_id,storage_path,task:task_instances!task_photos_task_id_fkey(title)")
        .eq("id", photoId)
        .maybeSingle();
      if (!photo) throw new Error("Foto não encontrada.");
      const task = Array.isArray(photo.task) ? photo.task[0] : photo.task;
      await supabase.storage.from(storageBucket()).remove([photo.storage_path]);
      const { error } = await supabase.from("task_photos").delete().eq("id", photoId);
      if (error) fail(error, "Não foi possível remover a foto.");
      await audit(supabase, "task.photo_removed", "task", photo.task_id, {
        storagePath: photo.storage_path,
        title: task?.title
      });
    },

    async listPhotosForTasks(actor, taskIds) {
      if (!taskIds.length) return [];
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("task_photos")
        .select("id,task_id,storage_path,mime_type,size_bytes,is_original,uploaded_by,created_at,uploader:profiles!task_photos_uploaded_by_fkey(id,name)")
        .in("task_id", taskIds)
        .order("created_at", { ascending: false });
      if (error) fail(error, "Não foi possível carregar as fotos.");
      const photos = await signedPhotos(supabase, data ?? []);
      return photos.map(mapPhotoRow);
    },

    async listHistory(actor, filters = {}) {
      const supabase = createSupabaseServerClient();
      let query = supabase
        .from("task_executions")
        .select(
          "id,task_id,action,note,user_id,previous_status,new_status,created_at,user:profiles!task_executions_user_id_fkey(id,name),task:task_instances!task_executions_task_id_fkey(id,title,store_id,store:stores!task_instances_store_id_fkey(id,name))"
        )
        .order("created_at", { ascending: false })
        .limit(Math.min(filters.limit ?? 300, 1000));
      if (filters.action) query = query.eq("action", filters.action);
      if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00`);
      if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59`);
      const { data, error } = await query;
      if (error) fail(error, "Não foi possível carregar o histórico.");
      return (data ?? [])
        .filter((row: Row) => !filters.storeId || row.task?.store_id === filters.storeId)
        .map(mapExecutionRow);
    },

    async listAudit(actor, limit = 200) {
      assertAdmin(actor);
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id,actor_id,action,entity_type,entity_id,details,created_at,actor:profiles!audit_logs_actor_id_fkey(id,name)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) fail(error, "Não foi possível carregar a auditoria.");
      return (data ?? []).map((row: Row) => ({
        id: row.id,
        actorId: row.actor_id,
        actorName: row.actor?.name ?? "Sistema",
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        details: row.details ?? {},
        createdAt: row.created_at
      })) satisfies AuditEntry[];
    }
  };
}
````

### `src/lib/backend/types.ts`

````typescript
import type {
  AuditEntry,
  Category,
  CategoryInput,
  ExecutionAction,
  HistoryFilters,
  SessionUser,
  Store,
  StoreInput,
  TaskDetail,
  TaskExecution,
  TaskFilters,
  TaskObservation,
  TaskPhoto,
  TaskTemplate,
  TaskTemplateInput,
  UploadPhotoInput,
  UserAccount,
  UserInput
} from "../types";

export type BackendMode = "local" | "supabase";

export interface AuthBackend {
  getSession(): Promise<SessionUser | null>;
  signIn(email: string, password: string): Promise<SessionUser>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<{ resetUrl?: string }>;
  resetPasswordWithToken(token: string, newPassword: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
}

export interface Backend {
  mode: BackendMode;
  isDemo: boolean;
  auth: AuthBackend;
  listStores(actor: SessionUser): Promise<Store[]>;
  getStore(actor: SessionUser, id: string): Promise<Store | null>;
  createStore(actor: SessionUser, input: StoreInput): Promise<Store>;
  updateStore(actor: SessionUser, id: string, input: StoreInput): Promise<Store>;
  listUsers(actor: SessionUser): Promise<UserAccount[]>;
  getUser(actor: SessionUser, id: string): Promise<UserAccount | null>;
  createUser(actor: SessionUser, input: UserInput): Promise<UserAccount>;
  updateUser(actor: SessionUser, id: string, input: UserInput): Promise<UserAccount>;
  listCategories(actor: SessionUser): Promise<Category[]>;
  createCategory(actor: SessionUser, input: CategoryInput): Promise<Category>;
  updateCategory(actor: SessionUser, id: string, input: CategoryInput): Promise<Category>;
  listTemplates(actor: SessionUser): Promise<TaskTemplate[]>;
  getTemplate(actor: SessionUser, id: string): Promise<TaskTemplate | null>;
  createTemplate(actor: SessionUser, input: TaskTemplateInput): Promise<TaskTemplate>;
  updateTemplate(actor: SessionUser, id: string, input: TaskTemplateInput): Promise<TaskTemplate>;
  listTasks(actor: SessionUser, filters?: TaskFilters): Promise<import("../types").Task[]>;
  getTask(actor: SessionUser, id: string): Promise<TaskDetail | null>;
  ensureGenerated(actor: SessionUser): Promise<number>;
  startTask(actor: SessionUser, id: string): Promise<void>;
  completeTask(actor: SessionUser, id: string, observation: string): Promise<void>;
  requestCorrection(actor: SessionUser, id: string, note: string): Promise<void>;
  rejectTask(actor: SessionUser, id: string, note: string): Promise<void>;
  approveTask(actor: SessionUser, id: string, note: string): Promise<void>;
  reopenTask(actor: SessionUser, id: string, note: string): Promise<void>;
  addObservation(actor: SessionUser, id: string, content: string): Promise<TaskObservation>;
  uploadPhoto(actor: SessionUser, taskId: string, input: UploadPhotoInput): Promise<TaskPhoto>;
  deletePhoto(actor: SessionUser, photoId: string): Promise<void>;
  listPhotosForTasks(actor: SessionUser, taskIds: string[]): Promise<TaskPhoto[]>;
  listHistory(actor: SessionUser, filters?: HistoryFilters): Promise<TaskExecution[]>;
  listAudit(actor: SessionUser, limit?: number): Promise<AuditEntry[]>;
}

export type { ExecutionAction };
````

### `src/lib/constants.ts`

````typescript
import type {
  ExecutionAction,
  PhotoRequirement,
  Recurrence,
  Role,
  TaskStatus
} from "./types";

export const APP_NAME = "Checklist Operacional D&D";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Gerente Comercial",
  supervisor: "Supervisor",
  manager: "Gerente de Loja"
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: "Acesso total à rede de lojas",
  supervisor: "Lojas sob sua supervisão",
  manager: "Somente a sua loja"
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
  correction_requested: "Aguardando correção",
  rejected: "Reprovada pelo supervisor"
};

export const STATUS_ORDER: TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "correction_requested",
  "rejected"
];

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  once: "Pontual"
};

export const PHOTO_LABELS: Record<PhotoRequirement, string> = {
  required: "Foto obrigatória",
  optional: "Foto opcional",
  none: "Sem foto"
};

export const ACTION_LABELS: Record<ExecutionAction, string> = {
  created: "Tarefa gerada",
  started: "Iniciou a tarefa",
  completed: "Concluiu a tarefa",
  correction_requested: "Solicitou correção",
  rejected: "Reprovou a tarefa",
  approved: "Aprovou a execução",
  reopened: "Reabriu a tarefa",
  photo_added: "Anexou foto",
  photo_removed: "Removeu foto",
  observation: "Registrou observação",
  updated: "Atualizou a tarefa"
};

export const NAV_ITEMS = [
  { href: "/painel", label: "Painel", icon: "LayoutDashboard", roles: ["admin", "supervisor", "manager"] },
  { href: "/atividades", label: "Atividades", icon: "ClipboardCheck", roles: ["admin", "supervisor", "manager"] },
  { href: "/lojas", label: "Lojas", icon: "Store", roles: ["admin", "supervisor", "manager"] },
  { href: "/usuarios", label: "Usuários", icon: "Users", roles: ["admin"] },
  { href: "/categorias", label: "Categorias", icon: "FolderTree", roles: ["admin"] },
  { href: "/modelos", label: "Modelos de tarefas", icon: "ListChecks", roles: ["admin"] },
  { href: "/relatorios", label: "Relatórios", icon: "FileSpreadsheet", roles: ["admin", "supervisor", "manager"] },
  { href: "/historico", label: "Histórico", icon: "History", roles: ["admin", "supervisor", "manager"] }
] as const;

export const MAX_PHOTO_MB = Number(process.env.NEXT_PUBLIC_MAX_PHOTO_MB ?? 10);
export const MAX_PHOTOS_PER_TASK = Number(process.env.NEXT_PUBLIC_MAX_PHOTOS_PER_TASK ?? 5);

export const DEFAULT_CATEGORIES = [
  { name: "Organização de Estoque", description: "Organização, separação e identificação do estoque", sortOrder: 1 },
  { name: "Organização de Produtos e Prateleiras", description: "Exposição, abastecimento e precificação", sortOrder: 2 },
  { name: "Limpeza e Conservação", description: "Limpeza e conservação geral da loja", sortOrder: 3 },
  { name: "Comunicação Visual", description: "Mural, campanhas e materiais informativos", sortOrder: 4 },
  { name: "Rotinas Administrativas", description: "Controles internos e solicitações da gestão", sortOrder: 5 }
];

export const DEFAULT_TEMPLATES: {
  category: string;
  title: string;
  description: string;
  recurrence: Recurrence;
  photoRequirement: PhotoRequirement;
  dueTime: string;
}[] = [
  // A. Organização de Estoque
  { category: "Organização de Estoque", title: "Organização geral do estoque", description: "Manter o estoque limpo, acessível e com corredores livres.", recurrence: "daily", photoRequirement: "required", dueTime: "10:00" },
  { category: "Organização de Estoque", title: "Separação de produtos por categorias", description: "Separar os produtos por categoria e família.", recurrence: "weekly", photoRequirement: "required", dueTime: "11:00" },
  { category: "Organização de Estoque", title: "Identificação correta dos produtos", description: "Conferir etiquetas e identificações de todos os produtos.", recurrence: "weekly", photoRequirement: "optional", dueTime: "11:30" },
  { category: "Organização de Estoque", title: "Organização de caixas e materiais", description: "Empilhar caixas com segurança e organizar materiais de apoio.", recurrence: "weekly", photoRequirement: "required", dueTime: "12:00" },
  { category: "Organização de Estoque", title: "Verificação de produtos parados", description: "Identificar produtos sem movimentação e reportar à gestão.", recurrence: "monthly", photoRequirement: "optional", dueTime: "15:00" },
  { category: "Organização de Estoque", title: "Conferência de produtos sem identificação", description: "Localizar e identificar produtos sem etiqueta ou código.", recurrence: "weekly", photoRequirement: "required", dueTime: "14:00" },

  // B. Organização de Produtos e Prateleiras
  { category: "Organização de Produtos e Prateleiras", title: "Organização dos produtos nas prateleiras", description: "Alinhar, agrupar e organizar os produtos nas prateleiras.", recurrence: "daily", photoRequirement: "required", dueTime: "10:30" },
  { category: "Organização de Produtos e Prateleiras", title: "Produtos posicionados corretamente", description: "Conferir posicionamento conforme o plano de exposição.", recurrence: "daily", photoRequirement: "optional", dueTime: "11:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Exposição conforme padrão da marca", description: "Validar a exposição visual conforme o padrão D&D.", recurrence: "weekly", photoRequirement: "required", dueTime: "12:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Abastecimento de produtos", description: "Repor produtos faltantes e manter a exposição completa.", recurrence: "daily", photoRequirement: "optional", dueTime: "09:30" },
  { category: "Organização de Produtos e Prateleiras", title: "Verificação de precificação", description: "Conferir etiquetas de preço e promover correções.", recurrence: "weekly", photoRequirement: "required", dueTime: "13:00" },
  { category: "Organização de Produtos e Prateleiras", title: "Organização de displays e materiais promocionais", description: "Organizar displays e materiais de campanha.", recurrence: "weekly", photoRequirement: "required", dueTime: "14:00" },

  // C. Limpeza e Conservação
  { category: "Limpeza e Conservação", title: "Limpeza de prateleiras", description: "Limpar prateleiras e remover poeira dos produtos.", recurrence: "daily", photoRequirement: "required", dueTime: "09:00" },
  { category: "Limpeza e Conservação", title: "Limpeza de balcões", description: "Limpar balcões, caixa e áreas de atendimento.", recurrence: "daily", photoRequirement: "optional", dueTime: "09:30" },
  { category: "Limpeza e Conservação", title: "Limpeza e organização do estoque", description: "Limpar o estoque e manter o ambiente seguro.", recurrence: "weekly", photoRequirement: "required", dueTime: "16:00" },
  { category: "Limpeza e Conservação", title: "Limpeza da área de atendimento", description: "Limpar piso, vidros e área de circulação.", recurrence: "daily", photoRequirement: "none", dueTime: "10:00" },
  { category: "Limpeza e Conservação", title: "Conservação geral da loja", description: "Verificar iluminação, mobiliário e conservação geral.", recurrence: "monthly", photoRequirement: "optional", dueTime: "17:00" },

  // D. Comunicação Visual
  { category: "Comunicação Visual", title: "Atualização do mural", description: "Atualizar o mural de comunicados internos.", recurrence: "weekly", photoRequirement: "required", dueTime: "10:00" },
  { category: "Comunicação Visual", title: "Retirada de comunicados antigos", description: "Remover comunicados e materiais vencidos.", recurrence: "weekly", photoRequirement: "optional", dueTime: "10:30" },
  { category: "Comunicação Visual", title: "Atualização de campanhas", description: "Aplicar as campanhas vigentes conforme orientação.", recurrence: "monthly", photoRequirement: "required", dueTime: "11:00" },
  { category: "Comunicação Visual", title: "Organização de materiais informativos", description: "Organizar folders, cartazes e materiais informativos.", recurrence: "weekly", photoRequirement: "optional", dueTime: "11:30" },

  // E. Rotinas Administrativas
  { category: "Rotinas Administrativas", title: "Conferência de informações", description: "Conferir informações operacionais e registros internos.", recurrence: "daily", photoRequirement: "none", dueTime: "17:00" },
  { category: "Rotinas Administrativas", title: "Atualização de controles internos", description: "Atualizar planilhas e controles da loja.", recurrence: "weekly", photoRequirement: "optional", dueTime: "17:30" },
  { category: "Rotinas Administrativas", title: "Verificação de comunicados", description: "Ler e confirmar os comunicados da gestão.", recurrence: "daily", photoRequirement: "none", dueTime: "18:00" },
  { category: "Rotinas Administrativas", title: "Cumprimento de atividades solicitadas pela gestão", description: "Executar as solicitações encaminhadas pela gerência comercial.", recurrence: "once", photoRequirement: "optional", dueTime: "18:00" }
];

export const DEMO_CREDENTIALS = [
  { role: "Gerente Comercial (admin)", email: "admin@dd.local", password: "Dd@2026!" },
  { role: "Supervisora", email: "supervisor@dd.local", password: "Dd@2026!" },
  { role: "Gerente de Loja", email: "gerente@dd.local", password: "Dd@2026!" }
];
````

### `src/lib/dashboard.ts`

````typescript
import { STATUS_LABELS, STATUS_ORDER } from "./constants";
import { isOverdue } from "./dates";
import type {
  DashboardData,
  DashboardFilters,
  SessionUser,
  Store,
  StorePerformance,
  Task,
  TaskPhoto
} from "./types";
import { percent } from "./utils";

export function filterTasks(tasks: Task[], filters: DashboardFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.storeId && task.storeId !== filters.storeId) return false;
    if (filters.categoryId && task.categoryId !== filters.categoryId) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.from && task.dueDate < filters.from) return false;
    if (filters.to && task.dueDate > filters.to) return false;
    return true;
  });
}

export function computeDashboard(
  tasks: Task[],
  stores: Store[],
  photos: (TaskPhoto & { taskTitle: string; storeName: string })[],
  actor: SessionUser,
  filters: DashboardFilters
): DashboardData {
  const visibleStores = stores.filter((store) => actor.role === "admin" || actor.storeIds.includes(store.id));
  const filtered = filterTasks(tasks, filters);

  const completed = filtered.filter((task) => task.status === "completed").length;
  const pending = filtered.filter((task) => task.status === "pending").length;
  const inProgress = filtered.filter((task) => task.status === "in_progress").length;
  const correction = filtered.filter((task) => task.status === "correction_requested").length;
  const rejected = filtered.filter((task) => task.status === "rejected").length;
  const overdueTasks = filtered
    .filter((task) => isOverdue(task))
    .sort((a, b) => `${a.dueDate}${a.dueTime}`.localeCompare(`${b.dueDate}${b.dueTime}`));

  const byStore = new Map<string, StorePerformance>();
  for (const store of visibleStores) {
    byStore.set(store.id, {
      storeId: store.id,
      storeName: store.name,
      storeCode: store.code,
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      rate: 0
    });
  }
  for (const task of filtered) {
    const row = byStore.get(task.storeId);
    if (!row) continue;
    row.total += 1;
    if (task.status === "completed") row.completed += 1;
    else row.pending += 1;
    if (isOverdue(task)) row.overdue += 1;
  }
  const storeRanking = [...byStore.values()]
    .map((row) => ({ ...row, rate: percent(row.completed, row.total) }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.rate - a.rate || b.completed - a.completed);

  const pendingRanking = [...storeRanking].sort((a, b) => b.pending - a.pending || b.overdue - a.overdue);

  const categoryMap = new Map<string, { categoryName: string; total: number; completed: number }>();
  for (const task of filtered) {
    const row = categoryMap.get(task.categoryId) ?? {
      categoryName: task.categoryName,
      total: 0,
      completed: 0
    };
    row.total += 1;
    if (task.status === "completed") row.completed += 1;
    categoryMap.set(task.categoryId, row);
  }

  return {
    totalStores: visibleStores.filter((store) => store.active).length,
    totalTasks: filtered.length,
    completed,
    pending,
    inProgress,
    correction,
    rejected,
    overdue: overdueTasks.length,
    executionRate: percent(completed, filtered.length),
    storeRanking,
    pendingRanking,
    overdueTasks: overdueTasks.slice(0, 8),
    recentPhotos: photos.slice(0, 8),
    statusBreakdown: STATUS_ORDER.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: filtered.filter((task) => task.status === status).length
    })),
    categoryBreakdown: [...categoryMap.values()]
      .map((row) => ({ ...row, rate: percent(row.completed, row.total) }))
      .sort((a, b) => b.total - a.total)
  };
}
````

### `src/lib/dates.ts`

````typescript
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // segunda-feira
  return addDays(d, diff);
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function periodForRecurrence(
  recurrence: "daily" | "weekly" | "monthly" | "once",
  date: Date
): { periodKey: string; dueDate: string } {
  if (recurrence === "daily") {
    return { periodKey: toDateKey(date), dueDate: toDateKey(date) };
  }
  if (recurrence === "weekly") {
    return { periodKey: isoWeekKey(date), dueDate: toDateKey(endOfWeek(date)) };
  }
  if (recurrence === "monthly") {
    return {
      periodKey: toDateKey(startOfMonth(date)).slice(0, 7),
      dueDate: toDateKey(endOfMonth(date))
    };
  }
  return { periodKey: "once", dueDate: toDateKey(date) };
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = value.length === 10 ? parseDateKey(value) : new Date(value);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return value.slice(0, 5);
}

export function isOverdue(task: { dueDate: string; dueTime: string; status: string }, now = new Date()): boolean {
  if (task.status === "completed") return false;
  const due = new Date(`${task.dueDate}T${(task.dueTime || "23:59").slice(0, 5)}:00`);
  return due.getTime() < now.getTime();
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function monthRange(date = new Date()): { from: string; to: string } {
  return { from: toDateKey(startOfMonth(date)), to: toDateKey(endOfMonth(date)) };
}

export function lastNDaysRange(days: number): { from: string; to: string } {
  return { from: toDateKey(addDays(new Date(), -(days - 1))), to: toDateKey(new Date()) };
}

export function dueLabel(dueDate: string, dueTime: string): string {
  const today = todayKey();
  if (dueDate === today) return `Hoje, ${formatTime(dueTime)}`;
  const tomorrow = toDateKey(addDays(new Date(), 1));
  if (dueDate === tomorrow) return `Amanhã, ${formatTime(dueTime)}`;
  return `${formatDate(dueDate)} · ${formatTime(dueTime)}`;
}
````

### `src/lib/image-client.ts`

````typescript
"use client";

export interface CompressedImage {
  file: File;
  original: File;
  width: number;
  height: number;
}

const MAX_SOURCE_MB = 20;
const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

async function loadBitmap(file: File): Promise<{ width: number; height: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; close: () => void }> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
      close: () => bitmap.close()
    };
  }
  const url = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    img.src = url;
  });
  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    draw: (ctx, w, h) => ctx.drawImage(image, 0, 0, w, h),
    close: () => URL.revokeObjectURL(url)
  };
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }
  if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
    throw new Error(`A imagem original ultrapassa ${MAX_SOURCE_MB} MB.`);
  }
  const bitmap = await loadBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Seu navegador não suporta o processamento de imagens.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    bitmap.draw(ctx, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((value) => resolve(value), "image/webp", QUALITY);
    });
    if (!blob) throw new Error("Não foi possível otimizar a imagem.");
    const name = file.name.replace(/\.[^.]+$/, "") || "evidencia";
    const optimized = new File([blob], `${name}.webp`, { type: "image/webp", lastModified: Date.now() });
    return { file: optimized, original: file, width, height };
  } finally {
    bitmap.close();
  }
}
````

### `src/lib/supabase/admin.ts`

````typescript
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Ela é necessária para criar usuários e executar rotinas administrativas."
    );
  }
  return createClient(supabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
````

### `src/lib/supabase/config.ts`

````typescript
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http")
  );
}

export function supabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurada.");
  return value;
}

export function supabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada.");
  return value;
}

export function storageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "evidencias";
}
````

### `src/lib/supabase/middleware.ts`

````typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./config";
import { verifyLocalSessionToken } from "../backend/local/session";

const PUBLIC_PATHS = [
  "/login",
  "/recuperar-senha",
  "/redefinir-senha",
  "/auth/callback",
  "/api/cron/gerar",
  "/api/health"
];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  let response = NextResponse.next({ request });
  let authenticated = false;

  if (hasSupabase) {
    const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });
    const {
      data: { user }
    } = await supabase.auth.getUser();
    authenticated = Boolean(user);
  } else {
    const token = request.cookies.get("dd_session")?.value;
    if (token) {
      const payload = await verifyLocalSessionToken(token);
      authenticated = Boolean(payload);
    }
  }

  if (!authenticated && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  if (authenticated && (pathname === "/login" || pathname === "/recuperar-senha")) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    url.search = "";
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  return withSecurityHeaders(response);
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), geolocation=(), microphone=()");
  return response;
}
````

### `src/lib/supabase/server.ts`

````typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./config";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components não podem gravar cookies; o middleware renova a sessão.
        }
      }
    }
  });
}
````

### `src/lib/types.ts`

````typescript
export type Role = "admin" | "supervisor" | "manager";
export type Recurrence = "daily" | "weekly" | "monthly" | "once";
export type PhotoRequirement = "required" | "optional" | "none";
export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "correction_requested"
  | "rejected";

export type ExecutionAction =
  | "created"
  | "started"
  | "completed"
  | "correction_requested"
  | "rejected"
  | "approved"
  | "reopened"
  | "photo_added"
  | "photo_removed"
  | "observation"
  | "updated";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  storeIds: string[];
}

export interface Store {
  id: string;
  name: string;
  code: string;
  active: boolean;
  managerId: string | null;
  managerName: string | null;
  supervisors: { id: string; name: string }[];
  createdAt: string;
}

export interface StoreInput {
  name: string;
  code: string;
  managerId: string | null;
  supervisorIds: string[];
  active: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  storeIds: string[];
  storeNames: string[];
  createdAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  role: Exclude<Role, "admin">;
  active: boolean;
  storeIds: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
  templateCount?: number;
}

export interface CategoryInput {
  name: string;
  description: string;
  active: boolean;
  sortOrder: number;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  recurrence: Recurrence;
  dueTime: string;
  onceDueDate: string | null;
  photoRequirement: PhotoRequirement;
  active: boolean;
  storeIds: string[];
  storeNames: string[];
  createdAt: string;
}

export interface TaskTemplateInput {
  title: string;
  description: string;
  categoryId: string;
  recurrence: Recurrence;
  dueTime: string;
  onceDueDate: string | null;
  photoRequirement: PhotoRequirement;
  active: boolean;
  storeIds: string[];
}

export interface TaskPhoto {
  id: string;
  taskId: string;
  storagePath: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  isOriginal: boolean;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  action: ExecutionAction;
  note: string;
  userId: string;
  userName: string;
  previousStatus: TaskStatus | null;
  newStatus: TaskStatus | null;
  createdAt: string;
  taskTitle?: string;
  storeName?: string;
}

export interface TaskObservation {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  templateId: string;
  storeId: string;
  storeName: string;
  storeCode: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  recurrence: Recurrence;
  periodKey: string;
  dueDate: string;
  dueTime: string;
  status: TaskStatus;
  photoRequirement: PhotoRequirement;
  completedAt: string | null;
  completedById: string | null;
  completedByName: string | null;
  approvedAt: string | null;
  approvedById: string | null;
  approvedByName: string | null;
  observation: string;
  createdAt: string;
  photoCount: number;
}

export interface TaskDetail extends Task {
  photos: TaskPhoto[];
  executions: TaskExecution[];
  observations: TaskObservation[];
}

export interface TaskFilters {
  storeId?: string;
  supervisorId?: string;
  managerId?: string;
  categoryId?: string;
  status?: TaskStatus | "";
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
}

export interface AuditEntry {
  id: string;
  actorId: string | null;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface HistoryFilters {
  storeId?: string;
  from?: string;
  to?: string;
  action?: ExecutionAction | "";
  limit?: number;
}

export interface DashboardFilters {
  storeId?: string;
  supervisorId?: string;
  managerId?: string;
  categoryId?: string;
  status?: TaskStatus | "";
  from?: string;
  to?: string;
}

export interface StorePerformance {
  storeId: string;
  storeName: string;
  storeCode: string;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  rate: number;
}

export interface DashboardData {
  totalStores: number;
  totalTasks: number;
  completed: number;
  pending: number;
  inProgress: number;
  correction: number;
  rejected: number;
  overdue: number;
  executionRate: number;
  storeRanking: StorePerformance[];
  pendingRanking: StorePerformance[];
  overdueTasks: Task[];
  recentPhotos: (TaskPhoto & { taskTitle: string; storeName: string })[];
  statusBreakdown: { status: TaskStatus; label: string; count: number }[];
  categoryBreakdown: { categoryName: string; total: number; completed: number; rate: number }[];
}

export interface UploadPhotoInput {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  original?: {
    buffer: Buffer;
    mimeType: string;
    sizeBytes: number;
  };
}

export interface TaskMutationResult {
  ok: boolean;
  error?: string;
  photo?: TaskPhoto;
}
````

### `src/lib/utils.ts`

````typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function truncate(value: string, max = 120): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function safeErrorMessage(error: unknown, fallback = "Não foi possível concluir a operação."): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export function statusTone(status: string): "turquesa" | "pink" | "outline" {
  if (status === "in_progress") return "turquesa";
  if (status === "completed") return "pink";
  return "outline";
}
````

### `src/lib/validation.ts`

````typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha.")
});

export const resetRequestSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.")
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"]
  });

export const storeSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da loja."),
  code: z.string().trim().min(1, "Informe o código da loja.").max(30, "Código muito longo."),
  managerId: z.string().uuid().nullable(),
  supervisorIds: z.array(z.string().uuid()).default([]),
  active: z.boolean().default(true)
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do usuário."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
  role: z.enum(["supervisor", "manager"]),
  active: z.boolean().default(true),
  storeIds: z.array(z.string().uuid()).default([])
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do usuário."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value : undefined))
    .refine((value) => !value || value.length >= 8, "A senha deve ter no mínimo 8 caracteres."),
  role: z.enum(["supervisor", "manager"]),
  active: z.boolean().default(true),
  storeIds: z.array(z.string().uuid()).default([])
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da categoria."),
  description: z.string().trim().max(400, "Descrição muito longa.").default(""),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0)
});

export const templateSchema = z
  .object({
    title: z.string().trim().min(2, "Informe o nome da atividade."),
    description: z.string().trim().max(1000, "Descrição muito longa.").default(""),
    categoryId: z.string().uuid("Selecione uma categoria."),
    recurrence: z.enum(["daily", "weekly", "monthly", "once"]),
    dueTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Informe um horário válido.")
      .default("18:00"),
    onceDueDate: z.string().optional().nullable(),
    photoRequirement: z.enum(["required", "optional", "none"]),
    active: z.boolean().default(true),
    storeIds: z.array(z.string().uuid()).min(1, "Selecione pelo menos uma loja.")
  })
  .refine((data) => data.recurrence !== "once" || !!data.onceDueDate, {
    message: "Informe a data da atividade pontual.",
    path: ["onceDueDate"]
  });

export const noteSchema = z.object({
  note: z.string().trim().min(3, "Descreva o motivo com pelo menos 3 caracteres.")
});

export const observationSchema = z.object({
  content: z.string().trim().min(2, "Escreva uma observação.")
});

export const completeTaskSchema = z.object({
  observation: z.string().trim().max(1000, "Observação muito longa.").default("")
});

export function parseBoolean(value: FormDataEntryValue | null | undefined): boolean {
  return value === "on" || value === "true" || value === "1";
}

export function formString(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value : "";
}

export function formStringArray(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((value): value is string => typeof value === "string" && value.length > 0);
}
````

### `supabase/migrations/0001_schema.sql`

````sql
-- CHECKLIST OPERACIONAL D&D
-- Estrutura principal, funções, triggers, RLS e Storage.
-- Execute este arquivo no SQL Editor do Supabase (ou via supabase db push).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'supervisor', 'manager');
create type public.recurrence as enum ('daily', 'weekly', 'monthly', 'once');
create type public.photo_requirement as enum ('required', 'optional', 'none');
create type public.task_status as enum ('pending', 'in_progress', 'completed', 'correction_requested', 'rejected');
create type public.execution_action as enum (
  'created',
  'started',
  'completed',
  'correction_requested',
  'rejected',
  'approved',
  'reopened',
  'photo_added',
  'photo_removed',
  'observation',
  'updated'
);

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role public.user_role not null default 'manager',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index profiles_email_key on public.profiles (lower(email));

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  active boolean not null default true,
  manager_id uuid,
  created_at timestamptz not null default now(),
  constraint stores_code_key unique (code),
  constraint stores_manager_id_fkey foreign key (manager_id) references public.profiles (id) on delete set null
);

create table public.store_supervisors (
  store_id uuid not null,
  supervisor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (store_id, supervisor_id),
  constraint store_supervisors_store_id_fkey foreign key (store_id) references public.stores (id) on delete cascade,
  constraint store_supervisors_supervisor_id_fkey foreign key (supervisor_id) references public.profiles (id) on delete cascade
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint categories_name_key unique (name)
);

create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category_id uuid not null,
  recurrence public.recurrence not null,
  due_time time not null default '18:00',
  once_due_date date,
  photo_requirement public.photo_requirement not null default 'optional',
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  constraint task_templates_category_id_fkey foreign key (category_id) references public.categories (id) on delete restrict,
  constraint task_templates_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null
);

create table public.template_stores (
  template_id uuid not null,
  store_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (template_id, store_id),
  constraint template_stores_template_id_fkey foreign key (template_id) references public.task_templates (id) on delete cascade,
  constraint template_stores_store_id_fkey foreign key (store_id) references public.stores (id) on delete cascade
);

create table public.task_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null,
  store_id uuid not null,
  title text not null,
  description text not null default '',
  category_id uuid not null,
  recurrence public.recurrence not null,
  period_key text not null,
  due_date date not null,
  due_time time not null,
  status public.task_status not null default 'pending',
  photo_requirement public.photo_requirement not null default 'optional',
  completed_at timestamptz,
  completed_by uuid,
  approved_at timestamptz,
  approved_by uuid,
  observation text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint task_instances_template_id_fkey foreign key (template_id) references public.task_templates (id) on delete restrict,
  constraint task_instances_store_id_fkey foreign key (store_id) references public.stores (id) on delete cascade,
  constraint task_instances_category_id_fkey foreign key (category_id) references public.categories (id) on delete restrict,
  constraint task_instances_completed_by_fkey foreign key (completed_by) references public.profiles (id) on delete set null,
  constraint task_instances_approved_by_fkey foreign key (approved_by) references public.profiles (id) on delete set null,
  constraint task_instances_template_store_period_key unique (template_id, store_id, period_key)
);

create table public.task_photos (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes integer not null default 0,
  width integer,
  height integer,
  is_original boolean not null default false,
  uploaded_by uuid,
  created_at timestamptz not null default now(),
  constraint task_photos_task_id_fkey foreign key (task_id) references public.task_instances (id) on delete cascade,
  constraint task_photos_uploaded_by_fkey foreign key (uploaded_by) references public.profiles (id) on delete set null,
  constraint task_photos_storage_path_key unique (storage_path)
);

create table public.task_executions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  action public.execution_action not null,
  note text not null default '',
  user_id uuid,
  previous_status public.task_status,
  new_status public.task_status,
  created_at timestamptz not null default now(),
  constraint task_executions_task_id_fkey foreign key (task_id) references public.task_instances (id) on delete cascade,
  constraint task_executions_user_id_fkey foreign key (user_id) references public.profiles (id) on delete set null
);

create table public.task_observations (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  user_id uuid,
  content text not null,
  created_at timestamptz not null default now(),
  constraint task_observations_task_id_fkey foreign key (task_id) references public.task_instances (id) on delete cascade,
  constraint task_observations_user_id_fkey foreign key (user_id) references public.profiles (id) on delete set null
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_actor_id_fkey foreign key (actor_id) references public.profiles (id) on delete set null
);

create index task_instances_store_due_idx on public.task_instances (store_id, due_date, due_time);
create index task_instances_status_idx on public.task_instances (status);
create index task_instances_template_idx on public.task_instances (template_id);
create index task_photos_task_idx on public.task_photos (task_id);
create index task_executions_task_idx on public.task_executions (task_id, created_at);
create index task_observations_task_idx on public.task_observations (task_id, created_at);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Funções auxiliares de autorização
-- ---------------------------------------------------------------------------
create or replace function public.dd_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.dd_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.dd_role() = 'admin', false);
$$;

create or replace function public.dd_can_review()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.dd_role() in ('admin', 'supervisor'), false);
$$;

create or replace function public.dd_has_store_access(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.dd_is_admin() then true
    else exists (
      select 1 from public.stores s
      where s.id = p_store_id and s.manager_id = auth.uid()
    ) or exists (
      select 1 from public.store_supervisors ss
      where ss.store_id = p_store_id and ss.supervisor_id = auth.uid()
    )
  end;
$$;

create or replace function public.dd_storage_store_id(p_name text)
returns uuid
language plpgsql
immutable
as $$
begin
  return ((storage.foldername(p_name))[1])::uuid;
exception when others then
  return null;
end;
$$;

create or replace function public.dd_storage_task_id(p_name text)
returns uuid
language plpgsql
immutable
as $$
begin
  return ((storage.foldername(p_name))[2])::uuid;
exception when others then
  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers de integridade e auditoria
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger task_instances_set_updated_at
before update on public.task_instances
for each row execute function public.set_updated_at();

create or replace function public.enforce_task_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  if new.status = 'completed' and new.photo_requirement = 'required' then
    if not exists (
      select 1 from public.task_photos
      where task_id = new.id and is_original = false
    ) then
      raise exception 'Foto obrigatória: anexe pelo menos uma evidência antes de concluir.';
    end if;
  end if;

  -- service_role não possui auth.uid(); ele é usado apenas no servidor.
  if auth.uid() is null then
    return new;
  end if;

  v_role := public.dd_role();
  if v_role is null then
    raise exception 'Usuário sem perfil ativo.';
  end if;

  if v_role <> 'admin' then
    if new.template_id is distinct from old.template_id
      or new.store_id is distinct from old.store_id
      or new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.category_id is distinct from old.category_id
      or new.recurrence is distinct from old.recurrence
      or new.period_key is distinct from old.period_key
      or new.due_date is distinct from old.due_date
      or new.due_time is distinct from old.due_time
      or new.photo_requirement is distinct from old.photo_requirement
      or new.created_at is distinct from old.created_at then
      raise exception 'Campos estruturais da atividade são protegidos.';
    end if;

    if v_role = 'manager' then
      if new.approved_at is distinct from old.approved_at
        or new.approved_by is distinct from old.approved_by then
        raise exception 'Somente a supervisão pode aprovar execuções.';
      end if;
    end if;

    if new.completed_by is not null
      and new.completed_by <> auth.uid()
      and new.completed_at is distinct from old.completed_at then
      raise exception 'A conclusão deve ser registrada pelo próprio usuário.';
    end if;
  end if;

  return new;
end;
$$;

create trigger task_instances_enforce_rules
before update on public.task_instances
for each row execute function public.enforce_task_rules();

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if public.dd_is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
    or new.active is distinct from old.active
    or new.email is distinct from old.email then
    raise exception 'Somente a gerente comercial pode alterar perfil, status ou e-mail.';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileges
before update on public.profiles
for each row execute function public.protect_profile_privileges();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_role public.user_role := 'manager';
begin
  v_name := coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1));
  if (new.raw_user_meta_data ->> 'role') in ('admin', 'supervisor', 'manager') then
    v_role := (new.raw_user_meta_data ->> 'role')::public.user_role;
  end if;

  insert into public.profiles (id, name, email, role, active)
  values (new.id, v_name, new.email, v_role, true)
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RPC de geração de atividades e auditoria
-- ---------------------------------------------------------------------------
create or replace function public.generate_task_instances(p_today date default current_date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_period_key text;
  v_due_date date;
  v_created integer := 0;
begin
  if auth.uid() is not null and not public.dd_is_admin() then
    raise exception 'Somente a gerente comercial pode gerar atividades.';
  end if;

  for r in
    select
      t.id,
      t.title,
      t.description,
      t.category_id,
      t.recurrence,
      t.due_time,
      t.once_due_date,
      t.photo_requirement,
      ts.store_id
    from public.task_templates t
    join public.template_stores ts on ts.template_id = t.id
    join public.stores s on s.id = ts.store_id
    where t.active = true and s.active = true
  loop
    if r.recurrence = 'daily' then
      v_period_key := to_char(p_today, 'YYYY-MM-DD');
      v_due_date := p_today;
    elsif r.recurrence = 'weekly' then
      v_period_key := to_char(p_today, 'IYYY-"W"IW');
      v_due_date := (date_trunc('week', p_today::timestamp) + interval '6 days')::date;
    elsif r.recurrence = 'monthly' then
      v_period_key := to_char(p_today, 'YYYY-MM');
      v_due_date := (date_trunc('month', p_today::timestamp) + interval '1 month - 1 day')::date;
    else
      continue when r.once_due_date is null or r.once_due_date > p_today;
      v_period_key := 'once';
      v_due_date := r.once_due_date;
    end if;

    insert into public.task_instances (
      template_id, store_id, title, description, category_id, recurrence,
      period_key, due_date, due_time, status, photo_requirement
    )
    values (
      r.id, r.store_id, r.title, r.description, r.category_id, r.recurrence,
      v_period_key, v_due_date, r.due_time, 'pending', r.photo_requirement
    )
    on conflict (template_id, store_id, period_key) do nothing;

    if found then
      v_created := v_created + 1;
    end if;
  end loop;

  return v_created;
end;
$$;

create or replace function public.log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_details, '{}'::jsonb));
end;
$$;

revoke all on function public.generate_task_instances(date) from public;
revoke all on function public.log_audit(text, text, text, jsonb) from public;
grant execute on function public.generate_task_instances(date) to authenticated, service_role;
grant execute on function public.log_audit(text, text, text, jsonb) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.store_supervisors enable row level security;
alter table public.categories enable row level security;
alter table public.task_templates enable row level security;
alter table public.template_stores enable row level security;
alter table public.task_instances enable row level security;
alter table public.task_photos enable row level security;
alter table public.task_executions enable row level security;
alter table public.task_observations enable row level security;
alter table public.audit_logs enable row level security;

-- Perfis: leitura autenticada para permitir joins de nomes; alteração apenas do próprio nome.
create policy profiles_select_authenticated on public.profiles
for select to authenticated using (true);

create policy profiles_update_self on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Lojas
create policy stores_select_access on public.stores
for select to authenticated
using (public.dd_is_admin() or public.dd_has_store_access(id));

create policy stores_admin_insert on public.stores
for insert to authenticated
with check (public.dd_is_admin());

create policy stores_admin_update on public.stores
for update to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

create policy stores_admin_delete on public.stores
for delete to authenticated
using (public.dd_is_admin());

-- Vínculos de supervisão
create policy store_supervisors_select_access on public.store_supervisors
for select to authenticated
using (public.dd_is_admin() or public.dd_has_store_access(store_id));

create policy store_supervisors_admin_all on public.store_supervisors
for all to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

-- Categorias
create policy categories_select_active on public.categories
for select to authenticated
using (public.dd_is_admin() or active = true);

create policy categories_admin_write on public.categories
for all to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

-- Modelos de tarefas
create policy task_templates_select_access on public.task_templates
for select to authenticated
using (
  public.dd_is_admin()
  or (
    active = true
    and exists (
      select 1 from public.template_stores ts
      where ts.template_id = id and public.dd_has_store_access(ts.store_id)
    )
  )
);

create policy task_templates_admin_write on public.task_templates
for all to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

create policy template_stores_select_access on public.template_stores
for select to authenticated
using (public.dd_is_admin() or public.dd_has_store_access(store_id));

create policy template_stores_admin_write on public.template_stores
for all to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

-- Atividades
create policy task_instances_select_access on public.task_instances
for select to authenticated
using (public.dd_has_store_access(store_id));

create policy task_instances_update_access on public.task_instances
for update to authenticated
using (public.dd_has_store_access(store_id))
with check (public.dd_has_store_access(store_id));

-- Fotos
create policy task_photos_select_access on public.task_photos
for select to authenticated
using (
  exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

create policy task_photos_insert_access on public.task_photos
for insert to authenticated
with check (
  exists (
    select 1 from public.task_instances t
    where t.id = task_id
      and public.dd_has_store_access(t.store_id)
      and (t.status <> 'completed' or public.dd_can_review())
  )
);

create policy task_photos_admin_delete on public.task_photos
for delete to authenticated
using (public.dd_is_admin());

-- Execuções
create policy task_executions_select_access on public.task_executions
for select to authenticated
using (
  exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

create policy task_executions_insert_self on public.task_executions
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

-- Observações
create policy task_observations_select_access on public.task_observations
for select to authenticated
using (
  exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

create policy task_observations_insert_self on public.task_observations
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

-- Auditoria: somente administração
create policy audit_logs_admin_select on public.audit_logs
for select to authenticated
using (public.dd_is_admin());

-- ---------------------------------------------------------------------------
-- Storage privado de evidências
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidencias',
  'evidencias',
  false,
  10485760,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists evidencias_select_access on storage.objects;
create policy evidencias_select_access on storage.objects
for select to authenticated
using (
  bucket_id = 'evidencias'
  and public.dd_has_store_access(public.dd_storage_store_id(name))
);

drop policy if exists evidencias_insert_access on storage.objects;
create policy evidencias_insert_access on storage.objects
for insert to authenticated
with check (
  bucket_id = 'evidencias'
  and public.dd_has_store_access(public.dd_storage_store_id(name))
  and exists (
    select 1 from public.task_instances t
    where t.id = public.dd_storage_task_id(name)
      and t.store_id = public.dd_storage_store_id(name)
      and (t.status <> 'completed' or public.dd_can_review())
  )
);

drop policy if exists evidencias_admin_delete on storage.objects;
create policy evidencias_admin_delete on storage.objects
for delete to authenticated
using (bucket_id = 'evidencias' and public.dd_is_admin());

-- ---------------------------------------------------------------------------
-- Permissões de tabelas (RLS continua sendo a barreira de acesso)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
````

### `supabase/migrations/0002_seed_categories.sql`

````sql
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
````

### `tailwind.config.ts`

````typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        turquesa: "#12D9EF",
        pink: "#891745",
        institucional: {
          turquesa: "#12D9EF",
          pink: "#891745",
          branco: "#FFFFFF"
        }
      },
      fontFamily: {
        sans: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px -18px rgba(137, 23, 69, 0.35)",
        soft: "0 4px 18px -10px rgba(137, 23, 69, 0.25)"
      },
      opacity: {
        8: "0.08",
        12: "0.12",
        15: "0.15",
        35: "0.35",
        45: "0.45",
        55: "0.55",
        65: "0.65",
        85: "0.85"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
````

### `tests/local-backend.test.ts`

````typescript
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SessionUser, Store } from "../src/lib/types";
import type { Backend } from "../src/lib/backend/types";
import { createLocalBackend } from "../src/lib/backend/local";
import { getDb, resetLocalDbCacheForTests } from "../src/lib/backend/local/db";
import { hashPassword, verifyPassword } from "../src/lib/backend/local/auth";
import { getBackend } from "../src/lib/backend";

const DEMO_PASSWORD = "Dd@2026!";

let backend: Backend;
let tempDir: string;
let admin: SessionUser;
let supervisor: SessionUser;
let supervisor2: SessionUser;
let manager: SessionUser;
let manager2: SessionUser;
let stores: Store[];

beforeAll(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dd-local-test-"));
  process.env.LOCAL_DATA_DIR = tempDir;
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  resetLocalDbCacheForTests();

  backend = createLocalBackend();
  const db = await getDb();

  const adminUser = db.users.find((item) => item.email === "admin@dd.local")!;
  const supervisorUser = db.users.find((item) => item.email === "supervisor@dd.local")!;
  const supervisorUser2 = db.users.find((item) => item.email === "supervisor2@dd.local")!;
  const managerUser = db.users.find((item) => item.email === "gerente@dd.local")!;
  const managerUser2 = db.users.find((item) => item.email === "gerente2@dd.local")!;

  const activeStoreIds = db.stores.filter((store) => store.active).map((store) => store.id);
  const storeIdsFor = (userId: string) =>
    db.stores
      .filter((store) => store.active && (store.managerId === userId || store.supervisorIds.includes(userId)))
      .map((store) => store.id);

  admin = {
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: "admin",
    active: true,
    storeIds: activeStoreIds
  };
  supervisor = {
    id: supervisorUser.id,
    name: supervisorUser.name,
    email: supervisorUser.email,
    role: "supervisor",
    active: true,
    storeIds: storeIdsFor(supervisorUser.id)
  };
  supervisor2 = {
    id: supervisorUser2.id,
    name: supervisorUser2.name,
    email: supervisorUser2.email,
    role: "supervisor",
    active: true,
    storeIds: storeIdsFor(supervisorUser2.id)
  };
  manager = {
    id: managerUser.id,
    name: managerUser.name,
    email: managerUser.email,
    role: "manager",
    active: true,
    storeIds: storeIdsFor(managerUser.id)
  };
  manager2 = {
    id: managerUser2.id,
    name: managerUser2.name,
    email: managerUser2.email,
    role: "manager",
    active: true,
    storeIds: storeIdsFor(managerUser2.id)
  };

  stores = await backend.listStores(admin);
});

afterAll(() => {
  resetLocalDbCacheForTests();
  delete process.env.LOCAL_DATA_DIR;
  if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("local backend: seed e autenticação", () => {
  it("cria dados demonstrativos completos e consistentes", async () => {
    const db = await getDb();
    expect(db.users.length).toBeGreaterThanOrEqual(6);
    expect(db.stores.length).toBe(3);
    expect(db.templates.length).toBe(25);
    expect(db.tasks.length).toBeGreaterThan(0);
    expect(db.photos.length).toBeGreaterThan(0);
    expect(db.users.filter((user) => user.role === "admin")).toHaveLength(1);
    expect(db.users.every((user) => user.passwordHash.startsWith("$2"))).toBe(true);
    expect(stores.map((store) => store.code).sort()).toEqual(["LOJA-001", "LOJA-002", "LOJA-003"]);
  });

  it("valida hash de senha e rejeita senha incorreta", async () => {
    const db = await getDb();
    const user = db.users.find((item) => item.email === "admin@dd.local")!;
    expect(verifyPassword(DEMO_PASSWORD, user.passwordHash)).toBe(true);
    expect(verifyPassword("senha-errada", user.passwordHash)).toBe(false);
    expect(hashPassword("outra-senha")).not.toBe(user.passwordHash);
  });

  it("fluxo de recuperação de senha gera token de uso único", async () => {
    const request = await backend.auth.requestPasswordReset("supervisor2@dd.local");
    expect(request.resetUrl).toContain("/redefinir-senha?token=");
    const token = new URL(request.resetUrl!).searchParams.get("token")!;
    expect(token.length).toBeGreaterThan(10);

    await backend.auth.resetPasswordWithToken(token, "NovaSenha@2026");
    const db = await getDb();
    const user = db.users.find((item) => item.email === "supervisor2@dd.local")!;
    expect(verifyPassword("NovaSenha@2026", user.passwordHash)).toBe(true);
    await expect(backend.auth.resetPasswordWithToken(token, "Outra@2026")).rejects.toThrow(/inválido|utilizado/i);
  });

  it("não revela se um e-mail inexistente possui conta", async () => {
    await expect(backend.auth.requestPasswordReset("ninguem@dd.local")).resolves.toEqual({});
  });
});

describe("local backend: permissões e isolamento por loja", () => {
  it("bloqueia listagem de usuários para supervisores", async () => {
    await expect(backend.listUsers(supervisor)).rejects.toThrow(/gerente comercial|permiss/i);
  });

  it("bloqueia criação de loja para gerente de loja", async () => {
    await expect(
      backend.createStore(manager, {
        name: "Loja não autorizada",
        code: "LOJA-999",
        managerId: null,
        supervisorIds: [],
        active: true
      })
    ).rejects.toThrow(/gerente comercial|permiss/i);
  });

  it("limita lojas visíveis ao vínculo do gerente", async () => {
    const visible = await backend.listStores(manager);
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe(manager.storeIds[0]);
    expect(manager.storeIds).toHaveLength(1);
    await expect(backend.getStore(manager, stores.find((store) => store.id !== manager.storeIds[0])!.id)).rejects.toThrow(
      /permiss/i
    );
  });

  it("impede acesso a atividade de outra loja", async () => {
    const db = await getDb();
    const foreignTask = db.tasks.find((task) => task.storeId !== manager.storeIds[0])!;
    expect(foreignTask).toBeTruthy();
    await expect(backend.getTask(manager, foreignTask.id)).rejects.toThrow(/permiss/i);
  });

  it("filtra atividades e histórico pela loja do usuário", async () => {
    const tasks = await backend.listTasks(manager, { limit: 1000 });
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((task) => task.storeId === manager.storeIds[0])).toBe(true);

    const history = await backend.listHistory(manager, { limit: 1000 });
    expect(history.every((entry) => entry.storeName === stores.find((store) => store.id === manager.storeIds[0])!.name)).toBe(
      true
    );
  });

  it("bloqueia auditoria para não administradores", async () => {
    await expect(backend.listAudit(supervisor)).rejects.toThrow(/gerente comercial|permiss/i);
  });
});

describe("local backend: geração recorrente sem duplicidade", () => {
  it("não duplica tarefas por modelo, loja e período", async () => {
    await backend.ensureGenerated(admin);
    const firstCount = (await getDb()).tasks.length;
    await backend.ensureGenerated(admin);
    const db = await getDb();
    expect(db.tasks.length).toBe(firstCount);

    const keys = db.tasks.map((task) => `${task.templateId}|${task.storeId}|${task.periodKey}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("cria tarefa ao cadastrar novo modelo e não duplica na segunda geração", async () => {
    const categories = await backend.listCategories(admin);
    const before = (await getDb()).tasks.length;
    const template = await backend.createTemplate(admin, {
      title: "Conferência de teste automatizado",
      description: "Modelo criado pela suíte de testes.",
      categoryId: categories[0].id,
      recurrence: "daily",
      dueTime: "12:00",
      onceDueDate: null,
      photoRequirement: "none",
      active: true,
      storeIds: [manager.storeIds[0]]
    });
    const afterCreate = (await getDb()).tasks.length;
    expect(afterCreate).toBe(before + 1);

    // A geração de recuperação preenche os últimos 7 dias para o novo modelo diário.
    await backend.ensureGenerated(admin);
    const afterBackfill = (await getDb()).tasks.length;
    expect(afterBackfill).toBe(afterCreate + 6);
    await backend.ensureGenerated(admin);
    expect((await getDb()).tasks.length).toBe(afterBackfill);

    const tasks = await backend.listTasks(admin, { search: template.title, limit: 50 });
    expect(tasks).toHaveLength(7);
    expect(tasks.every((task) => task.storeId === manager.storeIds[0])).toBe(true);
    expect(tasks.every((task) => task.status === "pending")).toBe(true);
  });
});

describe("local backend: evidências fotográficas", () => {
  it("bloqueia conclusão sem foto obrigatória e libera após o envio", async () => {
    const db = await getDb();
    const task = db.tasks.find(
      (item) =>
        item.photoRequirement === "required" &&
        item.status !== "completed" &&
        item.storeId === manager.storeIds[0] &&
        !db.photos.some((photo) => photo.taskId === item.id && !photo.isOriginal)
    );
    expect(task).toBeTruthy();

    await expect(backend.completeTask(manager, task!.id, "Tentativa sem foto")).rejects.toThrow(/foto obrigatória/i);

    const photo = await backend.uploadPhoto(manager, task!.id, {
      buffer: Buffer.from("evidencia-de-teste"),
      originalName: "evidencia.webp",
      mimeType: "image/webp",
      sizeBytes: 18,
      width: 640,
      height: 480
    });
    expect(photo.taskId).toBe(task!.id);
    expect(photo.isOriginal).toBe(false);
    expect(photo.url).toContain("/api/evidencias/");

    const detail = await backend.getTask(manager, task!.id);
    expect(detail!.photos.some((item) => item.id === photo.id)).toBe(true);

    await backend.completeTask(manager, task!.id, "Concluída com evidência");
    const completed = await backend.getTask(manager, task!.id);
    expect(completed!.status).toBe("completed");
    expect(completed!.photoCount).toBeGreaterThanOrEqual(1);
    expect(completed!.executions.some((execution) => execution.action === "photo_added")).toBe(true);
  });

  it("aceita somente formatos de imagem permitidos", async () => {
    const db = await getDb();
    const task = db.tasks.find((item) => item.status !== "completed")!;
    await expect(
      backend.uploadPhoto(admin, task.id, {
        buffer: Buffer.from("arquivo"),
        originalName: "arquivo.txt",
        mimeType: "text/plain",
        sizeBytes: 7
      })
    ).rejects.toThrow(/formato inválido/i);
  });

  it("remove foto e registra a ação na auditoria", async () => {
    const db = await getDb();
    const task = db.tasks.find((item) => item.status !== "completed" && item.storeId === manager.storeIds[0])!;
    const photo = await backend.uploadPhoto(admin, task.id, {
      buffer: Buffer.from("foto-remocao"),
      originalName: "remocao.webp",
      mimeType: "image/webp",
      sizeBytes: 12
    });
    await backend.deletePhoto(admin, photo.id);
    const detail = await backend.getTask(admin, task.id);
    expect(detail!.photos.some((item) => item.id === photo.id)).toBe(false);
    const audit = await backend.listAudit(admin, 500);
    expect(audit.some((entry) => entry.action === "task.photo_removed" && entry.entityId === task.id)).toBe(true);
  });
});

describe("local backend: status, correções e histórico", () => {
  it("preserva histórico ao solicitar correção, reconcluir e aprovar", async () => {
    const categories = await backend.listCategories(admin);
    const template = await backend.createTemplate(admin, {
      title: "Fluxo de correção automatizado",
      description: "Verifica histórico e status.",
      categoryId: categories[0].id,
      recurrence: "daily",
      dueTime: "16:00",
      onceDueDate: null,
      photoRequirement: "optional",
      active: true,
      storeIds: [manager.storeIds[0]]
    });

    const tasks = await backend.listTasks(admin, { search: template.title, limit: 10 });
    const task = tasks[0];
    expect(task).toBeTruthy();

    await backend.startTask(manager, task.id);
    await backend.completeTask(manager, task.id, "Primeira execução");
    let detail = await backend.getTask(manager, task.id);
    expect(detail!.status).toBe("completed");

    await backend.requestCorrection(supervisor, task.id, "Reenviar com melhor enquadramento");
    detail = await backend.getTask(manager, task.id);
    expect(detail!.status).toBe("correction_requested");
    expect(detail!.observation).toContain("enquadramento");

    await backend.completeTask(manager, task.id, "Segunda execução corrigida");
    await backend.approveTask(supervisor, task.id, "Aprovada após correção");

    detail = await backend.getTask(admin, task.id);
    expect(detail!.status).toBe("completed");
    expect(detail!.approvedById).toBe(supervisor.id);
    expect(detail!.approvedAt).toBeTruthy();

    const actions = detail!.executions.map((execution) => execution.action);
    expect(actions).toEqual(
      expect.arrayContaining(["started", "completed", "correction_requested", "approved"])
    );
    const correction = detail!.executions.find((execution) => execution.action === "correction_requested")!;
    expect(correction.previousStatus).toBe("completed");
    expect(correction.newStatus).toBe("correction_requested");

    const history = await backend.listHistory(admin, { limit: 500 });
    const taskHistory = history.filter((entry) => entry.taskId === task.id);
    expect(taskHistory.length).toBeGreaterThanOrEqual(4);
  });

  it("exige execução prévia para solicitar correção", async () => {
    const categories = await backend.listCategories(admin);
    const template = await backend.createTemplate(admin, {
      title: "Correção sem execução",
      description: "Deve ser bloqueada.",
      categoryId: categories[0].id,
      recurrence: "daily",
      dueTime: "17:00",
      onceDueDate: null,
      photoRequirement: "none",
      active: true,
      storeIds: [manager.storeIds[0]]
    });
    const tasks = await backend.listTasks(admin, { search: template.title, limit: 10 });
    await expect(backend.requestCorrection(supervisor, tasks[0].id, "Sem execução")).rejects.toThrow(/ainda não foi executada/i);
  });

  it("reabre atividade concluída e registra o evento", async () => {
    const db = await getDb();
    const task = db.tasks.find(
      (item) => item.status === "completed" && item.storeId === manager.storeIds[0]
    )!;
    await backend.reopenTask(supervisor, task.id, "Reaberta para nova checagem");
    const detail = await backend.getTask(supervisor, task.id);
    expect(detail!.status).toBe("in_progress");
    expect(detail!.executions.some((execution) => execution.action === "reopened")).toBe(true);
  });

  it("permite observações e mantém o autor", async () => {
    const db = await getDb();
    const task = db.tasks.find((item) => item.storeId === manager.storeIds[0])!;
    const observation = await backend.addObservation(manager, task.id, "Observação da suíte de testes");
    expect(observation.userId).toBe(manager.id);
    expect(observation.userName).toBe(manager.name);
    const detail = await backend.getTask(manager, task.id);
    expect(detail!.observations.some((item) => item.id === observation.id)).toBe(true);
  });
});

describe("local backend: administração de usuários e auditoria", () => {
  it("impede gerente de loja com mais de uma unidade", async () => {
    await expect(
      backend.createUser(admin, {
        name: "Gerente Inválido",
        email: "gerente.invalido@dd.local",
        password: "Teste@2026",
        role: "manager",
        active: true,
        storeIds: stores.slice(0, 2).map((store) => store.id)
      })
    ).rejects.toThrow(/apenas uma loja/i);
  });

  it("impede e-mail duplicado", async () => {
    await expect(
      backend.createUser(admin, {
        name: "Duplicado",
        email: "supervisor@dd.local",
        password: "Teste@2026",
        role: "supervisor",
        active: true,
        storeIds: []
      })
    ).rejects.toThrow(/já existe/i);
  });

  it("cria supervisor e vincula à loja informada", async () => {
    const created = await backend.createUser(admin, {
      name: "Supervisor Teste",
      email: "supervisor.teste@dd.local",
      password: "Teste@2026",
      role: "supervisor",
      active: true,
      storeIds: [stores[0].id]
    });
    expect(created.storeIds).toContain(stores[0].id);
    const db = await getDb();
    const store = db.stores.find((item) => item.id === stores[0].id)!;
    expect(store.supervisorIds).toContain(created.id);

    const updated = await backend.updateUser(admin, created.id, {
      name: "Supervisor Teste Editado",
      email: "supervisor.teste@dd.local",
      role: "supervisor",
      active: false,
      storeIds: [stores[1].id]
    });
    expect(updated.name).toBe("Supervisor Teste Editado");
    expect(updated.active).toBe(false);
    expect(updated.storeIds).toEqual([stores[1].id]);
  });

  it("registra auditoria das ações administrativas", async () => {
    const audit = await backend.listAudit(admin, 1000);
    expect(audit.length).toBeGreaterThan(0);
    expect(audit.some((entry) => entry.action === "user.created")).toBe(true);
    expect(audit.some((entry) => entry.action === "template.created")).toBe(true);
    expect(audit.some((entry) => entry.action === "task.completed")).toBe(true);
    expect(audit.every((entry) => typeof entry.actorName === "string")).toBe(true);
  });
});

describe("seleção de backend", () => {
  it("usa o backend local quando o Supabase não está configurado", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const selected = getBackend();
    expect(selected.mode).toBe("local");
    expect(selected.isDemo).toBe(true);
  });
});
````

### `tsconfig.json`

````json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
````

### `vercel.json`

````json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/gerar",
      "schedule": "0 6 * * *"
    }
  ]
}
````

### `vitest.config.ts`

````typescript
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: "forks",
    fileParallelism: false
  }
});
````

