import React from 'react';

interface TopBarProps {
  onNotification: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onNotification }) => {
  return (
    <header className="top-bar">
      <div className="logo">SPEAKUP</div>
      <div className="top-bar-actions">
        <div className="icon-btn" onClick={onNotification} title="Notifications">🔔</div>
        <div className="icon-btn" title="Anonymous Mode">🔒</div>
      </div>
    </header>
  );
};

export default TopBar;
