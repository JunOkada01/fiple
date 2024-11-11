// src/components/Footer.js
import Link from 'next/link';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* ロゴと紹介文 */}
        <div className={styles.section}>
          <b><h2>fiple</h2></b>
          <p>シンプルで直感的な買い物体験を</p>
        </div>
        
        {/* サイトリンクセクション */}
        <div className={styles.section}>
          <b><h3>クイックリンク</h3></b>
          <ul>
            <li><Link href="/">商品一覧</Link></li>
            <li><Link href="#">会社概要</Link></li>
            <li><Link href="/contact/contact">お問い合わせ</Link></li>
            <li><Link href="#">よくある質問</Link></li>
            <li><Link href="#">利用規約</Link></li>
            <li><Link href="#">プライバシーポリシー</Link></li>
          </ul>
        </div>

        {/* カスタマーサービスセクション */}
        <div className={styles.section}>
          <b><h3>カスタマーサービス</h3></b>
          <ul>
            <li><Link href="/shipping">配送情報</Link></li>
            <li><Link href="/returns">返品について</Link></li>
            <li><Link href="/tracking">注文追跡</Link></li>
          </ul>
        </div>

        {/* ソーシャルメディア */}
        <div className={styles.section}>
        <b><h3>フォローする</h3></b>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          </div>
        </div>
      </div>

      {/* 著作権表示 */}
      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} Fiple. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
