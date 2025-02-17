import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://54.221.185.90:8000/login/', {
                email,
                password,
            });
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            console.log('ログインに成功しました！:', response.data);
            router.push('/'); // ホームページにリダイレクト
        } catch (error) {
            console.error(error);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            {/* タイトル部分 */}
            <h1 className="text-4xl mt-[50px] mb-5">LOGIN</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-5" /> {/* 区切り線の幅をさらに広く */}

            <div className="flex w-full max-w-xl justify-between items-stretch"> {/* 最大幅を調整 */}
                {/* ログインフォーム */}
                <form className="w-1/2 flex flex-col space-y-8" onSubmit={handleSubmit}>
                    <h2 className="text-[20px] text-center mt-5 mb-5">
                        会員登録されている方
                    </h2>
                    <div className="flex items-center border-b-2 border-gray-500 mb-4">
                        <label className="flex items-center text-sm">
                            <FontAwesomeIcon icon={faEnvelope} className='mr-1 text-lg' />
                        </label>
                        <input
                            type="text"
                            className="mt-1 w-full p-2 text-sm focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='メールアドレスを入力してください'
                            required
                        />
                    </div>
                    <div className="flex items-center border-b-2 border-gray-500 mb-4">
                        <label className="flex items-center text-sm">
                            <FontAwesomeIcon icon={faKey} className='mr-1 text-lg' />
                        </label>
                        <input
                            type="password"
                            className="mt-1 w-full p-2 text-sm focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='パスワードを入力してください'
                            required
                        />
                    </div>
                    <button className="px-20 py-2 bg-black text-white hover:bg-gray-800">
                        ログイン
                    </button>
                    <Link href="/accounts/password/forget" className="text-black underline text-center">
                        パスワードを忘れた？
                    </Link>
                </form>

                {/* 区切り線 */}
                <div className="w-px bg-black mx-10"></div>

                {/* 新規登録リンク */}
                <div className="w-1/2 flex flex-col items-center space-y-6">
                    <h2 className="text-[20px] text-center mt-5 mb-5">
                        会員登録されていない方
                    </h2>
                    <Link href="/accounts/signup">
                        <button className="relative px-20 py-2 text-black border-2 border-black hover:text-white hover:bg-black transition-all">
                            新規登録
                            {/* アウトラン風アウトライン */}
                            <span className="absolute inset-0 border-2 border-pink-500 -z-10 opacity-75 blur-md"></span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;