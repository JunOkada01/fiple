import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface NotificationData {
    id: number;
    title: string;
    message: string;
    created_at: string;
}

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get<NotificationData[]>('http://localhost:8000/api/notifications/');
                setNotifications(response.data);
            } catch (err) {
                setError('お知らせの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) {
        return <div className="text-center py-10 text-gray-600">読み込み中...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-8 mt-5">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">News</h2>
            {notifications.length === 0 ? (
                <p className="text-gray-600">お知らせがありません</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((notification) => (
                        <li>
                            <p className="text-xs text-gray-500 mx-2 my-2 ">{formatDate(notification.created_at)}</p>
                            <Link href={`/notifications/${notification.id}`}>
                                <li key={notification.id} className="p-4 border rounded-lg shadow-sm hover:bg-gray-100 transition">
                                    <span className="block text-lg font-semibold text-gray-900">{notification.title}</span>
                                    <p className="text-xs mt-3 text-gray-500">{formatTimeAgo(notification.created_at)}</p>
                                </li>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-6 text-center">
                <Link href="/">
                    <span className="text-gray-600 hover:underline">トップに戻る</span>
                </Link>
            </div>
        </div>
    );
};

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

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
};

export default NotificationsPage;
