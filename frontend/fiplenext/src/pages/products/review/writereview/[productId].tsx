import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Product {
  id: number;
  product_name: string;
}

const ProductReviewWrite = () => {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    review_detail: '',
    subject: '',
    fit: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fitError, setFitError] = useState(false);

  // トークン確認関数
  const verifyToken = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      router.push('/accounts/login');
      return;
    }
    try {
      await axios.post('http://34.201.127.158:8000/api/token/verify/', {
        token: accessToken,
      });
    } catch {
      router.push('/accounts/login');
    }
  };

  // 商品情報取得関数
  const fetchProduct = async () => {
    if (!productId) return;
    try {
      const response = await axios.get(
        `http://34.201.127.158:8000/api/products/review/${productId}/`
      );
      setProduct(response.data);
    } catch {
      setError('商品情報の取得に失敗しました');
    }
  };

  useEffect(() => {
    verifyToken();
  }, [router]);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.fit) {
      setFitError(true);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('認証が必要です');
      }

      await axios.post(
        'http://34.201.127.158:8000/api/reviews/write/',
        {
          ...formData,
          product: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      router.push(`/accounts/profile/history`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'レビューの投稿に失敗しました';
        setError(errorMessage);
      } else {
        setError('予期せぬエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!product) return <div>商品情報を取得中...</div>;

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {product.product_name}のレビューを書く
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">評価</label>
          <select
            value={formData.rating}
            onChange={(e) =>
              setFormData({ ...formData, rating: Number(e.target.value) })
            }
            className="w-full p-2 border rounded"
            aria-label="評価を選択してください"
          >
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>
                {'★'.repeat(num)}{'☆'.repeat(5 - num)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">レビュータイトル</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="タイトルを入力"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">レビュー内容</label>
          <textarea
            value={formData.review_detail}
            onChange={(e) =>
              setFormData({ ...formData, review_detail: e.target.value })
            }
            className="w-full p-2 border rounded h-32"
            placeholder="商品の感想を書いてください"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">フィット感</label>
          <select
            value={formData.fit}
            onChange={(e) => {
              setFormData({ ...formData, fit: e.target.value });
              setFitError(false);
            }}
            className={`w-full p-2 border rounded ${fitError ? 'border-red-500' : ''}`}
            aria-label="フィット感を選択してください"
            required
          >
            <option value="">フィット感を選択してください</option>
            <option value="大きすぎた">大きすぎた</option>
            <option value="ちょうどいい">ちょうどいい</option>
            <option value="ぱつぱつ">ぱつぱつ</option>
          </select>
          {fitError && (
            <p className="text-red-500 text-sm mt-1">フィット感を選択してください</p>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            戻る
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? '送信中...' : 'レビューを投稿'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductReviewWrite;
