import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, PieChart as PieIcon, Activity, ArrowUpRight, ArrowDownRight, MessageSquare } from 'lucide-react';
import api from '../utils/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

const Analytics = () => {
  const [data, setData] = useState({ transactions: [], summary: {} });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, summaryRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/summary')
      ]);
      setData({ transactions: transRes.data, summary: summaryRes.data });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics data', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare Pie Chart Data (Expenses by Category)
  const categoryData = useMemo(() => {
    const categories = {};
    data.transactions.filter(t => t.type === 'expense').forEach(t => {
      const name = t.module?.name || 'Other';
      categories[name] = (categories[name] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [data.transactions]);

  // Insights Logic (Chat-style summary)
  const insights = useMemo(() => {
    if (data.transactions.length === 0) return ["Start adding transactions to see insights!"];
    const income = data.summary.totalIncome || 0;
    const expense = data.summary.totalExpense || 0;
    const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;
    
    const list = [
      `Your current savings rate is ${savingsRate}% for this period.`,
      expense > income ? "Warning: Your expenses have exceeded your income." : "Great job! You are maintaining a positive cash flow.",
    ];
    
    if (categoryData.length > 0) {
      const topCat = categoryData.sort((a,b) => b.value - a.value)[0];
      list.push(`Your highest spending category is ${topCat.name} (₹${topCat.value.toLocaleString()}).`);
    }
    
    return list;
  }, [data.summary, categoryData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Financial Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Visual breakdown of your financial habits and trends.</p>
      </div>

      {/* Top Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Activity size={20} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>+12%</span>
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>SAVINGS RATE</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{((data.summary.totalIncome - data.summary.totalExpense) / data.summary.totalIncome * 100 || 0).toFixed(1)}%</h3>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', marginBottom: '0.5rem' }}>
            <ArrowUpRight size={20} />
            <TrendingUp size={20} />
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVG DAILY INCOME</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{(data.summary.totalIncome / 30 || 0).toFixed(0)}</h3>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--error)', marginBottom: '0.5rem' }}>
            <ArrowDownRight size={20} />
            <TrendingDown size={20} />
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVG DAILY SPEND</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{(data.summary.totalExpense / 30 || 0).toFixed(0)}</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Cash Flow Bar Chart */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '20px', background: 'white' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--primary)" />
            Income vs Expenses
          </h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={data.summary.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: 'var(--shadow)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '20px', background: 'white' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={20} color="var(--primary)" />
            Expense Split
          </h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {categoryData.map((item, index) => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat-style Insights */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '20px', background: 'white' }}>
        <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="var(--primary)" />
          Smart Financial Insights
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {insights.map((insight, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                padding: '1.25rem', 
                background: '#f8fafc', 
                borderRadius: '16px', 
                border: '1px solid #f1f5f9',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}
            >
              <div style={{ padding: '0.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: 'var(--primary)' }}>
                <Activity size={18} />
              </div>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{insight}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
