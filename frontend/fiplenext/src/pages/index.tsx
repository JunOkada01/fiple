import { GetServerSideProps } from 'next';
import ProductCard from '../components/ProductCard'; // ProductCardをインポート
import { Card } from "../../@/components/ui/card";

interface Product {
  id: number;
  category: {
    id: number;
    category_name: string;
  };
  price: number;
  images: {
    id: number;
    image: string;
    image_description: string;
  }[];
}

interface ProductListProps {
  products: Product[];
}

export const getServerSideProps: GetServerSideProps<ProductListProps> = async () => {
  const res = await fetch('http://127.0.0.1:8000/api/products/');
  const products = await res.json();

  return {
    props: {
      products,
    },
  };
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      {/* 性別カテゴリメニュー */}
      <ul className="flex justify-center items-center my-12">
        <li className="px-4 border-l border-r border-gray-300">ALL</li>
        <li className="px-4 border-l border-r border-gray-300">MENS</li>
        <li className="px-4 border-l border-r border-gray-300">LADIES</li>
        <li className="px-4 border-l border-r border-gray-300">KIDS</li>
      </ul>

      {/* 商品リスト */}
      <div className="flex justify-center items-center flex-col">
        <div className="flex flex-col space-y-6">
          <p className="text-lg text-center">カテゴリ名</p>
          <div className="flex overflow-x-auto max-w-[800px] gap-3 p-2 scrollbar-hide">
            {products.map((product) => (
              <ProductCard 
                id={product.id}
                categoryName={product.category.category_name}
                price={product.price}
                imageUrl={`http://127.0.0.1:8000/${product.images[0]?.image}`} // 画像のURLを設定
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
