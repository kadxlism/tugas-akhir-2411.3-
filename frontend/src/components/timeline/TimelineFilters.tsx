import { useState, useEffect } from 'react';
import { TimeLogFilters } from '@/types/time-tracker';
import { getUsers } from '@/api/users';
import { getProjects } from '@/api/projectApi';
import axios from '@/services/axios';
import { useLanguage } from '@/contexts/LanguageContext';

interface TimelineFiltersProps {
  filters: TimeLogFilters;
  onFiltersChange: (filters: TimeLogFilters) => void;
  onClearFilters: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Project {
  id: number;
  name: string;
}

const TimelineFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: TimelineFiltersProps) => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    loadUsers();
    loadProjects();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get('/admin/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await getProjects();
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleFilterChange = (key: keyof TimeLogFilters, value: any) => {
    // Convert string numbers to numbers for user_id and project_id
    let processedValue = value;
    if ((key === 'user_id' || key === 'project_id') && value) {
      processedValue = Number(value);
    }

    onFiltersChange({
      ...filters,
      [key]: processedValue || undefined,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('timesheet.filters')}</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('timeline.filterOptional')}
          </p>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        >
          {t('common.clear')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
            {t('users.user')}
          </label>
          <select
            value={filters.user_id || ''}
            onChange={(e) => handleFilterChange('user_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            disabled={loadingUsers}
          >
            <option value="">{t('timeline.allUsers')}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
            {t('tasks.project')}
          </label>
          <select
            value={filters.project_id || ''}
            onChange={(e) => handleFilterChange('project_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            disabled={loadingProjects}
          >
            <option value="">{t('timeline.allProjects')}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
            {t('timeline.statusApproval')}
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          >
            <option value="">{t('timeline.allStatus')}</option>
            <option value="pending">{t('timeline.statusPendingDesc')}</option>
            <option value="approved">{t('timeline.statusApprovedDesc')}</option>
            <option value="rejected">{t('timeline.statusRejectedDesc')}</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('timeline.statusApprovalDesc')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
            {t('dashboard.taskStatus')}
          </label>
          <select
            value={filters.task_status || ''}
            onChange={(e) => handleFilterChange('task_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          >
            <option value="">{t('timeline.allStatus')}</option>
            <option value="todo">{t('tasks.todo')}</option>
            <option value="in_progress">{t('dashboard.inProgress')}</option>
            <option value="review">{t('timeline.review')}</option>
            <option value="done">{t('dashboard.completed')}</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('timeline.taskStatusDesc')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
            {t('timeline.startDate')}
          </label>
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">
            {t('timeline.endDate')}
          </label>
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineFilters;
