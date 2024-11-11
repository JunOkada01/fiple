import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutPage = () => {
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    const response = await axios.post('/api/create-checkout-session');
    const { id } = response.data;

    await stripe?.redirectToCheckout({ sessionId: id });
  };

  return (
    <div>
      <h1>商品を購入する</h1>
      <p>※テスト決済 2000円</p>
      <button onClick={handleCheckout}>購入</button>
    </div>
  );
};

export default CheckoutPage;
