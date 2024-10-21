import Image from 'next/image';
import Link from 'next/link';
import Navigation from './Navigation';

const Header: React.FC = () => {
    return (
        <>
            {/* ヘッダー部分 */}
            <header className="flex justify-center border-b">
                <Link href="/">
                    <Image src="/fipleheader.png" alt="fipleheader" width="200" height="80" 
                    />
                </Link>
            </header>
            {/* ナビゲーション部分 */}
            <Navigation />
        </>
    );
};

export default Header;