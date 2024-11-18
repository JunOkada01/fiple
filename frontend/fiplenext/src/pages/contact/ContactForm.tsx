import { useState, useEffect } from 'react';
import styles from '../../styles/ContactForm.module.css';

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
      } else {
        console.error('Form submission error:', responseData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>お問い合わせ</h1>
      <form onSubmit={handleSubmit}>
        <label>
          名前:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label>
          お問い合わせ内容:
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">選択してください</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          メッセージ:
          <textarea name="message" value={formData.message} onChange={handleChange} required />
        </label>
        <button type="submit">送信</button>
      </form>
    </div>
  );
};

export default ContactForm;