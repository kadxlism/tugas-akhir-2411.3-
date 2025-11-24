import axios from '@/services/axios';
import { Task } from '@/types/task';
import { buildQueryString } from '@/utils/queryParams';

export interface PaginatedTasks {
  data: Task[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const getTasks = (page: number = 1, perPage: number = 5, search: string = '') => {
  const filters: Record<string, any> = {
    page: String(page),
    per_page: String(perPage),
  };
  if (search) {
    filters.search = search;
  }
  const queryString = buildQueryString(filters, '/tasks');
  const url = queryString ? `/tasks?${queryString}` : '/tasks';
  return axios.get<PaginatedTasks>(url);
};
export const createTask = (data: Partial<Task>) => axios.post('/tasks', data);
export const updateTask = (id: number, data: Partial<Task>) => axios.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id: number, status: 'todo'|'in_progress'|'review'|'done') => axios.patch(`/tasks/${id}/status`, { status });
