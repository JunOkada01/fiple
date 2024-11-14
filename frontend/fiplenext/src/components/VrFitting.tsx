
import React from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/Home.module.css';

const MannequinModel = dynamic(() => import('./MannequinModel'), {
  ssr: false
});

interface FittingItem {
  id: number;
  name: string;
  price: number;
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
  return (
    <div className={`${styles.sideSection} flex flex-col`}>
      {/* マネキンエリア */}
      <div className={styles.mannequinArea} style={{ height: '300px', width: '100%' }}>
        <MannequinModel height={height} weight={weight} />
      </div>

      {/* ボタンエリア */}
      <div className="flex justify-between mb-4 border-t border-b border-gray-300 py-2">
        <button
          className="text-black px-4 py-2 rounded hover:bg-gray-100"
          onClick={onAddToFavorites}
        >
          ♡
        </button>
        <button
          className="text-black px-4 py-2 rounded hover:bg-gray-100"
          onClick={onAddToCart}
        >
          カートに入れる
        </button>
      </div>

      {/* 試着中アイテムエリア */}
      <div className={styles.fittingArea}>
        <h2 className="text-lg font-semibold mb-4">試着中の商品</h2>
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
  );
};

export default FittingArea;
