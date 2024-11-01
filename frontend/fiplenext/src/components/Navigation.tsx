import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHeart } from '@fortawesome/free-regular-svg-icons';
import { faCartShopping, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const Navigation: React.FC = () => {
    return (
        <nav className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-7 py-4 border-b">
            <div className="relative max-w-[200px] w-full md:max-w-[250px]">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg md:text-xl" />
                </span>
                <input
                    type="text"
                    placeholder=""
                    className="w-full border-b border-black px-3 py-1 pl-10 md:pl-12"
                />
            </div>
            <div className="flex gap-5 md:gap-7">
                <Link href="/accounts/login" className="hover:text-gray-500">
                    <FontAwesomeIcon icon={faUser} className="text-lg md:text-xl" />
                </Link>
                <Link href="/favorites" className="hover:text-gray-500">
                    <FontAwesomeIcon icon={faHeart} className="text-lg md:text-xl" />
                </Link>
                <Link href="/cart" className="hover:text-gray-500">
                    <FontAwesomeIcon icon={faCartShopping} className="text-lg md:text-xl" />
                </Link>
            </div>
        </nav>
    );
};

export default Navigation;
