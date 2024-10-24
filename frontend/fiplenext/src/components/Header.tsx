// components/Header.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

const Header: React.FC = () => {
  return (
    <>
      <Head>
        <title>header</title> {/* ページタイトルを設定 */}
      </Head>
      <header>
        <div className="flex justify-center border-b">
          <Link href="/" passHref>
            <Image className="mt-[10px] mb-[10px]" src="/fipleheader.png" alt="fipleheader" width={200} height={80} />
          </Link>
        </div>
      </header>
    </>
  );
};

export default Header;
