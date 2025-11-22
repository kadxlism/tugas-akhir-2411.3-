export interface Client {
  id: number;
  company_name: string;
  owner_name: string;
  phone: string;
  category: string;
  package: string;
  created_at?: string;
  updated_at?: string;
}
