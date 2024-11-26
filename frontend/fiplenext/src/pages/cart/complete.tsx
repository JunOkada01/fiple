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
        const { sessionId } = router.query;
    
        const completeOrder = async () => {
          if (sessionId) {
            try {
              const response = await axios.post('http://localhost:8000/api/complete-payment/', {
                sessionId: sessionId
              }, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
              });
    
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
        </div>  
    );  
};  

export default OrderConfirmation;
