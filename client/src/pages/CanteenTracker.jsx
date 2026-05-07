import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  Coffee, 
  RefreshCw, 
  History as HistoryIcon, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Archive,
  ChevronRight,
  X,
  FileText,
  Trash2
} from 'lucide-react';
import api from '../utils/api';

import { useSearch } from '../context/SearchContext';

const CanteenTracker = () => {
  const { searchQuery } = useSearch();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 
  const [message, setMessage] = useState(null);
  const [selectedArchive, setSelectedArchive] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/canteen/status');
      setStatus(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching canteen status', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLogMeal = async (type) => {
    try {
      setActionLoading(type);
      const res = await api.post('/canteen/log', { mealType: type });
      setStatus(res.data);
      setMessage({ type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} logged successfully!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to log meal.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal log? Your meal count will be restored.')) return;
    try {
      setActionLoading(`delete-${mealId}`);
      const res = await api.delete(`/canteen/log/${mealId}`);
      setStatus(res.data);
      setMessage({ type: 'success', text: 'Meal log removed and count restored.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete meal log.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenew = async () => {
    if (!window.confirm('Are you sure you want to renew your 60-meal pass? Your current history will be moved to archives.')) return;
    try {
      setActionLoading('renew');
      const res = await api.post('/canteen/renew');
      setStatus(res.data);
      setMessage({ type: 'success', text: 'Pass renewed! Active history reset for the new month.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to renew pass.' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your meal pass...</div>;

  // REVERSED CALCULATION: Now shows consumed percentage (0 -> 100)
  const lunchConsumed = status.totalLunch - status.lunchRemaining;
  const dinnerConsumed = status.totalDinner - status.dinnerRemaining;
  const lunchPercent = (lunchConsumed / status.totalLunch) * 100;
  const dinnerPercent = (dinnerConsumed / status.totalDinner) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Canteen Tracker</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Manage your monthly meal pass.</p>
      </div>

      {/* Renew Pass Card */}
      <div className="premium-card" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ padding: '10px', background: 'white', borderRadius: '12px', color: '#2563eb', border: '1px solid #e2e8f0' }}>
            <RefreshCw size={20} className={actionLoading === 'renew' ? 'spin' : ''} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>Renew Monthly Pass</h4>
            <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Archive current and start new month.</p>
          </div>
        </div>
        <button 
          onClick={handleRenew}
          disabled={actionLoading === 'renew'}
          style={{ 
            padding: '0.6rem 1rem', 
            borderRadius: '12px', 
            background: '#2563eb', 
            color: 'white', 
            border: 'none',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          Renew
        </button>
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ 
              padding: '0.85rem 1rem', 
              borderRadius: '12px', 
              background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stats Cards - Vertical Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Lunch Card */}
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.6rem', background: '#fff7ed', color: '#f59e0b', borderRadius: '12px', display: 'flex' }}>
              <Utensils size={24} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Lunch Consumed</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{lunchConsumed} <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>/ {status.totalLunch}</span></h2>
            </div>
          </div>
          
          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${lunchPercent}%` }}
              style={{ height: '100%', background: '#f59e0b', borderRadius: '3px' }}
            />
          </div>

          <button 
            onClick={() => handleLogMeal('lunch')}
            disabled={actionLoading === 'lunch' || status.lunchRemaining === 0}
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              background: status.lunchRemaining === 0 ? '#f1f5f9' : '#f59e0b',
              color: 'white',
              cursor: status.lunchRemaining === 0 ? 'not-allowed' : 'pointer',
              boxShadow: status.lunchRemaining === 0 ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.2)'
            }}
          >
            {actionLoading === 'lunch' ? 'Logging...' : status.lunchRemaining === 0 ? 'Pass Depleted' : 'Log Lunch Today'}
          </button>
        </div>

        {/* Dinner Card */}
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.6rem', background: '#eef2ff', color: '#2563eb', borderRadius: '12px', display: 'flex' }}>
              <Coffee size={24} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Dinner Consumed</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{dinnerConsumed} <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>/ {status.totalDinner}</span></h2>
            </div>
          </div>
          
          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${dinnerPercent}%` }}
              style={{ height: '100%', background: '#2563eb', borderRadius: '3px' }}
            />
          </div>

          <button 
            onClick={() => handleLogMeal('dinner')}
            disabled={actionLoading === 'dinner' || status.dinnerRemaining === 0}
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              background: status.dinnerRemaining === 0 ? '#f1f5f9' : '#2563eb',
              color: 'white',
              cursor: status.dinnerRemaining === 0 ? 'not-allowed' : 'pointer',
              boxShadow: status.dinnerRemaining === 0 ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.2)'
            }}
          >
            {actionLoading === 'dinner' ? 'Logging...' : status.dinnerRemaining === 0 ? 'Pass Depleted' : 'Log Dinner Today'}
          </button>
        </div>
      </div>

      {/* Activity Sections - Vertical Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Daily Activity Table */}
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <HistoryIcon size={20} color="#2563eb" />
            <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>Current Pass Activity</h3>
          </div>
          <div style={{ overflowX: 'auto', margin: '0 -1.5rem', padding: '0 1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '300px' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '0.75rem 0' }}>Meal</th>
                  <th style={{ padding: '0.75rem 0' }}>Date</th>
                  <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {status.history.filter(item => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    item.mealType.toLowerCase().includes(query) ||
                    new Date(item.date).toLocaleDateString().includes(query)
                  );
                }).map((item, index) => (
                  <tr key={item._id || index} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '0.85rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, textTransform: 'capitalize', fontSize: '0.85rem' }}>
                        {item.mealType === 'lunch' ? <Utensils size={12} color="#f59e0b" /> : <Coffee size={12} color="#2563eb" />}
                        {item.mealType}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{new Date(item.date).toLocaleDateString()}</span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteMeal(item._id)}
                        disabled={actionLoading === `delete-${item._id}`}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {status.history.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No meals logged yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pass Archives */}
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Archive size={20} color="#2563eb" />
            <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>Pass Archives</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {status.archives.map((archive, index) => (
              <motion.div 
                key={index}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedArchive(archive)}
                style={{ 
                  padding: '1rem', 
                  background: '#f8fafc', 
                  borderRadius: '16px', 
                  border: '1px solid #f1f5f9',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.85rem' }}>{archive.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#64748b' }}>
                    <Calendar size={12} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{new Date(archive.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>{archive.lunchUsed}L</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{archive.dinnerUsed}D</span>
                  </div>
                  <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#cbd5e1' }} />
                </div>
              </motion.div>
            ))}
            {status.archives.length === 0 && (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', padding: '1rem' }}>No archived passes.</p>
            )}
          </div>
        </div>
      </div>

      {/* Archive History Modal */}
      <AnimatePresence>
        {selectedArchive && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100, display: 'flex', alignItems: 'flex-end' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedArchive(null)}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              style={{ 
                position: 'relative', 
                width: '100%', 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '24px 24px 0 0', 
                maxHeight: '85vh', 
                overflowY: 'auto',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '2px', margin: '0 auto 1.5rem auto' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{selectedArchive.label}</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Pass Usage Details</p>
                </div>
                <button onClick={() => setSelectedArchive(null)} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '50%', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Lunches</p>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>{selectedArchive.lunchUsed}</h4>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Dinners</p>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{selectedArchive.dinnerUsed}</h4>
                </div>
              </div>

              <h3 style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '1rem' }}>Meal History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedArchive.history.map((item, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.mealType === 'lunch' ? <Utensils size={14} color="#f59e0b" /> : <Coffee size={14} color="#2563eb" />}
                      <span style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '0.85rem' }}>{item.mealType}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{new Date(item.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CanteenTracker;
