import React, { useState } from 'react';
import './MoodSelector.css';

const MOODS = [
  { emoji: '😊', label: 'Mutlu',      value: 'happy',   score: 9, color: '#f6d365' },
  { emoji: '😌', label: 'Sakin',      value: 'calm',    score: 7, color: '#a8d8c8' },
  { emoji: '😐', label: 'Nötr',       value: 'neutral', score: 5, color: '#b8c4d0' },
  { emoji: '😔', label: 'Hüzünlü',   value: 'sad',     score: 3, color: '#8ab4d4' },
  { emoji: '😰', label: 'Endişeli',  value: 'anxious', score: 2, color: '#d4a8c8' },
  { emoji: '😢', label: 'Çok Kötü',  value: 'terrible',score: 1, color: '#e08080' },
];

export default function MoodSelector({ onMoodSelect, selectedMood }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="mood-selector" role="group" aria-label="Ruh hali seçimi">
      <p className="mood-selector__title">Bugün nasıl hissediyorsun?</p>
      <div className="mood-selector__grid">
        {MOODS.map((mood) => {
          const isSelected = selectedMood?.value === mood.value;
          const isHovered = hovered === mood.value;
          return (
            <button
              key={mood.value}
              className={`mood-btn ${isSelected ? 'mood-btn--selected' : ''}`}
              style={{ '--mood-color': mood.color }}
              onClick={() => onMoodSelect(mood)}
              onMouseEnter={() => setHovered(mood.value)}
              onMouseLeave={() => setHovered(null)}
              aria-pressed={isSelected}
              aria-label={mood.label}
              title={mood.label}
            >
              <span className="mood-btn__emoji">
                {mood.emoji}
              </span>
              <span className="mood-btn__label">{mood.label}</span>
              {isSelected && <span className="mood-btn__check">✓</span>}
            </button>
          );
        })}
      </div>
      {selectedMood && (
        <p className="mood-selector__feedback" style={{ '--mood-color': selectedMood.color }}>
          <span>{selectedMood.emoji}</span> <strong>{selectedMood.label}</strong> hissini seçtin. Benimle paylaşmak istediğin bir şey var mı?
        </p>
      )}
    </div>
  );
}
