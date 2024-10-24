import React from 'react';  
import Link from 'next/link';  

const Cart: React.FC = () => {  
    return (  
        <div className="container mx-auto max-w-screen-xl px-4">  
            <h1 className="text-3xl font-bold text-center my-8">SHOPPING CART</h1>  
            <div className="content">  
                {/* カートに入っている商品 */}  
                <div className="cartItems mb-8">  
                    <h2 className="text-2xl font-semibold mb-4">カートに入っている商品</h2>  
                    
                    {/* カート商品アイテム */}  
                    <div className="cartItem flex items-center justify-between border-b border-gray-300 py-4">  
                        <img alt="商品画像" className="itemImage w-24 h-24 object-cover mr-4" />  
                        <div className="itemDetails flex-1">  
                            <p className="text-lg font-semibold">もっとのびストレッチデニム</p>  
                            <p className="text-gray-500">パンツ/デニム</p>  
                            <p className="text-gray-500">色: カラー</p>  
                            <p className="text-gray-500">サイズ: サイズ</p>  
                        </div>  
                        <div className="itemActions text-right">  
                            <p className="text-xl font-bold">¥7,800</p>  
                            <div className="flex mt-2">  
                                <button className="quantityButton px-2 border border-gray-300 rounded">+</button>  
                                <button className="quantityButton px-2 border border-gray-300 rounded ml-2">-</button>  
                                <button className="removeButton px-2 border border-red-500 text-red-500 rounded ml-2">削除</button>  
                            </div>  
                        </div>  
                    </div>  
                    {/* 他の商品も同じ構造で追加 */}  
                </div>  

                {/* 合計金額の表示 */}  
                <div className="summary flex flex-col items-center">  
                    <table className="w-full text-left">  
                        <tbody>  
                            <tr>  
                                <td className="py-2 font-semibold">品代</td>  
                                <td className="py-2">¥0</td>  
                            </tr>  
                            <tr>  
                                <td className="py-2 font-semibold">商品合計</td>  
                                <td className="py-2">¥0</td>  
                            </tr>  
                        </tbody>  
                    </table>  
                    <Link href="/cart/check">  
                        <button className="checkoutButton bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4">レジに進む</button>  
                    </Link>  
                    <a href="#" className="continueLink text-blue-500 mt-2 inline-block">ショッピングを続ける</a>  
                </div>  
            </div>  
        </div>  
    );  
};  

export default Cart;