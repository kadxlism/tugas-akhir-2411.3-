import React, { useState, useMemo } from "react";
import { Project } from "./ProjectOverview";

type FilterType = "all" | "day" | "month" | "year";

interface Props {
  projects: Project[];
}

const ProjectCount: React.FC<Props> = ({ projects }) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const now = new Date();

  const filteredProjects = useMemo(() => {
    return Array.isArray(projects) ? projects.filter((p) => {
      const created = new Date(p.created_at ?? Date.now());

      if (filter === "day") {
        return (
          created.getDate() === now.getDate() &&
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }
      if (filter === "month") {
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }
      if (filter === "year") {
        return created.getFullYear() === now.getFullYear();
      }
      return true;
    }) : [];
  }, [projects, filter]);

  const activeCount = filteredProjects.filter((p) =>
    ["active", "in_progress", "ongoing"].includes((p.status || "").toLowerCase())
  ).length;

  const completedCount = filteredProjects.filter((p) =>
    ["completed", "done", "finished"].includes((p.status || "").toLowerCase())
  ).length;

  const overdueCount = filteredProjects.filter((p) =>
    ["overdue", "late", "expired"].includes((p.status || "").toLowerCase())
  ).length;

  return (
    <div className="bg-white shadow-sm rounded-xl p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-lg text-black font-semibold">Project Count</h3>
        <div className="flex flex-wrap gap-2">
          {(["all", "day", "month", "year"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                filter === f
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {f === "all"
                ? "Semua"
                : f === "day"
                ? "Hari ini"
                : f === "month"
                ? "Bulan ini"
                : "Tahun ini"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCount;
