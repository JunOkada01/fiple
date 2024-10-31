import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShirt } from '@fortawesome/free-solid-svg-icons';

interface ProductCardProps {
    id: number;
    categoryName: string;
    price: number;
    imageUrl: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, categoryName, price, imageUrl }) => {
    return (
        <Link href={`/product/detail/${id}`}>
            <div className="bg-white rounded-sm shadow-lg p-0 w-[170px]">
                <img src={imageUrl} alt="商品画像" className="w-full aspect-[3/4] object-cover shadow-md rounded-t-md" />
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-500 text-sm">{categoryName}</p>
                    </div>
                    <p className="text-gray-900 text-xl mt-1">¥{price.toLocaleString()}</p>
                    <div className="flex justify-end mt-2">
                        <button className="text-gray-800 font-bold py-2 px-4 rounded">
                            <FontAwesomeIcon icon={faShirt} />
                        </button>
                        <button className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded ml-2">
                            <FontAwesomeIcon icon={faHeart} />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
