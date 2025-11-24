import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth() as any;
  const { t } = useLanguage();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // Load profile photo on mount and when user changes
  useEffect(() => {
    const loadProfilePhoto = () => {
      if (!user) {
        setProfilePhoto(null);
        return;
      }

      // Try to get user ID from different possible fields
      const userId = user.id || (user as any).user_id || (user as any)._id || String(user.email) || 'default';

      if (userId) {
        const storageKey = `profile_photo_${userId}`;
        const storedPhoto = localStorage.getItem(storageKey);

        if (storedPhoto) {
          setProfilePhoto(storedPhoto);
        } else {
          setProfilePhoto(null);
        }
      } else {
        setProfilePhoto(null);
      }
    };

    loadProfilePhoto();

    // Listen for profile photo updates from Settings page
    const handleProfilePhotoUpdate = (event: CustomEvent) => {
      const { userId, photo } = event.detail;
      // Check if the update is for the current user
      const currentUserId = user?.id || (user as any)?.user_id || (user as any)?._id || String(user?.email) || 'default';

      if (String(userId) === String(currentUserId)) {
        setProfilePhoto(photo);
      }
    };

    window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdate as EventListener);

    return () => {
      window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdate as EventListener);
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <>
      {/* ... (keep mobile menu button and overlay) */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-blue-600 dark:bg-gray-800 text-white rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 w-72 h-screen transition-all duration-300 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } bg-gradient-to-b from-blue-900 via-blue-700 to-blue-900 shadow-2xl border-r border-white/10`}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-white">{t('sidebar.projectManager')}</h2>
                <p className="text-xs text-gray-400 hidden lg:block">{t('sidebar.managementSystem')}</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
          <Link
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="group flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200 hover:bg-white/10 hover:scale-105"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-white to-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            </div>
            <span className="text-sm lg:text-base text-white font-medium group-hover:text-yellow-300 transition-colors">{t('sidebar.dashboard')}</span>
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/clients"
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200 hover:bg-white/10 hover:scale-105"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-white to-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm lg:text-base text-white font-medium group-hover:text-yellow-300 transition-colors">{t('sidebar.clients')}</span>
            </Link>
          )}

          <Link
            to="/tasks"
            onClick={() => setIsMobileMenuOpen(false)}
            className="group flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200 hover:bg-white/10 hover:scale-105"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-white to-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-sm lg:text-base text-white font-medium group-hover:text-yellow-300 transition-colors">{t('sidebar.tasks')}</span>
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/timeline"
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200 hover:bg-white/10 hover:scale-105"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-white to-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm lg:text-base text-white font-medium group-hover:text-yellow-300 transition-colors">{t('sidebar.timeline')}</span>
            </Link>
          )}

          {/* Pengguna - hanya untuk admin */}
          {user?.role === 'admin' && (
            <Link
              to="/users"
              onClick={() => setIsMobileMenuOpen(false)}
              className="group flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200 hover:bg-white/10 hover:scale-105"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-white to-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm lg:text-base text-white font-medium group-hover:text-yellow-300 transition-colors">{t('sidebar.users')}</span>
              </div>
            </Link>
          )}

          <Link
            to="/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className="group flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200 hover:bg-white/10 hover:scale-105"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-white to-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm lg:text-base text-white font-medium group-hover:text-yellow-300 transition-colors">{t('sidebar.settings')}</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-4 border-t border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center space-x-2 lg:space-x-3 px-2 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-white/20 flex items-center justify-center flex-shrink-0">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-medium text-white truncate">{user?.name || t('users.roleUser')}</p>
              <p className="text-[10px] lg:text-xs text-gray-400 truncate">{user?.role === 'admin' ? t('users.administrator') : user?.role === 'customer_service' ? t('users.customerService') : t('users.roleUser')}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-[10px] lg:text-xs font-semibold text-red-100 bg-red-500/20 border border-red-500/40 px-2 py-0.5 rounded-full">
                {t('auth.logout')}
              </span>
            </div>
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] max-w-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('auth.logout')}?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('auth.logoutConfirm')}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('common.confirm')}
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
