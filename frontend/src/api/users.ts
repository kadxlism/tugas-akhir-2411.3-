import axios from '@/services/axios';
import { User } from '@/types/user'; // Pastikan kamu punya tipe `User`

// Ambil semua user
export const getUsers = () => {
  return axios.get<User[]>('/users');
};

// Tambah user (register)
export const createUser = (data: {
  name: string;
  email: string;
  password: string;
  is_admin?: boolean;
}) => {
  return axios.post('/users', data);
};

// Update user
export const updateUser = (id: number, data: Partial<User>) => {
  return axios.put(`/users/${id}`, data);
};

// Hapus user
export const deleteUser = (id: number) => {
  return axios.delete(`/users/${id}`);
};
