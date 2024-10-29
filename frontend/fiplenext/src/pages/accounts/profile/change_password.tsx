import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const ChangePass: React.FC = () => {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // パスワード変更処理は未実装です。
        
        // 成功したら登録情報画面にリダイレクト
        router.push('/accounts/profile'); // ここでリダイレクト先のパスを指定
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl font-bold mt-[100px] mb-5">CHANGE PASSWORD</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-10" />

            <div className="flex flex-col items-center w-full max-w-lg">
                <form className="w-full space-y-8" onSubmit={handleSubmit}>
                    <div className='flex items-center mb-5'>
                        <label className="text-left text-lg w-1/3">
                            現在のパスワード
                        </label>
                        <input
                            type="password"
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                            placeholder="現在のパスワード"
                        />
                    </div>
                    <div className='flex items-center mb-5'>
                        <label className="text-left text-lg w-1/3">
                            新しいパスワード
                        </label>
                        <input
                            type="password"
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                            placeholder="新しいパスワード"
                        />
                    </div>
                    <div className='flex items-center mb-5'>
                        <label className="text-left text-lg w-1/3">
                            新しいパスワードの確認
                        </label>
                        <input
                            type="password"
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                            placeholder="パスワードの確認"
                        />
                    </div>
                    <button
                        type="submit"
                        className='w-full py-2 bg-black text-white text-xl hover:bg-gray-800 transition duration-200'
                    >
                        パスワードを変更する
                    </button>
                </form>
                <Link href="#" className="text-black underline text-center mt-8">
                    パスワードを忘れた？
                </Link>
            </div>
        </div>
    );
};

export default ChangePass;
