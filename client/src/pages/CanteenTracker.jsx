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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Canteen Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your monthly lunch and dinner pass effectively.</p>
        </div>
        <button 
          onClick={handleRenew}
          disabled={actionLoading === 'renew'}
          className="btn-primary" 
          style={{ background: 'white', color: 'var(--primary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <RefreshCw size={18} className={actionLoading === 'renew' ? 'spin' : ''} />
          {actionLoading === 'renew' ? 'Renewing...' : 'Renew & Archive'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ 
              padding: '1rem 1.5rem', 
              borderRadius: '12px', 
              background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Lunch Card */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '14px' }}>
              <Utensils size={28} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>LUNCH CONSUMED</p>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{lunchConsumed} <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>/ {status.totalLunch}</span></h2>
            </div>
          </div>
          
          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${lunchPercent}%` }}
              style={{ height: '100%', background: '#f59e0b', borderRadius: '4px' }}
            />
          </div>

          <button 
            onClick={() => handleLogMeal('lunch')}
            disabled={actionLoading === 'lunch' || status.lunchRemaining === 0}
            className="btn-primary"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '1rem', 
              background: status.lunchRemaining === 0 ? '#f1f5f9' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: status.lunchRemaining === 0 ? '#cbd5e1' : 'white',
              cursor: status.lunchRemaining === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {actionLoading === 'lunch' ? 'Logging...' : status.lunchRemaining === 0 ? 'Pass Depleted' : 'Log Lunch Today'}
          </button>
        </div>

        {/* Dinner Card */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '14px' }}>
              <Coffee size={28} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>DINNER CONSUMED</p>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{dinnerConsumed} <span style={{ fontSize: '1rem', color: '#cbd5e1' }}>/ {status.totalDinner}</span></h2>
            </div>
          </div>
          
          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${dinnerPercent}%` }}
              style={{ height: '100%', background: 'var(--primary)', borderRadius: '4px' }}
            />
          </div>

          <button 
            onClick={() => handleLogMeal('dinner')}
            disabled={actionLoading === 'dinner' || status.dinnerRemaining === 0}
            className="btn-primary"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              padding: '1rem',
              background: status.dinnerRemaining === 0 ? '#f1f5f9' : 'var(--primary-gradient)',
              color: status.dinnerRemaining === 0 ? '#cbd5e1' : 'white',
              cursor: status.dinnerRemaining === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {actionLoading === 'dinner' ? 'Logging...' : status.dinnerRemaining === 0 ? 'Pass Depleted' : 'Log Dinner Today'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="responsive-grid">
        {/* Daily Activity Table */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <HistoryIcon size={22} color="var(--primary)" />
            <h3 style={{ fontWeight: 800 }}>Current Pass Activity</h3>
          </div>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Meal Type</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Time</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
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
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, textTransform: 'capitalize' }}>
                        {item.mealType === 'lunch' ? <Utensils size={14} color="#f59e0b" /> : <Coffee size={14} color="var(--primary)" />}
                        {item.mealType}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteMeal(item._id)}
                        disabled={actionLoading === `delete-${item._id}`}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        title="Delete meal log"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {status.history.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No meals logged for this pass yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Archives / Month History */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Archive size={22} color="var(--primary)" />
            <h3 style={{ fontWeight: 800 }}>Pass Archives</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {status.archives.map((archive, index) => (
              <motion.div 
                key={index}
                whileHover={{ x: 5 }}
                onClick={() => setSelectedArchive(archive)}
                style={{ 
                  padding: '1.25rem', 
                  background: '#f8fafc', 
                  borderRadius: '16px', 
                  border: '1px solid #f1f5f9',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>{archive.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                    <Calendar size={12} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {new Date(archive.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{archive.lunchUsed}L</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{archive.dinnerUsed}D</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#cbd5e1' }} />
                </div>
              </motion.div>
            ))}
            {status.archives.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>No archived passes yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Archive History Modal (Same as before) */}
      <AnimatePresence>
        {selectedArchive && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedArchive(null)}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass"
              style={{ position: 'relative', width: '100%', maxWidth: '600px', background: 'white', padding: '2rem', borderRadius: '24px', maxHeight: '80vh', overflowY: 'auto' }}
            >
              <button onClick={() => setSelectedArchive(null)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Archive size={24} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedArchive.label} Details</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                  Active from {new Date(selectedArchive.startDate).toLocaleDateString()} to {new Date(selectedArchive.endDate).toLocaleDateString()}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>LUNCHES</p>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{selectedArchive.lunchUsed}</h4>
                </div>
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DINNERS</p>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{selectedArchive.dinnerUsed}</h4>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <FileText size={18} color="var(--primary)" />
                <h3 style={{ fontWeight: 800 }}>Archived Meal Logs</h3>
              </div>
              
              <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.75rem' }}>Meal</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedArchive.history.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, textTransform: 'capitalize', fontSize: '0.85rem' }}>{item.mealType}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(item.date).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
