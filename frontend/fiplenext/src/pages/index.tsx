import { GetServerSideProps } from 'next';
import ProductCard from '../components/ProductCard'; // ProductCardをインポート
import React, { useState } from 'react';
// import ProductCard from '@styles/components/ProductCard';
// import MannequinModel from '../components/MannequinModel';
import styles from '../styles/Home.module.css';
import dynamic from 'next/dynamic';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
interface Product {
    id: number;
    category: {
      id: number;
      category_name: string;
    };
    price: number;
    images: {
      id: number;
      image: string;
      image_description: string;
    }[];
}
  
interface ProductListProps {
    products: Product[];
}

const MannequinModel = dynamic(() => import('../components/MannequinModel'), {
    ssr: false
})
  
interface CartItem {
    id: number;
    name: string;
    price: number;
}

export const getServerSideProps: GetServerSideProps<ProductListProps> = async () => {
  const res = await fetch('http://127.0.0.1:8000/api/products/');
  const products = await res.json();


  return {
    props: {
    products,
    },
  };
}



export default function ProductList({ products }: ProductListProps) {
  const [height, setHeight] = useState<number>(180); // デフォルト身長
  const [weight, setWeight] = useState<number>(70); // デフォルト体重
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, name: 'Tシャツ', price: 3000 },
    { id: 2, name: 'ジーンズ', price: 5000 },
    ]);
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
      {/* 身長と体重入力フォーム */}
      <div className="flex justify-center items-center my-8">
        <label className="mr-4">身長 (cm):</label>
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          className="border px-2 py-1"
        />
        <label className="mx-4">体重 (kg):</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="border px-2 py-1"
        />
      </div>

      {/* 性別カテゴリメニュー */}
      <AllMensLeadiesKidsFilter />

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
            <div className="flex justify-center items-center flex-col">
                <div className="flex flex-col space-y-6">
                <p className="text-lg text-center">カテゴリ名</p>
                    <div className="flex overflow-x-auto max-w-[800px] gap-3 p-2 scrollbar-hide">
                        {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            categoryName={product.category.category_name}
                            price={product.price}
                            imageUrl={`http://127.0.0.1:8000/${product.images[0]?.image}`} // 画像のURLを設定
                        />
                        ))}
                    </div>
                </div>
            </div>
        </div>
        {/* 右側: マネキンエリアとカート */}
        <div className={`${styles.sideSection} flex flex-col`}>
          {/* マネキンエリア */}
          <div className={styles.mannequinArea} style={{ height: '300px', width: '100%' }}>
            <MannequinModel height={height} weight={weight} />
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
}
