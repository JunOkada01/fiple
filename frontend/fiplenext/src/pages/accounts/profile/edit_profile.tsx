import React from 'react';
import { useRouter } from 'next/router';

const EditProfile: React.FC = () => {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // プロフィール更新処理は未実装です。

        // 成功したら登録情報画面にリダイレクト
        router.push('/accounts/profile'); // ここでリダイレクト先のパスを指定
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl font-bold mt-[100px] mb-5">EDIT PROFILE</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-10" />

            <div className="flex flex-col items-center w-full max-w-lg">
                <form className="w-full space-y-8" onSubmit={handleSubmit}>
                    <div className="flex items-center mb-5">
                        <label className="text-left text-lg w-1/3">名前</label>
                        <input
                            type="text"
                            placeholder="名前"
                            className="ml-4 mt-1 w-3/4 text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-5">
                        <label className="text-left text-lg w-1/3">年齢</label>
                        <input
                            type="text"
                            value="" // 仮の値、必要に応じて変更
                            readOnly
                            className="ml-4 mt-1 w-3/4 text-xl bg-gray-200 border-b-2 border-gray-300 focus:outline-none focus:ring-0 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-5">
                        <label className="text-left text-lg w-1/3">性別</label>
                        <input
                            type="text"
                            value="" // 仮の値、必要に応じて変更
                            readOnly
                            className="ml-4 mt-1 w-3/4 text-xl bg-gray-200 border-b-2 border-gray-300 focus:outline-none focus:ring-0 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-5">
                        <label className="text-left text-lg w-1/3">郵便番号</label>
                        <input
                            type="text"
                            placeholder="郵便番号"
                            className="ml-4 mt-1 w-3/4 text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-5">
                        <label className="text-left text-lg w-1/3">住所</label>
                        <input
                            type="text"
                            placeholder="住所"
                            className="ml-4 mt-1 w-3/4 text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-5">
                        <label className="text-left text-lg w-1/3">電話番号</label>
                        <input
                            type="tel"
                            placeholder="電話番号"
                            className="ml-4 mt-1 w-3/4 text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-black text-white text-xl hover:bg-gray-800 transition duration-200"
                    >
                        更新する
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
