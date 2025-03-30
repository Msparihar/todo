import api from "./axios";
import { Project } from "./projects";
import { Tag } from "./tags";

export enum TodoStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
}

export enum TodoPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  status: TodoStatus;
  priority: TodoPriority;
  due_date: string | null;
  completed_at: string | null;
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  project?: Project;
  tags?: Tag[];
}

export interface TodoCreate {
  title: string;
  description?: string;
  is_completed?: boolean;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_date?: string;
  project_id: string;
  tag_ids?: string[];
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  is_completed?: boolean;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_date?: string;
  project_id?: string;
  tag_ids?: string[];
}

export const getTodos = async (filters?: {
  status?: TodoStatus;
  is_completed?: boolean;
  priority?: TodoPriority;
  project_id?: string;
  tag_id?: string;
}): Promise<Todo[]> => {
  console.log("Fetching todos with filters:", filters);
  const response = await api.get<Todo[]>("/todos", { params: filters });
  return response.data;
};

export const getTodosByProject = async (projectId: string): Promise<Todo[]> => {
  console.log(`Fetching todos for project: ${projectId}`);
  return getTodos({ project_id: projectId });
};

export const getTodo = async (id: string): Promise<Todo> => {
  const response = await api.get<Todo>(`/todos/${id}`);
  return response.data;
};

export const createTodo = async (data: TodoCreate): Promise<Todo> => {
  const response = await api.post<Todo>("/todos", data);
  return response.data;
};

export const updateTodo = async (
  id: string,
  data: TodoUpdate
): Promise<Todo> => {
  const response = await api.put<Todo>(`/todos/${id}`, data);
  return response.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  await api.delete(`/todos/${id}`);
};
