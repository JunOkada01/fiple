import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggledCategories, setToggledCategories] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/faqs/');
        const data = await res.json();
        setFaqs(data);
      } catch (err) {
        console.log(err)
        setError('FAQの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-600">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  const groupedFAQs = faqs.reduce((groups, faq) => {
    if (!groups[faq.category]) {
      groups[faq.category] = [];
    }
    groups[faq.category].push(faq);
    return groups;
  }, {} as { [category: string]: FAQ[] });

  const handleToggleCategory = (category: string) => {
    setToggledCategories((prevState) => ({
      ...prevState,
      [category]: !prevState[category],
    }));
  };

  return (
    <div className="max-w-xl mx-auto px-8 py-8 mt-5">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">FAQ</h2>
      {Object.keys(groupedFAQs).length === 0 ? (
        <p className="text-gray-600">現在、FAQはありません。</p>
      ) : (
        <ul className="space-y-4">
          {Object.keys(groupedFAQs).map((category) => (
            <li key={category} className="border rounded-lg shadow-sm p-4">
              <button
                className="w-full text-left font-semibold text-gray-900 flex justify-between items-center"
                onClick={() => handleToggleCategory(category)}
              >
                {category}
                <FontAwesomeIcon icon={toggledCategories[category] ? faChevronUp : faChevronDown} className="ml-2" />
              </button>
              {toggledCategories[category] && (
                <ul className="mt-2 space-y-2">
                  {groupedFAQs[category].map((faq, index) => (
                    <li key={index} className="p-3 border-t">
                      <p className="font-semibold text-gray-800 mb-2 flex items-center m-0">
                        Q. {faq.question}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center m-0 ml-[2px]">
                        A. {faq.answer}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6 text-center">
        <Link href="/" className="text-gray-600 hover:underline">トップに戻る</Link>
      </div>
    </div>
  );
};

export default FAQPage;