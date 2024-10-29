import Link from 'next/link';

const Navigation: React.FC = () => {
    return (
        <nav className="flex justify-center gap-6 py-5">
            <div className="relative max-w-[250px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
            </span>
            <input
                type="text"
                placeholder=""
                className="w-full border-b border-black px-4 py-2 pl-10"
            />
            </div>
            <Link href="/profile" className="hover:text-gray-400">Account</Link>
            <Link href="/favorites" className="hover:text-gray-400">Favorites</Link>
            <Link href="/cart" className="hover:text-gray-400">Cart</Link>
        </nav>
    );
};

export default Navigation;
