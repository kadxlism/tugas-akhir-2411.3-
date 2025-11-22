export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer_service' | 'pm' | 'team' | 'client';
}
