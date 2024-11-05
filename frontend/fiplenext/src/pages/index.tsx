import ProductCard from '@styles/components/ProductCard';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React, { useEffect, useState } from 'react';  
import Link from 'next/link';
import { GetServerSideProps } from 'next';

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

      {/* 商品リスト */}  
      <div className="flex justify-center items-center flex-col">  
        {Object.keys(categoriesMap).map(categoryName => (
          <div key={categoryName} className="flex flex-col space-y-6 mt-5">  
            <p className="text-xl text-center">{categoryName}</p>  
            <div className="flex overflow-x-auto max-w-full gap-4 scrollbar-hide">  
              <div className="flex space-x-4 max-w-[700px]"> {/* 商品カードの親要素 */}
                {categoriesMap[categoryName].map(product => (
                  <ProductCard 
                    key={product.id}
                    id={product.product_origin_id}
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
            <Link href={`/products/category/${encodeURIComponent(categoryName)}`} className="text-black underline text-right">
              もっと見る
            </Link>
          </div>
        ))}
      </div>  
    </div>  
  );  
};