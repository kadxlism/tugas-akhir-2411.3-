import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

interface LiveTimerProps {
    startTime: string;
    initialDuration: number;
    className?: string;
}

export const LiveTimer = ({ startTime, initialDuration, className }: LiveTimerProps) => {
    const [duration, setDuration] = useState(initialDuration);

    useEffect(() => {
        // Calculate initial elapsed time based on start time
        const start = dayjs(startTime);
        const now = dayjs();
        const elapsedMinutes = now.diff(start, 'minute');

        // If the backend initialDuration is 0 (newly started), we should use the calculated elapsed time.
        // If the backend initialDuration > 0, it implies previous sessions + current session.
        // However, the backend logic I wrote calculates total duration including the current running session up to the request time.
        // So initialDuration is accurate at the time of fetch.
        // We just need to increment from there.

        // But to be more robust against drift or stale data, we could recalculate:
        // currentDuration = initialDuration + (now - fetchTime)
        // We don't have fetchTime.

        // Let's stick to the simple ticker for now, but maybe force an immediate update?
        // If I just started the timer, initialDuration might be 0.
        // But if I started it 5 mins ago, initialDuration is 5.

        // Let's just set the state to initialDuration and tick.
        setDuration(initialDuration);

        const interval = setInterval(() => {
            setDuration(d => d + 1);
        }, 60000);

        return () => clearInterval(interval);
    }, [initialDuration, startTime]);

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse ${className || ''}`}>
            {formatDuration(duration)}
        </span>
    );
};
