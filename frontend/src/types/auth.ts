// src/types/auth.ts

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer_service' | 'pm' | 'team' | 'client';
  is_admin:boolean;
}
