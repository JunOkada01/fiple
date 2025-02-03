import React, { useState, useEffect } from 'react';
import axios from 'axios';

type Address = {
    id: string;
    postal_code: string;
    prefecture: string;
    city: string;
    street: string;
    is_main?: boolean;
};

const AddressManagement: React.FC = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [newAddress, setNewAddress] = useState<Address>({
        id: '',
        postal_code: '',
        prefecture: '',
        city: '',
        street: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedAddress, setEditedAddress] = useState<Address | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // APIクライアントの設定
    const api = axios.create({
        baseURL: 'http://localhost:8000',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    // リクエストインターセプターの追加
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/delivery-addresses/');
            setAddresses(response.data);
            setError('');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.status === 401 
                    ? '認証エラーが発生しました。再度ログインしてください。'
                    : '住所の取得に失敗しました');
            }
        } finally {
            setLoading(false);
        }
    };

    const lookupAddress = async (postalCode: string) => {
        if (postalCode.length !== 7) return;
        
        setLoading(true);
        try {
            const response = await api.post('/api/delivery-addresses/lookup_address/', {
                postal_code: postalCode
            });
            
            const { prefecture, city, street } = response.data;
            const updatedAddress = {
                postal_code: postalCode,
                prefecture,
                city,
                street: street || ''
            };
            
            if (editingId) {
                setEditedAddress(prev => ({ ...prev, ...updatedAddress }));
            } else {
                setNewAddress(prev => ({ ...prev, ...updatedAddress }));
            }
            setError('');
        } catch (err) {
            setError('郵便番号からの住所取得に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (addresses.length >= 4) {
            setError('住所は最大3つまでしか追加できません');
            return;
        }
        
        if (!newAddress.postal_code || !newAddress.prefecture || !newAddress.city || !newAddress.street) {
            setError('すべての住所項目を入力してください');
            return;
        }
        
        try {
            setLoading(true);
            await api.post('/api/delivery-addresses/', {
                postal_code: newAddress.postal_code,
                prefecture: newAddress.prefecture,
                city: newAddress.city,
                street: newAddress.street
            });
            
            await fetchAddresses();
            setNewAddress({
                id: '',
                postal_code: '',
                prefecture: '',
                city: '',
                street: ''
            });
            setError('');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail || '住所の追加に失敗しました');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async (id: string) => {
        if (!editedAddress) return;
        
        if (!editedAddress.postal_code || !editedAddress.prefecture || 
            !editedAddress.city || !editedAddress.street) {
            setError('すべての住所項目を入力してください');
            return;
        }
        
        try {
            setLoading(true);
            await api.put(`/api/delivery-addresses/${id}/`, {
                postal_code: editedAddress.postal_code,
                prefecture: editedAddress.prefecture,
                city: editedAddress.city,
                street: editedAddress.street
            });
            
            await fetchAddresses();
            setEditingId(null);
            setEditedAddress(null);
            setError('');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 403) {
                    setError('この操作を行う権限がありません');
                } else {
                    setError(err.response?.data?.detail || '住所の更新に失敗しました');
                }
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleRemoveAddress = async (id: string) => {
        try {
            setLoading(true);
            // 削除時もapiインスタンスを使用
            await api.delete(`/api/delivery-addresses/${id}/`);
            await fetchAddresses();
            setError('');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 403) {
                    setError('この操作を行う権限がありません');
                } else {
                    setError('住所の削除に失敗しました');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white p-4">
            <h1 className="text-4xl font-bold mt-[100px] mb-5">お届け先住所の登録・変更</h1>
            <hr className="w-3/4 max-w-2xl border-t-2 border-black mb-10" />

            {error && (
                <div className="w-full max-w-lg mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* 住所リスト */}
            <div className="w-full max-w-lg space-y-4 mb-8">
                {addresses.map((address) => (
                    <div key={address.id} className="border p-4 rounded-lg">
                        {address.is_main ? (
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mb-2 inline-block">
                                        主な住所
                                    </span>
                                    <p className="text-lg">
                                        〒{address.postal_code}<br />
                                        {address.prefecture} {address.city} {address.street}
                                    </p>
                                </div>
                            </div>
                        ) : editingId === address.id ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={editedAddress?.postal_code || ''}
                                    onChange={(e) => {
                                        const postal = e.target.value;
                                        setEditedAddress(prev => ({
                                            ...prev!,
                                            postal_code: postal
                                        }));
                                        if (postal.length === 7) {
                                            lookupAddress(postal);
                                        }
                                    }}
                                    className="w-full p-2 border rounded"
                                    placeholder="郵便番号（ハイフンなし）"
                                />
                                <input
                                    type="text"
                                    value={editedAddress?.prefecture || ''}
                                    onChange={(e) => setEditedAddress(prev => ({
                                        ...prev!,
                                        prefecture: e.target.value
                                    }))}
                                    className="w-full p-2 border rounded"
                                    placeholder="都道府県"
                                />
                                <input
                                    type="text"
                                    value={editedAddress?.city || ''}
                                    onChange={(e) => setEditedAddress(prev => ({
                                        ...prev!,
                                        city: e.target.value
                                    }))}
                                    className="w-full p-2 border rounded"
                                    placeholder="市区町村"
                                />
                                <input
                                    type="text"
                                    value={editedAddress?.street || ''}
                                    onChange={(e) => setEditedAddress(prev => ({
                                        ...prev!,
                                        street: e.target.value
                                    }))}
                                    className="w-full p-2 border rounded"
                                    placeholder="丁目・番地"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSaveAddress(address.id)}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                        disabled={loading}
                                    >
                                        保存
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditedAddress(null);
                                        }}
                                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    >
                                        キャンセル
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <p className="text-lg">
                                    〒{address.postal_code}<br />
                                    {address.prefecture} {address.city} {address.street}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingId(address.id);
                                            setEditedAddress(address);
                                        }}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        編集
                                    </button>
                                    <button
                                        onClick={() => handleRemoveAddress(address.id)}
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
            {addresses.length < 4 && (
                <form className="w-full max-w-lg space-y-2" onSubmit={handleAddAddress}>
                    <input
                        type="text"
                        value={newAddress.postal_code}
                        onChange={(e) => {
                            const postal = e.target.value;
                            setNewAddress({ ...newAddress, postal_code: postal });
                            if (postal.length === 7) {
                                lookupAddress(postal);
                            }
                        }}
                        className="w-full p-2 border rounded"
                        placeholder="郵便番号（ハイフンなし）"
                    />
                    <input
                        type="text"
                        value={newAddress.prefecture}
                        onChange={(e) => setNewAddress({ ...newAddress, prefecture: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="都道府県"
                    />
                    <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="市区町村"
                    />
                    <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="丁目・番地"
                    />
                    <button
                        type="submit"
                        className="w-full py-2 bg-black text-white text-xl hover:bg-gray-800 transition duration-200"
                        disabled={loading}
                    >
                        住所を追加する
                    </button>
                </form>
            )}
        </div>
    );
};

export default AddressManagement;