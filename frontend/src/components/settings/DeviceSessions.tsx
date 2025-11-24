import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNotification } from '@/contexts/NotificationContext';

interface Session {
    id: string;
    ip_address: string;
    user_agent: string;
    is_current_device: boolean;
    last_used_at: string;
    created_at: string;
}

const DeviceSessions = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(5);
    const { addNotification } = useNotification();

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/devices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevoke = async (id: string) => {
        try {
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/user/devices/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addNotification('Session revoked successfully');
            fetchSessions();
        } catch (error) {
            addNotification('Failed to revoke session');
        }
    };

    const parseUserAgent = (ua: string) => {
        let browser = 'Unknown Browser';
        let os = 'Unknown OS';
        let device = '';

        // Detect Browser
        if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
        else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
        else if (ua.includes('Trident')) browser = 'Internet Explorer';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Safari')) browser = 'Safari';

        // Detect OS
        if (ua.includes('Win')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('like Mac')) os = 'iOS';

        // Detect Mobile Device Model (Basic)
        if (ua.includes('Android')) {
            const match = ua.match(/Android\s([0-9.]+);.*;\s([a-zA-Z0-9\s]+)\sBuild/);
            if (match && match[2]) {
                device = match[2]; // e.g., "SM-G991B"
            } else {
                device = 'Android Device';
            }
        } else if (ua.includes('iPhone')) {
            device = 'iPhone';
        } else if (ua.includes('iPad')) {
            device = 'iPad';
        }

        return { browser, os, device };
    };

    const getDeviceIcon = (ua: string) => {
        if (ua.toLowerCase().includes('mobile') || ua.toLowerCase().includes('android') || ua.toLowerCase().includes('iphone')) {
            return (
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        }
        return (
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        );
    };

    if (loading) return <div>Loading sessions...</div>;

    const visibleSessions = sessions.slice(0, visibleCount);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Sessions</h3>
            <div className="space-y-4">
                {visibleSessions.map((session) => {
                    const { browser, os, device } = parseUserAgent(session.user_agent || '');
                    const deviceName = device ? `${device} (${os})` : `${os} - ${browser}`;

                    return (
                        <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-4">
                            <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-shrink-0">
                                    {getDeviceIcon(session.user_agent || '')}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {deviceName}
                                        </p>
                                        {session.is_current_device && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full flex-shrink-0">
                                                Current Device
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-full sm:max-w-md">
                                        {session.ip_address || 'Unknown IP'} • {browser}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Last active: {new Date(session.last_used_at || session.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {!session.is_current_device && (
                                <button
                                    onClick={() => handleRevoke(session.id)}
                                    className="w-full sm:w-auto px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-900/30 sm:border-transparent text-center"
                                >
                                    Revoke
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {sessions.length > visibleCount && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setVisibleCount(prev => prev + 5)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeviceSessions;
