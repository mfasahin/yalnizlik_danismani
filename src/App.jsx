import React, { useState, useEffect, useRef, useCallback } from 'react';
import CrisisBanner from './components/CrisisBanner';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { LockFilled } from '@ant-design/icons';
import './App.css';

// Simulated AI responses (replace with real API later)
const AI_RESPONSES = [
  'Sizi duyuyorum. Hissettiklerinizi benimle paylaşmanız çok cesur bir adım. Biraz daha anlatır mısınız?',
  'Bu duyguyu yaşamak gerçekten zor olabilir. Kendinizi nasıl hissediyorsunuz şu an?',
  'Yalnızlık, çoğu insanın bir noktada hissettiği, oldukça insani bir duygu. Sizi bu kadar yoranın ne olduğunu merak ediyorum.',
  'Bunu benimle paylaştığınız için teşekkür ederim. Her adım önemli, siz de önemlisiniz.',
  'Bazen sadece biri bizi dinlediğinde daha iyi hissedebiliyoruz. Ben buradayım, dinliyorum.',
  'Bunları yaşarken kendinize nasıl destek oluyorsunuz? Küçük şeyler bile işe yarayabilir.',
];

let msgIdCounter = 0;
const createMsg = (role, content, extra = {}) => ({
  id: ++msgIdCounter,
  role,
  content,
  timestamp: new Date(),
  ...extra,
});

const STREAM_DELAY_MS = 28; // ms per character

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([
    createMsg('ai', 'Merhaba, ben Dijital Yol Arkadaşınızım. Bugün nasılsınız? Düşüncelerinizi, hissettiklerinizi benimle paylaşabilirsiniz. Burada güvende ve yargılanmaksızın konuşabilirsiniz.'),
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef(null);

  // Apply dark mode to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamAIResponse = useCallback((text) => {
    setIsStreaming(true);
    // Add a streaming placeholder message
    const streamId = ++msgIdCounter;
    setMessages(prev => [...prev, {
      id: streamId,
      role: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }]);

    let i = 0;
    const tick = () => {
      i++;
      const partial = text.slice(0, i);
      setMessages(prev => prev.map(m =>
        m.id === streamId ? { ...m, content: partial, isStreaming: i < text.length } : m
      ));
      if (i < text.length) {
        setTimeout(tick, STREAM_DELAY_MS);
      } else {
        setIsStreaming(false);
      }
    };

    // Brief pause before starting to simulate "thinking"
    setTimeout(tick, 700);
  }, []);

  const handleSend = useCallback((text) => {
    if (isStreaming) return;

    // Add user message (already sanitized in ChatInput)
    setMessages(prev => [...prev, createMsg('user', text)]);

    // Pick a random AI response
    const aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    streamAIResponse(aiText);
  }, [isStreaming, streamAIResponse]);

  return (
    <div className="app-root">
      <div className="app-card">
        <CrisisBanner />
        <Header darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

        {/* Chat list */}
        <main className="chat-list" role="log" aria-live="polite" aria-label="Sohbet geçmişi">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </main>

        <ChatInput onSend={handleSend} disabled={isStreaming} />

        {/* Security footer */}
        <footer className="app-footer" aria-label="Gizlilik bilgisi">
          <LockFilled className="app-footer__icon" aria-hidden="true" />
          <span>Verileriniz uçtan uca şifrelidir ve anonimdir.</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
