"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { loadTasks, saveTasks } from "@/lib/taskRepository";
import { createTask, type Task } from "@/lib/tasks";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [titleInput, setTitleInput] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const validationId = useId();

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
          <h2 className="text-lg font-semibold">Tasks</h2>
          {tasks.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              No tasks yet. Add your first todo above.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      aria-label={`Completion status for ${task.title}`}
                      className="h-4 w-4"
                    />
                    <span>{task.title}</span>
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
