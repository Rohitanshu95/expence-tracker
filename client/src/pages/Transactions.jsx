import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import TransactionTable from '../components/TransactionTable';
import AddTransactionModal from '../components/AddTransactionModal';
import { Plus, Search, ArrowLeft, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/transactions/${deleteModal.id}`);
      fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction', err);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) return false;
    // Search filter
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return (
      tx.note?.toLowerCase().includes(query) ||
      tx.module?.name?.toLowerCase().includes(query) ||
      tx.amount.toString().includes(query)
    );
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginTop: isMobile ? '1rem' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              padding: '0.55rem', 
              borderRadius: '12px', 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.3rem' : '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>
              All Transactions
            </h1>
            {!isMobile && <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.15rem' }}>View and manage your full financial history</p>}
          </div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            background: '#2563eb', 
            color: 'white', 
            padding: isMobile ? '0.6rem 0.9rem' : '0.7rem 1.25rem', 
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: isMobile ? '0.8rem' : '0.85rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}
        >
          <Plus size={18} />
          {!isMobile && 'Add New'}
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ 
          background: 'white', 
          padding: isMobile ? '1rem' : '1.25rem', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0' 
        }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Income</p>
          <p style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 800, color: '#10b981' }}>
            +₹{totalIncome.toLocaleString('en-IN')}
          </p>
        </div>
        <div style={{ 
          background: 'white', 
          padding: isMobile ? '1rem' : '1.25rem', 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0' 
        }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Expense</p>
          <p style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 800, color: '#ef4444' }}>
            -₹{totalExpense.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.7rem 0.85rem 0.7rem 2.5rem', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              background: '#f8fafc',
              fontSize: '0.85rem',
              fontWeight: 500,
              outline: 'none'
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '0.7rem 2rem 0.7rem 0.85rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#1e293b',
              cursor: 'pointer',
              appearance: 'none',
              outline: 'none'
            }}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <ChevronDown 
            size={14} 
            style={{ 
              position: 'absolute', 
              right: '0.6rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              pointerEvents: 'none',
              color: '#94a3b8'
            }} 
          />
        </div>
      </div>

      {/* Count */}
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
        {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
      </p>

      {/* Transactions List */}
      <div style={{ 
        background: 'white', 
        borderRadius: '20px', 
        border: '1px solid #e2e8f0',
        padding: isMobile ? '0.75rem' : '1.5rem',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
            <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>No transactions found</p>
            <p style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '0.25rem' }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <TransactionTable 
            transactions={filteredTransactions} 
            onDelete={handleDelete} 
            compact={isMobile}
          />
        )}
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchTransactions}
      />

      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Confirm Deletion"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        type="danger"
        confirmText="Yes, Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Transactions;
