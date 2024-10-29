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
        <nav className="flex justify-center items-center gap-7 py-5">
            <div className="relative max-w-[250px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[24px]" />
                </span>
                <input
                    type="text"
                    placeholder=""
                    className="w-full border-b border-black px-4 py-1 pl-10"
                />
            </div>
            <div className="flex gap-7">
                <Link href="/accounts/login" className="hover:text-gray-400">
                    <FontAwesomeIcon icon={faUser} className="text-[24px]" />
                </Link>
                <Link href="/favorites" className="hover:text-gray-400">
                    <FontAwesomeIcon icon={faHeart} className="text-[24px]" />
                </Link>
                <Link href="/cart" className="hover:text-gray-400">
                    <FontAwesomeIcon icon={faCartShopping} className="text-[24px]" />
                </Link>
            </div>
        </nav>
    );
};

export default Navigation;