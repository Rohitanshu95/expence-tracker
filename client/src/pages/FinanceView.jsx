import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, Filter, Download, ArrowLeft, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransactionTable from '../components/TransactionTable';
import api from '../utils/api';

const FinanceView = ({ type }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('monthly'); // daily, weekly, monthly, all

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      // Filter by type (income or expense)
      const filteredByType = res.data.filter(tx => tx.type === type);
      setTransactions(filteredByType);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      if (filterPeriod === 'daily') {
        return txDate >= today;
      }
      if (filterPeriod === 'weekly') {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        return txDate >= lastWeek;
      }
      if (filterPeriod === 'monthly') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return txDate >= firstDayOfMonth;
      }
      return true; // 'all'
    });
  }, [transactions, filterPeriod]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  }, [filteredTransactions]);

  const periodLabel = {
    daily: "Today's",
    weekly: "This Week's",
    monthly: "This Month's",
    all: "Total"
  }[filterPeriod];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'capitalize' }}>
              {type} Tracking
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Detailed history and analytics for your {type}.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Highlight Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass" 
        style={{ 
          padding: '2.5rem', 
          borderRadius: 'var(--radius-xl)', 
          background: type === 'income' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          boxShadow: type === 'income' ? '0 20px 40px -12px rgba(16, 185, 129, 0.3)' : '0 20px 40px -12px rgba(239, 68, 68, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9, marginBottom: '0.5rem' }}>{periodLabel} {type}</p>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </h2>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '16px' }}>
            {type === 'income' ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
          </div>
        </div>
      </motion.div>

      {/* Filter & History Section */}
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.25rem' }}>{type === 'income' ? 'Income' : 'Expense'} History</h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem', borderRadius: '12px' }}>
            {['daily', 'weekly', 'monthly', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  background: filterPeriod === p ? 'white' : 'transparent',
                  color: filterPeriod === p ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: filterPeriod === p ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>
        ) : (
          <TransactionTable transactions={filteredTransactions} onDelete={fetchData} />
        )}
      </div>
    </div>
  );
};

export default FinanceView;
