import ProductCard from '@styles/components/ProductCard';
import React, { useState } from 'react';
import styles from '../styles/Home.module.css'; // CSSモジュールをインポート

interface CartItem {
  id: number;
  name: string;
  price: number;
}

const Home: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: 'Tシャツ', price: 3000 },
    { id: 2, name: 'ジーンズ', price: 5000 },
  ]);

  const removeItemFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleAddToCart = () => {
    // 商品をカートに追加する処理をここに実装
    console.log('商品をカートに追加');
  };

  const handleAddToFavorites = () => {
    // 商品をお気に入りに追加する処理をここに実装
    console.log('商品をお気に入りに追加');
  };

  return (
    <div className="container mx-auto max-w-screen-xl px-4">
      {/* 性別カテゴリメニュー */}
      <ul className="flex justify-center items-center my-12">
        <li className="px-4 border-l border-r border-gray-300">ALL</li>
        <li className="px-4 border-l border-r border-gray-300">MENS</li>
        <li className="px-4 border-l border-r border-gray-300">LADIES</li>
        <li className="px-4 border-l border-r border-gray-300">KIDS</li>
      </ul>

      <div className="flex justify-between">
        {/* 左側: カテゴリと商品リスト */}
        <div className="flex w-4/5">
          {/* カテゴリリスト */}
          <div className="w-1/4 pr-4">
            <h2 className="text-lg text-center mb-4">カテゴリ</h2>
            <ul className="flex flex-col space-y-2">
              <li className="px-4 border border-gray-300">トップス</li>
              <li className="px-4 border border-gray-300">ボトムス</li>
              <li className="px-4 border border-gray-300">アウター</li>
              <li className="px-4 border border-gray-300">アクセサリー</li>
            </ul>
          </div>

          {/* 商品リスト */}
          <div className="w-3/4">
            <div className="flex flex-col space-y-6">
              <p className="text-lg text-center">商品一覧</p>
              <div className="flex overflow-x-auto max-w-[670px] gap-2 p-2 scrollbar-hide">
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
              </div>
            </div>

            {/* 他のカテゴリも同様に表示 */}
            <div className="flex flex-col space-y-6 mt-10">
              <p className="text-lg text-center">カテゴリ名</p>
              <div className="flex overflow-x-auto max-w-[670px] gap-2 p-2 scrollbar-hide">
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
              </div>
            </div>

            <div className="flex flex-col space-y-6 mt-10">
              <p className="text-lg text-center">カテゴリ名</p>
              <div className="flex overflow-x-auto max-w-[670px] gap-2 p-2 scrollbar-hide">
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
              </div>
            </div>
          </div>
        </div>

        {/* 右側: マネキンエリアとカート */}
        <div className={`${styles.sideSection} flex flex-col`}>
          {/* マネキンエリア */}
          <div className={styles.mannequinArea}>
            <p>マネキンをここに表示</p>
          </div>

          {/* ボタンエリア */}
          <div className="flex justify-between mb-4 border-t border-b border-gray-300 py-2">

            <button
              className="text-black px-4 py-2 rounded"
              onClick={handleAddToFavorites}
            >
              ♡
            </button>
            <button
              className="text-black px-4 py-2 rounded"
              onClick={handleAddToCart}
            >
              カートに入れる
            </button>
            
          </div>

          {/* カートエリア */}
          <div className={styles.cartArea}>
            <h2 className={styles.cartTitle}>カートに入れた商品</h2>
            {cartItems.length > 0 ? (
              <ul>
                {cartItems.map(item => (
                  <li key={item.id} className={styles.cartItem}>
                    <span>{item.name}</span>
                    <span>¥{item.price}</span>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeItemFromCart(item.id)}
                    >
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

export default Home;