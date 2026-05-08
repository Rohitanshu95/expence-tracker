import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import Modal from './Modal';
import Logo from './Logo';

const Header = () => {
  const { user } = useAuth();
  const { setSearchQuery } = useSearch();
  const location = useLocation();
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'ExpenseFlow';
      case '/khata': return 'Friend Khata';
      case '/canteen': return 'Canteen Tracker';
      case '/analytics': return 'Visual Analytics';
      case '/settings': return 'Settings';
      case '/profile': return 'My Profile';
      case '/history': return 'History';
      default: return 'ExpenseFlow';
    }
  };

  useEffect(() => {
    const checkBudget = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const res = await api.get('/transactions/summary', { 
          params: { startDate: startOfMonth, endDate: endOfMonth } 
        });
        
        if (res.data.totalExpense > res.data.totalIncome) {
          setHasNotification(true);
          setNotificationMsg(`Your total expenses (₹${res.data.totalExpense.toLocaleString('en-IN')}) have exceeded your total income (₹${res.data.totalIncome.toLocaleString('en-IN')}) for this month.`);
        } else {
          setHasNotification(false);
        }
      } catch (err) {
        console.error("Failed to fetch notification data", err);
      }
    };

    if (user) {
      checkBudget();
    }
  }, [user]);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      background: 'var(--primary)',
      borderRadius: '0 0 24px 24px',
      color: 'white',
      width: '100%',
      zIndex: 50,
      position: 'relative',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
    }}>
      {/* App Branding */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.6rem',
        justifyContent: 'flex-start'
      }}>
        <Logo size={28} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.02em' }}>{getPageTitle()}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            color: 'white', 
            position: 'relative', 
            background: 'rgba(255, 255, 255, 0.1)', 
            border: 'none', 
            cursor: 'pointer', 
            padding: '0.6rem', 
            borderRadius: '12px'
          }}
        >
          <Bell size={20} />
          {hasNotification && (
            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid var(--primary)' }} />
          )}
        </button>
        
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '12px', 
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            fontWeight: 900,
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            overflow: 'hidden'
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
        </Link>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={hasNotification ? "Budget Alert!" : "No Notifications"}
        message={hasNotification ? notificationMsg : "You're all caught up! Your budget is looking healthy and no new alerts are pending. ✅"}
        type={hasNotification ? "danger" : "success"}
        confirmText="Got it!"
      />
    </header>
  );
};

export default Header;
