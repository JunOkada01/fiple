import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShirt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface ProductCardProps {
    id: number;
    productName: string;
    categoryName: string;
    subcategoryName: string;
    price: number;
    imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, productName, categoryName, subcategoryName, price, imageUrl }) => {
    const [isFavorited, setIsFavorited] = useState(false); // お気に入り状態の管理

    // お気に入り追加処理
    const handleFavoriteClick = async (event: React.MouseEvent) => {
        event.stopPropagation(); // クリックイベントの伝播を防ぐ
        const token = localStorage.getItem('access_token'); // トークンをlocalStorageから取得
        if (!token) {
            alert('ログインが必要です。');
            return;
        }

        try {
            if (isFavorited) {
                // お気に入り解除処理
                await axios.delete(`http://localhost:8000/api/favorites/delete/${id}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setIsFavorited(false);
                alert('商品がお気に入りから削除されました！');
            } else {
                // お気に入り追加処理
                await axios.post(
                    'http://localhost:8000/api/favorites/add/',  // お気に入り追加APIのURL
                    { product_id: id },  // リクエストデータ
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,  // 認証トークンをヘッダーに追加
                        },
                    }
                );
                setIsFavorited(true);
                alert('商品がお気に入りに追加されました！');
            }
        } catch (error) {
            console.error('お気に入り操作エラー:', error);
            alert('お気に入りの操作に失敗しました。');
        }
    };

    return (
        <div className="bg-white rounded-sm border border-gray-200 w-full sm:max-w-[200px] md:max-w-[250px] lg:max-w-sm mx-auto">
            <Link href={`/products/${id}`}>
                <div className="relative w-full aspect-[3/4]">
                    <Image 
                        src={imageUrl}
                        alt={`${productName} の画像`} 
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
            </Link>
            <div className="p-4">
                <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-xs sm:text-[10px]">{`${categoryName} / ${subcategoryName}`}</p>
                </div>
                <p className="text-gray-900 text-base sm:text-lg mt-1">¥{price.toLocaleString()}</p>

                <div className="flex justify-end mt-2 space-x-10 sm:space-x-16 lg:space-x-20">
                    <div 
                        onClick={(event) => event.stopPropagation()} // ここで試着ボタンの動作を追加することができます
                        className={`cursor-pointer transition-all duration-150 text-gray-300 hover:text-gray-200`}
                    >
                        <FontAwesomeIcon 
                            icon={faShirt} 
                            className="text-md transition-all duration-150" 
                        />
                    </div>

                    <div 
                        onClick={handleFavoriteClick} 
                        className={`cursor-pointer transition-all duration-150 ${isFavorited ? 'text-red-500' : 'text-red-300 hover:text-red-200'}`}
                    >
                        <FontAwesomeIcon 
                            icon={faHeart} 
                            className="text-md transition-all duration-150" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
