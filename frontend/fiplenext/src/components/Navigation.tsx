import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Regularスタイルのアイコンをインポート
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
// Cartアイコンはsolid版を使用
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const Navigation: React.FC = () => {
    return (
        <nav className="flex justify-center items-center gap-6 py-5">
            <div className="relative max-w-[250px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[20px]" />
                </span>
                <input
                    type="text"
                    placeholder=""
                    className="w-full border-b border-black px-4 py-1 pl-10"
                />
            </div>
            <div className="flex gap-6">
                <Link href="/accounts/login" className="hover:text-gray-400">
                    <FontAwesomeIcon icon={faUser} className="text-[20px]" />
                </Link>
                <Link href="/favorites" className="hover:text-gray-400">
                    <FontAwesomeIcon icon={faHeart} className="text-[20px]" />
                </Link>
                <Link href="/cart" className="hover:text-gray-400">
                    <FontAwesomeIcon icon={faCartShopping} className="text-[20px]" />
                </Link>
            </div>
        </nav>
    );
};

export default Navigation;