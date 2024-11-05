import ProductCard from '@styles/components/ProductCard';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React from 'react';  

const Category: React.FC = () => {  
    return (  
        <div className="container mx-auto max-w-screen-xl px-4">  
        {/* 性別カテゴリメニュー */}  
        <AllMensLeadiesKidsFilter />
        {/* 商品リスト */}  
        <div className="flex flex-col items-center">  
            <h1 className="text-xl text-center mb-6">カテゴリ名</h1>  
            
            {/* 商品カードを5つずつ横に並べるグリッド */}  
            <div className="grid grid-cols-4 gap-6 max-w-[700px]">  
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