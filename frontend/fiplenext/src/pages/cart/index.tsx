import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface CartItem {
    id: number;
    product: {
        id: number;
        product_origin: {
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

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.total_price, 0);
    };

    if (loading) {
        return (
            <div className="container mx-auto max-w-screen-xl px-4">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-screen-xl px-4">
            <h1 className="text-3xl font-bold text-center my-8">SHOPPING CART</h1>
            
            {error && (
                <div className="text-center py-8 text-red-500">
                    {error}
                </div>
            )}

            <div className="content">
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
                    <>
                        <div className="cartItems mb-8">
                            <h2 className="text-2xl font-semibold mb-4">カートに入っている商品</h2>
                            {cartItems.map((item) => (
                                <div key={item.id} className="cartItem flex items-center justify-between border-b border-gray-300 py-4">
                                    <img 
                                        alt={item.product.product_origin.product_name}
                                        src={`${item.product.images[0]?.image}`}
                                        className="itemImage w-24 h-24 object-cover mr-4"
                                    />
                                    <div className="itemDetails flex-1">
                                        <p className="text-lg font-semibold">
                                            {item.product.product_origin.product_name}
                                        </p>
                                        <p className="text-gray-500">
                                            カテゴリー: {item.product.product_origin.category.category_name} / 
                                            {item.product.product_origin.subcategory.subcategory_name}
                                        </p>
                                        <p className="text-gray-500">
                                            色: {item.product.color.color_name}
                                        </p>
                                        <p className="text-gray-500">
                                            サイズ: {item.product.size.size_name}
                                        </p>
                                        <p className="text-gray-500">
                                            在庫: {item.product.stock}点
                                        </p>
                                    </div>
                                    <div className="itemActions text-right">
                                        <p className="text-xl font-bold">¥{item.product.price.toLocaleString()}</p>
                                        <div className="flex items-center mt-2">
                                            <div className="quantity-controls flex items-center border rounded p-1">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="px-2 disabled:opacity-50"
                                                >
                                                    -
                                                </button>
                                                <span className="mx-2">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.product.stock}
                                                    className="px-2 disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="ml-4 text-red-500 hover:text-red-700"
                                            >
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary bg-gray-50 p-6 rounded-lg">
                            <table className="w-full text-left">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2 font-semibold">商品合計</td>
                                        <td className="py-2 text-right">¥{calculateTotal().toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-semibold">合計（税込）</td>
                                        <td className="py-2 text-right text-xl font-bold">
                                            ¥{(calculateTotal() * 1.1).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div className="flex flex-col items-center mt-6">
                                <Link href="/checkout">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded">
                                        レジに進む
                                    </button>
                                </Link>
                                <Link href="/">
                                    <span className="mt-4 text-blue-600 hover:text-blue-800 cursor-pointer">
                                        ショッピングを続ける
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;