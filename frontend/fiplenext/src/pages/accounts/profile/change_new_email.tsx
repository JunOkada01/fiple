/* メールのリンクを踏んだ時に表示される変更ページ */
import React, { useState } from 'react';
import { useRouter } from 'next/router';

const NewEmail: React.FC = () => {
    const [newEmail, setNewEmail] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 実際の処理は未実装。ここで新しいメールアドレスを送信する処理を行います。
        
        // メールアドレス変更処理が成功したら、登録情報画面にリダイレクト
        router.push('/accounts/profile'); // ここでリダイレクト先のパスを指定
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl mt-[100px] mb-5">NEW EMAIL ADDRESS</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-10" />

            <div className="flex flex-col items-center w-full max-w-lg">
                <form className="w-full space-y-8" onSubmit={handleSubmit}>
                    <div className="flex items-center mb-5">
                        <label className="text-left text-lg w-1/3">新しいメールアドレス</label>
                        <input
                            type="email"
                            placeholder="新しいメールアドレス"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="ml-4 mt-1 w-3/4 text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-black text-white text-xl hover:bg-gray-800 transition duration-200"
                    >
                        メールアドレスを変更
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewEmail;
