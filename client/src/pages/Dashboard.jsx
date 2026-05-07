import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import CategoryBreakdown from '../components/CategoryBreakdown';
import TransactionTable from '../components/TransactionTable';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Filter, Download, Calendar } from 'lucide-react';
import api from '../utils/api';
import { useSearch } from '../context/SearchContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';

const Dashboard = () => {
  const { searchQuery } = useSearch();
  const [summary, setSummary] = useState({ totalBalance: 0, totalIncome: 0, totalExpense: 0, chartData: [], categoryData: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text('ExpenseFlow Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${today}`, 14, 28);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 32, 196, 32);

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Financial Summary', 14, 45);

    const summaryData = [
      ['Total Balance', `INR ${summary.totalBalance.toLocaleString('en-IN')}`],
      ['Total Income', `INR ${summary.totalIncome.toLocaleString('en-IN')}`],
      ['Total Expenses', `INR ${summary.totalExpense.toLocaleString('en-IN')}`],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Amount']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // Transactions Table
    doc.setFontSize(16);
    doc.text('Recent Transactions', 14, doc.lastAutoTable.finalY + 15);

    const tableData = transactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.note || 'No description',
      tx.type.toUpperCase(),
      tx.module?.name || 'General',
      `INR ${tx.amount.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Description', 'Type', 'Category', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' }
      }
    });

    doc.save(`ExpenseFlow_Report_${today}.pdf`);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Financial Overview</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Track your income, expenses and savings in real-time.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
          <button 
            onClick={() => setShowPicker(!showPicker)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.6rem 1.25rem', 
              borderRadius: '10px', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              color: '#64748b', 
              cursor: 'pointer',
              boxShadow: showPicker ? '0 0 0 2px rgba(37, 99, 235, 0.1)' : 'none'
            }}
          >
            <Calendar size={16} />
            <span className="hide-mobile">
              {startDate && endDate ? (
                `${new Date(startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
              ) : startDate ? (
                `From ${new Date(startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
              ) : endDate ? (
                `Until ${new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`
              ) : (
                'All-Time'
              )}
            </span>
            <span className="show-mobile">Range</span>
          </button>

          {showPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                position: 'absolute', 
                top: '100%', 
                right: isMobile ? 'auto' : 0,
                left: isMobile ? '-50%' : 'auto',
                transform: isMobile ? 'translateX(25%)' : 'none',
                marginTop: '0.5rem', 
                background: 'white', 
                padding: '1.25rem', 
                borderRadius: '16px', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                zIndex: 100,
                width: isMobile ? 'calc(100vw - 2rem)' : '300px',
                maxWidth: '300px'
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
                    style={{ flex: 1, background: 'white', color: '#64748b', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setShowPicker(false)}
                    style={{ flex: 2, background: '#2563eb', color: 'white', padding: '0.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <button 
            onClick={exportToPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, background: '#2563eb', border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
          >
            <Download size={16} />
            <span className="hide-mobile">Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <SummaryCard title="Total Balance" amount={summary.totalBalance} type="balance" icon={Wallet} trend={12.5} />
        <SummaryCard title="Total Income" amount={summary.totalIncome} type="income" icon={TrendingUp} trend={8.2} />
        <SummaryCard title="Total Expenses" amount={summary.totalExpense} type="expense" icon={TrendingDown} trend={-3.1} />
        <SummaryCard title="Monthly Savings" amount={summary.totalBalance * 0.2} type="balance" icon={CreditCard} trend={14.8} />
      </div>

      {/* Analytics Section */}
      <div className="responsive-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: '24px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>Spending Analysis</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Top categories this month</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '10px' }}>
              <Filter size={18} color="#64748b" />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <CategoryBreakdown categories={summary.categoryData} totalExpense={summary.totalExpense} />
          </div>
        </div>
        
        <div style={{ padding: '1.5rem', borderRadius: '24px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>Recent Activity</h3>
            <button style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ flex: 1 }}>
            <TransactionTable transactions={filteredTransactions} onDelete={handleDelete} compact />
          </div>
        </div>
      </div>
      
      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Confirm Deletion"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        type="danger"
        confirmText="Yes, Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Dashboard;
