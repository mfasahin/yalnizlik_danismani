import React, { useState } from 'react';
import { MailOutlined, LockOutlined, LoadingOutlined, UserOutlined, EyeOutlined, EyeInvisibleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { loginWithEmail, registerWithEmail, loginWithGoogle, loginAnonymously } from '../firebase';
import './Login.css';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (isRegistering) {
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        setError('Lütfen tüm alanları doldurun.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Şifreler eşleşmiyor.');
        return;
      }
      if (password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır.');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Lütfen e-posta ve şifrenizi girin.');
        return;
      }
    }
    
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(email, password, firstName, lastName);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-posta veya şifre hatalı.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanımda.');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifreniz çok zayıf (en az 6 karakter).');
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Google ile giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAnonymously();
    } catch (err) {
      setError('Misafir girişi yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${isRegistering ? 'register-mode' : 'login-mode'}`}>
      <div className="login-card">
        <div className="login-header">
          <h1>Yapay Yalnızlık Danışmanı</h1>
          <p>{isRegistering ? 'Yeni bir hesap oluşturun' : 'Hesabınıza giriş yapın'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="input-row">
              <div className="input-group">
                <label>Ad</label>
                <div className="input-wrapper">
                  <UserOutlined className="input-icon" />
                  <input 
                    type="text" 
                    className="login-input" 
                    placeholder="Adınız"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Soyad</label>
                <div className="input-wrapper">
                  <UserOutlined className="input-icon" />
                  <input 
                    type="text" 
                    className="login-input" 
                    placeholder="Soyadınız"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="input-group">
            <label>E-posta Adresi</label>
            <div className="input-wrapper">
              <MailOutlined className="input-icon" />
              <input 
                type="email" 
                className="login-input" 
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Şifre</label>
            <div className="input-wrapper">
              <LockOutlined className="input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="login-input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="input-group">
              <label>Şifre Tekrar</label>
              <div className="input-wrapper">
                <LockOutlined className="input-icon" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  className="login-input" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <LoadingOutlined /> : (isRegistering ? 'Kayıt Ol' : 'Giriş Yap')}
          </button>
        </form>

        <div className="divider">veya</div>

        <div className="social-login">
          <button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
            <GoogleIcon />
            Google
          </button>
          
          {!isRegistering && (
            <button className="btn-guest" onClick={handleGuestLogin} disabled={loading}>
              <ArrowRightOutlined />
              Misafir
            </button>
          )}
        </div>

        <div className="auth-switch">
          {isRegistering ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}
          <span onClick={() => {
            setIsRegistering(!isRegistering);
            setError(null);
            setShowPassword(false);
            setShowConfirmPassword(false);
          }}>
            {isRegistering ? 'Giriş Yap' : 'Kayıt Ol'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
