import React, { useState } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";
import Link from "next/link";
import ProductCard from "@styles/components/ProductCard";
import AllMensLadiesKidsFilter from "@styles/components/AllMensLadiesKidsFilter";
import FittingArea from "../../../components/VrFitting";
import { px } from "framer-motion";

interface ProductVariantType {
    id: number;
    price: number;
    images: Array<{
        id: number;
        image: string;
        image_description: string | null;
    }>;
}

interface ProductCategoryType {
    id: number;
    product_name: string;
    product_origin_id: number;
    category: { id: number; category_name: string };
    subcategory: { id: number; subcategory_name: string };
    price: number;
    images: { id: number; image: string; image_description: string }[];
    size: { id: number; size_name: string; order: number }[];
    color: { id: number; color_name: string; color_code: string }[];
    variants: ProductVariantType[];
}

interface CategoryPageProps {
    products: ProductCategoryType[];
    categoryName: string;
}

export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async (context) => {
    const { categoryName } = context.params!;
    try {
        const res = await axios.get(`http://127.0.0.1:8000/api/products/category/${categoryName}`);
        const products = res.data;
        return { props: { products, categoryName: categoryName as string } };
    } catch (error) {
        console.error("商品データの取得に失敗しました", error);
        return { props: { products: [], categoryName: categoryName as string } };
    }
};

const CategoryPage: React.FC<CategoryPageProps> = ({ products, categoryName }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100; // 1ページあたりの表示件数

    // 現在のページに表示する商品
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="container mx-auto max-w-screen-xl px-4">
        <AllMensLadiesKidsFilter />
        <div className="flex justify-center items-center flex-col">
            <h1 className="text-xl text-center my-5">{categoryName}</h1>
            <div className="grid grid-cols-5 gap-2 min-w-[700px] w-auto max-w-[1000px]">
                {currentProducts.length === 0 ? (
                    <div className="text-center">商品が見つかりませんでした。</div>
                ) : (
                    currentProducts.map((product) => {
                    const imageUrl = product.images[0]?.image
                        ? `http://127.0.0.1:8000/${product.images[0].image}`
                        : "";
                    return (
                        <ProductCard
                        key={product.id}
                        id={product.product_origin_id}
                        product_id={product.id}
                        productName={product.product_name}
                        categoryName={product.category.category_name}
                        subcategoryName={product.subcategory.subcategory_name}
                        price={product.price}
                        imageUrl={imageUrl}
                        />
                    );
                    })
                )}
            </div>
            {/* ページネーション */}
            <div className="m-5 text-center">
                <div className="inline-flex justify-center items-center my-4 space-x-2">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                        key={index}
                        className={`
                            transition-all duration-200 rounded-full border-2 
                            ${currentPage === index + 1 
                            ? 'w-10 h-10 bg-black text-white border-black text-base' 
                            : 'w-10 h-10 bg-white text-black border-gray-300 hover:border-black text-sm'
                            }
                        `}
                        onClick={() => handlePageChange(index + 1)}
                        >
                        {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        {/* <div className="text-center m-4">
            <Link href={"/"} className="text-center">
            <button className="relative border border-black px-6 py-2 my-5 overflow-hidden group">
                <span className="absolute inset-0 bg-black transform -translate-x-full transition-transform duration-300 ease-in-out group-hover:translate-x-0"></span>
                <span className="relative text-black transition-colors duration-300 ease-in-out group-hover:text-white">
                BACK
                </span>
            </button>
            </Link>
        </div> */}
        <FittingArea />
        </div>
    );
};

export default CategoryPage;
