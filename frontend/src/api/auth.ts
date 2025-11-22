import axios from "@/services/axios";

export const login = async (email: string, password: string) => {
  await axios.get("/sanctum/csrf-cookie");
  return axios.post("/login", { email, password });
};

export const logout = async () => {
  await axios.get("/sanctum/csrf-cookie");
  return axios.post("/api/auth/logout");
};

export const setUser = async () => {
  await axios.get("/sanctum/csrf-cookie");
  return axios.get("/api/auth/me");
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}) => {
  await axios.get("/sanctum/csrf-cookie");
  return axios.post("/api/auth/register", data);
};
