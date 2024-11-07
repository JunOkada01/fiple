import Link from "next/link";

const Logout = () => {

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl font-bold mt-[100px] mb-5">LOGOUT</h1>
            <h4>ログアウトしました</h4>
            <br></br>
            <Link href="/">トップへ</Link>
        </div>
    )
};

export default Logout;
