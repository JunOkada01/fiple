import Link from 'next/link';
import Image from 'next/image';

const AuthHeader: React.FC = () => {
    return (
        <header>
        <div>
            <Link href="/">
            <Image className="mt-[10px] mb-[10px]" src="/fipleheader.png" alt="fipleheader" width="200" height="80" />
            </Link>
        </div>
        </header>
    );
};

export default AuthHeader;
