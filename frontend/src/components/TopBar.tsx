import React from 'react';
import { Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const GeminiIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gemini-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="50%" stopColor="#9B72CB" />
        <stop offset="100%" stopColor="#D96570" />
      </linearGradient>
    </defs>
    <path d="M14 2C14 2 16.5 9.5 22 14C16.5 18.5 14 26 14 26C14 26 11.5 18.5 6 14C11.5 9.5 14 2 14 2Z" fill="url(#gemini-grad)" />
  </svg>
);

const TopBar: React.FC = () => {
  const handleOpenGemini = () => window.open('https://gemini.google.com', '_blank', 'noopener,noreferrer');

  return (
    <header style={{ display: 'flex', alignItems: 'center', height: 48, minHeight: 48, background: '#061222', borderBottom: '1px solid rgba(68,119,148,0.3)', padding: '0 16px', gap: 12, zIndex: 50, flexShrink: 0 }}>
      {/* Left */}
      <div style={{ flex: 1, display: 'flex',  alignItems: 'center', minWidth: 0, }} >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 17, fontWeight: 700, color: '#e8f4ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em' }}>
          Không gian làm việc của tôi
        </span>
      </div>


      {/* Right */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        <Tooltip title="Mở Gemini AI" placement="bottom">
          <button
            onClick={handleOpenGemini}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', height: 30, borderRadius: 8, border: '1px solid rgba(155,114,203,0.35)', background: 'rgba(155,114,203,0.1)', color: '#c4a8f0', fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <GeminiIcon size={16} />
            <span>Gemini</span>
          </button>
        </Tooltip>
      </div>
    </header>
  );
};

export default TopBar;
