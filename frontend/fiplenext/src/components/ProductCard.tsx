import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShirt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface ProductCardProps {
    id: number;
    categoryName: string;
    price: number;
    imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, categoryName, price, imageUrl }) => {
    const [isFavorited, setIsFavorited] = useState(false); // お気に入り状態の管理

    // お気に入り追加処理
    const handleFavoriteClick = async () => {
        try {
            const token = localStorage.getItem('access_token'); // トークンをlocalStorageから取得
            if (!token) {
                alert('ログインが必要です。');
                return;
            }

            const response = await axios.post(
                'http://localhost:8000/api/favorites/add/',  // お気に入り追加APIのURL
                { product_id: id },  // リクエストデータ
                {
                    headers: {
                        Authorization: `Bearer ${token}`,  // 認証トークンをヘッダーに追加
                    },
                }
            );

            // 成功した場合、お気に入り状態を更新
            setIsFavorited(true);
            alert('商品がお気に入りに追加されました！');
        } catch (error) {
            console.error('お気に入り追加エラー:', error);
            alert('お気に入りの追加に失敗しました。');
        }
    };

    return (
        <Link href={`/products/${id}`}>
            <div className="bg-white rounded-sm shadow-lg p-0 w-[170px]">
                <img
                    src={imageUrl}
                    alt="商品画像"
                    className="w-full aspect-[3/4] object-cover shadow-md rounded-t-md"
                />
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-500 text-sm">{categoryName}</p>
                    </div>
                    <p className="text-gray-900 text-xl mt-1">¥{price.toLocaleString()}</p>
                    <div className="flex justify-end mt-2">
                        <button className="text-gray-800 font-bold py-2 px-4 rounded">
                            <FontAwesomeIcon icon={faShirt} />
                        </button>
                        <button
                            className={`${
                                isFavorited ? 'bg-red-500' : 'bg-gray-200'
                            } text-gray-800 font-bold py-2 px-4 rounded ml-2`}
                            onClick={handleFavoriteClick} // ボタンクリック時にお気に入り追加
                        >
                            <FontAwesomeIcon icon={faHeart} />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
