import { useRoutes } from "react-router-dom";
import routes from "./routes";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./contexts/useAuth";
import { AppDataProvider } from "./contexts/AppDataContext";
import { NotificationProvider, useNotification } from "./contexts/NotificationContext"; // ✅ import notif
import { LanguageProvider } from "./contexts/LanguageContext";
import { useTheme } from "./contexts/ThemeContext";
import { ToastContainer } from "./components/Toast";
import React from "react";


const AppContent = () => {
  const { user } = useAuth();
  const { toasts, removeToast } = useNotification();
  const element = useRoutes(routes);

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {user && <Sidebar />}
        <div className={`flex-1 w-full ${user ? 'lg:ml-72' : ''} p-2 sm:p-4 lg:p-6 mt-12 lg:mt-0 overflow-x-hidden`}>{element}</div>
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
};

const App = () => {
  const { user, loading } = useAuth();
  const { theme } = useTheme(); // Force re-render on theme change

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <LanguageProvider>
      <NotificationProvider> {/* ✅ bungkus di sini */}
        <AppDataProvider>
          <AppContent />
        </AppDataProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
};

export default App;
