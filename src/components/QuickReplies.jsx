import React from 'react';
import './QuickReplies.css';

const QUICK_REPLIES = [
  { id: 1, text: 'Kendimi çok yalnız hissediyorum.', emoji: '😔' },
  { id: 2, text: 'Son zamanlarda çok kaygılıyım.', emoji: '😰' },
  { id: 3, text: 'Kendimle baş başa kalmaktan korkuyorum.', emoji: '🌑' },
  { id: 4, text: 'Neden böyle hissediyorum bilmiyorum.', emoji: '💭' },
  { id: 5, text: 'Biri beni anlasın istiyorum.', emoji: '🤝' },
  { id: 6, text: 'Bugün sadece biraz konuşmak istedim.', emoji: '💬' },
];

export default function QuickReplies({ onSelect }) {
  return (
    <div className="quick-replies" aria-label="Hızlı başlangıç önerileri">
      <p className="quick-replies__hint">Nereden başlayacağını bilmiyorsan →</p>
      <div className="quick-replies__list">
        {QUICK_REPLIES.map((item) => (
          <button
            key={item.id}
            className="quick-reply-btn"
            onClick={() => onSelect(item.text)}
            aria-label={item.text}
          >
            <span className="quick-reply-btn__emoji">{item.emoji}</span>
            <span className="quick-reply-btn__text">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
