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
import { sendMessageToGroq } from './groq';



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

const STREAM_DELAY_MS = 20;

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

  const streamText = useCallback((text) => {
    return new Promise((resolve) => {
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
          resolve();
        }
      };
      setTimeout(tick, 400);
    });
  }, []);

  const fetchGroqAndStream = useCallback(async (userText, currentMessages, mood) => {
    setIsStreaming(true);
    try {
      const aiText = await sendMessageToGroq(currentMessages, userText, mood);
      await streamText(aiText);
    } catch (err) {
      console.error('Yapay Zeka Hatası:', err);
      await streamText('Üzgünüm, şu an bir sorun yaşıyorum. Lütfen biraz sonra tekrar dene.');
    }
  }, [streamText]);

  // Ruh hali seçilince localStorage'a kaydet + Groq'a sor
  const handleMoodSelect = useCallback((mood) => {
    if (moodSelected) return;
    setSelectedMood(mood);
    setMoodSelected(true);

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

    const userMsg = createMsg('user', `${mood.emoji} Bugün ${mood.label.toLowerCase()} hissediyorum.`);
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    fetchGroqAndStream(userMsg.content, updatedMessages, mood);
  }, [moodSelected, messages, fetchGroqAndStream]);

  const handleSend = useCallback((text) => {
    if (isStreaming) return;
    setShowQuickReplies(false);
    
    const userMsg = createMsg('user', text);
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    fetchGroqAndStream(text, updatedMessages, selectedMood);
  }, [isStreaming, messages, fetchGroqAndStream, selectedMood]);

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
