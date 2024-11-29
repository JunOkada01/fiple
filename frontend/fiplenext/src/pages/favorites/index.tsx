import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Router from 'next/router';
import ProductCard from '../../components/ProductCard'; // ProductCardをインポート
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

interface FavoriteItem {
    id: number;
    product: {
        id: number;
        product_origin: {
            id: number;
            product_name: string;
            category: {
                category_name: string;
            };
            subcategory: {
                subcategory_name: string;
            };
        };
        price: number;
        images: {
            id: number;
            image: string;
            image_description: string;
        }[];
        size: {
            id: number;
            size_name: string;
            order: number;
        }[];
    };
}

const FavoriteList: React.FC = () => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        Router.push({
        pathname: '/accounts/login',
        query: { 
            error: 'authentication', 
            message: 'セッションが期限切れです。再度ログインしてください。' 
        }
        });
        return;
    }

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

    return (
        <div className="container mx-auto max-w-screen-xl px-4">
            <h1 className="text-3xl text-center my-8">YOUR LIKED ITEMS</h1>
            <p className="text-center mb-8">お気に入りのアイテムをたくさん追加しましょう！</p>

            <div className="flex flex-col items-center">
                {favorites.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64">
                        <p className="text-gray-400 text-center text-lg">お気に入り商品がありません</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-4">
                        {favorites.map((favorite) => (
                            <div key={favorite.id}>
                                <ProductCard
                                    id={favorite.product.product_origin.id}
                                    product_id={favorite.product.id}
                                    productName={favorite.product.product_origin.product_name} // 商品名を渡す
                                    categoryName={favorite.product.product_origin.category.category_name}
                                    subcategoryName={favorite.product.product_origin.subcategory.subcategory_name}
                                    price={favorite.product.price}
                                    imageUrl={favorite.product.images[0]?.image}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteList;
