import React, { useEffect, useState } from 'react';
import ReactSlider from 'react-slider';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import FittingArea from '../components/VrFitting';
import Navigation from '../components/Navigation';
import styles from '../styles/Home.module.css';
import ProductCard from '../components/ProductCard';
 //a
interface Tag {
  id: number;
  tag_name: string;
}

interface Category {
  id: number;
  category_name: string;
}

interface SubCategory {
  id: number;
  subcategory_name: string;
}

interface Product {
  id: number;
  product_name: string;
  product_origin_id: number;
  category: Category;
  subcategory: SubCategory;
  price: number;
  gender: string;
  images: Array<{ image: string }>;
  product_tags?: Array<{ tag: Tag }>;
}

interface ProductListProps {
  initialProducts: Product[];
}

interface FittingItem {
  id: number;
  name: string;
  price: number;
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
};

export default function ProductList({ initialProducts }: ProductListProps) {
  const [height, setHeight] = useState<number>(180);
  const [weight, setWeight] = useState<number>(70);
  const [fittingItems, setFittingItems] = useState<FittingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  const removeItemFromFitting = (id: number) => {
    setFittingItems(fittingItems.filter(item => item.id !== id));
  };

  const handleAddToCart = () => {
    console.log('商品をカートに追加');
  };

  const handleAddToFavorites = () => {
    console.log('商品をお気に入りに追加');
  };

  // 検索とフィルタリング機能を更新
  useEffect(() => {
  

    const query = searchQuery.toLowerCase().trim();
  
    const filtered = initialProducts.filter(product => {
      const isWithinPriceRange =
        product.price >= priceRange[0] && product.price <= priceRange[1];
  
      const hasMatchingTag = product.product_tags?.some(productTag =>
        productTag.tag.tag_name.toLowerCase().includes(query)
      );

      // 性別フィルタリング
      const matchesGender = 
        selectedGender === '' || 
        (product.gender || '') === selectedGender;
        console.log('プロダクトオリジンの方:', product.product_origin?.gender);
        console.log('プロダクトの方:', product.gender);
      return (
        // 価格で検索
        isWithinPriceRange &&
        // 性別フィルター
        matchesGender &&
        (
          // 商品名で検索
          product.product_name.toLowerCase().includes(query) ||
          // カテゴリー名で検索
          product.category.category_name.toLowerCase().includes(query) ||
          // サブカテゴリ―で検索
          product.subcategory.subcategory_name.toLowerCase().includes(query) ||
          // タグで検索
          hasMatchingTag
        )
      );
    });

    setFilteredProducts(filtered);
  }, [searchQuery, priceRange, selectedGender, initialProducts]);

  // カテゴリごとに商品をグループ化
  const categoriesMap: { [key: string]: Product[] } = {};

  if (Array.isArray(filteredProducts)) {
    filteredProducts.forEach(product => {
      if (product?.category?.category_name) {
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
      <AllMensLeadiesKidsFilter 
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
      />
      
      
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

      {/* 価格範囲スライダーと入力フォーム */}
      <div className="mb-8 text-center">
        {/* 金額入力フォーム */}
        <div className="flex justify-center items-center mt-4 space-x-4">
          <div className="flex items-center">
            {/* <label className="text-sm font-medium mr-2">最低価格 (¥)</label> */}
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const newMin = Math.max(0, Math.min(Number(e.target.value), priceRange[1]));
                setPriceRange([newMin, priceRange[1]]);
              }}
              className="border rounded-lg px-2 py-1 text-center shadow-sm w-20" // 幅を小さく
              min="0"
              max={priceRange[1]}
            />
            <div>円</div>
          </div>
          <div className="mx-2">～</div> {/* 中央の余白を調整 */}
          <div className="flex items-center">
            {/* <label className="text-sm font-medium mr-2">最高価格 (¥)</label> */}
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const newMax = Math.min(100000, Math.max(Number(e.target.value), priceRange[0]));
                setPriceRange([priceRange[0], newMax]);
              }}
              className="border rounded-lg px-2 py-1 text-center shadow-sm w-20" // 幅を小さく
              min={priceRange[0]}
              max="100000"
            />
            <div>円</div>
          </div>
        </div>
        <div style={{ maxWidth: '200px', margin: '0 auto', marginTop: '20px' }}> {/* スライダーの横幅を半分に */}
          {/* 価格範囲スライダー */}
          <ReactSlider
            className="custom-slider"
            thumbClassName="custom-thumb"
            trackClassName="custom-track"
            min={0}
            max={100000}
            step={100}
            value={priceRange}
            onChange={(values: [number, number]) => setPriceRange(values)}
          />
        </div>
      </div>

      {/* 商品表示エリア */}
      <div className="flex justify-center items-center flex-col">
        {!Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
          <div className="text-center py-4">商品が見つかりませんでした</div>
        ) : (
          Object.keys(categoriesMap).map(categoryName => (
            <div key={categoryName} className="flex flex-col space-y-6 mt-5 w-full">
              <p className="text-xl text-center">{categoryName}</p>
              
              {/* 商品カードのスクロールリスト（レスポンシブ対応） */}
              <div className="flex justify-center overflow-x-auto max-w-full gap-4 scrollbar-hide">
              <div className="flex justify-center space-x-4 max-w-[700px]">
                  {categoriesMap[categoryName].map(product => (
                    <ProductCard 
                      key={product.id}
                      id={product.product_origin_id}
                      product_id={product.id}
                      productName={product.product_name}
                      categoryName={product.category.category_name}
                      subcategoryName={product.subcategory.subcategory_name}
                      price={product.price}
                      imageUrl={`http://127.0.0.1:8000/${product.images[0]?.image}`}
                      tags={product.product_tags?.map(pt => pt.tag.tag_name)} // タグ情報を追加
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
}
