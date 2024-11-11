import ProductCard from '@styles/components/ProductCard';
import React, { useState } from 'react';
import styles from '../../styles/category.module.css';
import CategorySideMenu from '../../components/CategorySideMenu';
import GenderHeaderMenu from '../../components/GenderHeaderMenu';

interface CartItem {
  id: number;
  name: string;
  price: number;
}

const CategoryTop: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: 'Tシャツ', price: 3000 },
    { id: 2, name: 'ジーンズ', price: 5000 },
  ]);

  // 表示する商品データを定義
  const products = [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' },
    { id: 3, name: 'Product 3' },
    { id: 4, name: 'Product 4' },
    { id: 5, name: 'Product 5' },
    { id: 6, name: 'Product 6' },
    { id: 7, name: 'Product 7' },
    { id: 8, name: 'Product 8' },
    { id: 9, name: 'Product 9' },
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
    <div className="container mx-auto max-w-screen-xl px-4">
      <GenderHeaderMenu />

      <div className="flex">
        <CategorySideMenu />
      
        <div className="w-3/4">
          <div className="flex flex-col space-y-6">
            <p className="text-lg text-center">カテゴリー別一覧</p>
            <div className="flex overflow-x-auto max-w-[670px] gap-2 p-2 scrollbar-hide">
              {products.map(product => (
                <ProductCard key={product.id} />
              ))}
            </div>
          </div>

          {/* 他のカテゴリも同様に表示 */}
          {[1, 2, 3].map(categoryId => (
            <div key={categoryId} className="flex flex-col space-y-6 mt-10">
              <p className="text-lg text-center">カテゴリ名</p>
              <div className="flex overflow-x-auto max-w-[670px] gap-2 p-2 scrollbar-hide">
                {products.map(product => (
                  <ProductCard key={`${categoryId}-${product.id}`} />
                ))}
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
};

export default CategoryTop;
