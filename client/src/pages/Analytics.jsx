import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, PieChart as PieIcon, Activity, ArrowUpRight, ArrowDownRight, MessageSquare, Sparkles } from 'lucide-react';
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

  const categoryData = useMemo(() => {
    const categories = {};
    data.transactions.filter(t => t.type === 'expense').forEach(t => {
      const name = t.module?.name || 'Other';
      categories[name] = (categories[name] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [data.transactions]);

  const insights = useMemo(() => {
    if (data.transactions.length === 0) return ["Start adding transactions to see insights!"];
    const income = data.summary.totalIncome || 0;
    const expense = data.summary.totalExpense || 0;
    const savingsRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;
    
    const list = [
      `Savings rate is at ${savingsRate}% currently.`,
      expense > income ? "Expenses are higher than income." : "You're keeping a healthy positive cash flow.",
    ];
    
    if (categoryData.length > 0) {
      const topCat = categoryData.sort((a,b) => b.value - a.value)[0];
      list.push(`Top spending: ${topCat.name} (₹${topCat.value.toLocaleString()}).`);
    }
    
    return list;
  }, [data.summary, categoryData]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Calculating insights...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Financial Analytics</h1>
        <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Visual insights into your spending habits.</p>
      </div>

      {/* Metrics Row - Horizontal Scroll or Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div className="premium-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Savings</p>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb' }}>
            {((data.summary.totalIncome - data.summary.totalExpense) / data.summary.totalIncome * 100 || 0).toFixed(0)}%
          </h3>
        </div>
        <div className="premium-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Daily In</p>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>₹{(data.summary.totalIncome / 30 || 0).toFixed(0)}</h3>
        </div>
        <div className="premium-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Daily Out</p>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444' }}>₹{(data.summary.totalExpense / 30 || 0).toFixed(0)}</h3>
        </div>
      </div>

      {/* Main Charts Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Cash Flow Bar Chart */}
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Activity size={20} color="#2563eb" />
            <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>Cash Flow Trend</h3>
          </div>
          <div style={{ width: '100%', height: 280, margin: '0 -10px' }}>
            <ResponsiveContainer>
              <BarChart data={data.summary.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.8rem' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="expense" fill="#2563eb" radius={[3, 3, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Income</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2563eb' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Expense</span>
            </div>
          </div>
        </div>

        {/* Category Split */}
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <PieIcon size={20} color="#2563eb" />
            <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>Expense Categories</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '130px', height: 130 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categoryData.slice(0, 4).map((item, index) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Insights */}
        <div className="premium-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Sparkles size={20} color="#2563eb" />
            <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>Smart Insights</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {insights.map((insight, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ 
                  padding: '1rem', 
                  background: '#f8fafc', 
                  borderRadius: '16px', 
                  border: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center'
                }}
              >
                <div style={{ padding: '0.4rem', background: 'white', borderRadius: '10px', color: '#2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <Activity size={16} />
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
