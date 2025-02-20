import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { token } = router.query;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('パスワードが一致しません。');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('http://127.0.0.1:8000/password-reset/confirm/', {
                token,
                password,
            });
            setMessage('パスワードを変更しました。');
            setTimeout(() => {
                router.push('/accounts/login');
            }, 2000);
        } catch (error) {
            console.log(error);
            setMessage('エラーが発生しました。もう一度お試しください。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl mt-[50px] mb-8">NEW PASSWORD</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-5" />

            <div className="flex flex-col items-center w-full max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className='flex items-center mb-4'>
                        <label className="block text-sm mb-2">
                            新しいパスワード
                            <input
                                type="password"
                                className="mt-1 w-full p-2 text-xl border-b-2 border-gray-400 focus:outline-none focus:border-black transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm mb-2">
                            パスワードの確認
                            <input
                                type="password"
                                className="mt-1 w-full p-2 text-xl border-b-2 border-gray-400 focus:outline-none focus:border-black transition-colors"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        {isLoading ? '処理中...' : 'パスワードを変更'}
                    </button>
                </form>
                {message && (
                    <div className="mt-4 p-4 text-center rounded">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;