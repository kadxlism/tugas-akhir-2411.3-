import axios from "@/services/axios";
import { TaskPayload } from "@/types/task";

export const fetchTasks = async (projectId: number) => {
  return axios.get(`/projects/${projectId}/tasks`);
};

export const createTask = async (projectId: number, data: TaskPayload) => {
  return axios.post(`/projects/${projectId}/tasks`, data);
};
