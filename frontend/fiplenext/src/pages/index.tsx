import { GetServerSideProps } from 'next';
import styles from '../styles/Home.module.css';
import dynamic from 'next/dynamic';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React, { useState } from 'react';
import ProductCard from '../components/ProductCard'; // ProductCardをインポート
import FittingArea from '../components/VrFitting';


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

interface ProductListProps {
  products: Product[];
}

interface FittingItem {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}


const MannequinModel = dynamic(() => import('../components/MannequinModel'), {
    ssr: false
})

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
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      {/* 性別カテゴリメニュー */}
      <ul className="flex justify-center items-center my-12">
        <li className="px-4 border-l border-r border-gray-300">ALL</li>
        <li className="px-4 border-l border-r border-gray-300">MENS</li>
        <li className="px-4 border-l border-r border-gray-300">LADIES</li>
        <li className="px-4 border-l border-r border-gray-300">KIDS</li>
      </ul>

      {/* 商品リスト */}
      <div className="flex justify-center items-center flex-col">
        <div className="flex flex-col space-y-6">
          <p className="text-lg text-center">カテゴリ名</p>
          <div className="flex overflow-x-auto max-w-[800px] gap-3 p-2 scrollbar-hide">
            {products.map((product) => (
              <ProductCard 
                id={product.product_origin_id}
                product_id={product.id}
                productName=''
                categoryName={product.category.category_name}
                subcategoryName={product.subcategory.subcategory_name}
                price={product.price}
                imageUrl={`http://127.0.0.1:8000/${product.images[0]?.image}`} // 画像のURLを設定
              />
            ))}
          </div>
        </div>
      </div>
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
