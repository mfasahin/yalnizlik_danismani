import React from 'react';
import { RobotFilled, UserOutlined } from '@ant-design/icons';
import './ChatMessage.css';

// AI yazarken gösterilen gelişmiş typing indicator
const TypingIndicator = () => (
  <div className="typing-indicator" aria-label="Danışman yazıyor">
    <div className="typing-indicator__dots">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
    <span className="typing-indicator__text">Danışman yanıt yazıyor</span>
  </div>
);

// AI cevabı tamamlanınca içeriği göster, streaming'de indicator
const MessageContent = ({ content, isStreaming }) => {
  if (isStreaming && !content) return <TypingIndicator />;
  return (
    <span className="chat-message__text">
      {content}
      {isStreaming && <span className="streaming-cursor" aria-hidden="true" />}
    </span>
  );
};

const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

const ChatMessage = ({ message }) => {
  const { role, content, timestamp, isStreaming } = message;
  const isUser = role === 'user';
  const dateObj = timestamp instanceof Date ? timestamp : new Date(timestamp);

  return (
    <div className={`chat-message chat-message--${role}`} aria-label={`${isUser ? 'Siz' : 'Terapist'}: ${content}`}>
      <div className="chat-message__avatar" aria-hidden="true">
        {isUser ? <UserOutlined /> : <RobotFilled />}
      </div>
      <div className="chat-message__body">
        <div className="chat-message__bubble">
          <MessageContent content={content} isStreaming={isStreaming} />
        </div>
        <time className="chat-message__time" dateTime={dateObj?.toISOString()}>
          {formatTime(dateObj)}
        </time>
      </div>
    </div>
  );
};

export default ChatMessage;
