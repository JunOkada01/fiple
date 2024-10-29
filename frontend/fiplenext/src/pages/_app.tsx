import "@styles/styles/globals.css";
import type { AppProps } from "next/app";
import Head from 'next/head';
import Image from "next/image";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // ログイン状態の確認
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    // ログアウト処理
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <>
      <Head>
        <title>My App</title>
      </Head>
      <div className="flex justify-center border-b">
        <Link href="/" passHref>
          <Image className="mt-[10px] mb-[10px]" src="/fipleheader.png" alt="fipleheader" width="200" height="80" />
        </Link>
      </div>
      <nav className="flex justify-center space-x-4">
        {isLoggedIn ? (
          <>
            <Link href="/accounts">ユーザー一覧</Link>
            <button onClick={handleLogout}>ログアウト</button>
          </>
        ) : (
          <>
            <Link href="/accounts/signup">新規登録</Link>
            <Link href="/accounts/login">ログイン</Link>
          </>
        )}
        <Link href="/">Home</Link>
      </nav>
      <Component {...pageProps} />
    </>
  );
}
