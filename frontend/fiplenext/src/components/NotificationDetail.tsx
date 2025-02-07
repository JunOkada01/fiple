import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
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
                    console.log(err);
                    setError(`お知らせの取得に失敗しました`);
                } finally {
                    setLoading(false);
                }
            };

            fetchNotification();
        }
    }, [id]);

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
        <div className="container mx-auto px-4 py-8">
            <Head>
                <title>{notification.title}</title>
            </Head>
            <h3 className="text-3xl font-bold mb-6">{notification.title}</h3>
            <p>{notification.message}</p>
            <small>{new Date(notification.created_at).toLocaleString()}</small>
            <br />
            <Link href="/notifications">
                <a className="text-blue-500 underline">お知らせ一覧に戻る</a>
            </Link>
        </div>
    );
};

export default NotificationDetail;