import React, { useState, useEffect } from 'react';
import axios from 'axios';

type DeliveryAddress = {
  id: string;
  postal_code: string;
  prefecture: string;
  city: string;
  street: string;
  is_main: boolean;
};

interface DeliveryAddressSelectProps {
  onAddressSelect: (addressId: string, addressDetails: DeliveryAddress) => void;
}

const DeliveryAddressSelect: React.FC<DeliveryAddressSelectProps> = ({ onAddressSelect }) => {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/delivery-addresses/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setAddresses(response.data);
      
      // メインの住所があれば自動選択
      const mainAddress = response.data.find((addr: DeliveryAddress) => addr.is_main);
      if (mainAddress) {
        setSelectedAddressId(mainAddress.id);
        // 住所IDと住所の詳細情報の両方を渡す
        onAddressSelect(mainAddress.id, mainAddress);
      }
      
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError('配送先情報の取得に失敗しました');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (addresses.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">配送先が登録されていません</p>
        <button
          onClick={() => window.location.href = '/accounts/profile/address_form'}
          className="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          配送先を登録する
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">配送先の選択</h2>
      <div className="space-y-3">
        {addresses.map((address) => (
          <label
            key={address.id}
            className={`block p-4 border rounded-lg cursor-pointer transition-colors
              ${selectedAddressId === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="deliveryAddress"
                value={String(address.id)}
                checked={selectedAddressId === String(address.id)}
                onChange={(err) => {
                  console.log(err);
                  console.log('選択した配達先:', address.postal_code, address.prefecture, address.city, address.street); 
                  setSelectedAddressId(address.id);
                  onAddressSelect(address.id, address);
                }}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <div className="ml-3">
                {address.is_main && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    主な住所
                  </span>
                )}
                <p className="text-sm mt-1">
                  〒{address.postal_code}
                  <br />
                  {address.prefecture} {address.city} {address.street}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>
      <button
        onClick={() => window.location.href = '/accounts/profile/address_form'}
        className="mt-4 text-blue-600 hover:text-blue-800 underline block"
      >
        配送先を追加・変更する
      </button>
    </div>
  );
};

export default DeliveryAddressSelect;