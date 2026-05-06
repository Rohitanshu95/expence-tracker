import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import SpendingChart from '../components/SpendingChart';
import TransactionTable from '../components/TransactionTable';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Filter, Download, Calendar } from 'lucide-react';
import api from '../utils/api';
import { useSearch } from '../context/SearchContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = () => {
  const { searchQuery } = useSearch();
  const [summary, setSummary] = useState({ totalBalance: 0, totalIncome: 0, totalExpense: 0, chartData: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [summaryRes, transRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions')
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting transaction', err);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Financial Overview</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Track your income, expenses and savings in real-time.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, background: 'white', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer' }}>
            <Calendar size={16} />
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </button>
          <button 
            onClick={exportToPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, background: '#2563eb', border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
          >
            <Download size={16} />
            Export Report
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>Cash Flow Analytics</h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Income vs Expenses visualization</p>
            </div>
            <select style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, borderRadius: '8px', color: '#64748b', cursor: 'pointer', outline: 'none' }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <SpendingChart data={summary.chartData} />
        </div>
        
        <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>Recent Activity</h3>
            <button style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ flex: 1 }}>
            <TransactionTable transactions={filteredTransactions} onDelete={handleDelete} compact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
