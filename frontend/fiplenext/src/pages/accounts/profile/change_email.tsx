/* 現在のメールアドレスに変更ページへのリンクを送信する */
import React, { useState } from 'react';

const ChangeEmail: React.FC = () => {
    const [currentEmail, setCurrentEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('確認メールが送信されました。'); // 実際の処理は未実装
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl mt-[100px] mb-5">CHANGE EMAIL</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-10" />

            <div className="flex flex-col items-center w-full max-w-lg">
                <form className="w-full space-y-8" onSubmit={handleSubmit}>
                    <div className="flex items-center mb-5">
                        <label className="text-left text-lg w-1/3">現在のメールアドレス</label>
                        <input
                            type="email"
                            placeholder="現在のメールアドレス"
                            value={currentEmail}
                            onChange={(e) => setCurrentEmail(e.target.value)}
                            className="ml-4 mt-1 w-3/4 text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-black text-white text-xl hover:bg-gray-800 transition duration-200"
                    >
                        メールを送信
                    </button>
                </form>

                {message && <p className="mt-4 text-red-500">{message}</p>}
            </div>
        </div>
    );
};

export default ChangeEmail;
