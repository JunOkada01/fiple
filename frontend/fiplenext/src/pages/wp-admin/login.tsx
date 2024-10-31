import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios'; // axiosをインポート

const LoginPage: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:8000/api/adminlogin/', {
                name,
                password,
            });

            console.log('Login successful:', response.data);
            // ログイン成功時のリダイレクト
            router.push('/wp-admin/dashboard');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // axiosのエラーの場合
                const errorMessage = error.response?.data?.message || 'Login failed';
                setErrorMessage(errorMessage);
                console.error('Login failed:', errorMessage); // エラーメッセージをコンソールに表示
            } else {
                setErrorMessage('An unexpected error occurred');
                console.error('Unexpected error:', error); // 予期しないエラーをコンソールに表示
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h1>Admin Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
