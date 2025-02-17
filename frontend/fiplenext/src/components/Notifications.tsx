import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface NotificationData {
    id: number;
    title: string;
    message: string;
    created_at: string;
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get<NotificationData[]>('http://13.216.135.244:8000/api/notifications/');
                setNotifications(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setError('お知らせの取得に失敗しました');
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diff / (1000 * 60));
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `${diffDays}日前`;
        } else if (diffHours > 0) {
            return `${diffHours}時間前`;
        } else {
            return `${diffMinutes}分前`;
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
            <h2 className="text-3xl font-bold mb-6">お知らせ</h2>
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
            <Link href="/notifications" legacyBehavior>
                <a className="text-blue-500 underline">トップに戻る</a>
            </Link>
        </div>
    );
};

export default Notifications;