import ProductCard from '@styles/components/ProductCard';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React from 'react';  
import Link from 'next/link';

const Home: React.FC = () => {  
  return (  
    <div className="container mx-auto max-w-screen-xl px-4">  
      {/* 性別カテゴリメニュー */}
      <AllMensLeadiesKidsFilter />

      {/* 商品リスト */}  
      <div className="flex justify-center items-center flex-col">  
        <div className="flex flex-col space-y-6">  
          <p className="text-xl text-center">カテゴリ名</p>  
          <div className="flex overflow-x-auto max-w-[700px] gap-4 scrollbar-hide">  
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
          <Link href="/product/category" className="text-black underline text-right">
              もっと見る
          </Link>
        </div>  

        {/* 以下、他のカテゴリについても同様にリスト */}  
        <div className="flex flex-col space-y-6 mt-10">  
          <p className="text-lg text-center">カテゴリ名</p>  
          <div className="flex overflow-x-auto max-w-[700px] gap-4 scrollbar-hide">  
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
          <Link href="/product/category" className="text-black underline text-right">
              もっと見る
          </Link>
        </div>  

        <div className="flex flex-col space-y-6 mt-10">  
          <p className="text-lg text-center">カテゴリ名</p>  
          <div className="flex overflow-x-auto max-w-[700px] gap-4 scrollbar-hide">  
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
          <Link href="/product/category" className="text-black underline text-right">
              もっと見る
          </Link>
        </div>  
      </div>  
    </div>  
  );  
};  

export default Home;