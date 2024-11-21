import { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
  id: number;
  total_amount: number;
  tax_amount: number;
  order_date: string;
  payment_method: string;
  delivery_address: string;
  status: string;
  items: {
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
  }[];
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/orders/?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        setOrders(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10)); // 1ページあたり10件の仮定
        setLoading(false);
      } catch (err) {
        setError('注文履歴の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
                    <img 
                      src={`http://localhost:8000${item.product_image}`}
                      alt={item.product_name} 
                      className="w-16 h-16 object-cover mr-4 rounded"
                    />
                    <div>
                      <p className="font-medium">{item.product_name}</p>
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

      {/* ページネーション部分 */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className={`px-4 py-2 border rounded ${
            currentPage === 1 
              ? 'bg-gray-200 cursor-not-allowed' 
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          前のページ
        </button>

        <span className="text-gray-700">
          {currentPage} / {totalPages}
        </span>

        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className={`px-4 py-2 border rounded ${
            currentPage === totalPages 
              ? 'bg-gray-200 cursor-not-allowed' 
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          次のページ
        </button>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
