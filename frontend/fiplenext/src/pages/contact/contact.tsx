import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/ContactForm.module.css';

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('送信中...');

    try {
      const response = await axios.post('/api/email/route', {
        name,
        email,
        message,
      });
      if (response.status === 200) {
        setStatus('送信が完了しました。');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('送信に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      setStatus('エラーが発生しました。');
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>お問い合わせ</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="name" className={styles.label}>お名前:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div>
          <label htmlFor="email" className={styles.label}>メールアドレス:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div>
          <label htmlFor="message" className={styles.label}>メッセージ:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className={styles.textarea}
          />
        </div>
        <button type="submit" className={styles.button}>送信</button>
      </form>
      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
};

export default ContactForm;