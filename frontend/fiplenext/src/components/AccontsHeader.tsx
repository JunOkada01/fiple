import Link from 'next/link';
import Image from 'next/image';

const AccountsHeader: React.FC = () => {
    return (
        <>
            {/* 認証関連ヘッダー部分 */}
            <header className="flex items-center justify-center border-b w-full h-20 sm:h-28 md:h-32 lg:h-36 mx-auto">
                <Link href="/" className="flex justify-center w-full">
                    <Image
                        src="/fiple3.png"
                        alt="fipleheader"
                        width={200}
                        height={80}
                        className="object-contain max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
                    />
                </Link>
            </header>
        </>
    );
};

export default AccountsHeader;
