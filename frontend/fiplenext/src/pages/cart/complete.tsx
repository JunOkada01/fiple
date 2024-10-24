import React from 'react';  

const OrderConfirmation: React.FC = () => {  
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
