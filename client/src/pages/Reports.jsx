import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Filter, Calendar, Lock, ShieldCheck, 
  ArrowLeft, Search, CheckCircle2, AlertCircle, X, IndianRupee
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import TransactionTable from '../components/TransactionTable';
import api from '../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useSearch } from '../context/SearchContext';

const Reports = () => {
  const { searchQuery } = useSearch();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('monthly');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadStep, setDownloadStep] = useState(1); // 1: Date Range, 2: Password
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchData(); // Refresh list after delete
      } catch (err) {
        console.error('Error deleting transaction', err);
        alert('Failed to delete transaction');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      // Period filter
      let matchesPeriod = true;
      if (filterPeriod === 'daily') matchesPeriod = txDate >= today;
      else if (filterPeriod === 'weekly') {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        matchesPeriod = txDate >= lastWeek;
      }
      else if (filterPeriod === 'monthly') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesPeriod = txDate >= firstDayOfMonth;
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
  }, [transactions, filterPeriod, searchQuery]);

  const handleDownloadInit = () => {
    setIsDownloadModalOpen(true);
    setDownloadStep(1);
    setPassword('');
  };

  const handleVerifyAndPassword = async () => {
    try {
      setVerifying(true);
      // We'll call a special check endpoint or just verify via the login logic
      // For now, we simulate password check with a dedicated auth call or re-verify
      await api.post('/auth/verify-password', { password });
      
      // If success, trigger download
      generatePDF();
      setIsDownloadModalOpen(false);
      setVerifying(false);
    } catch (err) {
      alert('Invalid password. Verification failed.');
      setVerifying(false);
    }
  };

  const generatePDF = () => {
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    
    const exportData = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d >= start && d <= end;
    });

    if (exportData.length === 0) {
      alert('No transactions found for the selected date range.');
      return;
    }

    const doc = new jsPDF();

    // Premium Branded Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ExpenseFlow', 15, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Financial Statement Report', 15, 32);
    
    const dateStr = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    doc.text(`Period: ${dateStr}`, 140, 25);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 140, 32);

    // Summary Totals
    const totalIncome = exportData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = exportData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`Total Income: Rs. ${totalIncome.toLocaleString()}`, 15, 55);
    doc.text(`Total Expenses: Rs. ${totalExpense.toLocaleString()}`, 15, 62);
    doc.text(`Net Balance: Rs. ${(totalIncome - totalExpense).toLocaleString()}`, 15, 69);

    // Table Data
    const tableColumn = ["Date", "Type", "Category", "Note", "Amount"];
    const tableRows = exportData.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.type.toUpperCase(),
      tx.module?.name || 'Other',
      tx.note || '-',
      `Rs. ${tx.amount.toLocaleString()}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' }, // indigo-500
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 15, right: 15 }
    });

    doc.save(`ExpenseFlow_Report_${start.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Transaction Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generate and export detailed financial statements.</p>
        </div>
        <button 
          onClick={handleDownloadInit}
          className="btn-primary" 
          style={{ padding: '0.85rem 1.5rem' }}
        >
          <Download size={20} />
          Download Report
        </button>
      </div>

      {/* Main Report Section */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.6rem', background: '#f1f5f9', borderRadius: '12px', color: 'var(--primary)' }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontWeight: 800 }}>Record Summary</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem', borderRadius: '12px' }}>
            {['daily', 'weekly', 'monthly', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  background: filterPeriod === p ? 'white' : 'transparent',
                  color: filterPeriod === p ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: filterPeriod === p ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>Loading report data...</div>
        ) : (
          <TransactionTable transactions={filteredTransactions} onDelete={handleDelete} />
        )}
      </div>

      {/* Secure Download Modal */}
      <AnimatePresence>
        {isDownloadModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDownloadModalOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.6)', backdropFilter: 'blur(8px)' }} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', borderRadius: '24px', background: 'white', position: 'relative' }}>
              <button onClick={() => setIsDownloadModalOpen(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: 'var(--text-muted)' }}><X size={24} /></button>

                <>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '60px', height: '60px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary)' }}>
                      <Calendar size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Select Date Range</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose the start and end dates for your report.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>START DATE</label>
                        <DatePicker 
                          selected={dateRange.start} 
                          onChange={(date) => setDateRange({ ...dateRange, start: date })}
                          className="premium-datepicker"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>END DATE</label>
                        <DatePicker 
                          selected={dateRange.end} 
                          onChange={(date) => setDateRange({ ...dateRange, end: date })}
                          className="premium-datepicker"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      generatePDF();
                      setIsDownloadModalOpen(false);
                    }} 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
                  >
                    <ShieldCheck size={20} />
                    Download PDF Report
                  </button>
                </>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
