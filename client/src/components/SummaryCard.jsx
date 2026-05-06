import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, IndianRupee } from 'lucide-react';

const SummaryCard = ({ title, amount, type, icon: Icon, trend }) => {
  const isIncome = type === 'income';
  const isBalance = type === 'balance';
  
  const getThemeColor = () => {
    if (isIncome) return '#10b981';
    if (isBalance) return '#2563eb';
    return '#ef4444';
  };

  const themeColor = getThemeColor();
  
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)' }}
      style={{ 
        padding: '1.5rem', 
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div style={{ 
          padding: '0.6rem', 
          background: `${themeColor}15`, 
          borderRadius: '10px',
          color: themeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {Icon ? <Icon size={20} /> : <IndianRupee size={20} />}
        </div>
        {trend !== undefined && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            fontSize: '0.75rem',
            color: trend >= 0 ? '#10b981' : '#ef4444',
            fontWeight: 700,
            padding: '0.25rem 0.5rem',
            background: trend >= 0 ? '#f0fdf4' : '#fef2f2',
            borderRadius: '6px'
          }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.01em' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>₹{amount?.toLocaleString('en-IN') || '0'}</span>
        </div>
      </div>

      {/* Decorative Progress Bar for depth */}
      <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '10px', marginTop: '1.25rem', overflow: 'hidden' }}>
        <div style={{ width: '65%', height: '100%', background: themeColor, borderRadius: '10px', opacity: 0.6 }} />
      </div>
    </motion.div>
  );
};

export default SummaryCard;
