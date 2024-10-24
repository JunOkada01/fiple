import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

const AdminPage = () => {
  return (
    <>
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard!</p> 
    </div>
    </>
  );
};

// サーバーサイドでログイン状態を確認
export const getServerSideProps: GetServerSideProps = async (context) => {
  const isLoggedIn = false; // ここでログインしているかどうかをチェック（例えば、セッションやトークンの確認）

  if (!isLoggedIn) {
    return {
      redirect: {
        destination: '/wp-admin/login',
        permanent: false,
      },
    };
  }

  return {
    props: {}, // 必要なプロップスを返す場合
  };
};

export default AdminPage;
