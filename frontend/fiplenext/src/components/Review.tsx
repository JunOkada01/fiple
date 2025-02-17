import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
 
interface Review {
    id: number;
    user: string;
    subject: string;
    review_detail: string;
    rating: number;
    datetime: string;
}
 
interface ReviewProps {
    productId: number;
}
 
const ReviewList: React.FC<ReviewProps> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter(); // ルーティング用
 
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://13.216.135.244:8000/api/reviews/?productId=${productId}`);
               
                setReviews(response.data.reviews);
                setAverageRating(response.data.average_rating);
            } catch (err) {
                setError('レビューの取得に失敗しました');
                console.error('Error details:', err);
            } finally {
                setLoading(false);
            }
        };
 
        if (productId) {
            fetchReviews();
        }
    }, [productId]);
 
    if (loading) return <p>読み込み中...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
 
    // 平均評価に基づいて星を作成
    const renderStars = () => {
        if (averageRating === null) return null;
        const stars = [];
        const fullStars = Math.floor(averageRating);
 
        // 完全な星を追加
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <span key={i} className="star">
                    <span className="filled">★</span>
                </span>
            );
        }
 
        // 残りの星を空の状態で追加
        for (let i = fullStars; i < 5; i++) {
            stars.push(
                <span key={i} className="star">☆</span>
            );
        }
 
        return stars;
    };
 
    // レビューの合計数をクリックしたら、商品レビュー一覧ページに移動
    const handleReviewClick = () => {
        router.push(`/products/review/${productId}`);
    };
 
    // 最初の4つのレビューだけを表示
    const reviewsToDisplay = reviews.slice(0, 4);
 
    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">レビュー</h2>
 
            {averageRating !== null && (
                <div className="flex items-center mb-4">
                    <p className="text-lg mr-2">平均評価:</p>
                    <div className="flex items-center">
                        {/* 星表示 */}
                        {renderStars()}
                        <span className="ml-2 text-lg">{averageRating}</span>
 
                        {/* 合計レビュー数へのリンク */}
                        <span
                            className="ml-2 text-lg text-blue-500 cursor-pointer"
                            onClick={handleReviewClick}
                        >
                            ({reviews.length})
                        </span>
                    </div>
                </div>
            )}
 
            {reviewsToDisplay.length > 0 ? (
                <ul>
                    {reviewsToDisplay.map(review => (
                        <li key={review.id} className="mb-4 border-b pb-2">
                            <p>{review.subject}</p>
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
 
export default ReviewList;