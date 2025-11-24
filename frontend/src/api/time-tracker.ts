import axios from '@/services/axios';
import { TimeLog, TimeLogFilters, TimesheetSummary, TotalTimePerTask, ActiveTimer } from '@/types/time-tracker';
import { buildQueryString } from '@/utils/queryParams';

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
export const getTimeTrackers = (filters?: TimeLogFilters) => {
  const queryString = buildQueryString(filters, '/time-tracker');
  const url = queryString ? `/time-tracker?${queryString}` : '/time-tracker';
  return axios.get<{ data: TimeLog[] }>(url);
};

export const createManualTimeEntry = (data: {
  task_id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  note?: string;
}) => axios.post<{ success: boolean; data: TimeLog }>('/time/manual', data);

export const updateTimeTracker = (id: string, data: Partial<TimeLog>) =>
  axios.put<TimeLog>(`/time-tracker/${id}`, data);

export const deleteTimeTracker = (id: string) =>
  axios.delete(`/time-tracker/${id}`);

export const getTimeTracker = (id: string) =>
  axios.get<TimeLog>(`/time-tracker/${id}`);

// Timesheet
export const getTimesheet = (filters?: TimeLogFilters) => {
  const queryString = buildQueryString(filters, '/timesheet');
  const url = queryString ? `/timesheet?${queryString}` : '/timesheet';
  return axios.get<{ success: boolean; data: { time_logs: TimeLog[]; total_minutes: number; total_hours: number; total_logs: number } }>(url);
};

export const getTaskTimeLogs = (taskId: string) =>
  axios.get<{ success: boolean; data: { time_logs: TimeLog[]; total_minutes: number; total_hours: number } }>(`/time/task/${taskId}`);

// Approval
export const approveTimeLog = (timeLogId: string) =>
  axios.post<{ success: boolean; data: TimeLog }>('/time/approve', { time_log_id: timeLogId });

export const rejectTimeLog = (timeLogId: string, rejectionReason: string) =>
  axios.post<{ success: boolean; data: TimeLog }>('/time/reject', { time_log_id: timeLogId, rejection_reason: rejectionReason });

// Export
export const exportTimeLogs = (filters?: TimeLogFilters, format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
  // Build query params with format and filters
  const allParams = {
    format,
    ...filters,
  };
  const queryString = buildQueryString(allParams, '/time-tracker/export');
  const url = queryString ? `/time-tracker/export?${queryString}` : '/time-tracker/export';
  return axios.get(url, {
    responseType: 'blob',
  });
};

// Long running timers
export const checkLongRunningTimers = () =>
  axios.get<{ long_running_timers: any[]; count: number }>('/time-tracker/check-long-running');
