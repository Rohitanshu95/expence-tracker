import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Target, AlertTriangle, CheckCircle2, TrendingUp, IndianRupee, Save, Calendar } from 'lucide-react';
import api from '../utils/api';

const BudgetPlanner = () => {
  const [budget, setBudget] = useState(0);
  const [inputAmount, setInputAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString('default', { month: 'long' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetRes, transRes] = await Promise.all([
        api.get(`/budget?month=${currentMonth}&year=${currentYear}`),
        api.get('/transactions')
      ]);

      setBudget(budgetRes.data.amount || 0);
      setInputAmount(budgetRes.data.amount?.toString() || '');
      
      // Filter expenses for current month
      const currentMonthExpenses = transRes.data.filter(tx => {
        const d = new Date(tx.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && tx.type === 'expense';
      });
      setExpenses(currentMonthExpenses);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching budget data', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalSpent = useMemo(() => {
    return expenses.reduce((acc, tx) => acc + tx.amount, 0);
  }, [expenses]);

  const handleSaveBudget = async () => {
    try {
      setIsSaving(true);
      const amount = parseFloat(inputAmount);
      if (isNaN(amount) || amount < 0) {
        alert('Please enter a valid amount');
        return;
      }

      await api.post('/budget', {
        month: currentMonth,
        year: currentYear,
        amount
      });
      
      setBudget(amount);
      setIsSaving(false);
    } catch (err) {
      console.error('Error saving budget', err);
      setIsSaving(false);
    }
  };

  const progress = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const isExceeded = totalSpent > budget && budget > 0;
  const remaining = Math.max(budget - totalSpent, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Budget Planner</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Plan and track your monthly spending goals.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <Calendar size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{monthName} {currentYear}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
        {/* Set Budget Section */}
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', background: 'white', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '10px' }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontWeight: 800 }}>Set Monthly Goal</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>BUDGET FOR {monthName.toUpperCase()}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-muted)' }}>₹</span>
                <input 
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="Enter amount (e.g. 10000)"
                  style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', fontSize: '1.25rem', fontWeight: 800, borderRadius: '12px', background: '#f8fafc', border: '2px solid #f1f5f9' }}
                />
              </div>
            </div>
            <button 
              onClick={handleSaveBudget}
              disabled={isSaving}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Budget Goal'}
            </button>
          </div>
        </div>

        {/* Tracking Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence>
            {isExceeded && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  padding: '1.25rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid var(--error)', 
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  color: 'var(--error)'
                }}
              >
                <div style={{ padding: '0.5rem', background: 'var(--error)', color: 'white', borderRadius: '50%' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>Budget Exceeded!</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>You have spent ₹{(totalSpent - budget).toLocaleString()} more than your planned budget.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TOTAL SPENT</p>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ₹{totalSpent.toLocaleString()}
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}> / ₹{budget.toLocaleString()}</span>
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>REMAINING</p>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: isExceeded ? 'var(--error)' : 'var(--success)' }}>
                  ₹{remaining.toLocaleString()}
                </h4>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div style={{ width: '100%', height: '16px', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden', position: 'relative', marginBottom: '1.5rem' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ 
                  height: '100%', 
                  background: isExceeded ? 'var(--error)' : progress > 80 ? 'var(--warning)' : 'var(--primary-gradient)',
                  borderRadius: '20px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>STATUS</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isExceeded ? (
                    <><AlertTriangle size={18} color="var(--error)" /><span style={{ fontWeight: 800, color: 'var(--error)', fontSize: '0.9rem' }}>Over Budget</span></>
                  ) : progress > 80 ? (
                    <><AlertTriangle size={18} color="var(--warning)" /><span style={{ fontWeight: 800, color: 'var(--warning)', fontSize: '0.9rem' }}>Almost Full</span></>
                  ) : (
                    <><CheckCircle2 size={18} color="var(--success)" /><span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.9rem' }}>On Track</span></>
                  )}
                </div>
              </div>
              <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>USAGE</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--primary)" />
                  <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{progress.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;
