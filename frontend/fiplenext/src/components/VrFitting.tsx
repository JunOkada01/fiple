import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHeart, faVest, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faWindowClose } from '@fortawesome/free-regular-svg-icons';

const MannequinModel = dynamic(() => import('./MannequinModel'), {
  ssr: false,
});

/* マネキンモデルのローディングアニメーション */
const LoadingWave = () => (
  <div className="flex space-x-3 items-center justify-center h-full">
    {[...Array(5)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-500 h-3 w-3 rounded-full animate-bounce"
        style={{ animationDelay: `${index * 0.1}s` }}
      ></div>
    ))}
  </div>
);

interface FittingItem {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  imageUrl?: string;
}

interface FittingAreaProps {
  height: number;
  weight: number;
  fittingItems: FittingItem[];
  onRemoveItem: (id: number) => void;
  onAddToCart: () => void;
  onAddToFavorites: () => void;
}

const FittingArea: React.FC<FittingAreaProps> = ({
  height,
  weight,
  fittingItems,
  onRemoveItem,
  onAddToCart,
  onAddToFavorites
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleFavorite = () => setIsFavorite((prev) => !prev);
  const toggleFittingArea = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
      }, 3000); // ローディング時間を設定
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* マネキンアイコン（クリックで試着エリアが開く） */}
      <div
        onClick={toggleFittingArea}
        className={`flex justify-center items-center cursor-pointer rounded-full p-4 my-4 mx-auto w-[50px] h-[50px] fixed bottom-10 right-10 z-50 
          bg-white border border-black shadow-lg transition-all duration-300 
          hover:scale-110 hover:shadow-xl hover:border-black`}
      >
        <span className="text-2xl">
          <FontAwesomeIcon icon={isOpen ? faClose : faVest}
          className={`transition-all duration-300 ${isOpen ? '' : 'fa-shake'}`}
        />
        </span>
      </div>

      {/* 試着エリアが開いたときだけ表示（アニメーション付き） */}
      <div
        className={`transition-all duration-500 ease-in-out fixed top-20 right-5 bg-white border border-black shadow-md w-[250px] ${isOpen ? 'h-auto' : 'h-0 overflow-hidden'} z-40
          ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        {/* マネキンエリア */}
        <div style={{ height: '300px', width: '100%' }}>
          {isLoading ? (
            <LoadingWave />
          ) : (
            <MannequinModel height={height} weight={weight} />
          )}
        </div>

        {/* ボタンエリア */}
        <div className="flex justify-between border-t border-b border-gray-300 p-2">
          <button className="text-black px-4 py-2" onClick={toggleFavorite}>
            <FontAwesomeIcon
              icon={faHeart}
              className={`text-xl transition-all duration-150 transform ${isFavorite ? 'text-red-500' : 'text-red-300 hover:text-red-200'}`}
            />
          </button>
          <button
            className="text-black px-4 py-2 rounded-sm border border-black hover:text-white hover:bg-black transition-all"
            onClick={onAddToCart}
          >
            カートに入れる
          </button>
        </div>

        {/* 試着中アイテムエリア */}
        <div className="p-4">
          <h2 className="text-lg mb-4">試着中の商品</h2>
          {fittingItems.length > 0 ? (
            <ul className="space-y-3">
              {fittingItems.map(item => (
                <li key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">¥{item.price.toLocaleString()}</span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">試着中の商品はありません</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FittingArea;
