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

