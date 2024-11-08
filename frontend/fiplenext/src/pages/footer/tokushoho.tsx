import React from 'react';

const LegalPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">特定商取引法に基づく表記</h1>
      
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">販売業者</h2>
        <p>＿＿＿＿株式会社</p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">代表責任者</h2>
        <p>代表者名: ＿＿＿＿</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">所在地</h2>
        <p>〒000-0000 東京都〇〇区〇〇町1-1-1</p>
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
        <h2 className="text-lg font-semibold mb-2">販売価格</h2>
        <p>各商品ページに記載</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">商品代金以外の必要料金</h2>
        <p>消費税、送料、振込手数料（銀行振込の場合）</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">支払方法および支払時期</h2>
        <p>クレジットカード、銀行振込、コンビニ払い（注文確定後7日以内にお支払い）</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">商品の引き渡し時期</h2>
        <p>支払い確認後、7日以内に発送</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">返品・交換・キャンセル等</h2>
        <p>商品に欠陥がある場合を除き、返品・交換には応じません。</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">返品期限</h2>
        <p>商品到着後7日以内にご連絡ください。</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">返品送料</h2>
        <p>不良品の場合は当社負担、それ以外はお客様負担</p>
      </section>

      <div className="mt-8 text-center text-sm text-gray-500">
        2024年11月7日制定
      </div>
    </div>
  );
};

export default LegalPage;
