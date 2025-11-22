import axios from '@/services/axios';

export interface DashboardStatistics {
  total_data: {
    clients: number;
    projects: number;
    tasks: number;
  };
  task_status: {
    active: number;
    completed: number;
    overdue: number;
  };
  client_status: {
    paid: number;
    pending: number;
    overdue: number;
  };
  filter: string;
}

export const getDashboardStatistics = (filter: 'all' | 'day' | 'month' | 'year' = 'all') => 
  axios.get<DashboardStatistics>(`/dashboard/statistics?filter=${filter}`);



