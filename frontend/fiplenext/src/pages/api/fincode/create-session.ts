import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const FINCODE_API_URL = 'https://api.test.fincode.jp/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const sessionData = req.body;

    // セッション作成APIの呼び出し
    const response = await axios.post(
      `${FINCODE_API_URL}/sessions`,
      sessionData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FINCODE_SECRET_KEY}`,
          'X-MERCHANT-ID': process.env.FINCODE_MERCHANT_ID
        }
      }
    );

    // セッション情報を返却
    return res.status(200).json({
      session_id: response.data.id,
      link_url: response.data.link_url
    });
  } catch (error: any) {
    console.error('Session creation error:', error.response?.data || error);
    return res.status(500).json({ 
      message: '決済セッションの作成に失敗しました',
      error: error.response?.data || error.message 
    });
  }
}