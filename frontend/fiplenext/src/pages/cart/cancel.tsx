import { useEffect } from 'react';
import { useRouter } from 'next/router';

const PaymentCancelPage = () => {
  const router = useRouter();

  useEffect(() => {
    // キャンセル時の処理
    const handleCancel = async () => {
      // 必要に応じてキャンセル処理を実行
      router.push('/cart');
    };

    handleCancel();
  }, []);

  return (
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold mb-4">決済がキャンセルされました</h1>
      <p>カートページに戻ります...</p>
    </div>
  );
};

export default PaymentCancelPage;
