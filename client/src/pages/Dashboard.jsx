import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import CategoryBreakdown from '../components/CategoryBreakdown';
import TransactionTable from '../components/TransactionTable';
import { Wallet, TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';
import api from '../utils/api';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';

const Dashboard = () => {
  const { user } = useAuth();
  const { searchQuery } = useSearch();
  const [summary, setSummary] = useState({ totalBalance: 0, totalIncome: 0, totalExpense: 0, chartData: [], categoryData: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, transRes] = await Promise.all([
        api.get('/transactions/summary', { params: { startDate, endDate } }),
        api.get('/transactions', { params: { startDate, endDate } })
      ]);
      setSummary(summaryRes.data);
      setTransactions(transRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/transactions/${deleteModal.id}`);
      fetchData();
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      console.error('Error deleting transaction', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tx.note?.toLowerCase().includes(query) ||
      tx.module?.name?.toLowerCase().includes(query) ||
      tx.amount.toString().includes(query)
    );
  }).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0 2rem 0' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.1rem' }}>
            {getGreeting()}, {user?.username?.split(' ')[0] || 'User'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Here's your financial summary.</p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowPicker(!showPicker)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '0.5rem', 
              padding: '0.6rem 1rem', 
              borderRadius: '12px', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              color: '#1e293b', 
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <Calendar size={16} />
            <span>Range</span>
          </button>

          {showPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                position: 'absolute', 
                top: '100%', 
                right: 0,
                marginTop: '0.5rem', 
                background: 'white', 
                padding: '1.25rem', 
                borderRadius: '16px', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                zIndex: 100,
                minWidth: '220px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>From</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>To</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setShowPicker(false);
                    }}
                    style={{ flex: 1, background: 'white', color: '#64748b', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setShowPicker(false)}
                    style={{ flex: 1, background: '#2563eb', color: 'white', padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <SummaryCard title="Total Balance" amount={summary.totalBalance} type="balance" icon={Wallet} trend={12.5} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <SummaryCard title="Income" amount={summary.totalIncome} type="income" icon={TrendingUp} trend={8.2} />
          <SummaryCard title="Expenses" amount={summary.totalExpense} type="expense" icon={TrendingDown} trend={-3.1} />
        </div>
      </div>

      {/* Analytics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>Spending Breakup</h3>
            <Filter size={16} color="#64748b" />
          </div>
          <CategoryBreakdown categories={summary.categoryData} totalExpense={summary.totalExpense} />
        </div>
        
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>Recent Logs</h3>
            <button style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: 'none', border: 'none' }}>All</button>
          </div>
          <TransactionTable transactions={filteredTransactions} onDelete={handleDelete} compact />
        </div>
      </div>
      
      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Confirm Deletion"
        message="Are you sure you want to delete this transaction?"
        type="danger"
        confirmText="Yes, Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Dashboard;
