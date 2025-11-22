export interface TimeLog {
  id: string; // UUID
  user_id: number;
  task_id: number;
  project_id?: number;
  start_time: string; // ISO date string
  end_time: string | null; // ISO date string or null
  duration_minutes: number; // in minutes
  note?: string;
  status: 'pending' | 'approved' | 'rejected'; // Status approval time log
  paused_at: string | null; // ISO date string or null
  paused_duration_minutes: number; // in minutes
  created_at?: string;
  updated_at?: string;
  user?: { id: number; name: string }; // Basic user info
  task?: { id: number; title: string; status: string; project_id: number }; // Basic task info (task status: todo, in_progress, review, done)
  project?: { id: number; name: string }; // Basic project info
}

export interface ActiveTimer extends TimeLog {
  current_duration_minutes: number; // Calculated elapsed time in minutes
  is_paused: boolean;
}

export interface TimeLogFilters {
  type?: 'daily' | 'weekly';
  date?: string; // YYYY-MM-DD for daily
  week_start?: string; // YYYY-MM-DD for weekly
  week_end?: string; // YYYY-MM-DD for weekly
  user_id?: number;
  project_id?: number;
  status?: 'pending' | 'approved' | 'rejected'; // Status approval time log
  task_status?: 'todo' | 'in_progress' | 'review' | 'done'; // Status task
  start_date?: string;
  end_date?: string;
  task_id?: number;
}

export interface TimesheetSummary {
  total_minutes: number;
  total_hours: number;
  total_logs: number;
}

export interface TotalTimePerTask {
  total_minutes: number;
  total_hours: number;
}
