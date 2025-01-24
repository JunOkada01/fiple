import { useState, useEffect } from 'react';
import styles from './ContactForm.module.css';

interface ContactFormProps {
  name: string;
  message: string;
  category: string;
}

interface Category {
  id: number;
  name: string;
}

const ContactForm = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ContactFormProps>({
    name: '',
    message: '',
    category: '',
  });
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('http://localhost:8000/api/contact-categories/');
      const data = await res.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // フォームデータの確認
    console.log(formData);

    // FormDataオブジェクトを作成
    const data = new FormData();
    data.append('name', formData.name);
    data.append('message', formData.message);
    data.append('category', formData.category);

    try {
      const res = await fetch('http://localhost:8000/api/submit-contact-form/', {
        method: 'POST',
        body: data,  // FormDataを送信
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
    <div className={styles.container}>
      <h1 className={styles.title}>お問い合わせ</h1>
      {/* お問い合わせ通知 */}
      {popupMessage && (
        <div className={styles.popupMessage}>
          {popupMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          名前:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.input} />
        </label>
        <label className={styles.label}>
          お問い合わせ内容:
          <select name="category" value={formData.category} onChange={handleChange} required className={styles.select}>
            <option value="">選択してください</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          メッセージ:
          <textarea name="message" value={formData.message} onChange={handleChange} required className={styles.textarea} />
        </label>
        <button type="submit" className={styles.button}>送信</button>
      </form>
    </div>
  );
};

export default ContactForm;