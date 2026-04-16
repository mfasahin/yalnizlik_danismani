import React, { useState, useRef } from 'react';
import { SendOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import './ChatInput.css';

// Basic client-side sanitization to strip potential XSS vectors
const sanitize = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

const MAX_LENGTH = 2000;

const ChatInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    const clean = sanitize(trimmed);
    if (!clean) return;
    onSend(clean);
    setValue('');
    inputRef.current?.focus();
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw.length <= MAX_LENGTH) setValue(raw);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remaining = MAX_LENGTH - value.length;
  const nearLimit = remaining < 200;

  return (
    <div className="chat-input-wrapper" role="form" aria-label="Mesaj gönder">
      <div className="chat-input-row">
        <Input.TextArea
          ref={inputRef}
          id="chat-message-input"
          className="chat-input__textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Düşüncelerinizi paylaşın… (Enter ile gönderin)"
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={disabled}
          aria-label="Mesaj metni"
          maxLength={MAX_LENGTH}
        />
        <button
          id="chat-send-button"
          className={`chat-input__send ${value.trim() && !disabled ? 'chat-input__send--active' : ''}`}
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Mesajı gönder"
          title="Gönder (Enter)"
        >
          <SendOutlined />
        </button>
      </div>
      {nearLimit && (
        <span className="chat-input__counter" aria-live="polite">
          {remaining} karakter kaldı
        </span>
      )}
    </div>
  );
};

export default ChatInput;
