import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Coffee, Home, Car, Utensils, MoreHorizontal, IndianRupee, Tag } from 'lucide-react';

const CategoryIcon = ({ category }) => {
  const iconMap = {
    'Food': Utensils,
    'Transport': Car,
    'Housing': Home,
    'Shopping': ShoppingBag,
    'Entertainment': Coffee,
    'Other': Tag
  };
  const Icon = iconMap[category] || Tag;
  return <Icon size={18} />;
};

const TransactionTable = ({ transactions, onDelete, compact = false }) => {
  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {transactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No recent activity</p>
        ) : (
          transactions.map((tx, index) => (
            <motion.div 
              key={tx._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius)',
                background: 'white',
                border: '1px solid var(--border)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ 
                padding: '0.6rem', 
                background: tx.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.05)', 
                color: tx.type === 'income' ? 'var(--success)' : 'var(--text-muted)',
                borderRadius: '10px'
              }}>
                <CategoryIcon category={tx.module?.name} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tx.note || tx.module?.name || 'Transaction'}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{new Date(tx.date).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ 
                  fontWeight: 800, 
                  fontSize: '0.95rem',
                  color: tx.type === 'income' ? 'var(--success)' : 'var(--text-main)'
                }}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </p>
                {onDelete && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(tx._id); }}
                    style={{ 
                      color: '#94a3b8', 
                      background: '#f8fafc', 
                      border: '1px solid #f1f5f9', 
                      borderRadius: '8px', 
                      padding: '0.4rem', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    onTouchStart={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                    onTouchEnd={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
              <th style={{ padding: '1.25rem' }}>Transaction</th>
              <th style={{ padding: '1.25rem' }}>Category</th>
              <th style={{ padding: '1.25rem' }}>Date</th>
              <th style={{ padding: '1.25rem' }}>Amount</th>
              <th style={{ padding: '1.25rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <motion.tr 
                key={tx._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{tx.note || 'Untitled'}</div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--primary)' }}><CategoryIcon category={tx.module?.name} /></div>
                    {tx.module?.name}
                  </div>
                </td>
                <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                  {new Date(tx.date).toLocaleDateString()}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    fontWeight: 800, 
                    color: tx.type === 'income' ? 'var(--success)' : 'var(--text-main)' 
                  }}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <button onClick={() => onDelete(tx._id)} style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
