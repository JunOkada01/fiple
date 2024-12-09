import { useState } from 'react';
import axios from 'axios';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post('http://localhost:8000/password-reset/', {
                email,
            });
            setMessage('パスワードリセットリンクをメールで送信しました。');
        } catch (error) {
            setMessage('エラーが発生しました。正しいメールアドレスを入力してください。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl mt-[50px] mb-8">PASSWORD RESET</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-5" />

            <div className="flex flex-col items-center w-full max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className='flex items-center mb-4'>
                        <label className="block text-sm mb-2">
                            メールアドレス
                            <input
                                type="email"
                                className="mt-1 w-full p-2 text-xl border-b-2 border-gray-400 focus:outline-none focus:border-black transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        {isLoading ? '送信中...' : 'リセットリンクを送信'}
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

export default ForgetPassword;