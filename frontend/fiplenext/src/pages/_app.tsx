import "@styles/styles/globals.css";
import type { AppProps } from "next/app";
import Header from '../components/Header';
import Navigation from '../components/Navigation'
export default function App({ Component, pageProps }: AppProps) {
  return(
    <>
    <Header />
    <Navigation />
    <Component {...pageProps} />
    </>
  );
}
