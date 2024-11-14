import React from 'react';  
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

const OrderConfirmation: React.FC = () => {  

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isClearing, setIsClearing] = useState(true);

    useEffect(() => {
        const clearCart = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
            throw new Error('認証情報が見つかりません');
            }

            // カート内の全商品を取得
            const cartResponse = await axios.get('http://localhost:8000/api/cart/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
            });

            // 各商品を順番に削除
            for (const item of cartResponse.data) {
            await axios.delete(`http://localhost:8000/api/cart/${item.id}/delete/`, {
                headers: {
                Authorization: `Bearer ${token}`
                }
            });
            }

            setIsClearing(false);
        } catch (error: any) {
            console.error('Failed to clear cart:', error);
            setError('カートのクリアに失敗しました。');
            setIsClearing(false);
        }
        };

        clearCart();
    }, []);

    if (isClearing) {
        return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">決済情報を処理中...</p>
        </div>
        );
    }

    return (  
        <div className="confirmation-container mx-auto max-w-screen-md px-4 py-8">  
            <h1 className="comp-title text-3xl font-bold text-center mb-4">THANK YOU FOR YOUR ORDER!</h1>  
            <p className="comp-title text-xl text-center mb-2">ご注文ありがとうございます！</p>  
            <p className="comp-subtitle text-lg text-center mb-6">以下の内容でご注文を承りました</p>  

            <div className="order-summary mb-8 p-4 border rounded-lg shadow">  
                <h2 className="summary-title text-2xl font-semibold mb-4">ご注文内容</h2>  
                <table className="order-table w-full">  
                    <thead>  
                        <tr className="bg-gray-200 text-left">  
                            <th className="py-2 px-4">お届けする製品</th>  
                            <th className="py-2 px-4">価格</th>  
                        </tr>  
                    </thead>  
                    <tbody>  
                        <tr className="border-b">  
                            <td className="product-item flex items-center py-2">  
                                <img src="/path/to/image.jpg" alt="商品画像" className="product-image w-16 h-16 object-cover mr-4 rounded" />  
                                <div className="product-info">  
                                    <p className="font-semibold">もっとのびストレッチデニム</p>  
                                    <p>カラー: デニム</p>  
                                    <p>サイズ: M</p>  
                                </div>  
                            </td>  
                            <td className="py-2">¥7,800</td>  
                        </tr>  
                        <tr className="border-b">  
                            <td className="product-item flex items-center py-2">  
                                <img src="/path/to/image.jpg" alt="商品画像" className="product-image w-16 h-16 object-cover mr-4 rounded" />  
                                <div className="product-info">  
                                    <p className="font-semibold">もっとのびストレッチデニム</p>  
                                    <p>カラー: デニム</p>  
                                    <p>サイズ: L</p>  
                                </div>  
                            </td>  
                            <td className="py-2">¥7,800</td>  
                        </tr>  
                        <tr>  
                            <td>送料</td>  
                            <td>¥300</td>  
                        </tr>  
                    </tbody>  
                </table>  
            </div>  

            <p className="note text-center text-sm text-gray-600">  
                ご登録いただいたメールアドレスに詳細のメールをお送りしております。<br />  
                メールが届かない場合はお手数ですがお電話またはメールなどでお問い合わせください。  
            </p>  
        </div>  
    );  
};  

export default OrderConfirmation;
