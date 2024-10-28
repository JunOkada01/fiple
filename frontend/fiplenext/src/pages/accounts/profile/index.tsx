/* ログイン済みでアカウントリンクを踏んだ場合はこの画面 */
/* ログイン済みじゃない場合はログイン画面へ */

import React from 'react';
import Link from 'next/link';

const Profile: React.FC = () => {
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
                    <button className="px-10 py-2 border rounded-md">ログアウト</button>
                </div>
            </div>

            {/* 下部のアイコンメニュー */}
            <div className="grid grid-cols-4 gap-4 mt-5 w-full max-w-[600px]">
                <div className="flex flex-col items-center p-5 border rounded-lg h-32 w-32"> {/* 幅と高さを指定 */}
                    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#202020"><path d="M370-440h60v-120h100v120h60v-185l-110-73-110 73v185Zm110 281q133-121 196.5-219.5T740-552q0-118-75.5-193T480-820q-109 0-184.5 75T220-552q0 75 65 173.5T480-159Zm0 79Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>
                    <span className="text-[12px] mt-2">お届け先の<br />追加と変更</span>
                </div>
                <div className="flex flex-col items-center p-5 border rounded-lg h-32 w-32"> {/* 幅と高さを指定 */}
                    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#202020"><path d="M880-740v520q0 24-18 42t-42 18H140q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42ZM140-631h680v-109H140v109Zm0 129v282h680v-282H140Zm0 282v-520 520Z"/></svg>
                    <span className="text-[12px] mt-2">クレジット<br />カード変更</span>
                </div>
                <div className="flex flex-col items-center p-5 border rounded-lg h-32 w-32"> {/* 幅と高さを指定 */}
                    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#202020"><path d="M300-286q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm0-164q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm0-164q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm132 328h244v-60H432v60Zm0-164h244v-60H432v60Zm0-164h244v-60H432v60ZM180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-600H180v600Zm0-600v600-600Z"/></svg>
                    <span className="text-[12px] mt-2">注文履歴</span>
                </div>
                <div className="flex flex-col items-center p-5 border rounded-lg h-32 w-32"> {/* 幅と高さを指定 */}
                    <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#202020"><path d="M224.12-161q-49.12 0-83.62-34.42Q106-229.83 106-279H40v-461q0-24 18-42t42-18h579v167h105l136 181v173h-71q0 49.17-34.38 83.58Q780.24-161 731.12-161t-83.62-34.42Q613-229.83 613-279H342q0 49-34.38 83.5t-83.5 34.5Zm-.12-60q24 0 41-17t17-41q0-24-17-41t-41-17q-24 0-41 17t-17 41q0 24 17 41t41 17ZM100-339h22q17-27 43.04-43t58-16q31.96 0 58.46 16.5T325-339h294v-401H100v401Zm631 118q24 0 41-17t17-41q0-24-17-41t-41-17q-24 0-41 17t-17 41q0 24 17 41t41 17Zm-52-204h186L754-573h-75v148ZM360-529Z"/></svg>
                    <span className="text-[12px] mt-2">配送状況</span>
                </div>
            </div>
        </div>
    );
};

export default Profile;
