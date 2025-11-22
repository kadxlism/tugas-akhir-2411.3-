import { FC } from "react";

export type ProjectProgress = {
  id: number | string;
  name: string;
  progress: number; // 0–100
};

const ProgressBar: FC<{ value: number; color: string }> = ({ value, color }) => (
  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div
      className={`${color} h-3 rounded-full transition-all duration-500`}
      style={{ width: `${value}%` }}
    />
  </div>
);

const ProgressProject: FC<{ projects: ProjectProgress[] }> = ({ projects }) => {
  return (
    <div className="bg-white shadow-sm rounded-xl p-6">
      <h3 className="text-base text-black font-semibold mb-4">Progress Project</h3>
      <div className="space-y-4">
        {projects.map((p, idx) => (
          <div key={p.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{p.name}</span>
              <span className="text-gray-500">{p.progress}%</span>
            </div>
            <ProgressBar
              value={p.progress}
              color={
                idx % 3 === 0
                  ? "bg-green-500"
                  : idx % 3 === 1
                  ? "bg-blue-500"
                  : "bg-red-500"
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressProject;
