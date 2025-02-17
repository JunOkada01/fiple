import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Order {
  id: number;
  total_amount: number;
  tax_amount: number;
  order_date: string;
  payment_method: string;
  delivery_address: string;
  status: string;
  items: {
    product: {
      id: number;
      product_origin: {
        id: number;
        product_name: string;
      }
    }
    product_image: string;
    quantity: number;
    unit_price: number;
  }[];
}

interface ApiResponse {
  results?: Order[];
}

const OrderHistoryPage: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewedProducts, setReviewedProducts] = useState<number[]>([]); // レビュー済み商品IDを管理

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get<ApiResponse>('http://54.221.185.90/api/orders/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.data && Array.isArray(response.data.results)) {
          setOrders(response.data.results);
        } else if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error('Unexpected API response structure:', response.data);
          setError('予期しないAPIレスポンス構造です');
        }
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('注文履歴の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviewedProducts = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) return;

        const response = await axios.get<number[]>('http://54.221.185.90/reviews/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setReviewedProducts(response.data); // レビュー済み商品IDリストを保存
      } catch (err) {
        console.error('レビュー済み商品リストの取得に失敗しました:', err);
      }
    };

    fetchOrderHistory();
    fetchReviewedProducts();
  }, []);

  const handleWriteReview = (productId: number) => {
    router.push(`/products/review/writereview/${productId}`);
  };

  const handleDeleteReview = async (productId: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        alert('ログインが必要です。');
        return;
      }

      const response = await axios.delete(`http://54.221.185.90/reviews/${productId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 204) {
        alert('レビューを削除しました。');
        setReviewedProducts((prev) => prev.filter((id) => id !== productId)); // 状態を更新
      }
    } catch (err) {
      console.error('レビュー削除中にエラーが発生しました:', err);
      alert('レビュー削除に失敗しました。');
    }
  };

  if (loading) {
    return <div className="text-center p-4">注文履歴を読み込んでいます...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container flex items-center justify-center mx-auto px-4 py-8">
      <div>
        {orders.length === 0 ? (
          <p className="text-gray-600">注文履歴がありません</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white w-[600px] shadow-md rounded-lg p-6 mb-6">
              {/* 注文ボックス ヘッダー */}
              <div className="flex justify-between items-center mb-4 border-b">
                <h2 className="text-xl font-semibold">Order No.{order.id}</h2>
                <span className="text-sm text-gray-600">
                  注文日: {new Date(order.order_date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">注文商品</h3>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center">
                      <Link href={`http://localhost:3000/products/${item.product.product_origin.id}`}>
                        <img 
                          src={`http://localhost:8000${item.product_image}`}
                          alt={item.product.product_origin.product_name} 
                          className="w-16 h-16 object-cover mr-4 rounded"
                        />
                      </Link>
                      <div>
                        <Link href={`http://localhost:3000/products/${item.product.product_origin.id}`}>
                          <p className="font-medium text-blue-600 hover:underline">
                            {item.product.product_origin.product_name}
                          </p>
                        </Link>
                        <p className="text-gray-600">数量: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-medium mb-2">¥{item.unit_price.toLocaleString()}</p>
                      {reviewedProducts.includes(item.product.product_origin.id) ? (
                        <button
                          onClick={() => handleDeleteReview(item.product.product_origin.id)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          レビュー削除
                        </button>
                      ) : (
                        <button
                          onClick={() => handleWriteReview(item.product.product_origin.id)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          レビューを書く
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <p>支払方法: {order.payment_method}</p>
                <p>配送先: {order.delivery_address}</p>
                <p>状態: {order.status}</p>
                <div className='flex justify-start items-center gap-4'>
                  <p>消費税: ¥{order.tax_amount.toLocaleString()}</p>
                  <p>合計金額: ¥{order.total_amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
