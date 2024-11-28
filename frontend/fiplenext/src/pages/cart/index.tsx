import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

interface CartItem {
    id: number;
    product: {
        id: number;
        product_origin: {
            id: number;
            product_name: string;
            category: {
                category_name: string;
            };
            subcategory: {
                subcategory_name: string;
            };
        };
        color: {
            color_name: string;
        };
        size: {
            size_name: string;
        };
        price: number;
        stock: number;
        images: {
            id: number;
            image: string;
            image_description: string;
        }[];
    };
    quantity: number;
    product_status: string;
    total_price: number;
    created_at: string;
    updated_at: string;
}

const Cart: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCartItems = async (token?: string) => {
        try {
            const response = await axios.get('http://localhost:8000/api/cart/', {
                headers: {
                    Authorization: `Bearer ${token || localStorage.getItem('access_token')}`
                }
            });

            console.log(response.data)
            console.log(Array.isArray(response.data.results)); 
            
            setCartItems(response.data);
            setError(null);
        } catch (error) {
            setError('カートの商品の取得に失敗しました');
            console.error('Error fetching cart items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initializeCart = async () => {
            const token = await refreshToken();
            if (token) {
                fetchCartItems(token);
            }
        };
        initializeCart();
    }, []);

    const refreshToken = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/token/refresh/', {
                refresh: localStorage.getItem('refresh_token'),
            });
            const newToken = response.data.access;
            localStorage.setItem('access_token', newToken);
            return newToken;
        } catch (error) {
            setError('認証の更新に失敗しました。再度ログインしてください。');
            console.error('Failed to refresh token:', error);
            return null;
        }
    };

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        try {
            const response = await axios.patch(
                `http://localhost:8000/api/cart/${itemId}/`,
                { quantity: newQuantity },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.id === itemId ? response.data : item
                )
            );
            setError(null);
        } catch (error: any) {
            setError(error.response?.data?.error || 'カートの更新に失敗しました');
        }
    };

    {/* カートから商品を削除 */}
    const handleRemoveItem = async (itemId: number) => {
        try {
            await axios.delete(`http://localhost:8000/api/cart/${itemId}/delete/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
            setError(null);
        } catch (error) {
            setError('商品の削除に失敗しました');
            console.error('Error removing item from cart:', error);
        }
    };

    {/* 合計金額 */}
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.total_price, 0);
    };

    return (  
        <div className="container mx-auto p-4">  
            <h1 className="text-3xl text-center my-8">SHOPPING CART</h1>  
            
            {/* 商品がない場合 */}  
            {error && (  
                <div className="text-center py-8 text-red-500">  
                    {error}  
                </div>  
            )}  
    
            <div className="flex flex-col md:flex-row">  
                {/* 商品リスト */}  
                <div className="cartItems md:mr-4 overflow-y-auto h-[450px] scrollbar-hide">  
                    <div className="sticky top-0 bg-white border-b p-4 z-10">  
                        <h2 className="text-lg text-center">カートに入っている商品</h2>  
                    </div>
<<<<<<< HEAD
                ) : (
                    <>
                        <div className="cartItems mb-8">
                            <h2 className="text-2xl font-semibold mb-4">カートに入っている商品</h2>
                            {cartItems.map((item) => (
                                <div key={item.id} className="cartItem flex items-center justify-between border-b border-gray-300 py-4">
                                    <Link href={`/products/${item.product.product_origin.id}`}>
                                    <img 
                                        alt={item.product.product_origin.product_name}
                                        src={`${item.product.images[0]?.image}`}
                                        className="itemImage w-24 h-24 object-cover mr-4"
                                    />
                                    </Link>
                                    <div className="itemDetails flex-1">
                                        <Link href={`/products/${item.product.product_origin.id}`}><p className="font-medium text-blue-600 hover:underline">
                                            {item.product.product_origin.product_name}
                                        </p></Link>
                                        <p className="text-gray-500">
                                            カテゴリー: {item.product.product_origin.category.category_name} / 
                                            {item.product.product_origin.subcategory.subcategory_name}
=======
                    {cartItems.length === 0 ? (  
                        <div className="text-center py-8">  
                            <p className="text-xl mb-4">カートに商品がありません</p>  
                            <Link href="/">  
                                <span className="text-blue-500 underline cursor-pointer">  
                                    商品一覧へ戻る  
                                </span>  
                            </Link>  
                        </div>  
                    ) : (  
                        cartItems.map((item) => (
                            <div key={item.id} className="cartItem flex items-center justify-between py-4 px-4">
                                <div className="w-full border-b border-gray-300 mx-4 flex items-center">
                                    {/* 商品画像 */}
                                    <Link href={`/products/${item.product.product_origin.id}`}>
                                        <img   
                                            alt={item.product.product_origin.product_name}  
                                            src={`${item.product.images[0]?.image}`}
                                            className="itemImage w-auto h-[150px] object-cover"   
                                        />
                                    </Link>

                                    {/* 商品詳細 */}
                                    <div className="itemDetails flex-1 mx-4 space-y-1">
                                        {/* 商品名 */}
                                        <Link href={`/products/${item.product.product_origin.id}`}>
                                            <p className="text-md font-semibold">  
                                                {item.product.product_origin.product_name}  
                                            </p>
                                        </Link>
                                        {/* カテゴリ */}
                                        <p className="text-gray-500 text-sm">  
                                            カテゴリー: {item.product.product_origin.category.category_name} /   
                                            {item.product.product_origin.subcategory.subcategory_name}  
>>>>>>> origin/fiple11/22
                                        </p>
                                        {/* カラー */}
                                        <p className="text-gray-500 text-sm">  
                                            色: {item.product.color.color_name}  
                                        </p>
                                        {/* サイズ */}
                                        <p className="text-gray-500 text-sm">  
                                            サイズ: {item.product.size.size_name}  
                                        </p>
                                        {/* 在庫 */}
                                        <p className="text-gray-500 text-sm">  
                                            在庫: {item.product.stock}点  
                                        </p>  
                                    </div>

                                    {/* 商品価格 */}
                                    <p className="text-xl font-bold mx-4 text-right">¥{item.product.price.toLocaleString()}</p>

                                    {/* 商品アクション */}
                                    <div className="itemActions text-right flex items-center mx-2">
                                        {/* 商品増減ボタン */}
                                        <div className="quantity-controls flex flex-col items-center border rounded mx-4">
                                            {/* 増 */}
                                            <button  
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}  
                                                disabled={item.quantity >= item.product.stock}  
                                                className="px-3 py-1 w-full disabled:opacity-50 bg-gray-200"
                                            >  
                                                <FontAwesomeIcon icon={faPlus} className='text-sm text-gray-500'/>
                                            </button>
                                            {/* 数 */}
                                            <span className="text-md px-3 py-2">{item.quantity}</span>
                                            {/* 減 */}
                                            <button  
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}  
                                                disabled={item.quantity <= 1}  
                                                className="px-3 py-1 w-full disabled:opacity-50 bg-gray-200"
                                            >  
                                                <FontAwesomeIcon icon={faMinus} className='text-sm text-gray-500'/>
                                            </button>
                                        </div>

                                        {/* 商品削除ボタン */}
                                        <button  
                                            onClick={() => handleRemoveItem(item.id)}  
                                            className="m-4 text-red-500 text-sm hover:text-red-700"  
                                        >  
                                            削除  
                                        </button>  
                                    </div>
                                </div>
                            </div>  
                        ))  
                    )}  
                </div>  
                
                {/* 商品合計金額 */}  
                <div className="summary p-4  h-[220px]">  
                    <table className="w-full text-left">  
                        <tbody>  
                            <tr className="border-b">  
                                <td className="py-2">商品合計</td>  
                                <td className="py-2 text-right">¥{calculateTotal().toLocaleString()}</td>  
                            </tr>  
                            <tr>  
                                <td className="py-2 font-semibold">合計（税込）</td>  
                                <td className="py-2 text-right text-xl font-bold">  
                                    ¥{Math.floor((calculateTotal() * 1.1)).toLocaleString()}  
                                </td>  
                            </tr>  
                        </tbody>  
                    </table>  
                    
                    <div className="flex flex-col space-y-4 items-center mt-6">  
                    <Link href={cartItems.length === 0 ? "#" : "/cart/checkout"}>
                        <button
                            className={`w-full max-w-md px-20 py-1 border-2 font-bold transition-all
                                ${cartItems.length === 0
                                    ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                                    : 'text-black border-black hover:text-white hover:bg-black hover:shadow-lg'}`}
                            disabled={cartItems.length === 0}
                        >
                            レジに進む
                        </button>
                    </Link>
                        <Link href="/">  
                            <span className="mt-4 text-black hover:text-gray-500 cursor-pointer">  
                                ショッピングを続ける  
                            </span>  
                        </Link>  
                    </div>  
                </div>  
            </div>  
        </div>  
    );
};

export default Cart;