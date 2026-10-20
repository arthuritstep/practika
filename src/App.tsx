import { useEffect, useState, type FormEvent } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type TaskStatus,
} from "./tasksApi";
import "./styles.css";

const STATUSES: TaskStatus[] = [
  "Новая",
  "В процессе",
  "Выполнена",
];

const emptyForm = {
  title: "",
  description: "",
  status: "Новая" as TaskStatus,
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState("Все");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      setError("");

      try {
        const data = await getTasks();
        setTasks(data);
      } catch {
        setError("Не удалось загрузить задачи");
      } finally {
        setLoading(false);
      }
    }

    void loadTasks();
  }, []);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // POST или PUT
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editingId !== null) {
        const updated = await updateTask(editingId, form);

        setTasks((prev) =>
          prev.map((task) =>
            task.id === editingId ? updated : task
          )
        );
      } else {
        const created = await createTask(form);

        setTasks((prev) => [created, ...prev]);
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch {
      setError("Не удалось сохранить задачу");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);

    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  // DELETE
  async function handleDelete(id: number) {
    setError("");
    setLoading(true);

    try {
      await deleteTask(id);

      setTasks((prev) => prev.filter((task) => task.id !== id));

      if (editingId === id) {
        cancelEdit();
      }
    } catch {
      setError("Не удалось удалить задачу");
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks =
    filter === "Все"
      ? tasks
      : tasks.filter((task) => task.status === filter);

  return (
    <main className="app">
      <header className="header">
        <span className="eyebrow">TASK MANAGER</span>
        <h1>Менеджер задач</h1>
        <p>Планируй дела и следи за прогрессом</p>
      </header>

      <section className="panel">
        <h2>
          {editingId !== null ? "Редактировать задачу" : "Новая задача"}
        </h2>

        <form onSubmit={handleSubmit} className="task-form">
          <label htmlFor="title">Название</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Например, изучить React"
            required
          />

          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Что нужно сделать?"
            rows={3}
            required
          />

          <label htmlFor="status">Статус</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {editingId !== null ? "Сохранить изменения" : "Добавить задачу"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary"
                onClick={cancelEdit}
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="tasks-section">
        <div className="tasks-heading">
          <div>
            <h2>Мои задачи</h2>
            <p>{filteredTasks.length} задач</p>
          </div>

          <select
            aria-label="Фильтр по статусу"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="Все">Все статусы</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error">{error}</p>}

        {loading && <p className="info">Загрузка...</p>}

        {!loading && filteredTasks.length === 0 && (
          <div className="empty">
            <h3>Задач пока нет</h3>
            <p>Добавь задачу или выбери другой фильтр</p>
          </div>
        )}

        <div className="task-list">
          {filteredTasks.map((task) => (
            <article className="task-card" key={task.id}>
              <div className="task-top">
                <h3>{task.title}</h3>

                <span
                  className={`badge ${
                    task.status === "Выполнена"
                      ? "done"
                      : task.status === "В процессе"
                      ? "progress"
                      : "new"
                  }`}
                >
                  {task.status}
                </span>
              </div>

              <p className="description">{task.description}</p>

              <div className="card-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => startEdit(task)}
                  disabled={loading}
                >
                  Редактировать
                </button>

                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDelete(task.id)}
                  disabled={loading}
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;