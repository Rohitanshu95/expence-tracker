import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import TransactionTable from '../components/TransactionTable';
import AddTransactionModal from '../components/AddTransactionModal';
import { Plus, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data);
      setFilteredTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter(tx => 
      (tx.note?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.module?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Transactions</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>View and manage your full financial history</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '0.75rem 1.25rem', 
            borderRadius: 'var(--radius)',
            fontWeight: 600,
            boxShadow: 'var(--shadow)'
          }}
        >
          <Plus size={20} />
          Add Transaction
        </motion.button>
      </header>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.75rem', background: 'var(--bg-card)' }}
          />
        </div>
        <button className="glass" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.75rem 1.25rem', 
          borderRadius: 'var(--radius)',
          fontWeight: 500,
          color: 'var(--text-main)'
        }}>
          <Filter size={18} />
          Filters
        </button>
      </div>

      <TransactionTable transactions={filteredTransactions} onDelete={handleDelete} />

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchTransactions}
      />
    </div>
  );
};

export default Transactions;
