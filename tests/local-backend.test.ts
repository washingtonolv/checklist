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
  it("recusa fallback local quando o Supabase não está configurado", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => getBackend()).toThrow();
  });
});

