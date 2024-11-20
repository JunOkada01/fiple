import "@styles/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthHeader from '../components/AccontsHeader';
import Head from 'next/head'
import Link from "next/link";
import '@fortawesome/fontawesome-svg-core'
import'@fortawesome/free-solid-svg-icons'
import'@fortawesome/react-fontawesome'
import { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { GOOGLE_FONT_PROVIDER } from "next/dist/shared/lib/constants";
import { motion } from "framer-motion";
//import Image from "next/image";
//import Link from 'next/link'


function App({ Component, pageProps }: AppProps) {
  const router = useRouter();     // ユーザーのURL（ルートパス）を取得
  const isAuthPage = ['/accounts/login', '/accounts/signup', '/footer/company','/footer/privacypolicy','/footer/ToU','/footer/tokushoho'].includes(router.pathname);
  // 現在のパスがログイン・新規登録画面かどうかを判定

  // ローディング状態管理用のステート
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setLoading(true);

      // ローディングが少なくとも1000ms表示されるようにする
      setTimeout(() => {
        setLoading(false); // 最低1000msは表示
      }, 1000);
    };
    
    const handleRouteChangeComplete = () => {
      setLoading(false); // ルート変更が完了したらローディングを非表示
    };
    
    const handleRouteChangeError = () => {
      setLoading(false); // エラーが発生したらローディングを非表示
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  return (
    <>
      <Head>
        <Link rel="preconnect" href="https://fonts.googleapis.com"></Link>
        <Link rel="preconnect" href="https://fonts.gstatic.com"></Link>
        <Link href="https://fonts.googleapis.com/css2?family=Julius+Sans+One&family=Noto+Sans+JP:wght@100..900&display=swap" rel="stylesheet"></Link>
        
      </Head>

      {/* ログイン・新規登録画面ではAuthHeader、それ以外では通常のHeader */}
      {isAuthPage ? <AuthHeader /> : <Header />}
      {/* ローディングアニメーション */}
      <main style={{ padding: '0' }}>
        {loading && (
          <div className="loadingOverlay">
            <ClipLoader color="#000000" size={100} /> {/* スピナーの色とサイズを設定 */}
          </div>
        )}
        <Component {...pageProps} />
      </main>
      <Footer/>
    </>
  );
}

export default App;