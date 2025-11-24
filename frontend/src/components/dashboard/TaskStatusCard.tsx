import React, { useState, useMemo, useEffect } from "react";
import { getDashboardStatistics, DashboardStatistics } from "@/api/dashboard";
import { useLanguage } from "@/contexts/LanguageContext";

type FilterType = "all" | "day" | "month" | "year";

const TaskStatusCard: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStatistics(filter);
        if (isMounted && response.data) {
          setStatistics(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        if (isMounted) {
          // Reset statistics to force showing 0 instead of stale data
          setStatistics(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => {
      isMounted = false;
    };
  }, [filter]);

  const { activeCount, completedCount, overdueCount } = useMemo(() => {
    // Always use API statistics if available
    if (statistics?.task_status) {
      return {
        activeCount: statistics.task_status.active ?? 0,
        completedCount: statistics.task_status.completed ?? 0,
        overdueCount: statistics.task_status.overdue ?? 0
      };
    }

    // Only show 0 if API hasn't loaded yet (not using localStorage as it may be stale)
    return { activeCount: 0, completedCount: 0, overdueCount: 0 };
  }, [statistics, filter]);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.taskStatus')}</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('dashboard.taskStatusDesc')}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-2">
          {(["all", "day", "month", "year"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-xl transition-all duration-200 ${filter === f
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
            >
              {f === "all"
                ? t('common.all')
                : f === "day"
                  ? t('common.today')
                  : f === "month"
                    ? t('common.thisMonth')
                    : t('common.thisYear')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="group flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-blue-100 dark:border-gray-600 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{t('dashboard.active')}</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-blue-600 bg-clip-text text-transparent">
            {activeCount}
          </span>
        </div>
        <div className="group flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-emerald-100 dark:border-gray-600 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{t('dashboard.completed')}</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-green-600 bg-clip-text text-transparent">
            {completedCount}
          </span>
        </div>
        <div className="group flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-red-100 dark:border-gray-600 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{t('dashboard.overdue')}</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-red-600 bg-clip-text text-transparent">
            {overdueCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskStatusCard;
