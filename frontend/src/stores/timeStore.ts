import { create } from 'zustand';
import { TimeLog, ActiveTimer } from '@/types/time-tracker';
import * as timeApi from '@/api/time';

interface TimeState {
  activeTimer: ActiveTimer | null;
  timeLogs: TimeLog[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActiveTimer: () => Promise<void>;
  startTimer: (taskId: string, note?: string) => Promise<void>;
  pauseTimer: (timerId: string) => Promise<void>;
  resumeTimer: (timerId: string) => Promise<void>;
  stopTimer: (timerId: string) => Promise<void>;
  fetchTaskTimeLogs: (taskId: string) => Promise<void>;
  clearError: () => void;
}

export const useTimeStore = create<TimeState>((set, get) => ({
  activeTimer: null,
  timeLogs: [],
  isLoading: false,
  error: null,

  fetchActiveTimer: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await timeApi.getActiveTimer();
      set({ activeTimer: response.data.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch active timer',
        isLoading: false
      });
    }
  },

  startTimer: async (taskId: string, note?: string) => {
    try {
      set({ isLoading: true, error: null });
      await timeApi.startTimer(taskId, note);
      await get().fetchActiveTimer();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to start timer',
        isLoading: false
      });
      throw error;
    }
  },

  pauseTimer: async (timerId: string) => {
    try {
      set({ isLoading: true, error: null });
      await timeApi.pauseTimer(timerId);
      await get().fetchActiveTimer();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to pause timer',
        isLoading: false
      });
      throw error;
    }
  },

  resumeTimer: async (timerId: string) => {
    try {
      set({ isLoading: true, error: null });
      await timeApi.resumeTimer(timerId);
      await get().fetchActiveTimer();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to resume timer',
        isLoading: false
      });
      throw error;
    }
  },

  stopTimer: async (timerId: string) => {
    try {
      set({ isLoading: true, error: null });
      await timeApi.stopTimer(timerId);
      set({ activeTimer: null });
      await get().fetchTaskTimeLogs(get().activeTimer?.task_id || '');
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to stop timer',
        isLoading: false
      });
      throw error;
    }
  },

  fetchTaskTimeLogs: async (taskId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await timeApi.getTaskTimeLogs(taskId);
      set({ timeLogs: response.data.data.time_logs, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch time logs',
        isLoading: false
      });
    }
  },

  clearError: () => set({ error: null }),
}));

