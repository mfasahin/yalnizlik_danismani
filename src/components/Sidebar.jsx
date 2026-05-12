import { MessageOutlined, PlusOutlined, DeleteOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { logoutUser } from '../firebase';
import './Sidebar.css';

const Sidebar = ({ chats, currentChatId, isOpen, onSelectChat, onNewChat, onDeleteChat, onProfileClick }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* ... (new chat button) */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <PlusOutlined /> Yeni Sohbet
      </button>

      {/* ... (chat list) */}
      <div className="chat-history-list">
        <div className="history-group-title">Sohbetler</div>
        {chats.map(chat => (
          <div 
            key={chat.id} 
            className={`history-item ${chat.id === currentChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <MessageOutlined className="history-icon" />
            <span className="history-title">{chat.title}</span>
            <button 
              className="delete-btn" 
              title="Sohbeti Sil"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              <DeleteOutlined />
            </button>
          </div>
        ))}
        {chats.length === 0 && (
          <div className="empty-history">Geçmiş bulunmuyor.</div>
        )}
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-profile-btn" onClick={onProfileClick}>
          <UserOutlined />
          <span>Profil</span>
        </button>
        <button className="sidebar-logout-btn" onClick={logoutUser}>
          <LogoutOutlined />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
