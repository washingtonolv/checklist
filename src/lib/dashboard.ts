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

