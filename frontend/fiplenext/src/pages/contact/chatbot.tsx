import { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState<{ user: boolean; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    const userMessage = { user: true, text: input };
    setMessages([...messages, userMessage]);

    const response = await axios.post('/api/chatbot', {
      message: input,
      sessionId: 'unique_session_id',
    });

    const botMessage = { user: false, text: response.data.reply };
    setMessages([...messages, userMessage, botMessage]);
    setInput('');
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p key={index} style={{ textAlign: msg.user ? 'right' : 'left' }}>
            {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="メッセージを入力"
      />
      <button onClick={handleSendMessage}>送信</button>
    </div>
  );
};

export default Chatbot;
