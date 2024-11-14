import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import Link from 'next/link';
 
interface ProductCardProps {
  id: number;
  product_id: number;
  productName: string;
  categoryName: string;
  subcategoryName: string;
  price: number;
  imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  product_id,
  productName,
  categoryName,
  subcategoryName,
  price,
  imageUrl,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);

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
        (fav: any) => fav.product.id === product_id
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
          { product_id: product_id },
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
    <div className="relative w-64 bg-white rounded-lg shadow">
      <Link href={`/products/${id}`}>
        <div className="w-full h-64 overflow-hidden rounded-t-lg">
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite();
        }}
        className="absolute top-2 right-2 p-2 text-2xl transition-colors duration-200"
      >
        <FontAwesomeIcon
          icon={isFavorite ? solidHeart : regularHeart}
          className={`${
            isFavorite 
              ? 'text-red-500 animate-pulse' 
              : 'text-gray-400 hover:text-red-500'
          }`}
        />
      </button>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700">{categoryName}</h3>
        <p className="text-xs text-gray-500">{subcategoryName}</p>
        <p className="mt-2 text-lg font-bold">¥{price.toLocaleString()}</p>
      </div>
    </div>
  );
};
 
export default ProductCard;