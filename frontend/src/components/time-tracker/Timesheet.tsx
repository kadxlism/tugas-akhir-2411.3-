import { useState, useEffect } from 'react';
import { getTimesheet, exportTimeLogs } from '@/api/time-tracker';
import { TimeTracker, TimeLogFilters } from '@/types/time-tracker';
import { getTasks } from '@/api/alltasks';
import { useAuth } from '@/contexts/useAuth';

export default function Timesheet() {
  const { user } = useAuth();
  const [timeLogs, setTimeLogs] = useState<TimeTracker[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [filters, setFilters] = useState<TimeLogFilters>({
    type: 'daily',
    date: new Date().toISOString().split('T')[0],
    user_id: user?.id,
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTasks();
    loadTimesheet();
  }, [filters]);

  const loadTasks = async () => {
    try {
      const response = await getTasks(1, 100);
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadTimesheet = async () => {
    setIsLoading(true);
    try {
      const response = await getTimesheet(filters);
      setTimeLogs(response.data.time_logs);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error loading timesheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const response = await exportTimeLogs(filters, format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `time_logs_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export time logs');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Timesheet</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Export XLSX
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
              Project
            </label>
            <input
              type="number"
              placeholder="Project ID (optional)"
              value={filters.project_id || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  project_id: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {summary && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold">{summary.total_logs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold">{formatDuration(summary.total_duration)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">
                  {(summary.total_duration / 3600).toFixed(2)}h
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No time logs found
                    </td>
                  </tr>
                ) : (
                  timeLogs.map((log) => {
                    const duration = log.duration - log.paused_duration;
                    return (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.start_time).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.task?.title || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.project?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.start_time).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.end_time
                            ? new Date(log.end_time).toLocaleTimeString()
                            : 'Running'}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.is_manual ? 'Manual' : 'Timer'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

