import React, { useMemo } from 'react';
import './MoodHistory.css';

const SCORE_COLORS = {
  9: '#f6d365', // mutlu - sarı
  7: '#a8d8c8', // sakin - mint
  5: '#b8c4d0', // nötr - gri
  3: '#8ab4d4', // hüzünlü - mavi
  2: '#d4a8c8', // endişeli - mor
  1: '#e08080', // çok kötü - kırmızı
};

const DAY_LABELS = ['Pzt', 'Sal', 'Çrş', 'Prş', 'Cum', 'Cmt', 'Paz'];

// Son 7 günü oluştur (bugün dahil, geriye doğru)
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const SVGChart = ({ history }) => {
  const days = getLast7Days();
  const chartHeight = 80;
  const barWidth = 28;
  const gap = 12;
  const totalWidth = days.length * (barWidth + gap);

  // Her gün için en son kaydı bul
  const dayScores = days.map(day => {
    const entries = history.filter(e => isSameDay(new Date(e.timestamp), day));
    if (entries.length === 0) return null;
    return entries[entries.length - 1].score;
  });

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${chartHeight + 24}`}
      width="100%"
      aria-label="Haftalık ruh hali grafiği"
      className="mood-chart"
    >
      {days.map((day, i) => {
        const score = dayScores[i];
        const x = i * (barWidth + gap);
        const barH = score ? Math.max(8, (score / 9) * chartHeight) : 0;
        const y = chartHeight - barH;
        const color = score ? SCORE_COLORS[score] ?? '#a8d8c8' : 'rgba(100,120,140,0.12)';
        const isToday = isSameDay(day, new Date());

        return (
          <g key={i}>
            {/* Boş zemin çubuğu */}
            <rect
              x={x} y={0}
              width={barWidth} height={chartHeight}
              rx={6} fill="rgba(100,120,140,0.08)"
            />
            {/* Dolu ruh hali çubuğu */}
            {score && (
              <rect
                x={x} y={y}
                width={barWidth} height={barH}
                rx={6}
                fill={color}
                style={{ filter: `drop-shadow(0 2px 6px ${color}88)` }}
              />
            )}
            {/* Gün etiketi */}
            <text
              x={x + barWidth / 2}
              y={chartHeight + 16}
              textAnchor="middle"
              fontSize="10"
              fontWeight={isToday ? '700' : '400'}
              fill={isToday ? 'var(--mint-dark)' : 'var(--text-light)'}
            >
              {DAY_LABELS[day.getDay() === 0 ? 6 : day.getDay() - 1]}
            </text>
            {/* Score etiketi (varsa) */}
            {score && (
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="9"
                fill="var(--text-secondary)"
                fontWeight="600"
              >
                {score}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const MoodHistory = ({ history, onClose }) => {
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [history]
  );

  const avgScore = useMemo(() => {
    if (!history.length) return null;
    return (history.reduce((s, e) => s + e.score, 0) / history.length).toFixed(1);
  }, [history]);

  return (
    /* Panel */
    <aside className="mood-history-panel" aria-label="Duygu geçmişi paneli">
        <div className="mood-history-panel__header">
          <h2 className="mood-history-panel__title">📊 Duygu Geçmişi</h2>
          <button
            className="mood-history-panel__close"
            onClick={onClose}
            aria-label="Paneli kapat"
          >
            ✕
          </button>
        </div>

        {history.length === 0 ? (
          <div className="mood-history-panel__empty">
            <span className="mood-history-panel__empty-icon">🌱</span>
            <p>Henüz kayıt yok.</p>
            <p>İlk ruh halini seç ve takibi başlat!</p>
          </div>
        ) : (
          <>
            {/* Özet istatistik */}
            <div className="mood-history-panel__stats">
              <div className="mood-stat">
                <span className="mood-stat__value">{history.length}</span>
                <span className="mood-stat__label">Kayıt</span>
              </div>
              <div className="mood-stat">
                <span className="mood-stat__value">{avgScore}</span>
                <span className="mood-stat__label">Ort. Puan</span>
              </div>
              <div className="mood-stat">
                <span className="mood-stat__value">{sortedHistory[0]?.emoji}</span>
                <span className="mood-stat__label">Son Durum</span>
              </div>
            </div>

            {/* Grafik */}
            <div className="mood-history-panel__chart">
              <p className="mood-history-panel__section-label">Son 7 Gün</p>
              <SVGChart history={history} />
            </div>

            {/* Kayıtlar */}
            <div className="mood-history-panel__list">
              <p className="mood-history-panel__section-label">Tüm Kayıtlar</p>
              {sortedHistory.map((entry, i) => {
                const date = new Date(entry.timestamp);
                return (
                  <div key={i} className="mood-history-entry">
                    <span className="mood-history-entry__emoji">{entry.emoji}</span>
                    <div className="mood-history-entry__info">
                      <span className="mood-history-entry__label">{entry.label}</span>
                      <span className="mood-history-entry__time">
                        {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                        {' · '}
                        {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className="mood-history-entry__score"
                      style={{ background: SCORE_COLORS[entry.score] ?? '#a8d8c8' }}
                    >
                      {entry.score}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
    </aside>
  );
};

export default MoodHistory;
