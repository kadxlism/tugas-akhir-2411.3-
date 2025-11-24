import axios from '@/services/axios';
import { Client } from '@/types/client';
import { buildQueryString } from '@/utils/queryParams';

export interface PaginatedClients {
  data: Client[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const getClients = (page: number = 1, perPage: number = 5, search: string = '') => {
  const filters: Record<string, any> = {
    page: String(page),
    per_page: String(perPage),
  };
  if (search) {
    filters.search = search;
  }
  const queryString = buildQueryString(filters, '/clients');
  const url = queryString ? `/clients?${queryString}` : '/clients';
  return axios.get<PaginatedClients>(url);
};
export const createClient = (data: Partial<Client>) => axios.post('/clients', data);
export const updateClient = (id: number, data: Partial<Client>) => axios.put(`/clients/${id}`, data);
export const deleteClient = (id: number) => axios.delete(`/clients/${id}`);
