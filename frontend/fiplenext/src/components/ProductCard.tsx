import React from 'react';
import Link from 'next/link';

const ProductCard: React.FC = () => {
    return (
        <Link href={`/product/detail/`}>
            <div className='productCard'>
                <img className='productImage'></img>
                <p className='productName'>商品名</p>
                <p className='category'>カテゴリ</p>
                <p className='productPrice'>価格</p>
            </div>
        </Link>
    );
};

export default ProductCard;
