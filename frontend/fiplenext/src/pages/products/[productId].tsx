import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ProductDetailType } from './product';

const ProductDetail: React.FC = () => {
  const router = useRouter();
  const { productId } = router.query;
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // メッセージの状態

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/products/${productId}/`);
        setProduct(response.data);
        if (response.data.variants[0]?.images[0]) {
          setSelectedImage(response.data.variants[0].images[0].image);
        }
      } catch (err) {
        setError('商品情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // 商品をカートに追加する関数
  const addToCart = async (productId: number) => {
    const access_token = localStorage.getItem('access_token');
    try {
      const response = await axios.post(
        'http://localhost:8000/api/cart/add/',
        { product_id: productId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      setMessage(response.data.message); // 成功メッセージを表示
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.error || '商品の追加に失敗しました');
      } else {
        setMessage('エラーが発生しました');
      }
    }
  };


  if (loading) return <div className="container mx-auto p-4">読み込み中...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!product) return null;

  // 商品バリエーションをカラーでグループ化
  const groupedVariants = product.variants.reduce((acc, variant) => {
    const colorName = variant.color.color_name;
    if (!acc[colorName]) {
      acc[colorName] = [];
    }
    acc[colorName].push(variant);
    return acc;
  }, {} as Record<string, typeof product.variants>);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row">
        {/* 左側: 商品画像セクション */}
        <div className="md:w-1/2 mb-4">
          <div className="border rounded-lg overflow-hidden">
            {selectedImage && (
              <img
                className="w-full h-auto"
                src={`http://127.0.0.1:8000${selectedImage}`}
                alt={product.product_name}
              />
            )}
          </div>
          {/* サムネイル画像一覧 */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {product.variants.flatMap((variant) =>
              variant.images.map((image) => (
                <div
                  key={image.id}
                  className={`border rounded cursor-pointer ${
                    selectedImage === image.image ? 'border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedImage(image.image)}
                >
                  <button>{variant.color.color_name}</button>
                </div>
              ))
            )}
          </div>
          {/* 商品説明 */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">商品説明</h3>
            <p className="mt-2 text-gray-600">{product.description}</p>
          </div>
          {/* タグ */}
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {tag.tag_name}
              </span>
            ))}
          </div>
        </div>

        {/* 右側: 商品情報テーブル */}
        <div className="md:w-1/2 md:pl-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">{product.product_name}</h1>
            <div className="text-sm text-gray-600">
              {product.category.category_name} &gt; {product.subcategory.subcategory_name}
            </div>
          </div>

          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-gray-300 p-2 text-left">カラー</th>
                <th className="border-b border-gray-300 p-2 text-left">サイズ</th>
                <th className="border-b border-gray-300 p-2 text-left">価格</th>
                <th className="border-b border-gray-300 p-2 text-left">在庫状況</th>
                <th className="border-b border-gray-300 p-2 text-left">アクション</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedVariants).map(([colorName, variants]) => (
                <React.Fragment key={colorName}>
                  {variants.map((variant, index) => (
                    <tr key={variant.id} className="hover:bg-gray-100">
                      {index === 0 && (
                        <td className="border-b border-gray-300 p-2" rowSpan={variants.length}>
                          {colorName}
                        </td>
                      )}
                      <td className="border-b border-gray-300 p-2">{variant.size.size_name}</td>
                      <td className="border-b border-gray-300 p-2">¥{variant.price.toLocaleString()}</td>
                      <td className="border-b border-gray-300 p-2">
                        {variant.stock > 0 ? (
                          <span className="text-green-600">在庫あり</span>
                        ) : (
                          <span className="text-red-600">在庫なし</span>
                        )}
                      </td>
                      <td className="border-b border-gray-300 p-2">
                        <button
                            className={`px-4 py-2 rounded ${
                              variant.stock > 0 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                            onClick={() => variant.stock > 0 && addToCart(variant.id)}
                            disabled={variant.stock === 0}
                          >
                            {variant.stock > 0 ? 'カートに入れる' : '在庫なし'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* メッセージの表示 */}
          {message && <div className="mt-4 text-center text-green-500">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
