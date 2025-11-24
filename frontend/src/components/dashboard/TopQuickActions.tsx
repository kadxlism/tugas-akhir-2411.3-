import React, { FC, useState, useRef, useEffect } from "react";
import { JSX } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import NotificationItem from "@/components/NotificationItem";
import { useLanguage } from "@/contexts/LanguageContext";

const ActionCard = React.forwardRef<HTMLButtonElement, {
  title: string;
  icon: JSX.Element;
  onClick?: () => void;
  badgeCount?: number;
}>(({ title, icon, onClick, badgeCount }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className="relative bg-white dark:bg-gray-800 w-full sm:w-auto shadow-sm rounded-xl p-5 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md transition flex items-center gap-3 text-left"
  >
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 relative">
      {icon}
      {badgeCount && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {badgeCount}
        </span>
      )}
    </span>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
  </button>
));

interface TopQuickActionsProps {
  onCreateProject?: () => void;
}

const TopQuickActions: FC<TopQuickActionsProps> = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // hitung notifikasi unread
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleClick = (n: any) => {
    // ✅ tandai notif sudah dibaca
    markAsRead(n.id);

    // ✅ tutup dropdown
    setOpen(false);

    // Note: Removed automatic navigation to prevent page refresh
    // which causes notifications to re-appear
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 relative w-full sm:w-auto">
      {/* Tombol Notification */}
      <div className="relative">
        <ActionCard
          ref={buttonRef}
          title={t('common.notifications')}
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-700 dark:fill-gray-300">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2Z" />
            </svg>
          }
          badgeCount={unreadCount}
          onClick={() => setOpen(!open)}
        />

        {/* Dropdown daftar notifikasi - tanpa backdrop, hanya popup biasa */}
        {open && (
          <div
            ref={dropdownRef}
            className="absolute z-50 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl space-y-2 max-h-[70vh] overflow-y-auto p-4 border border-gray-200 dark:border-gray-700 top-full left-0 mt-2 w-full sm:w-80 sm:top-0 sm:left-auto sm:right-full sm:mt-0 sm:mr-3"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{t('common.notifications')}</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllAsRead();
                    }}
                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                    aria-label="Tandai semua sudah dibaca"
                  >
                    {t('notifications.readAll')}
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Tutup notifikasi"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('notifications.noNotifications')}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {[...notifications].reverse().map((n) => (
                  <NotificationItem
                    key={n.id}
                    id={n.id}
                    message={n.message}
                    read={n.read}
                    onClick={() => handleClick(n)}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopQuickActions;
