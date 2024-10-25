import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../styles/Register.module.css';  // CSS Modulesを使用

const Register = () => {
    const [username, setName] = useState('');
    const [email, setEmail] = useState('');
    const [hurigana, setHurigana] = useState('');
    const [birth, setBirth] = useState('');
    const [sex, setSex] = useState('M');
    const [phone, setPhone] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    // 住所取得用の非同期関数
    const fetchAddress = async (postalCode: string) => {
        try {
            const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                // 住所の結合
                const newAddress = `${result.address1} ${result.address2} ${result.address3}`;
                setAddress(newAddress);  // フォームの住所フィールドに反映
            } else {
                console.error('住所が見つかりませんでした');
            }
        } catch (error) {
            console.error('住所の取得に失敗しました', error);
        }
    };

    const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPostalCode = e.target.value;
        setPostalCode(newPostalCode);
        
        if (newPostalCode.length === 7) {  // 郵便番号が7桁になったら自動で住所を取得
            fetchAddress(newPostalCode);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        };

        console.log('Sending data:', JSON.stringify(data));

        const response = await fetch('http://127.0.0.1:8000/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log('登録が成功しました');
            await router.push('/');
        } else {
            console.error('登録に失敗しました');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl font-bold mt-[100px] mb-5">SIGNUP</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-5" />
        
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
                        <label className="text-left text-lg w-1/3">生年月日</label>
                        <input
                            type="date"
                            value={birth}
                            onChange={e => setBirth(e.target.value)}
                            required
                            className="ml-4 mt-1 w-3/4 text-left text-xl border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 placeholder:text-base"
                        />
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
