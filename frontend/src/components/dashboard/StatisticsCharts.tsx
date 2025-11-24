import { FC } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useLanguage } from "@/contexts/LanguageContext";

ChartJS.register(ArcElement, Tooltip, Legend);

type ProjectStats = {
  completed: number;
  active: number;
  ended: number;
};

const StatisticsChart: FC<{ stats: ProjectStats }> = ({ stats }) => {
  const { t } = useLanguage();

  const data = {
    labels: [t('dashboard.completed'), t('dashboard.active'), t('dashboard.ended')],
    datasets: [
      {
        data: [stats.completed, stats.active, stats.ended],
        backgroundColor: ["#10b981", "#3b82f6", "#ef4444"], // hijau, biru, merah
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.statistics')}
        </h3>
      </div>
      <div className="max-w-xs mx-auto">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default StatisticsChart;
