import React from 'react';
import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 0',
      marginBottom: '2rem',
      gap: '2rem'
    }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Search transactions, modules..." 
          style={{ 
            width: '100%', 
            padding: '0.75rem 1rem 0.75rem 2.75rem', 
            background: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        />
      </div>

      {/* Date and User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'right', display: 'none', '@media (min-width: 1024px)': { display: 'block' } }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{today}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
          <button style={{ color: '#94a3b8', position: 'relative' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%', border: '2px solid white' }} />
          </button>
          <button style={{ color: '#94a3b8' }}>
            <MessageSquare size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem', cursor: 'pointer' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.username || 'John Doe'}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Premium User</p>
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem'
            }}>
              {user?.username?.charAt(0).toUpperCase() || 'J'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
