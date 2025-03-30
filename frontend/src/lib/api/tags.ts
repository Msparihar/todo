import api from "./axios";

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TagCreate {
  name: string;
  color?: string;
}

export interface TagUpdate {
  name?: string;
  color?: string;
}

export const getTags = async (): Promise<Tag[]> => {
  const response = await api.get<Tag[]>("/tags");
  return response.data;
};

export const getTag = async (id: string): Promise<Tag> => {
  const response = await api.get<Tag>(`/tags/${id}`);
  return response.data;
};

export const createTag = async (data: TagCreate): Promise<Tag> => {
  const response = await api.post<Tag>("/tags", data);
  return response.data;
};

export const updateTag = async (id: string, data: TagUpdate): Promise<Tag> => {
  const response = await api.put<Tag>(`/tags/${id}`, data);
  return response.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  await api.delete(`/tags/${id}`);
};
