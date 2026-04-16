import React from 'react';
import { WarningFilled, PhoneFilled } from '@ant-design/icons';
import './CrisisBanner.css';

const CrisisBanner = () => (
  <div className="crisis-banner" role="alert" aria-label="Acil durum uyarısı">
    <div className="crisis-banner__inner">
      <WarningFilled className="crisis-banner__icon" aria-hidden="true" />
      <div className="crisis-banner__text">
        <strong>Kriz Anında Yalnız Değilsiniz</strong>
        <span>
          Kendinize zarar verme veya intihar düşünceleri yaşıyorsanız lütfen hemen arayın:
        </span>
      </div>
      <div className="crisis-banner__numbers">
        <a href="tel:182" className="crisis-banner__number" aria-label="İntihar önleme hattı 182">
          <PhoneFilled /> <span>182</span>
          <small>İntihar Önleme</small>
        </a>
        <a href="tel:112" className="crisis-banner__number" aria-label="Acil yardım 112">
          <PhoneFilled /> <span>112</span>
          <small>Acil Yardım</small>
        </a>
      </div>
    </div>
  </div>
);

export default CrisisBanner;
