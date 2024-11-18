// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import axios from 'axios';

// interface Product {
//     product_name: string;
//     id: number;  // ProductのID
// }

// interface ReviewFormData {
//     user:
//     rating: number;
//     review_detail: string;
//     subject: string;
// }

// const ProductReviewWrite = () => {
//     const router = useRouter();
//     const { productId } = router.query;
//     const [product, setProduct] = useState<Product | null>(null);
//     const [formData, setFormData] = useState<ReviewFormData>({
//         rating: 5,
//         review_detail: '',
//         subject: '',
//     });
//     const [error, setError] = useState<string>('');
//     const [loading, setLoading] = useState<boolean>(false);
    
//     useEffect(() => {
//       const accessToken = localStorage.getItem('access_token');
//       if (!accessToken) {
//           router.push('/accounts/login');
//       } else {
//           axios.post('http://localhost:8000/api/token/verify/', {
//               token: localStorage.getItem('access_token')
//           }).catch(() => {
//               router.push('/accounts/login');
//           });
//       }
//   }, [router]);

//     useEffect(() => {
//         const fetchProduct = async () => {
//             if (!productId) return;
//             try {
//                 const response = await axios.get(`http://127.0.0.1:8000/api/products/${productId}/`);
//                 setProduct(response.data);
//             } catch (err) {
//                 setError('商品情報の取得に失敗しました');
//             }
//         };

//         fetchProduct();
//     }, [productId]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         try {
//             setLoading(true);
//             setError('');

//             // レビューを投稿
//             await axios.post('http://127.0.0.1:8000/api/reviews/', {
//                 ...formData,
//                 product: productId, // productIdを外部キーとして使用
//             }, {
//                 withCredentials: true  // CookieをCORSリクエストに含める
//             });

//             router.push(`/products/${productId}`);
//         } catch (err: any) {
//             const errorMessage = err.response?.data?.error || 'レビューの投稿に失敗しました';
//             setError(errorMessage);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!product) return <div>商品情報を取得中...</div>;

//     return (
//         <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow">
//             <h1 className="text-2xl font-bold mb-6 text-center">
//                 {product.product_name}のレビューを書く
//             </h1>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
//                     {error}
//                 </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                     <label className="block text-gray-700 mb-2">評価</label>
//                     <select
//                         value={formData.rating}
//                         onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
//                         className="w-full p-2 border rounded"
//                     >
//                         {[5, 4, 3, 2, 1].map(num => (
//                             <option key={num} value={num}>
//                                 {'★'.repeat(num)}{'☆'.repeat(5 - num)}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <div>
//                     <label className="block text-gray-700 mb-2">レビュータイトル</label>
//                     <input
//                         type="text"
//                         value={formData.subject}
//                         onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
//                         className="w-full p-2 border rounded"
//                         placeholder="タイトルを入力"
//                         required
//                     />
//                 </div>

//                 <div>
//                     <label className="block text-gray-700 mb-2">レビュー内容</label>
//                     <textarea
//                         value={formData.review_detail}
//                         onChange={(e) => setFormData({ ...formData, review_detail: e.target.value })}
//                         className="w-full p-2 border rounded h-32"
//                         placeholder="商品の感想を書いてください"
//                         required
//                     />
//                 </div>


//                 <div className="flex justify-center space-x-4">
//                     <button
//                         type="button"
//                         onClick={() => router.back()}
//                         className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//                     >
//                         戻る
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
//                     >
//                         {loading ? '送信中...' : 'レビューを投稿'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// export default ProductReviewWrite;
// src\pages\products\review\writereview\[productId].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Product {
    product_name: string;
    id: number;  // ProductのID
}

interface ReviewFormData {
    user?: number;  // ログイン中のユーザーIDを保持
    rating: number;
    review_detail: string;
    subject: string;
}

const ProductReviewWrite = () => {
    const router = useRouter();
    const { productId } = router.query;
    const [product, setProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ReviewFormData>({
        rating: 5,
        review_detail: '',
        subject: '',
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            router.push('/accounts/login');
        } else {
            axios.post('http://localhost:8000/api/token/verify/', {
                token: accessToken
            }).catch(() => {
                router.push('/accounts/login');
            });
        }
    }, [router]);

    // 商品情報取得
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/products/${productId}/`);
                setProduct(response.data);
            } catch (err) {
                setError('商品情報の取得に失敗しました');
            }
        };

        fetchProduct();
    }, [productId]);

    // レビュー送信
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');
            
            // レビュー投稿
            await axios.post('http://127.0.0.1:8000/api/reviews/write/', {
                ...formData,
                product: productId,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                withCredentials: true  // CookieをCORSリクエストに含める
            });

            router.push(`/products/${productId}`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'レビューの投稿に失敗しました';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!product) return <div>商品情報を取得中...</div>;

    return (
        <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-center">
                {product.product_name}のレビューを書く
            </h1>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2">評価</label>
                    <select
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                        className="w-full p-2 border rounded"
                    >
                        {[5, 4, 3, 2, 1].map(num => (
                            <option key={num} value={num}>
                                {'★'.repeat(num)}{'☆'.repeat(5 - num)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">レビュータイトル</label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="タイトルを入力"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 mb-2">レビュー内容</label>
                    <textarea
                        value={formData.review_detail}
                        onChange={(e) => setFormData({ ...formData, review_detail: e.target.value })}
                        className="w-full p-2 border rounded h-32"
                        placeholder="商品の感想を書いてください"
                        required
                    />
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        戻る
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {loading ? '送信中...' : 'レビューを投稿'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductReviewWrite;
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import axios from 'axios';

// interface Product {
//     product_name: string;
//     id: number;
// }

// interface ReviewFormData {
//     rating: number;
//     review_detail: string;
//     subject: string;
// }

// const ProductReviewWrite = () => {
//     const router = useRouter();
//     const { productId } = router.query;
//     const [product, setProduct] = useState<Product | null>(null);
//     const [formData, setFormData] = useState<ReviewFormData>({
//         rating: 5,
//         review_detail: '',
//         subject: '',
//     });
//     const [error, setError] = useState<string>('');
//     const [loading, setLoading] = useState<boolean>(false);

//     // 認証チェック
//     useEffect(() => {
//         const checkAuth = async () => {
//             const accessToken = localStorage.getItem('access_token');
//             if (!accessToken) {
//                 router.push({
//                     pathname: '/accounts/login',
//                     query: { returnUrl: router.asPath }
//                 });
//                 return;
//             }

//             try {
//                 await axios.post('http://localhost:8000/api/token/verify/', {
//                     token: accessToken
//                 });
//             } catch (err) {
//                 localStorage.removeItem('access_token');
//                 router.push({
//                     pathname: '/accounts/login',
//                     query: { returnUrl: router.asPath }
//                 });
//             }
//         };

//         checkAuth();
//     }, [router]);

//     // 商品情報取得
//     useEffect(() => {
//         const fetchProduct = async () => {
//             if (!productId) return;

//             try {
//                 const accessToken = localStorage.getItem('access_token');
//                 const response = await axios.get(
//                     `http://127.0.0.1:8000/api/products/${productId}/`,
//                     {
//                         headers: {
//                             'Authorization': `Bearer ${accessToken}`
//                         }
//                     }
//                 );
//                 setProduct(response.data);
//             } catch (err) {
//                 if (axios.isAxiosError(err) && err.response?.status === 404) {
//                     setError('商品が見つかりません');
//                 } else {
//                     setError('商品情報の取得に失敗しました');
//                 }
//             }
//         };

//         fetchProduct();
//     }, [productId]);

//     // フォームバリデーション
//     const validateForm = () => {
//         if (formData.subject.trim().length === 0) {
//             setError('レビュータイトルを入力してください');
//             return false;
//         }
//         if (formData.review_detail.trim().length === 0) {
//             setError('レビュー内容を入力してください');
//             return false;
//         }
//         if (formData.review_detail.length < 10) {
//             setError('レビュー内容は10文字以上で入力してください');
//             return false;
//         }
//         return true;
//     };

//     // レビュー送信
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
        
//         if (!validateForm()) {
//             return;
//         }

//         try {
//             setLoading(true);
//             setError('');
            
//             const accessToken = localStorage.getItem('access_token');
//             if (!accessToken) {
//                 throw new Error('ログインが必要です');
//             }

//             const reviewData = {
//                 product: productId,
//                 subject: formData.subject,
//                 review_detail: formData.review_detail,
//                 rating: formData.rating
//             };

//             await axios.post(
//                 'http://127.0.0.1:8000/api/reviews/write/',
//                 reviewData,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${accessToken}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             router.push(`/products/${productId}`);
//         } catch (err) {
//             if (axios.isAxiosError(err)) {
//                 const errorMessage = err.response?.data?.error || 
//                                    err.response?.data?.detail ||
//                                    'レビューの投稿に失敗しました';
//                 setError(errorMessage);
//             } else {
//                 setError('予期せぬエラーが発生しました');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!product) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div className="text-lg">商品情報を取得中...</div>
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow">
//             <h1 className="text-2xl font-bold mb-6 text-center">
//                 {product.product_name}のレビューを書く
//             </h1>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
//                     {error}
//                 </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                     <label className="block text-gray-700 mb-2">評価</label>
//                     <select
//                         value={formData.rating}
//                         onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
//                         className="w-full p-2 border rounded"
//                     >
//                         {[5, 4, 3, 2, 1].map(num => (
//                             <option key={num} value={num}>
//                                 {'★'.repeat(num)}{'☆'.repeat(5 - num)}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <div>
//                     <label className="block text-gray-700 mb-2">レビュータイトル</label>
//                     <input
//                         type="text"
//                         value={formData.subject}
//                         onChange={(e) => {
//                             setError('');
//                             setFormData({ ...formData, subject: e.target.value });
//                         }}
//                         className="w-full p-2 border rounded"
//                         placeholder="タイトルを入力"
//                         maxLength={254}
//                         required
//                     />
//                 </div>

//                 <div>
//                     <label className="block text-gray-700 mb-2">レビュー内容</label>
//                     <textarea
//                         value={formData.review_detail}
//                         onChange={(e) => {
//                             setError('');
//                             setFormData({ ...formData, review_detail: e.target.value });
//                         }}
//                         className="w-full p-2 border rounded h-32"
//                         placeholder="商品の感想を書いてください（10文字以上）"
//                         maxLength={255}
//                         required
//                     />
//                     <div className="text-sm text-gray-500 mt-1">
//                         {formData.review_detail.length}/255文字
//                     </div>
//                 </div>

//                 <div className="flex justify-center space-x-4">
//                     <button
//                         type="button"
//                         onClick={() => router.back()}
//                         className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//                     >
//                         戻る
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
//                     >
//                         {loading ? '送信中...' : 'レビューを投稿'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };
// export default ProductReviewWrite;



// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import axios from 'axios';

// interface Product {
//     product_name: string;
//     id: number;
// }

// interface ReviewFormData {
//     rating: number;
//     review_detail: string;
//     subject: string;
// }

// const ProductReviewWrite = () => {
//     const router = useRouter();
//     const { productId } = router.query;
//     const [product, setProduct] = useState<Product | null>(null);
//     const [formData, setFormData] = useState<ReviewFormData>({
//         rating: 5,
//         review_detail: '',
//         subject: '',
//     });
//     const [error, setError] = useState<string>('');
//     const [loading, setLoading] = useState<boolean>(false);

//     // 認証チェック
//     useEffect(() => {
//         const checkAuth = async () => {
//             const accessToken = localStorage.getItem('access_token');
//             if (!accessToken) {
//                 router.push({
//                     pathname: '/accounts/login',
//                     query: { returnUrl: router.asPath }
//                 });
//                 return;
//             }

//             try {
//                 await axios.post('http://localhost:8000/api/token/verify/', {
//                     token: accessToken
//                 });
//             } catch (err) {
//                 localStorage.removeItem('access_token');
//                 router.push({
//                     pathname: '/accounts/login',
//                     query: { returnUrl: router.asPath }
//                 });
//             }
//         };

//         checkAuth();
//     }, [router]);

//     // 商品情報取得
//     useEffect(() => {
//         const fetchProduct = async () => {
//             if (!productId) return;

//             try {
//                 const response = await axios.get(
//                     `http://127.0.0.1:8000/api/products/${productId}/`
//                 );
//                 setProduct(response.data);
//             } catch (err) {
//                 if (axios.isAxiosError(err) && err.response?.status === 404) {
//                     setError('商品が見つかりません');
//                 } else {
//                     setError('商品情報の取得に失敗しました');
//                 }
//             }
//         };

//         fetchProduct();
//     }, [productId]);

//     // フォームバリデーション
//     const validateForm = () => {
//         if (!formData.subject.trim()) {
//             setError('レビュータイトルを入力してください');
//             return false;
//         }
//         if (!formData.review_detail.trim()) {
//             setError('レビュー内容を入力してください');
//             return false;
//         }
//         if (formData.review_detail.length < 10) {
//             setError('レビュー内容は10文字以上で入力してください');
//             return false;
//         }
//         return true;
//     };

//     // レビュー送信
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
        
//         if (!validateForm()) {
//             return;
//         }

//         try {
//             setLoading(true);
//             setError('');
            
//             const accessToken = localStorage.getItem('access_token');
//             if (!accessToken) {
//                 throw new Error('ログインが必要です');
//             }

//             await axios.post(
//                 'http://127.0.0.1:8000/api/reviews/write/',
//                 {
//                     product: productId,
//                     rating: formData.rating,
//                     subject: formData.subject,
//                     review_detail: formData.review_detail
//                 },
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${accessToken}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }
//             );

//             router.push(`/products/${productId}`);
//         } catch (err) {
//             if (axios.isAxiosError(err)) {
//                 const errorData = err.response?.data;
//                 const errorMessage = 
//                     typeof errorData === 'object' && errorData !== null
//                         ? errorData.error || errorData.detail || Object.values(errorData)[0]
//                         : 'レビューの投稿に失敗しました';
                
//                 setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
//             } else {
//                 setError('予期せぬエラーが発生しました');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!product) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div className="text-lg">商品情報を取得中...</div>
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow">
//             <h1 className="text-2xl font-bold mb-6 text-center">
//                 {product.product_name}のレビューを書く
//             </h1>

//             {error && (
//                 <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
//                     {error}
//                 </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                     <label className="block text-gray-700 mb-2">評価</label>
//                     <select
//                         value={formData.rating}
//                         onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
//                         className="w-full p-2 border rounded"
//                     >
//                         {[5, 4, 3, 2, 1].map(num => (
//                             <option key={num} value={num}>
//                                 {'★'.repeat(num)}{'☆'.repeat(5 - num)}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <div>
//                     <label className="block text-gray-700 mb-2">レビュータイトル</label>
//                     <input
//                         type="text"
//                         value={formData.subject}
//                         onChange={(e) => {
//                             setError('');
//                             setFormData({ ...formData, subject: e.target.value });
//                         }}
//                         className="w-full p-2 border rounded"
//                         placeholder="タイトルを入力"
//                         maxLength={254}
//                         required
//                     />
//                 </div>

//                 <div>
//                     <label className="block text-gray-700 mb-2">レビュー内容</label>
//                     <textarea
//                         value={formData.review_detail}
//                         onChange={(e) => {
//                             setError('');
//                             setFormData({ ...formData, review_detail: e.target.value });
//                         }}
//                         className="w-full p-2 border rounded h-32"
//                         placeholder="商品の感想を書いてください（10文字以上）"
//                         maxLength={255}
//                         required
//                     />
//                     <div className="text-sm text-gray-500 mt-1">
//                         {formData.review_detail.length}/255文字
//                     </div>
//                 </div>

//                 <div className="flex justify-center space-x-4">
//                     <button
//                         type="button"
//                         onClick={() => router.back()}
//                         className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//                     >
//                         戻る
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
//                     >
//                         {loading ? '送信中...' : 'レビューを投稿'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default ProductReviewWrite;