import { useState, useEffect, useCallback } from 'react';
import { startTimer, pauseTimer, resumeTimer, stopTimer, getActiveTimer } from '@/api/time-tracker';
import { ActiveTimer } from '@/types/time-tracker';
import { getTasks } from '@/api/alltasks';

interface TimerProps {
  taskId?: number;
  onTimerUpdate?: () => void;
}

export default function Timer({ taskId, onTimerUpdate }: TimerProps) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [task, setTask] = useState<any>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const fetchActiveTimer = useCallback(async () => {
    try {
      const response = await getActiveTimer();
      if (response.data) {
        setActiveTimer(response.data);
        if (response.data.current_duration) {
          setElapsed(response.data.current_duration);
        }
      } else {
        setActiveTimer(null);
        setElapsed(0);
      }
    } catch (error) {
      console.error('Error fetching active timer:', error);
    }
  }, []);

  useEffect(() => {
    fetchActiveTimer();
    const interval = setInterval(fetchActiveTimer, 1000);
    return () => clearInterval(interval);
  }, [fetchActiveTimer]);

  useEffect(() => {
    if (activeTimer && !activeTimer.is_paused) {
      const interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  useEffect(() => {
    if (taskId) {
      // Fetch task details to check status
      getTasks(1, 100).then((response) => {
        const foundTask = response.data.data.find((t: any) => t.id === taskId);
        setTask(foundTask);
      });
    }
  }, [taskId]);

  const handleStart = async () => {
    if (!taskId) {
      alert('Please select a task first');
      return;
    }

    if (task?.status !== 'in_progress') {
      alert('Timer can only be started for tasks with status "In Progress"');
      return;
    }

    setIsLoading(true);
    try {
      await startTimer(taskId);
      await fetchActiveTimer();
      onTimerUpdate?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start timer');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    if (!activeTimer) return;
    setIsLoading(true);
    try {
      await pauseTimer(activeTimer.id);
      await fetchActiveTimer();
      onTimerUpdate?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to pause timer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    if (!activeTimer) return;
    setIsLoading(true);
    try {
      await resumeTimer(activeTimer.id);
      await fetchActiveTimer();
      onTimerUpdate?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to resume timer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (!activeTimer) return;
    if (!confirm('Are you sure you want to stop the timer?')) return;

    setIsLoading(true);
    try {
      await stopTimer(activeTimer.id);
      setActiveTimer(null);
      setElapsed(0);
      onTimerUpdate?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to stop timer');
    } finally {
      setIsLoading(false);
    }
  };

  if (activeTimer && activeTimer.task_id !== taskId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          You have an active timer for another task. Please stop it first.
        </p>
        <button
          onClick={handleStop}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop Active Timer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center">
        <div className="text-4xl font-mono font-bold text-gray-800 mb-4">
          {formatTime(elapsed)}
        </div>

        {activeTimer && (
          <div className="mb-4 text-sm text-gray-600">
            <p>Task: {activeTimer.task?.title || 'N/A'}</p>
            <p>Project: {activeTimer.project?.name || 'N/A'}</p>
            {activeTimer.is_paused && (
              <p className="text-yellow-600 font-semibold">⏸ Paused</p>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {!activeTimer ? (
            <button
              onClick={handleStart}
              disabled={isLoading || !taskId}
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
  );
}

