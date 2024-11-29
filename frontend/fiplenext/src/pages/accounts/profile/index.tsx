/* ログイン済みでアカウントリンクを踏んだ場合はこの画面 */
/* ログイン済みじゃない場合はログイン画面へ */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faCreditCard } from '@fortawesome/free-regular-svg-icons';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { faTruck } from '@fortawesome/free-solid-svg-icons';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

interface User {
    id: number;
    username: string;
    email: string;
    hurigana: string;
    sex: string;
    phone: string;
    postal_code: string;
    birth: string;
    address: string;
    password: string;
    height: number;
    weight: number;
}

const Profile: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const logout = async () => {
        try {
            const response = await axios.post('http://localhost:8000/logout/', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`, // トークンをヘッダーに追加
                },
            });
            console.log(response.data.message);
            localStorage.removeItem('access_token'); // トークンを削除
            // 必要に応じてリダイレクトなどを行う
            window.location.href="/";
        } catch (error) {
            console.error('Logout failed:');
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/user/', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,  // トークンをヘッダーに追加
                    },
                });
                console.log(response.data);
                setUser(response.data);  // 取得したユーザー情報を state にセット
                setLoading(false);  // ローディング終了
            } catch (err) {
                localStorage.removeItem('access_token'); // トークンを削除
                window.location.href = '/accounts/login'; // ログインページにリダイレクト
                setError('ユーザー情報の取得に失敗しました');
                setLoading(false);  // ローディング終了
            }
        };

        fetchUserData();
    }, []);
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-96">
                    <p className="font-bold">エラー</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }
    

    // birthの年、月、日を分割
    const [birthYear, birthMonth, birthDay] = user?.birth.split('-') || ["", "", ""];

    return (
        <div className="container mx-auto flex flex-col items-center pt-10">
            {/* アカウントアイコンとタイトル部分 */}
            <div className="profile-head text-center">
                <div className="accounts-icon flex justify-center pb-5">
                    <FontAwesomeIcon icon={faCircleUser} className='text-[60px] mt-10 fa-bounce' style={{ "--fa-bounce-height": 1 } as React.CSSProperties} />
                </div>
                <h1 className="profile-title text-xl font-semibold">{user?.username} 様の登録情報</h1>
            </div>

            {/* 会員登録情報カード */}
            <div className="profile-card mt-8 p-5 border rounded-lg w-[600px]">
                <h2 className="text-xl font-bold border-b pb-4">会員登録情報</h2>
                {/* 各項目の設定 */}
                <div className="profile-card-detail">
                    <div className="flex items-center border-b py-4">
                        <span className="w-1/4">基本情報</span> {/* 左のタイトル部分を広く */}
                        <div className="profile-info w-2/3 text-gray-600"> {/* 中央のユーザー情報を広めに */}
                            <p>{user?.username}</p>
                            <p>{birthYear} 年 {birthMonth} 月 {birthDay} 日</p>
                            <p>{user?.sex === 'M' ? '男性' : user?.sex === 'F' ? '女性' : 'その他'}</p>
                            <p>〒{user?.postal_code}</p>
                            <p><FontAwesomeIcon icon={faLocationDot} className='text-sm text-gray-400'/> {user?.address}</p>
                            <p>{user?.phone}</p>
                        </div>
                        <div className="w-auto text-right"> {/* 変更ボタンエリア */}
                            <Link href={'/accounts/profile/edit_profile'}>
                                <button className="text-blue-500">変更</button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center border-b py-4">
                        <span className="w-1/4">メールアドレス</span>
                        <div className="w-2/3 text-gray-600">
                            <p>{user?.email}</p>
                        </div>
                        <div className="w-auto text-right">
                            <Link href={'/accounts/profile/change_email'}>
                                <button className="text-blue-500">変更</button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center border-b py-4">
                        <span className="w-1/4">パスワード</span>
                        <div className="w-2/3 text-xs text-gray-500">
                            <p>※セキュリティのため非表示です</p>
                        </div>
                        <div className="w-auto text-right">
                            <Link href={'/accounts/password/change_password'}>
                                <button className="text-blue-500">変更</button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ログアウトボタン */}
                <div className="mt-8 mb-3 flex justify-center">
                    <button className="px-10 py-2 border rounded-md" onClick={logout}>ログアウト</button>
                </div>
            </div>

            {/* 下部のアイコンメニュー */}
            <div className="grid grid-cols-4 gap-4 mt-5 w-full max-w-[600px]">
                <Link href={'/accounts/profile/address_form'}>
                    <div className="flex flex-col items-center justify-center p-5 border rounded-lg h-32 w-32 hover:shadow-lg transition-transform transform hover:scale-105">
                        <FontAwesomeIcon icon={faLocationDot} className='text-[36px]' />
                        <span className="text-[12px] mt-2 text-center">お届け先の<br />追加と変更</span>
                    </div>
                </Link>
                <Link href={'/accounts/profile/credit_card'}>
                    <div className="flex flex-col items-center justify-center p-5 border rounded-lg h-32 w-32 hover:shadow-lg transition-transform transform hover:scale-105">
                        <FontAwesomeIcon icon={faCreditCard} className='text-[36px]' />
                        <span className="text-[12px] mt-2 text-center">クレジット<br />カード変更</span>
                    </div>
                </Link>
                <Link href={'#'}>
                    <div className="flex flex-col items-center justify-center p-5 border rounded-lg h-32 w-32 hover:shadow-lg transition-transform transform hover:scale-105">
                        <FontAwesomeIcon icon={faClockRotateLeft} className='text-[36px]' />
                        <span className="text-[12px] mt-2 text-center">注文履歴</span>
                    </div>
                </Link>
                <Link href={'#'}>
                    <div className="flex flex-col items-center justify-center p-5 border rounded-lg h-32 w-32 hover:shadow-lg transition-transform transform hover:scale-105">
                        <FontAwesomeIcon icon={faTruck} className='text-[36px]' />
                        <span className="text-[12px] mt-2 text-center">配送状況</span>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Profile; 