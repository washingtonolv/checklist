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

