import React from 'react';  
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

interface OrderDetails {
    orderId: string;
    total_amount: number;
    tax_amount: number;
    payment_method: string;
    delivery_address: string;
}

const OrderConfirmation: React.FC = () => {  

    const router = useRouter();
    // const [error, setError] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);


    useEffect(() => {
        const { orderId } = router.query;
        const storedOrderDetails = JSON.parse(localStorage.getItem('orderDetails') || 'null');
        
        if (storedOrderDetails) {
            setOrderDetails(storedOrderDetails);
        }
    
        const completeOrder = async () => {
          if (orderId && storedOrderDetails) {
            try {
              const response = await axios.post('http://localhost:8000/api/complete-payment/', {
                orderId,
                total_amount: storedOrderDetails.total_amount,
                tax_amount: storedOrderDetails.tax_amount,
                payment_method: storedOrderDetails.payment_method,
                delivery_address: storedOrderDetails.delivery_address
              }, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
              });
              localStorage.removeItem('orderDetails');
              console.log('注文完了:', response.data);
              // 注文完了のロジック（画面表示など）
            } catch (error) {
              console.error('注文完了処理に失敗:', error);
              // エラーハンドリング
            }
          }
        };
    
        completeOrder();
      }, [router.query]);

    return (  
        <div className="confirmation-container mx-auto max-w-screen-md px-4 py-8">  
            <h1 className="comp-title text-3xl font-bold text-center mb-4">THANK YOU FOR YOUR ORDER!</h1>  
            <p className="comp-title text-xl text-center mb-2">ご注文ありがとうございます！</p>  
            
            <br></br>

            <Link href="/accounts/profile/history">
            <p className="comp-title text-xl text-center mb-2">注文履歴はこちら</p>
            </Link>

            <br></br> 

            <p className="note text-center text-sm text-gray-600">  
                ご登録いただいたメールアドレスに詳細のメールをお送りしております。<br />  
                メールが届かない場合はお手数ですがお電話またはメールなどでお問い合わせください。  
            </p>

            {orderDetails && (
                <div className="order-details bg-white shadow rounded p-4 mt-4">
                    <h2 className="text-lg font-semibold mb-2">ご注文内容</h2>
                    <p>注文ID: {orderDetails.orderId}</p>
                    <p>合計金額: {orderDetails.total_amount}円</p>
                    <p>消費税: {orderDetails.tax_amount}円</p>
                    <p>支払い方法: {orderDetails.payment_method}</p>
                    <p>配送先住所: {orderDetails.delivery_address}</p>
                </div>
            )}
        </div>  
    );  
};  

export default OrderConfirmation;
