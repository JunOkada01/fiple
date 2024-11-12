import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Product {
    name: string;
    image_url: string | null;
}

const ProductReviewPage = () => {
    const router = useRouter();
    const { productId } = router.query;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newReview, setNewReview] = useState({
        subject: '',
        review_detail: '',
        rating: 5,
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://127.0.0.1:8000/api/reviews/?productId=${productId}`);
                setProduct(response.data.product);  // 商品情報のみ取得
            } catch (err) {
                setError('データの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };

        if (productId) fetchProduct();
    }, [productId]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`http://127.0.0.1:8000/api/reviews/`, {
                ...newReview,
                product: productId,
                user: "example_user",  // 実際のユーザー情報に置き換えてください
            });
            setNewReview({ subject: '', review_detail: '', rating: 5 });
            alert("レビューが投稿されました");
        } catch (err) {
            setError('レビューの投稿に失敗しました');
        }
    };

    if (loading) return <p>読み込み中...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-semibold">{product?.name}</h1>
            {product?.image_url && <img src={product.image_url} alt={product.name} className="w-full h-64 object-cover my-4" />}

            <h2 className="text-xl font-semibold mt-8">レビューを投稿</h2>
            <form onSubmit={handleReviewSubmit} className="mt-4">
                <div className="mb-4">
                    <label htmlFor="subject" className="block font-semibold">タイトル</label>
                    <input
                        type="text"
                        id="subject"
                        value={newReview.subject}
                        onChange={(e) => setNewReview({ ...newReview, subject: e.target.value })}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="review_detail" className="block font-semibold">コメント</label>
                    <textarea
                        id="review_detail"
                        value={newReview.review_detail}
                        onChange={(e) => setNewReview({ ...newReview, review_detail: e.target.value })}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="rating" className="block font-semibold">評価</label>
                    <select
                        id="rating"
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                        required
                        className="w-full p-2 border rounded"
                    >
                        {[5, 4, 3, 2, 1].map((star) => (
                            <option key={star} value={star}>
                                {star}☆
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">投稿する</button>
            </form>
        </div>
    );
};

export default ProductReviewPage;
