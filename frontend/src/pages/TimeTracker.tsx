import { useState, useEffect } from 'react';
import Timer from '@/components/time-tracker/Timer';
import ManualTimeEntry from '@/components/time-tracker/ManualTimeEntry';
import Timesheet from '@/components/time-tracker/Timesheet';
import TimeLogApproval from '@/components/time-tracker/TimeLogApproval';
import { getTasks } from '@/api/alltasks';
import { getTotalTimePerTask } from '@/api/time-tracker';
import { useAuth } from '@/contexts/useAuth';

export default function TimeTrackerPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'timer' | 'manual' | 'timesheet' | 'approval'>('timer');
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>();
  const [taskTotalTime, setTaskTotalTime] = useState<any>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      loadTaskTotalTime();
    }
  }, [selectedTaskId]);

  const loadTasks = async () => {
    try {
      const response = await getTasks(1, 100);
      // Filter tasks that are in progress (backend uses 'in_progress')
      setTasks(response.data.data.filter((t: any) => t.status === 'in_progress'));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadTaskTotalTime = async () => {
    if (!selectedTaskId) return;
    try {
      const response = await getTotalTimePerTask(selectedTaskId);
      setTaskTotalTime(response.data);
    } catch (error) {
      console.error('Error loading task total time:', error);
    }
  };

  const isAdminOrPM = user?.is_admin || false; // Adjust based on your role system

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Time Tracker</h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 hidden sm:block">Kelola catatan waktu tugas dan aktivitas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('timer')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'timer'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            Timer
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'manual'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('timesheet')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'timesheet'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
          >
            Timesheet
          </button>
          {isAdminOrPM && (
            <button
              onClick={() => setActiveTab('approval')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'approval'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              Approval
            </button>
          )}
        </nav>
      </div>

      {
        activeTab === 'timer' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Select Task</h2>
              <select
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a task (In Progress only)</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} - {task.project?.name || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            {selectedTaskId && taskTotalTime && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Total Time for This Task</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{taskTotalTime.formatted}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ({taskTotalTime.hours} hours, {taskTotalTime.minutes} minutes)
                </p>
              </div>
            )}

            <Timer taskId={selectedTaskId} onTimerUpdate={loadTaskTotalTime} />
          </div>
        )
      }

      {
        activeTab === 'manual' && (
          <ManualTimeEntry onSuccess={() => setActiveTab('timesheet')} />
        )
      }

      {activeTab === 'timesheet' && <Timesheet />}

      {activeTab === 'approval' && isAdminOrPM && <TimeLogApproval />}
    </div>
  );
};

