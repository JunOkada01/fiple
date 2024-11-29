import React, { useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Router, { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faCreditCard, faClockRotateLeft, faTruck } from '@fortawesome/free-solid-svg-icons';

const Profile: React.FC = () => {
    const router = useRouter();
    const token = localStorage.getItem('access_token');

    if (!token) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        Router.push({
        pathname: '/accounts/login',
        query: { 
            error: 'authentication', 
            message: 'セッションが期限切れです。再度ログインしてください。' 
        }
        });
        return;
    }

    // ログアウト関数
    const logout = async () => {
        try {
            await axios.post('http://localhost:8000/logout/', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            router.push('/accounts/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="container mx-auto flex flex-col items-center pt-10">
            {/* アカウントアイコンとタイトル部分 */}
            <div className="profile-head text-center">
                <div className="accounts-icon flex justify-center pb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" height="60px" width="60px" viewBox="0 -960 960 960" fill="#202020">
                        <path d="M222-255q63-44 125-67.5T480-346q71 0 133.5 23.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Zm.66 370Q398-80 325-111.5t-127.5-86q-54.5-54.5-86-127.27Q80-397.53 80-480.27 80-563 111.5-635.5q31.5-72.5 86-127t127.27-86q72.76-31.5 155.5-31.5 82.73 0 155.23 31.5 72.5 31.5 127 86t86 127.03q31.5 72.53 31.5 155T848.5-325q-31.5 73-86 127.5t-127.03 86Q562.94-80 480.47-80Zm-.47-60q55 0 107.5-16T691-212q-51-36-104-55t-107-19q-54 0-107 19t-104 55q51 40 103.5 56T480-140Zm0-370q34 0 55.5-21.5T557-587q0-34-21.5-55.5T480-664q-34 0-55.5 21.5T403-587q0 34 21.5 55.5T480-510Zm0-77Zm0 374Z"/>
                    </svg>
                </div>
                <h1 className="profile-title text-xl font-semibold">〇〇〇〇様の登録情報</h1>
            </div>

            {/* 会員登録情報カード */}
            <div className="profile-card mt-8 p-5 border rounded-lg w-[600px]">
                <h2 className="text-xl font-bold border-b">会員登録情報</h2>

                {/* 各項目の設定 */}
                <div className="profile-card-detail">
                    <div className="flex justify-between items-center border-b pt-[50px] pb-[50px]">
                        <span>基本情報</span>
                        <Link href={'/accounts/profile/edit_profile'}>
                            <button className="text-blue-500">変更</button>
                        </Link>
                    </div>
                    <div className="flex justify-between items-center border-b pt-[20px] pb-[20px]">
                        <span>メールアドレス</span>
                        <Link href={'/accounts/profile/change_email'}>
                            <button className="text-blue-500">変更</button>
                        </Link>
                    </div>
                    <div className="flex justify-between items-center border-b pt-[20px] pb-[20px]">
                        <span>パスワード</span>
                        <Link href={'/accounts/profile/change_password'}>
                            <button className="text-blue-500">変更</button>
                        </Link>
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
                <Link href={'/accounts/profile/history'}>
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
