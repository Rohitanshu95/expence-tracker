import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, IndianRupee } from 'lucide-react';

const SummaryCard = ({ title, amount, type, icon: Icon, trend }) => {
  const isIncome = type === 'income';
  const isBalance = type === 'balance';
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass glass-hover" 
      style={{ 
        padding: '1.5rem', 
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        background: 'white'
      }}
    >
      {/* Background Accent Glow (Light Mode Optimized) */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '120px',
        height: '120px',
        background: isIncome ? 'var(--success)' : isBalance ? 'var(--primary)' : 'var(--error)',
        filter: 'blur(70px)',
        opacity: 0.1,
        zIndex: 0
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          padding: '0.75rem', 
          background: isIncome ? 'rgba(16, 185, 129, 0.1)' : isBalance ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '12px',
          color: isIncome ? 'var(--success)' : isBalance ? 'var(--primary)' : 'var(--error)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {Icon ? <Icon size={24} /> : <IndianRupee size={24} />}
        </div>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            fontSize: '0.75rem',
            color: trend > 0 ? 'var(--success)' : 'var(--error)',
            fontWeight: 700,
            background: trend > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '0.25rem 0.6rem',
            borderRadius: '20px'
          }}>
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{title}</p>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
          ₹{amount?.toLocaleString('en-IN') || '0'}
        </h2>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
