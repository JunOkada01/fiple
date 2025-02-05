import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SizeRecommendation = ({ productId }) => {
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendation = async () => {
            const access_token = localStorage.getItem('access_token');
            if (!access_token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/products/${productId}/size-recommendation/`,
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    }
                );

                if (response.data.recommended_size) {
                    setRecommendation(response.data.recommended_size);
                }
            } catch (error) {
                console.log(error);
                // setError('サイズの推奨を取得できませんでした');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendation();
    }, [productId]);

    if (loading) return null;
    if (error) return null;
    if (!recommendation) return null;

    return (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
                <span className="text-blue-600 font-medium">
                    あなたにおすすめのサイズは「{recommendation}」です
                </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
                ※同じような体格のユーザーのレビューを基に算出しています
            </p>
        </div>
    );
};

export default SizeRecommendation;