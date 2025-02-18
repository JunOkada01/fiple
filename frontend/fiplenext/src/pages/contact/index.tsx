import { useState, useEffect } from 'react';

interface ContactFormProps {
  name: string;
  message: string;
  category: string;
}

interface Category {
  id: number;
  name: string;
}

const Contact: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ContactFormProps>({
    name: '',
    message: '',
    category: '',
  });
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('http://34.230.156.248:8000/api/contact-categories/');
      const data = await res.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(formData);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('message', formData.message);
    data.append('category', formData.category);

    try {
      const res = await fetch('http://34.230.156.248:8000/api/submit-contact-form/', {
        method: 'POST',
        body: data,
      });

      const responseData = await res.json();
      if (res.ok) {
        console.log('Form submitted successfully:', responseData);
        setPopupMessage('お問い合わせが完了しました！');
        // フォーム送信後にリセットする
        setFormData({
          name: '',
          message: '',
          category: '',
        });
        setTimeout(() => setPopupMessage(null), 5000); // 5秒後にポップアップを非表示に
      } else {
        console.error('Form submission error:', responseData);
        setPopupMessage('送信に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setPopupMessage('送信中にエラーが発生しました。');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mt-[50px] mb-6">お問い合わせ</h1>
      {/* お問い合わせ通知 */}
      {popupMessage && (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 p-4 bg-green-500 text-white rounded-md shadow-lg z-10">
          {popupMessage}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto border shadow-sm bg-white p-10 rounded-md"
      >
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            名前
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            お問い合わせ内容
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            メッセージ
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full h-[100px] mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-black border border-black text-white font-medium rounded-sm hover:bg-white hover:text-black transition-all"
        >
          送信
        </button>
      </form>
    </div>
  );
};

export default Contact;
