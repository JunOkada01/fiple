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
import ProductCard from '../components/ProductCard';
import FittingArea from '../components/VrFitting';
import styles from '../styles/Home.module.css';

interface Product {
  id: number;
  product_origin_id: number;
  category: {
    id: number;
    category_name: string;
  };
  subcategory: {
    id: number;
    subcategory_name: string;
  }
  price: number;
  images: {
    id: number;
    image: string;
    image_description: string;
  }[];
}

interface User {
  username: string;
  hurigana: string;
}

interface ProductListProps {
  products: Product[];
  user: User | null;  // ログインユーザー情報を追加
}

export const getServerSideProps: GetServerSideProps<ProductListProps> = async (context) => {
  const res = await fetch('http://127.0.0.1:8000/api/products/');
  const products = await res.json();

  // クッキーからトークンを取得
  const token = context.req.cookies.token; // クッキーに保存されているトークンを取得
  
  const userRes = await fetch('http://127.0.0.1:8000/api/user/profile/', {
    headers: {
      Authorization: `Bearer ${token}`, // トークンをヘッダーに追加
    },
  });

  let user = null;
  if (userRes.ok) {
    user = await userRes.json();
  }

  return {
    props: {
      products,
      user,
    },
  };
};


export default function ProductList({ products, user }: ProductListProps) {
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

  return (
    <div className="container mx-auto max-w-screen-xl px-4">
      {/* ログインユーザーの名前表示 */}
      {user && <p>ようこそ、{user.username}さん</p>}
    
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
                    id={product.product_origin_id}
                    product_id={product.id}
                    productName=''
                    categoryName={product.category.category_name}
                    subcategoryName={product.subcategory.subcategory_name}
                    price={product.price}
                    imageUrl={`http://127.0.0.1:8000/${product.images[0]?.image}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

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
}
