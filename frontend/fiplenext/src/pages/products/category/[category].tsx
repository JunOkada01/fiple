import ProductCard from '@styles/components/ProductCard';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React from 'react';
import { GetServerSideProps } from 'next';

interface Product {
    id: number;
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

interface CategoryPageProps {
    products: Product[];
    categoryName: string;
}

export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async (context) => {
    const { category } = context.params!;
    
    // カテゴリに応じた商品の取得APIのエンドポイント
    const res = await fetch(`http://127.0.0.1:8000/api/products?category=${category}`);
    const products = await res.json();
    return {
        props: {
            products,
            categoryName: category as string,
        },
    };
};

export default function CategoryPage({ products, categoryName }: CategoryPageProps) {
    return (  
        <div className="container mx-auto max-w-screen-xl px-4">  
            {/* 性別カテゴリメニュー */}  
            <AllMensLeadiesKidsFilter />
            {/* 商品リスト */}  
            <div className="flex flex-col items-center">  
                <h1 className="text-xl text-center mb-6">{categoryName}</h1>  
                
                {/* 商品カードを5つずつ横に並べるグリッド */}  
                <div className="grid grid-cols-4 gap-6 max-w-[700px]">  
                    {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        categoryName={product.category.category_name}
                        subcategoryName={product.subcategory.subcategory_name}
                        price={product.price}
                        imageUrl={`http://127.0.0.1:8000/${product.images[0]?.image}`}
                    />
                    ))}
                </div>  
            </div>  
        </div>  
    );  
};  
