import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [error, setError] = useState<string>('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await axios.post('http://localhost:8000/login/', {
                email: formData.email,
                password: formData.password,
            });
            
            if (response.data.message === "Login successful!") {
                router.push('/'); // ホームページにリダイレクト
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'ログインに失敗しました。');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl mt-[100px] mb-5">LOGIN</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-5" />

            <div className="flex w-full max-w-2xl justify-between items-stretch">
                {/* ログインフォーム */}
                <form className="w-1/2 flex flex-col space-y-8" onSubmit={handleSubmit}>
                    <h2 className="text-[20px] font-semibold text-center mt-5 mb-5">
                        会員登録されている方
                    </h2>
                    
                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center border-b-2 border-gray-400 mb-4">
                        <label className="flex items-center text-sm">
                            <Mail className="mr-2" size={20} />
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="mt-1 w-full p-2 text-m focus:outline-none"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="メールアドレスを入力してください"
                            required
                        />
                    </div>

                    <div className="flex items-center border-b-2 border-gray-400 mb-4">
                        <label className="flex items-center text-m">
                            <Lock className="mr-2" size={20} />
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="mt-1 w-full p-2 text-sm focus:outline-none"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="パスワードを入力してください"
                            required
                        />
                    </div>

                    <button 
                        type="submit"
                        className="px-20 py-2 bg-black text-white hover:bg-gray-800"
                    >
                        ログイン
                    </button>

                    <Link 
                        href="/accounts/password/forget" 
                        className="text-black underline text-center"
                    >
                        パスワードを忘れた？
                    </Link>
                </form>

                {/* 区切り線 */}
                <div className="w-px bg-black mx-10"></div>

                {/* 新規登録リンク */}
                <div className="w-1/2 flex flex-col items-center space-y-6">
                    <h2 className="text-[20px] font-semibold text-center mt-5 mb-5">
                        会員登録されていない方
                    </h2>
                    <Link href="/accounts/signup">
                        <button className="relative px-20 py-2 text-black font-semibold border-2 border-black hover:text-white hover:bg-black transition-all">
                            新規登録
                            <span className="absolute inset-0 border-2 border-pink-500 -z-10 opacity-75 blur-md"></span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;