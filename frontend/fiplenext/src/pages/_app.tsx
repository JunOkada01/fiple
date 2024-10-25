import "@styles/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Header from '../components/Header';
import AuthHeader from '../components/AccontsHeader';
import Head from 'next/head'
import Link from "next/link";
import '@fortawesome/fontawesome-svg-core'
import'@fortawesome/free-solid-svg-icons'
import'@fortawesome/react-fontawesome'
//import Image from "next/image";
//import Link from 'next/link'


function App({ Component, pageProps }: AppProps) {
  const router = useRouter();     // ユーザーのURL（ルートパス）を取得
  const isAuthPage = ['/accounts/login', '/accounts/signup'].includes(router.pathname);
  // 現在のパスがログイン・新規登録画面かどうかを判定

  return (
    <>
      <Head>
        <Link rel="preconnect" href="https://fonts.googleapis.com"></Link>
        <Link rel="preconnect" href="https://fonts.gstatic.com"></Link>
        <Link href="https://fonts.googleapis.com/css2?family=Julius+Sans+One&family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet"></Link>
      </Head>
      {/* ログイン・神機登録画面ではAuthHeader、それ以外では通常のHeader */}
      {isAuthPage ? <AuthHeader /> : <Header />}
      <main style={{ padding: '0' }}>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default App;