import ProductCard from '@styles/components/ProductCard';  
import React from 'react';  

const Favorites: React.FC = () => {  
    return (  
        <div className="container mx-auto max-w-screen-xl px-4">  
        <h1 className="text-3xl text-center my-8">YOUR LIKED ITEMS</h1>  
        
        <div className="flex flex-col items-center">  
            <div className="grid grid-cols-5 gap-5 max-w-full">  
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

export default Favorites;