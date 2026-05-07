import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Modal from './Modal';

const Header = () => {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

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
          setNotificationMsg(`Your total expenses (₹${res.data.totalExpense.toLocaleString('en-IN')}) have exceeded your total income (₹${res.data.totalIncome.toLocaleString('en-IN')}) for this month. Please review your spending!`);
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
      padding: '1.5rem 0',
      marginBottom: '2rem',
      gap: '1rem',
      borderBottom: '1px solid #f1f5f9'
    }}>
      {/* Search Bar - Hidden on small mobile, condensed on tablet */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }} className="hide-mobile">
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Search for everything..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.75rem 1rem 0.75rem 2.75rem', 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#1e293b'
          }}
        />
      </div>

      {/* Mobile Toggle Button */}
      <button 
        className="show-mobile"
        onClick={() => {
          const event = new CustomEvent('toggleSidebar');
          window.dispatchEvent(event);
        }}
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          padding: '0.6rem',
          borderRadius: '12px',
          cursor: 'pointer',
          color: 'var(--primary)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <Menu size={24} />
      </button>


      {/* Date and User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="hide-mobile" style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Date</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{today}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid #f1f5f9', paddingLeft: '1.5rem' }}>
          <button 
            title={hasNotification ? "View Alert" : "No notifications"}
            onClick={() => setIsModalOpen(true)}
            style={{ color: '#64748b', position: 'relative', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '0.6rem', borderRadius: '10px' }}
          >
            <Bell size={20} />
            {hasNotification && (
              <span style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
            )}
          </button>
          
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', cursor: 'pointer' }}>
            <div className="hide-mobile" style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{user?.username || 'User'}</p>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>Premium Account</p>
            </div>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              border: '2px solid white',
              overflow: 'hidden'
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </Link>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={hasNotification ? "Budget Alert!" : "No Notifications"}
        message={hasNotification ? notificationMsg : "You're all caught up! Your budget is looking healthy and no new alerts are pending. Keep it up! ✅"}
        type={hasNotification ? "danger" : "success"}
        confirmText="Got it!"
      />
    </header>
  );
};

export default Header;
