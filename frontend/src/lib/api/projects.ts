import api from "./axios";
import { Todo } from "./todos";

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  is_archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  todos?: Todo[];
}

export interface ProjectCreate {
  name: string;
  description?: string;
  color?: string;
  is_archived?: boolean;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  color?: string;
  is_archived?: boolean;
}

export const getProjects = async (
  includeArchived: boolean = false
): Promise<Project[]> => {
  const response = await api.get<Project[]>("/projects", {
    params: { include_archived: includeArchived },
  });
  return response.data;
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await api.get<Project>(`/projects/${id}`);
  return response.data;
};

export const createProject = async (data: ProjectCreate): Promise<Project> => {
  const response = await api.post<Project>("/projects", data);
  return response.data;
};

export const updateProject = async (
  id: string,
  data: ProjectUpdate
): Promise<Project> => {
  const response = await api.put<Project>(`/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};
