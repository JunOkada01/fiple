import React, {useState} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

const ChangePass: React.FC = () => {
    const router = useRouter();
    {/* 現在のパス */}
    const [currentPassword, setCurrentPassword] = useState('');
    {/* 新しいパス */}
    const [newPassword, setNewPassword] = useState('');
    {/* 新しいパスの確認 */}
    const [confirmPassword, setConfirmPassword] = useState('');
    {/* エラーメッセージ */}
    const [errorMessage, setErrorMessage] = useState('');
    {/* 成功メッセージ */}
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setErrorMessage('新しいパスワードが一致しません。');
            return;
        }

        try {
            const response = await axios.post(
                'http://34.201.127.158:8000/password-change/', // APIエンドポイント
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`, // JWTトークンを送信
                    },
                }
            );
            setSuccessMessage(response.data.message);
            // 成功したらプロフィールページにリダイレクト
            setTimeout(() => router.push('/accounts/profile'), 2000);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data.error) {
                    setErrorMessage(error.response.data.error);
                } else {
                    setErrorMessage('パスワード変更に失敗しました。もう一度お試しください。');
                }
            } else {
                setErrorMessage('予期しないエラーが発生しました。');
            }
        }
      
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl mt-[100px] mb-5">CHANGE PASSWORD</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-10" />

            <div className="flex flex-col items-center w-full max-w-lg">
                <form className="w-full space-y-8" onSubmit={handleSubmit}>
                    <div className="flex items-center mb-5">
                        <label className="text-left text-sm w-1/3">現在のパスワード</label>
                        <input
                            type="password"
                            className="ml-4 mt-1 w-2/3 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                            placeholder="現在のパスワード"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center mb-5">
                        <label className="text-left text-sm w-1/3">新しいパスワード</label>
                        <input
                            type="password"
                            className="ml-4 mt-1 w-2/3 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                            placeholder="新しいパスワード"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center mb-5">
                        <label className="text-left text-sm w-1/3">新しいパスワードの確認</label>
                        <input
                            type="password"
                            className="ml-4 mt-1 w-2/3 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                            placeholder="パスワードの確認"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-black text-white text-xl hover:bg-gray-800 transition duration-200"
                    >
                        パスワードを変更する
                    </button>
                </form>
                {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
                {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
                <Link href="/accounts/password/forget" className="text-black underline text-center mt-8">
                    パスワードを忘れた？
                </Link>
            </div>
        </div>
    );
};

export default ChangePass;