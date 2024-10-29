import ProductCard from '@styles/components/ProductCard';  
import React from 'react';  

const Home: React.FC = () => {  
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
      <div className="flex justify-center items-center flex-col">  
        <div className="flex flex-col space-y-6">  
          <p className="text-lg text-center">カテゴリ名</p>  
          <div className="flex overflow-x-auto max-w-[800px] gap-3 p-2 scrollbar-hide">  
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

        {/* 以下、他のカテゴリについても同様にリスト */}  
        <div className="flex flex-col space-y-6 mt-10">  
          <p className="text-lg text-center">カテゴリ名</p>  
          <div className="flex overflow-x-auto max-w-[800px] gap-3 p-2 scrollbar-hide">  
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

        <div className="flex flex-col space-y-6 mt-10">  
          <p className="text-lg text-center">カテゴリ名</p>  
          <div className="flex overflow-x-auto max-w-[800px] gap-3 p-2 scrollbar-hide">  
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
    </div>  
  );  
};  

export default Home;