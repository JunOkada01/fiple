// import ProductCard from '@styles/components/ProductCard';  
// import React from 'react';  


// const Favorites: React.FC = () => {  
//     return (  
//         <div className="container mx-auto max-w-screen-xl px-4">  
//         <h1 className="text-3xl font-bold text-center my-8">YOUR LIKED ITEMS</h1>  
        
//         <div className="flex flex-col items-center">  
//             <div className="grid grid-cols-5 gap-4 max-w-full">  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             <ProductCard />  
//             </div>  
//         </div>  
//         </div>  
//     );  
// };  

// export default Favorites;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

interface FavoriteItem {
  id: number;
  product: {
    id: number;
    product_origin: {
      product_name: string;
    };
    price: number;
    images: {
        id: number;
        image: string;
        image_description: string;
    }[];
  };
}

const FavoriteList: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('ログインが必要です。');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/api/favorites/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(response.data);
      } catch (error) {
        console.error('お気に入りの取得に失敗しました', error);
      }
    };

    fetchFavorites();
  }, []);

  // お気に入り削除処理
  const handleDeleteFavorite = async (favoriteId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('ログインが必要です。');
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/favorites/delete/${favoriteId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites(favorites.filter((favorite) => favorite.id !== favoriteId)); // 削除後、一覧を更新
    } catch (error) {
      console.error('お気に入りの削除に失敗しました', error);
    }
  };

  return (
    <div>
      <h1>お気に入り一覧</h1>
      <div>
        {favorites.length === 0 ? (
          <p>お気に入りに商品がありません。</p>
        ) : (
          favorites.map((favorite) => (
            <div key={favorite.id} className="favorite-item">
              <img src={`${favorite.product.images[0]?.image}`} alt={favorite.product.product_origin.product_name} />
              <h3>{favorite.product.product_origin.product_name}</h3>
              <p>¥{favorite.product.price.toLocaleString()}</p>
              <button onClick={() => handleDeleteFavorite(favorite.id)}>
                <FontAwesomeIcon icon={faHeart} />
                削除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FavoriteList;
