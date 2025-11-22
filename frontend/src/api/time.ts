import axios from '@/services/axios';
import { TimeLog, TimeLogFilters, TimesheetSummary, TotalTimePerTask, ActiveTimer } from '@/types/time-tracker';

// Timer controls
export const getActiveTimer = () =>
  axios.get<{ success: boolean; data: ActiveTimer | null }>('/time/active');

export const startTimer = (taskId: string, note?: string) =>
  axios.post<{ success: boolean; data: TimeLog }>('/time/start', { task_id: taskId, note });

export const pauseTimer = (timerId: string) =>
  axios.post<{ success: boolean; data: TimeLog }>('/time/pause', { timer_id: timerId });

export const resumeTimer = (timerId: string) =>
  axios.post<{ success: boolean; data: TimeLog }>('/time/resume', { timer_id: timerId });

export const stopTimer = (timerId: string) =>
  axios.post<{ success: boolean; data: TimeLog }>('/time/stop', { timer_id: timerId });

// Time logs CRUD
export const getTimeLogs = (filters?: TimeLogFilters) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  return axios.get<{ success: boolean; data: TimeLog[] }>(`/time?${params.toString()}`);
};

export const createManualTimeEntry = (data: {
  task_id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  note?: string;
}) => axios.post<{ success: boolean; data: TimeLog }>('/time/manual', data);

export const updateTimeLog = (id: string, data: Partial<TimeLog>) =>
  axios.put<{ success: boolean; data: TimeLog }>(`/time/${id}`, data);

export const deleteTimeLog = (id: string) =>
  axios.delete<{ success: boolean }>(`/time/${id}`);

export const getTimeLog = (id: string) =>
  axios.get<{ success: boolean; data: TimeLog }>(`/time/${id}`);

// Timesheet
export const getTimesheet = (filters?: TimeLogFilters) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  return axios.get<{ success: boolean; data: { time_logs: TimeLog[]; total_minutes: number; total_hours: number; total_logs: number } }>(`/timesheet?${params.toString()}`);
};

export const getTaskTimeLogs = (taskId: string) =>
  axios.get<{ success: boolean; data: { time_logs: TimeLog[]; total_minutes: number; total_hours: number } }>(`/time/task/${taskId}`);

// Timeline
export interface TimelineActivity {
  id: string;
  type:
  | 'timer_started'
  | 'timer_paused'
  | 'timer_resumed'
  | 'timer_stopped'
  | 'manual_entry'
  | 'approved'
  | 'rejected'
  | 'task_created';
  user: {
    id: string;
    name: string;
    email?: string;
  };
  task: {
    id: string;
    title: string;
    status?: string; // Task status: todo, in_progress, review, done
  };
  project: {
    id: string;
    name: string;
  };
  duration_minutes: number;
  status: 'pending' | 'approved' | 'rejected'; // Time log approval status
  note?: string;
  start_time: string;
  end_time?: string;
  is_paused?: boolean;
  timestamp: string;
  is_placeholder?: boolean;
  running_start_time?: string | null;
}

export interface TimelineResponse {
  activities: TimelineActivity[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export const getTimeline = (filters?: TimeLogFilters, page: number = 1, limit: number = 20) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  params.append('page', String(page));
  params.append('per_page', String(limit));
  return axios.get<{ success: boolean; data: TimelineResponse }>(`/time/timeline?${params.toString()}`);
};

// Approval
export const approveTimeLog = (timeLogId: string) =>
  axios.post<{ success: boolean; data: TimeLog }>('/time/approve', { time_log_id: timeLogId });

export const rejectTimeLog = (timeLogId: string, rejectionReason: string) =>
  axios.post<{ success: boolean; data: TimeLog }>('/time/reject', { time_log_id: timeLogId, rejection_reason: rejectionReason });

// Export
export const exportTimeLogs = (filters?: TimeLogFilters, format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
  const params = new URLSearchParams();
  params.append('format', format);
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  return axios.get(`/time/export?${params.toString()}`, {
    responseType: 'blob',
  });
};

// Long running timers
export const checkLongRunningTimers = () =>
  axios.get<{ success: boolean; data: { long_running_timers: any[]; count: number } }>('/time/check-long-running');
