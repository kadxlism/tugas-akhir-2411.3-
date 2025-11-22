import { TimelineActivity } from '@/api/time';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(relativeTime);
dayjs.locale('id');

interface TimelineItemProps {
  activity: TimelineActivity;
}

import { LiveTimer } from './LiveTimer';

const TimelineItem = ({ activity }: TimelineItemProps) => {
  const getActivityIcon = (type: string) => {
    const iconClass = 'w-5 h-5';

    switch (type) {
      case 'timer_started':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center ring-2 ring-green-200">
            <svg className={`${iconClass} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'timer_paused':
        return (
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center ring-2 ring-yellow-200">
            <svg className={`${iconClass} text-yellow-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'timer_resumed':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ring-2 ring-blue-200">
            <svg className={`${iconClass} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'timer_stopped':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center ring-2 ring-red-200">
            <svg className={`${iconClass} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
            </svg>
          </div>
        );
      case 'manual_entry':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center ring-2 ring-purple-200">
            <svg className={`${iconClass} text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'approved':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center ring-2 ring-green-200">
            <svg className={`${iconClass} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'rejected':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center ring-2 ring-red-200">
            <svg className={`${iconClass} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'task_created':
        return (
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center ring-2 ring-indigo-200">
            <svg className={`${iconClass} text-indigo-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6m-3-3v6" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center ring-2 ring-gray-200">
            <svg className={`${iconClass} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'timer_started':
        return 'Timer Started';
      case 'timer_paused':
        return 'Timer Paused';
      case 'timer_resumed':
        return 'Timer Resumed';
      case 'timer_stopped':
        return 'Timer Stopped';
      case 'manual_entry':
        return 'Manual Time Entry';
      case 'approved':
        return 'Time Log Approved';
      case 'rejected':
        return 'Time Log Rejected';
      case 'task_created':
        return 'Tugas Dibuat';
      default:
        return 'Activity';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'Belum Dikerjakan';
      case 'in_progress':
        return 'Sedang Dalam Proses';
      case 'review':
        return 'Review';
      case 'done':
        return 'Selesai';
      default:
        return status;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isPlaceholder = activity.is_placeholder;

  const timestamp = dayjs(activity.timestamp);
  const relativeTime = timestamp.fromNow();
  const formattedDate = timestamp.format('DD MMM YYYY');
  const formattedTime = timestamp.format('HH:mm');

  return (
    <div className="relative flex items-start gap-4 pb-6">
      {/* Timeline Dot */}
      <div className="relative z-10 shrink-0">
        {getActivityIcon(activity.type)}
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-black mb-1">
              {getActivityTitle(activity.type)}
            </h3>
            <p className="text-sm text-black">
              {isPlaceholder ? (
                <>
                  Status awal tugas{' '}
                  <span className="font-medium text-black">{activity.user.name}</span>
                </>
              ) : (
                <>
                  by <span className="font-medium text-black">{activity.user.name}</span>
                </>
              )}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="text-sm font-medium text-black">{formattedDate}</p>
            <p className="text-xs text-black">{formattedTime}</p>
            <p className="text-xs text-gray-500 mt-1">{relativeTime}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Task</p>
              <p className="text-sm font-medium text-black truncate">{activity.task.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Project</p>
              <p className="text-sm font-medium text-black truncate">{activity.project.name}</p>
            </div>
          </div>
        </div>

        {activity.duration_minutes > 0 && !isPlaceholder && (
          <div className="mb-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-0.5">Duration</p>
              <p className="text-sm font-medium text-black">{formatDuration(activity.duration_minutes)}</p>
            </div>
          </div>
        )}

        {/* Live Timer for Placeholder */}
        {isPlaceholder && activity.running_start_time && (
          <LiveTimer
            startTime={activity.running_start_time}
            initialDuration={activity.duration_minutes}
          />
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {isPlaceholder ? (
              activity.running_start_time ? (
                <LiveTimer startTime={activity.running_start_time} initialDuration={activity.duration_minutes} />
              ) : activity.duration_minutes > 0 || activity.task.status === 'done' ? (
                <span className="px-3 py-1 text-xs font-medium rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
                  {formatDuration(activity.duration_minutes)}
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-medium rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  Belum ada log waktu
                </span>
              )
            ) : !activity.end_time && !activity.is_paused && activity.start_time ? (
              <LiveTimer startTime={activity.start_time} initialDuration={activity.duration_minutes} />
            ) : (
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(activity.status)}`}
                title="Status Approval Time Log"
              >
                {activity.status === 'pending' ? 'Pending' : activity.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
            )}
            {activity.task.status && (
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full border ${getTaskStatusColor(activity.task.status)}`}
                title="Status Tugas"
              >
                {getTaskStatusLabel(activity.task.status)}
              </span>
            )}
          </div>
          {activity.note && (
            <p className="text-xs text-black italic truncate max-w-xs ml-2" title={activity.note}>
              {activity.note}
            </p>
          )}
        </div>

        {activity.start_time && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-black">
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <span className="font-medium text-black">Start:</span>{' '}
                  <span className="text-black">{dayjs(activity.start_time).format('DD MMM YYYY, HH:mm')}</span>
                </span>
              </div>
              {activity.end_time && (
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <span className="font-medium text-black">End:</span>{' '}
                    <span className="text-black">{dayjs(activity.end_time).format('DD MMM YYYY, HH:mm')}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineItem;
