import type { NextApiRequest, NextApiResponse } from 'next';

const PIXELCUT_API_URL = 'https://api.developer.pixelcut.ai/v1/remove-background';
const API_KEY = process.env.PIXELCUT_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
        res.status(400).json({ message: 'Image URL is required' });
        return;
    }

    try {
        const response = await fetch(PIXELCUT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-API-KEY': API_KEY!,
            },
            body: JSON.stringify({
                image_url: imageUrl,
                format: 'png',
            }),
        });

        if (!response.ok) {
            throw new Error(`Pixelcut API Error: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
