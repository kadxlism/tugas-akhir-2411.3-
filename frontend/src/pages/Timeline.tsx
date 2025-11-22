import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo } from 'react';
import axios from '@/services/axios';
import { TimelineActivity } from '@/api/time';
import { useTimeline } from '@/hooks/useTimeline';
import TimelineFilters from '@/components/timeline/TimelineFilters';
import { LiveTimer } from '@/components/timeline/LiveTimer';
import TimelineEmpty from '@/components/timeline/TimelineEmpty';
import TimelineLoading from '@/components/timeline/TimelineLoading';
import TimelineError from '@/components/timeline/TimelineError';

dayjs.extend(relativeTime);

const Timeline = () => {
  const {
    activities,
    filters,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    error,
    updateFilters,
    clearFilters,
    loadTimeline,
  } = useTimeline();

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof typeof filters] !== undefined && filters[key as keyof typeof filters] !== ''
  );

  const getActivityTitle = (type: TimelineActivity['type']) => {
    switch (type) {
      case 'timer_started':
        return 'Timer dimulai';
      case 'timer_paused':
        return 'Timer dijeda';
      case 'timer_resumed':
        return 'Timer dilanjutkan';
      case 'timer_stopped':
        return 'Timer dihentikan';
      case 'manual_entry':
        return 'Entri waktu manual';
      case 'approved':
        return 'Time log disetujui';
      case 'rejected':
        return 'Time log ditolak';
      case 'task_created':
        return 'Tugas dibuat';
      default:
        return 'Aktivitas';
    }
  };

  const getStatusBadge = (status: string, isPlaceholder?: boolean, hasDuration?: boolean) => {
    if (isPlaceholder) {
      return hasDuration ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-blue-50 text-blue-700 border-blue-200';
    }
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getTaskStatusBadge = (status?: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'done':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes === undefined || minutes === null) return '-';
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}j ${mins}m` : `${hours}j`;
  };

  const renderActivityCell = (activity: TimelineActivity) => {
    const baseIconClass =
      'w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white/50';

    const iconMap = {
      timer_started: { bg: 'bg-linear-to-br from-emerald-200 to-emerald-300', icon: '▶' },
      timer_paused: { bg: 'bg-linear-to-br from-yellow-200 to-yellow-300', icon: '❚❚' },
      timer_resumed: { bg: 'bg-linear-to-br from-sky-200 to-sky-300', icon: '⏵' },
      timer_stopped: { bg: 'bg-linear-to-br from-rose-200 to-rose-300', icon: '■' },
      manual_entry: { bg: 'bg-linear-to-br from-purple-200 to-purple-300', icon: '✎' },
      approved: { bg: 'bg-linear-to-br from-green-200 to-green-300', icon: '✔' },
      rejected: { bg: 'bg-linear-to-br from-red-200 to-red-300', icon: '✖' },
      task_created: { bg: 'bg-linear-to-br from-indigo-200 to-indigo-300', icon: '＋' },
    } as const;

    const meta = iconMap[activity.type] || iconMap.task_created;

    return (
      <div className="flex items-start gap-3">
        <div className={`${baseIconClass} ${meta.bg}`}>
          <span className="text-sm font-semibold text-white drop-shadow">{meta.icon}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{getActivityTitle(activity.type)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activity.note
              ? activity.note
              : activity.is_placeholder
                ? 'Belum ada log waktu. Mulai timer dari halaman tugas untuk mencatat aktivitas.'
                : 'Tidak ada catatan tambahan.'}
          </p>
        </div>
      </div>
    );
  };

  const renderAssignmentCell = (activity: TimelineActivity) => (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        {activity.task?.title || 'Tugas'}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Project: <span className="font-medium text-gray-800 dark:text-gray-300">{activity.project?.name || '-'}</span>
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        User:{' '}
        <span className="font-medium text-gray-800 dark:text-gray-300">
          {activity.user?.name || 'Belum ditugaskan'}
        </span>
      </p>
    </div>
  );

  const handleStartTimer = async (taskId: string) => {
    try {
      await axios.patch(`/tasks/${taskId}/status`, { status: 'in_progress' });
      loadTimeline();
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const renderStatusCell = (activity: TimelineActivity) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
            activity.status,
            activity.is_placeholder,
            activity.duration_minutes > 0 || activity.task?.status === 'done' || activity.task?.status === 'in_progress'
          )}`}
        >
          {activity.is_placeholder ? (
            activity.running_start_time ? (
              <LiveTimer
                startTime={activity.running_start_time}
                initialDuration={activity.duration_minutes}
                className="inline-flex"
              />
            ) : activity.duration_minutes > 0 || activity.task?.status === 'done' || activity.task?.status === 'in_progress' ? (
              `${formatDuration(activity.duration_minutes)}`
            ) : (
              'Belum ada log'
            )
          ) : !activity.end_time && !activity.is_paused && activity.start_time ? (
            <LiveTimer
              startTime={activity.start_time}
              initialDuration={activity.duration_minutes}
              className="inline-flex"
            />
          ) : activity.status === 'approved' ? (
            'Approved'
          ) : activity.status === 'rejected' ? (
            'Rejected'
          ) : (
            'Pending'
          )}
        </span>
        {activity.task?.status && (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getTaskStatusBadge(
              activity.task.status
            )}`}
          >
            {activity.task.status === 'todo'
              ? 'Belum dikerjakan'
              : activity.task.status === 'in_progress'
                ? 'Sedang dikerjakan'
                : activity.task.status === 'review'
                  ? 'Review'
                  : 'Selesai'}
          </span>
        )}
        {activity.task?.status === 'todo' && (
          <button
            onClick={() => activity.task?.id && handleStartTimer(activity.task.id)}
            className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
            title="Mulai Timer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
      {!activity.is_placeholder && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Durasi: <span className="font-semibold text-gray-800 dark:text-gray-300">{formatDuration(activity.duration_minutes)}</span>
        </p>
      )}
    </div>
  );

  const renderTimeCell = (activity: TimelineActivity) => {
    const timestamp = dayjs(activity.timestamp);
    const start = activity.start_time ? dayjs(activity.start_time) : timestamp;
    return (
      <div className="text-sm text-gray-900 dark:text-white space-y-1">
        <div>
          <p className="font-semibold">{start.format('DD MMM YYYY')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{start.format('HH:mm')}</p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{timestamp.fromNow()}</p>
      </div>
    );
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6 lg:mb-8">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Time Tracker Timeline
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 hidden sm:block">
              Kelola catatan waktu tugas dan aktivitas tim
            </p>
          </div>
        </div>

        {/* Filters */}
        <TimelineFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
        />

        {hasActiveFilters && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <span className="font-semibold text-blue-700 dark:text-blue-400">Filter aktif:</span>{' '}
            {filters.user_id && `User ID: ${filters.user_id}, `}
            {filters.project_id && `Project ID: ${filters.project_id}, `}
            {filters.start_date && `Start: ${filters.start_date}, `}
            {filters.end_date && `End: ${filters.end_date}, `}
            {filters.status && `Status Approval: ${filters.status === 'pending' ? 'Pending' : filters.status === 'approved' ? 'Approved' : 'Rejected'}, `}
            {filters.task_status && `Status Tugas: ${filters.task_status === 'todo' ? 'Belum Dikerjakan' :
              filters.task_status === 'in_progress' ? 'Sedang Dalam Proses' :
                filters.task_status === 'review' ? 'Review' :
                  filters.task_status === 'done' ? 'Selesai' :
                    filters.task_status
              }`}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-red-100 dark:border-red-900 p-4 sm:p-6">
            <TimelineError error={error} onRetry={() => loadTimeline()} />
          </div>
        )
        }

        {/* Stats Summary */}
        {
          activities.length > 0 && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Activities</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activities.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activities.filter((a) => a.status === 'pending').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {activities.filter((a) => a.status === 'approved').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Timeline Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-0">
            {isLoading && activities.length === 0 ? (
              <div className="py-12">
                <TimelineLoading />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-linear-to-r from-blue-600 to-blue-700">
                    <tr>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                        Aktivitas
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                        Task & Project
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                        Waktu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 sm:px-6 lg:px-8 py-12 text-center">
                          <TimelineEmpty />
                          {hasActiveFilters && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-600">
                                Tidak ada aktivitas yang sesuai dengan filter yang dipilih.
                              </p>
                              <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
                              >
                                Hapus semua filter untuk melihat semua aktivitas
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : (
                      activities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 sm:px-6 lg:px-8 py-4 align-top">
                            {renderActivityCell(activity)}
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 align-top">
                            {renderAssignmentCell(activity)}
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 align-top">
                            {renderStatusCell(activity)}
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 align-top">
                            {renderTimeCell(activity)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activities.length > 0 && (
              <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Menampilkan {((currentPage - 1) * 5) + 1} sampai {Math.min(currentPage * 5, totalItems)} dari {totalItems} aktivitas
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => loadTimeline(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Sebelumnya</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    <div className="flex items-center space-x-1 overflow-x-auto">
                      {(() => {
                        const getVisiblePages = (current: number, total: number) => {
                          if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

                          let start = current - 2;
                          let end = current + 2;

                          if (start < 1) {
                            start = 1;
                            end = 5;
                          }

                          if (end > total) {
                            end = total;
                            start = total - 4;
                          }

                          return Array.from({ length: 5 }, (_, i) => start + i);
                        };

                        return getVisiblePages(currentPage, totalPages).map((page) => (
                          <button
                            key={page}
                            onClick={() => loadTimeline(page)}
                            disabled={isLoading}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg ${currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {page}
                          </button>
                        ));
                      })()}
                    </div>
                    <button
                      onClick={() => loadTimeline(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <span className="sm:hidden">Next</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
