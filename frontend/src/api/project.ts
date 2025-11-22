// src/api/project.ts
import axios from "@/services/axios";

export const fetchProjects = async () => {
  return axios.get("/projects");
};

export const createProject = async (data: {
  name: string;
  client_id: number;
  start_date?: string;
  end_date?: string;
  description?: string;
}) => {
  return axios.post("/projects", data);
};
