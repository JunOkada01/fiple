import React from 'react';  
import { useRouter } from 'next/router';  

const ProductDetail: React.FC = () => {  
    const router = useRouter();  
    const { productId } = router.query;  

    // サンプルデータ（実際はAPIからのデータ取得に置き換えてください）  
    const product = {  
        id: productId,  
        name: 'もっこりストレッチデニム',  
        price: 5800,  
        description: '全カラーの写真を配置',  
        sizes: ['XS', 'S', 'M', 'L', 'XL'],  
        colors: ['青', '黒', '白'],  
        imageUrl: 'path/to/image.jpg'  
    };  

    return (  
        <div className="container mx-auto p-4">  
            <div className="flex flex-col md:flex-row">  
                {/* 左側: 商品画像 */}  
                <div className="md:w-1/2 mb-4 border">  
                    <div className="border rounded-lg overflow-hidden">  
                        <img className="w-full h-auto" src={product.imageUrl} alt={product.name} />
                    </div>  
                    <p className="mt-2 text-gray-600">{product.description}</p>  
                </div>  

                {/* 右側: 商品情報テーブル */}  
                <div className="md:w-1/2 md:pl-6">  
                    <h1 className="text-2xl font-bold">{product.name}</h1>  
                    <p className="text-xl text-gray-700">¥{product.price.toLocaleString()}</p>  

                    <div className="border-t border-gray-300 mt-4 mb-4"></div>  

                    <table className="min-w-full border-collapse">  
                        <thead>  
                            <tr>  
                                <th className="border-b border-gray-300 p-2 text-left">サイズ</th>  
                                <th className="border-b border-gray-300 p-2 text-left">在庫状況</th>  
                                <th className="border-b border-gray-300 p-2 text-left">アクション</th>  
                            </tr>  
                        </thead>  
                        <tbody>  
                            {product.sizes.map((size) => (  
                                <tr key={size} className="hover:bg-gray-100">  
                                    <td className="border-b border-gray-300 p-2">{size}</td>  
                                    <td className="border-b border-gray-300 p-2">在庫あり</td>  
                                    <td className="border-b border-gray-300 p-2">  
                                        <button className="bg-blue-500 text-white px-4 py-2 rounded">カートに入れる</button>  
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