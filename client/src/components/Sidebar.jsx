import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Settings,
  X,
  BookOpen,
  Activity,
  ChevronRight
} from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ isOpen, onClose, onAddTransaction }) => {
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard Overview', path: '/' },
    { icon: BookOpen, label: 'Friend Khata Ledger', path: '/khata' },
    { icon: UtensilsCrossed, label: 'Canteen Tracker', path: '/canteen' },
    { icon: TrendingUp, label: 'Income Management', path: '/income' },
    { icon: TrendingDown, label: 'Expense Tracking', path: '/expenses' },
    { icon: Activity, label: 'Visual Analytics', path: '/analytics' },
    { icon: FileText, label: 'Financial Reports', path: '/reports' },
    { icon: Settings, label: 'App Settings', path: '/settings' },
  ];

  const sheetContent = (
    <div style={{
      width: '100%',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem',
      background: '#ffffff',
      color: '#1e293b',
      borderRadius: '32px 32px 0 0',
      zIndex: 2001,
      boxShadow: '0 -10px 40px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      paddingBottom: '20px' // Space above bottom nav
    }}>
      {/* Handle for Bottom Sheet */}
      <div style={{ width: '45px', height: '5px', background: '#e2e8f0', borderRadius: '10px', margin: '0 auto 1.5rem auto' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Logo size={28} />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.01em' }}>Menu & Tools</span>
        </div>
        <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
          <X size={18} />
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {navItems.map((item) => (
            <NavLink 
              key={item.label}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1rem',
                borderRadius: '16px',
                color: isActive ? '#2563eb' : '#334155',
                background: isActive ? '#eff6ff' : 'transparent',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid #dbeafe' : '1px solid transparent'
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{ 
                    background: isActive ? '#dbeafe' : '#f8fafc', 
                    padding: '0.6rem', 
                    borderRadius: '12px',
                    display: 'flex',
                    color: isActive ? '#2563eb' : '#64748b'
                  }}>
                    <item.icon size={20} />
                  </div>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <ChevronRight size={18} style={{ opacity: 0.3 }} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 2000, // Stays below BottomNav (3000)
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: '70px' // Ends exactly at the top of bottom nav
        }}>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              background: 'rgba(15, 23, 42, 0.3)', 
              backdropFilter: 'blur(6px)' 
            }}
          />
          
          {/* Bottom Sheet */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 250 }}
            style={{ width: '100%', position: 'relative', zIndex: 2001 }}
          >
            {sheetContent}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
