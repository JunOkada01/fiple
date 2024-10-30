import React, { useState } from 'react';
import Link from 'next/link';

type CardInfo = {
    cardNumber: string;
    cardHolder: string;
    expirationMonth: string;
    expirationYear: string;
    cvc: string;
};

const CreditCardManagement: React.FC = () => {
    const [cards, setCards] = useState<CardInfo[]>([]);
    const [newCard, setNewCard] = useState<CardInfo>({
        cardNumber: '',
        cardHolder: '',
        expirationMonth: '',
        expirationYear: '',
        cvc: '',
    });
    const [showModal, setShowModal] = useState(false);
    const [editingCard, setEditingCard] = useState<CardInfo | null>(null);

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        setCards([...cards, newCard]);
        setNewCard({ cardNumber: '', cardHolder: '', expirationMonth: '', expirationYear: '', cvc: '' });
    };

    const handleEditCard = (index: number) => {
        setEditingCard(cards[index]);
        setShowModal(true);
    };

    const handleSaveCard = () => {
        setCards((prevCards) =>
            prevCards.map((card) => (card === editingCard ? { ...editingCard! } : card))
        );
        setShowModal(false);
        setEditingCard(null);
    };

    const handleRemoveCard = (index: number) => {
        setCards(cards.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-6">
            <h1 className="text-3xl mt-10 mb-6">クレジットカード情報の管理</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-10" />

            <div className="w-full max-w-lg space-y-6">
                {cards.length > 0 ? (
                    cards.map((card, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-gray-300 rounded-lg"
                        >
                            <div>
                                <p className="text-lg font-semibold">
                                    **** **** **** {card.cardNumber.slice(-4)}
                                </p>
                                <p className="text-sm">名義: {card.cardHolder}</p>
                                <p className="text-sm">
                                    有効期限: {card.expirationMonth}/{card.expirationYear}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditCard(index)}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    編集
                                </button>
                                <button
                                    onClick={() => handleRemoveCard(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">登録されたクレジットカードはありません。</p>
                )}
            </div>

            {/* 新しいカードの登録フォーム */}
            <form className="w-full max-w-lg mt-8 space-y-4" onSubmit={handleAddCard}>
                <input
                    type="text"
                    value={newCard.cardNumber}
                    onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded p-2 text-lg"
                    placeholder="カード番号"
                    maxLength={16}
                />
                <input
                    type="text"
                    value={newCard.cardHolder}
                    onChange={(e) => setNewCard({ ...newCard, cardHolder: e.target.value })}
                    className="w-full border border-gray-300 rounded p-2 text-lg"
                    placeholder="カード名義人"
                />
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={newCard.expirationMonth}
                        onChange={(e) => setNewCard({ ...newCard, expirationMonth: e.target.value })}
                        className="w-1/2 border border-gray-300 rounded p-2 text-lg"
                        placeholder="月 (MM)"
                        maxLength={2}
                    />
                    <input
                        type="text"
                        value={newCard.expirationYear}
                        onChange={(e) => setNewCard({ ...newCard, expirationYear: e.target.value })}
                        className="w-1/2 border border-gray-300 rounded p-2 text-lg"
                        placeholder="年 (YY)"
                        maxLength={2}
                    />
                </div>
                <input
                    type="text"
                    value={newCard.cvc}
                    onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                    className="w-full border border-gray-300 rounded p-2 text-lg"
                    placeholder="CVC"
                    maxLength={3}
                />
                <button
                    type="submit"
                    className="w-full py-2 bg-black text-white rounded text-lg hover:bg-gray-800"
                >
                    カードを追加
                </button>
            </form>

            {/* 編集モーダル */}
            {showModal && editingCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                        <h2 className="text-xl font-bold">カード情報の編集</h2>
                        <input
                            type="text"
                            value={editingCard.cardNumber}
                            onChange={(e) =>
                                setEditingCard({ ...editingCard, cardNumber: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded p-2 text-lg"
                        />
                        <input
                            type="text"
                            value={editingCard.cardHolder}
                            onChange={(e) =>
                                setEditingCard({ ...editingCard, cardHolder: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded p-2 text-lg"
                        />
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={editingCard.expirationMonth}
                                onChange={(e) =>
                                    setEditingCard({ ...editingCard, expirationMonth: e.target.value })
                                }
                                className="w-1/2 border border-gray-300 rounded p-2 text-lg"
                            />
                            <input
                                type="text"
                                value={editingCard.expirationYear}
                                onChange={(e) =>
                                    setEditingCard({ ...editingCard, expirationYear: e.target.value })
                                }
                                className="w-1/2 border border-gray-300 rounded p-2 text-lg"
                            />
                        </div>
                        <input
                            type="text"
                            value={editingCard.cvc}
                            onChange={(e) => setEditingCard({ ...editingCard, cvc: e.target.value })}
                            className="w-full border border-gray-300 rounded p-2 text-lg"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleSaveCard}
                                className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                保存
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Link href="#" className="text-black underline text-center mt-8">
                もっと詳しく？
            </Link>
        </div>
    );
};

export default CreditCardManagement;
