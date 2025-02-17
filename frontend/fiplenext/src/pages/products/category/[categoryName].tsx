import ProductCard from '@styles/components/ProductCard';
import AllMensLeadiesKidsFilter from '@styles/components/AllMensLadiesKidsFilter';
import React from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';
// import Navigation from '../../../components/Navigation';
import FittingArea from '../../../components/VrFitting';
import Link from 'next/link';


interface ProductVariantType {
    id: number;
    price: number;
    images: Array<{
        id: number;
        image: string;
        image_description: string | null;
    }>;
}

interface ProductDetailType {
    id: number;
    product_name: string;
    product_origin_id: number;
    category: {
        id: number;
        category_name: string;
    };
    subcategory: {
        id: number;
        subcategory_name: string;
    };
    price: number;
    images: {
        id: number;
        image: string;
        image_description: string;
    }[];
    size: {
        id: number;
        size_name: string;
        order: number;
    }[];
    color: {
        id: number;
        color_name: string;
    }[];
    variants: ProductVariantType[];
}

interface CategoryPageProps {
    products: ProductDetailType[];
    categoryName: string;
}

export interface FittingItem {
    id: number;
    product_id: number;
    productName: string;
    categoryName: string;
    subcategoryName: string;
    price: number;
    imageUrl?: string;
}

// サーバーサイドでカテゴリ別の商品データを取得
export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async (context) => {
    const { categoryName } = context.params!;

    try {
        const res = await axios.get(`http://54.221.185.90:8000/api/products/category/${categoryName}`);
        const products = res.data;

        return {
            props: {
                products,
                categoryName: categoryName as string,
            },
        };
    } catch (error) {
        console.error("商品データの取得に失敗しました", error);
        return {
            props: {
                products: [],
                categoryName: categoryName as string,
            },
        };
    }
};

// カテゴリページコンポーネントの定義
const CategoryPage: React.FC<CategoryPageProps> = ({ products, categoryName }) => {
    // const [height] = useState<number>(180);
    // const [weight] = useState<number>(70);
    // const [fittingItems, setFittingItems] = useState<FittingItem[]>([]);

    // const removeItemFromFitting = (id: number) => {
    //     setFittingItems(fittingItems.filter(item => item.id !== id));
    // };

    // const handleAddToCart = () => {
    //     console.log('商品をカートに追加');
    // };


    return (
        <div className="container mx-auto max-w-screen-xl px-4">
            {/* 性別カテゴリメニュー */}
            <AllMensLeadiesKidsFilter />
            {/* 商品リスト */}
            <div className="flex justify-center items-center flex-col">
                <h1 className="text-xl text-center mb-6">{categoryName}</h1>
                <div className="grid grid-cols-4 gap-6 max-w-[700px]">
                    {products.length === 0 ? (
                        <div className="text-center">商品が見つかりませんでした。</div>
                    ) : (
                        products.map((product) => {
                            const imageUrl = product.images[0]?.image 
                                ? `http://54.221.185.90:8000/${product.images[0].image}` 
                                : '';

                            return (
                                <ProductCard
                                    key={product.id}
                                    id={product.product_origin_id}
                                    product_id={product.id}
                                    productName={product.product_name}
                                    categoryName={product.category.category_name}
                                    categoryPosition={product.category.id.toString()}
                                    subcategoryName={product.subcategory.subcategory_name}
                                    price={product.price}
                                    imageUrl={imageUrl} // 画像のURLを設定
                                />
                            );
                        })
                    )}
                </div>
            </div>
            <div className='text-center m-4'>
                <Link href={"/"} className="text-center">
                    <button className="relative border border-black px-6 py-2 my-5 overflow-hidden group">
                        <span className="absolute inset-0 bg-black transform -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0"></span>
                        <span className="relative text-black transition-colors duration-300 ease-in-out group-hover:text-white">
                            BACK
                        </span>
                    </button>
                </Link>
            </div>
            {/* 右側: FittingArea コンポーネント */}
            <FittingArea/>
        </div>
    );
};

export default CategoryPage;
