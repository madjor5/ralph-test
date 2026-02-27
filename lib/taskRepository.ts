import { type Task } from "./tasks";

export const TASKS_STORAGE_KEY = "todo-app.tasks";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const getStorage = (storage?: StorageLike): StorageLike | null => {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

const isTask = (value: unknown): value is Task => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.completed === "boolean" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
};

const isTaskList = (value: unknown): value is Task[] => {
  return Array.isArray(value) && value.every(isTask);
};

export function loadTasks(storage?: StorageLike): Task[] {
  const targetStorage = getStorage(storage);
  if (!targetStorage) {
    return [];
  }

  const rawTasks = targetStorage.getItem(TASKS_STORAGE_KEY);
  if (rawTasks === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawTasks);
    return isTaskList(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: readonly Task[], storage?: StorageLike): void {
  const targetStorage = getStorage(storage);
  if (!targetStorage) {
    return;
  }

  try {
    targetStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage write failures (e.g., quota exceeded) to avoid runtime crashes.
  }
}
