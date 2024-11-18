import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        {/* グローバルに必要なメタタグなどをここに配置 */}
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Your website description" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

