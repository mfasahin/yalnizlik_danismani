import React, { useState, useEffect, useRef, useCallback } from 'react';
import CrisisBanner from './components/CrisisBanner';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import MoodSelector from './components/MoodSelector';
import QuickReplies from './components/QuickReplies';
import MoodHistory from './components/MoodHistory';
import { LockFilled } from '@ant-design/icons';
import Login from './components/Login';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
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

// Ruh haline göre AI açılış cevabı
const MOOD_RESPONSES = {
  happy:    'Ne güzel, bugün mutlu hissediyorsun! Bu enerjiyi seninle paylaşmak güzel. Seni bu kadar iyi hissettiren ne oldu acaba?',
  calm:     'Sakin bir gün geçiriyorsun, bu çok değerli. Zihnin bu dingin halinde konuşmak ister misin?',
  neutral:  'Nötr bir gün... Bazen öyle günler olur. Ne anlatmak istersin bugün?',
  sad:      'Hüzünlü hissetmek zor. Bu duyguyu benimle paylaştığın için teşekkür ederim. Neler var içinde bugün?',
  anxious:  'Endişeli hissetmek yorucu olabilir. Rahat bir nefes al... Seni bu kadar endişelendiren ne var?',
  terrible: 'Çok zor bir gün geçiriyorsun. Buradayım, her şeyi dinlemeye hazırım. Ne anlatmak istersin?',
};

// localStorage yardımcıları
const HISTORY_KEY = 'yalnizlik_mood_history';
const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? [];
  } catch {
    return [];
  }
};
const saveHistory = (history) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

let msgIdCounter = 0;
const createMsg = (role, content, extra = {}) => ({
  id: ++msgIdCounter,
  role,
  content,
  timestamp: new Date(),
  ...extra,
});

const STREAM_DELAY_MS = 28;

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSelected, setMoodSelected] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [moodHistory, setMoodHistory] = useState(loadHistory);
  const [messages, setMessages] = useState([
    createMsg('ai', 'Merhaba, ben Dijital Yol Arkadaşınızım. Bugün nasılsınız? Düşüncelerinizi, hissettiklerinizi benimle paylaşabilirsiniz. Burada güvende ve yargılanmaksızın konuşabilirsiniz.'),
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamAIResponse = useCallback((text) => {
    setIsStreaming(true);
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
    setTimeout(tick, 700);
  }, []);

  // Ruh hali seçilince localStorage'a kaydet + AI yanıtı al
  const handleMoodSelect = useCallback((mood) => {
    if (moodSelected) return;
    setSelectedMood(mood);
    setMoodSelected(true);

    // Geçmişe ekle ve kaydet
    const entry = {
      emoji: mood.emoji,
      label: mood.label,
      value: mood.value,
      score: mood.score,
      timestamp: new Date().toISOString(),
    };
    setMoodHistory(prev => {
      const updated = [...prev, entry];
      saveHistory(updated);
      return updated;
    });

    setMessages(prev => [...prev, createMsg('user', `${mood.emoji} Bugün ${mood.label.toLowerCase()} hissediyorum.`)]);
    const aiText = MOOD_RESPONSES[mood.value] ?? AI_RESPONSES[0];
    streamAIResponse(aiText);
  }, [moodSelected, streamAIResponse]);

  const handleSend = useCallback((text) => {
    if (isStreaming) return;
    setShowQuickReplies(false);
    setMessages(prev => [...prev, createMsg('user', text)]);
    const aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    streamAIResponse(aiText);
  }, [isStreaming, streamAIResponse]);

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', background: '#0f172a' }}>Yükleniyor...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className={`app-root ${showHistory ? 'app-root--panel-open' : ''}`}>
      <div className="app-card">
        <CrisisBanner />
        <Header
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          onShowHistory={() => setShowHistory(true)}
          historyCount={moodHistory.length}
        />

        {/* Ruh Hali Seçici veya Rozet */}
        {!moodSelected ? (
          <MoodSelector onMoodSelect={handleMoodSelect} selectedMood={selectedMood} />
        ) : (
          <div className="mood-badge" title={`Bugünkü ruh halin: ${selectedMood.label}`}>
            <span>{selectedMood.emoji}</span>
            <span className="mood-badge__label">{selectedMood.label}</span>
          </div>
        )}

        {/* Chat list */}
        <main className="chat-list" role="log" aria-live="polite" aria-label="Sohbet geçmişi">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </main>

        {/* Hızlı başlangıç soruları */}
        {showQuickReplies && moodSelected && (
          <QuickReplies onSelect={(text) => handleSend(text)} />
        )}

        <ChatInput onSend={handleSend} disabled={isStreaming} />

        {/* Security footer */}
        <footer className="app-footer" aria-label="Gizlilik bilgisi">
          <LockFilled className="app-footer__icon" aria-hidden="true" />
          <span>Verileriniz uçtan uca şifrelidir. Bu bir yapay zeka destek aracıdır, profesyonel terapi yerine geçmez.</span>
        </footer>

      </div>

      {/* Duygu Geçmişi Paneli - app-card'ın sağında bağımsız kart */}
      {showHistory && (
        <MoodHistory
          history={moodHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default App;
