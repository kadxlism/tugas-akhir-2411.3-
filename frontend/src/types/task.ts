export interface TaskPayload {
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: number;
  priority?: "low" | "medium" | "high";
}
export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  assigned_to: number;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at?: string;
  updated_at?: string;
}