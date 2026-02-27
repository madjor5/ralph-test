"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { loadTasks, saveTasks } from "@/lib/taskRepository";
import {
  createTask,
  deleteTaskById,
  type Task,
  toggleTaskCompletion,
  updateTaskTitle,
} from "@/lib/tasks";

type TaskFilter = "all" | "active" | "completed";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [titleInput, setTitleInput] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const [editValidationMessage, setEditValidationMessage] = useState<string | null>(null);
  const validationId = useId();
  const editValidationId = useId();

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const taskResult = createTask(titleInput);
    if (!taskResult.ok) {
      setValidationMessage(taskResult.error.message);
      return;
    }

    setTasks((currentTasks) => [...currentTasks, taskResult.value]);
    setTitleInput("");
    setValidationMessage(null);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((currentTasks) => toggleTaskCompletion(currentTasks, taskId).value);
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitleInput(task.title);
    setEditValidationMessage(null);
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditTitleInput("");
    setEditValidationMessage(null);
  };

  const handleEditTaskSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingTaskId) {
      return;
    }

    const updated = updateTaskTitle(tasks, editingTaskId, editTitleInput);
    if (!updated.ok) {
      setEditValidationMessage(updated.error.message);
      return;
    }

    setTasks(updated.value);
    cancelEditingTask();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((currentTasks) => {
      const updated = deleteTaskById(currentTasks, taskId);
      return updated.value;
    });

    if (editingTaskId === taskId) {
      cancelEditingTask();
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") {
      return !task.completed;
    }

    if (filter === "completed") {
      return task.completed;
    }

    return true;
  });

  const getEmptyStateMessage = () => {
    if (tasks.length === 0) {
      return "No tasks yet. Add your first todo above.";
    }

    if (filter === "active") {
      return "No active tasks right now.";
    }

    if (filter === "completed") {
      return "No completed tasks yet.";
    }

    return "No tasks available.";
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Todo Home</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create tasks and track what needs to get done.
          </p>
        </header>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit} noValidate>
          <label htmlFor="task-title" className="block text-sm font-medium">
            Task title
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="task-title"
              name="title"
              type="text"
              value={titleInput}
              onChange={(event) => {
                setTitleInput(event.target.value);
                if (validationMessage) {
                  setValidationMessage(null);
                }
              }}
              placeholder="e.g. Finish report"
              aria-invalid={validationMessage !== null}
              aria-describedby={validationMessage ? validationId : undefined}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Add task
            </button>
          </div>
          {validationMessage ? (
            <p id={validationId} className="text-sm text-red-700" role="alert">
              {validationMessage}
            </p>
          ) : null}
        </form>

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <div className="flex items-center gap-2">
              {(["all", "active", "completed"] as const).map((option) => {
                const isActive = filter === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {option[0].toUpperCase()}
                    {option.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          {filteredTasks.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              {getEmptyStateMessage()}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    {editingTaskId === task.id ? (
                      <form className="w-full space-y-2" onSubmit={handleEditTaskSubmit} noValidate>
                        <label htmlFor={`edit-task-${task.id}`} className="sr-only">
                          Edit task title
                        </label>
                        <input
                          id={`edit-task-${task.id}`}
                          type="text"
                          value={editTitleInput}
                          onChange={(event) => {
                            setEditTitleInput(event.target.value);
                            if (editValidationMessage) {
                              setEditValidationMessage(null);
                            }
                          }}
                          aria-invalid={editValidationMessage !== null}
                          aria-describedby={editValidationMessage ? editValidationId : undefined}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingTask}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:border-red-400 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                        {editValidationMessage ? (
                          <p id={editValidationId} className="text-sm text-red-700" role="alert">
                            {editValidationMessage}
                          </p>
                        ) : null}
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            aria-label={`Completion status for ${task.title}`}
                            className="h-4 w-4"
                          />
                          <span className={task.completed ? "text-slate-500 line-through" : ""}>
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditingTask(task)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:border-red-400 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
