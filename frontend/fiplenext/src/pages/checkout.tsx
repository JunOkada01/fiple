// checkout.tsx
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface CartItem {
  product: {
    product_origin: {
      product_name: string;
    };
    price: number;
  };
  quantity: number;
  images: {
    id: number;
    image: string;
    image_description: string;
}[];
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 税込価格を計算する関数（切り捨て）
  const calculateTotalWithTax = (items: CartItem[]) => {
    const subtotal = items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
    return Math.floor(subtotal * 1.1);
  };

  // 商品ごとの税込価格を計算する関数（切り捨て）
  const calculateItemPriceWithTax = (price: number) => {
    return Math.floor(price * 1.1);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/cart/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setCartItems(response.data);
      setLoading(false);
    } catch (error) {
      setError('カートの商品の取得に失敗しました');
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      
      // カート情報を税込価格で送信
      const response = await axios.post('/api/create-checkout-session', {
        items: cartItems.map(item => ({
          ...item,
          product: {
            ...item.product,
            price: calculateItemPriceWithTax(item.product.price)
          }
        }))
      });
      
      const { id } = response.data;

      if (!stripe) {
        throw new Error('Stripe has not been initialized');
      }

      const result = await stripe.redirectToCheckout({ sessionId: id });
      
      if (result.error) {
        setError(result.error.message || '決済の初期化に失敗しました');
      }
    } catch (error) {
      setError('決済の処理中にエラーが発生しました');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const subtotal = cartItems.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0);
  const totalWithTax = calculateTotalWithTax(cartItems);

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">注文内容の確認</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">注文商品</h2>
        {cartItems.map((item, index) => (
          <div key={index} className="flex justify-between py-2 border-b">
            <img 
                                        alt={item.product.product_origin.product_name}
                                        src={`${item.product.images[0]?.image}`}
                                        className="itemImage w-24 h-24 object-cover mr-4"
                                    />
            <div>
              <p className="font-medium">{item.product.product_origin.product_name}</p>
              <p className="text-gray-600">数量: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">¥{(item.product.price * item.quantity).toLocaleString()}</p>
              <p className="text-sm text-gray-600">
                (税込 ¥{(calculateItemPriceWithTax(item.product.price) * item.quantity).toLocaleString()})
              </p>
            </div>
          </div>
        ))}
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between mb-2">
            <span>小計</span>
            <span>¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>消費税（10%）</span>
            <span>¥{(totalWithTax - subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>合計（税込）</span>
            <span>¥{totalWithTax.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleCheckout}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full max-w-md"
        >
          決済に進む
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;