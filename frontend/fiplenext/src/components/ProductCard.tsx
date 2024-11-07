import React, { useState } from 'react';
import Image from 'next/image';
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
    // ボタンの状態を管理するステート
    const [isTryingOn, setIsTryingOn] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
 
    // 試着ボタンのトグル関数
    const toggleTryingOn = () => setIsTryingOn((prev) => !prev);
   
    // お気に入りボタンのトグル関数
    const toggleFavorited = () => setIsFavorited((prev) => !prev);
 
    return (
        <div className="bg-white rounded-sm border border-[1px] p-0 w-full max-w-sm">
            <Link href={`/products/${id}`}>
                <div className="relative w-full aspect-[3/4]"> {/* アスペクト比3:4を維持 */}
                  <Image src={imageUrl} alt="商品画像" className="w-full aspect-[3/4] object-cover shadow-md rounded-t-md" width={300}  height={200} />
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                          <p className="text-gray-500 text-sm">{categoryName}</p>
                        </div>
                        <p className="text-gray-900 text-xl mt-1">¥{price.toLocaleString()}</p> {/* たぶん、priceにデータが入ってなかったらここでエラーが出ます */}
                        {/* ボタンエリア */}
                      <div className="flex justify-end mt-2 space-x-[80px]"> {/* ボタン同士の間隔とパディングを追加 */}
                          {/* 試着アイコンボタン */}
                          <div
                              onClick={toggleTryingOn}
                              className={`cursor-pointer transition-all duration-150 ${isTryingOn ? 'text-black' : 'text-gray-300 hover:text-gray-200'}`}
                          >
                              <FontAwesomeIcon
                                  icon={faShirt}
                                  className="text-md transition-all duration-150"
                              />
                          </div>
 
                          {/* お気に入りアイコンボタン */}
                          <div
                              onClick={toggleFavorited}
                              className={`cursor-pointer transition-all duration-150 ${isFavorited ? 'text-red-500' : 'text-red-300 hover:text-red-200'}`}
                          >
                              <FontAwesomeIcon
                                  icon={faHeart}
                                  className="text-md transition-all duration-150"
                              />
                          </div>
                      </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};
 
export default ProductCard;