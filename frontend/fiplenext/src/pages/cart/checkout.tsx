// checkout.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
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

interface PaymentMethod {
  id: string;
  name: string;
  label: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'card', name: 'credit_card', label: 'クレジットカード' },
  { id: 'paypay', name: 'paypay', label: 'PayPay' },
  { id: 'apple_pay', name: 'apple_pay', label: 'Apple Pay' },
  { id: 'conveni', name: 'conveni', label: 'コンビニ決済' }
];

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const router = useRouter();
  const [isFincodeLoaded, setIsFincodeLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<{ username: string; email: string } | null>(null); 

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
    fetchUserInfo();
    // fincodeの初期化
    const script = document.createElement('script');
    script.src = 'https://api.test.fincode.jp/v1/js/fincode.js';
    script.async = true;

    script.onload = () => {
      setIsFincodeLoaded(true);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
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

  // const handleCheckout = async () => {
  //   try {
  //     const totalAmount = calculateTotalWithTax(cartItems);
  //     const tax = Math.floor(totalAmount * 0.1); // 消費税計算
      
  //     // 決済データの作成
  //     const paymentData = {
  //       pay_type: selectedPayment,
  //       amount: (totalAmount - tax).toString(), // 税抜き金額
  //       tax: tax.toString(), // 消費税
  //       order_description: `商品${cartItems.length}点のご注文`, // PayPayアプリでの表示用
  //       items: cartItems.map(item => ({
  //         name: item.product.product_origin.product_name,
  //         quantity: item.quantity,
  //         price: Math.floor(item.product.price * 1.1).toString()
  //       }))
  //     };

  //     // Step 2: 決済登録APIの呼び出し
  //     const registrationResponse = await axios.post('/api/fincode/register-payment', paymentData, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('access_token')}`
  //       }
  //     });

  //     const { payment_id } = registrationResponse.data;

  //     // Step 3: 決済実行APIの呼び出し
  //     const executionResponse = await axios.post('/api/fincode/execute-payment', {
  //       payment_id,
  //       redirect_url: `${window.location.origin}/payment/complete`, // 完了後のリダイレクトURL
  //     });

  //     // Step 4: PayPayの支払いURLへリダイレクト
  //     const { code_url } = executionResponse.data;
  //     if (code_url) {
  //       window.location.href = code_url;
  //     } else {
  //       throw new Error('PayPayの支払いURLが取得できませんでした');
  //     }
  //   } catch (error: any) {
  //     console.error('Checkout error:', error);
  //     setError(error.response?.data?.message || '決済の処理中にエラーが発生しました');
  //   }


  // } 

  const fetchUserInfo = async () => {  
    try {  
      const response = await axios.get('http://localhost:8000/api/user/', {  
        headers: {  
          Authorization: `Bearer ${localStorage.getItem('access_token')}`  
        }  
      });  
      setUserInfo(response.data); // ユーザー情報をステートに保存  
    } catch (error) {  
      console.error('ユーザー情報の取得に失敗しました:', error);  
      setError('ユーザー情報の取得に失敗しました');  
    }  
  };  

  const handleCheckout = async () => {
    try {
      const totalAmount = calculateTotalWithTax(cartItems);
      const tax = Math.floor(totalAmount * 0.1); // 消費税計算
      
      // PayPay決済セッションの作成
      const sessionData = {
        transaction: {
          pay_type: ['Paypay'], // PayPayのみ許可
          amount: (totalAmount - tax).toString(), // 税抜き金額
          tax: tax.toString(),
          order_id: `ORDER_${Date.now()}`, // ユニークな注文ID
        },
        paypay: {
          job_code: 'AUTH', // 仮売上として処理
          order_description: `商品${cartItems.length}点のご注文`, // PayPayアプリでの表示用
        },
        success_url: `${window.location.origin}/cart/complete`,
        cancel_url: `${window.location.origin}/cart/cancel`,
        // メール通知の設定
        guide_mail_send_flag: "1",
        receiver_mail: userInfo?.email, // 実際の顧客メールアドレスを設定
        mail_customer_name: userInfo?.username, // 実際の顧客名を設定
        thanks_mail_send_flag: "1"
      };

      // セッション作成APIの呼び出し
      const response = await axios.post('/api/fincode/create-session', sessionData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const { link_url } = response.data;

      if (link_url) {
        // PayPay決済ページへリダイレクト
        window.location.href = link_url;
      } else {
        throw new Error('決済URLの取得に失敗しました');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.message || '決済の処理中にエラーが発生しました');
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
              className="w-24 h-24 object-cover mr-4"
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

      {/* 決済方法選択 */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">決済方法の選択</h2>
        <div className="space-y-4">
          {PAYMENT_METHODS.map((method) => (
            <label key={method.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={selectedPayment === method.id}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="text-gray-900">{method.label}</span>
            </label>
          ))}
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