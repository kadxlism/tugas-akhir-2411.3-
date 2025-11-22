import { useEffect, useCallback, useRef } from 'react';
import { getTimeline, TimelineActivity } from '@/api/time';
import { TimeLogFilters } from '@/types/time-tracker';
import { useTimelineStore } from '@/stores/timelineStore';

export const useTimeline = () => {
  const {
    activities,
    filters,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    error,
    setActivities,
    setFilters,
    setCurrentPage,
    setTotalPages,
    setTotalItems,
    setLoading,
    setError,
    reset,
  } = useTimelineStore();

  const filtersRef = useRef(filters);

  // Update ref when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const loadTimeline = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTimeline(filtersRef.current, page, 5);
        const { activities, current_page, last_page, total } = response.data.data;

        setActivities(activities);
        setCurrentPage(current_page);
        setTotalPages(last_page);
        setTotalItems(total);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || 'Failed to load timeline';
        setError(errorMessage);
        console.error('Error loading timeline:', err);
      } finally {
        setLoading(false);
      }
    },
    [setActivities, setCurrentPage, setTotalPages, setTotalItems, setLoading, setError]
  );

  const updateFilters = useCallback(
    (newFilters: TimeLogFilters) => {
      setFilters(newFilters);
      // Reset to page 1 when filters change
      loadTimeline(1);
    },
    [setFilters, loadTimeline]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    loadTimeline(1);
  }, [setFilters, loadTimeline]);

  // Initial load
  useEffect(() => {
    loadTimeline(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    activities,
    filters,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    error,
    loadTimeline,
    updateFilters,
    clearFilters,
    reset,
  };
};
