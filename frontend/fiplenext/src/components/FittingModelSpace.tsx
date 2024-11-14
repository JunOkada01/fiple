import styles from '../../styles/Home.module.css';
import React, { useState } from 'react';
import ProductCard from '@styles/components/ProductCard'; // これを使う場合は、ProductCardコンポーネントの実装を確認してください。
import Link from 'next/link';

interface CartItem {
  id: number;
  name: string;
  price: number;
}

const FittingModelSpace: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: 'Tシャツ', price: 3000 },
    { id: 2, name: 'ジーンズ', price: 5000 },
  ]);

  // 表示する商品データを定義
  const products = [
    { id: 1, name: 'Product 1', price: 1000 },
    { id: 2, name: 'Product 2', price: 2000 },
    { id: 3, name: 'Product 3', price: 3000 },
    { id: 4, name: 'Product 4', price: 4000 },
    { id: 5, name: 'Product 5', price: 5000 },
    { id: 6, name: 'Product 6', price: 6000 },
    { id: 7, name: 'Product 7', price: 7000 },
    { id: 8, name: 'Product 8', price: 8000 },
    { id: 9, name: 'Product 9', price: 9000 },
  ];

  const removeItemFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleAddToCart = () => {
    console.log('商品をカートに追加');
  };

  const handleAddToFavorites = () => {
    console.log('商品をお気に入りに追加');
  };

  return (
    <div className={`${styles.sideSection} flex flex-col`}>
      <div className={styles.mannequinArea}>
        <p>マネキンをここに表示</p>
      </div>

      <div className="flex justify-between mb-4 border-t border-b border-gray-300 py-2">
        <button className="text-black px-4 py-2 rounded" onClick={handleAddToFavorites}>
          ♡
        </button>
        <button className="text-black px-4 py-2 rounded" onClick={handleAddToCart}>
          カートに入れる
        </button>
      </div>

      <div className={styles.cartArea}>
        <h2 className={styles.cartTitle}>カートに入れた商品</h2>
        {cartItems.length > 0 ? (
          <ul>
            {cartItems.map(item => (
              <li key={item.id} className={styles.cartItem}>
                <span>{item.name}</span>
                <span>¥{item.price}</span>
                <button className={styles.removeButton} onClick={() => removeItemFromCart(item.id)}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>カートは空です</p>
        )}
      </div>
    </div>
  );
};

export default FittingModelSpace;
