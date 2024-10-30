import ProductCard from '@styles/components/ProductCard';  
import React from 'react';  

const Category: React.FC = () => {  
    return (  
        <div className="container mx-auto max-w-screen-xl px-4">  
        {/* 性別カテゴリメニュー */}  
        <ul className="flex justify-center items-center my-12">  
            <li className="px-4 border-l border-r border-gray-300">ALL</li>  
            <li className="px-4 border-l border-r border-gray-300">MENS</li>  
            <li className="px-4 border-l border-r border-gray-300">LADIES</li>  
            <li className="px-4 border-l border-r border-gray-300">KIDS</li>  
        </ul>  
        {/* 商品リスト */}  
        <div className="flex flex-col items-center">  
            <h1 className="text-2xl text-center mb-6">カテゴリ名</h1>  
            
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