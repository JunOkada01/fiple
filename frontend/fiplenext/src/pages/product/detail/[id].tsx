// pages/products/[productId].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface ProductDetailProps {
    id: string;
    product_name: string;
    category: { id: string; category_name: string };
    subcategory: { id: string; subcategory_name: string };
    gender: string;
    description: string;
    is_active: boolean;
    products: { id: string; color: { color_name: string }; size: { size_name: string }; stock: number; price: number; status: string }[];
    images: { id: string; image: string; image_description: string }[];
}

const ProductDetail: React.FC = () => {
    const router = useRouter();
    const { productId } = router.query;
    const [product, setProduct] = useState<ProductDetailProps | null>(null);

    useEffect(() => {
        if (productId) {
            fetch(`/api/products/${productId}`)
                .then((response) => response.json())
                .then((data) => setProduct(data))
                .catch((error) => console.error(error));
        }
    }, [productId]);

    if (!product) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row">
                {/* 左側: 商品画像 */}
                <div className="md:w-1/2 mb-4 border">
                    <div className="border rounded-lg overflow-hidden">
                        {product.images.map((img) => (
                            <img key={img.id} className="w-full h-auto" src={img.image} alt={product.product_name} />
                        ))}
                    </div>
                    <p className="mt-2 text-gray-600">{product.description}</p>
                </div>
                {/* 右側: 商品情報 */}
                <div className="md:w-1/2 md:pl-6">
                    <h1 className="text-2xl font-bold">{product.product_name}</h1>
                    <p className="text-xl text-gray-700">¥{product.products[0].price.toLocaleString()}</p>
                    <div className="border-t border-gray-300 mt-4 mb-4"></div>
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border-b border-gray-300 p-2 text-left">カラー</th>
                                <th className="border-b border-gray-300 p-2 text-left">サイズ</th>
                                <th className="border-b border-gray-300 p-2 text-left">在庫状況</th>
                                <th className="border-b border-gray-300 p-2 text-left">アクション</th>
                            </tr>
                        </thead>
                        <tbody>
                            {product.products.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-100">
                                    <td className="border-b border-gray-300 p-2">{p.color.color_name}</td>
                                    <td className="border-b border-gray-300 p-2">{p.size.size_name}</td>
                                    <td className="border-b border-gray-300 p-2">{p.stock > 0 ? '在庫あり' : '在庫切れ'}</td>
                                    <td className="border-b border-gray-300 p-2">
                                        <button className="bg-blue-500 text-white px-4 py-2 rounded" disabled={p.stock === 0}>
                                            カートに入れる
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
