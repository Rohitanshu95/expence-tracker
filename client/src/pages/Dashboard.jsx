import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import SpendingChart from '../components/SpendingChart';
import TransactionTable from '../components/TransactionTable';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Filter } from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
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
      setTransactions(transRes.data.slice(0, 5)); // Recent 5
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title & Filter Section (Simplified as Header is now in Layout) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Overview</h2>
        <button className="glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Summary Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <SummaryCard title="Total Balance" amount={summary.totalBalance} type="balance" icon={Wallet} trend={12} />
        <SummaryCard title="Total Income" amount={summary.totalIncome} type="income" icon={TrendingUp} trend={8} />
        <SummaryCard title="Total Expenses" amount={summary.totalExpense} type="expense" icon={TrendingDown} trend={-5} />
        <SummaryCard title="Monthly Savings" amount={summary.totalBalance * 0.2} type="balance" icon={CreditCard} trend={15} />
      </div>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Cash Flow Analytics</h3>
            <select style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: 'none', background: '#f8fafc', fontWeight: 600, borderRadius: '8px' }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <SpendingChart data={summary.chartData} />
        </div>
        
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'white' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Recent Activity</h3>
          <TransactionTable transactions={transactions} onDelete={fetchData} compact />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
