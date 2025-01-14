import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHeart, faVest, faXmark, faCartPlus } from '@fortawesome/free-solid-svg-icons';
import Draggable from 'react-draggable';
import dynamic from 'next/dynamic';
import axios from 'axios';

// マネキンモデルを動的にインポート
const MannequinModel = dynamic(() => import('./MannequinModel'), {
  ssr: false,
});

// ローディングアニメーション
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

// 試着アイテムの型定義を拡張
interface EnhancedFittingItem {
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

const FittingArea = () => {
  const [fittingItems, setFittingItems] = useState<EnhancedFittingItem[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<{[key: number]: number}>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(60);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [itemFavorites, setItemFavorites] = useState<{[key: number]: boolean}>({});

  // 試着エリアの開閉
  const toggleFittingArea = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  // まとめてお気に入り登録
  const handleBulkFavorite = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setNotification('ログインが必要です');
      return;
    }

    try {
      // 現在のお気に入り情報を取得
      const favoriteResponse = await axios.get('http://localhost:8000/api/favorites/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingFavorites = favoriteResponse.data || [];
      const existingFavoriteIds = existingFavorites.map((fav: any) => fav.product.id);

      // まだお気に入りに登録されていないアイテムをフィルタリング
      const itemsToAdd = fittingItems.filter(
        item => !existingFavoriteIds.includes(item.product_id)
      );

      if (itemsToAdd.length === 0) {
        setNotification('すべての商品はすでにお気に入りに登録されています');
        return;
      }

      // お気に入り登録
      const addPromises = itemsToAdd.map(item =>
        axios.post(
          'http://localhost:8000/api/favorites/add/',
          { product_id: item.product_id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(addPromises);
      setNotification(`${itemsToAdd.length}件の商品をお気に入りに登録しました`);
      setIsFavorite(true);
    } catch (error) {
      console.error('お気に入り登録に失敗しました:', error);
      setNotification('お気に入り登録に失敗しました');
    }

    setTimeout(() => setNotification(null), 3000);
  };

  const handleBulkAddToCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setNotification('ログインが必要です');
      return;
    }
  
    try {
      // 現在のカート情報を取得
      const cartResponse = await axios.get('http://localhost:8000/api/cart/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingCartItems = cartResponse.data || [];
      let addedCount = 0;
      
      // 逐次処理
      for (const item of fittingItems) {
        // まず選択されているバリアントを取得
        const selectedVariant = item.variants?.find(v => 
          v.color.color_name === item.selectedColor && 
          v.size.size_name === item.selectedSize
        );
  
        if (!selectedVariant) {
          console.warn(`選択されているバリアントが見つかりません: ${item.productName}`);
          continue;
        }
  
        // 選択されたバリアントがすでにカートに存在するかチェック
        if (existingCartItems.some((cartItem: any) => cartItem.product.id === selectedVariant.id)) {
          console.log(`バリアントはすでにカートに存在します: ${item.productName} (${item.selectedColor}, ${item.selectedSize})`);
          continue;
        }
  
        try {
          await axios.post(
            'http://localhost:8000/api/cart/add/',
            {
              product_id: selectedVariant.id,
              quantity: 1
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          addedCount++;
          
          // 各追加の間に小さな遅延を入れる
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`カートへの追加に失敗しました: ${item.productName}`, error);
        }
      }
  
      if (addedCount === 0) {
        setNotification('選択された商品はすでにカートに追加されています');
      } else {
        setNotification(`${addedCount}件の商品をカートに追加しました`);
      }
    } catch (error) {
      console.error('カートへの追加に失敗しました:', error);
      setNotification('カートへの追加に失敗しました');
    }
  
    setTimeout(() => setNotification(null), 3000);
  };

  // 商品個別のお気に入り状態をチェック
  const checkFavoriteStatus = async (productId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const response = await axios.get('http://localhost:8000/api/favorites/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const isFavorite = response.data.some((fav: any) => fav.product.id === productId);
      setItemFavorites(prev => ({ ...prev, [productId]: isFavorite }));
      return isFavorite;
    } catch (error) {
      console.error('お気に入り状態の確認に失敗しました:', error);
      return false;
    }
  };

  // 個別商品のお気に入り登録・解除
  const toggleItemFavorite = async (productId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setNotification('ログインが必要です');
      return;
    }

    try {
      if (itemFavorites[productId]) {
        // お気に入り解除
        const favoriteResponse = await axios.get('http://localhost:8000/api/favorites/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const favorite = favoriteResponse.data.find((fav: any) => fav.product.id === productId);
        if (favorite) {
          await axios.delete(`http://localhost:8000/api/favorites/delete/${favorite.id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotification('お気に入りから削除しました');
        }
      } else {
        // お気に入り登録
        await axios.post(
          'http://localhost:8000/api/favorites/add/',
          { product_id: productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification('お気に入りに追加しました');
      }
      
      setItemFavorites(prev => ({ ...prev, [productId]: !prev[productId] }));
    } catch (error) {
      console.error('お気に入りの操作に失敗しました:', error);
      setNotification('操作に失敗しました');
    }

    setTimeout(() => setNotification(null), 3000);
  };

  // 個別商品のカート追加
  const addItemToCart = async (item: EnhancedFittingItem) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setNotification('ログインが必要です');
      return;
    }

    try {
      // 選択されているバリアントを取得
      const selectedVariant = item.variants?.find(v => 
        v.color.color_name === item.selectedColor && 
        v.size.size_name === item.selectedSize
      );

      if (!selectedVariant) {
        setNotification('カラーとサイズを選択してください');
        return;
      }

      // カート追加
      await axios.post(
        'http://localhost:8000/api/cart/add/',
        {
          product_id: selectedVariant.id,
          quantity: 1
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotification('カートに追加しました');
    } catch (error) {
      console.error('カートへの追加に失敗しました:', error);
      setNotification('カートへの追加に失敗しました');
    }

    setTimeout(() => setNotification(null), 3000);
  };

  // お気に入り状態の初期ロード
  useEffect(() => {
    fittingItems.forEach(item => {
      checkFavoriteStatus(item.product_id);
    });
  }, [fittingItems]);
  
  const renderFittingItem = (item: EnhancedFittingItem) => (
    <div key={item.id} className="flex space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
      <div className="relative group">
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            width={80}
            height={60}
            className="rounded object-cover"
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium truncate pr-2">{item.productName}</h4>
            <p className="text-sm text-gray-600">{item.categoryName}/{item.subcategoryName}</p>
            <p className="text-sm text-gray-600">¥{item.price.toLocaleString()}</p>
          </div>
          
          <div className="flex space-x-2">
            {/* お気に入りボタン */}
            <button
              onClick={() => toggleItemFavorite(item.product_id)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={`text-sm ${
                  itemFavorites[item.product_id] ? 'text-red-500' : 'text-gray-400'
                }`}
              />
            </button>

            {/* カート追加ボタン */}
            <button
              onClick={() => addItemToCart(item)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <FontAwesomeIcon
                icon={faCartPlus}
                className="text-sm text-gray-400 hover:text-gray-600"
              />
            </button>

            {/* 削除ボタン */}
            <button
              onClick={() => removeItem(item.id)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="text-sm text-gray-400 hover:text-gray-600"
              />
            </button>
          </div>
        </div>
        
        {renderColorButtons(item)}
        {renderSizeButtons(item)}
      </div>
    </div>
  );

    // 試着アイテムの読み込みと詳細情報の取得
  const loadItems = async () => {
      const storedItems = sessionStorage.getItem("fittingItems");
      if (!storedItems) return;
  
      try {
        const items = JSON.parse(storedItems);
        
        // 保存された選択状態の取得
        const storedVariants = sessionStorage.getItem("selectedVariants");
        const savedVariants = storedVariants ? JSON.parse(storedVariants) : {};
  
        const enhancedItems = await Promise.all(
          items.map(async (item: EnhancedFittingItem) => {
            try {
              // product_origin_idを使用して商品詳細を取得
              const response = await fetch(`http://127.0.0.1:8000/api/products/${item.id}/`);
              if (!response.ok) {
                throw new Error(`Failed to fetch product details: ${response.statusText}`);
              }
              const productData = await response.json();
  
              // この商品の保存された選択状態を取得
              const savedVariant = savedVariants[item.id];
              let selectedVariant = productData.variants[0];
  
              if (savedVariant) {
                const matchingVariant = productData.variants.find((v: ProductVariant) => v.id === savedVariant);
                if (matchingVariant) {
                  selectedVariant = matchingVariant;
                }
              }
  
              return {
                ...item,
                variants: productData.variants,
                selectedColor: selectedVariant.color.color_name,
                selectedSize: selectedVariant.size.size_name,
                price: selectedVariant.price,
                imageUrl: selectedVariant.images[0]?.image 
                  ? `http://127.0.0.1:8000/${selectedVariant.images[0].image}`
                  : item.imageUrl
              };
            } catch (error) {
              console.error('Failed to fetch product details:', error);
              // エラー時は既存のデータを返す
              return item;
            }
          })
        );
  
        setFittingItems(enhancedItems);
      } catch (error) {
        console.error('Failed to load fitting items:', error);
      }
    };

  // 初期ロードと定期更新
  useEffect(() => {
    loadItems();
    const intervalId = setInterval(loadItems, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // バリアント選択の処理
  const handleVariantChange = (itemId: number, variantId: number) => {
    // 選択状態を更新
    setSelectedVariants(prev => {
      const newVariants = {
        ...prev,
        [itemId]: variantId
      };
      // 選択状態を永続化
      sessionStorage.setItem("selectedVariants", JSON.stringify(newVariants));
      return newVariants;
    });

    // 商品情報を更新
    setFittingItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const selectedVariant = item.variants?.find(v => v.id === variantId);
          if (selectedVariant) {
            const updatedItem = {
              ...item,
              price: selectedVariant.price,
              selectedColor: selectedVariant.color.color_name,
              selectedSize: selectedVariant.size.size_name,
              imageUrl: selectedVariant.images[0]?.image 
                ? `http://127.0.0.1:8000/${selectedVariant.images[0].image}`
                : item.imageUrl
            };
            // 更新された商品情報を永続化
            const currentItems = JSON.parse(sessionStorage.getItem("fittingItems") || "[]");
            const updatedItems = currentItems.map((stored: EnhancedFittingItem) =>
              stored.id === itemId ? updatedItem : stored
            );
            sessionStorage.setItem("fittingItems", JSON.stringify(updatedItems));
            return updatedItem;
          }
        }
        return item;
      })
    );
  };

  // 選択されたサイズで利用可能なカラーを取得
  const getAvailableColors = (variants: ProductVariant[], selectedSize: string) => {
    return Array.from(new Set(
      variants
        .filter(v => v.size.size_name === selectedSize)
        .map(v => v.color.color_name)
    ));
  };

  // 選択されたカラーで利用可能なサイズを取得
  const getAvailableSizes = (variants: ProductVariant[], selectedColor: string) => {
    return Array.from(new Set(
      variants
        .filter(v => v.color.color_name === selectedColor)
        .map(v => v.size.size_name)
    ));
  };

  // カラーボタンのレンダリング
  const renderColorButtons = (item: EnhancedFittingItem) => {
    if (!item.variants) return null;

    const availableColors = getAvailableColors(item.variants, item.selectedSize || '');
    const allColors = Array.from(new Set(item.variants.map(v => v.color.color_name)));

    return (
      <div className="mt-2">
        <p className="text-xs text-gray-500">カラー</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {allColors.map((colorName) => {
            const isAvailable = availableColors.includes(colorName);
            return (
              <button
                key={colorName}
                className={`px-2 py-1 text-xs rounded transition-all
                  ${item.selectedColor === colorName
                    ? 'bg-black text-white'
                    : isAvailable
                      ? 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-gray-100 opacity-50 cursor-not-allowed'
                  }`}
                onClick={() => {
                  if (!isAvailable) return;
                  const variant = item.variants.find(v => 
                    v.color.color_name === colorName && 
                    v.size.size_name === item.selectedSize
                  );
                  if (variant) handleVariantChange(item.id, variant.id);
                }}
                disabled={!isAvailable}
              >
                {colorName}
                {!isAvailable && (
                  <span className="block text-[10px] text-gray-500">
                    在庫なし
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // サイズボタンのレンダリング
  const renderSizeButtons = (item: EnhancedFittingItem) => {
    if (!item.variants) return null;

    const availableSizes = getAvailableSizes(item.variants, item.selectedColor || '');
    const allSizes = Array.from(new Set(item.variants.map(v => v.size.size_name)));

    return (
      <div className="mt-2">
        <p className="text-xs text-gray-500">サイズ</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {allSizes.map((sizeName) => {
            const isAvailable = availableSizes.includes(sizeName);
            return (
              <button
                key={sizeName}
                className={`px-2 py-1 text-xs rounded transition-all
                  ${item.selectedSize === sizeName
                    ? 'bg-black text-white'
                    : isAvailable
                      ? 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-gray-100 opacity-50 cursor-not-allowed'
                  }`}
                onClick={() => {
                  if (!isAvailable) return;
                  const variant = item.variants.find(v => 
                    v.size.size_name === sizeName && 
                    v.color.color_name === item.selectedColor
                  );
                  if (variant) handleVariantChange(item.id, variant.id);
                }}
                disabled={!isAvailable}
              >
                {sizeName}
                {!isAvailable && (
                  <span className="block text-[10px] text-gray-500">
                    在庫なし
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // アイテムの削除処理
  const removeItem = (itemId: number) => {
    const updatedItems = fittingItems.filter(item => item.id !== itemId);
    setFittingItems(updatedItems);
    
    // セッションストレージから削除
    sessionStorage.setItem("fittingItems", JSON.stringify(updatedItems));
    
    // 選択状態からも削除
    const updatedVariants = { ...selectedVariants };
    delete updatedVariants[itemId];
    setSelectedVariants(updatedVariants);
    sessionStorage.setItem("selectedVariants", JSON.stringify(updatedVariants));
    
    setNotification("商品を試着リストから削除しました");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="relative">
      {/* 通知メッセージ */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 py-3 px-6 bg-black text-white rounded-md shadow-lg z-50 transition-all duration-500">
          {notification}
        </div>
      )}

      {/* 試着エリア開閉ボタン */}
      <Draggable>
        <div
          onClick={toggleFittingArea}
          className="fixed bottom-10 right-10 z-50 w-12 h-12 flex items-center justify-center 
                    bg-white border border-black rounded-full shadow-lg cursor-pointer
                    hover:scale-110 transition-all duration-300"
        >
          <FontAwesomeIcon 
            icon={isOpen ? faXmark : faVest} 
            className={`text-xl ${!isOpen && 'fa-shake'}`}
          />
        </div>
      </Draggable>

      {/* 試着エリアメイン */}
      <div 
        className={`fixed top-20 right-5 bg-white border border-black shadow-md w-[300px]
                  transition-all duration-500 ease-in-out z-40 flex flex-col
                  ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                  max-h-[80vh]`} // 最大高さを設定
      >
        {/* 固定ヘッダー部分 */}
        <div className="flex-none border-b border-gray-200">
          {/* 身長体重入力 */}
          <div className="p-4">
            <div className="flex justify-center space-x-4">
              <div className="flex items-center">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-16 p-1 border rounded text-center"
                  min={100}
                  max={200}
                />
                <span className="ml-1">cm</span>
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-16 p-1 border rounded text-center"
                  min={30}
                  max={150}
                />
                <span className="ml-1">kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* マネキンエリア（固定） */}
        <div className="flex-none h-[180px] border-b border-gray-200">
          {isLoading ? (
            <LoadingWave />
          ) : (
            <MannequinModel height={height} weight={weight} />
          )}
        </div>

        {/* スクロール可能なアイテムリスト */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          <div className="flex-1 overflow-y-auto">
          {fittingItems.length > 0 ? (
            <div className="p-4 space-y-4">
              {fittingItems.map(renderFittingItem)}
            </div>
          ) : (
            <p className="p-4 text-center text-gray-500">試着中のアイテムはありません</p>
          )}
        </div>
        
        {/* 一括操作ボタン */}
        {fittingItems.length > 0 && (
          <div className="flex-none border-t border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBulkFavorite}
                className="flex items-center space-x-2 px-4 py-2 text-sm rounded-sm hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faHeart} className="text-red-300" />
                <span>まとめてお気に入り</span>
              </button>
              
              <button
                onClick={handleBulkAddToCart}
                className="px-4 py-2 text-sm border border-black rounded-sm
                          hover:bg-black hover:text-white transition-all duration-200"
              >
                まとめてカート追加
              </button>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

export default FittingArea;