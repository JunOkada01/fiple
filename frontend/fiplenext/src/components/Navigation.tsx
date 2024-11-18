import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Regularスタイルのアイコンをインポート
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
// Cartアイコンはsolid版を使用
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

const Navigation: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // ここでトークンやユーザー情報のチェックを行い、ログイン状態を更新する
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    }, []);

    return (
        <nav className="flex justify-center items-center gap-7 py-5 border-b">
            <div className="relative max-w-[250px]">
                <span className="absolute inset-y-0 left-0 pl-2 flex items-center">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg" />
                </span>
                <input
                    type="text"
                    placeholder="search"
                    className="w-full border-b border-black px-4 pl-10 focus:outline-none text-gray-500"
                />
            </div>
            <div className="flex gap-7">
            {isLoggedIn ? (
                <>
                    <Link href="/accounts/profile" className="hover:text-gray-400">
                        <FontAwesomeIcon icon={faUser} className="text-lg" />
                    </Link>
                    <Link href="/favorites" className="hover:text-gray-400">
                        <FontAwesomeIcon icon={faHeart} className="text-lg" />
                    </Link>
                    <Link href="/cart" className="hover:text-gray-400">
                        <FontAwesomeIcon icon={faCartShopping} className="text-lg" />
                    </Link>
                </>
            ) : (
                <>
                    <Link href="/accounts/login" className="hover:text-gray-400">
                        <FontAwesomeIcon icon={faUser} className="text-lg" />
                    </Link>
                    <Link href="/accounts/login" className="hover:text-gray-400">
                        <FontAwesomeIcon icon={faHeart} className="text-lg" />
                    </Link>
                    <Link href="/accounts/login" className="hover:text-gray-400">
                        <FontAwesomeIcon icon={faCartShopping} className="text-lg" />
                    </Link>
                </>
            )}
            </div>
        </nav>
    );
};

export default Navigation;
