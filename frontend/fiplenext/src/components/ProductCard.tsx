import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShirt } from '@fortawesome/free-solid-svg-icons';

interface ProductCardProps {
    id: number;
    productName: string;
    categoryName: string;
    subcategoryName: string;
    price: number;
    imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, productName, categoryName, subcategoryName, price, imageUrl }) => {
    const [isTryingOn, setIsTryingOn] = useState(false);
    const toggleTryingOn = () => setIsTryingOn((prev) => !prev);

    /* 現在の商品がお気に入り登録されているかの状態を示す ＋ 登録された際にIDを返す */
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState<number | null>(null);
    //const toggleFavorited = () => setIsFavorited((prev) => !prev);

    // コンポーネントマウント時にお気に入り状態を確認
    useEffect(() => {
        checkFavoriteStatus();
    }, [id]);
    // お気に入り状態の確認
    const checkFavoriteStatus = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
        const response = await axios.get('http://localhost:8000/api/favorites/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const favorite = response.data.find(
            (fav: any) => fav.product.id === id
        );
        
        if (favorite) {
            setIsFavorite(true);
            setFavoriteId(favorite.id);
        }
        } catch (error) {
        console.error('お気に入り状態の確認に失敗しました', error);
        }
    };

    // お気に入り登録・解除の処理
    const toggleFavorite = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
        alert('ログインが必要です。');
        return;
        }

        try {
        if (isFavorite && favoriteId) {
            // お気に入り解除
            await axios.delete(`http://localhost:8000/api/favorites/delete/${favoriteId}/`, {
            headers: { Authorization: `Bearer ${token}` }
            });
            setIsFavorite(false);
            setFavoriteId(null);
        } else {
            // お気に入り登録
            const response = await axios.post(
            'http://localhost:8000/api/favorites/add/',
            { product_id: id },
            { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsFavorite(true);
            setFavoriteId(response.data.id);
        }
        } catch (error) {
        console.error('お気に入りの切り替えに失敗しました', error);
        alert('操作に失敗しました。もう一度お試しください。');
        }
    };

    return (
        <div className="bg-white rounded-sm border border-gray-200 w-full sm:max-w-[200px] md:max-w-[250px] lg:max-w-sm mx-auto">
            <Link href={`/products/${id}`}>
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image 
                        src={imageUrl}
                        alt={`${productName} の画像`} 
                        layout="fill"
                        objectFit="cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority
                        className="transition-transform duration-300 ease-in-out hover:scale-110"
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
                        onClick={toggleTryingOn} 
                        className={`cursor-pointer transition-all duration-150 ${isTryingOn ? 'text-black' : 'text-gray-300 hover:text-gray-200'}`}
                    >
                        <FontAwesomeIcon 
                            icon={faShirt} 
                            className="text-md transition-all duration-150" 
                        />
                    </div>

                    <div 
                        onClick={(e) => {e.preventDefault();toggleFavorite();}}
                        className={`cursor-pointer transition-all duration-150 ${isFavorite ? 'text-red-500' : 'text-red-300 hover:text-red-200'}`}
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
