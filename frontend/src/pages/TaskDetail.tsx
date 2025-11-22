import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTimeStore } from '@/stores/timeStore';
import { getTasks } from '@/api/alltasks';
import { getTaskTimeLogs } from '@/api/time';
import { TimeLog } from '@/types/time-tracker';

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const { activeTimer, fetchActiveTimer, startTimer, pauseTimer, resumeTimer, stopTimer, isLoading, error } = useTimeStore();
  const [task, setTask] = useState<any>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [totalTime, setTotalTime] = useState({ minutes: 0, hours: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (taskId) {
      loadTask();
      loadTimeLogs();
      fetchActiveTimer();
    }
  }, [taskId]);

  useEffect(() => {
    if (activeTimer && activeTimer.task_id === taskId && !activeTimer.is_paused) {
      const interval = setInterval(() => {
        if (activeTimer.current_duration_minutes) {
          setElapsed(activeTimer.current_duration_minutes * 60);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else if (activeTimer?.is_paused) {
      if (activeTimer.current_duration_minutes) {
        setElapsed(activeTimer.current_duration_minutes * 60);
      }
    }
  }, [activeTimer, taskId]);

  const loadTask = async () => {
    try {
      const response = await getTasks(1, 100);
      const foundTask = response.data.data.find((t: any) => t.id === taskId);
      setTask(foundTask);
    } catch (error) {
      console.error('Error loading task:', error);
    }
  };

  const loadTimeLogs = async () => {
    if (!taskId) return;
    try {
      const response = await getTaskTimeLogs(taskId);
      setTimeLogs(response.data.data.time_logs);
      setTotalTime({
        minutes: response.data.data.total_minutes,
        hours: response.data.data.total_hours,
      });
    } catch (error) {
      console.error('Error loading time logs:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStart = async () => {
    if (!taskId) return;
    try {
      await startTimer(taskId, note || undefined);
      setNote('');
      await loadTimeLogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start timer');
    }
  };

  const handlePause = async () => {
    if (!activeTimer) return;
    try {
      await pauseTimer(activeTimer.id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to pause timer');
    }
  };

  const handleResume = async () => {
    if (!activeTimer) return;
    try {
      await resumeTimer(activeTimer.id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to resume timer');
    }
  };

  const handleStop = async () => {
    if (!activeTimer) return;
    if (!confirm('Are you sure you want to stop the timer?')) return;
    try {
      await stopTimer(activeTimer.id);
      setElapsed(0);
      await loadTimeLogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to stop timer');
    }
  };

  const isTaskTimerActive = activeTimer && activeTimer.task_id === taskId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{task?.title || 'Task Detail'}</h1>
        <p className="text-gray-600">Status: <span className="font-semibold">{task?.status}</span></p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Live Timer */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Timer</h2>

        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-bold text-gray-800 mb-4">
            {formatTime(elapsed)}
          </div>

          {isTaskTimerActive && (
            <div className="mb-4">
              {activeTimer.is_paused ? (
                <span className="text-yellow-600 font-semibold">⏸ Paused</span>
              ) : (
                <span className="text-green-600 font-semibold">● Running</span>
              )}
            </div>
          )}

          {!isTaskTimerActive && task?.status === 'in_progress' && (
            <div className="mb-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                rows={2}
              />
            </div>
          )}

          <div className="flex gap-2 justify-center">
            {!isTaskTimerActive ? (
              <button
                onClick={handleStart}
                disabled={isLoading || task?.status !== 'in_progress'}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                ▶ Start
              </button>
            ) : (
              <>
                {activeTimer.is_paused ? (
                  <button
                    onClick={handleResume}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    ▶ Resume
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    disabled={isLoading}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400"
                  >
                    ⏸ Pause
                  </button>
                )}
                <button
                  onClick={handleStop}
                  disabled={isLoading}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400"
                >
                  ⏹ Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Total Time</h3>
        <p className="text-2xl font-bold text-blue-600">{formatDuration(totalTime.minutes)}</p>
        <p className="text-sm text-blue-700">({totalTime.hours.toFixed(2)} hours)</p>
      </div>

      {/* Time Logs List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Time Logs</h2>

        {timeLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No time logs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.start_time).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.start_time).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.end_time ? new Date(log.end_time).toLocaleTimeString() : 'Running'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(log.duration_minutes - log.paused_duration_minutes)}
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
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
