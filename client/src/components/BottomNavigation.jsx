import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  Plus, 
  Menu,
  BookOpen,
  UtensilsCrossed
} from 'lucide-react';

const BottomNavigation = ({ onAddTransaction }) => {
  const navItems = [
    { icon: LayoutGrid, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Khata', path: '/khata' },
    { icon: Plus, label: 'Add', path: '#', isFab: true, onClick: onAddTransaction },
    { icon: UtensilsCrossed, label: 'Canteen', path: '/canteen' },
    { icon: Menu, label: 'More', path: '#', onClick: () => {
      const event = new CustomEvent('toggleSidebar');
      window.dispatchEvent(event);
    }}
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item, index) => (
        item.isFab ? (
          <button 
            key={index} 
            className="nav-item-fab"
            onClick={item.onClick}
          >
            <item.icon size={28} strokeWidth={2.5} />
          </button>
        ) : item.onClick ? (
          <button 
            key={index} 
            className="nav-item"
            onClick={item.onClick}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </button>
        ) : (
          <NavLink 
            key={index} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </NavLink>
        )
      ))}
    </nav>
  );
};

export default BottomNavigation;
