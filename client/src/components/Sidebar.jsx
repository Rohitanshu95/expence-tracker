import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  PieChart, 
  FileText, 
  Settings,
  X,
  BookOpen,
  Activity,
  UtensilsCrossed
} from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ isOpen, onClose, onAddTransaction }) => {
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/' },
    { icon: Plus, label: 'Add Transaction', path: '#', onClick: () => { onAddTransaction(); onClose(); } },
    { icon: TrendingUp, label: 'Income', path: '/income' },
    { icon: TrendingDown, label: 'Expenses', path: '/expenses' },
    { icon: BookOpen, label: 'Friend Khata', path: '/khata' },
    { icon: UtensilsCrossed, label: 'Canteen', path: '/canteen' },
    { icon: Layers, label: 'Modules', path: '/modules' },
    { icon: Activity, label: 'Analytics', path: '/analytics' },
    { icon: FileText, label: 'Reports', path: '/reports' },
  ];

  const sidebarContent = (
    <aside style={{
      width: '280px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      background: '#ffffff',
      color: '#1e293b',
      borderRight: '1px solid #e2e8f0',
      zIndex: 1000
    }}>
      {/* Header / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Logo size={40} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1e293b' }}>ExpenseFlow</span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }} className="show-mobile">
          <X size={24} />
        </button>
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => (
            <li key={item.label}>
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    color: '#64748b',
                    width: '100%',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#1e293b';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ) : (
                <NavLink 
                  to={item.path}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    color: isActive ? '#2563eb' : '#64748b',
                    background: isActive ? '#eff6ff' : 'transparent',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                  })}
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>
            <NavLink 
              to="/settings"
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: isActive ? '#2563eb' : '#64748b',
                background: isActive ? '#eff6ff' : 'transparent',
                fontSize: '0.9rem',
                fontWeight: 700
              })}
            >
              <Settings size={20} />
              Settings
            </NavLink>
          </li>
          <li style={{ padding: '0.5rem 1rem' }}>
            <button 
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                width: '100%',
                padding: '0.75rem 0',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hide-mobile">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px' }}
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
