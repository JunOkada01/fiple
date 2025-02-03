import React from 'react';

const CompanyProfile: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto p-8 text-gray-800">
        <h1 className="text-2xl font-bold mb-6">会社概要</h1>
        
        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">会社名</h2>
            <p>＿＿＿＿株式会社</p>
        </section>

        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">所在地</h2>
            <p>〒000-0000 東京都〇〇区〇〇町1-1-1</p>
        </section>

        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">設立</h2>
            <p>2020年1月1日</p>
        </section>

        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">代表者</h2>
            <p>代表取締役 ＿＿＿＿</p>
        </section>

        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">資本金</h2>
            <p>1,000万円</p>
        </section>

        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">事業内容</h2>
            <p>ECサイトの運営、ソフトウェア開発、その他ITサービスの提供</p>
        </section>

        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">電話番号</h2>
            <p>03-1234-5678</p>
        </section>

        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">メールアドレス</h2>
            <p>info@example.com</p>
        </section>

        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2">取引銀行</h2>
            <p>〇〇銀行 〇〇支店</p>
        </section>

        <div className="mt-8 text-center text-sm text-gray-500">
            2024年11月7日更新
        </div>
        </div>
    );
};

export default CompanyProfile;