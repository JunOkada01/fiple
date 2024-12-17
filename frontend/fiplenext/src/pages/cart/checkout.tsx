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
    { id: 'card', name: 'Card', label: 'クレジットカード' },
    { id: 'paypay', name: 'Paypay', label: 'PayPay' },
    { id: 'konbini', name: 'Konbini', label: 'コンビニ決済'},
    ];

    const CheckoutPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<string>('card');
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
        // カード決済フォームの初期化
        if (window.Fincode) {
            window.Fincode.init();
        }
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

    const fetchUserInfo = async () => {  
        try {  
        const response = await axios.get('http://localhost:8000/api/user/', {  
            headers: {  
            Authorization: `Bearer ${localStorage.getItem('access_token')}`  
            }  
        });  
        setUserInfo(response.data);
        } catch (error) {  
        console.error('ユーザー情報の取得に失敗しました:', error);  
        setError('ユーザー情報の取得に失敗しました');  
        }  
    };

    const handleCardPayment = async () => {
        try {
        const totalAmount = calculateTotalWithTax(cartItems);
        const tax = Math.floor(totalAmount * 0.1); // 消費税計算
        const orderId = `ORDER_${Date.now()}`; // ユニークな注文ID生成
        
        const sessionData = {
            transaction: {
            pay_type: ['Card'],
            amount: (totalAmount - tax).toString(),
            tax: tax.toString(),
            order_id: orderId,
            },
            card: {
            job_code: 'AUTH',
            tds_type: '2',
            tds2_type: '2',
            },
            success_url: `${window.location.origin}/cart/complete`,
            cancel_url: `${window.location.origin}/cart/cancel`,
            shop_service_name: 'テスト店',
            guide_mail_send_flag: '1',
            receiver_mail: userInfo?.email || '',
            mail_customer_name: userInfo?.username || '',
            thanks_mail_send_flag: '1',
            shop_mail_template_id: null
        };

        // セッション作成APIの呼び出し
        const response = await axios.post('/api/fincode/create-session', sessionData, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const { link_url } = response.data;

        if (link_url) {
            window.location.href = link_url;
        } else {
            throw new Error('決済URLの取得に失敗しました');
        }
        } catch (error: any) {
        console.error('Checkout error:', error);
        setError(error.response?.data?.message || '決済の処理中にエラーが発生しました');
        }
    };

    const handlePayPayPayment = async () => {
        try {
        const totalAmount = calculateTotalWithTax(cartItems);
        const tax = Math.floor(totalAmount * 0.1);
        
        const sessionData = {
            transaction: {
            pay_type: ['Paypay'],
            amount: (totalAmount - tax).toString(),
            tax: tax.toString(),
            order_id: `ORDER_${Date.now()}`,
            },
            paypay: {
            job_code: 'AUTH',
            order_description: `商品${cartItems.length}点のご注文`,
            },
            success_url: `${window.location.origin}/cart/complete`,
            cancel_url: `${window.location.origin}/cart/cancel`,
            guide_mail_send_flag: "1",
            receiver_mail: userInfo?.email,
            mail_customer_name: userInfo?.username,
            thanks_mail_send_flag: "1"
        };

        const response = await axios.post('/api/fincode/create-session', sessionData, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const { link_url } = response.data;
        if (link_url) {
            window.location.href = link_url;
        } else {
            throw new Error('決済URLの取得に失敗しました');
        }
        } catch (error: any) {
        console.error('PayPay payment error:', error);
        setError(error.response?.data?.message || '決済の処理中にエラーが発生しました');
        }
    };

    const handleCheckout = async () => {
        if (selectedPayment === 'card') {
        await handleCardPayment();
        } else if (selectedPayment === 'paypay') {
        await handlePayPayPayment();
        } else if (selectedPayment === 'konbini') {
        await handleKonbiniPayment();
        }
    };

    const handleKonbiniPayment = async () => {
        try {
        const totalAmount = calculateTotalWithTax(cartItems);
        const tax = Math.floor(totalAmount * 0.1);
        
        const sessionData = {
            transaction: {
            pay_type: ['Konbini'],
            amount: (totalAmount - tax).toString(),
            tax: tax.toString(),
            order_id: `ORDER_${Date.now()}`,
            },
            konbini: {
            payment_term_day: "3",
            konbini_reception_mail_send_flag: "1"
            },
            success_url: `${window.location.origin}/cart/complete`,
            cancel_url: `${window.location.origin}/cart/cancel`,
            guide_mail_send_flag: "1",
            receiver_mail: userInfo?.email,
            mail_customer_name: userInfo?.username,
            thanks_mail_send_flag: "1"
        };

        const response = await axios.post('/api/fincode/create-session', sessionData, {
            headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        const { link_url } = response.data;
        if (link_url) {
            window.location.href = link_url;
        } else {
            throw new Error('決済URLの取得に失敗しました');
        }
        } catch (error: any) {
        console.error('Konbini payment error:', error);
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
        <div className="container mx-auto max-w-screen-md px-4 py-8">
            
            {/* 商品一覧部分 */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
                <h1 className="text-3xl text-center my-4 font-bold">注文内容の確認</h1>
    
                {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b">
                        <img 
                            alt={item.product.product_origin.product_name}
                            src={`${item.product.images[0]?.image}`}
                            className="w-24 h-24 object-cover mr-4 border-2"
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
    
                <div className="mt-4 pt-4">
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
            <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
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
    
            {/* 決済ボタン */}
            <div className="text-center">
                <button
                    onClick={handleCheckout}
                    className="relative border border-black bg-white text-black font-bold px-10 py-4 my-5 rounded-lg overflow-hidden group w-full max-w-md mx-auto"
                >
                    <span className="absolute inset-0 bg-black transform -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0"></span>
                    <span className="relative transition-colors duration-300 ease-in-out group-hover:text-white">
                        決済に進む
                    </span>
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;