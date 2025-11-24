import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ToastProps {
    message: string;
    onClose: () => void;
    onClick?: () => void;
    duration?: number;
}

export const Toast = ({ message, onClose, onClick, duration = 4000 }: ToastProps) => {
    const { t } = useLanguage();
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300);
    };

    const handleClick = () => {
        if (onClick) {
            // Close the toast first
            handleClose();
            // Then execute the onClick action after a short delay
            setTimeout(() => {
                onClick();
            }, 100);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
        p-4 mb-3 min-w-[300px] max-w-[400px]
        transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:shadow-3xl' : ''}
      `}
            style={{
                animation: isExiting ? 'none' : 'slideInRight 0.3s ease-out'
            }}
        >
            <div className="flex items-start gap-3">
                {/* Notification Icon */}
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {t('notifications.newNotification')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {message}
                    </p>
                    {onClick && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {t('notifications.clickToView')}
                        </p>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                    style={{
                        animation: `shrink ${duration}ms linear`,
                        transformOrigin: 'left'
                    }}
                />
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Array<{
        id: number;
        message: string;
        onClick?: () => void;
    }>;
    onRemoveToast: (id: number) => void;
}

export const ToastContainer = ({ toasts, onRemoveToast }: ToastContainerProps) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
            <div className="pointer-events-auto space-y-3">
                {toasts.slice(-3).map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        onClick={toast.onClick}
                        onClose={() => onRemoveToast(toast.id)}
                    />
                ))}
            </div>

            <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(calc(100% + 1rem));
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
        </div>
    );
};
