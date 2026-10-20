export type TaskStatus = "Новая" | "В процессе" | "Выполнена";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
}

export type TaskInput = Omit<Task, "id">;

const API_URL = "https://jsonplaceholder.typicode.com/posts";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

interface ApiPost {
  id: number;
  title: string;
  body: string;
}

function mapPost(post: ApiPost): Task {
  return {
    id: post.id,
    title: post.title,
    description: post.body,
    status: "Новая",
  };
}

export async function getTasks(): Promise<Task[]> {
  const posts = await request<ApiPost[]>(API_URL);

  return posts.slice(0, 10).map(mapPost);
}

export async function createTask(
  task: TaskInput
): Promise<Task> {
  const post = await request<ApiPost>(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: task.title,
      body: task.description,
      status: task.status,
    }),
  });

  return {
    ...task,
    id: post.id,
  };
}

export async function updateTask(
  id: number,
  task: TaskInput
): Promise<Task> {
  await request<ApiPost>(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      title: task.title,
      body: task.description,
      status: task.status,
    }),
  });

  return {
    id,
    ...task,
  };
}

export async function deleteTask(id: number): Promise<void> {
  await request<unknown>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}