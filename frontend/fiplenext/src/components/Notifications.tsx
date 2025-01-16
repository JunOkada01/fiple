import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: string;
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get<Notification[]>('http://localhost:8000/notifications/');
                setNotifications(response.data);
            } catch (err) {
                setError('お知らせの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        const secondsInMinute = 60;
        const secondsInHour = 60 * secondsInMinute;
        const secondsInDay = 24 * secondsInHour;

        if (diffInSeconds < secondsInHour) {
            const minutes = Math.floor(diffInSeconds / secondsInMinute);
            return `${minutes}分前`;
        } else if (diffInSeconds < secondsInDay) {
            const hours = Math.floor(diffInSeconds / secondsInHour);
            return `${hours}時間前`;
        } else {
            const days = Math.floor(diffInSeconds / secondsInDay);
            return `${days}日前`;
        }
    };

    if (loading) {
        return <div>読み込み中...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">お知らせ一覧</h1>
            {notifications.length === 0 ? (
                <p className="text-gray-600">お知らせがありません</p>
            ) : (
                <ul>
                    {notifications.map((notification) => (
                        <li key={notification.id} className="mb-4">
                            <Link href={`/notifications/${notification.id}`} legacyBehavior>
                                <a className="text-blue-500 underline">{notification.title}</a>
                            </Link>
                            <small>{formatTimeAgo(notification.created_at)}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Notifications;