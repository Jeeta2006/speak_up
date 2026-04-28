import React from 'react';
import { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const navItems: { id: Screen; label: string; icon: string }[] = [
    { id: 'report', label: 'REPORT', icon: '🏠' },
    { id: 'feed', label: 'FEED', icon: '📡' },
    { id: 'map', label: 'MAP', icon: '🗺️' },
    { id: 'dashboard', label: 'STATS', icon: '📊' },
    { id: 'demo', label: 'DEMO', icon: '▶️' },
  ];

  return (
    <nav>
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${activeScreen === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
