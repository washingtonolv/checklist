import { assertAdmin, assertGeneralAdmin, isGeneralAdmin, GENERAL_ADMIN_ID, canReview, assertStoreAccess } from "../../access";
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
import { assertPhotoEnvironment, createPhotoObjectStore, photoExpired } from "../../photo-store";
import { optimizePhoto } from "@/lib/photo-image";

type Row = Record<string, any>;



function fail(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ? translateError(error.message, fallback) : fallback);
}

function translateError(message: string, fallback: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("duplicate key") && lower.includes("username")) return "Este nome de usuário já está em uso.";
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
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
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
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  rows: Row[]
): Promise<Row[]> {
  if (!rows.length) return [];
  return rows.map((row) => ({ ...row, signed_url: photoExpired(row.created_at) ? "" : `/api/photos/${row.id}` }));
}

function mapPhotoRow(row: Row): TaskPhoto {
  return {
    id: row.id,
    taskId: row.task_id,
    expired: photoExpired(row.created_at),
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
        const supabase = await createSupabaseServerClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user) return null;
        const [profileResult, storesResult] = await Promise.all([
          supabase.from("profiles").select("id,name,email,role,active").eq("id", user.id).maybeSingle(),
          supabase.from("stores").select("id").eq("active", true)
        ]);
        const { data: profile } = profileResult;
        if (!profile || !profile.active) return null;
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          active: profile.active,
          storeIds: (storesResult.data ?? []).map((store: Row) => store.id)
        };
      },
      async signIn(email, password) {
        const identifier = email.trim().toLowerCase();
        if (!identifier.includes("@")) {
          const admin = createSupabaseAdminClient();
          const { data: profile, error: lookupError } = await admin.from("profiles")
            .select("email").eq("username", identifier).eq("active", true).maybeSingle();
          if (lookupError || !profile) throw new Error("E-mail, usuário ou senha inválidos.");
          email = profile.email;
        } else {
          email = identifier;
        }
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
        await supabase.auth.signOut();
      },
      async requestPasswordReset(email) {
        const supabase = await createSupabaseServerClient();
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
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) fail(error, "Não foi possível atualizar a senha.");
      }
    },

    async listStores(actor) {
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
      const [profilesResult, storesResult, linksResult] = await Promise.all([
        supabase.from("profiles").select("id,name,email,username,role,active,created_at").neq("id", GENERAL_ADMIN_ID).order("name"),
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
          username: profile.username,
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
      if (input.role === "admin") assertGeneralAdmin(actor);
      if (input.role === "manager" && input.storeIds.length > 1) {
        throw new Error("Um gerente de loja pode estar vinculado a apenas uma loja.");
      }
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { name: input.name },
        app_metadata: { role: input.role }
      });
      if (error || !data.user) fail(error, "Não foi possível criar o usuário.");
      const userId = data.user.id;
      try {
        const { error: profileError } = await admin.from("profiles").upsert({
          id: userId,
          username: input.username ?? null,
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
      const supabase = await createSupabaseServerClient();
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
      if (id === GENERAL_ADMIN_ID) throw new Error("O Administrador Geral é protegido.");
      if (profile.role === "admin" || input.role === "admin" || !input.active) assertGeneralAdmin(actor);
      if (input.username) {
        const { data: duplicate, error: checkError } = await admin.from("profiles").select("id").eq("username", input.username).neq("id", id).maybeSingle();
        if (checkError) fail(checkError, "Não foi possível validar o usuário.");
        if (duplicate) throw new Error("Este nome de usuário já está em uso.");
      }
      const authUpdate: Record<string, unknown> = {
        email: input.email,
        email_confirm: true,
        user_metadata: { name: input.name },
        app_metadata: { role: input.role }
      };
      if (input.password) authUpdate.password = input.password;
      const { error: authError } = await admin.auth.admin.updateUserById(id, authUpdate);
      if (authError) fail(authError, "Não foi possível atualizar o acesso do usuário.");
      const { error: profileError } = await admin
        .from("profiles")
        .update({ name: input.name, email: input.email, username: input.username, role: input.role, active: input.active })
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
          "id,template_id,store_id,title,description,category_id,recurrence,period_key,due_date,due_time,status,photo_requirement,completed_at,completed_by,approved_at,approved_by,observation,created_at,store:stores!task_instances_store_id_fkey(id,name,code),category:categories!task_instances_category_id_fkey(id,name),completed:profiles!task_instances_completed_by_fkey(id,name),approved:profiles!task_instances_approved_by_fkey(id,name),photos:r2_task_photos(count)"
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
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("task_instances")
        .select(
          "id,template_id,store_id,title,description,category_id,recurrence,period_key,due_date,due_time,status,photo_requirement,completed_at,completed_by,approved_at,approved_by,observation,created_at,store:stores!task_instances_store_id_fkey(id,name,code),category:categories!task_instances_category_id_fkey(id,name),completed:profiles!task_instances_completed_by_fkey(id,name),approved:profiles!task_instances_approved_by_fkey(id,name),photos:r2_task_photos(count)"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) fail(error, "Não foi possível carregar a atividade.");
      if (!data) return null;
      const [photosResult, executionsResult, observationsResult] = await Promise.all([
        supabase
          .from("r2_task_photos")
          .select("id,task_id,storage_path,mime_type,size_bytes,is_original,uploaded_by,created_at,uploader:profiles!r2_task_photos_uploaded_by_fkey(id,name)")
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
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.rpc("generate_task_instances", { p_today: todayKey() });
      if (error) fail(error, "Não foi possível gerar as tarefas.");
      return Number(data ?? 0);
    },

    async startTask(actor, id) {
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
      const { data: task } = await supabase
        .from("task_instances")
        .select("id,status,title,photo_requirement")
        .eq("id", id)
        .maybeSingle();
      if (!task) throw new Error("Atividade não encontrada ou sem permissão.");
      if (task.status === "completed") throw new Error("Esta atividade já está concluída.");
      const { count } = await supabase
        .from("r2_task_photos")
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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
      assertPhotoEnvironment();
      const supabase = await createSupabaseServerClient();
      const { data: task } = await supabase
        .from("task_instances")
        .select("id,store_id,status,title,photo_requirement")
        .eq("id", taskId)
        .maybeSingle();
      if (!task) throw new Error("Atividade não encontrada ou sem permissão.");
      assertStoreAccess(actor, task.store_id);
      if (task.status === "completed" && !canReview(actor)) {
        throw new Error("Atividade concluída. Solicite a reabertura para anexar novas evidências.");
      }
      const { count } = await supabase
        .from("r2_task_photos")
        .select("id", { count: "exact", head: true })
        .eq("task_id", taskId)
        .eq("is_original", false);
      if (count === null) throw new Error("Não foi possível conferir o limite de fotos.");
      if ((count ?? 0) >= MAX_PHOTOS_PER_TASK) {
        throw new Error(`Limite de ${MAX_PHOTOS_PER_TASK} fotos por atividade atingido.`);
      }
      const optimized = await optimizePhoto(input);
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const storagePath = `lojas/${task.store_id}/${createdAt.slice(0,10).replaceAll("-", "/")}/${taskId}/${id}.webp`;
      const store = createPhotoObjectStore();
      await store.put(storagePath, optimized.buffer);
      try {
        // Clients cannot invent metadata to satisfy required-photo checks.
        // The session client above authorizes the task; only this server writes metadata.
        const { error } = await createSupabaseAdminClient().from("r2_task_photos").insert({
          id, task_id: taskId, storage_path: storagePath,
          mime_type: optimized.mimeType, size_bytes: optimized.sizeBytes,
          width: optimized.width, height: optimized.height,
          is_original: false, uploaded_by: actor.id, created_at: createdAt
        });
        if (error) fail(error, "Não foi possível registrar a foto.");
      } catch (error) {
        try { await store.delete(storagePath); }
        catch { console.error("R2 orphan cleanup failed", { storagePath }); }
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
        sizeBytes: optimized.sizeBytes,
        mimeType: optimized.mimeType
      });

      return {
        id,
        taskId,
        storagePath,
        url: `/api/photos/${id}`,
        mimeType: optimized.mimeType,
        sizeBytes: optimized.sizeBytes,
        isOriginal: false,
        uploadedById: actor.id,
        uploadedByName: actor.name,
        createdAt
      } satisfies TaskPhoto;
    },

    async deletePhoto(actor, photoId) {
      assertPhotoEnvironment();
      assertAdmin(actor);
      const supabase = await createSupabaseServerClient();
      const { data: photo } = await supabase
        .from("r2_task_photos")
        .select("id,task_id,storage_path,task:task_instances!r2_task_photos_task_id_fkey(title,store_id)")
        .eq("id", photoId)
        .maybeSingle();
      if (!photo) throw new Error("Foto não encontrada.");
      const task = Array.isArray(photo.task) ? photo.task[0] : photo.task;
      if (!task) throw new Error("Atividade não encontrada.");
      assertStoreAccess(actor, task.store_id);
      await createPhotoObjectStore().delete(photo.storage_path);
      const { error } = await supabase.rpc("delete_r2_photo", { p_id: photoId });
      if (error) fail(error, "Não foi possível remover a foto.");
    },

    async listPhotosForTasks(actor, taskIds) {
      if (!taskIds.length) return [];
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("r2_task_photos")
        .select("id,task_id,storage_path,mime_type,size_bytes,is_original,uploaded_by,created_at,uploader:profiles!r2_task_photos_uploaded_by_fkey(id,name)")
        .in("task_id", taskIds)
        .order("created_at", { ascending: false });
      if (error) fail(error, "Não foi possível carregar as fotos.");
      const photos = await signedPhotos(supabase, data ?? []);
      return photos.map(mapPhotoRow);
    },

    async listHistory(actor, filters = {}) {
      const supabase = await createSupabaseServerClient();
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
      const supabase = await createSupabaseServerClient();
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

