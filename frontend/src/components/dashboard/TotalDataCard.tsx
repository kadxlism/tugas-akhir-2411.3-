import React, { useState, useMemo, useEffect } from "react";
import { getDashboardStatistics, DashboardStatistics } from "@/api/dashboard";
import { useLanguage } from "@/contexts/LanguageContext";

type FilterType = "all" | "day" | "month" | "year";

const TotalDataCard: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardStatistics(filter);
        if (isMounted && response.data) {
          setStatistics(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching dashboard statistics:', error);
        if (isMounted) {
          setError(error.message || 'Failed to fetch statistics');
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

  const filteredData = useMemo(() => {
    // Always use API statistics if available
    if (statistics?.total_data) {
      return {
        clients: statistics.total_data.clients ?? 0,
        projects: statistics.total_data.projects ?? 0,
        tasks: statistics.total_data.tasks ?? 0
      };
    }

    // Only show 0 if API hasn't loaded yet (not using localStorage as it may be stale)
    return {
      clients: 0,
      projects: 0,
      tasks: 0
    };
  }, [statistics, filter]);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.totalData')}</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('dashboard.totalDataDesc')}</p>
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
        <div className="group flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-blue-100 dark:border-gray-600 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{t('dashboard.clients')}</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {filteredData.clients}
          </span>
        </div>
        <div className="group flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-emerald-100 dark:border-gray-600 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{t('dashboard.projects')}</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            {filteredData.projects}
          </span>
        </div>
        <div className="group flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-amber-100 dark:border-gray-600 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{t('dashboard.tasks')}</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-yellow-600 dark:bg-yellow-400 bg-clip-text text-transparent">
            {filteredData.tasks}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TotalDataCard;
