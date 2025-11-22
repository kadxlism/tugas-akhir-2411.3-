import axios from '@/services/axios';
export const getProjects = () => axios.get('/projects');
export const createProject = (data: any) => axios.post('/projects', data);
export const updateProject = (id: number, data: any) => axios.put(`/projects/${id}`, data);
export const deleteProject = (id: number) => axios.delete(`/projects/${id}`);

export const assignUserToProject = (projectId: number, userId: number) =>
  axios.post(`/projects/${projectId}/assign`, { user_id: userId });
