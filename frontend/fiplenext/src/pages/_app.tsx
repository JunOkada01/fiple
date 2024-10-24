import "@styles/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Header from '../components/Header';
import AuthHeader from '../components/AuthHeader';

//import Head from 'next/head'
//import Image from "next/image";
//import Link from 'next/link'


function App({ Component, pageProps }: AppProps) {
  const router = useRouter();     // ユーザーのURL（ルートパス）を取得
  const isAuthPage = ['/auth/login', '/auth/signup'].includes(router.pathname);
  // 現在のパスがログイン・新規登録画面かどうかを判定

  return (
    <>
      {/* ログイン・神機登録画面ではAuthHeader、それ以外では通常のHeader */}
      {isAuthPage ? <AuthHeader /> : <Header />}
      <main style={{ padding: '0' }}>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default App;