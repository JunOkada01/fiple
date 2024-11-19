import { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  clientSecret: string;
  items: CartItem[];
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, items }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("支払いが完了しました");
          break;
        case "processing":
          setMessage("支払いを処理中です");
          break;
        case "requires_payment_method":
          setMessage("お支払い方法を選択してください");
          break;
        default:
          setMessage("エラーが発生しました");
          break;
      }
    });
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    if (selectedPaymentMethod === 'external_paypay') {
      try {
        const response = await fetch("/api/create-paypay-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
        const { url } = await response.json();
        window.location.href = url;
      } catch (error) {
        setMessage("PayPay決済の初期化に失敗しました");
      }
    } else {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/complete`,
        },
      });

      if (error) {
        setMessage(error.message || "エラーが発生しました");
      }
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
    paymentMethodOrder: ['card', 'external_paypay', 'konbini']
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement 
        id="payment-element" 
        options={paymentElementOptions}
        onChange={(event) => {
          setSelectedPaymentMethod(event?.value?.type);
        }}
      />
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
      >
        {isLoading ? "処理中..." : "支払う"}
      </button>
      {message && <div id="payment-message" className="mt-4 text-red-500">{message}</div>}
    </form>
  );
};

export default CheckoutForm;