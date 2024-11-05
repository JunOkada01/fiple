import Image from 'next/image';
import Link from 'next/link';
import Navigation from './Navigation';

const Header: React.FC = () => {
    return (
        <>
            {/* ヘッダー部分 */}
            <header className="flex justify-center items-center border-b">
                <Link href="/">
                    <Image
                        src="/fipleheader.png"
                        alt="fipleheader"
                        width={200}
                        height={80}
                        className="w-32 h-16 sm:w-48 md:h-20 sm:w-56 sm:h-24 object-contain"
                    />
                </Link>
            </header>
            {/* ナビゲーション部分 */}
            <Navigation />
        </>
    );
};

export default Header;
