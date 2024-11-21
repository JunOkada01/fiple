import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React, { useEffect, useState } from 'react';  
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import FittingArea from '../components/VrFitting';
import Navigation from '../components/Navigation';
import styles from '../styles/Home.module.css';
import ProductCard from '../components/ProductCard';
import dynamic from 'next/dynamic';

interface Tag {
  id: number;
  tag_name: string;
}

interface ProductTag {
  id: number;
  tag: Tag;
  created_at: string;
  updated_at: string;
}

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
  product_tags: ProductTag[]; // 追加
  images: {
    id: number;
    image: string;
    image_description: string;
  }[];
}

interface ProductListProps {
  initialProducts: Product[];
}

interface FittingItem {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  imageUrl?: string;
}

export const getServerSideProps: GetServerSideProps<ProductListProps> = async () => {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/products/');
    const products = await res.json();

    return {
      props: {
        initialProducts: products,
      },
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      props: {
        initialProducts: [],
      },
    };
  }
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [height, setHeight] = useState<number>(180);
  const [weight, setWeight] = useState<number>(70);
  const [fittingItems, setFittingItems] = useState<FittingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);

  const removeItemFromFitting = (id: number) => {
    setFittingItems(fittingItems.filter(item => item.id !== id));
  };

  const handleAddToCart = () => {
    console.log('商品をカートに追加');
  };

  const handleAddToFavorites = () => {
    console.log('商品をお気に入りに追加');
  };

  // 検索フィルタリング機能を更新
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(initialProducts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = initialProducts.filter(product => {
      // タグでの検索を追加
      const hasMatchingTag = product.product_tags?.some(productTag => 
        productTag.tag.tag_name.toLowerCase().includes(query)
      );

      return (
        // 商品名で検索
        product.product_name.toLowerCase().includes(query) ||
        // カテゴリー名で検索
        product.category.category_name.toLowerCase().includes(query) ||
        // サブカテゴリー名で検索
        product.subcategory.subcategory_name.toLowerCase().includes(query) ||
        // タグで検索
        hasMatchingTag ||
        // 価格で検索（数値の場合）
        (!isNaN(Number(query)) && product.price === Number(query))
      );
    });

    setFilteredProducts(filtered);
  }, [searchQuery, initialProducts]);

  // カテゴリごとに商品をグループ化
  const categoriesMap: { [key: string]: Product[] } = {};
  
  if (Array.isArray(filteredProducts)) {
    filteredProducts.forEach(product => {
      if (product && product.category && product.category.category_name) {
        const categoryName = product.category.category_name;
        if (!categoriesMap[categoryName]) {
          categoriesMap[categoryName] = [];
        }
        categoriesMap[categoryName].push(product);
      }
    });
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-4">
      {/* Navigation コンポーネント */}
      <Navigation onSearch={setSearchQuery} />
      
      {/* 性別カテゴリメニュー */}
      <AllMensLeadiesKidsFilter />
      
      {/* 身長と体重入力フォーム */}
      <div className="flex flex-col sm:flex-row justify-center items-center my-8 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center">
          <label className="text-sm font-medium mr-4">身長 (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-center shadow-sm"
            min="50"
            max="300"
          />
        </div>
        <div className="flex items-center">
          <label className="text-sm font-medium mx-4">体重 (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-center shadow-sm"
            min="20"
            max="300"
          />
        </div>
      </div>
  
      {/* その他のコンテンツ */}
      <div className="flex justify-center items-center flex-col">  
        {!Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
            <div className="text-center py-4">商品が見つかりませんでした</div>
          ) : (
          Object.keys(categoriesMap).map(categoryName => (
            <div key={categoryName} className="flex flex-col space-y-6 mt-5">  
              <p className="text-xl text-center">{categoryName}</p>  
              
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
                      tags={product.product_tags?.map(pt => pt.tag.tag_name)} // タグ情報を追加
                    />
                  ))}
                </div>
              </div>
    
              {/* カテゴリごとの「もっと見る」リンク */}
              {!searchQuery && (
              <Link
                href={`/products/category/${encodeURIComponent(categoryName)}`}
                className="text-center"
              >
                <button className="relative border border-black px-6 py-2 my-5 overflow-hidden group">
                  <span className="absolute inset-0 bg-black transform -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0"></span>
                  <span className="relative text-black transition-colors duration-300 ease-in-out group-hover:text-white">
                    VIEW MORE
                  </span>
                </button>
              </Link>
              )}
            </div>
          ))
        )}  
        
        {/* FittingArea コンポーネント */}
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