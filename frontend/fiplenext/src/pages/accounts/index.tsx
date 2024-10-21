import { GetServerSideProps } from 'next';
import React from 'react';

interface User {
    id: number;
    username: string;
    email: string;
}

interface Props {
    users: User[];
}

const UserList: React.FC<Props> = ({ users }) => {
    return (
    <div>
        <h1>User List</h1>
        <ul>
        {users.map((user) => (
            <li key={user.id}>
            <p>ID: {user.id}</p>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            </li>
        ))}
        </ul>
    </div>
    );
};

// サーバーサイドでデータを取得
export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('http://127.0.0.1:8000/api/users/');
  const users: User[] = await res.json();
  
  return {
    props: { users }, // propsとしてユーザーリストをページに渡す
  };
};

export default UserList;
