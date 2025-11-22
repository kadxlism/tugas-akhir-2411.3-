import { useMemo } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useAppData } from "@/contexts/AppDataContext";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import TopQuickActions from "@/components/dashboard/TopQuickActions";
import ProjectOverview, { Project } from "@/components/dashboard/ProjectOverview";
import ProgressProject, { ProjectProgress } from "@/components/dashboard/ProgressProject";
import CompanyFactsChart from "@/components/dashboard/CompanyFactsCharts";
import StatisticsChart from "@/components/dashboard/StatisticsCharts";
import ProjectCount from "@/components/dashboard/ProjectCount";
import TaskStatusCard from "@/components/dashboard/TaskStatusCard";
import ClientStatusCard from "@/components/dashboard/ClientStatusCard";
import TotalDataCard from "@/components/dashboard/TotalDataCard";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Stats {
  clients: number;
  projects: number;
  tasks: number;
}

const Dashboard = () => {
  const { clients, projects, tasks } = useAppData();
  const { user } = useAuth() as any;


  const chartData = useMemo(
    () => ({
      labels: ["Clients", "Projects", "Tasks"],
      datasets: [
        {
          data: [clients.length, projects.length, tasks.length],
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    }),
    [clients, projects, tasks]
  );

  const companyFacts = {
    month: "Jan Feb Mar Apr",
    values: [
      { label: "Company Profil", data: [120, 180, 260, 320], color: "#10b981" },
      { label: "Logo", data: [80, 160, 140, 200], color: "#3b82f6" },
      { label: "San Francisco", data: [60, 140, 220, 300], color: "#f59e0b" },
    ],
  };

  const projectProgress: ProjectProgress[] = projects.slice(0, 3).map((proj, idx) => ({
    id: proj.id,
    name: proj.name ?? `Project ${idx + 1}`,
    progress: Math.floor(Math.random() * 100),
  }));

  // Hitung statistik tugas untuk StatisticsChart
  const taskStats = useMemo(() => {
    let active = 0;
    let completed = 0;
    let overdue = 0;

    tasks.forEach((task) => {
      const today = new Date();
      const dueDate = task.due_date ? new Date(task.due_date) : null;

      if (task.status === "done") {
        completed++;
      } else if (task.status === "todo" || task.status === "in_progress") {
        if (dueDate && dueDate < today) {
          overdue++;
        } else {
          active++;
        }
      }
    });

    return { active, completed, overdue } as any;
  }, [tasks]);

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-white to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard Overview
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 hidden sm:block">Ringkasan lengkap data sistem Anda</p>
              </div>
            </div>
          </div>
          <TopQuickActions />
        </div>

        {/* Grid Utama */}
        {user && (user.role === 'admin' || user.role === 'customer_service') ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6">
              <TotalDataCard />
              <CompanyFactsChart data={companyFacts} />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <TaskStatusCard />
              <StatisticsChart stats={taskStats} />
            </div>

            <div className="space-y-4 sm:space-y-6">
              <ClientStatusCard />
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Project Overview
                  </h3>
                </div>
                <div className="max-w-xs mx-auto">
                  <Doughnut
                    data={chartData}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { usePointStyle: true, padding: 15, font: { size: 11, weight: 500 } }
                        }
                      },
                      cutout: '60%',
                      maintainAspectRatio: true,
                      responsive: true
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Dashboard untuk user biasa: hanya Task Status + Statistik di baris pertama
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <TaskStatusCard />
            <StatisticsChart stats={taskStats} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
