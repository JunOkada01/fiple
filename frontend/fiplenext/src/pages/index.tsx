// import { GetServerSideProps } from 'next';

// import dynamic from 'next/dynamic';
// import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
// import React, { useState } from 'react';
// import ProductCard from '../components/ProductCard'; // ProductCardをインポート
// import FittingArea from '../components/VrFitting';
// import styles from '../styles/Home.module.css';


// interface Product {
//   id: number;
//   product_origin_id: number;
//   category: {
//     id: number;
//     category_name: string;
//   };
//   subcategory: {
//     id: number;
//     subcategory_name: string;
//   }
//   price: number;
//   images: {
//     id: number;
//     image: string;
//     image_description: string;
//   }[];
// }

// interface ProductListProps {
//   products: Product[];
// }

// export const getServerSideProps: GetServerSideProps<ProductListProps> = async () => {
//   const res = await fetch('http://127.0.0.1:8000/api/products/');
//   const products = await res.json();

//   return {
//     props: {
//       products,
//     },
//   };
// }

// export default function ProductList({ products }: ProductListProps) {
//   const [height, setHeight] = useState<number>(180); // デフォルト身長
//   const [weight, setWeight] = useState<number>(70); // デフォルト体重
//   const [fittingItems, setFittingItems] = useState<FittingItem[]>([]);

//   const removeItemFromFitting = (id: number) => {
//     setFittingItems(fittingItems.filter(item => item.id !== id));
//   };

//   const handleAddToCart = () => {
//     console.log('商品をカートに追加');
//   };

//   const handleAddToFavorites = () => {
//     console.log('商品をお気に入りに追加');
//   };
//   return (
//     <div className="container mx-auto max-w-screen-xl px-4">
//       {/* 身長と体重入力フォーム */}
//       <div className="flex justify-center items-center my-8">
//         <label className="mr-4">身長 (cm):</label>
//         <input
//           type="number"
//           value={height}
//           onChange={(e) => setHeight(Number(e.target.value))}
//           className="border px-2 py-1"
//         />
//         <label className="mx-4">体重 (kg):</label>
//         <input
//           type="number"
//           value={weight}
//           onChange={(e) => setWeight(Number(e.target.value))}
//           className="border px-2 py-1"
//         />
//       </div>
    
//       {/* 性別カテゴリメニュー */}
//       <AllMensLeadiesKidsFilter />

//       <div className="flex justify-between">
//         {/* 左側: カテゴリと商品リスト */}
//         <div className="flex w-4/5">
//           {/* カテゴリリスト */}
//           <div className="w-1/4 pr-4">
//             <h2 className="text-lg text-center mb-4">カテゴリ</h2>
//             <ul className="flex flex-col space-y-2">
//               <li className="px-4 border border-gray-300">トップス</li>
//               <li className="px-4 border border-gray-300">ボトムス</li>
//               <li className="px-4 border border-gray-300">アウター</li>
//               <li className="px-4 border border-gray-300">アクセサリー</li>
//             </ul>
//           </div>

//           {/* 商品リスト */}
//           <div className="flex justify-center items-center flex-col">
//             <div className="flex flex-col space-y-6">
//               <p className="text-lg text-center">カテゴリ名</p>
//               <div className="flex overflow-x-auto max-w-[800px] gap-3 p-2 scrollbar-hide">
//                 {products.map((product) => (
//                   <ProductCard
//                     key={product.id}
//                     id={product.product_origin_id}
//                     product_id={product.id}
//                     productName=''
//                     categoryName={product.category.category_name}
//                     subcategoryName={product.subcategory.subcategory_name}
//                     price={product.price}
//                     imageUrl={`http://127.0.0.1:8000/${product.images[0]?.image}`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* 右側: FittingArea コンポーネント */}
//         <FittingArea
//           height={height}
//           weight={weight}
//           fittingItems={fittingItems}
//           onRemoveItem={removeItemFromFitting}
//           onAddToCart={handleAddToCart}
//           onAddToFavorites={handleAddToFavorites}
//         />
//       </div>
      

//     </div>
//   );
// }

import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React, { useEffect, useState } from 'react';  
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import FittingArea from '../components/VrFitting';
import styles from '../styles/Home.module.css'


interface Product {
  id: number;
  product_name: string;
  product_origin_id: number;
  category: {
    id: number;
    category_name: string;
  };
  subcategory: {
    id: number;
    subcategory_name: string;
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

interface FittingItem {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
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
  const [height, setHeight] = useState<number>(180);
  const [weight, setWeight] = useState<number>(70);
  const [fittingItems, setFittingItems] = useState<FittingItem[]>([]);

  const removeItemFromFitting = (id: number) => {
    setFittingItems(fittingItems.filter(item => item.id !== id));
  };

  const handleAddToCart = () => {
    console.log('商品をカートに追加');
  };

  const handleAddToFavorites = () => {
    console.log('商品をお気に入りに追加');
  };

  // カテゴリごとに商品をグループ化
  const categoriesMap: { [key: string]: Product[] } = {};

  products.forEach(product => {
    const categoryName = product.category.category_name;
    if (!categoriesMap[categoryName]) {
      categoriesMap[categoryName] = [];
    }
    categoriesMap[categoryName].push(product);
  });
  
  return (  
    <div className="container mx-auto max-w-screen-xl px-4">  
      {/* 性別カテゴリメニュー */}
      <AllMensLeadiesKidsFilter />
      
      {/* 身長と体重入力フォーム */}
      <div className="flex flex-col sm:flex-row justify-center items-center my-8 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center">
          <label className="mr-4">身長 (cm):</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="border px-2 py-1"
          />
        </div>
        <div className="flex items-center">
          <label className="mx-4">体重 (kg):</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="border px-2 py-1"
          />
        </div>
      </div>
  
      {/* その他のコンテンツ */}
      <div className="flex justify-center items-center flex-col">  
        {Object.keys(categoriesMap).map(categoryName => (
          <div key={categoryName} className="flex flex-col space-y-6 mt-5">  
            <p className="text-xl text-center">{categoryName}</p>  
            
            {/* 商品カードのスクロールリスト（レスポンシブ対応） */}
            <div className="flex overflow-x-auto max-w-full gap-4 scrollbar-hide">
              <div className="flex space-x-4 max-w-[700px]"> {/* 商品カードの親要素 */}
                {categoriesMap[categoryName].map(product => (
                  <ProductCard 
                    key={product.id}
                    id={product.product_origin_id}
                    product_id={product.id}
                    productName={product.product_name}
                    categoryName={product.category.category_name}
                    subcategoryName={product.subcategory.subcategory_name}
                    price={product.price}
                    imageUrl={`http://127.0.0.1:8000/${product.images[0]?.image}`} // 画像のURLを設定
                  />
                ))}
              </div>
            </div>
  
            {/* カテゴリごとの「もっと見る」リンク */}
            <Link href={`/products/category/${encodeURIComponent(categoryName)}`} className="text-right">
              <button>
                もっと見る
              </button>
            </Link>
          </div>
        ))}
        
        {/* 右側: FittingArea コンポーネント */}
        <FittingArea
          height={height}
          weight={weight}
          fittingItems={fittingItems}
          onRemoveItem={removeItemFromFitting}
          onAddToCart={handleAddToCart}
          onAddToFavorites={handleAddToFavorites}
        />
      </div>
    </div>
  );
};