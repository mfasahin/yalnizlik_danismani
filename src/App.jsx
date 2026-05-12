import React, { useState, useEffect, useRef, useCallback } from 'react';
import CrisisBanner from './components/CrisisBanner';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import MoodSelector from './components/MoodSelector';
import QuickReplies from './components/QuickReplies';
import MoodHistory from './components/MoodHistory';
import Sidebar from './components/Sidebar';
import ProfileModal from './components/ProfileModal';
import { LockFilled, MenuOutlined } from '@ant-design/icons';
import Login from './components/Login';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './App.css';
import { sendMessageToGroq, generateChatTitle } from './groq';



// localStorage yardımcıları (Mood History)
const getHistoryKey = (uid) => `yalnizlik_mood_history_${uid}`;
const loadHistory = (uid) => {
  if (!uid) return [];
  try {
    return JSON.parse(localStorage.getItem(getHistoryKey(uid))) ?? [];
  } catch {
    return [];
  }
};
const saveHistory = (uid, history) => {
  if (!uid) return;
  localStorage.setItem(getHistoryKey(uid), JSON.stringify(history));
};

// localStorage yardımcıları (Chats)
const getChatsKey = (uid) => `yalnizlik_chats_history_${uid}`;
const defaultInitialMsg = 'Merhaba, ben Dijital Yol Arkadaşınızım. Bugün nasılsınız? Düşüncelerinizi, hissettiklerinizi benimle paylaşabilirsiniz. Burada güvende ve yargılanmaksızın konuşabilirsiniz.';

const loadChats = (uid) => {
  if (!uid) return [];
  try {
    const data = JSON.parse(localStorage.getItem(getChatsKey(uid)));
    if (data && Array.isArray(data) && data.length > 0) {
      // Veri temizliği: Eski bug yüzünden kopyalanan mesajları temizle
      return data.map(chat => {
        const uniqueMessages = [];
        const seenIds = new Set();
        let hasInitialMsg = false;
        
        chat.messages.forEach(msg => {
          const isInitial = msg.role === 'ai' && msg.content === defaultInitialMsg;
          if (isInitial) {
            if (!hasInitialMsg) {
              hasInitialMsg = true;
              uniqueMessages.push({ ...msg, id: msg.id === 1 ? Date.now().toString() + Math.random().toString(36).substring(2, 9) : msg.id });
            }
          } else {
            if (!seenIds.has(msg.id)) {
              seenIds.add(msg.id);
              uniqueMessages.push(msg);
            }
          }
        });
        return { ...chat, messages: uniqueMessages };
      });
    }
  } catch {}
  
  return [{
    id: Date.now().toString(),
    title: 'Yeni Sohbet',
    messages: [createMsg('ai', defaultInitialMsg)],
    mood: null
  }];
};
const saveChats = (uid, chats) => {
  if (!uid) return;
  localStorage.setItem(getChatsKey(uid), JSON.stringify(chats));
};

const createMsg = (role, content, extra = {}) => ({
  id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
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
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
  
  // Chat & History State
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSelected, setMoodSelected] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Kullanıcı giriş yaptığında verilerini yükle
        const loadedChats = loadChats(currentUser.uid);
        const loadedHistory = loadHistory(currentUser.uid);
        const initialChat = loadedChats[0];

        setChats(loadedChats);
        setMoodHistory(loadedHistory);
        setCurrentChatId(initialChat.id);
        setMessages(initialChat.messages);
        setSelectedMood(initialChat.mood);
        setMoodSelected(!!initialChat.mood);
        setShowQuickReplies(initialChat.messages.length <= 1);
      } else {
        // Çıkış yapıldığında state'i sıfırla
        setChats([]);
        setMoodHistory([]);
        setCurrentChatId(null);
        setMessages([]);
        setSelectedMood(null);
        setMoodSelected(false);
      }
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

  // Sync current chat state back to the chats array and localStorage
  useEffect(() => {
    if (!user || !currentChatId) return;

    setChats(prev => {
      const newChats = prev.map(chat => {
        if (chat.id === currentChatId) {
          let title = chat.title;
          if (title === 'Yeni Sohbet' && messages.length > 1) {
            const firstUserMsg = messages.find(m => m.role === 'user');
            if (firstUserMsg) {
              title = firstUserMsg.content.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').substring(0, 30).trim() + '...';
            }
          }
          return { ...chat, messages, mood: selectedMood, title };
        }
        return chat;
      });
      saveChats(user.uid, newChats);
      return newChats;
    });
  }, [messages, selectedMood, currentChatId, user]);

  const handleNewChat = useCallback(() => {
    const newChat = {
      id: Date.now().toString(),
      title: 'Yeni Sohbet',
      messages: [createMsg('ai', defaultInitialMsg)],
      mood: null
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages(newChat.messages);
    setSelectedMood(null);
    setMoodSelected(false);
    setShowQuickReplies(true);
  }, []);

  const handleSelectChat = useCallback((chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat && chat.id !== currentChatId) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setSelectedMood(chat.mood);
      setMoodSelected(!!chat.mood);
      setShowQuickReplies(chat.messages.length <= 1);
    }
  }, [chats, currentChatId]);

  const handleDeleteChat = useCallback((chatId) => {
    setChats(prev => {
      const updated = prev.filter(c => c.id !== chatId);
      if (updated.length === 0) {
        const newChat = {
          id: Date.now().toString(),
          title: 'Yeni Sohbet',
          messages: [createMsg('ai', defaultInitialMsg)],
          mood: null
        };
        setCurrentChatId(newChat.id);
        setMessages(newChat.messages);
        setSelectedMood(null);
        setMoodSelected(false);
        setShowQuickReplies(true);
        return [newChat];
      }
      if (currentChatId === chatId) {
        setCurrentChatId(updated[0].id);
        setMessages(updated[0].messages);
        setSelectedMood(updated[0].mood);
        setMoodSelected(!!updated[0].mood);
        setShowQuickReplies(updated[0].messages.length <= 1);
      }
      return updated;
    });
  }, [currentChatId]);

  const streamText = useCallback((text) => {
    return new Promise((resolve) => {
      const streamId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
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
  }, [user]);

  const fetchGroqAndStream = useCallback(async (userText, currentMessages, mood) => {
    setIsStreaming(true);
    try {
      const aiText = await sendMessageToGroq(currentMessages, userText, mood);
      await streamText(aiText);

      // Otomatik Başlık Oluşturma: Eğer başlık hala varsayılan ise
      const currentChat = chats.find(c => c.id === currentChatId);
      if (currentChat && currentChat.title === 'Yeni Sohbet') {
        const newTitle = await generateChatTitle(userText);
        setChats(prev => prev.map(c => 
          c.id === currentChatId ? { ...c, title: newTitle } : c
        ));
      }

    } catch (err) {
      console.error('Yapay Zeka Hatası:', err);
      await streamText('Üzgünüm, şu an bir sorun yaşıyorum. Lütfen biraz sonra tekrar dene.');
    }
  }, [streamText, chats, currentChatId]);

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
      saveHistory(user.uid, updated);
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
      
      {/* Global Sidebar Toggle Button */}
      <button 
        className="global-sidebar-toggle" 
        onClick={() => setIsSidebarOpen(prev => !prev)}
        aria-label="Menüyü aç/kapat"
      >
        <MenuOutlined />
      </button>

      <Sidebar 
        chats={chats}
        isOpen={isSidebarOpen}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onProfileClick={() => {
          setShowProfile(prev => !prev);
          setShowHistory(false); // Aynı anda tek panel açık olsun
        }}
      />
      
      <div 
        className={`app-card ${isSidebarOpen ? 'sidebar-is-open' : ''}`} 
        style={{ 
          flex: 1, 
          maxWidth: '1000px', 
          margin: '0 auto', 
          width: '100%',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        <CrisisBanner />
        <Header
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          onShowHistory={() => {
            setShowHistory(prev => !prev);
            setShowProfile(false); // Aynı anda tek panel açık olsun
          }}
          historyCount={moodHistory.length}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
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

      {/* Profile Panel */}
      {showProfile && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
        />
      )}

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
