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
                    const response = await axios.get<Notification>(`http://localhost:8000/notifications/${id}/`);
                    setNotification(response.data);
                } catch (err) {
                    setError(`お知らせの取得に失敗しました: ${(err as any).message}`);
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
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
        <div className="max-w-xl mx-auto px-4 py-8 mt-5">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">News</h2>
            <p className="mb-4 text-xs text-gray-500">{formatDate(notification.created_at)}</p>
            <div className=''>
                <p className='mb-4 font-semibold text-gray-800'>{notification.title}</p>
                <p className="mb-4 text-gray-800">{notification.message}</p>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{formatTimeAgo(notification.created_at)}</span>
            </div>
            <div className="mt-6 text-center">
                <Link href="/notifications">
                    <span className="text-black hover:underline cursor-pointer">お知らせ一覧に戻る</span>
                </Link>
            </div>
        </div>
    );
};

export default NotificationDetail;