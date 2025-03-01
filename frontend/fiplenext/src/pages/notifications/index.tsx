import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
// import Notification from '../../components/Notifications';

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
                const response = await axios.get<NotificationData[]>('http://34.230.156.248:8000/api/notifications/');
                setNotifications(response.data);
                setLoading(false);
            } catch (err) {
                console.log(err);
                setError('お知らせの取得に失敗しました');
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) {
        return <div>読み込み中...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-white text-black">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">お知らせ一覧</h2>
        {notifications.length === 0 ? (
            <p className="text-gray-600">お知らせがありません</p>
        ) : (
            <ul>
                {notifications.map((notification) => (
                    <li key={notification.id} className="mb-4 border-b pb-2">
                        <Link href={`/notifications/${notification.id}`} legacyBehavior>
                            <a className="text-black no-underline hover:underline">{notification.title}</a>
                        </Link>
                        <small className="text-gray-500">{formatTimeAgo(notification.created_at)}</small>
                    </li>
                ))}
            </ul>
        )}
        <Link href="/" legacyBehavior>
            <a className="text-black no-underline hover:underline">トップに戻る</a>
        </Link>
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

export default NotificationsPage;