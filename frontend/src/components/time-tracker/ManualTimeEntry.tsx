import { useState, useEffect } from 'react';
import { createManualTimeEntry } from '@/api/time-tracker';
import { getTasks } from '@/api/alltasks';

interface ManualTimeEntryProps {
  onSuccess?: () => void;
}

export default function ManualTimeEntry({ onSuccess }: ManualTimeEntryProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    task_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    calculateDuration();
  }, [formData.start_time, formData.end_time]);

  const loadTasks = async () => {
    try {
      const response = await getTasks(1, 100);
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`${formData.date}T${formData.start_time}`);
      const end = new Date(`${formData.date}T${formData.end_time}`);
      if (end > start) {
        const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
        setDuration(diff);
      } else {
        setDuration(0);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createManualTimeEntry({
        task_id: parseInt(formData.task_id),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        duration: duration,
        notes: formData.notes || undefined,
      });

      alert('Time entry created successfully!');
      setFormData({
        task_id: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        notes: '',
      });
      setDuration(0);
      onSuccess?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create time entry');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Manual Time Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task *
          </label>
          <select
            required
            value={formData.task_id}
            onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title} ({task.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="time"
              required
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Duration:</strong> {formatDuration(duration)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes about this time entry..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.task_id || duration <= 0}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Time Entry'}
        </button>
      </form>
    </div>
  );
}

