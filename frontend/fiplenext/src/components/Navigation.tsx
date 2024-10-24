// components/Navigation.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image'

const Navigation: React.FC = () => {
  return (
        <nav className="flex justify-center items-center p-2 border-b space-x-4">
            {/* 検索バー */}
            <div className="relative max-w-[250px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Image src="/navigation/search.png" alt="Search" width={20} height={20} />
            </span>
            <input
                type="text"
                placeholder=""
                className="w-full border-b border-black px-4 py-2 pl-10"
            />
            </div>
            
            {/* アイコン */}
            <div className="flex items-center space-x-4">
                <Link href="/auth/profile" passHref>
                <Image className="mt-[10px] mb-[10px]" src="/navigation/human.png" alt="human" width={25} height={25} />
                </Link>
                <Link href="/favorites" passHref>
                <Image className="mt-[10px] mb-[10px]" src="/navigation/heart.png" alt="fipleheader" width={20} height={20} />
                </Link>
                <Link href="/cart" passHref>
                <Image className="mt-[10px] mb-[10px]" src="/navigation/cart.png" alt="fipleheader" width={20} height={20} />
                </Link>
            </div>
        </nav>
  );
};

export default Navigation;
