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
  username?: string | null;
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
  username?: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
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
  expired?: boolean;
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

