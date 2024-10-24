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
            await router.push('/accounts');
        } else {
            console.error('登録に失敗しました');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h1>SIGNUP</h1>

            <div className={styles.formGroup}>
                <label>名前</label>
                <input
                    type="text"
                    value={username}
                    onChange={e => setName(e.target.value)}
                    placeholder="お名前を入力してください"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>メールアドレス</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="メールアドレスを入力してください"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>ふりがな</label>
                <input
                    type="text"
                    value={hurigana}
                    onChange={e => setHurigana(e.target.value)}
                    placeholder="ひらがなで入力してください"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>生年月日</label>
                <input
                    type="date"
                    value={birth}
                    onChange={e => setBirth(e.target.value)}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>性別</label>
                <div className={styles.radioGroup}>
                    <input
                        type="radio"
                        name="sex"
                        value="M"
                        checked={sex === 'M'}
                        onChange={e => setSex(e.target.value)}
                    /> 男性
                    <input
                        type="radio"
                        name="sex"
                        value="F"
                        checked={sex === 'F'}
                        onChange={e => setSex(e.target.value)}
                    /> 女性
                    <input
                        type="radio"
                        name="sex"
                        value="O"
                        checked={sex === 'O'}
                        onChange={e => setSex(e.target.value)}
                    /> その他
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>電話番号</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="電話番号を入力してください"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>郵便番号</label>
                <input
                    type="text"
                    value={postalCode}
                    onChange={handlePostalCodeChange}  // 郵便番号が変わったら住所を取得
                    placeholder="7桁で郵便番号を入力してください"
                    maxLength={7}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>住所</label>
                <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="住所を入力してください"
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label>パスワード</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="パスワードを入力してください"
                    required
                />
            </div>

            <button type="submit" className={styles.submitButton}>CLICK</button>
        </form>
    );
};

export default Register;
