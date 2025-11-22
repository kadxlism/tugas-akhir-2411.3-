import { FC } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

type FactData = {
  month: string; // "Jan", "Feb", dll.
  values: { label: string; data: number[]; color: string }[];
};

const CompanyFactsChart: FC<{ data: FactData }> = ({ data }) => {
  const chartData = {
    labels: data.month.split(" "), // kalau kamu kirim "Jan Feb Mar Apr"
    datasets: data.values.map((v) => ({
      label: v.label,
      data: v.data,
      borderColor: v.color,
      backgroundColor: `${v.color}33`, // versi transparan
      fill: true,
      tension: 0.3,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { usePointStyle: true, padding: 15, font: { size: 11, weight: 500 } }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 200,
        },
      },
    },
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Company Facts
        </h3>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CompanyFactsChart;
