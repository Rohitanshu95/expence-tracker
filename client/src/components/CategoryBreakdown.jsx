import React from 'react';
import * as Icons from 'lucide-react';

const CategoryBreakdown = ({ categories, totalExpense }) => {
  if (!categories || categories.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', color: 'var(--text-muted)' }}>
        <Icons.PieChart size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No expense data to display</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
      {categories.slice(0, 5).map((category, index) => {
        const percentage = totalExpense > 0 ? (category.total / totalExpense) * 100 : 0;
        const Icon = Icons[category.icon] || Icons.Tag;

        return (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  padding: '0.5rem', 
                  background: `${category.color}15`, 
                  color: category.color,
                  borderRadius: '10px',
                  display: 'flex'
                }}>
                  <Icon size={18} />
                </div>
                <div>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{category.name}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{percentage.toFixed(1)}% of total</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>₹{category.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${percentage}%`, 
                  height: '100%', 
                  background: category.color,
                  borderRadius: '4px',
                  transition: 'width 0.5s ease-out'
                }} 
              />
            </div>
          </div>
        );
      })}
      
      {categories.length > 5 && (
        <button style={{ 
          marginTop: '0.5rem', 
          padding: '0.75rem', 
          borderRadius: '12px', 
          border: '1px dashed #e2e8f0', 
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          View {categories.length - 5} more categories
        </button>
      )}
    </div>
  );
};

export default CategoryBreakdown;
