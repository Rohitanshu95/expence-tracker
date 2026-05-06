import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Wallet, PieChart, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../utils/api';

const StatCard = ({ title, amount, change, trend, icon: Icon }) => (
  <div className="glass-panel p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border text-text-muted group-hover:text-primary transition-colors">
        <Icon size={24} />
      </div>
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
          trend === 'up' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
        )}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}%
        </div>
      )}
    </div>
    <div>
      <p className="text-text-muted text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold">₹{amount.toLocaleString()}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = transactions.reduce((acc, curr) => {
    if (curr.type === 'income') acc.income += curr.amount;
    else acc.expenses += curr.amount;
    return acc;
  }, { income: 0, expenses: 0 });

  const totalBalance = stats.income - stats.expenses;
  const totalSavings = stats.income > 0 ? ((stats.income - stats.expenses) / stats.income * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Overview</h1>
          <p className="text-text-muted">Real-time tracking of your income and spending.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <TrendingUp size={20} />
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance" amount={totalBalance} icon={DollarSign} />
        <StatCard title="Monthly Income" amount={stats.income} icon={ArrowUpRight} trend="up" />
        <StatCard title="Monthly Expenses" amount={stats.expenses} icon={ArrowDownRight} trend="down" />
        <StatCard title="Savings Rate" amount={Number(totalSavings)} icon={Wallet} trend={Number(totalSavings) > 0 ? 'up' : 'down'} change={totalSavings} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-8 h-[400px] flex items-center justify-center border-dashed border-2 border-border">
          <div className="text-center">
            <PieChart className="text-text-muted mx-auto mb-4" size={48} />
            <p className="text-text-muted font-medium">Expense Analytics Chart</p>
            <p className="text-xs text-text-muted mt-1 italic">Visual data coming in next update</p>
          </div>
        </div>
        
        <div className="glass-panel p-8 flex flex-col h-[400px]">
          <h4 className="text-lg font-bold mb-6">Recent Transactions</h4>
          <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <Wallet className="mb-2" size={32} />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              transactions.slice(0, 6).map(transaction => (
                <div key={transaction._id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-background rounded-lg border border-border flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">{transaction.description}</p>
                      <p className="text-xs text-text-muted">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={cn(
                    "font-bold whitespace-nowrap",
                    transaction.type === 'expense' ? "text-danger" : "text-success"
                  )}>
                    {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
