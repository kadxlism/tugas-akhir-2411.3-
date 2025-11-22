import { create } from 'zustand';
import { TimelineActivity } from '@/api/time';
import { TimeLogFilters } from '@/types/time-tracker';

interface TimelineState {
  activities: TimelineActivity[];
  filters: TimeLogFilters;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActivities: (activities: TimelineActivity[]) => void;
  setFilters: (filters: TimeLogFilters) => void;
  clearFilters: () => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setTotalItems: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  activities: [],
  filters: {},
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  isLoading: false,
  error: null,
};

export const useTimelineStore = create<TimelineState>((set) => ({
  ...initialState,

  setActivities: (activities) => set({ activities }),

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: {} }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setTotalPages: (pages) => set({ totalPages: pages }),

  setTotalItems: (total) => set({ totalItems: total }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

