// components/Review.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Review {
    id: number;
    user: string;
    review_detail: string;
    rating: number;
    datetime: string;
}

interface ReviewProps {
    productId: number;
}

const ReviewList: React.FC<ReviewProps> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchReviews = async () => {
          try {
              setLoading(true);
              console.log(`Fetching reviews for product ${productId}`); // デバッグログ
              const response = await axios.get(`http://127.0.0.1:8000/api/reviews/?productId=${productId}`);
              console.log('Response:', response.data); // デバッグログ
              setReviews(response.data);
          } catch (err) {
              console.error('Error details:', err); // より詳細なエラーログ
              setError('レビューの取得に失敗しました');
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

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">レビュー</h2>
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

export default ReviewList;