// pages/reviews/[productId].tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Review {
    id: number;
    user: string;
    review_detail: string;
    rating: number;
    datetime: string;
}

const ProductReviews = () => {
    const router = useRouter();
    const { productId } = router.query;  // 動的パラメータを取得
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!productId) return;  // productId がまだロードされていない場合は処理しない
            try {
                setLoading(true);
                const response = await axios.get(`http://127.0.0.1:8000/api/reviews/?productId=${productId}`);
                setReviews(response.data.reviews);
            } catch (err) {
                setError('レビューの取得に失敗しました');
                console.error('Error details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    if (loading) return <p>読み込み中...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">商品レビュー</h2>
            

            {reviews.length > 0 ? (
                <ul>
                    {reviews.map(review => (
                        <li key={review.id} className="mb-4 border-b pb-2">
                            <p><strong>ユーザー:</strong> {review.user}</p>
                            <p><strong>評価:</strong> {review.rating}☆</p>
                            <p><strong>コメント:</strong> {review.review_detail}</p>
                            <p className="text-sm text-gray-500">
                                <strong>投稿日:</strong> {new Date(review.datetime).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>まだレビューがありません。</p>
            )}
        </div>
    );
};

export default ProductReviews;
