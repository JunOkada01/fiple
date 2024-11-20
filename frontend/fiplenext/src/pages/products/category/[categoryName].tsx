// pages/product/category/[categoryName].tsx

import ProductCard from '@styles/components/ProductCard';
import AllMensLadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import FittingArea from '../../../components/VrFitting';


interface ProductVariantType {
    id: number;
    price: number;
    images: Array<{
        id: number;
        image: string;
        image_description: string | null;
    }>;
}

interface ProductDetailType {
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
    variants: ProductVariantType[];
}

interface CategoryPageProps {
    products: ProductDetailType[];
    categoryName: string;
}

interface FittingItem {
    id: number;
    name: string;
    price: number;
    category: string;
    subcategory: string;
    imageUrl?: string;
}

// サーバーサイドでカテゴリ別の商品データを取得
export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async (context) => {
    const { categoryName } = context.params!;

    try {
        const res = await axios.get(`http://127.0.0.1:8000/api/products/category/${categoryName}`);
        const products = res.data;

        return {
            props: {
                products,
                categoryName: categoryName as string,
            },
        };
    } catch (error) {
        console.error("商品データの取得に失敗しました", error);
        return {
            props: {
                products: [],
                categoryName: categoryName as string,
            },
        };
    }
};

// カテゴリページコンポーネントの定義
const CategoryPage: React.FC<CategoryPageProps> = ({ products, categoryName }) => {
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
            <AllMensLadiesKidsFilter />

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

            {/* 商品リスト */}
            <div className="flex justify-center items-center flex-col">
                <h1 className="text-xl text-center mb-6">{categoryName}</h1>
                <div className="grid grid-cols-4 gap-6 max-w-[700px]">
                    {products.length === 0 ? (
                        <div className="text-center">商品が見つかりませんでした。</div>
                    ) : (
                        products.map((product) => {
                            const imageUrl = product.images[0]?.image 
                                ? `http://127.0.0.1:8000/${product.images[0].image}` 
                                : '';

                            return (
                                <ProductCard
                                    key={product.id}
                                    id={product.product_origin_id}
                                    product_id={product.id}
                                    productName={product.product_name}
                                    categoryName={product.category.category_name}
                                    subcategoryName={product.subcategory.subcategory_name}
                                    price={product.price}
                                    imageUrl={imageUrl} // 画像のURLを設定
                                />
                            );
                        })
                    )}
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
    );
};

export default CategoryPage;
