import React, { useState } from 'react';

// CategoryとSubCategoryのインターフェース
interface SubCategory {
    id: number;
    subcategory_name: string;
}
interface Category {
    id: number;
    category_name: string;
    subcategories: SubCategory[];
}
interface SideMenuProps {
    categories: Category[]; // 親コンポーネントから渡されるカテゴリデータ
}

const SideMenu: React.FC<SideMenuProps> = ({categories}) => {
    // カテゴリーはアクティブかどうかの判定でサブカテゴリーの表示を切り替えることができる
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

    // サブカテゴリの表示・非表示を切り替える
    const handleCategoryClick = (categoryId: number) => {
        if (activeCategoryId === categoryId) {
            setActiveCategoryId(null); // すでにアクティブな場合は非表示にする
        } else {
            setActiveCategoryId(categoryId); // クリックされたカテゴリをアクティブにする
        }
    };

    return (
        <div className='side-menu'>
            {/* サイドメニュー */}
            <div className='menu1'>
                <ul>
                    {categories.map((category) => (
                        <li key={category.id}>
                            <div onClick={() => handleCategoryClick(category.id)}>
                                {category.category_name}
                            </div>
                            {/* サブカテゴリがアクティブなカテゴリにのみ表示される */}
                            {activeCategoryId === category.id && (
                                <ul>
                                    {category.subcategories.map((subcategory) => (
                                        <li key={subcategory.id}>
                                            {subcategory.subcategory_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SideMenu;