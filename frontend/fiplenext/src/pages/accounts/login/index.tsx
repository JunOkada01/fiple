import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../../../styles/Login.module.css'; // スタイルをインポート

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/login/', {
                username,
                password,
            });
            console.log(response.data);
            router.push('/'); // ホームページにリダイレクト
        } catch (error) {
            console.error(error);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.title}>ログイン</h2>
                <div className={styles.inputgroup}>
                    <label className={styles.label}>
                        ユーザー名
                        <input
                            type="text"
                            className={styles.input}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div className={styles.inputgroup}>
                    <label className={styles.label}>
                        パスワード
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <button type="submit" className={styles.button}>ログイン</button>
            </form>
        </div>
    );
};

export default Login;
