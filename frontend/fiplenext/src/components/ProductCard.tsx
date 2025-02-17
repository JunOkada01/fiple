import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShirt } from '@fortawesome/free-solid-svg-icons';
// import { color } from 'framer-motion';

interface ProductCardProps {
    id: number;
    product_id: number;
    productName: string;
    categoryName: string;
    categoryPosition: string;
    subcategoryName: string;
    price: number;
    imageUrl: string;
}
interface FavoriteResponse {
  id: number;
  product: {
      id: number;
  };
}

interface FittingItem {
  id: number;
  product_id: number;
  productName: string;
  price: number;
  categoryName: string;
  categoryPosition: string;
  subcategoryName: string;
  imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, productName, product_id, categoryName, categoryPosition, subcategoryName, price, imageUrl}) => {
    /* 現在の商品が試着されているのかを示す */
    const [isTryingOn, setIsTryingOn] = useState(false);
    /* 現在の商品がお気に入り登録されているかの状態を示す ＋ 登録された際にIDを返す */
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState<number | null>(null);
    /* 通知 */
    const [notification, setNotification] = useState<string | null>(null);
    // const [selectedColor, setSelectedColor] = useState<number | null>(null); // 選択中のカラーID
    // const [selectedSize, setSelectedSize] = useState<number | null>(null);   // 選択中のサイズID
    // 試着中の商品リストをセッションに保存
    const updateSessionFittingItems = (items: FittingItem[]) => {
        sessionStorage.setItem("fittingItems", JSON.stringify(items));
    };
    // 試着中の商品リストをセッションから取得
    const getSessionFittingItems = (): FittingItem[] => {
        const items = sessionStorage.getItem("fittingItems");
        console.log('ローカルストレージ', items)
        return items ? JSON.parse(items) : [];
    };
    // 試着ボタンを切り替え
    const toggleTryingOn = async () => {
        const currentItems = getSessionFittingItems();
        
        if (isTryingOn) {
            const updatedItems = currentItems.filter((item) => item.product_id !== product_id);
            updateSessionFittingItems(updatedItems);
            setIsTryingOn(false);
        } else {
            try {
                // product_origin_idを使用して商品を追加
                const newItem = {
                    id: id, // product_origin_id
                    product_id: product_id, // product_idを使用
                    productName,
                    price,
                    categoryName,
                    categoryPosition,
                    subcategoryName,
                    imageUrl,
                };
                
                const existingIndex = currentItems.findIndex(item => 
                    item.categoryName === newItem.categoryName
                );
                
                if (existingIndex !== -1) {
                    const updatedItems = [...currentItems];
                    updatedItems[existingIndex] = newItem;
                    updateSessionFittingItems(updatedItems);
                    setNotification(`${newItem.categoryName}の試着中商品を更新しました`);
                } else {
                    updateSessionFittingItems([...currentItems, newItem]);
                    setNotification('試着しました');
                }
                setIsTryingOn(true);
            } catch (error) {
                console.error('Failed to add item to fitting:', error);
                setNotification('商品の追加に失敗しました');
            }
        }
        setTimeout(() => setNotification(null), 3000);
    };
    // コンポーネントマウント時に現在の試着状態を確認
    useEffect(() => {
        const currentItems = getSessionFittingItems();
        setIsTryingOn(currentItems.some((item) => item.product_id === product_id));
    }, [id]);
    // 試着中リストが変更されるたびに更新
    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentItems = getSessionFittingItems();
            // 試着中リストが変更された場合に状態を更新
            setIsTryingOn(currentItems.some((item) => item.product_id === product_id));
        }, 500); // 500msごとに更新をチェック（状況に応じて調整）

        // クリーンアップ
        return () => clearInterval(intervalId);
    }, [id]);

    // コンポーネントマウント時にお気に入り状態を確認
    useEffect(() => {
        checkFavoriteStatus();
    }, [id]);
    // お気に入り状態の確認
    const checkFavoriteStatus = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
        const response = await axios.get('http://13.216.135.244:8000/api/favorites/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const favorite = response.data.find(
            (fav: FavoriteResponse) => fav.product.id === product_id
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
                await axios.delete(`http://13.216.135.244:8000/api/favorites/delete/${favoriteId}/`, {
                headers: { Authorization: `Bearer ${token}` }
                });
                setIsFavorite(false);
                setFavoriteId(null);
                setNotification('お気に入りから削除しました');
            } else {
                // お気に入り登録
                const response = await axios.post(
                'http://13.216.135.244:8000/api/favorites/add/',
                { product_id: product_id},
                { headers: { Authorization: `Bearer ${token}` } }
                );
                setIsFavorite(true);
                setFavoriteId(response.data.id);
                setNotification('お気に入りに追加しました');
            }
            // 通知を非表示にする
            setTimeout(() => setNotification(null), 3000);
            } catch (error) {
        console.error('お気に入りの切り替えに失敗しました', error);
        alert('操作に失敗しました。もう一度お試しください。');
        }
    };

    return (
        <div className="bg-white rounded-sm border border-gray-200 w-full sm:max-w-[200px] md:max-w-[250px] lg:max-w-sm mx-auto">
            {/* 通知メッセージ */}
            {notification && (
                <div 
                    className={`fixed top-4 left-1/2 transform -translate-x-1/2 py-3 px-6 rounded-md shadow-lg transition-all duration-500 ease-out opacity-100
                        ${notification.includes('追加') ? 'bg-blue-400 text-white' : 'bg-red-400 text-white'}`}
                >
                    <p className="font-medium">{notification}</p>
                </div>
            )}

            <Link href={`/products/${id}`}>
                <div className="relative w-full h-auto aspect-[3/4] overflow-hidden">
                    <Image 
                        src={imageUrl}
                        alt={`${productName} の画像`} 
                        layout="fill"
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="transition-transform duration-300 ease-in-out hover:scale-110"
                        priority
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
                        className={`cursor-pointer transition-all duration-150 transform ${isTryingOn ? 'text-black' : 'text-gray-300 hover:text-gray-200'} 
                            hover:scale-105 active:scale-125`}
                    >
                        <FontAwesomeIcon 
                            icon={faShirt} 
                            className="text-md transition-all duration-150" 
                        />
                    </div>

                    <div 
                        onClick={(e) => {e.preventDefault(); toggleFavorite();}}
                        className={`cursor-pointer transition-all duration-150 transform ${isFavorite ? 'text-red-500' : 'text-red-300 hover:text-red-200'}
                            hover:scale-105 active:scale-125`}
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