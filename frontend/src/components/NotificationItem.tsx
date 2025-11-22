import React from 'react';

interface NotificationItemProps {
  id: number;
  message: string;
  read: boolean;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ id, message, read, onClick }) => {
  return (
    <li
      key={id}
      onClick={onClick}
      className={`p-3 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
        read
          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
          : "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-400 dark:border-green-500 font-medium hover:bg-green-100 dark:hover:bg-green-900/40 shadow-sm"
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
          read ? "bg-green-400 dark:bg-green-500" : "bg-green-500 dark:bg-green-400"
        }`} />
        <div className="flex-1 min-w-0">
          <span className="block break-words">{message}</span>
          {!read && (
            <div className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
              Baru
            </div>
          )}
        </div>
        {!read && (
          <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full flex-shrink-0 mt-2 animate-pulse" />
        )}
      </div>
    </li>
  );
};

export default NotificationItem;