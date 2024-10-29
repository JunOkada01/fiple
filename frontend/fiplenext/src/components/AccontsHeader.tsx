import Link from 'next/link';
import Image from 'next/image';

const AccountsHeader: React.FC = () => {
    return (
        <>
        {/* 認証関連ヘッダー部分 */}
        <header
            className="flex items-center justify-center border-b"
            style={{ height: '140px' }} // 縦幅140pxを設定
        >
            <Link href="/">
            <Image
                src="/fipleheader.png"
                alt="fipleheader"
                width={200}
                height={80}
                style={{ objectFit: 'contain' }} // 画像の比率を維持
            />
            </Link>
        </header>
        </>
    );
};

export default AccountsHeader;
