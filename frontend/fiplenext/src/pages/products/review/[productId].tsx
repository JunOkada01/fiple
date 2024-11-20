import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const RatingDistribution = ({ ratingCounts, totalReviews }) => {
  return (
    <div className="w-full max-w-md mb-6 mx-auto">
      <h3 className="text-md font-medium mb-3 text-center">お客様の評価</h3>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = ratingCounts[rating] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={rating} className="flex items-center mb-1">
            <span className="w-16 text-sm text-gray-900">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
            <div className="flex-1 h-4 bg-gray-200 rounded-full mx-2">
              <div 
                className="h-full bg-gray-900 rounded-full" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

interface Review {
  id: number;
  user: string;
  subject: string;
  review_detail: string;
  rating: number;
  datetime: string;
}

export interface ProductDetailType {
    product_name: string;
}

const ProductReviews = () => {
    const router = useRouter();
    const { productId } = router.query;
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});

    useEffect(() => {
        const fetchReviews = async () => {
            if (!productId) return;
            try {
                setLoading(true);
                const response = await axios.get(`http://127.0.0.1:8000/api/reviews/?productId=${productId}`);
                setReviews(response.data.reviews);
                setRatingDistribution(response.data.rating_distribution || {});
            } catch (err) {
                setError('レビューの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            try {
                setLoading(true);
                const response = await axios.get(`http://127.0.0.1:8000/api/products/${productId}/`);
                setProduct(response.data);
            } catch (err) {
                setError('商品情報の取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) return <p className="text-center">読み込み中...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!product) return null;

    return (
        <div className="mt-4 p-4 bg-white shadow-sm rounded-md max-w-lg mx-auto">
            <h1 className="text-xl font-semibold mb-2 text-center">{product.product_name}</h1>

            <RatingDistribution 
                ratingCounts={ratingDistribution}
                totalReviews={reviews.length}
            />

            {/* レビューを書くボタン */}
            <div className="text-right mb-4">
                <button 
                    className="px-2 py-1 bg-gray-100 text-black rounded-md"
                    onClick={() => router.push(`/products/review/writereview/${productId}`)}
                >
                    レビューを書く
                </button>
            </div>

            {reviews.length > 0 ? (
                <ul className="space-y-3">
                    {reviews.map(review => (
                        <li key={review.id} className="border-b pb-2 text-sm">
                            <p><strong>評価:</strong> {review.rating}☆</p>
                            <p className="text-gray-800"><strong>タイトル:</strong> {review.subject}</p>
                            <p className="text-gray-700"><strong>コメント:</strong> {review.review_detail}</p>
                            <p className="text-xs text-gray-500">
                                <strong>投稿日:</strong> {new Date(review.datetime).toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-600 text-center">まだレビューがありません。</p>
            )}
        </div>
    );
};

export default ProductReviews;
