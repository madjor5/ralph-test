export const TASK_TITLE_MAX_LENGTH = 120;

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskTitleValidationErrorCode = "EMPTY_TITLE" | "TITLE_TOO_LONG";

export type TaskTitleValidationError = {
  code: TaskTitleValidationErrorCode;
  message: string;
};

export type TaskTitleValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: TaskTitleValidationError };

export type TaskMutationNotFoundError = {
  code: "TASK_NOT_FOUND";
  message: string;
};

export type IdGenerator = () => string;

const defaultIdGenerator: IdGenerator = () => crypto.randomUUID();

const toIsoString = (date: Date) => date.toISOString();

export function normalizeTaskTitle(input: string): string {
  return input.trim();
}

export function validateTaskTitle(input: string): TaskTitleValidationResult {
  const normalized = normalizeTaskTitle(input);

  if (normalized.length === 0) {
    return {
      ok: false,
      error: {
        code: "EMPTY_TITLE",
        message: "Task title must not be empty.",
      },
    };
  }

  if (normalized.length > TASK_TITLE_MAX_LENGTH) {
    return {
      ok: false,
      error: {
        code: "TITLE_TOO_LONG",
        message: `Task title must be ${TASK_TITLE_MAX_LENGTH} characters or fewer.`,
      },
    };
  }

  return { ok: true, value: normalized };
}

export function createTask(
  input: string,
  options?: {
    now?: Date;
    idGenerator?: IdGenerator;
  },
): { ok: true; value: Task } | { ok: false; error: TaskTitleValidationError } {
  const validation = validateTaskTitle(input);
  if (!validation.ok) {
    return validation;
  }

  const now = options?.now ?? new Date();
  const idGenerator = options?.idGenerator ?? defaultIdGenerator;

  return {
    ok: true,
    value: {
      id: idGenerator(),
      title: validation.value,
      completed: false,
      createdAt: toIsoString(now),
      updatedAt: toIsoString(now),
    },
  };
}

export function updateTaskTitle(
  tasks: readonly Task[],
  taskId: string,
  input: string,
  now: Date = new Date(),
):
  | { ok: true; value: Task[] }
  | { ok: false; error: TaskTitleValidationError | TaskMutationNotFoundError } {
  const validation = validateTaskTitle(input);
  if (!validation.ok) {
    return validation;
  }

  let found = false;
  const updatedTasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    found = true;

    return {
      ...task,
      title: validation.value,
      updatedAt: toIsoString(now),
    };
  });

  if (!found) {
    return {
      ok: false,
      error: {
        code: "TASK_NOT_FOUND",
        message: `Task with id '${taskId}' was not found.`,
      },
    };
  }

  return { ok: true, value: updatedTasks };
}

export function toggleTaskCompletion(
  tasks: readonly Task[],
  taskId: string,
  now: Date = new Date(),
): { value: Task[]; changed: boolean } {
  let changed = false;

  const updatedTasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    changed = true;

    return {
      ...task,
      completed: !task.completed,
      updatedAt: toIsoString(now),
    };
  });

  return {
    value: updatedTasks,
    changed,
  };
}

export function deleteTaskById(
  tasks: readonly Task[],
  taskId: string,
): { value: Task[]; deleted: boolean } {
  const nextTasks = tasks.filter((task) => task.id !== taskId);

  return {
    value: nextTasks,
    deleted: nextTasks.length !== tasks.length,
  };
}

export function clearCompletedTasks(
  tasks: readonly Task[],
): { value: Task[]; cleared: boolean } {
  const nextTasks = tasks.filter((task) => !task.completed);

  return {
    value: nextTasks,
    cleared: nextTasks.length !== tasks.length,
  };
}
