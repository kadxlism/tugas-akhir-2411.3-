import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="text-lg text-black font-semibold">{t('dashboard.projectOverview')}</h2>
      <p className="text-sm text-gray-500">
        {t('dashboard.projectOverviewDesc')}
      </p>
    </div>
  );
};

export default ProjectOverview;
