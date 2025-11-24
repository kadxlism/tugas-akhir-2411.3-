import { useLanguage } from "@/contexts/LanguageContext";

const Unauthorized = () => {
  const { t } = useLanguage();
  return (
    <div className="text-center mt-8 text-red-500 text-lg font-semibold">
      {t('common.unauthorized')}
    </div>
  );
};

export default Unauthorized;
