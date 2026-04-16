import React from 'react';
import { RobotFilled, UserOutlined } from '@ant-design/icons';
import './ChatMessage.css';

const TypingIndicator = () => (
  <span className="typing-indicator" aria-label="Yazıyor">
    <span className="typing-dot" />
    <span className="typing-dot" />
    <span className="typing-dot" />
  </span>
);

const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

const ChatMessage = ({ message }) => {
  const { role, content, timestamp, isStreaming } = message;
  const isUser = role === 'user';

  return (
    <div className={`chat-message chat-message--${role}`} aria-label={`${isUser ? 'Siz' : 'Terapist'}: ${content}`}>
      <div className="chat-message__avatar" aria-hidden="true">
        {isUser ? <UserOutlined /> : <RobotFilled />}
      </div>
      <div className="chat-message__body">
        <div className="chat-message__bubble">
          {isStreaming ? (
            <TypingIndicator />
          ) : (
            <span className="chat-message__text">{content}</span>
          )}
        </div>
        <time className="chat-message__time" dateTime={timestamp?.toISOString()}>
          {formatTime(timestamp)}
        </time>
      </div>
    </div>
  );
};

export default ChatMessage;
