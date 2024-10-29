import React from 'react';  
import Link from 'next/link';  

const OrderReview: React.FC = () => {  
    return (  
        <div className="container mx-auto max-w-screen-xl px-4">  
            <h1 className="text-3xl font-bold text-center my-8">REVIEW YOUR ORDER</h1>  
            <div className="content">  
                {/* 注文概要 + 商品リストのカード */}  
                <div className="orderCard mb-8 p-4 border rounded-lg shadow">  
                    <h2 className="text-2xl font-semibold mb-4">注文内容の概要</h2>  
                    <table className="w-full mb-4">  
                        <tbody>  
                            <tr>  
                                <td className="py-2">配送先</td>  
                                <td className="py-2">住所</td>  
                                <td className="py-2 text-right">  
                                    <button className="editButton bg-blue-500 text-white py-1 px-3 rounded">変更</button>  
                                </td>  
                            </tr>  
                            <tr>  
                                <td className="py-2">受け取り方法</td>  
                                <td className="py-2">対面で受け取り</td>  
                                <td className="py-2 text-right">  
                                    <button className="editButton bg-blue-500 text-white py-1 px-3 rounded">変更</button>  
                                </td>  
                            </tr>  
                            <tr>  
                                <td className="py-2">支払い方法</td>  
                                <td className="py-2">代金引換</td>  
                                <td className="py-2 text-right">  
                                    <button className="editButton bg-blue-500 text-white py-1 px-3 rounded">変更</button>  
                                </td>  
                            </tr>  
                        </tbody>  
                    </table>  

                    <h2 className="text-2xl font-semibold mb-4">注文商品</h2>  
                    <div className="productItem flex items-center border-b border-gray-300 py-4"> 
                        <img alt="商品画像" className="itemImage w-32 h-32 object-cover mr-4" />  
                        <div className="itemDetails flex-1">  
                            <p className="text-lg font-semibold">もっとのびストレッチデニム</p>  
                            <p className="text-gray-500">パンツ/デニム</p>  
                            <p className="text-xl font-bold">¥7,800</p>  
                        </div>  
                    </div>  
                    {/* 他の商品も同じ構造で追加 */}  
                </div>  

                {/* 支払い概要のカード */}  
                <div className="paymentSummary mb-8 p-4 border rounded-lg">  
                    <h2 className="text-2xl font-semibold mb-4">支払い概要</h2>  
                    <table className="w-full">  
                        <tbody>  
                            <tr>  
                                <td className="py-2">送料</td>  
                                <td className="py-2">¥330</td>  
                            </tr>  
                            <tr>  
                                <td className="py-2">手数料</td>  
                                <td className="py-2">¥200</td>  
                            </tr>  
                            <tr>  
                                <td className="py-2 font-bold">合計金額</td>  
                                <td className="py-2 font-bold">¥8,330</td>  
                            </tr>  
                        </tbody>  
                    </table>  
                    <Link href="/cart/complete">  
                        <button className="checkoutButton bg-green-500 text-white font-bold py-2 px-4 rounded mt-4">注文を確定する</button>  
                    </Link>  
                </div>  
            </div>  
        </div>  
    );  
};  

export default OrderReview;