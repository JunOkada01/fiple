import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// 仮のユーザー登録時の固定住所
const registeredAddress = {
    prefecture: "福岡県",
    city: "福岡市博多区",
    street: "博多駅中央街 1-1"
};

type Address = {
    prefecture: string;
    city: string;
    street: string;
};

const AddressManagement: React.FC = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [newAddress, setNewAddress] = useState<Address>({ prefecture: "", city: "", street: "" });
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedAddress, setEditedAddress] = useState<Address>({ prefecture: "", city: "", street: "" });

    // 住所の追加
    const handleAddAddress = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAddress.prefecture && newAddress.city && newAddress.street) {
            setAddresses([...addresses, newAddress]);
            setNewAddress({ prefecture: "", city: "", street: "" }); // クリア
        }
    };

    // 住所の編集保存
    const handleSaveAddress = (index: number) => {
        const updatedAddresses = [...addresses];
        updatedAddresses[index] = editedAddress;
        setAddresses(updatedAddresses);
        setEditingIndex(null); // 編集モード終了
    };

    // 編集キャンセル
    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditedAddress({ prefecture: "", city: "", street: "" });
    };

    // 住所の削除
    const handleRemoveAddress = (index: number) => {
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(updatedAddresses);
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl font-bold mt-[100px] mb-5">お届け先住所の登録・変更</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-10" />

            {/* 固定住所の表示 */}
            <div className="w-full max-w-lg mb-10">
                <h2 className="text-xl font-semibold mb-3">登録済み住所</h2>
                <div className="border-b border-gray-300 py-2">
                    <p className="text-lg">{registeredAddress.prefecture} {registeredAddress.city} {registeredAddress.street}</p>
                </div>
            </div>

            {/* お届け先住所リスト */}
            <div className="w-full max-w-lg space-y-4 mb-8">
                <h2 className="text-xl font-semibold">お届け先住所</h2>
                {addresses.map((address, index) => (
                    <div key={index} className="border-b border-gray-300 py-2">
                        {editingIndex === index ? (
                            <div className="space-y-2">
                                <div className="flex space-x-4">
                                    <input
                                        type="text"
                                        value={editedAddress.prefecture}
                                        onChange={(e) =>
                                            setEditedAddress({ ...editedAddress, prefecture: e.target.value })
                                        }
                                        className="w-1/3 text-lg border-b-2 border-blue-500 focus:outline-none"
                                        placeholder="都道府県"
                                    />
                                    <input
                                        type="text"
                                        value={editedAddress.city}
                                        onChange={(e) =>
                                            setEditedAddress({ ...editedAddress, city: e.target.value })
                                        }
                                        className="w-1/3 text-lg border-b-2 border-blue-500 focus:outline-none"
                                        placeholder="市区町村"
                                    />
                                    <input
                                        type="text"
                                        value={editedAddress.street}
                                        onChange={(e) =>
                                            setEditedAddress({ ...editedAddress, street: e.target.value })
                                        }
                                        className="w-1/3 text-lg border-b-2 border-blue-500 focus:outline-none"
                                        placeholder="丁目・番地"
                                    />
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <button
                                        onClick={() => handleSaveAddress(index)}
                                        className="text-green-500 hover:text-green-700"
                                    >
                                        ✔️
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✖️
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between">
                                <p>
                                    {address.prefecture} {address.city} {address.street}
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setEditingIndex(index);
                                            setEditedAddress(address);
                                        }}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        編集
                                    </button>
                                    <button
                                        onClick={() => handleRemoveAddress(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        削除
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 新しい住所の追加フォーム */}
            <form className="w-full max-w-lg space-y-2" onSubmit={handleAddAddress}>
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={newAddress.prefecture}
                        onChange={(e) => setNewAddress({ ...newAddress, prefecture: e.target.value })}
                        className="w-1/3 text-lg border-b-2 border-gray-300 focus:outline-none"
                        placeholder="都道府県"
                    />
                    <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-1/3 text-lg border-b-2 border-gray-300 focus:outline-none"
                        placeholder="市区町村"
                    />
                    <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-1/3 text-lg border-b-2 border-gray-300 focus:outline-none"
                        placeholder="丁目・番地"
                    />
                </div>
                <button type="submit" className="w-full py-2 bg-black text-white text-xl hover:bg-gray-800 transition duration-200 mt-2">
                    住所を追加する
                </button>
            </form>

            <Link href="#" className="text-black underline text-center mt-8">
                住所の変更が必要ですか？
            </Link>
        </div>
    );
};

export default AddressManagement;
