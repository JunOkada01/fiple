import ProductCard from '@styles/components/ProductCard';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React, { useEffect, useState } from 'react';  
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import SideMenu from '@styles/components/SideMenu';
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
  sizes: {
    id: number;
    size_name: string;
    order: number;
  }[];
  colors: {
    id: number;
    color_name: string;
    color_code: string;
  }[];
}

// カテゴリの型を定義
interface Category {
  id: number;
  category_name: string;
  subcategories: { id: number; subcategory_name: string }[];  // サブカテゴリも含める場合
}

interface ProductListProps {
  products: Product[];
  categories: Category[];
}

export const getServerSideProps: GetServerSideProps<ProductListProps> = async () => {
  const res = await fetch('http://127.0.0.1:8000/api/products/');
  const products = await res.json();
  const resCategories = await fetch('http://127.0.0.1:8000/api/categories/'); // カテゴリデータを取得
  const categories = await resCategories.json(); // 取得したカテゴリデータ

  return {
    props: {
      categories,
      products,
    },
  };
}

export default function ProductList({ products }: ProductListProps) {
  // カテゴリごとに商品をグループ化
  const categoriesMap: { [key: string]: Product[] } = {};

  products.forEach(product => {
    const categoryName = product.category.category_name;
    if (!categoriesMap[categoryName]) {
      categoriesMap[categoryName] = [];
    }
    categoriesMap[categoryName].push(product);
  });
  
  /*
      サイドバー
      <div className="">
        <SideMenu categories={categories} />
      </div>
  */
  return (  
    <div className="container mx-auto max-w-screen-xl px-4">
      {/* 性別カテゴリメニュー */}
      <AllMensLeadiesKidsFilter />
      {/* その他のコンテンツ */}
      <div className="flex justify-center items-center flex-col">
        {Object.keys(categoriesMap).map(categoryName => (
          <div key={categoryName} className="flex flex-col space-y-5 mt-5">  
            <h1 className="text-xl text-center">{categoryName}</h1>  
            {/* 商品カードのスクロールリスト（レスポンシブ対応） */}
            <div className="flex overflow-x-auto max-w-full gap-4 scrollbar-hide">
              <div className="flex space-x-4 max-w-[700px]"> {/* 商品カードの親要素 */}
                {categoriesMap[categoryName].slice(0, 20).map(product => (
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
            <div className="text-center m-4">
              <Link href={`/products/category/${encodeURIComponent(categoryName)}`}>
                <button className="relative border border-black px-6 py-2 my-5 overflow-hidden group">
                  <span className="absolute inset-0 bg-black transform -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0"></span>
                  <span className="relative text-black transition-colors duration-300 ease-in-out group-hover:text-white">
                    VIEW MORE
                  </span>
                </button>
              </Link>
            </div>
          </div>
        ))}
        
        {/* 右側: FittingArea コンポーネント */}
        <FittingArea/>
      </div>
    </div>
  );
};