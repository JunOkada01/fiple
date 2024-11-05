// pages/product/category/[categoryName].tsx

import ProductCard from '@styles/components/ProductCard';
import AllMensLadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';

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
    return (
        <div className="container mx-auto max-w-screen-xl px-4">
            <AllMensLadiesKidsFilter />
            <div className="flex flex-col items-center">
                <h1 className="text-xl text-center mb-6">{categoryName}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-[1200px]">
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
        </div>
    );
};

export default CategoryPage;
