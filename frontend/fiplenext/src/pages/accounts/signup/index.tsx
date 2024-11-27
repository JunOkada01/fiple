import { useState } from 'react';
import { useRouter } from 'next/router';

import styles from '../../../styles/Register.module.css';

const Register = () => {
    const [username, setName] = useState('');
    const [email, setEmail] = useState('');
    const [hurigana, setHurigana] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [sex, setSex] = useState('M');
    const [phone, setPhone] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [address, setAddress] = useState('');
    const [height, setHeight] = useState(''); // 身長
    const [weight, setWeight] = useState(''); // 体重
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    // 年月日の選択肢を生成
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    // 住所取得用の非同期関数
    const fetchAddress = async (postalCode: string) => {
        try {
            const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const newAddress = `${result.address1} ${result.address2} ${result.address3}`;
                setAddress(newAddress);
            } else {
                setError('郵便番号に対応する住所が見つかりませんでした');
            }
        } catch (error) {
            setError('住所の取得に失敗しました');
        }
    };

    const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPostalCode = e.target.value;
        setPostalCode(newPostalCode);
        
        if (newPostalCode.length === 7) {
            fetchAddress(newPostalCode);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // エラーメッセージをリセット

        // 生年月日のバリデーション
        if (!birthYear || !birthMonth || !birthDay) {
            setError('生年月日を完全に入力してください');
            return;
        }

        const birth = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

        const data = {
            username,
            email,
            password,
            hurigana,
            sex,
            phone,
            postal_code: postalCode,
            birth,
            address,
            height,
            weight,
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                await router.push('/');
            } else {
                const errorData = await response.json();
                setError(errorData.message || '登録に失敗しました。入力内容をご確認ください。');
            }
        } catch (error) {
            setError('サーバーとの通信に失敗しました。しばらく経ってからもう一度お試しください。');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl mt-[50px] mb-5">SIGNUP</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-5" />

            {/* エラーメッセージの表示を変更 */}
            {error && (
                <div className="w-full max-w-lg mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
        
            <div className="flex flex-col items-center w-full max-w-lg">
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">名前</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setName(e.target.value)}
                            placeholder="お名前を入力してください"
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">ふりがな</label>
                        <input
                            type="text"
                            value={hurigana}
                            onChange={e => setHurigana(e.target.value)}
                            placeholder="ひらがなで入力してください"
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="メールアドレスを入力してください"
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    
                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">生年月日</label>
                        <div className="ml-4 flex w-3/4 space-x-2">
                            <select
                                value={birthYear}
                                onChange={(e) => setBirthYear(e.target.value)}
                                required
                                className="w-1/3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">年</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <select
                                value={birthMonth}
                                onChange={(e) => setBirthMonth(e.target.value)}
                                required
                                className="w-1/3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">月</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                            <select
                                value={birthDay}
                                onChange={(e) => setBirthDay(e.target.value)}
                                required
                                className="w-1/3 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">日</option>
                                {days.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">性別</label>
                        <div className="ml-4 flex w-3/4 justify-between">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="sex"
                                    value="M"
                                    checked={sex === 'M'}
                                    onChange={e => setSex(e.target.value)}
                                /> 男性
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="sex"
                                    value="F"
                                    checked={sex === 'F'}
                                    onChange={e => setSex(e.target.value)}
                                /> 女性
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="sex"
                                    value="O"
                                    checked={sex === 'O'}
                                    onChange={e => setSex(e.target.value)}
                                /> その他
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">身長</label>
                        <input
                            type="text"
                            value={height}
                            onChange={e => setHeight(e.target.value)}
                            placeholder="cm"
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>


                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">体重</label>
                        <input
                            type="text"
                            value={weight}
                            onChange={e => setWeight(e.target.value)}
                            placeholder="㎏"
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">電話番号</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="電話番号を入力してください"
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">郵便番号</label>
                        <input
                            type="text"
                            value={postalCode}
                            onChange={handlePostalCodeChange}
                            placeholder="7桁で郵便番号を入力してください"
                            maxLength={7}
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">住所</label>
                        <input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="住所を入力してください"
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="text-left text-lg w-1/3">パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="パスワードを入力してください"
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
                    </div>

                    <button type="submit" className={`w-full py-2 bg-black text-white text-xl hover:bg-gray-800 transition duration-200 ${styles.submitButton}`}>
                        CLICK
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;