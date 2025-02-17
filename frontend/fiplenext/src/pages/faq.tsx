import { useState, useEffect } from 'react';
import styles from '../styles/FAQPage.module.css';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [toggledCategories, setToggledCategories] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchFAQs = async () => {
      const res = await fetch('http://54.221.185.90:8000/api/faqs/'); // DjangoのAPIエンドポイント
      const data = await res.json();
      setFaqs(data);
    };
    fetchFAQs();
  }, []);

  // カテゴリごとのFAQをグループ化
  const groupedFAQs = faqs.reduce((groups, faq) => {
    if (!groups[faq.category]) {
      groups[faq.category] = [];
    }
    groups[faq.category].push(faq);
    return groups;
  }, {} as { [category: string]: FAQ[] });

  // トグルを切り替える
  const handleToggleCategory = (category: string) => {
    setToggledCategories((prevState) => ({
      ...prevState,
      [category]: !prevState[category], // 既存の状態を反転させる
    }));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>よくある質問</h1>
      <div>
        {Object.keys(groupedFAQs).map((category) => (
          <div key={category}>
            <button
              className={styles['category-toggle']}
              onClick={() => handleToggleCategory(category)}
            >
              {category} {toggledCategories[category] ? '▲' : '▼'}
            </button>
            {toggledCategories[category] && (
              <div className={styles['faq-list']}>
                {groupedFAQs[category].map((faq, index) => (
                  <div key={index} className={styles['faq-item']}>
                    <h3 className={styles.question}>{faq.question}</h3>
                    <p className={styles.answer}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
