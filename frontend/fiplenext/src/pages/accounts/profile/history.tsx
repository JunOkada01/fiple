import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get<ApiResponse>('http://localhost:8000/api/orders/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (response.data && Array.isArray(response.data.results)) {
          setOrders(response.data.results);
        } else if (Array.isArray(response.data)) {
          // If the API returns an array directly
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

    fetchOrderHistory();
  }, []);

  if (loading) {
    return <div className="text-center p-4">注文履歴を読み込んでいます...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">注文履歴</h1>
      
      {orders.length === 0 ? (
        <p className="text-gray-600">注文履歴がありません</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">注文 #{order.id}</h2>
              <span className="text-sm text-gray-600">
                注文日: {new Date(order.order_date).toLocaleDateString()}
              </span>
            </div>
            
            <div className="mb-4">
              <p>合計金額: ¥{order.total_amount.toLocaleString()}</p>
              <p>消費税: ¥{order.tax_amount.toLocaleString()}</p>
              <p>支払方法: {order.payment_method}</p>
              <p>配送先: {order.delivery_address}</p>
              <p>状態: {order.status}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">注文商品</h3>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center">
                  <Link href={`products/${item.product.product_origin.id}`}>
                    <img 
                      src={`http://localhost:8000${item.product_image}`}
                      alt={item.product.product_origin.product_name} 
                      className="w-16 h-16 object-cover mr-4 rounded"
                    />
                    </Link>
                    <div>
                      <Link href={`products/${item.product.product_origin.id}`}>
                      <p className="font-medium text-blue-600 hover:underline">{item.product.product_origin.product_name}</p>
                      </Link>
                      <p className="text-gray-600">数量: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">¥{item.unit_price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderHistoryPage;

