// contexts/NotificationContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/useAuth";

type Notification = {
  id: number;
  message: string;
  read: boolean;
  path?: string;
};

type ToastNotification = {
  id: number;
  message: string;
  onClick?: () => void;
};

type NotificationContextType = {
  notifications: Notification[];
  toasts: ToastNotification[];
  addNotification: (message: string, path?: string) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeToast: (id: number) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used inside NotificationProvider");
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const getStorageKey = () => (user ? `notifications_user_${user.id}` : 'notifications');

  // Load persisted notifications saat user berubah / pertama kali
  useEffect(() => {
    try {
      const raw = localStorage.getItem(getStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw) as Notification[];

        // Bersihkan notifikasi yang lebih dari 7 hari
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentNotifications = parsed.filter(n => n.id > sevenDaysAgo);

        // Batasi maksimal 50 notifikasi per user
        const limitedNotifications = recentNotifications.slice(-50);

        setNotifications(limitedNotifications);
      } else {
        setNotifications([]);
      }
    } catch {
      setNotifications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const addNotification = (message: string, path?: string) => {
    setNotifications((prev) => {
      // Cek apakah notifikasi dengan pesan yang sama sudah ada dalam 5 menit terakhir
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      const recentNotifications = prev.filter(n => n.id > fiveMinutesAgo);

      // Cek duplikasi berdasarkan message dan path
      const isDuplicate = recentNotifications.some(n =>
        n.message === message && n.path === path
      );

      if (isDuplicate) {
        return prev; // Jangan tambahkan notifikasi duplikat
      }

      // Generate unique ID dengan random component untuk menghindari collision
      const uniqueId = Date.now() + Math.random();
      const newNotif = { id: uniqueId, message, read: false, path };

      // Show toast for new notification (without onClick to prevent page reload)
      setToasts((prevToasts) => [
        ...prevToasts,
        {
          id: uniqueId,
          message,
          // Removed onClick to prevent page reload that triggers notifications again
        }
      ]);

      return [...prev, newNotif];
    });
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  // Persist notifications setiap berubah
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(notifications));
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, user?.id]);

  // Bersihkan notifikasi lama setiap 1 jam
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setNotifications((prev) => {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentNotifications = prev.filter(n => n.id > sevenDaysAgo);

        // Batasi maksimal 50 notifikasi per user
        const limitedNotifications = recentNotifications.slice(-50);

        return limitedNotifications;
      });
    }, 60 * 60 * 1000); // 1 jam

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, toasts, addNotification, markAsRead, markAllAsRead, removeToast }}>
      {children}
    </NotificationContext.Provider>
  );
};
