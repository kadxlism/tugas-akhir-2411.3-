import { useState, useEffect } from 'react';
import { getTimesheet, approveTimeLog, rejectTimeLog } from '@/api/time';
import { TimeLog, TimeLogFilters } from '@/types/time-tracker';
import { useAuth } from '@/contexts/useAuth';

export default function TimesheetPage() {
  const { user } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [filters, setFilters] = useState<TimeLogFilters>({
    type: 'daily',
    date: new Date().toISOString().split('T')[0],
    user_id: user?.id,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    loadTimesheet();
  }, [filters]);

  const loadTimesheet = async () => {
    setIsLoading(true);
    try {
      const response = await getTimesheet(filters);
      setTimeLogs(response.data.data.time_logs);
      setSummary({
        total_minutes: response.data.data.total_minutes,
        total_hours: response.data.data.total_hours,
        total_logs: response.data.data.total_logs,
      });
    } catch (error) {
      console.error('Error loading timesheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await approveTimeLog(id);
      alert('Time log approved successfully!');
      await loadTimesheet();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve time log');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await rejectTimeLog(id, rejectionReason);
      alert('Time log rejected successfully!');
      setRejectingId(null);
      setRejectionReason('');
      await loadTimesheet();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject time log');
    }
  };

  const isAdminOrPM = user?.is_admin || false;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Timesheet</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => {
                const type = e.target.value as 'daily' | 'weekly';
                setFilters({
                  ...filters,
                  type,
                  date: type === 'daily' ? new Date().toISOString().split('T')[0] : undefined,
                  week_start: type === 'weekly' ? new Date().toISOString().split('T')[0] : undefined,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {filters.type === 'daily' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={filters.date || ''}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Start
                </label>
                <input
                  type="date"
                  value={filters.week_start || ''}
                  onChange={(e) => setFilters({ ...filters, week_start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week End
                </label>
                <input
                  type="date"
                  value={filters.week_end || ''}
                  onChange={(e) => setFilters({ ...filters, week_end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold">{summary.total_logs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Duration</p>
              <p className="text-2xl font-bold">{formatDuration(summary.total_minutes)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold">{summary.total_hours.toFixed(2)}h</p>
            </div>
          </div>
        </div>
      )}

      {/* Time Logs Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  {isAdminOrPM && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={isAdminOrPM ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                      No time logs found
                    </td>
                  </tr>
                ) : (
                  timeLogs.map((log) => {
                    const duration = log.duration_minutes - log.paused_duration_minutes;
                    return (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.start_time).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.user?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.task?.title || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.start_time).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.end_time ? new Date(log.end_time).toLocaleTimeString() : 'Running'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(duration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              log.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : log.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        {isAdminOrPM && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {log.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(log.id)}
                                  disabled={approvingId === log.id}
                                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                                >
                                  {approvingId === log.id ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => setRejectingId(log.id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reject Time Log</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
