import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, Filter, Download, ArrowLeft, IndianRupee, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransactionTable from '../components/TransactionTable';
import api from '../utils/api';
import { useSearch } from '../context/SearchContext';
import Modal from '../components/Modal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const FinanceView = ({ type }) => {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('monthly'); // daily, weekly, monthly, all, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setAllTransactions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/transactions/${deleteModal.id}`);
      fetchData(); // Refresh list after delete
    } catch (err) {
      console.error('Error deleting transaction', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const totals = useMemo(() => {
    const income = allTransactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
    const expense = allTransactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);
    return { income, expense };
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // First filter by type
    const byType = allTransactions.filter(tx => tx.type === type);

    return byType.filter(tx => {
      const txDate = new Date(tx.date);
      txDate.setHours(0, 0, 0, 0);
      
      // Period filter
      let matchesPeriod = true;
      if (filterPeriod === 'daily') matchesPeriod = txDate.getTime() === today.getTime();
      else if (filterPeriod === 'weekly') {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        matchesPeriod = txDate >= lastWeek;
      }
      else if (filterPeriod === 'monthly') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesPeriod = txDate >= firstDayOfMonth;
      }
      else if (filterPeriod === 'custom') {
        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesPeriod = txDate >= start && txDate <= end;
        } else if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesPeriod = txDate >= start;
        } else if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesPeriod = txDate <= end;
        }
      }

      if (!matchesPeriod) return false;

      // Search filter
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        tx.note?.toLowerCase().includes(query) ||
        tx.module?.name?.toLowerCase().includes(query) ||
        tx.amount.toString().includes(query)
      );
    });
  }, [allTransactions, type, filterPeriod, startDate, endDate, searchQuery]);

  const filteredTotal = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  }, [filteredTransactions]);

  const periodLabel = {
    daily: "Today's",
    weekly: "This Week's",
    monthly: "This Month's",
    all: "Total",
    custom: "Range"
  }[filterPeriod];

  const exportToPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-IN');
    const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Report`;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(type === 'income' ? 16 : 239, type === 'income' ? 185 : 68, type === 'income' ? 129 : 68); 
    doc.text(`ExpenseFlow ${title}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, 28);
    doc.text(`Period: ${periodLabel}${startDate && endDate ? ` (${startDate} to ${endDate})` : ''}`, 14, 34);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 38, 196, 38);

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Financial Summary', 14, 50);

    const summaryData = [
      [`Total ${type.charAt(0).toUpperCase() + type.slice(1)}`, `INR ${filteredTotal.toLocaleString('en-IN')}`],
      ['Transaction Count', filteredTransactions.length.toString()],
    ];

    autoTable(doc, {
      startY: 55,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { 
        fillColor: type === 'income' ? [16, 185, 129] : [239, 68, 68], 
        textColor: [255, 255, 255] 
      },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // Transactions Table
    doc.setFontSize(16);
    doc.text('Detailed History', 14, doc.lastAutoTable.finalY + 15);

    const tableData = filteredTransactions.map(tx => [
      new Date(tx.date).toLocaleDateString('en-IN'),
      tx.note || 'No description',
      tx.module?.name || 'General',
      `INR ${tx.amount.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: type === 'income' ? [16, 185, 129] : [239, 68, 68], 
        textColor: [255, 255, 255] 
      },
      styles: { fontSize: 9 },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' }
      }
    });

    doc.save(`ExpenseFlow_${type}_${today}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.25rem' : '1.5rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: isMobile ? '0 0.25rem' : '0',
        marginTop: isMobile ? '1.5rem' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1rem' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              padding: '0.6rem', 
              borderRadius: '12px', 
              background: 'white', 
              border: '1px solid var(--border)', 
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={isMobile ? 18 : 20} />
          </button>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.75rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'capitalize', lineHeight: 1.1 }}>
              {type} Tracking
            </h1>
            {!isMobile && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Detailed history for your {type}.</p>}
          </div>
        </div>
        <div>
          <button 
            onClick={exportToPDF}
            className="glass" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: isMobile ? '0.6rem 0.85rem' : '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <Download size={isMobile ? 16 : 18} />
            <span className="hide-mobile">Export</span>
          </button>
        </div>
      </div>

      {/* Category Summary Card (All-Time) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ 
          padding: isMobile ? '1.75rem' : '2.5rem', 
          borderRadius: 'var(--radius-xl)', 
          background: type === 'income' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          boxShadow: type === 'income' ? '0 20px 40px -12px rgba(16, 185, 129, 0.4)' : '0 20px 40px -12px rgba(239, 68, 68, 0.4)'
        }}
      >

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: isMobile ? '0.85rem' : '1.1rem', fontWeight: 600, opacity: 0.9, marginBottom: '0.25rem' }}>Total {type === 'income' ? 'Income' : 'Expense'} (All-Time)</p>
            <h2 style={{ fontSize: isMobile ? '2.5rem' : '3.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              ₹{(type === 'income' ? totals.income : totals.expense).toLocaleString('en-IN')}
            </h2>
          </div>
          <div style={{ padding: isMobile ? '0.75rem' : '1.25rem', background: 'rgba(255,255,255,0.2)', borderRadius: '18px' }}>
            {type === 'income' ? <TrendingUp size={isMobile ? 32 : 48} /> : <TrendingDown size={isMobile ? 32 : 48} />}
          </div>
        </div>
      </motion.div>

      {/* Stats and Filter Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        gap: '1rem',
      }}>
        <div className="glass" style={{ background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Filtered {periodLabel}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: type === 'income' ? '#10b981' : '#ef4444' }}>₹{filteredTotal.toLocaleString('en-IN')}</p>
          </div>
          <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '12px' }}>
            <Calendar size={20} color="#64748b" />
          </div>
        </div>

        <div className="glass" style={{ background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{type === 'income' ? 'Total Expense' : 'Total Income'}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: type === 'income' ? '#ef4444' : '#10b981' }}>₹{(type === 'income' ? totals.expense : totals.income).toLocaleString('en-IN')}</p>
          </div>
          <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '12px' }}>
            {type === 'income' ? <TrendingDown size={20} color="#ef4444" /> : <TrendingUp size={20} color="#10b981" />}
          </div>
        </div>
      </div>

      {/* Filter & History Section */}
      <div className="glass" style={{ padding: isMobile ? '1rem' : '2rem', borderRadius: 'var(--radius-lg)', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '1rem' : '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: isMobile ? '1rem' : '1.25rem' }}>{type === 'income' ? 'Income' : 'Expense'} History</h3>
          
          <div style={{ position: 'relative' }}>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              style={{
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: 'var(--primary)',
                cursor: 'pointer',
                appearance: 'none',
                outline: 'none',
              }}
            >
              {['daily', 'weekly', 'monthly', 'all', 'custom'].map((p) => (
                <option key={p} value={p}>{p === 'custom' ? 'Custom Range' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <ChevronDown 
              size={12} 
              style={{ 
                position: 'absolute', 
                right: '0.6rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                pointerEvents: 'none',
                color: 'var(--text-muted)'
              }} 
            />
          </div>
        </div>

        {filterPeriod === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1.5rem', 
              flexWrap: 'wrap',
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setFilterPeriod('all');
                }}
                style={{ 
                  padding: '0.55rem 1rem', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  background: 'white', 
                  color: '#ef4444', 
                  fontSize: '0.75rem', 
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Clear Filter
              </button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading records...</div>
        ) : (
          <TransactionTable 
            transactions={filteredTransactions} 
            onDelete={handleDelete} 
            compact={isMobile}
          />
        )}
      </div>

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

export default FinanceView;
