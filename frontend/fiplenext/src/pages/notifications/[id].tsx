import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link'; // Linkコンポーネントをインポート

interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: string;
}

const NotificationDetail: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [notification, setNotification] = useState<Notification | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const fetchNotification = async () => {
                try {
                    const response = await axios.get<Notification>(`http://54.221.185.90:8000/notifications/${id}/`);
                    setNotification(response.data);
                } catch (err) {
                    if (axios.isAxiosError(err) && err.response) {
                        setError(`お知らせの取得に失敗しました: ${err.response.data.message}`);
                    } else {
                        setError(`お知らせの取得に失敗しました: ${(err as Error).message}`);
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchNotification();
        }
    }, [id]);

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

    if (!notification) {
        return <div>お知らせが見つかりません</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-white text-black">
        <h1 className="text-2xl font-bold mb-6 border-b pb-2">{notification.title}</h1>
        <p className="mb-4">{notification.message}</p>
        <small className="text-gray-500">{formatTimeAgo(notification.created_at)}</small>
        <br />
        <Link href="/notifications" className="text-black no-underline hover:underline">お知らせ一覧に戻る</Link>
    </div>
    );
};

export default NotificationDetail;