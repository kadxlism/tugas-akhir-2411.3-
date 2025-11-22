// src/components/dashboard/ProjectOverview.tsx

// ✅ Export type Project
export type Project = {
  created_at: number;
  id: number;
  name: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  startDate?: string;
  endDate?: string;
};

// ✅ Komponen ProjectOverview (bisa kamu kembangkan sesuai kebutuhan)
const ProjectOverview = () => {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="text-lg text-black font-semibold">Project Overview</h2>
      <p className="text-sm text-gray-500">
        Ringkasan progress dan detail proyek akan ditampilkan di sini.
      </p>
    </div>
  );
};

export default ProjectOverview;
