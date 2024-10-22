import "@styles/styles/globals.css";
import type { AppProps } from "next/app";
import Head from 'next/head';
import Image from "next/image";
import Link from 'next/link';

export default function App({ Component, pageProps }: AppProps) {
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
        <Link href="/accounts/signup">新規登録</Link>
        <Link href="/accounts">ユーザー一覧</Link>
        <Link href="/accounts/login">ログイン</Link>
        <Link href="/">Home</Link>
      </nav>
      <Component {...pageProps} />
    </>
  );
}
