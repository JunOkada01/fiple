import ProductCard from '@styles/components/ProductCard';  
import React from 'react';  

const Category: React.FC = () => {  
    return (  
        <div className="container mx-auto max-w-screen-xl px-4">  
        {/* 商品リスト */}  
        <div className="flex flex-col items-center">  
            <h1 className="text-2xl font-bold text-center mb-6">カテゴリ名</h1>  
            
            {/* 商品カードを5つずつ横に並べるグリッド */}  
            <div className="grid grid-cols-5 gap-6 max-w-full">  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            <ProductCard />  
            </div>  
        </div>  
        </div>  
    );  
};  

export default Category;