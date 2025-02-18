import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React, { useEffect, useState } from 'react';  
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import FittingArea from '../components/VrFitting';
import Navigation from '../components/Navigation';
import ProductCard from '../components/ProductCard';
import ReactSlider from 'react-slider';
// import Notifications from '../components/Notifications';
import BannerList from '../components/BannerList';
 
// 基本的なモデルのインターフェース
 
interface Category {
  id: number;
  category_name: string;
  category_position: string;
}
 
interface SubCategory {
  id: number;
  subcategory_name: string;
}
 
// ProductTagSerializerに合わせたインターフェース
interface ProductTag {
  id: number;
  product_origin: ProductOrigin;
  tag_name: string;        // tag.tag_name
  product_name: string;    // product_origin.product_name
  admin_username: string;  // admin_user.username
  created_at: string;
  updated_at: string;
}
 
// ProductOriginの情報を含むインターフェース
interface ProductOrigin {
  id: number;
  product_name: string;
  category: Category;
  subcategory: SubCategory;
  gender: string;
  description: string;
  product_tags?: ProductTag[];
}
 
// 商品全体の情報を含むインターフェース
interface Product {
  id: number;
  product_origin: ProductOrigin;
  price: number;
  stock: number;
  status: string;
  images: Array<{ image: string }>;
  front_image_url?: string;
  back_image_url?: string;
  category: Category;
}
 
// プロップスのインターフェース
interface ProductListProps {
  initialProducts: Product[];
}
 
// フィッティングアイテムのインターフェース
// interface FittingItem {
//   id: number;
//   product_id: number;
//   productName: string;
//   categoryName: string;
//   categoryPosition: string;
//   subcategoryName: string;
//   price: number;
//   imageUrl?: string;
// }
 
 
export const getServerSideProps: GetServerSideProps<ProductListProps> = async () => {
  try {
    const res = await fetch('http://34.230.156.248:8000/api/products/');
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
  // const [fittingItems, setFittingItems] = useState<FittingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
 
 
 
  // 検索フィルタリング機能を更新
  useEffect(() => {
 
 
    const query = searchQuery.toLowerCase().trim();
 
    const filtered = initialProducts.filter(product => {
      const isWithinPriceRange =
        product.price >= priceRange[0] && product.price <= priceRange[1];
 
        const hasMatchingTag = product.product_origin.product_tags?.some(productTag => {
          // 入力が空の場合はすべての商品を表示
          if (!query) return true;
         
          // タグの部分一致チェック
          return productTag.tag_name.toLowerCase().includes(query);
        });
 
      // 性別フィルタリング
      const matchesGender =
      selectedGender === '' ||
      (product.product_origin.gender || '').toLowerCase() === selectedGender.toLowerCase();
      console.log(selectedGender.toLowerCase());
      return (
        // 価格で検索
        isWithinPriceRange &&
        // 性別フィルター
        matchesGender &&
        (
          // 商品名で検索
          product.product_origin.product_name.toLowerCase().includes(query) ||
          // カテゴリー名で検索
          product.product_origin.category.category_name.toLowerCase().includes(query) ||
          // サブカテゴリ―で検索
          product.product_origin.subcategory.subcategory_name.toLowerCase().includes(query) ||
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
      <div className='BannerArea pt-5'>
        <BannerList />
      </div>
      {/* 性別カテゴリメニュー */}
      {/* <AllMensLeadiesKidsFilter /> */}
      <AllMensLeadiesKidsFilter onGenderSelect={setSelectedGender} />
      {/* 価格範囲スライダー */}
      <div className="mb-10 mt-10 text-center">
        <div className="max-w-xs mx-auto mt-4">
          <ReactSlider
            className="custom-slider"
            trackClassName="custom-track"
            min={0}
            max={100000}
            step={100}
            value={priceRange}
            onChange={(values: [number, number]) => setPriceRange(values)}
            renderThumb={(props, state) => (
              <div {...props} className="custom-thumb">
                <div className="thumb-label">
                  ¥{state.valueNow.toLocaleString()}
                </div>
              </div>
            )}
          />
        </div>
      </div>
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
                    id={product.product_origin.id}
                    product_id={product.id}
                    productName={product.product_origin.product_name}
                    categoryName={product.category.category_name}
                    categoryPosition={product.category.category_position}
                    subcategoryName={product.product_origin.subcategory.subcategory_name}
                    price={product.price}
                    imageUrl={`http://34.230.156.248:8000/${product.images[0]?.image}`} // 画像のURLを設定
                    // tags={product.product_tags?.map(pt => pt.tag.tag_name)} // タグ情報を追加
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
}