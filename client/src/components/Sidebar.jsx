import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Wallet, 
  PieChart, 
  FileText, 
  Settings,
  ChevronLeft,
  Activity
} from 'lucide-react';

const Sidebar = ({ onAddTransaction }) => {
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/' },
    { icon: Plus, label: 'Add Transaction', path: '#', onClick: onAddTransaction },
    { icon: TrendingUp, label: 'Income', path: '/income' },
    { icon: TrendingDown, label: 'Expenses', path: '/expenses' },
    { icon: Layers, label: 'Modules', path: '/modules' },
    { icon: Wallet, label: 'Budget Planner', path: '/budget' },
    { icon: Activity, label: 'Analytics', path: '/analytics' },
    { icon: FileText, label: 'Reports', path: '/reports' },
  ];

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      position: 'sticky',
      top: 0,
      background: '#0f172a', // Deep dark background from screenshot
      color: 'white',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      zIndex: 100
    }}>
      {/* Header / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
            padding: '0.5rem', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Activity size={24} color="white" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>ExpenseFlow</span>
        </div>
        <ChevronLeft size={20} style={{ color: '#94a3b8', cursor: 'pointer' }} />
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1 }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {navItems.map((item) => (
            <li key={item.label}>
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '16px',
                    color: '#94a3b8',
                    width: '100%',
                    textAlign: 'left',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <item.icon size={22} />
                  {item.label}
                </button>
              ) : (
                <NavLink 
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '16px',
                    color: isActive ? 'white' : '#94a3b8',
                    background: isActive ? 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none'
                  })}
                >
                  <item.icon size={22} />
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <NavLink 
              to="/settings"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1.25rem',
                borderRadius: '16px',
                color: isActive ? 'white' : '#94a3b8',
                fontSize: '0.95rem',
                fontWeight: 500
              })}
            >
              <Settings size={22} />
              Settings
            </NavLink>
          </li>
          <li style={{ padding: '1rem 1.25rem' }}>
            <button 
              style={{
                fontSize: '0.75rem',
                color: '#475569',
                background: '#1e293b',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                width: 'fit-content'
              }}
            >
              Manage cookies or opt out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
