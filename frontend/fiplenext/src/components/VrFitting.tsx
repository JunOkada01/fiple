import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Draggable from 'react-draggable';
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

// 商品バリアントの型定義
interface ProductVariant {
  id: number;
  color: {
    id: number;
    color_name: string;
    color_code: string;
  };
  size: {
    id: number;
    size_name: string;
    order: number;
  };
  price: number;
  status: string;
  images: Array<{
    id: number;
    image: string;
    image_description: string | null;
  }>;
}
export interface FittingItem {
  id: number;
  product_id: number;
  productName: string;
  categoryName: string;
  subcategoryName: string;
  price: number;
  imageUrl?: string;
  selectedColor?: string;
  selectedSize?: string;
  variants: ProductVariant[];
}

const FittingArea: React.FC = () => {
  const [height, setHeight] = useState<number>(180);
  const [weight, setWeight] = useState<number>(70);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  /* 通知 */
  const [notification, setNotification] = useState<string | null>(null);
  /* お気に入り */
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  // 試着中商品 (選択しているカラーとサイズ)
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fittingItems, setFittingItems] = useState<FittingItem[]>([]);
  // セッションから試着中商品を読み込む
  const loadFittingItems = () => {
    const items = sessionStorage.getItem("fittingItems");
    setFittingItems(items ? JSON.parse(items) : []);
  };
  // 試着中商品をリストから削除する
  const removeFittingItem = (id: number) => {
    const updatedItems = fittingItems.filter((item) => item.id !== id);
    sessionStorage.setItem("fittingItems", JSON.stringify(updatedItems));
    setFittingItems(updatedItems);
  };
  // 試着商品リストを一定時間ごとに自動更新する
  useEffect(() => {
    loadFittingItems();
    const intervalId = setInterval(loadFittingItems, 5000); // 5秒ごとにリストを更新
    // コンポーネントがアンマウントされた時にインターバルをクリア
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  // コンポーネントマウント時に試着商品を読み込む
  useEffect(() => {
    loadFittingItems();
  }, []);
  const toggleFavorite = () => setIsFavorite((prev) => !prev);
  const toggleFittingArea = () => setIsOpen(!isOpen);
  // 試着エリアを開いたときにローディングを開始
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
      }, 3000); // ローディング時間を設定
    }
  }, [isOpen]);
  
  // まとめてお気に入り登録・解除
  const FavoriteToggle = async () => {
    {/* トークン */}
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('ログインが必要です。');
      return;
    }
    try {
      // 現在のお気に入り情報を取得
      const favoriteResponse = await axios.get('http://localhost:8000/api/favorites/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // お気に入り商品IDリストを作成
      const favoriteItems = favoriteResponse.data || [];
      const favoriteIds = favoriteItems.map((fav: any) => fav.product.id);

      // 登録及び解除処理
      if (isFavorite) {
        // お気に入り登録されている商品を解除
        const removalPromises = fittingItems
          // お気に入り登録済み商品をフィルタリング
          .filter((item) => favoriteIds.includes(item.product_id))
          .map(async (item) => {
            const fav = favoriteItems.find((fav: any) => fav.product.id === item.product_id);
            if (fav) {
              await axios.delete(`http://localhost:8000/api/favorites/delete/${fav.id}/`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            }
          });
        // 全てのお気に入り解除処理を並列で実行
        await Promise.all(removalPromises);
        setNotification(`${removalPromises.length}件のお気に入り登録を解除しました`);
      } else {
        // お気に入りに登録されていないアイテムを追加
        const additionPromises = fittingItems
          // お気に入り登録していない商品をフィルタリング
          .filter((item) => !favoriteIds.includes(item.product_id))
          .map((item) =>
            axios.post(
              'http://localhost:8000/api/favorites/add/',
              { product_id: item.product_id },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          );
        // 全てのお気に入り登録処理を並列で実行
        await Promise.all(additionPromises);
        setNotification(`${additionPromises.length}件のお気に入り登録を追加しました`);
      }
      // お気に入り状態をトグル（登録されていれば解除、されていなければ追加）
      setIsFavorite((prev) => !prev);
  
      // 通知を非表示にする
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('お気に入りの操作に失敗しました', error);
      alert('操作に失敗しました。もう一度お試しください。');
    }
  };


  return (
    <div className="relative">
      {/* 通知メッセージ */}
      {notification && (
        <div 
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 py-3 px-6 rounded-md shadow-lg transition-all duration-500 ease-out opacity-100
                ${notification.includes('追加') ? 'bg-blue-400 text-white' : 'bg-red-400 text-white'}`}
        >
            <p className="font-medium">{notification}</p>
        </div>
      )}
      {/* マネキンアイコン（クリックで試着エリアが開く） */}
      <Draggable>
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
      </Draggable>

      {/* 試着エリアが開いたときだけ表示（アニメーション付き） */}
      <div
        className={`transition-all duration-500 ease-in-out fixed top-20 right-5 bg-white border border-black shadow-md w-[250px] ${isOpen ? 'h-auto' : 'h-0 overflow-hidden'} z-40
          ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        {/* 身長と体重入力フォーム */}
        <div className="z-10 flex justify-center items-center space-x-4 w-full py-2 border-b">
          {/* 身長入力 */}
          <div className="flex items-center">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="border rounded-lg text-center shadow-sm w-[60px]"
              min="50"
              max="300"
            />
            <span className="ml-2 text-sm font-medium">cm</span>
          </div>

          {/* 体重入力 */}
          <div className="flex items-center">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="border rounded-lg text-center shadow-sm w-[50px]"
              min="20"
              max="300"
            />
            <span className="ml-2 text-sm font-medium">kg</span>
          </div>
        </div>


        {/* マネキンエリア */}
        <div className=''>
          <div style={{ height: '300px', width: '100%' }}>
            {isLoading ? (
              <LoadingWave />
            ) : (
              <MannequinModel height={height} weight={weight} />
            )}
          </div>
        </div>

        {/* ボタンエリア */}
        <div>
          <div className="flex justify-between border-t border-b border-gray-300 p-2">
            <div 
              onClick={(e) => {e.preventDefault(); FavoriteToggle();}}
              className="px-4 py-2"
            >
              <FontAwesomeIcon 
                icon={faHeart} 
                className={`text-xl transition-all duration-150 transform ${isFavorite ? 'text-red-500' : 'text-red-300 hover:text-red-200'}`}
              />
            </div>
            {/* まとめてカート登録 */}
            <button
              className="text-black px-4 py-2 rounded-sm border border-black hover:text-white hover:bg-black transition-all"
            >
              カートに入れる
            </button>
          </div>
        </div>

        {/* 試着中アイテムエリア */}
        <div>
          {fittingItems.length > 0 ? (
            <div className="items-scrollbar max-h-[200px] overflow-y-auto">
              <ul className="space-y-0">
              {fittingItems.map((item) => {
                console.log("商品全体", item); // item全体を表示
                return (
                  <li key={item.id} className="flex items-center justify-between border-t brder-b">
                    <div className="flex items-center space-x-1">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          width={80}
                          height={106}
                          className="m-1 aspect-[3/4]"
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                      <div className='flex flex-col'>
                        <span className="text-[12px]">{item.productName}</span>
                        <p className="text-[10px] text-gray-600">{item.categoryName}/{item.subcategoryName}</p>
                        <span className="text-gray-600">¥{item.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="text-black-500 hover:text-black-700"
                        onClick={() => removeFittingItem(item.id)}
                      >
                        <FontAwesomeIcon icon={faXmark} className='text-s m-2' />
                      </button>
                    </div>
                  </li>
                );
              })}
              </ul>
            </div>
          ) : (
              <p className="text-gray-500 text-center mb-2">試着中の商品はありません</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FittingArea;