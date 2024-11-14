import Link from 'next/link'; // Next.jsのLinkをインポート
import styles from '../styles/home.module.css'; // CSSモジュールをインポート

const CategorySideMenu: React.FC = () => {
    return (
        <div className="">
            <div className="flex justify-between">
                {/* 左側: カテゴリと商品リスト */}
                <div className="flex w-4/5">
                    {/* カテゴリリスト */}
                    <div className="w-1/4 pr-4">
                        <h2 className="text-lg text-center mb-4">カテゴリ</h2>
                        <ul className={styles.categoryList}>
                            <li className="px-4 border border-gray-300">
                                <Link href="/category">トップス</Link>
                            </li>
                            <li className="px-4 border border-gray-300">
                                <Link href="/category">ボトムス</Link>
                            </li>
                            <li className="px-4 border border-gray-300">
                                <Link href="/category">アウター</Link>
                            </li>
                            <li className="px-4 border border-gray-300">
                                <Link href="/category">アクセサリー</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategorySideMenu;
