import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-10-28.acacia',
    });

    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { items } = req.body;

        // カート内の商品をStripeのline_itemsに変換
        interface Item {
            product: {
                product_origin: {
                    product_name: string;
                };
                color?: {
                    color_name: string;
                };
                size?: {
                    size_name: string;
                };
                price: number;
            };
            quantity: number;
        }

        const line_items = items.map((item: Item) => ({
        price_data: {
            currency: 'jpy',
            product_data: {
            name: item.product.product_origin.product_name,
            description: `カラー: ${item.product.color?.color_name}, サイズ: ${item.product.size?.size_name}`,
            },
            unit_amount: item.product.price,
        },
        quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${req.headers.origin}/cart/complete`,
        cancel_url: `${req.headers.origin}/cancel`,
        metadata: {
            order_id: Date.now().toString(),
        },
        });

        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error('Checkout session creation failed:', error);
        res.status(500).json({ error: 'Payment initiation failed' });
  }
}