import React from 'react';
import { HeartFilled, MoonFilled, SunFilled } from '@ant-design/icons';
import './Header.css';

const Header = ({ darkMode, onToggleDark, onShowHistory, historyCount }) => (
  <header className="app-header">
    <div className="app-header__logo">
      <div className="app-header__logo-icon" aria-label="Uygulama logosu">
        <HeartFilled />
        <div className="app-header__logo-ring" />
      </div>
      <div className="app-header__logo-text">
        <span className="app-header__title">Yapay Yalnızlık Danışmanı</span>
        <span className="app-header__subtitle">Dijital Yol Arkadaşı</span>
      </div>
    </div>

    <div className="app-header__actions">
      {/* Duygu Geçmişi Butonu */}
      <button
        className="app-header__history-btn"
        onClick={onShowHistory}
        aria-label="Duygu geçmişini görüntüle"
        title="Duygu Geçmişi"
      >
        📊
        {historyCount > 0 && (
          <span className="app-header__history-btn__badge">{historyCount}</span>
        )}
      </button>

      {/* Dark Mode Butonu */}
      <button
        className="app-header__dark-toggle"
        onClick={onToggleDark}
        aria-label={darkMode ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
        title={darkMode ? 'Aydınlık mod' : 'Karanlık mod'}
      >
        {darkMode ? <SunFilled /> : <MoonFilled />}
      </button>
    </div>
  </header>
);

export default Header;
