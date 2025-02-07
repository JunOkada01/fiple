import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHeart, faBell } from '@fortawesome/free-regular-svg-icons';
import { faCartShopping, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

interface NavigationProps {
  onSearch: (query: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onSearch }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    onSearch(value);
  };

  return (
    <nav className="flex justify-center items-center gap-7 py-5 border-b">
      <div className="relative max-w-[250px] w-full">
        <span className="absolute inset-y-0 left-0 pl-2 pb-1 flex items-center">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg" />
        </span>
        <input
          type="text"
          placeholder="search..."
          value={searchInput}
          onChange={handleSearchChange}
          className="w-full border-b border-black px-4 pl-10 focus:outline-none text-gray-500"
        />
      </div>
      <div className="flex gap-7">
        {isLoggedIn ? (
          <>
            <Link href="/accounts/profile" className="hover:text-gray-400">
              <FontAwesomeIcon icon={faUser} className="text-lg" />
            </Link>
            <Link href="/notifications" className="hover:text-gray-400">
            <FontAwesomeIcon icon={faBell} className="text-lg" />
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
            <Link href="/notifications" className="hover:text-gray-400">
            <FontAwesomeIcon icon={faBell} className="text-lg" />
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