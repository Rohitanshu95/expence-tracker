import React from 'react';
import { Search, Bell, MessageSquare, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const Header = () => {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 0',
      marginBottom: '1.5rem',
      gap: '1rem'
    }}>
      {/* Search Bar - Hidden on small mobile, condensed on tablet */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }} className="hide-mobile">
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Search notes, categories, amounts..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.75rem 1rem 0.75rem 2.75rem', 
            background: 'white', 
            border: '1px solid #e2e8f0', 
            borderRadius: '12px',
            fontSize: '0.9rem'
          }}
        />
      </div>

      {/* Spacing for mobile toggle */}
      <div style={{ width: '45px' }} className="show-mobile" />

      {/* Date and User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="hide-mobile" style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{today}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
          <button style={{ color: '#94a3b8', position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%', border: '2px solid white' }} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.25rem' }}>
            <div className="hide-mobile" style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>{user?.username?.split(' ')[0] || 'User'}</p>
            </div>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)'
            }}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
