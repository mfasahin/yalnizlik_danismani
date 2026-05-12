import React, { useState } from 'react';
import { CloseOutlined, LockOutlined, LoadingOutlined, UserOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { changeUserPassword } from '../firebase';
import './ProfileModal.css';

const ProfileModal = ({ user, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor.' });
      return;
    }

    setLoading(true);
    try {
      await changeUserPassword(newPassword);
      setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Bu işlem için yakın zamanda giriş yapmış olmanız gerekiyor. Lütfen çıkış yapıp tekrar girin.' });
      } else {
        setMessage({ type: 'error', text: 'Şifre güncellenirken bir hata oluştu.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="profile-panel" aria-label="Profil ayarları paneli">
      <div className="profile-panel__header">
        <h2 className="profile-panel__title">⚙️ Profil Ayarları</h2>
        <button className="profile-panel__close" onClick={onClose} aria-label="Paneli kapat">
          <CloseOutlined />
        </button>
      </div>

      <div className="profile-panel__content">
        <div className="profile-user-card">
          <div className="profile-avatar-wrapper">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profil" />
            ) : (
              <UserOutlined />
            )}
          </div>
          <div className="profile-user-info">
            <h3>{user.displayName || 'Kullanıcı'}</h3>
            <p>{user.email}</p>
            {user.isAnonymous && <span className="profile-guest-badge">Misafir Hesap</span>}
          </div>
        </div>

        {!user.isAnonymous && (
          <div className="profile-section">
            <h4 className="profile-section-title">Şifre Değiştir</h4>
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="profile-input-group">
                <div className="profile-input-wrapper">
                  <LockOutlined className="profile-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Yeni Şifre"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button 
                    type="button" 
                    className="profile-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>

              <div className="profile-input-group">
                <div className="profile-input-wrapper">
                  <LockOutlined className="profile-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Yeni Şifre Tekrar"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {message.text && (
                <div className={`profile-status-msg ${message.type}`}>
                  {message.text}
                </div>
              )}

              <button type="submit" className="profile-submit-btn" disabled={loading}>
                {loading ? <LoadingOutlined /> : 'Şifreyi Güncelle'}
              </button>
            </form>
          </div>
        )}

        {user.isAnonymous && (
          <div className="profile-anonymous-notice">
            <p>Misafir hesaplarında şifre değiştirme özelliği bulunmamaktadır. Kalıcı bir hesap oluşturarak tüm özelliklerden yararlanabilirsiniz.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProfileModal;
